import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";
import "./tup-badge.js";

class TupPlaceSummary extends HTMLElement {

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
      <section class="place-summary-section" aria-labelledby="place-summary-heading">
        <h2 id="place-summary-heading" class="visually-hidden">
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
