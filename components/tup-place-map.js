import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";
import { renderHeroSlide } from "./tup-hero-slide.js";
import {
  createOsmMap,
  fetchBuildingFootprint,
  readPlaceMapConfig,
} from "./tup-maplibre.js";
import { fetchOsmGeometry } from "./tup-osm-geometry.js";

class TupPlaceMap extends HTMLElement {

  static observedAttributes = [
    "alt",
    "caption",
    "src",
    "default-zoom",
    "zoom",
    "osm-type",
    "osm-id",
    "lat",
    "lng",
  ];

  #previewMap = null;
  #visibilityObserver = null;

  connectedCallback() {
    this.#render();
    this.#loadPreviewMap();
  }

  disconnectedCallback() {
    this.#destroyPreviewMap();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#destroyPreviewMap();
      this.#render();
      this.#loadPreviewMap();
    }
  }

  #render() {
    const alt = this.getAttribute("alt") ?? "";
    const caption = this.getAttribute("caption") ?? "";
    const ariaLabel = alt ? `Powiększ: ${alt}` : "Powiększ mapę lokalizacji";

    const mediaHtml = `
      <div
        class="hero-map-preview"
        role="img"
        aria-label="${escapeHtml(alt || "Mapa lokalizacji")}"
      ></div>
    `;

    this.innerHTML = renderHeroSlide({
      mediaHtml,
      ariaLabel,
      caption,
      hideCaption: this.hasAttribute("hide-caption"),
    });
  }

  #destroyPreviewMap() {
    this.#visibilityObserver?.disconnect();
    this.#visibilityObserver = null;

    if (this.#previewMap) {
      this.#previewMap.destroy();
      this.#previewMap = null;
    }
  }

  #observeMapVisibility(container) {
    this.#visibilityObserver?.disconnect();
    this.#visibilityObserver = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        this.#previewMap?.refit();
      }
    });
    this.#visibilityObserver.observe(container);
  }

  #mountPreviewMap(container, geojson, center, buildingFootprint, defaultZoom) {
    if (!container.isConnected) {
      return;
    }

    this.#destroyPreviewMap();
    this.#previewMap = createOsmMap(container, geojson, {
      interactive: false,
      center,
      zoom: defaultZoom,
      buildingFootprint,
    });
    this.#observeMapVisibility(container);
  }

  #showMapError(container) {
    if (!container.isConnected) {
      return;
    }

    container.classList.add("hero-map-preview--error");
    container.textContent = "Nie udało się załadować mapy";
    container.setAttribute("aria-label", "Nie udało się załadować mapy");
  }

  #loadPreviewMap() {
    const mapConfig = readPlaceMapConfig(this);
    const container = this.querySelector(".hero-map-preview");

    if (!container) {
      return;
    }

    const { src, defaultZoom, center, needsOsmFetch, osmType, osmId } =
      mapConfig;

    const mountWhenReady = (geojson, mapCenter, buildingFootprint = null) => {
      requestAnimationFrame(() => {
        this.#mountPreviewMap(
          container,
          geojson,
          mapCenter,
          buildingFootprint,
          defaultZoom
        );
      });
    };

    if (src) {
      fetchBuildingFootprint(src)
        .then((buildingFootprint) => {
          mountWhenReady(null, center, buildingFootprint);
        })
        .catch(() => {
          if (center) {
            mountWhenReady(null, center);
            return;
          }

          this.#showMapError(container);
        });
      return;
    }

    if (!needsOsmFetch) {
      if (center) {
        mountWhenReady(null, center);
      }
      return;
    }

    if (center) {
      mountWhenReady(null, center);
    }

    fetchOsmGeometry(osmType, osmId)
      .then((geojson) => {
        mountWhenReady(geojson, center);
      })
      .catch(() => {
        if (center) {
          return;
        }

        this.#showMapError(container);
      });
  }
}

defineCustomElement(
  "tup-place-map",
  TupPlaceMap
);
