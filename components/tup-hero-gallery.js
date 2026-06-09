import { defineCustomElement } from "./define-custom-element.js";
import { HERO_SLIDE_SELECTOR } from "./tup-hero-slide.js";
import { openHeroLightbox } from "./tup-hero-lightbox.js";

function getGalleryItems(gallery) {
  return [...gallery.querySelectorAll(HERO_SLIDE_SELECTOR)];
}

function getActiveIndex(gallery, items) {
  const center = gallery.scrollLeft + gallery.clientWidth / 2;

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

function scrollToIndex(gallery, items, index) {
  const item = items[index];

  if (!item) {
    return;
  }

  gallery.scrollTo({
    left: item.offsetLeft,
    behavior: "smooth",
  });
}

function getGalleryShell(gallery) {
  const parent = gallery.parentElement;

  if (parent?.classList.contains("place-hero-gallery-shell")) {
    return parent;
  }

  const shell = document.createElement("div");
  shell.className = "place-hero-gallery-shell";
  gallery.parentNode.insertBefore(shell, gallery);
  shell.appendChild(gallery);

  return shell;
}

function removeGalleryNav(gallery) {
  const shell = gallery.parentElement;
  gallery.classList.remove("place-hero-gallery--navigable");

  if (!shell?.classList.contains("place-hero-gallery-shell")) {
    return;
  }

  delete shell.dataset.galleryBound;

  for (const button of shell.querySelectorAll(".hero-gallery-nav")) {
    button.remove();
  }
}

function ensureGalleryNav(gallery) {
  const items = getGalleryItems(gallery);

  if (items.length < 2) {
    removeGalleryNav(gallery);
    return;
  }

  const shell = getGalleryShell(gallery);

  if (shell.dataset.galleryBound === "true") {
    return;
  }

  shell.dataset.galleryBound = "true";
  gallery.classList.add("place-hero-gallery--navigable");

  const prevButton = document.createElement("button");
  prevButton.type = "button";
  prevButton.className = "hero-gallery-nav hero-gallery-nav--prev";
  prevButton.setAttribute("aria-label", "Poprzedni podgląd");

  const nextButton = document.createElement("button");
  nextButton.type = "button";
  nextButton.className = "hero-gallery-nav hero-gallery-nav--next";
  nextButton.setAttribute("aria-label", "Następny podgląd");

  prevButton.addEventListener("click", () => {
    const galleryItems = getGalleryItems(gallery);
    const activeIndex = getActiveIndex(gallery, galleryItems);
    const nextIndex =
      (activeIndex - 1 + galleryItems.length) % galleryItems.length;

    scrollToIndex(gallery, galleryItems, nextIndex);
  });

  nextButton.addEventListener("click", () => {
    const galleryItems = getGalleryItems(gallery);
    const activeIndex = getActiveIndex(gallery, galleryItems);
    const nextIndex = (activeIndex + 1) % galleryItems.length;

    scrollToIndex(gallery, galleryItems, nextIndex);
  });

  shell.append(prevButton, nextButton);
}

class TupHeroGallery extends HTMLElement {

  #childObserver = null;

  connectedCallback() {
    this.#bindLightbox();
    this.#refreshNav();
    this.#observeChildren();
  }

  disconnectedCallback() {
    this.#childObserver?.disconnect();
    this.#childObserver = null;
  }

  #observeChildren() {
    this.#childObserver?.disconnect();
    this.#childObserver = new MutationObserver(() => {
      this.#refreshNav();
    });
    this.#childObserver.observe(this, { childList: true });
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

      if (!host || host.parentElement !== this) {
        return;
      }

      openHeroLightbox(this, host);
    });
  }

  #refreshNav() {
    ensureGalleryNav(this);
  }
}

defineCustomElement(
  "tup-hero-gallery",
  TupHeroGallery
);
