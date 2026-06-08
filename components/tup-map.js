import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";
import { renderHeroSlide } from "./tup-hero-slide.js";
import {
  createMap,
  fetchGeojson,
  readMapConfig,
} from "./tup-maplibre.js";

class TupMap extends HTMLElement {

  static observedAttributes = [
    "alt",
    "caption",
    "src",
    "default-zoom",
    "zoom",
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

  #mountPreviewMap(container, { center, geojson, defaultZoom }) {
    if (!container.isConnected) {
      return;
    }

    this.#destroyPreviewMap();
    this.#previewMap = createMap(container, {
      interactive: false,
      center,
      zoom: defaultZoom,
      geojson,
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
    const { src, defaultZoom, center } = readMapConfig(this);
    const container = this.querySelector(".hero-map-preview");

    if (!container) {
      return;
    }

    const mount = (geojson = null) => {
      requestAnimationFrame(() => {
        this.#mountPreviewMap(container, { center, geojson, defaultZoom });
      });
    };

    if (src) {
      fetchGeojson(src)
        .then((geojson) => {
          mount(geojson);
        })
        .catch(() => {
          if (center) {
            mount();
            return;
          }

          this.#showMapError(container);
        });
      return;
    }

    if (center) {
      mount();
    }
  }
}

defineCustomElement(
  "tup-map",
  TupMap
);
