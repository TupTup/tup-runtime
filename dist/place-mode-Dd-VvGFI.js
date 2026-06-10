//#region js/place-model.js
var e = "tuptup:place:";
function t(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function n() {
	return document.querySelector("#place");
}
function r(e) {
	return e ? e.querySelector(".sheet-content") || e : null;
}
function i(e = n()) {
	return e?.getAttribute("data-place-id")?.trim() || window.location.pathname.split("/").filter(Boolean).pop() || "default";
}
function a(e, t) {
	let n = e.getAttribute(t);
	if (!(n === null || n === "")) return n;
}
function o(e) {
	return {
		type: e.getAttribute("type") || "forward",
		label: a(e, "label"),
		text: e.getAttribute("text") || "",
		tone: a(e, "tone"),
		emphasis: a(e, "emphasis"),
		direction: a(e, "direction"),
		code: a(e, "code"),
		codeHideAfter: a(e, "code-hide-after")
	};
}
function s(e) {
	return e ? typeof e.getSteps == "function" ? e.getSteps() : [...e.querySelectorAll(":scope > tup-route-step")].map(o) : [];
}
function c(e = n()) {
	let t = r(e);
	if (!t) return null;
	let o = t.querySelector("tup-place-header"), c = t.querySelector("tup-place-photo"), l = t.querySelector("tup-route");
	return {
		id: i(e),
		header: {
			name: o?.getAttribute("name") || "",
			summary: o?.getAttribute("summary") || "",
			address: o?.getAttribute("address") || "",
			lat: a(o, "lat"),
			lng: a(o, "lng"),
			plusCode: a(o, "plus-code"),
			mapHref: a(o, "map-href") || a(o, "maps"),
			vcard: a(o, "vcard"),
			preview: a(o, "preview")
		},
		photo: {
			src: c?.getAttribute("src") || "",
			alt: c?.getAttribute("alt") || "",
			caption: a(c, "caption"),
			fallbackSrc: a(c, "fallback-src")
		},
		steps: s(l)
	};
}
function l(e, t, n) {
	if (n == null || n === "") {
		e.removeAttribute(t);
		return;
	}
	e.setAttribute(t, n);
}
function u(e, t) {
	!e || !t || (l(e, "name", t.name), l(e, "summary", t.summary), l(e, "address", t.address), l(e, "lat", t.lat), l(e, "lng", t.lng), l(e, "plus-code", t.plusCode), l(e, "map-href", t.mapHref), l(e, "vcard", t.vcard), l(e, "preview", t.preview));
}
function d(e, t) {
	!e || !t || (l(e, "src", t.src), l(e, "alt", t.alt), l(e, "caption", t.caption), l(e, "fallback-src", t.fallbackSrc));
}
function f(e) {
	let n = [`type="${t(e.type || "forward")}"`, `text="${t(e.text || "")}"`];
	return e.label && n.push(`label="${t(e.label)}"`), e.tone && n.push(`tone="${t(e.tone)}"`), e.emphasis && n.push(`emphasis="${t(e.emphasis)}"`), e.direction && n.push(`direction="${t(e.direction)}"`), e.code && n.push(`code="${t(e.code)}"`), e.codeHideAfter && n.push(`code-hide-after="${t(e.codeHideAfter)}"`), `<tup-route-step ${n.join(" ")}></tup-route-step>`;
}
function p(e, t) {
	if (e) {
		if (typeof e.setSteps == "function") {
			e.setSteps(t);
			return;
		}
		e.innerHTML = t.map(f).join("");
	}
}
function m(e, t) {
	let n = r(e);
	!n || !t || (u(n.querySelector("tup-place-header"), t.header), d(n.querySelector("tup-place-photo"), t.photo), p(n.querySelector("tup-route"), t.steps));
}
function h(t) {
	return `${e}${t}`;
}
function g(e) {
	try {
		let t = localStorage.getItem(h(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function _(e, t) {
	localStorage.setItem(h(e), JSON.stringify({
		...t,
		id: e,
		savedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function v(e) {
	localStorage.removeItem(h(e));
}
function y(e) {
	return structuredClone(e);
}
//#endregion
//#region js/place-mode.js
var b = "view", x = !1;
function S() {
	return new URLSearchParams(window.location.search);
}
function C(e) {
	return e.get("mode") === "edit" ? "edit" : "view";
}
function w(e, t, n) {
	return e.get("draft") === "1" || t === "edit" ? !!g(n) : !1;
}
function T() {
	let e = S(), t = n();
	if (b = C(e), document.documentElement.dataset.mode = b, !t) return;
	let r = i(t);
	if (document.documentElement.dataset.placeId = r, x = w(e, b, r), x) {
		let e = g(r);
		e && m(t, e);
	}
}
T();
function E() {
	return b;
}
function D({ mode: e = "view", draft: t = !1 } = {}) {
	let n = new URL(window.location.href);
	return e === "edit" ? (n.searchParams.set("mode", "edit"), n.searchParams.delete("draft")) : (n.searchParams.delete("mode"), t ? n.searchParams.set("draft", "1") : n.searchParams.delete("draft")), `${n.pathname}${n.search}${n.hash}`;
}
async function O() {
	if (E() !== "edit") return;
	let { initPlaceEditorUi: e } = await import("./place-editor-DG-MVBUH.js");
	e();
}
//#endregion
export { y as a, g as c, v as i, c as l, O as n, n as o, m as r, i as s, D as t, _ as u };
