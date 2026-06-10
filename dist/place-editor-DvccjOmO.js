import { a as e, c as t, d as n, f as r, i, l as a, o, r as s, s as c, t as l, u } from "./place-mode-BLCLmHG2.js";
//#region js/place-editor.js
var d = 500;
function f(e) {
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
function p() {
	let p = o(), h = e(p);
	if (!p || !h) return;
	let g = c(p), _ = i(t(g) || a(p) || {
		id: g,
		header: {},
		photo: {},
		routeDescription: "",
		steps: []
	});
	!_.routeDescription && _.steps?.length && (_.routeDescription = r(_.steps));
	let v = h.querySelector("tup-route"), y = h.querySelector("tup-navigation-button"), b = h.querySelector("tup-footer");
	v && (v.hidden = !_.steps?.length), y && (y.hidden = !0), b && (b.hidden = !0);
	let x = document.createElement("section");
	x.className = "place-route-compose", x.setAttribute("aria-label", "Opis trasy");
	let S = document.createElement("h2");
	S.className = "place-route-compose-heading", S.textContent = "Opisz drogę";
	let C = document.createElement("div");
	C.className = "place-route-compose-field";
	let w = document.createElement("textarea");
	w.className = "place-route-compose-textarea", w.maxLength = d, w.value = _.routeDescription || "", w.placeholder = "Napisz lub nagraj opis trasy… Np. Wejdź przez główne drzwi C10, poproś ochronę o windę, jedź na 2 piętro, wprowadź kod i skręć w lewo.";
	let T = document.createElement("div");
	T.className = "place-route-compose-field-footer";
	let E = document.createElement("span");
	E.className = "place-route-compose-counter", E.textContent = `${w.value.length} / ${d}`;
	let D = () => {
		E.textContent = `${w.value.length} / ${d}`, _.routeDescription = w.value, u(g, _);
	};
	w.addEventListener("input", D);
	let O = f((e) => {
		w.value = [w.value.trim(), e].filter(Boolean).join(" ").slice(0, d), D();
	});
	T.append(E, O), C.append(w, T);
	let k = document.createElement("button");
	k.type = "button", k.className = "place-route-compose-generate", k.innerHTML = "<span class=\"place-route-compose-generate-icon\" aria-hidden=\"true\"></span><span>Generuj kroki</span>";
	let A = document.createElement("p");
	A.className = "place-route-compose-hint", A.textContent = "Im więcej szczegółów, tym lepsze wskazówki.";
	let j = document.createElement("p");
	j.className = "place-route-compose-status", j.setAttribute("aria-live", "polite");
	let M = document.createElement("a");
	M.className = "place-route-compose-preview", M.href = l({
		mode: "view",
		draft: !0
	}), M.textContent = "Podgląd szkicu", k.addEventListener("click", () => {
		let e = w.value.trim();
		if (!e) {
			j.textContent = "Wpisz opis trasy, zanim wygenerujesz kroki.";
			return;
		}
		_.routeDescription = e, _.steps = n(e), s(p, _), u(g, _), v && (v.hidden = !1), j.textContent = _.steps.length > 0 ? `Wygenerowano ${_.steps.length} kroków.` : "Nie udało się wygenerować kroków z tego opisu.";
	}), x.append(S, C, k, A, j, M), v ? v.insertAdjacentElement("beforebegin", x) : h.append(x), m(h.querySelector("tup-place-photo"));
}
function m(e) {
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
export { p as initPlaceEditorUi };
