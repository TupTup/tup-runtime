//#region components/define-custom-element.js
function e(e, t) {
	customElements.get(e) || customElements.define(e, t);
}
//#endregion
//#region components/tup-html.js
function t(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
e("tup-place-header", class extends HTMLElement {
	static observedAttributes = [
		"name",
		"address",
		"map-href",
		"maps",
		"vcard",
		"preview"
	];
	#e = (e) => {
		e.target.closest("[data-share]") && this.#c();
	};
	connectedCallback() {
		this.addEventListener("click", this.#e), this.#o();
	}
	disconnectedCallback() {
		this.removeEventListener("click", this.#e);
	}
	attributeChangedCallback() {
		this.isConnected && this.#o();
	}
	#t() {
		let e = this.getAttribute("name") ?? "", t = this.getAttribute("address") ?? "", n = this.getAttribute("map-href") ?? this.getAttribute("maps");
		return {
			name: e,
			address: t,
			vcard: this.getAttribute("vcard"),
			preview: this.getAttribute("preview"),
			mapsUrl: this.#s(t, n)
		};
	}
	#n(e) {
		e && (document.title = e);
	}
	#r(e) {
		return e ? `
      <img
        class="place-preview"
        src="${t(e)}"
        alt=""
        aria-hidden="true"
      />
    ` : "";
	}
	#i(e, n) {
		return e ? n ? `
        <a
          href="${t(n)}"
          class="place-address-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="place-address-pin" aria-hidden="true"></span>
          <span class="place-address-text">${t(e)}</span>
        </a>
      ` : `
      <span class="place-address-pin" aria-hidden="true"></span>
      <span class="place-address-text">${t(e)}</span>
    ` : "";
	}
	#a(e) {
		return e ? `
      <a
        href="${t(e)}"
        download
        class="icon-button icon-button--bookmark"
        aria-label="Zapisz kontakt"
      ></a>
    ` : "";
	}
	#o() {
		let { name: e, address: n, vcard: r, preview: i, mapsUrl: a } = this.#t();
		this.#n(e);
		let o = this.#r(i), s = this.#i(n, a), c = this.#a(r);
		this.innerHTML = `
      <header class="sheet-header">

        <div class="place-header">
          ${o}

          <div class="place-header-text">
            <h1 class="place-name">${t(e)}</h1>

            <div class="place-address-row">
              <address class="place-address">
                ${s}
              </address>
            </div>
          </div>
        </div>

        <div class="sheet-actions">
          ${c}

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
	#s(e, t) {
		return t || (e ? `https://maps.google.com/?q=${encodeURIComponent(e)}` : null);
	}
	async #c() {
		let e = this.getAttribute("name") ?? "", t = this.getAttribute("address") ?? "", n = {
			title: e,
			text: t ? `${e} — ${t}` : e,
			url: window.location.href
		};
		if (navigator.share) try {
			await navigator.share(n);
			return;
		} catch (e) {
			if (e.name === "AbortError") return;
		}
		navigator.clipboard?.writeText && await navigator.clipboard.writeText(n.url);
	}
}), e("tup-place-photo", class e extends HTMLElement {
	static observedAttributes = [
		"src",
		"alt",
		"caption",
		"fallback-src"
	];
	static #e = null;
	static #t = [];
	static #n = 0;
	static #r = null;
	connectedCallback() {
		this.#i(), this.#a(), this.#o();
	}
	attributeChangedCallback() {
		this.isConnected && (this.#i(), this.#a(), this.#o());
	}
	#i() {
		let e = this.getAttribute("src") ?? "", n = this.getAttribute("alt") ?? "", r = this.hasAttribute("parking") ? "<span class=\"place-photo-parking\" aria-hidden=\"true\">P</span>" : "";
		this.innerHTML = `
      <div class="place-hero-home">
        <figure class="place-hero">
          <button
            type="button"
            class="hero-image-trigger"
            data-lightbox
            aria-label="${t(n ? `Powiększ: ${n}` : "Powiększ zdjęcie")}"
          >
            <img
              class="hero-image-img"
              src="${t(e)}"
              alt="${t(n)}"
              width="800"
              height="450"
            />

            ${r}
          </button>
        </figure>
      </div>
    `;
	}
	#a() {
		let e = this.querySelector(".hero-image-img"), t = this.getAttribute("fallback-src");
		!e || !t || (e.addEventListener("error", () => {
			e.dataset.fallbackApplied !== "true" && (e.dataset.fallbackApplied = "true", e.src = t);
		}), e.complete && e.naturalWidth === 0 && (e.dataset.fallbackApplied = "true", e.src = t));
	}
	#o() {
		let t = this.querySelector("[data-lightbox]");
		!t || t.dataset.bound === "true" || (t.dataset.bound = "true", t.addEventListener("click", () => {
			let t = e.#s(), n = t.findIndex((e) => e.host === this);
			n !== -1 && e.#c(t, n);
		}));
	}
	static #s() {
		return [...document.querySelectorAll("tup-place-photo")].map((e) => {
			let t = e.querySelector(".hero-image-img");
			return t?.src ? {
				host: e,
				src: t.src,
				alt: t.alt,
				caption: e.getAttribute("caption") ?? "",
				hideCaption: e.hasAttribute("hide-caption")
			} : null;
		}).filter(Boolean);
	}
	static #c(t, n) {
		let r = e.#l();
		e.#t = t, e.#n = n, e.#m(), r.open || r.showModal();
	}
	static #l() {
		if (e.#e?.isConnected) return e.#e;
		let t = document.getElementById("tup-photo-lightbox");
		return t || (t = document.createElement("dialog"), t.id = "tup-photo-lightbox", t.className = "hero-lightbox", t.setAttribute("aria-label", "Powiększone zdjęcie"), t.innerHTML = "\n        <button\n          type=\"button\"\n          class=\"hero-lightbox-close\"\n          aria-label=\"Zamknij\"\n        >\n          &times;\n        </button>\n\n        <button\n          type=\"button\"\n          class=\"hero-lightbox-nav hero-lightbox-nav--prev\"\n          data-lightbox-prev\n          aria-label=\"Poprzednie zdjęcie\"\n          hidden\n        ></button>\n\n        <button\n          type=\"button\"\n          class=\"hero-lightbox-nav hero-lightbox-nav--next\"\n          data-lightbox-next\n          aria-label=\"Następne zdjęcie\"\n          hidden\n        ></button>\n\n        <div class=\"hero-lightbox-body\">\n          <img class=\"hero-lightbox-img\" src=\"\" alt=\"\" />\n          <p class=\"hero-lightbox-caption\" hidden></p>\n        </div>\n      ", document.body.appendChild(t)), e.#e = t, e.#u(t), t;
	}
	static #u(t) {
		t.dataset.bound !== "true" && (t.dataset.bound = "true", t.querySelector(".hero-lightbox-close")?.addEventListener("click", () => t.close()), t.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => e.#p(-1)), t.querySelector("[data-lightbox-next]")?.addEventListener("click", () => e.#p(1)), t.addEventListener("click", (e) => {
			e.target === t && t.close();
		}), t.addEventListener("pointerdown", (t) => {
			e.#d(t.target) && (e.#r = {
				pointerId: t.pointerId,
				x: t.clientX,
				y: t.clientY,
				pointerType: t.pointerType
			});
		}), t.addEventListener("pointerup", (n) => {
			let r = e.#r;
			if (e.#r = null, !r || r.pointerId !== n.pointerId) return;
			let i = n.clientX - r.x, a = n.clientY - r.y, o = Math.hypot(i, a);
			if (Math.abs(i) > 48 && Math.abs(i) > Math.abs(a) * 1.5) {
				e.#p(i > 0 ? -1 : 1);
				return;
			}
			o < 10 && e.#f(r.pointerType) && t.close();
		}), t.addEventListener("pointercancel", () => {
			e.#r = null;
		}));
	}
	static #d(e) {
		return !!e.closest(".hero-lightbox-body");
	}
	static #f(e) {
		return e === "touch" || e === "pen";
	}
	static #p(t) {
		let n = e.#t.length;
		n < 2 || (e.#n = (e.#n + t + n) % n, e.#m());
	}
	static #m() {
		let t = e.#e, n = e.#t[e.#n];
		if (!t || !n) return;
		let r = t.querySelector(".hero-lightbox-img"), i = t.querySelector(".hero-lightbox-caption"), a = t.querySelector("[data-lightbox-prev]"), o = t.querySelector("[data-lightbox-next]"), s = n.caption && !n.hideCaption, c = e.#t.length > 1;
		r.src = n.src, r.alt = n.alt, i && (s ? (i.textContent = n.caption, i.hidden = !1) : (i.textContent = "", i.hidden = !0)), a && (a.hidden = !c), o && (o.hidden = !c);
	}
}), e("tup-badge", class extends HTMLElement {
	static observedAttributes = [
		"building",
		"floor",
		"room",
		"parking",
		"parking-href",
		"variant",
		"navigate"
	];
	connectedCallback() {
		this.#n();
	}
	attributeChangedCallback() {
		this.isConnected && this.#n();
	}
	#e() {
		let e = (this.getAttribute("variant") ?? "default").trim().toLowerCase();
		return [
			"default",
			"compact",
			"minimal"
		].includes(e) ? e : "default";
	}
	#t(e) {
		this.getAttribute("parking-href");
		let t = [
			{
				type: "building",
				label: "Budynek",
				value: this.getAttribute("building") ?? ""
			},
			{
				type: "stairs",
				label: "Piętro",
				value: this.getAttribute("floor") ?? ""
			},
			{
				type: "door",
				label: "Lokal",
				value: this.getAttribute("room") ?? ""
			}
		].filter((e) => e.type === "parking" || e.value), n = {
			type: "brand",
			label: "TupTup",
			value: ""
		}, r = this.hasAttribute("navigate") ? [{
			type: "chevron",
			label: "Dalej",
			value: ">"
		}] : [];
		return t.length > 0 ? [
			n,
			...t,
			...r
		] : [];
	}
	#n() {
		let e = this.#e(), n = this.#t(e);
		if (this.hidden = n.length === 0, n.length === 0) {
			this.innerHTML = "";
			return;
		}
		this.innerHTML = `
      <dl class="place-badge place-badge--${e}" aria-label="Skrót lokalizacji">
        ${n.map((e, r) => `
          <div class="${this.#r(e, n[r + 1])}">
            <dt class="visually-hidden">${t(e.label)}</dt>
            ${this.#i(e)}
          </div>
        `).join("")}
      </dl>
    `;
	}
	#r(e, t) {
		return ["place-badge-item", `place-badge-item--${e.type}`].filter(Boolean).join(" ");
	}
	#i(e) {
		return e.type === "brand" ? "\n        <dd class=\"place-badge-value place-badge-value--icon\">\n          <span class=\"visually-hidden\">TupTup</span>\n        </dd>\n      " : e.type === "chevron" ? "\n        <dd class=\"place-badge-value place-badge-value--chevron\">\n          <svg\n            class=\"place-badge-chevron\"\n            viewBox=\"0 0 10 18\"\n            aria-hidden=\"true\"\n            focusable=\"false\"\n          >\n            <path\n              d=\"M2 2.5L8 9L2 15.5\"\n              fill=\"none\"\n              stroke=\"currentColor\"\n              stroke-width=\"2.4\"\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n            />\n          </svg>\n        </dd>\n      " : e.type === "parking" ? e.href ? `
        <dd class="place-badge-value place-badge-value--icon">
          <a
            class="place-badge-link"
            href="${t(e.href)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Przejdź do parkingu"
          >
            <span class="visually-hidden">Parking</span>
          </a>
        </dd>
      ` : "\n      <dd class=\"place-badge-value place-badge-value--icon\">\n        <span role=\"img\" aria-label=\"Parking\">\n          <span class=\"visually-hidden\">Parking</span>\n        </span>\n      </dd>\n    " : `<dd class="place-badge-value">${t(e.value)}</dd>`;
	}
}), e("tup-place-summary", class extends HTMLElement {
	static observedAttributes = [
		"building",
		"floor",
		"room",
		"parking",
		"parking-href",
		"variant",
		"navigate"
	];
	connectedCallback() {
		this.#e();
	}
	attributeChangedCallback() {
		this.isConnected && this.#e();
	}
	#e() {
		let e = this.getAttribute("building") ?? "", n = this.getAttribute("floor") ?? "", r = this.getAttribute("room") ?? "", i = this.getAttribute("parking-href"), a = this.hasAttribute("parking") || !!i, o = this.hasAttribute("navigate"), s = e || n || r, c = this.getAttribute("variant") ?? "default", l = s ? `
        <tup-badge
          class="place-summary-badge"
          building="${t(e)}"
          floor="${t(n)}"
          room="${t(r)}"
          variant="${t(c)}"
          ${a ? "parking" : ""}
          ${i ? `parking-href="${t(i)}"` : ""}
          ${o ? "navigate" : ""}>
        </tup-badge>
      ` : "";
		this.innerHTML = `
      <section class="place-summary-section" aria-labelledby="place-summary-heading">
        <h2 id="place-summary-heading" class="visually-hidden">
          Lokalizacja
        </h2>

        <div class="place-summary">
          ${l}
        </div>
      </section>
    `;
	}
});
//#endregion
//#region components/tup-route-step.js
var n = {
	door: "door.svg",
	stairs: "stairs.svg",
	user: "reception.svg",
	reception: "reception.svg",
	elevator: "elevator-up.svg",
	left: "turn-left.svg",
	right: "turn-right.svg",
	forward: "forward.svg",
	target: "target.svg"
};
function r(e) {
	let n = String(e ?? ""), r = [], i = /\*\*([^*]+)\*\*/g, a = 0, o;
	for (; (o = i.exec(n)) !== null;) o.index > a && r.push(t(n.slice(a, o.index))), r.push(`<strong class="instruction-step-bold">${t(o[1])}</strong>`), a = o.index + o[0].length;
	return a < n.length && r.push(t(n.slice(a))), r.length ? r.join("") : t(n);
}
function i({ type: e, text: i, distance: a }) {
	let o = n[e] ?? n.forward, s = a ? `<span class="instruction-step-distance">${t(a)}</span>` : "";
	return `
    <li class="instruction-step">
      <div class="instruction-step-icon-wrap" aria-hidden="true">
        <img
          class="instruction-step-icon"
          src="images/icons/${o}"
          alt=""
        />
      </div>

      <span class="instruction-step-text">
        ${r(i)}
      </span>

      ${s}
    </li>
  `;
}
e("tup-route-step", class extends HTMLElement {});
//#endregion
//#region components/tup-route.js
var a = class extends HTMLElement {
	connectedCallback() {
		this.#e();
	}
	#e() {
		let e = [...this.querySelectorAll(":scope > tup-route-step")].map((e) => ({
			type: e.getAttribute("type"),
			text: e.getAttribute("text"),
			distance: e.getAttribute("distance")
		})).map((e) => i(e)).join("");
		this.innerHTML = `
      <section class="place-route-section" aria-labelledby="place-route-heading">
        <h2 id="place-route-heading" class="visually-hidden">
          Trasa
        </h2>

        <div class="route-steps-scroll" tabindex="0">
          <ol class="instruction-steps">
            ${e}
          </ol>
        </div>
      </section>
    `;
	}
};
e("tup-route", a), e("tup-route-steps", class extends a {}), e("tup-navigation-button", class extends HTMLElement {
	connectedCallback() {
		if (this.querySelector("button")) return;
		let e = this.textContent.trim() || "Prowadź";
		this.textContent = "";
		let t = document.createElement("button");
		t.type = "button", t.className = "navigation-button", t.textContent = e, t.addEventListener("click", () => {
			this.dispatchEvent(new CustomEvent("tup:navigate", {
				bubbles: !0,
				composed: !0
			}));
		}), this.append(t);
	}
});
//#endregion
