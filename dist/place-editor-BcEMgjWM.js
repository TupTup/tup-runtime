import { a as e, c as t, f as n, h as r, l as i, m as a, o, p as s, s as c, t as l, u } from "./place-mode-Cl7Ta_Q8.js";
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
	let g = t(), v = c(g);
	if (!g || !v) return;
	let y = i(g), b = o(u(y) || n(g) || {
		id: y,
		header: {},
		photo: {},
		routeDescription: "",
		steps: []
	});
	!b.routeDescription && b.steps?.length && (b.routeDescription = r(b.steps));
	let x = v.querySelector("tup-route"), S = v.querySelector("tup-navigation-button");
	x && (x.hidden = !0, typeof x.setSteps == "function" && x.setSteps([])), S && (S.hidden = !0);
	let C = document.createElement("section");
	C.className = "place-route-compose", C.setAttribute("aria-label", "Opis trasy");
	let w = document.createElement("h2");
	w.className = "place-route-compose-heading", w.textContent = "Opisz drogę";
	let T = document.createElement("div");
	T.className = "place-route-compose-field";
	let E = document.createElement("textarea");
	E.className = "place-route-compose-textarea", E.maxLength = p, E.value = b.routeDescription || m, E.placeholder = `Napisz lub nagraj opis trasy… Np. ${m}`;
	let D = document.createElement("div");
	D.className = "place-route-compose-field-footer";
	let O = document.createElement("span");
	O.className = "place-route-compose-counter", O.textContent = `${E.value.length} / ${p}`;
	let k = () => {
		O.textContent = `${E.value.length} / ${p}`, b.routeDescription = E.value, s(y, b);
	};
	E.addEventListener("input", k);
	let A = h((e) => {
		E.value = [E.value.trim(), e].filter(Boolean).join(" ").slice(0, p), k();
	});
	D.append(O, A), T.append(E, D);
	let { button: j, fill: M, label: N } = d("Generuj kroki"), P = document.createElement("p");
	P.className = "place-route-compose-hint", P.textContent = "Im więcej szczegółów, tym lepsze wskazówki.";
	let F = document.createElement("p");
	F.className = "place-route-compose-status", F.setAttribute("aria-live", "polite");
	let I = document.createElement("a");
	I.className = "place-route-compose-preview", I.href = l({
		mode: "view",
		draft: !0
	}), I.textContent = "Podgląd szkicu", I.hidden = !0;
	let L = !1;
	j.addEventListener("click", async () => {
		if (L) return;
		let t = E.value.trim();
		if (!t) {
			F.textContent = "Wpisz opis trasy, zanim wygenerujesz kroki.";
			return;
		}
		if (L = !0, j.disabled = !0, E.disabled = !0, F.textContent = "", j.classList.add("is-generating"), N.textContent = "Generuję kroki…", M.style.width = "0%", j.setAttribute("aria-busy", "true"), j.setAttribute("aria-valuemin", "0"), j.setAttribute("aria-valuemax", "100"), j.setAttribute("aria-valuenow", "0"), j.setAttribute("aria-label", "Generuję kroki…"), C.dataset.generating = "true", b.steps = [], e(g, b), s(y, b), I.hidden = !0, await f((e) => {
			M.style.width = `${e}%`, j.setAttribute("aria-valuenow", String(e));
		}), b.routeDescription = t, b.steps = a(t), e(g, b), s(y, b), b.steps.length > 0) {
			window.location.assign(l({
				mode: "view",
				draft: !0,
				fresh: !0
			}));
			return;
		}
		j.classList.remove("is-generating"), N.textContent = "Generuj kroki", M.style.width = "0%", j.removeAttribute("aria-busy"), j.removeAttribute("aria-valuemin"), j.removeAttribute("aria-valuemax"), j.removeAttribute("aria-valuenow"), j.removeAttribute("aria-label"), delete C.dataset.generating, j.disabled = !1, E.disabled = !1, L = !1, I.hidden = !0, F.textContent = "Nie udało się wygenerować kroków z tego opisu.";
	}), C.append(w, T, j, P, F, I), x ? x.insertAdjacentElement("beforebegin", C) : v.append(C), _(v.querySelector("tup-place-photo"));
}
function _(e) {
	if (!e || e.querySelector(".place-photo-edit-button")) return;
	let t = e.querySelector(".place-hero, .hero-image-trigger");
	if (!t) return;
	let n = document.createElement("button");
	n.type = "button", n.className = "place-photo-edit-button", n.innerHTML = "<span class=\"place-photo-edit-button-icon\" aria-hidden=\"true\"></span><span>Zmień zdjęcie</span>", n.addEventListener("click", () => {
		let t = window.prompt("Adres URL zdjęcia:", e.getAttribute("src") || "");
		t !== null && e.setAttribute("src", t.trim());
	}), t.append(n);
}
//#endregion
export { g as initPlaceEditorUi };
