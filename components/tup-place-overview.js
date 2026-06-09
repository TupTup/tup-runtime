import { defineCustomElement } from "./define-custom-element.js";
import { HERO_SLIDE_SELECTOR } from "./tup-hero-slide.js";
import { openHeroLightbox } from "./tup-hero-lightbox.js";

function getGalleryItems(scroll) {
  return [...scroll.querySelectorAll(HERO_SLIDE_SELECTOR)];
}

function getActiveIndex(scroll, items) {
  const center = scroll.scrollLeft + scroll.clientWidth / 2;

  let closest = 0;
  let minDistance = Infinity;

  for (const [index, item] of items.entries()) {
    const itemCenter = item.offsetLeft + item.clientWidth / 2;
    const distance = Math.abs(center - itemCenter);

    if (distance < minDistance) {
      minDistance = distance;
      closest = index;
    }
  }

  return closest;
}

function scrollToIndex(scroll, items, index) {
  const item = items[index];

  if (!item) {
    return;
  }

  scroll.scrollTo({
    left: item.offsetLeft,
    behavior: "smooth",
  });
}

function removeGalleryNav(host) {
  delete host.dataset.galleryBound;

  for (const button of host.querySelectorAll(".hero-gallery-nav")) {
    button.remove();
  }
}

function ensureGalleryNav(host, scroll) {
  const items = getGalleryItems(scroll);

  if (items.length < 2) {
    removeGalleryNav(host);
    return;
  }

  if (host.dataset.galleryBound === "true") {
    return;
  }

  host.dataset.galleryBound = "true";

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className = "hero-gallery-nav hero-gallery-nav--prev";
  prevButton.setAttribute("aria-label", "Poprzedni podgląd");

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "hero-gallery-nav hero-gallery-nav--next";
  nextButton.setAttribute("aria-label", "Następny podgląd");

  prevButton.addEventListener("click", () => {
    const galleryItems = getGalleryItems(scroll);
    const activeIndex = getActiveIndex(scroll, galleryItems);
    const nextIndex =
      (activeIndex - 1 + galleryItems.length) % galleryItems.length;

    scrollToIndex(scroll, galleryItems, nextIndex);
  });

  nextButton.addEventListener("click", () => {
    const galleryItems = getGalleryItems(scroll);
    const activeIndex = getActiveIndex(scroll, galleryItems);
    const nextIndex = (activeIndex + 1) % galleryItems.length;

    scrollToIndex(scroll, galleryItems, nextIndex);
  });

  host.append(prevButton, nextButton);
}

class TupPlaceOverview extends HTMLElement {

  #childObserver = null;
  #scroll = null;

  connectedCallback() {
    this.#buildScroll();
    this.#bindLightbox();
    this.#refreshNav();
    this.#observeChildren();
  }

  disconnectedCallback() {
    this.#childObserver?.disconnect();
    this.#childObserver = null;
  }

  #buildScroll() {
    if (this.#scroll) {
      return;
    }

    const scroll = document.createElement("div");
    scroll.className = "place-overview-scroll";

    for (const child of [...this.querySelectorAll(HERO_SLIDE_SELECTOR)]) {
      scroll.appendChild(child);
    }

    this.insertBefore(scroll, this.firstChild);
    this.#scroll = scroll;
  }

  #observeChildren() {
    this.#childObserver?.disconnect();
    this.#childObserver = new MutationObserver(() => {
      this.#refreshNav();
    });
    this.#childObserver.observe(this.#scroll, { childList: true });
  }

  #bindLightbox() {
    if (this.dataset.lightboxBound === "true") {
      return;
    }

    this.dataset.lightboxBound = "true";

    this.addEventListener("click", (event) => {
      const trigger = event.target.closest("[data-lightbox]");

      if (!trigger || !this.contains(trigger)) {
        return;
      }

      const host = trigger.closest("tup-photo, tup-map");

      if (!host || host.parentElement !== this.#scroll) {
        return;
      }

      openHeroLightbox(this.#scroll, host);
    });
  }

  #refreshNav() {
    ensureGalleryNav(this, this.#scroll);
  }
}

defineCustomElement(
  "tup-place-overview",
  TupPlaceOverview
);
