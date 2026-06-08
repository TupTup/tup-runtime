import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";
import { refreshHeroGallery } from "./tup-hero-gallery.js";
import { bindHeroLightbox } from "./tup-hero-lightbox.js";
import { createOsmMap, readMapSlideConfig } from "./tup-maplibre.js";
import { fetchOsmGeometry } from "./tup-osm-geometry.js";

class TupPlacePhoto extends HTMLElement {

  static observedAttributes = [
    "src",
    "alt",
    "caption",
    "fallback-src",
    "osm-type",
    "osm-id",
    "lat",
    "lng",
    "building-footprint",
  ];

  #previewMap = null;
  #visibilityObserver = null;

  connectedCallback() {
    this.#render();
    this.#bindFallback();
    this.#bindLightbox();
    this.#loadPreviewMap();
    this.#refreshGalleryNav();
  }

  disconnectedCallback() {
    this.#destroyPreviewMap();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#destroyPreviewMap();
      this.#render();
      this.#bindFallback();
      this.#bindLightbox();
      this.#loadPreviewMap();
      this.#refreshGalleryNav();
    }
  }

  #refreshGalleryNav() {
    refreshHeroGallery(this.closest(".place-hero-gallery"));
  }

  #isMapMode() {
    return readMapSlideConfig(this).isMap;
  }

  #render() {
    const alt = this.getAttribute("alt") ?? "";
    const caption = this.getAttribute("caption") ?? "";
    const showCaption = caption && !this.hasAttribute("hide-caption");
    const parking = this.hasAttribute("parking");
    const isMap = this.#isMapMode();

    const parkingHtml = parking
      ? `<span class="place-photo-parking" aria-hidden="true">P</span>`
      : "";

    const figcaptionHtml = showCaption
      ? `<figcaption class="visually-hidden">${escapeHtml(caption)}</figcaption>`
      : "";

    const ariaLabel = isMap
      ? (alt ? `Powiększ: ${alt}` : "Powiększ mapę lokalizacji")
      : (alt ? `Powiększ: ${alt}` : "Powiększ zdjęcie");

    const mediaHtml = isMap
      ? `
        <div
          class="hero-map-preview"
          role="img"
          aria-label="${escapeHtml(alt || "Mapa lokalizacji")}"
        ></div>
      `
      : `
        <img
          class="hero-image-img"
          src="${escapeHtml(this.getAttribute("src") ?? "")}"
          alt="${escapeHtml(alt)}"
          width="800"
          height="450"
        />
      `;

    this.innerHTML = `
      <div class="place-hero-home">
        <figure class="place-hero">
          <button
            type="button"
            class="hero-image-trigger"
            data-lightbox
            aria-label="${escapeHtml(ariaLabel)}"
          >
            ${mediaHtml}
            ${parkingHtml}
          </button>

          ${figcaptionHtml}
        </figure>
      </div>
    `;
  }

  #bindFallback() {
    if (this.#isMapMode()) {
      return;
    }

    const img = this.querySelector(".hero-image-img");
    const fallbackSrc = this.getAttribute("fallback-src");

    if (!img || !fallbackSrc) {
      return;
    }

    img.addEventListener("error", () => {
      if (img.dataset.fallbackApplied === "true") {
        return;
      }

      img.dataset.fallbackApplied = "true";
      img.src = fallbackSrc;
    });

    if (img.complete && img.naturalWidth === 0) {
      img.dataset.fallbackApplied = "true";
      img.src = fallbackSrc;
    }
  }

  #bindLightbox() {
    bindHeroLightbox(this.querySelector("[data-lightbox]"), this);
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

  #mountPreviewMap(container, geojson, center, buildingFootprint) {
    if (!container.isConnected) {
      return;
    }

    this.#destroyPreviewMap();
    this.#previewMap = createOsmMap(container, geojson, {
      interactive: false,
      center,
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
    const mapConfig = readMapSlideConfig(this);

    if (!mapConfig.isMap) {
      return;
    }

    const container = this.querySelector(".hero-map-preview");

    if (!container) {
      return;
    }

    const { buildingFootprint, center, needsOsmFetch, osmType, osmId } =
      mapConfig;

    const mountWhenReady = (geojson, mapCenter) => {
      requestAnimationFrame(() => {
        this.#mountPreviewMap(
          container,
          geojson,
          mapCenter,
          buildingFootprint
        );
      });
    };

    if (buildingFootprint) {
      mountWhenReady(null, center);
      return;
    }

    if (!needsOsmFetch) {
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
  "tup-place-photo",
  TupPlacePhoto
);
