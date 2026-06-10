import { a as e, c as t, d as n, f as r, i, l as a, o, r as s, s as c, t as l, u } from "./place-mode-CMddMA4V.js";
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
	let v = h.querySelector("tup-route"), y = h.querySelector("tup-navigation-button");
	v && (v.hidden = !0, typeof v.setSteps == "function" && v.setSteps([])), y && (y.hidden = !0);
	let b = document.createElement("section");
	b.className = "place-route-compose", b.setAttribute("aria-label", "Opis trasy");
	let x = document.createElement("h2");
	x.className = "place-route-compose-heading", x.textContent = "Opisz drogę";
	let S = document.createElement("div");
	S.className = "place-route-compose-field";
	let C = document.createElement("textarea");
	C.className = "place-route-compose-textarea", C.maxLength = d, C.value = _.routeDescription || "", C.placeholder = "Napisz lub nagraj opis trasy… Np. Wejdź przez główne drzwi C10, poproś ochronę o windę, jedź na 2 piętro, wprowadź kod i skręć w lewo.";
	let w = document.createElement("div");
	w.className = "place-route-compose-field-footer";
	let T = document.createElement("span");
	T.className = "place-route-compose-counter", T.textContent = `${C.value.length} / ${d}`;
	let E = () => {
		T.textContent = `${C.value.length} / ${d}`, _.routeDescription = C.value, u(g, _);
	};
	C.addEventListener("input", E);
	let D = f((e) => {
		C.value = [C.value.trim(), e].filter(Boolean).join(" ").slice(0, d), E();
	});
	w.append(T, D), S.append(C, w);
	let O = document.createElement("button");
	O.type = "button", O.className = "place-route-compose-generate", O.innerHTML = "<span class=\"place-route-compose-generate-icon\" aria-hidden=\"true\"></span><span>Generuj kroki</span>";
	let k = document.createElement("p");
	k.className = "place-route-compose-hint", k.textContent = "Im więcej szczegółów, tym lepsze wskazówki.";
	let A = document.createElement("p");
	A.className = "place-route-compose-status", A.setAttribute("aria-live", "polite");
	let j = document.createElement("a");
	j.className = "place-route-compose-preview", j.href = l({
		mode: "view",
		draft: !0
	}), j.textContent = "Podgląd szkicu", O.addEventListener("click", () => {
		let e = C.value.trim();
		if (!e) {
			A.textContent = "Wpisz opis trasy, zanim wygenerujesz kroki.";
			return;
		}
		_.routeDescription = e, _.steps = n(e), s(p, _), u(g, _), A.textContent = _.steps.length > 0 ? `Wygenerowano ${_.steps.length} kroków.` : "Nie udało się wygenerować kroków z tego opisu.";
	}), b.append(x, S, O, k, A, j), v ? v.insertAdjacentElement("beforebegin", b) : h.append(b), m(h.querySelector("tup-place-photo"));
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
