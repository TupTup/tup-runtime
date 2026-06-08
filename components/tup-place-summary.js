import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";
import "./tup-badge.js";

class TupPlaceSummary extends HTMLElement {

  #headingId = null;

  static observedAttributes = [
    "building",
    "floor",
    "room",
    "parking",
    "parking-href",
    "variant",
    "navigate",
  ];

  connectedCallback() {
    if (!this.#headingId) {
      this.#headingId = `place-summary-heading-${crypto.randomUUID()}`;
    }

    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#render();
    }
  }

  #render() {
    const building = this.getAttribute("building") ?? "";
    const floor = this.getAttribute("floor") ?? "";
    const room = this.getAttribute("room") ?? "";
    const parkingHref = this.getAttribute("parking-href");
    const hasParking = this.hasAttribute("parking") || Boolean(parkingHref);
    const hasNavigate = this.hasAttribute("navigate");
    const hasBadge = building || floor || room;
    const variant = this.getAttribute("variant") ?? "default";

    const badgeHtml = hasBadge
      ? `
        <tup-badge
          class="place-summary-badge"
          building="${escapeHtml(building)}"
          floor="${escapeHtml(floor)}"
          room="${escapeHtml(room)}"
          variant="${escapeHtml(variant)}"
          ${hasParking ? "parking" : ""}
          ${parkingHref ? `parking-href="${escapeHtml(parkingHref)}"` : ""}
          ${hasNavigate ? "navigate" : ""}>
        </tup-badge>
      `
      : "";

    this.innerHTML = `
      <section class="place-summary-section" aria-labelledby="${this.#headingId}">
        <h2 id="${this.#headingId}" class="visually-hidden">
          Lokalizacja
        </h2>

        <div class="place-summary">
          ${badgeHtml}
        </div>
      </section>
    `;
  }
}

defineCustomElement(
  "tup-place-summary",
  TupPlaceSummary
);
