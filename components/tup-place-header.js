import { escapeHtml } from "./tup-html.js";

class TupPlaceHeader extends HTMLElement {

  static observedAttributes = [
    "name",
    "address",
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
    const mapHref = this.getAttribute("map-href") ?? this.getAttribute("maps");
    const vcard = this.getAttribute("vcard");
    const preview = this.getAttribute("preview");

    return {
      name,
      address,
      vcard,
      preview,
      mapsUrl: this.#mapsUrl(address, mapHref),
    };
  }

  #syncDocumentTitle(name) {
    if (name) {
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
        >
          <span class="place-address-pin" aria-hidden="true"></span>
          <span class="place-address-text">${escapeHtml(address)}</span>
        </a>
      `;
    }

    return `
      <span class="place-address-pin" aria-hidden="true"></span>
      <span class="place-address-text">${escapeHtml(address)}</span>
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

    this.#syncDocumentTitle(name);

    const previewHtml = this.#previewMarkup(preview);
    const addressInner = this.#addressMarkup(address, mapsUrl);
    const bookmarkHtml = this.#bookmarkMarkup(vcard);

    this.innerHTML = `
      <header class="sheet-header">

        <div class="place-header">
          ${previewHtml}

          <div class="place-header-text">
            <h1 class="place-name">${escapeHtml(name)}</h1>

            <div class="place-address-row">
              <address class="place-address">
                ${addressInner}
              </address>
            </div>
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

  #mapsUrl(address, mapHref) {
    if (mapHref) {
      return mapHref;
    }

    if (!address) {
      return null;
    }

    return `https://maps.google.com/?q=${encodeURIComponent(address)}`;
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

customElements.define(
  "tup-place-header",
  TupPlaceHeader
);
