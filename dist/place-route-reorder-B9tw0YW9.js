import { a as e, i as t, n, o as r, r as i, u as a } from "./place-model-DoPGJvCY.js";
//#region js/place-route-reorder.js
var o = 3;
function s() {
	return window.Sortable;
}
function c(e) {
	return [...e.querySelectorAll(":scope > .route-step")];
}
function l(e) {
	return e.querySelector(".route-steps");
}
function u(e) {
	let t = l(e);
	if (!t) return;
	let n = c(t);
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
function d(e) {
	e._sortable?.destroy(), e._sortable = null;
}
function f(e, { slug: t, model: n }) {
	let r = s(), i = l(e);
	!r || !i || (d(e), e._sortable = r.create(i, {
		animation: 280,
		easing: "cubic-bezier(0.2, 0, 0, 1)",
		direction: "vertical",
		draggable: ".route-step--reorderable",
		filter: "button, a, input, textarea",
		preventOnFilter: !0,
		ghostClass: "route-step--sortable-ghost",
		chosenClass: "route-step--sortable-chosen",
		dragClass: "route-step--sortable-drag",
		onStart() {
			i.classList.add("is-reorder-active");
		},
		onEnd(r) {
			if (i.classList.remove("is-reorder-active"), r.oldIndex === r.newIndex) return;
			let o = [...n.steps], [s] = o.splice(r.oldIndex, 1);
			o.splice(r.newIndex, 0, s), n.steps = o, a(t, n), u(e);
		}
	}));
}
function p(e, { slug: t, model: n }) {
	!e || !n?.steps?.length || n.steps.length < o || s() && (e.classList.add("place-route-reorderable"), u(e), f(e, {
		slug: t,
		model: n
	}));
}
function m() {
	let a = t(), o = i(a);
	if (!a || !o) return;
	let s = e(a), c = r(s);
	if (!c?.steps?.length) return;
	let l = n(c), u = o.querySelector("tup-route");
	if (!u) return;
	u.setSteps(l.steps), p(u, {
		slug: s,
		model: l
	});
	let d = o.querySelector("tup-navigation-button");
	d && (d.hidden = !0);
}
//#endregion
export { m as initPlaceRouteEditUi };
