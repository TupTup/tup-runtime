//#region js/place-route-generator.js
function e(e) {
	return e.replace(/\b(C\d+)\b/gi, "**$1**").replace(/\b(lokal\s*\d+)\b/gi, (e, t) => `**${t}**`).replace(/\b(\d+)\s*pi[eę]tro\b/gi, "**$1 piętro**");
}
function t(e) {
	return String(e ?? "").replace(/[.!?…]+$/g, "").trim();
}
function n(e) {
	let n = String(e ?? "").trim();
	return n ? n.split(/\.\s+/).map(t).filter(Boolean) : [];
}
function r(e, t) {
	return t === 1 || e === 0 ? "start" : e === t - 1 ? "target" : "straight";
}
function i(t) {
	let i = n(t);
	return i.map((t, n) => ({
		type: r(n, i.length),
		text: e(t)
	}));
}
function a(e) {
	return (e ?? []).map((e) => String(e.text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1")).filter(Boolean).join(". ");
}
//#endregion
//#region js/place-model.js
var o = "tuptup:place:";
function s(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function c() {
	return document.querySelector("#place");
}
function l(e) {
	return e ? e.querySelector(".sheet-content") || e : null;
}
function u(e = c()) {
	return e?.getAttribute("data-place-id")?.trim() || window.location.pathname.split("/").filter(Boolean).pop() || "default";
}
function d(e, t) {
	let n = e.getAttribute(t);
	if (!(n === null || n === "")) return n;
}
function f(e) {
	return {
		type: e.getAttribute("type") || "forward",
		label: d(e, "label"),
		text: e.getAttribute("text") || "",
		tone: d(e, "tone"),
		emphasis: d(e, "emphasis"),
		direction: d(e, "direction"),
		code: d(e, "code"),
		codeHideAfter: d(e, "code-hide-after")
	};
}
function p(e) {
	return e ? typeof e.getSteps == "function" ? e.getSteps() : [...e.querySelectorAll(":scope > tup-route-step")].map(f) : [];
}
function m(e = c()) {
	let t = l(e);
	if (!t) return null;
	let n = t.querySelector("tup-place-header"), r = t.querySelector("tup-place-photo"), i = p(t.querySelector("tup-route"));
	return {
		id: u(e),
		header: {
			name: n?.getAttribute("name") || "",
			summary: n?.getAttribute("summary") || "",
			address: n?.getAttribute("address") || "",
			lat: d(n, "lat"),
			lng: d(n, "lng"),
			plusCode: d(n, "plus-code"),
			mapHref: d(n, "map-href") || d(n, "maps"),
			vcard: d(n, "vcard"),
			preview: d(n, "preview")
		},
		photo: {
			src: r?.getAttribute("src") || "",
			alt: r?.getAttribute("alt") || "",
			caption: d(r, "caption"),
			fallbackSrc: d(r, "fallback-src")
		},
		routeDescription: a(i),
		steps: i
	};
}
function h(e, t, n) {
	if (n == null || n === "") {
		e.removeAttribute(t);
		return;
	}
	e.setAttribute(t, n);
}
function g(e, t) {
	!e || !t || (h(e, "name", t.name), h(e, "summary", t.summary), h(e, "address", t.address), h(e, "lat", t.lat), h(e, "lng", t.lng), h(e, "plus-code", t.plusCode), h(e, "map-href", t.mapHref), h(e, "vcard", t.vcard), h(e, "preview", t.preview));
}
function _(e, t) {
	!e || !t || (h(e, "src", t.src), h(e, "alt", t.alt), h(e, "caption", t.caption), h(e, "fallback-src", t.fallbackSrc));
}
function v(e) {
	let t = [`type="${s(e.type || "forward")}"`, `text="${s(e.text || "")}"`];
	return e.label && t.push(`label="${s(e.label)}"`), e.tone && t.push(`tone="${s(e.tone)}"`), e.emphasis && t.push(`emphasis="${s(e.emphasis)}"`), e.direction && t.push(`direction="${s(e.direction)}"`), e.code && t.push(`code="${s(e.code)}"`), e.codeHideAfter && t.push(`code-hide-after="${s(e.codeHideAfter)}"`), `<tup-route-step ${t.join(" ")}></tup-route-step>`;
}
function y(e, t) {
	if (e) {
		if (typeof e.setSteps == "function") {
			e.setSteps(t);
			return;
		}
		e.innerHTML = t.map(v).join("");
	}
}
function b(e, t, { includeRoute: n = !0 } = {}) {
	let r = l(e);
	!r || !t || (g(r.querySelector("tup-place-header"), t.header), _(r.querySelector("tup-place-photo"), t.photo), n && y(r.querySelector("tup-route"), t.steps));
}
function x(e) {
	return `${o}${e}`;
}
function S(e) {
	return `${x(e)}:published`;
}
function C(e) {
	try {
		let t = localStorage.getItem(x(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function w(e, t) {
	localStorage.setItem(x(e), JSON.stringify({
		...t,
		id: e,
		savedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function T(e) {
	try {
		let t = localStorage.getItem(S(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function E(e, t) {
	localStorage.setItem(S(e), JSON.stringify({
		...t,
		id: e,
		publishedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function D(e) {
	let t = C(e);
	return t ? (E(e, t), O(e), !0) : !1;
}
function O(e) {
	localStorage.removeItem(x(e));
}
function k(e) {
	return structuredClone(e);
}
//#endregion
//#region js/place-mode.js
var A = "view", j = !1;
function M() {
	return new URLSearchParams(window.location.search);
}
function N(e) {
	return e.get("mode") === "edit" ? "edit" : "view";
}
function P(e, t, n) {
	return e.get("draft") === "1" || t === "edit" ? !!C(n) : !1;
}
function F() {
	let e = M(), t = c();
	if (A = N(e), document.documentElement.dataset.mode = A, !t) return;
	let n = u(t);
	if (document.documentElement.dataset.placeId = n, j = P(e, A, n), j) {
		let r = C(n);
		r && b(t, r, { includeRoute: A !== "edit" }), A === "view" && e.get("draft") === "1" && (document.documentElement.dataset.draftPreview = "true");
	} else if (A === "view") {
		let e = T(n);
		e && b(t, e);
	}
}
F();
function I() {
	return A;
}
function L() {
	let e = M();
	return A === "view" && e.get("draft") === "1" && e.get("fresh") === "1";
}
function R({ mode: e = "view", draft: t = !1, fresh: n = !1 } = {}) {
	let r = new URL(window.location.href);
	return e === "edit" ? (r.searchParams.set("mode", "edit"), r.searchParams.delete("draft"), r.searchParams.delete("fresh")) : (r.searchParams.delete("mode"), t ? r.searchParams.set("draft", "1") : r.searchParams.delete("draft"), n && t ? r.searchParams.set("fresh", "1") : r.searchParams.delete("fresh")), `${r.pathname}${r.search}${r.hash}`;
}
async function z() {
	if (I() !== "edit") return;
	let { initPlaceEditorUi: e } = await import("./place-editor-CUui_f2J.js");
	e();
}
async function B() {
	if (I() !== "view") return;
	let { initPlaceViewUi: e } = await import("./place-view-DIuE_oCC.js");
	e();
}
//#endregion
export { k as a, u as c, m as d, w as f, L as i, C as l, a as m, z as n, l as o, i as p, B as r, c as s, R as t, D as u };
