import { c as e, i as t, l as n, o as r, s as i, t as a, u as o } from "./place-mode-kALDDYSo.js";
import { n as s, r as c, t as l } from "./place-action-progress-Bj517IQQ.js";
//#region js/place-view.js
function u(e, t, n) {
	e.classList.remove("is-generating"), n.textContent = "Publikuj", t.style.width = "0%", e.removeAttribute("aria-busy"), e.removeAttribute("aria-valuemin"), e.removeAttribute("aria-valuemax"), e.removeAttribute("aria-valuenow"), e.removeAttribute("aria-label"), e.disabled = !1;
}
function d() {
	let d = i(), f = r(d);
	if (!d || !f || f.querySelector(".place-view-actions")) return;
	let p = e(d), m = n(p), h = t() && !!m?.steps?.length, g = document.createElement("section");
	g.className = "place-view-actions";
	let _ = document.createElement("a");
	_.className = "place-route-compose-preview", _.href = a({ mode: "edit" }), _.textContent = "Edytuj drogę";
	let v = !1;
	if (h) {
		let { button: e, fill: t, label: n } = s("Publikuj", {
			icon: "send",
			iconPosition: "end"
		});
		e.classList.add("place-view-publish"), e.addEventListener("click", async () => {
			if (!v) {
				if (v = !0, e.disabled = !0, _.inert = !0, e.classList.add("is-generating"), n.textContent = "Publikuję…", t.style.width = "0%", e.setAttribute("aria-busy", "true"), e.setAttribute("aria-valuemin", "0"), e.setAttribute("aria-valuemax", "100"), e.setAttribute("aria-valuenow", "0"), e.setAttribute("aria-label", "Publikuję…"), await c((n) => {
					t.style.width = `${n}%`, e.setAttribute("aria-valuenow", String(n));
				}, l), !o(p)) {
					u(e, t, n), _.inert = !1, v = !1;
					return;
				}
				window.location.assign(a({
					mode: "view",
					draft: !1
				}));
			}
		}), g.append(e);
	}
	g.append(_);
	let y = f.querySelector("tup-footer");
	y ? y.insertAdjacentElement("beforebegin", g) : f.append(g);
}
//#endregion
export { d as initPlaceViewUi };
