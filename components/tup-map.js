import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { defineCustomElement } from "./define-custom-element.js";

const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

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
      this.#reloadData();
    }
  }

  #init() {
    this.#container = document.createElement("div");
    this.#container.className = "tup-map-container";
    this.appendChild(this.#container);

    this.#map = new maplibregl.Map({
      container: this.#container,
      style: MAP_STYLE,
      attributionControl: false,
      interactive: false,
    });

    this.#map.once("load", () => this.#reloadData());
  }

  async #reloadData() {
    const src = this.getAttribute("src");

    if (!src || !this.#map) {
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

    const existing = this.#map.getSource("data");

    if (existing) {
      existing.setData(data);
    } else {
      this.#map.addSource("data", { type: "geojson", data });
      this.#addLayers();
    }

    const bounds = this.#computeBounds(data);

    if (bounds) {
      this.#map.fitBounds(bounds, { padding: 40, maxZoom: 17, animate: false });
    }
  }

  #addLayers() {
    this.#map.addLayer({
      id: "polygons-fill",
      type: "fill",
      source: "data",
      filter: ["==", "$type", "Polygon"],
      paint: { "fill-color": "#3b82f6", "fill-opacity": 0.15 },
    });

    this.#map.addLayer({
      id: "polygons-line",
      type: "line",
      source: "data",
      filter: ["==", "$type", "Polygon"],
      paint: { "line-color": "#3b82f6", "line-width": 2 },
    });

    this.#map.addLayer({
      id: "lines",
      type: "line",
      source: "data",
      filter: ["==", "$type", "LineString"],
      paint: { "line-color": "#3b82f6", "line-width": 3 },
    });

    this.#map.addLayer({
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
