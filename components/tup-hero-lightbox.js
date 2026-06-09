import {
  createMap,
  fetchGeojson,
  readMapConfig,
} from "./tup-maplibre.js";
import { HERO_SLIDE_SELECTOR } from "./tup-hero-slide.js";

let lightbox = null;
let items = [];
let activeIndex = 0;
let gesture = null;
let lightboxMap = null;

export function openHeroLightbox(gallery, host) {
  const galleryItems = collectGalleryItems(gallery);
  const index = galleryItems.findIndex((item) => item.host === host);

  if (index === -1) {
    return;
  }

  const dialog = ensureLightbox();

  items = galleryItems;
  activeIndex = index;

  if (!dialog.open) {
    dialog.showModal();
  }

  renderLightboxItem();
}

function collectGalleryItems(gallery) {
  return [...gallery.querySelectorAll(HERO_SLIDE_SELECTOR)]
    .map((host) => {
      if (host.matches("tup-map")) {
        return {
          type: "map",
          host,
          ...readMapConfig(host),
          caption: host.getAttribute("caption") ?? "",
          hideCaption: host.hasAttribute("hide-caption"),
        };
      }

      if (host.matches("tup-landmark")) {
        const img = host.querySelector(".hero-image-img");

        if (!img?.src) {
          return null;
        }

        return {
          type: "photo",
          host,
          src: img.src,
          alt: img.alt,
          caption: host.getAttribute("caption") ?? "",
          hideCaption: host.hasAttribute("hide-caption"),
        };
      }

      return null;
    })
    .filter(Boolean);
}

function ensureLightbox() {
  if (lightbox?.isConnected) {
    return lightbox;
  }

  let dialog = document.getElementById("tup-photo-lightbox");

  if (!dialog) {
    dialog = document.createElement("dialog");
    dialog.id = "tup-photo-lightbox";
    dialog.className = "hero-lightbox";
    dialog.setAttribute("aria-label", "Powiększony podgląd");
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
        aria-label="Poprzedni element"
        hidden
      ></button>

      <button
        type="button"
        class="hero-lightbox-nav hero-lightbox-nav--next"
        data-lightbox-next
        aria-label="Następny element"
        hidden
      ></button>

      <div class="hero-lightbox-body">
        <img class="hero-lightbox-img" src="" alt="" />
        <div class="hero-lightbox-map" hidden></div>
        <p class="hero-lightbox-caption" hidden></p>
      </div>
    `;
    document.body.appendChild(dialog);
  }

  lightbox = dialog;
  bindLightboxEvents(dialog);

  return dialog;
}

function bindLightboxEvents(dialog) {
  if (dialog.dataset.bound === "true") {
    return;
  }

  dialog.dataset.bound = "true";

  dialog.querySelector(".hero-lightbox-close")
    ?.addEventListener("click", () => dialog.close());

  dialog.querySelector("[data-lightbox-prev]")
    ?.addEventListener("click", () => showRelativeItem(-1));

  dialog.querySelector("[data-lightbox-next]")
    ?.addEventListener("click", () => showRelativeItem(1));

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      dialog.close();
    }
  });

  dialog.addEventListener("close", () => {
    destroyLightboxMap();
  });

  dialog.addEventListener("pointerdown", (event) => {
    if (!isTapTarget(event.target) || isMapSlideActive()) {
      return;
    }

    gesture = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      pointerType: event.pointerType,
    };
  });

  dialog.addEventListener("pointerup", (event) => {
    if (isMapSlideActive()) {
      gesture = null;
      return;
    }

    const currentGesture = gesture;
    gesture = null;

    if (!currentGesture || currentGesture.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - currentGesture.x;
    const deltaY = event.clientY - currentGesture.y;
    const moved = Math.hypot(deltaX, deltaY);

    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      showRelativeItem(deltaX > 0 ? -1 : 1);
      return;
    }

    if (moved < 10 && isTouchPointer(currentGesture.pointerType)) {
      dialog.close();
    }
  });

  dialog.addEventListener("pointercancel", () => {
    gesture = null;
  });
}

function isMapSlideActive() {
  return items[activeIndex]?.type === "map";
}

function isTapTarget(target) {
  return Boolean(target.closest(".hero-lightbox-body"));
}

function isTouchPointer(pointerType) {
  return pointerType === "touch" || pointerType === "pen";
}

function showRelativeItem(offset) {
  const count = items.length;

  if (count < 2) {
    return;
  }

  activeIndex = (activeIndex + offset + count) % count;
  renderLightboxItem();
}

function destroyLightboxMap() {
  if (lightboxMap) {
    lightboxMap.destroy();
    lightboxMap = null;
  }
}

function renderLightboxItem() {
  const dialog = lightbox;
  const item = items[activeIndex];

  if (!dialog || !item) {
    return;
  }

  const lightboxImg = dialog.querySelector(".hero-lightbox-img");
  const lightboxMapEl = dialog.querySelector(".hero-lightbox-map");
  const lightboxCaption = dialog.querySelector(".hero-lightbox-caption");
  const prevButton = dialog.querySelector("[data-lightbox-prev]");
  const nextButton = dialog.querySelector("[data-lightbox-next]");
  const showCaption = item.caption && !item.hideCaption;
  const hasMultipleItems = items.length > 1;

  destroyLightboxMap();

  if (item.type === "photo") {
    lightboxImg.hidden = false;
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;

    if (lightboxMapEl) {
      lightboxMapEl.hidden = true;
      lightboxMapEl.replaceChildren();
    }
  } else {
    lightboxImg.hidden = true;
    lightboxImg.removeAttribute("src");
    lightboxImg.alt = "";

    if (lightboxMapEl) {
      const center = item.lat && item.lng
        ? { lat: item.lat, lng: item.lng }
        : null;

      lightboxMapEl.hidden = false;
      lightboxMapEl.replaceChildren();

      const mountLightboxMap = (mapCenter, geojson = null) => {
        if (items[activeIndex] !== item || !lightboxMapEl.isConnected) {
          return;
        }

        lightboxMapEl.replaceChildren();

        requestAnimationFrame(() => {
          if (items[activeIndex] !== item || !lightboxMapEl.isConnected) {
            return;
          }

          lightboxMap = createMap(lightboxMapEl, {
            interactive: true,
            center: mapCenter,
            zoom: item.defaultZoom,
            geojson,
          });
        });
      };

      if (item.src) {
        if (!center) {
          lightboxMapEl.textContent = "Ładowanie mapy…";
        }

        fetchGeojson(item.src)
          .then((geojson) => {
            mountLightboxMap(center, geojson);
          })
          .catch(() => {
            if (center) {
              mountLightboxMap(center);
              return;
            }

            if (items[activeIndex] !== item || !lightboxMapEl.isConnected) {
              return;
            }

            lightboxMapEl.textContent = "Nie udało się załadować mapy.";
          });
      } else if (center) {
        mountLightboxMap(center);
      } else {
        lightboxMapEl.textContent = "Nie udało się załadować mapy.";
      }
    }
  }

  if (lightboxCaption) {
    if (showCaption) {
      lightboxCaption.textContent = item.caption;
      lightboxCaption.hidden = false;
    } else {
      lightboxCaption.textContent = "";
      lightboxCaption.hidden = true;
    }
  }

  if (prevButton) {
    prevButton.hidden = !hasMultipleItems;
  }

  if (nextButton) {
    nextButton.hidden = !hasMultipleItems;
  }

  dialog.classList.toggle("hero-lightbox--map", item.type === "map");
}
