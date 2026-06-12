import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";

class TupPlaceOverview extends HTMLElement {

  connectedCallback() {
    this.#render();
  }

  #photoElements() {
    return [...this.querySelectorAll(":scope > tup-place-photo")];
  }

  #render() {
    const photoEls = this.#photoElements();

    // Keep source photos hidden but in DOM — the shared lightbox finds them via querySelectorAll
    photoEls.forEach((el) => { el.hidden = true; });

    this.querySelector(".place-overview")?.remove();

    if (photoEls.length === 0) {
      this.hidden = true;
      return;
    }

    this.hidden = false;

    const photos = photoEls.map((el) => ({
      el,
      src: el.getAttribute("src") ?? "",
      alt: el.getAttribute("alt") ?? "",
      fallbackSrc: el.getAttribute("fallback-src") ?? "",
    }));

    const visible = photos.slice(0, 3);
    const overflow = photos.length - visible.length;

    const grid = document.createElement("div");
    grid.className = "place-overview";
    grid.setAttribute("role", "list");
    grid.setAttribute("aria-label", "Galeria zdjęć miejsca");

    grid.innerHTML = visible.map((photo, index) => {
      const isFeatured = index === 0;
      const showOverflow = index === visible.length - 1 && overflow > 0;

      return `
        <div class="overview-item${isFeatured ? " overview-item--featured" : ""}" role="listitem">
          <button
            type="button"
            class="overview-thumb"
            data-index="${index}"
            aria-label="${escapeHtml(photo.alt ? `Powiększ: ${photo.alt}` : "Powiększ zdjęcie")}"
          >
            <img
              class="overview-thumb-img"
              src="${escapeHtml(photo.src)}"
              alt="${escapeHtml(photo.alt)}"
            />
            ${showOverflow ? `<span class="overview-overflow" aria-hidden="true">+${overflow}</span>` : ""}
          </button>
        </div>
      `;
    }).join("");

    this.appendChild(grid);
    this.#bindFallbacks(visible, grid);
    this.#bindClicks(photoEls, grid);
  }

  #bindFallbacks(photos, grid) {
    photos.forEach((photo, index) => {
      if (!photo.fallbackSrc) return;

      const img = grid.querySelector(`[data-index="${index}"] .overview-thumb-img`);

      if (!img) return;

      img.addEventListener("error", () => {
        if (img.dataset.fallbackApplied === "true") return;
        img.dataset.fallbackApplied = "true";
        img.src = photo.fallbackSrc;
      });

      if (img.complete && img.naturalWidth === 0) {
        img.dataset.fallbackApplied = "true";
        img.src = photo.fallbackSrc;
      }
    });
  }

  #bindClicks(photoEls, grid) {
    grid.addEventListener("click", (event) => {
      const button = event.target.closest("[data-index]");

      if (!button) return;

      const index = parseInt(button.dataset.index, 10);
      const photoEl = photoEls[index];

      if (!photoEl) return;

      // tup-place-photo renders its trigger lazily; safe to query at click time
      const trigger = photoEl.querySelector("[data-lightbox]");

      if (trigger) trigger.click();
    });
  }
}

defineCustomElement("tup-place-overview", TupPlaceOverview);
