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
	let n = t.querySelector("tup-place-header"), r = [...t.querySelectorAll("tup-place-photo")], i = m(t.querySelector("tup-route"));
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
		photo: v(r[0]),
		bentoPhotos: r.length > 1 ? r.slice(1).map(v) : void 0,
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
function v(e) {
	return e ? {
		src: e.getAttribute("src") || "",
		alt: e.getAttribute("alt") || "",
		caption: f(e, "caption"),
		fallbackSrc: f(e, "fallback-src")
	} : {
		src: "",
		alt: ""
	};
}
function y(e, t) {
	let n = [...e.querySelectorAll("tup-place-photo")];
	n[0] && (t.photo = v(n[0])), n.length > 1 ? t.bentoPhotos = n.slice(1).map(v) : delete t.bentoPhotos;
}
function b(e, t) {
	!e || !t || (g(e, "src", t.src), g(e, "alt", t.alt), g(e, "caption", t.caption), g(e, "fallback-src", t.fallbackSrc));
}
function x(e, t, n) {
	let r = [...e.querySelectorAll("tup-place-photo")];
	b(r[0], t), n?.length && n.forEach((e, t) => {
		b(r[t + 1], e);
	});
}
function S(e) {
	let t = [`type="${c(e.type || "forward")}"`, `text="${c(e.text || "")}"`];
	return e.label && t.push(`label="${c(e.label)}"`), e.tone && t.push(`tone="${c(e.tone)}"`), e.emphasis && t.push(`emphasis="${c(e.emphasis)}"`), e.direction && t.push(`direction="${c(e.direction)}"`), e.code && t.push(`code="${c(e.code)}"`), e.codeHideAfter && t.push(`code-hide-after="${c(e.codeHideAfter)}"`), `<tup-route-step ${t.join(" ")}></tup-route-step>`;
}
function C(e, t) {
	if (e) {
		if (typeof e.setSteps == "function") {
			e.setSteps(t);
			return;
		}
		e.innerHTML = t.map(S).join("");
	}
}
function w(e, t, { includeRoute: n = !0 } = {}) {
	let r = u(e);
	!r || !t || (_(r.querySelector("tup-place-header"), t.header), x(r, t.photo, t.bentoPhotos), n && C(r.querySelector("tup-route"), t.steps));
}
function T(e) {
	return `${s}${e}`;
}
function E(e) {
	return `${T(e)}:published`;
}
function D(e) {
	try {
		let t = localStorage.getItem(T(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function O(e, t) {
	localStorage.setItem(T(e), JSON.stringify({
		...t,
		id: e,
		savedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function k(e) {
	try {
		let t = localStorage.getItem(E(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function A(e, t) {
	localStorage.setItem(E(e), JSON.stringify({
		...t,
		id: e,
		publishedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function j(e) {
	let t = D(e);
	return t ? (A(e, t), M(e), !0) : !1;
}
function M(e) {
	localStorage.removeItem(T(e));
}
function N(e) {
	return structuredClone(e);
}
//#endregion
//#region js/place-mode.js
var P = "view", F = !1;
function I() {
	return new URLSearchParams(window.location.search);
}
function L(e) {
	return e.get("mode") === "edit" ? "edit" : "view";
}
function R(e, t, n) {
	return e.get("draft") === "1" || t === "edit" ? !!D(n) : !1;
}
function z() {
	let e = I(), t = l();
	if (P = L(e), document.documentElement.dataset.mode = P, !t) return;
	let n = d(t);
	if (document.documentElement.dataset.placeId = n, F = R(e, P, n), F) {
		let r = D(n);
		r && w(t, r, { includeRoute: P !== "edit" }), P === "view" && e.get("draft") === "1" && (document.documentElement.dataset.draftPreview = "true");
	} else if (P === "view") {
		let e = k(n);
		e && w(t, e);
	}
}
z();
function B() {
	return P;
}
function V() {
	let e = I();
	return P === "view" && e.get("draft") === "1" && e.get("fresh") === "1";
}
function H({ mode: e = "view", draft: t = !1, fresh: n = !1, published: r = !1 } = {}) {
	let i = new URL(window.location.href);
	return e === "edit" ? (i.searchParams.set("mode", "edit"), i.searchParams.delete("draft"), i.searchParams.delete("fresh"), i.searchParams.delete("published")) : (i.searchParams.delete("mode"), t ? i.searchParams.set("draft", "1") : i.searchParams.delete("draft"), n && t ? i.searchParams.set("fresh", "1") : i.searchParams.delete("fresh"), r ? i.searchParams.set("published", "1") : i.searchParams.delete("published")), `${i.pathname}${i.search}${i.hash}`;
}
function U() {
	let e = new URL(window.location.href);
	e.searchParams.has("published") && (e.searchParams.delete("published"), window.history.replaceState({}, "", `${e.pathname}${e.search}${e.hash}`));
}
function W() {
	return I().get("published") === "1";
}
async function G() {
	if (B() !== "edit") return;
	let { initPlaceEditorUi: e } = await import("./place-editor-0hbGbuaF.js");
	e();
}
async function K() {
	if (B() !== "view") return;
	let { initPlaceViewUi: e } = await import("./place-view-oNnVc7lt.js");
	if (e(), W()) {
		U();
		let { firePublishConfetti: e } = await import("./place-confetti-jSKW8Urk.js");
		e();
	}
}
//#endregion
export { N as a, d as c, h as d, O as f, o as h, V as i, D as l, a as m, G as n, u as o, y as p, K as r, l as s, H as t, j as u };
