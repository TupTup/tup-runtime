import { a as e, i as t, o as n, s as r, t as i } from "./place-model-DoPGJvCY.js";
//#region js/place-mode.js
var a = "view", o = !1;
function s() {
	return new URLSearchParams(window.location.search);
}
function c(e) {
	return e.get("mode") === "edit" ? "edit" : "view";
}
function l(e, t, r) {
	return e.get("draft") === "1" || t === "edit" ? !!n(r) : !1;
}
function u(r = s()) {
	return c(r) !== "edit" || r.get("draft") !== "1" ? !1 : !!n(e(t()))?.steps?.length;
}
function d() {
	let d = s(), f = t();
	if (a = c(d), document.documentElement.dataset.mode = a, !f) return;
	let p = e(f);
	if (document.documentElement.dataset.placeId = p, o = l(d, a, p), o) {
		let e = n(p);
		e && i(f, e, { includeRoute: a !== "edit" || u(d) }), a === "view" && d.get("draft") === "1" && (document.documentElement.dataset.draftPreview = "true");
	} else if (a === "view") {
		let e = r(p);
		e && i(f, e);
	}
}
d();
function f() {
	return a;
}
function p({ mode: e = "view", draft: t = !1, fresh: n = !1, published: r = !1 } = {}) {
	let i = new URL(window.location.href);
	return e === "edit" ? (i.searchParams.set("mode", "edit"), t ? i.searchParams.set("draft", "1") : i.searchParams.delete("draft"), n && t ? i.searchParams.set("fresh", "1") : i.searchParams.delete("fresh"), i.searchParams.delete("published")) : (i.searchParams.delete("mode"), t ? i.searchParams.set("draft", "1") : i.searchParams.delete("draft"), n && t ? i.searchParams.set("fresh", "1") : i.searchParams.delete("fresh"), r ? i.searchParams.set("published", "1") : i.searchParams.delete("published")), `${i.pathname}${i.search}${i.hash}`;
}
function m() {
	let e = new URL(window.location.href);
	e.searchParams.has("published") && (e.searchParams.delete("published"), window.history.replaceState({}, "", `${e.pathname}${e.search}${e.hash}`));
}
function h() {
	return s().get("published") === "1";
}
async function g() {
	if (f() !== "edit") return;
	let { initPlaceEditActions: e } = await import("./place-view-DEZwnaXW.js");
	if (e(), u()) {
		let { initPlaceRouteEditUi: e } = await import("./place-route-reorder-B9tw0YW9.js");
		e();
		return;
	}
	let { initPlaceEditorUi: t } = await import("./place-editor-CJSt5W5k.js");
	t();
}
async function _() {
	if (f() !== "view") return;
	let { initPlaceViewUi: e } = await import("./place-view-DEZwnaXW.js");
	if (e(), h()) {
		m();
		let { firePublishConfetti: e } = await import("./place-confetti-jSKW8Urk.js");
		e();
	}
}
//#endregion
export { g as n, _ as r, p as t };
