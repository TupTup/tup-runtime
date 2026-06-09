import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";
import { renderHeroSlide } from "./tup-hero-slide.js";

class TupPhoto extends HTMLElement {

  static observedAttributes = [
    "src",
    "alt",
    "caption",
    "fallback-src",
  ];

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#render();
    }
  }

  #render() {
    const alt = this.getAttribute("alt") ?? "";
    const caption = this.getAttribute("caption") ?? "";
    const fallbackSrc = this.getAttribute("fallback-src");
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

    if (!fallbackSrc) {
      return;
    }

    const img = this.querySelector(".hero-image-img");

    if (img.complete && img.naturalWidth === 0) {
      img.src = fallbackSrc;
      return;
    }

    img.addEventListener("error", () => {
      img.src = fallbackSrc;
    }, { once: true });
  }
}

defineCustomElement(
  "tup-photo",
  TupPhoto
);
