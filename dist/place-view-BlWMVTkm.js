import { c as e, d as t, i as n, l as r, s as i, t as a, u as o } from "./place-mode-Cl7Ta_Q8.js";
import { n as s, r as c, t as l } from "./place-action-progress-Bj517IQQ.js";
//#region js/place-view.js
function u(e, t, n) {
	e.classList.remove("is-generating"), n.textContent = "Publikuj", t.style.width = "0%", e.removeAttribute("aria-busy"), e.removeAttribute("aria-valuemin"), e.removeAttribute("aria-valuemax"), e.removeAttribute("aria-valuenow"), e.removeAttribute("aria-label"), e.disabled = !1;
}
function d() {
	let d = e(), f = i(d);
	if (!d || !f || f.querySelector(".place-view-actions")) return;
	let p = r(d), m = o(p), h = n() && !!m?.steps?.length, g = document.createElement("section");
	g.className = "place-view-actions";
	let _ = document.createElement("a");
	_.className = "place-route-compose-preview", _.href = a({ mode: "edit" }), _.textContent = "Edytuj drogę";
	let v = !1;
	if (h) {
		let { button: e, fill: n, label: r } = s("Publikuj", {
			icon: "send",
			iconPosition: "end"
		});
		e.classList.add("place-view-publish"), e.addEventListener("click", async () => {
			if (!v) {
				if (v = !0, e.disabled = !0, _.inert = !0, e.classList.add("is-generating"), r.textContent = "Publikuję…", n.style.width = "0%", e.setAttribute("aria-busy", "true"), e.setAttribute("aria-valuemin", "0"), e.setAttribute("aria-valuemax", "100"), e.setAttribute("aria-valuenow", "0"), e.setAttribute("aria-label", "Publikuję…"), await c((t) => {
					n.style.width = `${t}%`, e.setAttribute("aria-valuenow", String(t));
				}, l), !t(p)) {
					u(e, n, r), _.inert = !1, v = !1;
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
