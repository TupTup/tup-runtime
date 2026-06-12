import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";

class TupPlacePhoto extends HTMLElement {

  static observedAttributes = ["src", "alt", "caption", "fallback-src"];

  static #lightbox = null;
  static #photos = [];
  static #activeIndex = 0;
  static #gesture = null;

  connectedCallback() {
    this.#render();
    this.#bindFallback();
    this.#bindLightbox();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#render();
      this.#bindFallback();
      this.#bindLightbox();
    }
  }

  #isEditMode() {
    return document.documentElement.dataset.mode === "edit";
  }

  #hasPhoto() {
    return Boolean(this.getAttribute("src")?.trim());
  }

  #render() {
    const src = this.getAttribute("src") ?? "";
    const alt = this.getAttribute("alt") ?? "";
    const caption = this.getAttribute("caption") ?? "";
    const showCaption = caption && !this.hasAttribute("hide-caption");
    const parking = this.hasAttribute("parking");

    if (!this.#hasPhoto() && this.#isEditMode()) {
      this.innerHTML = `
        <div class="place-hero-home">
          <figure class="place-hero">
            <button
              type="button"
              class="hero-image-trigger hero-image-trigger--empty"
              data-photo-add
              aria-label="Dodaj zdjęcie"
            >
              <span class="place-photo-add-icon" aria-hidden="true">+</span>
              <span class="place-photo-add-label">Dodaj zdjęcie</span>
            </button>
          </figure>
        </div>
      `;
      return;
    }

    const parkingHtml = parking
      ? `<span class="place-photo-parking" aria-hidden="true">P</span>`
      : "";

    const figcaptionHtml = showCaption
      ? `<figcaption class="visually-hidden">${escapeHtml(caption)}</figcaption>`
      : "";

    this.innerHTML = `
      <div class="place-hero-home">
        <figure class="place-hero">
          <button
            type="button"
            class="hero-image-trigger"
            data-lightbox
            aria-label="${escapeHtml(alt ? `Powiększ: ${alt}` : "Powiększ zdjęcie")}"
          >
            <img
              class="hero-image-img"
              src="${escapeHtml(src)}"
              alt="${escapeHtml(alt)}"
              width="800"
              height="450"
            />

            ${parkingHtml}
          </button>

          ${figcaptionHtml}
        </figure>
      </div>
    `;
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

  #bindLightbox() {
    if (this.#isEditMode()) {
      return;
    }

    const trigger = this.querySelector("[data-lightbox]");

    if (!trigger || trigger.dataset.bound === "true") {
      return;
    }

    trigger.dataset.bound = "true";

    trigger.addEventListener("click", () => {
      const photos = TupPlacePhoto.#collectPhotos();
      const activeIndex = photos.findIndex((photo) => photo.host === this);

      if (activeIndex === -1) {
        return;
      }

      TupPlacePhoto.#openLightbox(photos, activeIndex);
    });
  }

  static #collectPhotos() {
    return [...document.querySelectorAll("tup-place-photo")]
      .map((host) => {
        const img = host.querySelector(".hero-image-img");

        if (!img?.src) {
          return null;
        }

        return {
          host,
          src: img.src,
          alt: img.alt,
          caption: host.getAttribute("caption") ?? "",
          hideCaption: host.hasAttribute("hide-caption"),
        };
      })
      .filter(Boolean);
  }

  static #openLightbox(photos, activeIndex) {
    const dialog = TupPlacePhoto.#ensureLightbox();

    TupPlacePhoto.#photos = photos;
    TupPlacePhoto.#activeIndex = activeIndex;
    TupPlacePhoto.#renderLightboxPhoto();

    if (!dialog.open) {
      dialog.showModal();
    }
  }

  static #ensureLightbox() {
    if (TupPlacePhoto.#lightbox?.isConnected) {
      return TupPlacePhoto.#lightbox;
    }

    let dialog = document.getElementById("tup-photo-lightbox");

    if (!dialog) {
      dialog = document.createElement("dialog");
      dialog.id = "tup-photo-lightbox";
      dialog.className = "hero-lightbox";
      dialog.setAttribute("aria-label", "Powiększone zdjęcie");
      dialog.innerHTML = `
        <button
          type="button"
          class="hero-lightbox-close"
          aria-label="Zamknij"
        >
          &times;
        </button>

        <button
          type="button"
          class="hero-lightbox-nav hero-lightbox-nav--prev"
          data-lightbox-prev
          aria-label="Poprzednie zdjęcie"
          hidden
        ></button>

        <button
          type="button"
          class="hero-lightbox-nav hero-lightbox-nav--next"
          data-lightbox-next
          aria-label="Następne zdjęcie"
          hidden
        ></button>

        <div class="hero-lightbox-body">
          <img class="hero-lightbox-img" src="" alt="" />
          <p class="hero-lightbox-caption" hidden></p>
        </div>
      `;
      document.body.appendChild(dialog);
    }

    TupPlacePhoto.#lightbox = dialog;
    TupPlacePhoto.#bindLightboxEvents(dialog);

    return dialog;
  }

  static #bindLightboxEvents(dialog) {
    if (dialog.dataset.bound === "true") {
      return;
    }

    dialog.dataset.bound = "true";

    dialog.querySelector(".hero-lightbox-close")
      ?.addEventListener("click", () => dialog.close());

    dialog.querySelector("[data-lightbox-prev]")
      ?.addEventListener("click", () => TupPlacePhoto.#showRelativePhoto(-1));

    dialog.querySelector("[data-lightbox-next]")
      ?.addEventListener("click", () => TupPlacePhoto.#showRelativePhoto(1));

    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) {
        dialog.close();
      }
    });

    dialog.addEventListener("pointerdown", (event) => {
      if (!TupPlacePhoto.#isPhotoTapTarget(event.target)) {
        return;
      }

      TupPlacePhoto.#gesture = {
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        pointerType: event.pointerType,
      };
    });

    dialog.addEventListener("pointerup", (event) => {
      const gesture = TupPlacePhoto.#gesture;
      TupPlacePhoto.#gesture = null;

      if (!gesture || gesture.pointerId !== event.pointerId) {
        return;
      }

      const deltaX = event.clientX - gesture.x;
      const deltaY = event.clientY - gesture.y;
      const moved = Math.hypot(deltaX, deltaY);

      if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        TupPlacePhoto.#showRelativePhoto(deltaX > 0 ? -1 : 1);
        return;
      }

      if (moved < 10 && TupPlacePhoto.#isTouchPointer(gesture.pointerType)) {
        dialog.close();
      }
    });

    dialog.addEventListener("pointercancel", () => {
      TupPlacePhoto.#gesture = null;
    });
  }

  static #isPhotoTapTarget(target) {
    return Boolean(target.closest(".hero-lightbox-body"));
  }

  static #isTouchPointer(pointerType) {
    return pointerType === "touch" || pointerType === "pen";
  }

  static #showRelativePhoto(offset) {
    const count = TupPlacePhoto.#photos.length;

    if (count < 2) {
      return;
    }

    TupPlacePhoto.#activeIndex =
      (TupPlacePhoto.#activeIndex + offset + count) % count;
    TupPlacePhoto.#renderLightboxPhoto();
  }

  static #renderLightboxPhoto() {
    const dialog = TupPlacePhoto.#lightbox;
    const photo = TupPlacePhoto.#photos[TupPlacePhoto.#activeIndex];

    if (!dialog || !photo) {
      return;
    }

    const lightboxImg = dialog.querySelector(".hero-lightbox-img");
    const lightboxCaption = dialog.querySelector(".hero-lightbox-caption");
    const prevButton = dialog.querySelector("[data-lightbox-prev]");
    const nextButton = dialog.querySelector("[data-lightbox-next]");
    const showCaption = photo.caption && !photo.hideCaption;
    const hasMultiplePhotos = TupPlacePhoto.#photos.length > 1;

    lightboxImg.src = photo.src;
    lightboxImg.alt = photo.alt;

    if (lightboxCaption) {
      if (showCaption) {
        lightboxCaption.textContent = photo.caption;
        lightboxCaption.hidden = false;
      } else {
        lightboxCaption.textContent = "";
        lightboxCaption.hidden = true;
      }
    }

    if (prevButton) {
      prevButton.hidden = !hasMultiplePhotos;
    }

    if (nextButton) {
      nextButton.hidden = !hasMultiplePhotos;
    }
  }
}

defineCustomElement(
  "tup-place-photo",
  TupPlacePhoto
);
