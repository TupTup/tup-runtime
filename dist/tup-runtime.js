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
		"lat",
		"lng",
		"plus-code",
		"map-href",
		"maps",
		"vcard",
		"preview"
	];
	#e = (e) => {
		e.target.closest("[data-share]") && this.#u();
	};
	connectedCallback() {
		this.addEventListener("click", this.#e), this.#s();
	}
	disconnectedCallback() {
		this.removeEventListener("click", this.#e);
	}
	attributeChangedCallback() {
		this.isConnected && this.#s();
	}
	#t() {
		let e = this.getAttribute("name") ?? "", t = this.getAttribute("address") ?? "", n = this.getAttribute("lat")?.trim() ?? "", r = this.getAttribute("lng")?.trim() ?? "", i = this.getAttribute("plus-code")?.trim() ?? "", a = this.getAttribute("map-href") ?? this.getAttribute("maps");
		return {
			name: e,
			address: t,
			vcard: this.getAttribute("vcard"),
			preview: this.getAttribute("preview"),
			mapsUrl: this.#c({
				address: t,
				lat: n,
				lng: r,
				plusCode: i,
				mapHref: a
			})
		};
	}
	#n(e) {
		this.hasAttribute("sync-title") && e && (document.title = e);
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
		return !e || !n ? "" : `
      <span
        itemprop="geo"
        itemscope
        itemtype="https://schema.org/GeoCoordinates"
        class="visually-hidden"
      >
        <meta itemprop="latitude" content="${t(e)}">
        <meta itemprop="longitude" content="${t(n)}">
      </span>
    `;
	}
	#a(e, n) {
		return e ? n ? `
        <a
          href="${t(n)}"
          class="place-address-link"
          target="_blank"
          rel="noopener noreferrer"
          itemprop="address"
        >
          <span class="place-address-pin" aria-hidden="true"></span>
          <span class="place-address-text">${t(e)}</span>
        </a>
      ` : `
      <span class="place-address-pin" aria-hidden="true"></span>
      <span class="place-address-text" itemprop="address">${t(e)}</span>
    ` : "";
	}
	#o(e) {
		return e ? `
      <a
        href="${t(e)}"
        download
        class="icon-button icon-button--bookmark"
        aria-label="Zapisz kontakt"
      ></a>
    ` : "";
	}
	#s() {
		let { name: e, address: n, vcard: r, preview: i, mapsUrl: a } = this.#t(), o = this.getAttribute("lat")?.trim() ?? "", s = this.getAttribute("lng")?.trim() ?? "";
		this.#n(e);
		let c = this.#r(i), l = this.#a(n, a), u = this.#o(r), d = this.#i(o, s), f = e ? `<h1 class="place-name" itemprop="name">${t(e)}</h1>` : "";
		this.innerHTML = `
      <header class="sheet-header">

        <div
          class="place-header"
          itemscope
          itemtype="https://schema.org/Place"
        >
          ${c}

          <div class="place-header-text">
            ${f}

            <div class="place-address-row">
              <address class="place-address">
                ${l}
              </address>
            </div>

            ${d}
          </div>
        </div>

        <div class="sheet-actions">
          ${u}

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
	#c({ address: e, lat: t, lng: n, plusCode: r, mapHref: i }) {
		return i || (t && n ? this.#l(`${t},${n}`) : r ? this.#l(r) : e ? this.#l(e) : null);
	}
	#l(e) {
		return `https://maps.google.com/?q=${encodeURIComponent(e)}`;
	}
	async #u() {
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
		let e = this.getAttribute("src") ?? "", n = this.getAttribute("alt") ?? "", r = this.getAttribute("caption") ?? "", i = r && !this.hasAttribute("hide-caption"), a = this.hasAttribute("parking") ? "<span class=\"place-photo-parking\" aria-hidden=\"true\">P</span>" : "", o = i ? `<figcaption class="visually-hidden">${t(r)}</figcaption>` : "";
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

            ${a}
          </button>

          ${o}
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
		"variant"
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
		].filter((e) => e.type === "parking" || e.value);
		return t.length > 0 ? t : [];
	}
	#n() {
		let e = this.#e(), t = this.#t(e);
		if (this.hidden = t.length === 0, t.length === 0) {
			this.innerHTML = "";
			return;
		}
		this.innerHTML = `
      <dl class="place-badge place-badge--${e}" aria-label="Skrót lokalizacji">
        ${t.map((e, n) => this.#i(e, t[n + 1])).join("")}
      </dl>
    `;
	}
	#r(e, t) {
		return ["place-badge-item", `place-badge-item--${e.type}`].filter(Boolean).join(" ");
	}
	#i(e, n) {
		return `
      <div class="${this.#r(e, n)}">
        <dt class="visually-hidden">${t(e.label)}</dt>
        ${this.#a(e)}
      </div>
    `;
	}
	#a(e) {
		return e.type === "parking" ? e.href ? `
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
      ` : "\n      <dd class=\"place-badge-value place-badge-value--icon\">\n        <span class=\"visually-hidden\">Parking</span>\n      </dd>\n    " : `<dd class="place-badge-value">${t(e.value)}</dd>`;
	}
}), e("tup-place-summary", class extends HTMLElement {
	#e = null;
	static observedAttributes = [
		"building",
		"floor",
		"room",
		"parking",
		"parking-href",
		"variant"
	];
	connectedCallback() {
		this.#e ||= `place-summary-heading-${crypto.randomUUID()}`, this.#t();
	}
	attributeChangedCallback() {
		this.isConnected && this.#t();
	}
	#t() {
		let e = this.getAttribute("building") ?? "", n = this.getAttribute("floor") ?? "", r = this.getAttribute("room") ?? "", i = this.getAttribute("parking-href"), a = this.hasAttribute("parking") || !!i, o = e || n || r, s = this.getAttribute("variant") ?? "default", c = o ? `
        <tup-badge
          class="place-summary-badge"
          building="${t(e)}"
          floor="${t(n)}"
          room="${t(r)}"
          variant="${t(s)}"
          ${a ? "parking" : ""}
          ${i ? `parking-href="${t(i)}"` : ""}>
        </tup-badge>
      ` : "";
		this.innerHTML = `
      <section class="place-summary-section" aria-labelledby="${this.#e}">
        <h2 id="${this.#e}" class="visually-hidden">
          Lokalizacja
        </h2>

        <div class="place-summary">
          ${c}
        </div>
      </section>
    `;
	}
});
//#endregion
//#region components/tup-route-step.js
function n(e) {
	let n = String(e ?? ""), r = [], i = /\*\*([^*]+)\*\*/g, a = 0, o;
	for (; (o = i.exec(n)) !== null;) o.index > a && r.push(t(n.slice(a, o.index))), r.push(`<strong class="route-step-bold">${t(o[1])}</strong>`), a = o.index + o[0].length;
	return a < n.length && r.push(t(n.slice(a))), r.length ? r.join("") : t(n);
}
var r = {
	building: "Budynek",
	entrance: "Wejście",
	hand: "Ochrona",
	reception: "Recepcja",
	stairs: "Schody",
	door: "Drzwi",
	forward: "Dalej"
};
function i(e) {
	return r[e] ?? "Krok";
}
var a = {
	right: {
		position: "after",
		symbol: "→",
		label: "po prawej"
	},
	left: {
		position: "before",
		symbol: "←",
		label: "po lewej"
	},
	up: {
		position: "after",
		symbol: "↑",
		label: "naprzeciwko"
	},
	down: {
		position: "after",
		symbol: "↓",
		label: "niżej"
	}
};
function o(e) {
	return a[String(e ?? "").trim().toLowerCase()] ?? null;
}
function s(e) {
	return String(e ?? "").replace(/\*\*([^*]+)\*\*/g, "$1");
}
function c(e, r) {
	let i = o(r);
	if (!i) return n(e);
	let a = n(e), s = `<span class="route-step-direction" aria-hidden="true">${t(i.symbol)}</span>`;
	return i.position === "before" ? `${s}<span class="route-step-value-text">${a}</span>` : `<span class="route-step-value-text">${a}</span>${s}`;
}
function l(e, t, n, r) {
	let a = i(e || "forward"), c = String(t ?? "").trim(), l = s(n).trim(), u = o(r), d = [c, u && l ? `${l} ${u.label}` : l].filter(Boolean);
	return d.length ? d.join(": ") : a;
}
function u(e, n, r) {
	let i = c(n, r), a = !!String(e ?? "").trim(), o = a ? t(e) : "";
	return `
    <span class="route-step-text">
      <span class="${a ? "route-step-label" : "route-step-label route-step-label--placeholder"}"${a ? "" : " aria-hidden=\"true\""}>${o}</span>
      <span class="route-step-value${r ? " route-step-value--directed" : ""}">${i}</span>
    </span>
  `;
}
function d({ type: e, label: n, text: r, tone: i, emphasis: a, direction: o }) {
	let s = t(e || "forward"), c = i === "warning" || i === "secondary" ? ` route-step--${t(i)}` : "", d = a === "primary" ? " route-step--primary" : "", f = e === "target" ? " route-step--target" : "", p = u(n, r, o);
	return `
    <li class="route-step${c}${d}${f}" aria-label="${t(l(e, n, r, o))}">
      <div class="route-step-icon-wrap" aria-hidden="true">
        <span class="route-step-icon route-step-icon--${s}"></span>
      </div>

      ${p}
    </li>
  `;
}
e("tup-route-step", class extends HTMLElement {});
//#endregion
//#region components/tup-route.js
var f = class extends HTMLElement {
	#e = null;
	connectedCallback() {
		this.#e ||= `place-route-heading-${crypto.randomUUID()}`, this.#t();
	}
	#t() {
		let e = [...this.querySelectorAll(":scope > tup-route-step")].map((e) => ({
			type: e.getAttribute("type"),
			label: e.getAttribute("label"),
			text: e.getAttribute("text"),
			tone: e.getAttribute("tone"),
			emphasis: e.getAttribute("emphasis"),
			direction: e.getAttribute("direction")
		})).map((e) => d(e)).join("");
		this.innerHTML = `
      <section class="place-route-section" aria-labelledby="${this.#e}">
        <h2 id="${this.#e}" class="visually-hidden">
          Trasa
        </h2>

        <div class="route-steps-scroll" tabindex="0">
          <ol class="route-steps">
            ${e}
          </ol>
        </div>
      </section>
    `;
	}
};
e("tup-route", f), e("tup-route-steps", class extends f {}), e("tup-navigation-button", class extends HTMLElement {
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
