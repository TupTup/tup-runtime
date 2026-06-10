//#region js/place-route-generator.js
function e(e) {
	return e.replace(/\b(C\d+)\b/gi, "**$1**").replace(/\b(lokal\s*\d+)\b/gi, (e, t) => `**${t}**`).replace(/\b(\d+)\s*pi[eę]tro\b/gi, "**$1 piętro**");
}
function t(t, n, r) {
	t.toLowerCase();
	let i = "straight", a;
	n === 0 || /wejd|budynek|bram|klatk|drzwi|C\d+/i.test(t) ? i = "start" : n === r - 1 || /lokal|cel\b|miejsce docel|docelow/i.test(t) ? i = "target" : /ochron|wind|recepc|aktywacj/i.test(t) ? (i = "hand", a = "warning") : /kod|pin|klawiat|hasło/i.test(t) ? i = "key" : /pi[eę]tro|wjedź na|jedź na|poziom/i.test(t) ? i = "floor-up" : /w lewo|skr[eę][ćc] w lewo/i.test(t) ? i = "left" : /w prawo|skr[eę][ćc] w prawo/i.test(t) ? i = "right" : /prosto|korytarz|idź do|idz do/i.test(t) && (i = "straight");
	let o = {
		type: i,
		text: e(t)
	};
	return a && (o.tone = a), o;
}
function n(e) {
	let n = String(e ?? "").trim();
	if (!n) return [];
	let r = n.split(/\n+|(?<=[.!?])\s+/).map((e) => e.trim()).filter(Boolean);
	return r.length ? r.map((e, n) => t(e, n, r.length)) : [];
}
function r(e) {
	return (e ?? []).map((e) => String(e.text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1")).filter(Boolean).join(" ");
}
//#endregion
//#region js/place-model.js
var i = "tuptup:place:";
function a(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function o() {
	return document.querySelector("#place");
}
function s(e) {
	return e ? e.querySelector(".sheet-content") || e : null;
}
function c(e = o()) {
	return e?.getAttribute("data-place-id")?.trim() || window.location.pathname.split("/").filter(Boolean).pop() || "default";
}
function l(e, t) {
	let n = e.getAttribute(t);
	if (!(n === null || n === "")) return n;
}
function u(e) {
	return {
		type: e.getAttribute("type") || "forward",
		label: l(e, "label"),
		text: e.getAttribute("text") || "",
		tone: l(e, "tone"),
		emphasis: l(e, "emphasis"),
		direction: l(e, "direction"),
		code: l(e, "code"),
		codeHideAfter: l(e, "code-hide-after")
	};
}
function d(e) {
	return e ? typeof e.getSteps == "function" ? e.getSteps() : [...e.querySelectorAll(":scope > tup-route-step")].map(u) : [];
}
function f(e = o()) {
	let t = s(e);
	if (!t) return null;
	let n = t.querySelector("tup-place-header"), i = t.querySelector("tup-place-photo"), a = d(t.querySelector("tup-route"));
	return {
		id: c(e),
		header: {
			name: n?.getAttribute("name") || "",
			summary: n?.getAttribute("summary") || "",
			address: n?.getAttribute("address") || "",
			lat: l(n, "lat"),
			lng: l(n, "lng"),
			plusCode: l(n, "plus-code"),
			mapHref: l(n, "map-href") || l(n, "maps"),
			vcard: l(n, "vcard"),
			preview: l(n, "preview")
		},
		photo: {
			src: i?.getAttribute("src") || "",
			alt: i?.getAttribute("alt") || "",
			caption: l(i, "caption"),
			fallbackSrc: l(i, "fallback-src")
		},
		routeDescription: r(a),
		steps: a
	};
}
function p(e, t, n) {
	if (n == null || n === "") {
		e.removeAttribute(t);
		return;
	}
	e.setAttribute(t, n);
}
function m(e, t) {
	!e || !t || (p(e, "name", t.name), p(e, "summary", t.summary), p(e, "address", t.address), p(e, "lat", t.lat), p(e, "lng", t.lng), p(e, "plus-code", t.plusCode), p(e, "map-href", t.mapHref), p(e, "vcard", t.vcard), p(e, "preview", t.preview));
}
function h(e, t) {
	!e || !t || (p(e, "src", t.src), p(e, "alt", t.alt), p(e, "caption", t.caption), p(e, "fallback-src", t.fallbackSrc));
}
function g(e) {
	let t = [`type="${a(e.type || "forward")}"`, `text="${a(e.text || "")}"`];
	return e.label && t.push(`label="${a(e.label)}"`), e.tone && t.push(`tone="${a(e.tone)}"`), e.emphasis && t.push(`emphasis="${a(e.emphasis)}"`), e.direction && t.push(`direction="${a(e.direction)}"`), e.code && t.push(`code="${a(e.code)}"`), e.codeHideAfter && t.push(`code-hide-after="${a(e.codeHideAfter)}"`), `<tup-route-step ${t.join(" ")}></tup-route-step>`;
}
function _(e, t) {
	if (e) {
		if (typeof e.setSteps == "function") {
			e.setSteps(t);
			return;
		}
		e.innerHTML = t.map(g).join("");
	}
}
function v(e, t) {
	let n = s(e);
	!n || !t || (m(n.querySelector("tup-place-header"), t.header), h(n.querySelector("tup-place-photo"), t.photo), _(n.querySelector("tup-route"), t.steps));
}
function y(e) {
	return `${i}${e}`;
}
function b(e) {
	try {
		let t = localStorage.getItem(y(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function x(e, t) {
	localStorage.setItem(y(e), JSON.stringify({
		...t,
		id: e,
		savedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function S(e) {
	return structuredClone(e);
}
//#endregion
//#region js/place-mode.js
var C = "view", w = !1;
function T() {
	return new URLSearchParams(window.location.search);
}
function E(e) {
	return e.get("mode") === "edit" ? "edit" : "view";
}
function D(e, t, n) {
	return e.get("draft") === "1" || t === "edit" ? !!b(n) : !1;
}
function O() {
	let e = T(), t = o();
	if (C = E(e), document.documentElement.dataset.mode = C, !t) return;
	let n = c(t);
	if (document.documentElement.dataset.placeId = n, w = D(e, C, n), w) {
		let e = b(n);
		e && v(t, e);
	}
}
O();
function k() {
	return C;
}
function A({ mode: e = "view", draft: t = !1 } = {}) {
	let n = new URL(window.location.href);
	return e === "edit" ? (n.searchParams.set("mode", "edit"), n.searchParams.delete("draft")) : (n.searchParams.delete("mode"), t ? n.searchParams.set("draft", "1") : n.searchParams.delete("draft")), `${n.pathname}${n.search}${n.hash}`;
}
async function j() {
	if (k() !== "edit") return;
	let { initPlaceEditorUi: e } = await import("./place-editor-D5sw1G4e.js");
	e();
}
//#endregion
export { s as a, b as c, n as d, r as f, S as i, f as l, j as n, o, v as r, c as s, A as t, x as u };
