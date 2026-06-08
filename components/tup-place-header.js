import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";

class TupPlaceHeader extends HTMLElement {

  static observedAttributes = [
    "name",
    "address",
    "lat",
    "lng",
    "plus-code",
    "map-href",
    "maps",
    "vcard",
    "preview",
  ];

  #onClick = (event) => {
    if (!event.target.closest("[data-share]")) {
      return;
    }

    this.#sharePlace();
  };

  connectedCallback() {
    this.addEventListener("click", this.#onClick);
    this.#render();
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#onClick);
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.#render();
    }
  }

  #readAttrs() {
    const name = this.getAttribute("name") ?? "";
    const address = this.getAttribute("address") ?? "";
    const lat = this.getAttribute("lat")?.trim() ?? "";
    const lng = this.getAttribute("lng")?.trim() ?? "";
    const plusCode = this.getAttribute("plus-code")?.trim() ?? "";
    const mapHref = this.getAttribute("map-href") ?? this.getAttribute("maps");
    const vcard = this.getAttribute("vcard");
    const preview = this.getAttribute("preview");

    return {
      name,
      address,
      vcard,
      preview,
      mapsUrl: this.#mapsUrl({
        address,
        lat,
        lng,
        plusCode,
        mapHref,
      }),
    };
  }

  #syncDocumentTitle(name) {
    if (this.hasAttribute("sync-title") && name) {
      document.title = name;
    }
  }

  #previewMarkup(preview) {
    if (!preview) {
      return "";
    }

    return `
      <img
        class="place-preview"
        src="${escapeHtml(preview)}"
        alt=""
        aria-hidden="true"
      />
    `;
  }

  #geoMarkup(lat, lng) {
    if (!lat || !lng) {
      return "";
    }

    return `
      <span
        itemprop="geo"
        itemscope
        itemtype="https://schema.org/GeoCoordinates"
        class="visually-hidden"
      >
        <meta itemprop="latitude" content="${escapeHtml(lat)}">
        <meta itemprop="longitude" content="${escapeHtml(lng)}">
      </span>
    `;
  }

  #addressMarkup(address, mapsUrl) {
    if (!address) {
      return "";
    }

    if (mapsUrl) {
      return `
        <a
          href="${escapeHtml(mapsUrl)}"
          class="place-address-link"
          target="_blank"
          rel="noopener noreferrer"
          itemprop="address"
        >
          <span class="place-address-pin" aria-hidden="true"></span>
          <span class="place-address-text">${escapeHtml(address)}</span>
        </a>
      `;
    }

    return `
      <span class="place-address-pin" aria-hidden="true"></span>
      <span class="place-address-text" itemprop="address">${escapeHtml(address)}</span>
    `;
  }

  #bookmarkMarkup(vcard) {
    if (!vcard) {
      return "";
    }

    return `
      <a
        href="${escapeHtml(vcard)}"
        download
        class="icon-button icon-button--bookmark"
        aria-label="Zapisz kontakt"
      ></a>
    `;
  }

  #render() {
    const { name, address, vcard, preview, mapsUrl } = this.#readAttrs();
    const lat = this.getAttribute("lat")?.trim() ?? "";
    const lng = this.getAttribute("lng")?.trim() ?? "";

    this.#syncDocumentTitle(name);

    const previewHtml = this.#previewMarkup(preview);
    const addressInner = this.#addressMarkup(address, mapsUrl);
    const bookmarkHtml = this.#bookmarkMarkup(vcard);
    const geoHtml = this.#geoMarkup(lat, lng);
    const nameHtml = name
      ? `<h1 class="place-name" itemprop="name">${escapeHtml(name)}</h1>`
      : "";

    this.innerHTML = `
      <header class="sheet-header">

        <div
          class="place-header"
          itemscope
          itemtype="https://schema.org/Place"
        >
          ${previewHtml}

          <div class="place-header-text">
            ${nameHtml}

            <div class="place-address-row">
              <address class="place-address">
                ${addressInner}
              </address>
            </div>

            ${geoHtml}
          </div>
        </div>

        <div class="sheet-actions">
          ${bookmarkHtml}

          <button
            type="button"
            class="icon-button icon-button--share"
            data-share
            aria-label="Udostępnij"
          ></button>
        </div>

      </header>
    `;
  }

  #mapsUrl({ address, lat, lng, plusCode, mapHref }) {
    if (mapHref) {
      return mapHref;
    }

    if (lat && lng) {
      return this.#mapsQueryUrl(`${lat},${lng}`);
    }

    if (plusCode) {
      return this.#mapsQueryUrl(plusCode);
    }

    if (!address) {
      return null;
    }

    return this.#mapsQueryUrl(address);
  }

  #mapsQueryUrl(query) {
    return `https://maps.google.com/?q=${encodeURIComponent(query)}`;
  }

  async #sharePlace() {
    const name = this.getAttribute("name") ?? "";
    const address = this.getAttribute("address") ?? "";
    const data = {
      title: name,
      text: address ? `${name} — ${address}` : name,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        if (error.name === "AbortError") {
          return;
        }
      }
    }

    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(data.url);
    }
  }
}

defineCustomElement(
  "tup-place-header",
  TupPlaceHeader
);
