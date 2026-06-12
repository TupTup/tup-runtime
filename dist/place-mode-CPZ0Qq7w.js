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
var r = [
	{
		type: "key",
		pattern: /kod|klawiatura|pin/i
	},
	{
		type: "hand",
		pattern: /ochron|portier/i
	},
	{
		type: "reception",
		pattern: /recepcj/i
	},
	{
		type: "floor",
		pattern: /\d+\s*pi[eę]tro|windzie|wind[ąę]/i
	},
	{
		type: "stairs",
		pattern: /schod/i
	},
	{
		type: "entrance",
		pattern: /wej[śs]ci|wejd[źz]|wjed[źz]/i
	},
	{
		type: "building",
		pattern: /budynek|budynku|\bC\d+\b/i
	},
	{
		type: "door",
		pattern: /drzwi|lokal/i
	},
	{
		type: "left",
		pattern: /\blewo\b|lew[aą]|w lewo/i
	},
	{
		type: "right",
		pattern: /\bprawo\b|praw[aą]|w prawo/i
	},
	{
		type: "straight",
		pattern: /prosto|na wprost/i
	}
];
function i(e, t, n) {
	let i = r.find(({ pattern: t }) => t.test(String(e ?? "").trim()))?.type;
	return n === 1 ? i ?? "target" : t === n - 1 ? "target" : t === 0 ? i ?? "start" : i ?? "forward";
}
function a(t) {
	let r = n(t);
	return r.map((t, n) => ({
		type: i(t, n, r.length),
		text: e(t)
	}));
}
function o(e) {
	return (e ?? []).map((e) => String(e.text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1")).filter(Boolean).join(". ");
}
//#endregion
//#region js/place-model.js
var s = "tuptup:place:";
function c(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function l() {
	return document.querySelector("#place");
}
function u(e) {
	return e ? e.querySelector(".sheet-content") || e : null;
}
function d(e = l()) {
	return e?.getAttribute("data-place-id")?.trim() || window.location.pathname.split("/").filter(Boolean).pop() || "default";
}
function f(e, t) {
	let n = e.getAttribute(t);
	if (!(n === null || n === "")) return n;
}
function p(e) {
	return {
		type: e.getAttribute("type") || "forward",
		label: f(e, "label"),
		text: e.getAttribute("text") || "",
		tone: f(e, "tone"),
		emphasis: f(e, "emphasis"),
		direction: f(e, "direction"),
		code: f(e, "code"),
		codeHideAfter: f(e, "code-hide-after")
	};
}
function m(e) {
	return e ? typeof e.getSteps == "function" ? e.getSteps() : [...e.querySelectorAll(":scope > tup-route-step")].map(p) : [];
}
function h(e = l()) {
	let t = u(e);
	if (!t) return null;
	let n = t.querySelector("tup-place-header"), r = t.querySelector("tup-place-photo"), i = m(t.querySelector("tup-route"));
	return {
		id: d(e),
		header: {
			name: n?.getAttribute("name") || "",
			summary: n?.getAttribute("summary") || "",
			address: n?.getAttribute("address") || "",
			lat: f(n, "lat"),
			lng: f(n, "lng"),
			plusCode: f(n, "plus-code"),
			mapHref: f(n, "map-href") || f(n, "maps"),
			vcard: f(n, "vcard"),
			preview: f(n, "preview")
		},
		photo: {
			src: r?.getAttribute("src") || "",
			alt: r?.getAttribute("alt") || "",
			caption: f(r, "caption"),
			fallbackSrc: f(r, "fallback-src")
		},
		routeDescription: o(i),
		steps: i
	};
}
function g(e, t, n) {
	if (n == null || n === "") {
		e.removeAttribute(t);
		return;
	}
	e.setAttribute(t, n);
}
function _(e, t) {
	!e || !t || (g(e, "name", t.name), g(e, "summary", t.summary), g(e, "address", t.address), g(e, "lat", t.lat), g(e, "lng", t.lng), g(e, "plus-code", t.plusCode), g(e, "map-href", t.mapHref), g(e, "vcard", t.vcard), g(e, "preview", t.preview));
}
function v(e, t) {
	!e || !t || (g(e, "src", t.src), g(e, "alt", t.alt), g(e, "caption", t.caption), g(e, "fallback-src", t.fallbackSrc));
}
function y(e) {
	let t = [`type="${c(e.type || "forward")}"`, `text="${c(e.text || "")}"`];
	return e.label && t.push(`label="${c(e.label)}"`), e.tone && t.push(`tone="${c(e.tone)}"`), e.emphasis && t.push(`emphasis="${c(e.emphasis)}"`), e.direction && t.push(`direction="${c(e.direction)}"`), e.code && t.push(`code="${c(e.code)}"`), e.codeHideAfter && t.push(`code-hide-after="${c(e.codeHideAfter)}"`), `<tup-route-step ${t.join(" ")}></tup-route-step>`;
}
function b(e, t) {
	if (e) {
		if (typeof e.setSteps == "function") {
			e.setSteps(t);
			return;
		}
		e.innerHTML = t.map(y).join("");
	}
}
function x(e, t, { includeRoute: n = !0 } = {}) {
	let r = u(e);
	!r || !t || (_(r.querySelector("tup-place-header"), t.header), v(r.querySelector("tup-place-photo"), t.photo), n && b(r.querySelector("tup-route"), t.steps));
}
function S(e) {
	return `${s}${e}`;
}
function C(e) {
	return `${S(e)}:published`;
}
function w(e) {
	try {
		let t = localStorage.getItem(S(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function T(e, t) {
	localStorage.setItem(S(e), JSON.stringify({
		...t,
		id: e,
		savedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function E(e) {
	try {
		let t = localStorage.getItem(C(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function D(e, t) {
	localStorage.setItem(C(e), JSON.stringify({
		...t,
		id: e,
		publishedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function O(e) {
	let t = w(e);
	return t ? (D(e, t), k(e), !0) : !1;
}
function k(e) {
	localStorage.removeItem(S(e));
}
function A(e) {
	return structuredClone(e);
}
//#endregion
//#region js/place-mode.js
var j = "view", M = !1;
function N() {
	return new URLSearchParams(window.location.search);
}
function P(e) {
	return e.get("mode") === "edit" ? "edit" : "view";
}
function F(e, t, n) {
	return e.get("draft") === "1" || t === "edit" ? !!w(n) : !1;
}
function I() {
	let e = N(), t = l();
	if (j = P(e), document.documentElement.dataset.mode = j, !t) return;
	let n = d(t);
	if (document.documentElement.dataset.placeId = n, M = F(e, j, n), M) {
		let r = w(n);
		r && x(t, r, { includeRoute: j !== "edit" }), j === "view" && e.get("draft") === "1" && (document.documentElement.dataset.draftPreview = "true");
	} else if (j === "view") {
		let e = E(n);
		e && x(t, e);
	}
}
I();
function L() {
	return j;
}
function R() {
	let e = N();
	return j === "view" && e.get("draft") === "1" && e.get("fresh") === "1";
}
function z({ mode: e = "view", draft: t = !1, fresh: n = !1, published: r = !1 } = {}) {
	let i = new URL(window.location.href);
	return e === "edit" ? (i.searchParams.set("mode", "edit"), i.searchParams.delete("draft"), i.searchParams.delete("fresh"), i.searchParams.delete("published")) : (i.searchParams.delete("mode"), t ? i.searchParams.set("draft", "1") : i.searchParams.delete("draft"), n && t ? i.searchParams.set("fresh", "1") : i.searchParams.delete("fresh"), r ? i.searchParams.set("published", "1") : i.searchParams.delete("published")), `${i.pathname}${i.search}${i.hash}`;
}
function B() {
	let e = new URL(window.location.href);
	e.searchParams.has("published") && (e.searchParams.delete("published"), window.history.replaceState({}, "", `${e.pathname}${e.search}${e.hash}`));
}
function V() {
	return N().get("published") === "1";
}
async function H() {
	if (L() !== "edit") return;
	let { initPlaceEditorUi: e } = await import("./place-editor-DcYSebPV.js");
	e();
}
async function U() {
	if (L() !== "view") return;
	let { initPlaceViewUi: e } = await import("./place-view-pLrMOdsX.js");
	if (e(), V()) {
		B();
		let { firePublishConfetti: e } = await import("./place-confetti-jSKW8Urk.js");
		e();
	}
}
//#endregion
export { A as a, d as c, h as d, T as f, R as i, w as l, o as m, H as n, u as o, a as p, U as r, l as s, z as t, O as u };
