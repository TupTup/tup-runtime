import { escapeHtml } from "./tup-html.js";

export const HERO_SLIDE_SELECTOR =
  ":scope > tup-place-photo, :scope > tup-map";

export function renderHeroSlide({
  mediaHtml,
  ariaLabel,
  caption = "",
  hideCaption = false,
  parking = false,
}) {
  const parkingHtml = parking
    ? `<span class="place-photo-parking" aria-hidden="true">P</span>`
    : "";

  const figcaptionHtml =
    caption && !hideCaption
      ? `<figcaption class="visually-hidden">${escapeHtml(caption)}</figcaption>`
      : "";

  return `
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
