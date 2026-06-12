import { a as e, c as t, f as n, l as r, o as i, s as a } from "./place-mode-BN0zZslM.js";
import { initPlaceViewUi as o } from "./place-view-3FQMhGMs.js";
//#region js/place-route-reorder.js
var s = 3;
function c() {
	return window.Sortable;
}
function l(e) {
	let t = e?.querySelector(".route-steps");
	if (!t) return;
	let n = [...t.querySelectorAll(":scope > .route-step")];
	n.forEach((e, t) => {
		if (e.classList.remove("route-step--fixed", "route-step--reorderable"), t === 0 || t === n.length - 1) {
			e.classList.add("route-step--fixed"), e.querySelector(".route-step-reorder-handle")?.remove();
			return;
		}
		if (e.classList.add("route-step--reorderable"), e.querySelector(".route-step-reorder-handle")) return;
		let r = document.createElement("span");
		r.className = "route-step-reorder-handle", r.setAttribute("aria-hidden", "true"), e.append(r);
	});
}
function u(e) {
	e._sortable?.destroy(), e._sortable = null;
}
function d(e, { slug: t, model: r }) {
	let i = c(), a = e.querySelector(".route-steps");
	!i || !a || (u(e), e._sortable = i.create(a, {
		animation: 280,
		easing: "cubic-bezier(0.2, 0, 0, 1)",
		draggable: ".route-step--reorderable",
		filter: "button, a, input, textarea",
		preventOnFilter: !0,
		ghostClass: "route-step--sortable-ghost",
		chosenClass: "route-step--sortable-chosen",
		dragClass: "route-step--sortable-drag",
		onStart() {
			a.classList.add("is-reorder-active");
		},
		onEnd(e) {
			if (a.classList.remove("is-reorder-active"), e.oldIndex === e.newIndex) return;
			let i = [...r.steps], [o] = i.splice(e.oldIndex, 1);
			i.splice(e.newIndex, 0, o), r.steps = i, n(t, r);
		}
	}));
}
function f(e, { slug: t, model: n }) {
	!e || !n?.steps?.length || n.steps.length < s || c() && (e.classList.add("place-route-reorderable"), l(e), d(e, {
		slug: t,
		model: n
	}));
}
function p() {
	let n = a(), s = i(n);
	if (!n || !s) return;
	let c = t(n), l = r(c);
	if (!l?.steps?.length) return;
	let u = e(l), d = s.querySelector("tup-route");
	if (!d) return;
	d.setSteps(u.steps), f(d, {
		slug: c,
		model: u
	});
	let p = s.querySelector("tup-navigation-button");
	p && (p.hidden = !0), o();
}
//#endregion
export { p as initPlaceRouteEditUi };
