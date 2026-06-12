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
var a = /\b((?:wprowadź|wpisz|wprowadz)\s+(?:kod|pin)|(?:kod|pin|klawiatura))\s*:?\s*(\S+)/i;
function o(e) {
	let t = e.trim().toLowerCase();
	return /^(wprowadź|wpisz|wprowadz)\s+(kod|pin)/.test(t) ? t.charAt(0).toUpperCase() + t.slice(1) : t === "pin" ? "Wprowadź pin" : "Wprowadź kod";
}
function s(e) {
	let t = String(e ?? "").trim(), n = t.match(a);
	if (!n) return { text: t };
	let r = n[2].replace(/[,;!.…]+$/g, "");
	return r ? {
		text: o(n[1]),
		code: r
	} : { text: t };
}
function c(t) {
	let r = n(t);
	return r.map((t, n) => {
		let { text: a, code: o } = s(t), c = {
			type: i(t, n, r.length),
			text: e(a)
		};
		return o && (c.type = "key", c.code = o), c;
	});
}
function l(e) {
	return (e ?? []).map((e) => {
		let t = String(e.text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1");
		return t ? e.code && !t.includes(e.code) ? `${t} ${e.code}` : t : "";
	}).filter(Boolean).join(". ");
}
//#endregion
//#region js/place-model.js
var u = "tuptup:place:";
function d(e) {
	return String(e ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}
function f() {
	return document.querySelector("#place");
}
function p(e) {
	return e ? e.querySelector(".sheet-content") || e : null;
}
function m(e = f()) {
	return e?.getAttribute("data-place-id")?.trim() || window.location.pathname.split("/").filter(Boolean).pop() || "default";
}
function h(e, t) {
	let n = e.getAttribute(t);
	if (!(n === null || n === "")) return n;
}
function g(e) {
	return {
		type: e.getAttribute("type") || "forward",
		label: h(e, "label"),
		text: e.getAttribute("text") || "",
		tone: h(e, "tone"),
		emphasis: h(e, "emphasis"),
		direction: h(e, "direction"),
		code: h(e, "code"),
		codeHideAfter: h(e, "code-hide-after")
	};
}
function _(e) {
	return e ? typeof e.getSteps == "function" ? e.getSteps() : [...e.querySelectorAll(":scope > tup-route-step")].map(g) : [];
}
function v(e = f()) {
	let t = p(e);
	if (!t) return null;
	let n = t.querySelector("tup-place-header"), r = [...t.querySelectorAll("tup-place-photo")], i = _(t.querySelector("tup-route"));
	return {
		id: m(e),
		header: {
			name: n?.getAttribute("name") || "",
			summary: n?.getAttribute("summary") || "",
			address: n?.getAttribute("address") || "",
			lat: h(n, "lat"),
			lng: h(n, "lng"),
			plusCode: h(n, "plus-code"),
			mapHref: h(n, "map-href") || h(n, "maps"),
			vcard: h(n, "vcard"),
			preview: h(n, "preview")
		},
		photo: x(r[0]),
		bentoPhotos: r.length > 1 ? r.slice(1).map(x) : void 0,
		routeDescription: l(i),
		steps: i,
		pickup: w(t.querySelector("tup-map"))
	};
}
function y(e, t, n) {
	if (n == null || n === "") {
		e.removeAttribute(t);
		return;
	}
	e.setAttribute(t, n);
}
function b(e, t) {
	!e || !t || (y(e, "name", t.name), y(e, "summary", t.summary), y(e, "address", t.address), y(e, "lat", t.lat), y(e, "lng", t.lng), y(e, "plus-code", t.plusCode), y(e, "map-href", t.mapHref), y(e, "vcard", t.vcard), y(e, "preview", t.preview));
}
function x(e) {
	return e ? {
		src: e.getAttribute("src") || "",
		alt: e.getAttribute("alt") || "",
		caption: h(e, "caption"),
		fallbackSrc: h(e, "fallback-src")
	} : {
		src: "",
		alt: ""
	};
}
function S(e, t) {
	let n = [...e.querySelectorAll("tup-place-photo")];
	n[0] && (t.photo = x(n[0])), n.length > 1 ? t.bentoPhotos = n.slice(1).map(x) : delete t.bentoPhotos;
}
function C(e, t) {
	!e || !t || (y(e, "src", t.src), y(e, "alt", t.alt), y(e, "caption", t.caption), y(e, "fallback-src", t.fallbackSrc));
}
function w(e) {
	if (!e) return;
	let t = h(e, "pickup-lat"), n = h(e, "pickup-lng");
	if (!(t === void 0 || n === void 0)) return {
		lat: t,
		lng: n
	};
}
function T(e, t) {
	if (!e || !t) return;
	let n = t.lat, r = t.lng;
	n == null || r == null || (y(e, "pickup-lat", String(n)), y(e, "pickup-lng", String(r)));
}
function E(e, t, n) {
	let r = [...e.querySelectorAll("tup-place-photo")];
	C(r[0], t), n?.length && n.forEach((e, t) => {
		C(r[t + 1], e);
	});
}
function D(e) {
	let t = [`type="${d(e.type || "forward")}"`, `text="${d(e.text || "")}"`];
	return e.label && t.push(`label="${d(e.label)}"`), e.tone && t.push(`tone="${d(e.tone)}"`), e.emphasis && t.push(`emphasis="${d(e.emphasis)}"`), e.direction && t.push(`direction="${d(e.direction)}"`), e.code && t.push(`code="${d(e.code)}"`), e.codeHideAfter && t.push(`code-hide-after="${d(e.codeHideAfter)}"`), `<tup-route-step ${t.join(" ")}></tup-route-step>`;
}
function O(e, t) {
	if (e) {
		if (typeof e.setSteps == "function") {
			e.setSteps(t);
			return;
		}
		e.innerHTML = t.map(D).join("");
	}
}
function k(e, t, { includeRoute: n = !0 } = {}) {
	let r = p(e);
	!r || !t || (b(r.querySelector("tup-place-header"), t.header), E(r, t.photo, t.bentoPhotos), T(r.querySelector("tup-map"), t.pickup), n && O(r.querySelector("tup-route"), t.steps));
}
function A(e) {
	return `${u}${e}`;
}
function j(e) {
	return `${A(e)}:published`;
}
function M(e) {
	try {
		let t = localStorage.getItem(A(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function N(e, t) {
	localStorage.setItem(A(e), JSON.stringify({
		...t,
		id: e,
		savedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function P(e) {
	try {
		let t = localStorage.getItem(j(e));
		return t ? JSON.parse(t) : null;
	} catch {
		return null;
	}
}
function F(e, t) {
	localStorage.setItem(j(e), JSON.stringify({
		...t,
		id: e,
		publishedAt: (/* @__PURE__ */ new Date()).toISOString()
	}));
}
function I(e) {
	let t = M(e);
	return t ? (F(e, t), L(e), !0) : !1;
}
function L(e) {
	localStorage.removeItem(A(e));
}
function R(e) {
	return structuredClone(e);
}
//#endregion
export { m as a, I as c, S as d, c as f, f as i, v as l, R as n, M as o, l as p, p as r, P as s, k as t, N as u };
