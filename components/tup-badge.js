import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";

const SHOW_PARKING_BADGE = false;

class TupBadge extends HTMLElement {

  static observedAttributes = [
    "building",
    "floor",
    "room",
    "parking",
    "parking-href",
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

  #items(variant) {
    const parkingHref = this.getAttribute("parking-href");
    const hasParking = SHOW_PARKING_BADGE
      && variant !== "minimal"
      && (this.hasAttribute("parking") || Boolean(parkingHref));

    const parkingItem = hasParking
      ? [{
        type: "parking",
        label: "Parking",
        value: "",
        href: parkingHref,
      }]
      : [];

    const locationItems = [
      ...parkingItem,
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
    ].filter((item) => item.type === "parking" || item.value);

    return locationItems.length > 0 ? locationItems : [];
  }

  #render() {
    const variant = this.#variant();
    const items = this.#items(variant);

    this.hidden = items.length === 0;

    if (items.length === 0) {
      this.innerHTML = "";
      return;
    }

    this.innerHTML = `
      <dl class="place-badge place-badge--${variant}" aria-label="Skrót lokalizacji">
        ${items.map((item, index) => this.#itemMarkup(item, items[index + 1])).join("")}
      </dl>
    `;
  }

  #itemClass(item, nextItem) {
    return [
      "place-badge-item",
      `place-badge-item--${item.type}`,
    ].filter(Boolean).join(" ");
  }

  #itemMarkup(item, nextItem) {
    const itemClass = this.#itemClass(item, nextItem);

    return `
      <div class="${itemClass}">
        <dt class="visually-hidden">${escapeHtml(item.label)}</dt>
        ${this.#valueMarkup(item)}
      </div>
    `;
  }

  #valueMarkup(item) {
    if (item.type !== "parking") {
      return `<dd class="place-badge-value">${escapeHtml(item.value)}</dd>`;
    }

    if (item.href) {
      return `
        <dd class="place-badge-value place-badge-value--icon">
          <a
            class="place-badge-link"
            href="${escapeHtml(item.href)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Przejdź do parkingu"
          >
            <span class="visually-hidden">Parking</span>
          </a>
        </dd>
      `;
    }

    return `
      <dd class="place-badge-value place-badge-value--icon">
        <span class="visually-hidden">Parking</span>
      </dd>
    `;
  }
}

defineCustomElement(
  "tup-badge",
  TupBadge
);
