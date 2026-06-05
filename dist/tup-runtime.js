//#region components/tup-html.js
function e(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
//#endregion
//#region components/tup-place-header.js
var t = class extends HTMLElement {
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
	#r(t) {
		return t ? `
      <img
        class="place-preview"
        src="${e(t)}"
        alt=""
        aria-hidden="true"
      />
    ` : "";
	}
	#i(t, n) {
		return t ? n ? `
        <a
          href="${e(n)}"
          class="place-address-link"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="place-address-pin" aria-hidden="true"></span>
          <span class="place-address-text">${e(t)}</span>
        </a>
      ` : `
      <span class="place-address-pin" aria-hidden="true"></span>
      <span class="place-address-text">${e(t)}</span>
    ` : "";
	}
	#a(t) {
		return t ? `
      <a
        href="${e(t)}"
        download
        class="icon-button icon-button--bookmark"
        aria-label="Zapisz kontakt"
      ></a>
    ` : "";
	}
	#o() {
		let { name: t, address: n, vcard: r, preview: i, mapsUrl: a } = this.#t();
		this.#n(t);
		let o = this.#r(i), s = this.#i(n, a), c = this.#a(r);
		this.innerHTML = `
      <header class="sheet-header">

        <div class="place-header">
          ${o}

          <div class="place-header-text">
            <h1 class="place-name">${e(t)}</h1>

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
};
customElements.define("tup-place-header", t);
//#endregion
//#region components/tup-place-photo.js?v=20260602-3
var n = class t extends HTMLElement {
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
		let t = this.getAttribute("src") ?? "", n = this.getAttribute("alt") ?? "", r = this.hasAttribute("parking") ? "<span class=\"place-photo-parking\" aria-hidden=\"true\">P</span>" : "";
		this.innerHTML = `
      <div class="place-hero-home">
        <figure class="place-hero">
          <button
            type="button"
            class="hero-image-trigger"
            data-lightbox
            aria-label="${e(n ? `Powiększ: ${n}` : "Powiększ zdjęcie")}"
          >
            <img
              class="hero-image-img"
              src="${e(t)}"
              alt="${e(n)}"
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
		let e = this.querySelector("[data-lightbox]");
		!e || e.dataset.bound === "true" || (e.dataset.bound = "true", e.addEventListener("click", () => {
			let e = t.#s(), n = e.findIndex((e) => e.host === this);
			n !== -1 && t.#c(e, n);
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
	static #c(e, n) {
		let r = t.#l();
		t.#t = e, t.#n = n, t.#m(), r.open || r.showModal();
	}
	static #l() {
		if (t.#e?.isConnected) return t.#e;
		let e = document.getElementById("tup-photo-lightbox");
		return e || (e = document.createElement("dialog"), e.id = "tup-photo-lightbox", e.className = "hero-lightbox", e.setAttribute("aria-label", "Powiększone zdjęcie"), e.innerHTML = "\n        <button\n          type=\"button\"\n          class=\"hero-lightbox-close\"\n          aria-label=\"Zamknij\"\n        >\n          &times;\n        </button>\n\n        <button\n          type=\"button\"\n          class=\"hero-lightbox-nav hero-lightbox-nav--prev\"\n          data-lightbox-prev\n          aria-label=\"Poprzednie zdjęcie\"\n          hidden\n        ></button>\n\n        <button\n          type=\"button\"\n          class=\"hero-lightbox-nav hero-lightbox-nav--next\"\n          data-lightbox-next\n          aria-label=\"Następne zdjęcie\"\n          hidden\n        ></button>\n\n        <div class=\"hero-lightbox-body\">\n          <img class=\"hero-lightbox-img\" src=\"\" alt=\"\" />\n          <p class=\"hero-lightbox-caption\" hidden></p>\n        </div>\n      ", document.body.appendChild(e)), t.#e = e, t.#u(e), e;
	}
	static #u(e) {
		e.dataset.bound !== "true" && (e.dataset.bound = "true", e.querySelector(".hero-lightbox-close")?.addEventListener("click", () => e.close()), e.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => t.#p(-1)), e.querySelector("[data-lightbox-next]")?.addEventListener("click", () => t.#p(1)), e.addEventListener("click", (t) => {
			t.target === e && e.close();
		}), e.addEventListener("pointerdown", (e) => {
			t.#d(e.target) && (t.#r = {
				pointerId: e.pointerId,
				x: e.clientX,
				y: e.clientY,
				pointerType: e.pointerType
			});
		}), e.addEventListener("pointerup", (n) => {
			let r = t.#r;
			if (t.#r = null, !r || r.pointerId !== n.pointerId) return;
			let i = n.clientX - r.x, a = n.clientY - r.y, o = Math.hypot(i, a);
			if (Math.abs(i) > 48 && Math.abs(i) > Math.abs(a) * 1.5) {
				t.#p(i > 0 ? -1 : 1);
				return;
			}
			o < 10 && t.#f(r.pointerType) && e.close();
		}), e.addEventListener("pointercancel", () => {
			t.#r = null;
		}));
	}
	static #d(e) {
		return !!e.closest(".hero-lightbox-body");
	}
	static #f(e) {
		return e === "touch" || e === "pen";
	}
	static #p(e) {
		let n = t.#t.length;
		n < 2 || (t.#n = (t.#n + e + n) % n, t.#m());
	}
	static #m() {
		let e = t.#e, n = t.#t[t.#n];
		if (!e || !n) return;
		let r = e.querySelector(".hero-lightbox-img"), i = e.querySelector(".hero-lightbox-caption"), a = e.querySelector("[data-lightbox-prev]"), o = e.querySelector("[data-lightbox-next]"), s = n.caption && !n.hideCaption, c = t.#t.length > 1;
		r.src = n.src, r.alt = n.alt, i && (s ? (i.textContent = n.caption, i.hidden = !1) : (i.textContent = "", i.hidden = !0)), a && (a.hidden = !c), o && (o.hidden = !c);
	}
};
customElements.define("tup-place-photo", n);
//#endregion
//#region components/tup-badge.js?v=20260603-5
var r = class extends HTMLElement {
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
		let t = this.#e(), n = this.#t(t);
		if (this.hidden = n.length === 0, n.length === 0) {
			this.innerHTML = "";
			return;
		}
		this.innerHTML = `
      <dl class="place-badge place-badge--${t}" aria-label="Skrót lokalizacji">
        ${n.map((t, r) => `
          <div class="${this.#r(t, n[r + 1])}">
            <dt class="visually-hidden">${e(t.label)}</dt>
            ${this.#i(t)}
          </div>
        `).join("")}
      </dl>
    `;
	}
	#r(e, t) {
		return ["place-badge-item", `place-badge-item--${e.type}`].filter(Boolean).join(" ");
	}
	#i(t) {
		return t.type === "brand" ? "\n        <dd class=\"place-badge-value place-badge-value--icon\">\n          <span class=\"visually-hidden\">TupTup</span>\n        </dd>\n      " : t.type === "chevron" ? "\n        <dd class=\"place-badge-value place-badge-value--chevron\">\n          <svg\n            class=\"place-badge-chevron\"\n            viewBox=\"0 0 10 18\"\n            aria-hidden=\"true\"\n            focusable=\"false\"\n          >\n            <path\n              d=\"M2 2.5L8 9L2 15.5\"\n              fill=\"none\"\n              stroke=\"currentColor\"\n              stroke-width=\"2.4\"\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n            />\n          </svg>\n        </dd>\n      " : t.type === "parking" ? t.href ? `
        <dd class="place-badge-value place-badge-value--icon">
          <a
            class="place-badge-link"
            href="${e(t.href)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Przejdź do parkingu"
          >
            <span class="visually-hidden">Parking</span>
          </a>
        </dd>
      ` : "\n      <dd class=\"place-badge-value place-badge-value--icon\">\n        <span role=\"img\" aria-label=\"Parking\">\n          <span class=\"visually-hidden\">Parking</span>\n        </span>\n      </dd>\n    " : `<dd class="place-badge-value">${e(t.value)}</dd>`;
	}
};
customElements.define("tup-badge", r);
//#endregion
//#region components/tup-place-summary.js?v=20260603-4
var i = class extends HTMLElement {
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
		let t = this.getAttribute("building") ?? "", n = this.getAttribute("floor") ?? "", r = this.getAttribute("room") ?? "", i = this.getAttribute("parking-href"), a = this.hasAttribute("parking") || !!i, o = this.hasAttribute("navigate"), s = t || n || r, c = this.getAttribute("variant") ?? "default", l = s ? `
        <tup-badge
          class="place-summary-badge"
          building="${e(t)}"
          floor="${e(n)}"
          room="${e(r)}"
          variant="${e(c)}"
          ${a ? "parking" : ""}
          ${i ? `parking-href="${e(i)}"` : ""}
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
};
customElements.define("tup-place-summary", i);
//#endregion
//#region components/tup-route-step.js
var a = {
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
function o(t) {
	let n = String(t ?? ""), r = [], i = /\*\*([^*]+)\*\*/g, a = 0, o;
	for (; (o = i.exec(n)) !== null;) o.index > a && r.push(e(n.slice(a, o.index))), r.push(`<strong class="instruction-step-bold">${e(o[1])}</strong>`), a = o.index + o[0].length;
	return a < n.length && r.push(e(n.slice(a))), r.length ? r.join("") : e(n);
}
function s({ type: t, text: n, distance: r }) {
	let i = a[t] ?? a.forward, s = r ? `<span class="instruction-step-distance">${e(r)}</span>` : "";
	return `
    <li class="instruction-step">
      <div class="instruction-step-icon-wrap" aria-hidden="true">
        <img
          class="instruction-step-icon"
          src="/images/icons/${i}"
          alt=""
        />
      </div>

      <span class="instruction-step-text">
        ${o(n)}
      </span>

      ${s}
    </li>
  `;
}
var c = class extends HTMLElement {};
customElements.define("tup-route-step", c);
//#endregion
//#region components/tup-route.js
var l = class extends HTMLElement {
	connectedCallback() {
		this.#e();
	}
	#e() {
		let e = [...this.querySelectorAll(":scope > tup-route-step")].map((e) => ({
			type: e.getAttribute("type"),
			text: e.getAttribute("text"),
			distance: e.getAttribute("distance")
		})).map((e) => s(e)).join("");
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
customElements.define("tup-route", l);
//#endregion
//#region components/tup-navigation-button.js
var u = class extends HTMLElement {
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
};
customElements.define("tup-navigation-button", u);
//#endregion
//#region components/tup-badge.js
var d = class extends HTMLElement {
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
		let t = this.#e(), n = this.#t(t);
		if (this.hidden = n.length === 0, n.length === 0) {
			this.innerHTML = "";
			return;
		}
		this.innerHTML = `
      <dl class="place-badge place-badge--${t}" aria-label="Skrót lokalizacji">
        ${n.map((t, r) => `
          <div class="${this.#r(t, n[r + 1])}">
            <dt class="visually-hidden">${e(t.label)}</dt>
            ${this.#i(t)}
          </div>
        `).join("")}
      </dl>
    `;
	}
	#r(e, t) {
		return ["place-badge-item", `place-badge-item--${e.type}`].filter(Boolean).join(" ");
	}
	#i(t) {
		return t.type === "brand" ? "\n        <dd class=\"place-badge-value place-badge-value--icon\">\n          <span class=\"visually-hidden\">TupTup</span>\n        </dd>\n      " : t.type === "chevron" ? "\n        <dd class=\"place-badge-value place-badge-value--chevron\">\n          <svg\n            class=\"place-badge-chevron\"\n            viewBox=\"0 0 10 18\"\n            aria-hidden=\"true\"\n            focusable=\"false\"\n          >\n            <path\n              d=\"M2 2.5L8 9L2 15.5\"\n              fill=\"none\"\n              stroke=\"currentColor\"\n              stroke-width=\"2.4\"\n              stroke-linecap=\"round\"\n              stroke-linejoin=\"round\"\n            />\n          </svg>\n        </dd>\n      " : t.type === "parking" ? t.href ? `
        <dd class="place-badge-value place-badge-value--icon">
          <a
            class="place-badge-link"
            href="${e(t.href)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Przejdź do parkingu"
          >
            <span class="visually-hidden">Parking</span>
          </a>
        </dd>
      ` : "\n      <dd class=\"place-badge-value place-badge-value--icon\">\n        <span role=\"img\" aria-label=\"Parking\">\n          <span class=\"visually-hidden\">Parking</span>\n        </span>\n      </dd>\n    " : `<dd class="place-badge-value">${e(t.value)}</dd>`;
	}
};
customElements.define("tup-badge", d);
//#endregion
//#region components/tup-route-steps.js
var f = class extends l {};
customElements.define("tup-route-steps", f);
//#endregion
//#region components/tup-place-photo.js
var p = class t extends HTMLElement {
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
		let t = this.getAttribute("src") ?? "", n = this.getAttribute("alt") ?? "", r = this.hasAttribute("parking") ? "<span class=\"place-photo-parking\" aria-hidden=\"true\">P</span>" : "";
		this.innerHTML = `
      <div class="place-hero-home">
        <figure class="place-hero">
          <button
            type="button"
            class="hero-image-trigger"
            data-lightbox
            aria-label="${e(n ? `Powiększ: ${n}` : "Powiększ zdjęcie")}"
          >
            <img
              class="hero-image-img"
              src="${e(t)}"
              alt="${e(n)}"
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
		let e = this.querySelector("[data-lightbox]");
		!e || e.dataset.bound === "true" || (e.dataset.bound = "true", e.addEventListener("click", () => {
			let e = t.#s(), n = e.findIndex((e) => e.host === this);
			n !== -1 && t.#c(e, n);
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
	static #c(e, n) {
		let r = t.#l();
		t.#t = e, t.#n = n, t.#m(), r.open || r.showModal();
	}
	static #l() {
		if (t.#e?.isConnected) return t.#e;
		let e = document.getElementById("tup-photo-lightbox");
		return e || (e = document.createElement("dialog"), e.id = "tup-photo-lightbox", e.className = "hero-lightbox", e.setAttribute("aria-label", "Powiększone zdjęcie"), e.innerHTML = "\n        <button\n          type=\"button\"\n          class=\"hero-lightbox-close\"\n          aria-label=\"Zamknij\"\n        >\n          &times;\n        </button>\n\n        <button\n          type=\"button\"\n          class=\"hero-lightbox-nav hero-lightbox-nav--prev\"\n          data-lightbox-prev\n          aria-label=\"Poprzednie zdjęcie\"\n          hidden\n        ></button>\n\n        <button\n          type=\"button\"\n          class=\"hero-lightbox-nav hero-lightbox-nav--next\"\n          data-lightbox-next\n          aria-label=\"Następne zdjęcie\"\n          hidden\n        ></button>\n\n        <div class=\"hero-lightbox-body\">\n          <img class=\"hero-lightbox-img\" src=\"\" alt=\"\" />\n          <p class=\"hero-lightbox-caption\" hidden></p>\n        </div>\n      ", document.body.appendChild(e)), t.#e = e, t.#u(e), e;
	}
	static #u(e) {
		e.dataset.bound !== "true" && (e.dataset.bound = "true", e.querySelector(".hero-lightbox-close")?.addEventListener("click", () => e.close()), e.querySelector("[data-lightbox-prev]")?.addEventListener("click", () => t.#p(-1)), e.querySelector("[data-lightbox-next]")?.addEventListener("click", () => t.#p(1)), e.addEventListener("click", (t) => {
			t.target === e && e.close();
		}), e.addEventListener("pointerdown", (e) => {
			t.#d(e.target) && (t.#r = {
				pointerId: e.pointerId,
				x: e.clientX,
				y: e.clientY,
				pointerType: e.pointerType
			});
		}), e.addEventListener("pointerup", (n) => {
			let r = t.#r;
			if (t.#r = null, !r || r.pointerId !== n.pointerId) return;
			let i = n.clientX - r.x, a = n.clientY - r.y, o = Math.hypot(i, a);
			if (Math.abs(i) > 48 && Math.abs(i) > Math.abs(a) * 1.5) {
				t.#p(i > 0 ? -1 : 1);
				return;
			}
			o < 10 && t.#f(r.pointerType) && e.close();
		}), e.addEventListener("pointercancel", () => {
			t.#r = null;
		}));
	}
	static #d(e) {
		return !!e.closest(".hero-lightbox-body");
	}
	static #f(e) {
		return e === "touch" || e === "pen";
	}
	static #p(e) {
		let n = t.#t.length;
		n < 2 || (t.#n = (t.#n + e + n) % n, t.#m());
	}
	static #m() {
		let e = t.#e, n = t.#t[t.#n];
		if (!e || !n) return;
		let r = e.querySelector(".hero-lightbox-img"), i = e.querySelector(".hero-lightbox-caption"), a = e.querySelector("[data-lightbox-prev]"), o = e.querySelector("[data-lightbox-next]"), s = n.caption && !n.hideCaption, c = t.#t.length > 1;
		r.src = n.src, r.alt = n.alt, i && (s ? (i.textContent = n.caption, i.hidden = !1) : (i.textContent = "", i.hidden = !0)), a && (a.hidden = !c), o && (o.hidden = !c);
	}
};
customElements.define("tup-place-photo", p);
//#endregion
//#region components/tup-place-summary.js
var m = class extends HTMLElement {
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
		let t = this.getAttribute("building") ?? "", n = this.getAttribute("floor") ?? "", r = this.getAttribute("room") ?? "", i = this.getAttribute("parking-href"), a = this.hasAttribute("parking") || !!i, o = this.hasAttribute("navigate"), s = t || n || r, c = this.getAttribute("variant") ?? "default", l = s ? `
        <tup-badge
          class="place-summary-badge"
          building="${e(t)}"
          floor="${e(n)}"
          room="${e(r)}"
          variant="${e(c)}"
          ${a ? "parking" : ""}
          ${i ? `parking-href="${e(i)}"` : ""}
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
};
customElements.define("tup-place-summary", m);
//#endregion
