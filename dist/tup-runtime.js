import { n as e } from "./place-mode-Dd-VvGFI.js";
//#region components/define-custom-element.js
function t(e, t) {
	customElements.get(e) || customElements.define(e, t);
}
//#endregion
//#region components/tup-html.js
function n(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;");
}
t("tup-place-header", class extends HTMLElement {
	static observedAttributes = [
		"name",
		"summary",
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
		e.target.closest("[data-share]") && this.#f();
	};
	connectedCallback() {
		this.addEventListener("click", this.#e), this.#l();
	}
	disconnectedCallback() {
		this.removeEventListener("click", this.#e);
	}
	attributeChangedCallback() {
		this.isConnected && this.#l();
	}
	#t() {
		let e = this.getAttribute("name") ?? "", t = this.getAttribute("summary") ?? "", n = this.getAttribute("address") ?? "", r = this.getAttribute("lat")?.trim() ?? "", i = this.getAttribute("lng")?.trim() ?? "", a = this.getAttribute("plus-code")?.trim() ?? "", o = this.getAttribute("map-href") ?? this.getAttribute("maps");
		return {
			name: e,
			summary: t,
			address: n,
			vcard: this.getAttribute("vcard"),
			preview: this.getAttribute("preview"),
			mapsUrl: this.#u({
				address: n,
				lat: r,
				lng: i,
				plusCode: a,
				mapHref: o
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
        src="${n(e)}"
        alt=""
        aria-hidden="true"
      />
    ` : "";
	}
	#i(e, t) {
		return !e || !t ? "" : `
      <span
        itemprop="geo"
        itemscope
        itemtype="https://schema.org/GeoCoordinates"
        class="visually-hidden"
      >
        <meta itemprop="latitude" content="${n(e)}">
        <meta itemprop="longitude" content="${n(t)}">
      </span>
    `;
	}
	#a(e, t) {
		return e ? t ? `
        <a
          href="${n(t)}"
          class="place-address-link"
          target="_blank"
          rel="noopener noreferrer"
          itemprop="address"
        >
          <span class="place-address-pin" aria-hidden="true"></span>
          <span class="place-address-text">${n(e)}</span>
        </a>
      ` : `
      <span class="place-address-pin" aria-hidden="true"></span>
      <span class="place-address-text" itemprop="address">${n(e)}</span>
    ` : "";
	}
	#o(e) {
		return e ? `
      <a
        href="${n(e)}"
        download
        class="icon-button icon-button--bookmark"
        aria-label="Zapisz kontakt"
      ></a>
    ` : "";
	}
	#s(e) {
		return String(e ?? "").split(/\s*[·•|]\s*/).map((e) => e.trim()).filter(Boolean);
	}
	#c(e) {
		let t = this.#s(e);
		if (!t.length) return "";
		let r = t.map((e, r) => {
			let i = `
          <span class="place-header-summary-badge">${n(e)}</span>
        `;
			return r === t.length - 1 ? i : `
          ${i}
          <span class="place-header-summary-sep" aria-hidden="true">·</span>
        `;
		}).join("");
		return `
      <div class="place-header-summary-row">
        <span class="place-address-pin place-address-pin--spacer" aria-hidden="true"></span>
        <div
          class="place-header-summary"
          aria-label="${n(t.join(" · "))}"
        >
          ${r}
        </div>
      </div>
    `;
	}
	#l() {
		let { name: e, summary: t, address: r, vcard: i, preview: a, mapsUrl: o } = this.#t(), s = this.getAttribute("lat")?.trim() ?? "", c = this.getAttribute("lng")?.trim() ?? "";
		this.#n(e);
		let l = this.#r(a), u = this.#a(r, o), d = this.#o(i), f = this.#i(s, c), p = e ? `<h1 class="place-name" itemprop="name">${n(e)}</h1>` : "", m = this.#c(t);
		this.innerHTML = `
      <header class="sheet-header">

        <div
          class="place-header"
          itemscope
          itemtype="https://schema.org/Place"
        >
          ${l}

          <div class="place-header-text">
            ${p}

            <div class="place-address-row">
              <address class="place-address">
                ${u}
              </address>
            </div>

            ${m}

            ${f}
          </div>
        </div>

        <div class="sheet-actions">
          ${d}

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
	#u({ address: e, lat: t, lng: n, plusCode: r, mapHref: i }) {
		return i || (t && n ? this.#d(`${t},${n}`) : r ? this.#d(r) : e ? this.#d(e) : null);
	}
	#d(e) {
		return `https://maps.google.com/?q=${encodeURIComponent(e)}`;
	}
	async #f() {
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
}), t("tup-place-photo", class e extends HTMLElement {
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
		let e = this.getAttribute("src") ?? "", t = this.getAttribute("alt") ?? "", r = this.getAttribute("caption") ?? "", i = r && !this.hasAttribute("hide-caption"), a = this.hasAttribute("parking") ? "<span class=\"place-photo-parking\" aria-hidden=\"true\">P</span>" : "", o = i ? `<figcaption class="visually-hidden">${n(r)}</figcaption>` : "";
		this.innerHTML = `
      <div class="place-hero-home">
        <figure class="place-hero">
          <button
            type="button"
            class="hero-image-trigger"
            data-lightbox
            aria-label="${n(t ? `Powiększ: ${t}` : "Powiększ zdjęcie")}"
          >
            <img
              class="hero-image-img"
              src="${n(e)}"
              alt="${n(t)}"
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
}), t("tup-badge", class extends HTMLElement {
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
	#i(e, t) {
		return `
      <div class="${this.#r(e, t)}">
        <dt class="visually-hidden">${n(e.label)}</dt>
        ${this.#a(e)}
      </div>
    `;
	}
	#a(e) {
		return e.type === "parking" ? e.href ? `
        <dd class="place-badge-value place-badge-value--icon">
          <a
            class="place-badge-link"
            href="${n(e.href)}"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Przejdź do parkingu"
          >
            <span class="visually-hidden">Parking</span>
          </a>
        </dd>
      ` : "\n      <dd class=\"place-badge-value place-badge-value--icon\">\n        <span class=\"visually-hidden\">Parking</span>\n      </dd>\n    " : `<dd class="place-badge-value">${n(e.value)}</dd>`;
	}
}), t("tup-place-summary", class extends HTMLElement {
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
		let e = this.getAttribute("building") ?? "", t = this.getAttribute("floor") ?? "", r = this.getAttribute("room") ?? "", i = this.getAttribute("parking-href"), a = this.hasAttribute("parking") || !!i, o = e || t || r, s = this.getAttribute("variant") ?? "default", c = o ? `
        <tup-badge
          class="place-summary-badge"
          building="${n(e)}"
          floor="${n(t)}"
          room="${n(r)}"
          variant="${n(s)}"
          ${a ? "parking" : ""}
          ${i ? `parking-href="${n(i)}"` : ""}>
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
function r(e) {
	let t = String(e ?? ""), r = [], i = /\*\*([^*]+)\*\*/g, a = 0, o;
	for (; (o = i.exec(t)) !== null;) o.index > a && r.push(n(t.slice(a, o.index))), r.push(`<strong class="route-step-bold">${n(o[1])}</strong>`), a = o.index + o[0].length;
	return a < t.length && r.push(n(t.slice(a))), r.length ? r.join("") : n(t);
}
var i = {
	building: "Budynek",
	entrance: "Wejście",
	hand: "Ochrona",
	reception: "Recepcja",
	stairs: "Schody",
	door: "Drzwi",
	start: "Start",
	left: "Skręć w lewo",
	right: "Skręć w prawo",
	forward: "Idź prosto",
	straight: "Idź prosto",
	"floor-up": "Piętro wyżej",
	"floor-down": "Piętro niżej",
	elevator: "Piętro",
	key: "Kod"
}, a = "****", o = 15;
function s(e) {
	let t = Number.parseInt(String(e ?? "").trim(), 10);
	return !Number.isFinite(t) || t <= 0 ? o : t;
}
function c(e) {
	return i[e] ?? "Krok";
}
var l = {
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
function u(e) {
	return l[String(e ?? "").trim().toLowerCase()] ?? null;
}
function d(e) {
	return String(e ?? "").replace(/\*\*([^*]+)\*\*/g, "$1");
}
function f(e, t) {
	let i = u(t);
	if (!i) return r(e);
	let a = r(e), o = `<span class="route-step-direction" aria-hidden="true">${n(i.symbol)}</span>`;
	return i.position === "before" ? `${o}<span class="route-step-value-text">${a}</span>` : `<span class="route-step-value-text">${a}</span>${o}`;
}
function p(e, t, n, r) {
	let i = c(e || "forward"), a = String(t ?? "").trim(), o = d(n).trim(), s = u(r), l = [a, s && o ? `${o} ${s.label}` : o].filter(Boolean);
	return l.length ? l.join(": ") : i;
}
function m(e, t, r) {
	let i = f(t, r);
	return `
    <span class="route-step-text">
      ${String(e ?? "").trim() ? `<span class="route-step-label">${n(e)}</span>` : ""}
      <span class="route-step-value${r ? " route-step-value--directed" : ""}">${i}</span>
    </span>
  `;
}
function h({ type: e, text: t, code: r, codeHideAfter: i }) {
	let o = n(e || "key"), c = String(t ?? "").trim() || "Wprowadź kod";
	return `
    <li
      class="route-step route-step--secret"
      data-code="${n(r)}"
      data-hide-after="${s(i)}"
      aria-label="${n(`${c}: kod ukryty`)}"
    >
      <div class="route-step-icon-wrap" aria-hidden="true">
        <span class="route-step-icon route-step-icon--${o}"></span>
      </div>

      <span class="route-step-text route-step-text--secret">
        <span class="route-step-value">
          ${n(c)}
          <span class="route-step-code" aria-live="polite">${n(a)}</span>
        </span>

        <button
          type="button"
          class="route-step-reveal"
          aria-label="Pokaż kod"
          aria-pressed="false"
        ></button>
      </span>
    </li>
  `;
}
function g(e) {
	e.querySelectorAll(".route-step--secret").forEach((e) => {
		let t = e.dataset.code ?? "", n = e.querySelector(".route-step-code"), r = e.querySelector(".route-step-reveal");
		if (!t || !n || !r || r.dataset.bound === "true") return;
		r.dataset.bound = "true";
		let i = (e.getAttribute("aria-label") ?? "Wprowadź kod: kod ukryty").replace(/: kod ukryty$/, "").trim() || "Wprowadź kod", o = s(e.dataset.hideAfter) * 1e3, c = null;
		function l() {
			c !== null && (clearTimeout(c), c = null);
		}
		function u() {
			l(), n.textContent = a, r.setAttribute("aria-pressed", "false"), r.setAttribute("aria-label", "Pokaż kod"), r.classList.remove("route-step-reveal--visible"), e.setAttribute("aria-label", `${i}: kod ukryty`);
		}
		function d() {
			l(), n.textContent = t, r.setAttribute("aria-pressed", "true"), r.setAttribute("aria-label", "Ukryj kod"), r.classList.add("route-step-reveal--visible"), e.setAttribute("aria-label", `${i}: ${t}`), c = setTimeout(u, o);
		}
		r.addEventListener("click", () => {
			if (r.getAttribute("aria-pressed") === "true") {
				u();
				return;
			}
			d();
		});
	});
}
function _({ type: e, label: t, text: r, tone: i, emphasis: a, direction: o, code: s, codeHideAfter: c }) {
	if (s) return h({
		type: e,
		text: r,
		code: s,
		codeHideAfter: c
	});
	let l = n(e || "forward"), u = i === "warning" || i === "secondary" ? ` route-step--${n(i)}` : "", d = a === "primary" ? " route-step--primary" : "", f = e === "target" ? " route-step--target" : "", g = m(t, r, o);
	return `
    <li class="route-step${u}${d}${f}" aria-label="${n(p(e, t, r, o))}">
      <div class="route-step-icon-wrap" aria-hidden="true">
        <span class="route-step-icon route-step-icon--${l}"></span>
      </div>

      ${g}
    </li>
  `;
}
t("tup-route-step", class extends HTMLElement {});
//#endregion
//#region components/tup-route.js
function v(e) {
	return {
		type: e.getAttribute("type"),
		label: e.getAttribute("label") || void 0,
		text: e.getAttribute("text"),
		tone: e.getAttribute("tone") || void 0,
		emphasis: e.getAttribute("emphasis") || void 0,
		direction: e.getAttribute("direction") || void 0,
		code: e.getAttribute("code") || void 0,
		codeHideAfter: e.getAttribute("code-hide-after") || void 0
	};
}
var y = class extends HTMLElement {
	#e = null;
	#t = [];
	#n = !1;
	connectedCallback() {
		this.#e ||= `place-route-heading-${crypto.randomUUID()}`, this.#n ||= (this.#t = this.#r(), !0), this.#i();
	}
	#r() {
		return [...this.querySelectorAll(":scope > tup-route-step")].map(v);
	}
	getSteps() {
		return this.#t.map((e) => ({ ...e }));
	}
	setSteps(e) {
		this.#t = e.map((e) => ({ ...e })), this.isConnected && this.#i();
	}
	refresh() {
		this.isConnected && this.#i();
	}
	#i() {
		let e = this.#t.map((e) => _(e)).join("");
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
    `, g(this);
	}
};
//#endregion
//#region index.js
t("tup-route", y), t("tup-route-steps", class extends y {}), t("tup-navigation-button", class extends HTMLElement {
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
}), t("tup-footer", class extends HTMLElement {
	connectedCallback() {
		this.querySelector(".place-footer") || (this.innerHTML = "\n      <footer class=\"place-footer\">\n        <span class=\"place-footer-logo\" role=\"img\" aria-label=\"TupTup\"></span>\n      </footer>\n    ");
	}
}), e();
//#endregion
