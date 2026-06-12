import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";

class TupBadge extends HTMLElement {

  static observedAttributes = [
    "building",
    "floor",
    "room",
    "variant",
  ];

  connectedCallback() {
    this.#render();
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#render();
    }
  }

  #variant() {
    const variant = (this.getAttribute("variant") ?? "default")
      .trim()
      .toLowerCase();

    return ["default", "compact", "minimal"].includes(variant)
      ? variant
      : "default";
  }

  #items() {
    const locationItems = [
      {
        type: "building",
        label: "Budynek",
        value: this.getAttribute("building") ?? "",
      },
      {
        type: "stairs",
        label: "Piętro",
        value: this.getAttribute("floor") ?? "",
      },
      {
        type: "door",
        label: "Lokal",
        value: this.getAttribute("room") ?? "",
      },
    ].filter((item) => item.value);

    return locationItems.length > 0 ? locationItems : [];
  }

  #render() {
    const variant = this.#variant();
    const items = this.#items();

    this.hidden = items.length === 0;

    if (items.length === 0) {
      this.innerHTML = "";
      return;
    }

    this.innerHTML = `
      <dl class="place-badge place-badge--${variant}" aria-label="Skrót lokalizacji">
        ${items.map((item) => this.#itemMarkup(item)).join("")}
      </dl>
    `;
  }

  #itemClass(item) {
    return [
      "place-badge-item",
      `place-badge-item--${item.type}`,
    ].filter(Boolean).join(" ");
  }

  #itemMarkup(item) {
    const itemClass = this.#itemClass(item);

    return `
      <div class="${itemClass}">
        <dt class="visually-hidden">${escapeHtml(item.label)}</dt>
        ${this.#valueMarkup(item)}
      </div>
    `;
  }

  #valueMarkup(item) {
    return `<dd class="place-badge-value">${escapeHtml(item.value)}</dd>`;
  }
}

defineCustomElement(
  "tup-badge",
  TupBadge
);
