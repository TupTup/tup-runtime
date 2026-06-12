import { a as e, d as t, f as n, i as r, l as i, n as a, o, p as s, r as c, u as l } from "./place-model-DoPGJvCY.js";
import { t as u } from "./place-mode-BaQIPXtk.js";
import { n as d, r as f } from "./place-action-progress-Bj517IQQ.js";
//#region js/place-editor.js
var p = 500, m = "Wejdź do budynku C10. Poproś ochronę o aktywację windy. Wjedź na 2 piętro. Wprowadź kod 1234. Skręć w lewo. Idź prosto do końca korytarza. Lokal 229 po prawej stronie.";
function h(e) {
	let t = document.createElement("button");
	return t.type = "button", t.className = "place-route-compose-mic", t.setAttribute("aria-label", "Nagraj opis trasy"), t.innerHTML = "<span class=\"place-route-compose-mic-icon\" aria-hidden=\"true\"></span>", t.addEventListener("click", () => {
		let t = window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!t) return;
		let n = new t();
		n.lang = "pl-PL", n.interimResults = !1, n.maxAlternatives = 1, n.addEventListener("result", (t) => {
			let n = t.results[0]?.[0]?.transcript?.trim();
			n && e(n);
		}), n.start();
	}), !window.SpeechRecognition && !window.webkitSpeechRecognition && (t.hidden = !0), t;
}
function g() {
	let t = r(), g = c(t);
	if (!t || !g) return;
	let v = e(t), y = a(o(v) || i(t) || {
		id: v,
		header: {},
		photo: {},
		routeDescription: "",
		steps: []
	});
	!y.routeDescription && y.steps?.length && (y.routeDescription = s(y.steps));
	let b = g.querySelector("tup-route"), x = g.querySelector("tup-navigation-button");
	b && b.remove(), x && (x.hidden = !0);
	let S = document.createElement("section");
	S.className = "place-route-compose", S.setAttribute("aria-label", "Opis trasy");
	let C = document.createElement("h2");
	C.className = "place-route-compose-heading", C.textContent = "Opisz drogę";
	let w = document.createElement("div");
	w.className = "place-route-compose-field";
	let T = document.createElement("textarea");
	T.className = "place-route-compose-textarea", T.maxLength = p, T.value = y.routeDescription || m, T.placeholder = `Napisz lub nagraj opis trasy… Np. ${m}`;
	let E = document.createElement("div");
	E.className = "place-route-compose-field-footer";
	let D = document.createElement("span");
	D.className = "place-route-compose-counter", D.textContent = `${T.value.length} / ${p}`;
	let O = () => {
		D.textContent = `${T.value.length} / ${p}`, y.routeDescription = T.value, l(v, y);
	};
	T.addEventListener("input", O);
	let k = h((e) => {
		T.value = [T.value.trim(), e].filter(Boolean).join(" ").slice(0, p), O();
	});
	E.append(D, k), w.append(T, E);
	let { button: A, fill: j, label: M } = d("Generuj kroki"), N = document.createElement("p");
	N.className = "place-route-compose-hint", N.textContent = "Im więcej szczegółów, tym lepsze wskazówki.";
	let P = document.createElement("p");
	P.className = "place-route-compose-status", P.setAttribute("aria-live", "polite");
	let F = !1;
	A.addEventListener("click", async () => {
		if (F) return;
		let e = T.value.trim();
		if (!e) {
			P.textContent = "Wpisz opis trasy, zanim wygenerujesz kroki.";
			return;
		}
		if (F = !0, A.disabled = !0, T.disabled = !0, P.textContent = "", A.classList.add("is-generating"), M.textContent = "Generuję kroki…", j.style.width = "0%", A.setAttribute("aria-busy", "true"), A.setAttribute("aria-valuemin", "0"), A.setAttribute("aria-valuemax", "100"), A.setAttribute("aria-valuenow", "0"), A.setAttribute("aria-label", "Generuję kroki…"), S.dataset.generating = "true", y.steps = [], l(v, y), await f((e) => {
			j.style.width = `${e}%`, A.setAttribute("aria-valuenow", String(e));
		}), y.routeDescription = e, y.steps = n(e), l(v, y), y.steps.length > 0) {
			window.location.assign(u({
				mode: "edit",
				draft: !0,
				fresh: !0
			}));
			return;
		}
		A.classList.remove("is-generating"), M.textContent = "Generuj kroki", j.style.width = "0%", A.removeAttribute("aria-busy"), A.removeAttribute("aria-valuemin"), A.removeAttribute("aria-valuemax"), A.removeAttribute("aria-valuenow"), A.removeAttribute("aria-label"), delete S.dataset.generating, A.disabled = !1, T.disabled = !1, F = !1, P.textContent = "Nie udało się wygenerować kroków z tego opisu.";
	}), S.append(C, w, A, N, P);
	let I = g.querySelector(":scope > tup-bento-layout") ?? g.querySelector(":scope > tup-place-photo");
	I ? I.insertAdjacentElement("afterend", S) : g.append(S), _(g, {
		slug: v,
		model: y
	}), g.addEventListener("tup-map-pickup-change", (e) => {
		let { lat: t, lng: n } = e.detail;
		y.pickup = {
			lat: t,
			lng: n
		};
		let r = g.querySelector("tup-map");
		r && (r.setAttribute("pickup-lat", String(t)), r.setAttribute("pickup-lng", String(n))), l(v, y);
	});
}
function _(e, { slug: t, model: n }) {
	e.querySelectorAll("tup-place-photo").forEach((r) => {
		v(r, {
			slug: t,
			model: n,
			content: e
		});
	});
}
function v(e, { slug: n, model: r, content: i }) {
	if (!e || e.dataset.photoEditBound === "true") return;
	e.dataset.photoEditBound = "true";
	let a = document.createElement("input");
	a.type = "file", a.accept = "image/*", a.capture = "environment", a.hidden = !0, a.className = "place-photo-edit-input";
	let o = document.createElement("button");
	o.type = "button", o.className = "place-photo-edit-remove", o.setAttribute("aria-label", "Usuń zdjęcie"), o.innerHTML = "&times;";
	let s = () => {
		a.value = "", a.click();
	}, c = () => {
		o.hidden = !e.getAttribute("src")?.trim();
	};
	e.addEventListener("click", (e) => {
		e.target.closest(".place-photo-edit-remove") || e.target.closest("[data-photo-add]") && (e.preventDefault(), e.stopImmediatePropagation(), s());
	}, !0), o.addEventListener("click", (a) => {
		a.preventDefault(), a.stopPropagation(), e.removeAttribute("src"), c(), t(i, r), l(n, r);
	}), a.addEventListener("change", () => {
		let o = a.files?.[0];
		if (!o?.type.startsWith("image/")) return;
		let s = new FileReader();
		s.addEventListener("load", () => {
			let a = typeof s.result == "string" ? s.result : "";
			a && (e.setAttribute("src", a), c(), t(i, r), l(n, r));
		}), s.readAsDataURL(o);
	}), e.append(a, o), c();
}
//#endregion
export { g as initPlaceEditorUi };
