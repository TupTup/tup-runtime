import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import { point, lineString } from "@turf/helpers";
import { defineCustomElement } from "./define-custom-element.js";

const MAP_STYLE = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors, © CARTO",
      maxzoom: 20,
    },
  },
  layers: [{ id: "carto-tiles", type: "raster", source: "carto" }],
};

class TupMap extends HTMLElement {

  static observedAttributes = ["src", "feature"];

  #map = null;
  #container = null;
  #data = null;

  connectedCallback() {
    if (!this.#map) {
      this.#init();
    }
  }

  disconnectedCallback() {
    this.#map?.remove();
    this.#map = null;
    this.#container = null;
    this.#data = null;
  }

  attributeChangedCallback() {
    if (this.#map) {
      this.#loadIntoMap(this.#map, { animate: false });
    }
  }

  #isEditMode() {
    return document.documentElement.dataset.mode === "edit";
  }

  #init() {
    this.#container = document.createElement("div");
    this.#container.className = "tup-map-container";
    this.appendChild(this.#container);

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "tup-map-trigger";
    trigger.setAttribute("aria-label", "Powiększ mapę");
    this.#container.appendChild(trigger);
    trigger.addEventListener("click", () => this.#openLightbox());

    this.#map = new maplibregl.Map({
      container: this.#container,
      style: MAP_STYLE,
      attributionControl: false,
      interactive: false,
    });

    this.#map.once("load", () => this.#loadIntoMap(this.#map, { animate: false, iconSize: 0.7 }));
  }

  #updatePickupCoords(lng, lat) {
    if (!this.#data) return;

    const updated = {
      ...this.#data,
      features: this.#data.features.map((f) =>
        f.properties?.featureType === "pickup"
          ? { ...f, geometry: { type: "Point", coordinates: [lng, lat] } }
          : f
      ),
    };

    this.#data = updated;
    this.#map.getSource("data")?.setData(updated);

    this.dispatchEvent(new CustomEvent("tup-map-pickup-change", {
      bubbles: true,
      composed: true,
      detail: { lng, lat },
    }));
  }

  #openLightbox() {
    const editMode = this.#isEditMode();

    const dialog = document.createElement("dialog");
    dialog.className = "tup-map-lightbox";
    dialog.setAttribute("aria-label", "Mapa miejsca");

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "hero-lightbox-close";
    closeBtn.setAttribute("aria-label", "Zamknij");
    closeBtn.innerHTML = "&times;";

    const mapBody = document.createElement("div");
    mapBody.className = "tup-map-lightbox-body";

    if (editMode) {
      const pin = document.createElement("div");
      pin.className = "tup-map-edit-pin";
      pin.setAttribute("aria-hidden", "true");
      mapBody.appendChild(pin);

      const hint = document.createElement("div");
      hint.className = "tup-map-edit-hint";
      hint.textContent = "Przesuń mapę, aby ustawić pozycję";
      mapBody.appendChild(hint);
    }

    dialog.append(closeBtn, mapBody);
    document.body.appendChild(dialog);
    dialog.showModal();

    const lightboxMap = new maplibregl.Map({
      container: mapBody,
      style: MAP_STYLE,
      attributionControl: { compact: true },
      interactive: true,
    });

    lightboxMap.addControl(new maplibregl.NavigationControl(), "top-right");
    lightboxMap.once("load", () => {
      const padding = Math.round(Math.min(mapBody.offsetWidth, mapBody.offsetHeight) * 0.25);
      this.#loadIntoMap(lightboxMap, { animate: false, editPicker: editMode, iconSize: 1.2, padding });
    });

    if (editMode) {
      let snapping = false;

      lightboxMap.on("movestart", () => {
        if (!snapping) mapBody.classList.add("is-dragging");
      });

      lightboxMap.on("moveend", () => {
        mapBody.classList.remove("is-dragging");

        if (snapping) {
          snapping = false;
          return;
        }

        const { lng, lat } = lightboxMap.getCenter();
        const [clampedLng, clampedLat] = this.#clampToBuilding(lng, lat);

        const moved =
          Math.abs(clampedLng - lng) > 1e-8 ||
          Math.abs(clampedLat - lat) > 1e-8;

        if (moved) {
          snapping = true;
          lightboxMap.easeTo({ center: [clampedLng, clampedLat], duration: 200 });
        }

        this.#updatePickupCoords(clampedLng, clampedLat);
      });
    }
    const close = () => {
      dialog.close();
      lightboxMap.remove();
      dialog.remove();
    };

    closeBtn.addEventListener("click", close);

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) close();
    });
  }

  async #loadIntoMap(map, { animate = true, editPicker = false, iconSize = 1.0, padding = 40 } = {}) {
    const src = this.getAttribute("src");

    if (!src || !map) {
      return;
    }

    let geojson;

    try {
      const res = await fetch(src);
      geojson = await res.json();
    } catch {
      return;
    }

    const feature = this.getAttribute("feature");
    const data = feature
      ? {
          ...geojson,
          features: geojson.features?.filter(
            (f) => f.properties?.featureType === feature
          ) ?? [],
        }
      : geojson;

    this.#data = data;

    const existing = map.getSource("data");

    if (existing) {
      existing.setData(data);
    } else {
      map.addSource("data", { type: "geojson", data });
      await this.#addLayersTo(map, { editPicker, iconSize });
    }

    const bounds = this.#computeBounds(data);

    if (bounds) {
      map.fitBounds(bounds, { padding, maxZoom: 17, animate });
    }
  }

  async #addLayersTo(map, { editPicker = false, iconSize = 1.0 } = {}) {
    const notParking = ["!=", ["get", "featureType"], "parking"];

    map.addLayer({
      id: "polygons-fill",
      type: "fill",
      source: "data",
      filter: ["all", ["==", ["geometry-type"], "Polygon"], notParking],
      paint: { "fill-color": "#3b82f6", "fill-opacity": 0.2 },
    });

    map.addLayer({
      id: "polygons-line",
      type: "line",
      source: "data",
      filter: ["all", ["==", ["geometry-type"], "Polygon"], notParking],
      paint: { "line-color": "#3b82f6", "line-width": 1.5, "line-opacity": 0.7 },
    });

    map.addLayer({
      id: "lines",
      type: "line",
      source: "data",
      filter: ["==", ["geometry-type"], "LineString"],
      paint: { "line-color": "#3b82f6", "line-width": 3 },
    });

    this.#loadPinIcon(map);

    if (!editPicker) {
      map.addLayer({
        id: "pickup-pins",
        type: "symbol",
        source: "data",
        filter: ["==", ["get", "featureType"], "pickup"],
        layout: {
          "icon-image": "pickup-pin",
          "icon-anchor": "bottom",
          "icon-allow-overlap": true,
          "icon-ignore-placement": true,
          "icon-size": iconSize,
        },
      });
    }
  }

  #loadPinIcon(map) {
    if (map.hasImage("pickup-pin")) return;

    const S = 2;
    const W = 28, H = 38;
    const canvas = document.createElement("canvas");
    canvas.width = W * S;
    canvas.height = H * S;
    const ctx = canvas.getContext("2d");
    ctx.scale(S, S);

    const cx = W / 2;
    const r = W / 2 - 2;
    const tipY = H - 2;

    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.bezierCurveTo(cx - r * 1.1, r * 1.8, cx - r, r, cx - r, r);
    ctx.arc(cx, r, r, Math.PI, 0);
    ctx.bezierCurveTo(cx + r, r, cx + r * 1.1, r * 1.8, cx, tipY);
    ctx.closePath();
    ctx.fillStyle = "#3b82f6";
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, r, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();

    map.addImage("pickup-pin", ctx.getImageData(0, 0, W * S, H * S), { pixelRatio: S });
  }

  #clampToBuilding(lng, lat) {
    const building = this.#data?.features?.find(
      (f) => f.properties?.featureType === "building"
    );

    if (!building) return [lng, lat];

    const pt = point([lng, lat]);

    if (booleanPointInPolygon(pt, building)) return [lng, lat];

    const ring = building.geometry.coordinates[0];
    const nearest = nearestPointOnLine(lineString(ring), pt);

    return nearest.geometry.coordinates;
  }

  #computeBounds(geojson) {
    const coords = [];
    for (const f of geojson.features ?? []) {
      this.#collectCoords(f.geometry, coords);
    }
    if (coords.length === 0) return null;
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);
    return [
      [Math.min(...lngs), Math.min(...lats)],
      [Math.max(...lngs), Math.max(...lats)],
    ];
  }

  #collectCoords(geometry, out) {
    if (!geometry) return;
    switch (geometry.type) {
      case "Point":
        out.push(geometry.coordinates);
        break;
      case "LineString":
      case "MultiPoint":
        out.push(...geometry.coordinates);
        break;
      case "Polygon":
      case "MultiLineString":
        for (const ring of geometry.coordinates) out.push(...ring);
        break;
      case "MultiPolygon":
        for (const poly of geometry.coordinates)
          for (const ring of poly) out.push(...ring);
        break;
      case "GeometryCollection":
        for (const g of geometry.geometries) this.#collectCoords(g, out);
        break;
    }
  }
}

defineCustomElement("tup-map", TupMap);
