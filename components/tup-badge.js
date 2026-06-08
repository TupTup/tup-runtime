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

    const brandItem = {
      type: "brand",
      label: "TupTup",
      value: "",
    };

    const navigateItems = this.hasAttribute("navigate")
      ? [
        {
          type: "chevron",
          label: "Dalej",
          value: ">",
        },
      ]
      : [];

    return locationItems.length > 0
      ? [
        brandItem,
        ...locationItems,
        ...navigateItems,
      ]
      : [];
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

    if (item.type === "chevron") {
      return `
        <div class="${itemClass}" aria-hidden="true">
          ${this.#valueMarkup(item)}
        </div>
      `;
    }

    return `
      <div class="${itemClass}">
        <dt class="visually-hidden">${escapeHtml(item.label)}</dt>
        ${this.#valueMarkup(item)}
      </div>
    `;
  }

  #valueMarkup(item) {
    if (item.type === "brand") {
      return `
        <dd class="place-badge-value place-badge-value--icon">
          <span class="visually-hidden">TupTup</span>
        </dd>
      `;
    }

    if (item.type === "chevron") {
      return `
        <dd class="place-badge-value place-badge-value--chevron">
          <svg
            class="place-badge-chevron"
            viewBox="0 0 10 18"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M2 2.5L8 9L2 15.5"
              fill="none"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </dd>
      `;
    }

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
