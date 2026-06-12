import { a as e, c as t, i as n, o as r, r as i } from "./place-model-DoPGJvCY.js";
import { t as a } from "./place-mode-BaQIPXtk.js";
import { n as o, r as s, t as c } from "./place-action-progress-Bj517IQQ.js";
//#region js/place-view.js
function l() {
	return new URLSearchParams(window.location.search);
}
function u(e = l()) {
	return e.get("draft") === "1";
}
function d(e) {
	return r(e)?.steps?.length ? a({
		mode: "edit",
		draft: !0
	}) : a({ mode: "edit" });
}
function f(e, t) {
	let n = e.querySelector("tup-footer");
	n ? n.insertAdjacentElement("beforebegin", t) : e.append(t);
}
function p(e, t, n) {
	e.classList.remove("is-generating"), n.textContent = "Publikuj", t.style.width = "0%", e.removeAttribute("aria-busy"), e.removeAttribute("aria-valuemin"), e.removeAttribute("aria-valuemax"), e.removeAttribute("aria-valuenow"), e.removeAttribute("aria-label"), e.disabled = !1;
}
function m() {
	let t = n(), o = i(t);
	if (!t || !o || o.querySelector(".place-edit-actions") || !r(e(t))) return;
	let s = document.createElement("section");
	s.className = "place-view-actions place-edit-actions";
	let c = document.createElement("a");
	c.className = "place-route-compose-preview", c.href = a({
		mode: "view",
		draft: !0
	}), c.textContent = "Podgląd tupa", s.append(c), f(o, s);
}
function h() {
	if (!u(l())) return;
	let m = n(), h = i(m);
	if (!m || !h || h.querySelector(".place-view-actions")) return;
	let g = e(m), _ = !!r(g)?.steps?.length, v = document.createElement("section");
	v.className = "place-view-actions";
	let y = document.createElement("a");
	y.className = "place-route-compose-preview", y.href = d(g), y.textContent = "Edytuj tupa";
	let b = !1;
	if (_) {
		let { button: e, fill: n, label: r } = o("Publikuj", {
			icon: "send",
			iconPosition: "end"
		});
		e.classList.add("place-view-publish"), e.addEventListener("click", async () => {
			if (!b) {
				if (b = !0, e.disabled = !0, y.inert = !0, e.classList.add("is-generating"), r.textContent = "Publikuję…", n.style.width = "0%", e.setAttribute("aria-busy", "true"), e.setAttribute("aria-valuemin", "0"), e.setAttribute("aria-valuemax", "100"), e.setAttribute("aria-valuenow", "0"), e.setAttribute("aria-label", "Publikuję…"), await s((t) => {
					n.style.width = `${t}%`, e.setAttribute("aria-valuenow", String(t));
				}, c), !t(g)) {
					p(e, n, r), y.inert = !1, b = !1;
					return;
				}
				window.location.assign(a({
					mode: "view",
					draft: !1,
					published: !0
				}));
			}
		}), v.append(e);
	}
	v.append(y), f(h, v);
}
//#endregion
export { m as initPlaceEditActions, h as initPlaceViewUi };
