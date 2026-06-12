import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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

  connectedCallback() {
    if (!this.#map) {
      this.#init();
    }
  }

  disconnectedCallback() {
    this.#map?.remove();
    this.#map = null;
    this.#container = null;
  }

  attributeChangedCallback() {
    if (this.#map) {
      this.#loadIntoMap(this.#map, { animate: false });
    }
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

    this.#map = new maplibregl.Map({
      container: this.#container,
      style: MAP_STYLE,
      attributionControl: false,
      interactive: false,
    });

    this.#map.once("load", () => this.#loadIntoMap(this.#map, { animate: false }));

    trigger.addEventListener("click", () => this.#openLightbox());
  }

  #openLightbox() {
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
    lightboxMap.once("load", () => this.#loadIntoMap(lightboxMap, { animate: false }));

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

  async #loadIntoMap(map, { animate = true } = {}) {
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
            (f) => f.properties?.feature === feature
          ) ?? [],
        }
      : geojson;

    const existing = map.getSource("data");

    if (existing) {
      existing.setData(data);
    } else {
      map.addSource("data", { type: "geojson", data });
      this.#addLayersTo(map);
    }

    const bounds = this.#computeBounds(data);

    if (bounds) {
      map.fitBounds(bounds, { padding: 40, maxZoom: 17, animate });
    }
  }

  #addLayersTo(map) {
    map.addLayer({
      id: "polygons-fill",
      type: "fill",
      source: "data",
      filter: ["==", "$type", "Polygon"],
      paint: { "fill-color": "#3b82f6", "fill-opacity": 0.15 },
    });

    map.addLayer({
      id: "polygons-line",
      type: "line",
      source: "data",
      filter: ["==", "$type", "Polygon"],
      paint: { "line-color": "#3b82f6", "line-width": 2 },
    });

    map.addLayer({
      id: "lines",
      type: "line",
      source: "data",
      filter: ["==", "$type", "LineString"],
      paint: { "line-color": "#3b82f6", "line-width": 3 },
    });

    map.addLayer({
      id: "points",
      type: "circle",
      source: "data",
      filter: ["==", "$type", "Point"],
      paint: {
        "circle-radius": 8,
        "circle-color": "#3b82f6",
        "circle-stroke-width": 2,
        "circle-stroke-color": "#fff",
      },
    });
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
