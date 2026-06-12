import { a as e, c as t, f as n, l as r, o as i, s as a } from "./place-mode-B4-qNqm1.js";
import { initPlaceViewUi as o } from "./place-view-C2NcQm0S.js";
//#region js/place-route-reorder.js
var s = 3;
function c(e, t) {
	let n = t - 2;
	return Math.max(1, Math.min(n, e));
}
function l(e, t) {
	let n = t - 1;
	return Math.max(1, Math.min(n, e));
}
function u(e, t, n) {
	if (t === n) return e;
	let r = [...e], [i] = r.splice(t, 1);
	return r.splice(n, 0, i), r;
}
function d(e, t, n, r) {
	if (!t) return r;
	let i = [...e.children].indexOf(t), a = t.getBoundingClientRect();
	return n >= a.top + a.height / 2 ? i + 1 : i;
}
function f(e) {
	let t = e?.querySelector(".route-steps");
	if (!t) return;
	let n = [...t.querySelectorAll(":scope > .route-step")];
	n.forEach((e, t) => {
		if (e.classList.remove("route-step--fixed", "route-step--reorderable", "is-dragging", "is-drop-before", "is-drop-after"), t === 0 || t === n.length - 1) {
			e.classList.add("route-step--fixed"), e.querySelector(".route-step-reorder-handle")?.remove();
			return;
		}
		if (e.classList.add("route-step--reorderable"), e.querySelector(".route-step-reorder-handle")) return;
		let r = document.createElement("button");
		r.type = "button", r.className = "route-step-reorder-handle", r.setAttribute("aria-label", "Przenieś krok"), e.append(r);
	});
}
function p(e) {
	e.querySelectorAll(".is-drop-before, .is-drop-after").forEach((e) => {
		e.classList.remove("is-drop-before", "is-drop-after");
	});
}
function m(e, { slug: t, model: r }) {
	if (e.dataset.reorderBound === "true") return;
	e.dataset.reorderBound = "true";
	let i = null, a = () => {
		i &&= (i.item.classList.remove("is-dragging"), p(i.list), null);
	}, o = (i, a) => {
		let o = c(i, r.steps.length), s = l(a, r.steps.length);
		o < s && --s, o !== s && (r.steps = u(r.steps, o, s), n(t, r), e.setSteps(r.steps), f(e));
	};
	e.addEventListener("pointerdown", (t) => {
		let n = t.target.closest(".route-step-reorder-handle");
		if (!n || t.button !== 0) return;
		let r = e.querySelector(".route-steps"), a = n.closest(".route-step--reorderable");
		!r || !a || (t.preventDefault(), n.setPointerCapture(t.pointerId), i = {
			list: r,
			item: a,
			fromIndex: [...r.children].indexOf(a),
			pointerId: t.pointerId
		}, a.classList.add("is-dragging"));
	}), e.addEventListener("pointermove", (e) => {
		if (!i || e.pointerId !== i.pointerId) return;
		p(i.list);
		let t = document.elementFromPoint(e.clientX, e.clientY)?.closest(".route-step--reorderable");
		if (!t || t === i.item) return;
		let n = t.getBoundingClientRect();
		t.classList.add(e.clientY < n.top + n.height / 2 ? "is-drop-before" : "is-drop-after");
	}), e.addEventListener("pointerup", (e) => {
		if (!i || e.pointerId !== i.pointerId) return;
		let t = document.elementFromPoint(e.clientX, e.clientY)?.closest(".route-step--reorderable"), n = l(d(i.list, t, e.clientY, i.fromIndex), r.steps.length);
		o(i.fromIndex, n), a();
	}), e.addEventListener("pointercancel", a);
}
function h(e, { slug: t, model: n }) {
	!e || !n?.steps?.length || n.steps.length < s || (e.classList.add("place-route-reorderable"), f(e), m(e, {
		slug: t,
		model: n
	}));
}
function g() {
	let n = a(), s = i(n);
	if (!n || !s) return;
	let c = t(n), l = r(c);
	if (!l?.steps?.length) return;
	let u = e(l), d = s.querySelector("tup-route");
	if (!d) return;
	d.setSteps(u.steps), h(d, {
		slug: c,
		model: u
	});
	let f = s.querySelector("tup-navigation-button");
	f && (f.hidden = !0), o();
}
//#endregion
export { g as initPlaceRouteEditUi };
