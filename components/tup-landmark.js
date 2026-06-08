import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";
import { renderHeroSlide } from "./tup-hero-slide.js";

class TupLandmark extends HTMLElement {

  static observedAttributes = [
    "src",
    "alt",
    "caption",
    "fallback-src",
  ];

  connectedCallback() {
    this.#render();
    this.#bindFallback();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#render();
      this.#bindFallback();
    }
  }

  #render() {
    const alt = this.getAttribute("alt") ?? "";
    const caption = this.getAttribute("caption") ?? "";
    const ariaLabel = alt ? `Powiększ: ${alt}` : "Powiększ zdjęcie";

    const mediaHtml = `
      <img
        class="hero-image-img"
        src="${escapeHtml(this.getAttribute("src") ?? "")}"
        alt="${escapeHtml(alt)}"
        width="800"
        height="450"
      />
    `;

    this.innerHTML = renderHeroSlide({
      mediaHtml,
      ariaLabel,
      caption,
      hideCaption: this.hasAttribute("hide-caption"),
      parking: this.hasAttribute("parking"),
    });
  }

  #bindFallback() {
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
}

defineCustomElement(
  "tup-landmark",
  TupLandmark
);
