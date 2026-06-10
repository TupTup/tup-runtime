import { a as e, c as t, d as n, f as r, l as i, m as a, o, p as s, s as c, t as l } from "./place-mode-kALDDYSo.js";
import { n as u, r as d } from "./place-action-progress-Bj517IQQ.js";
//#region js/place-editor.js
var f = 500, p = "Wejdź do budynku C10. Poproś ochronę o aktywację windy. Wjedź na 2 piętro. Wprowadź kod 1234. Skręć w lewo. Idź prosto do końca korytarza. Lokal 229 po prawej stronie.";
function m(e) {
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
function h() {
	let h = c(), _ = o(h);
	if (!h || !_) return;
	let v = t(h), y = e(i(v) || n(h) || {
		id: v,
		header: {},
		photo: {},
		routeDescription: "",
		steps: []
	});
	!y.routeDescription && y.steps?.length && (y.routeDescription = a(y.steps));
	let b = _.querySelector("tup-route"), x = _.querySelector("tup-navigation-button");
	b && b.remove(), x && (x.hidden = !0);
	let S = document.createElement("section");
	S.className = "place-route-compose", S.setAttribute("aria-label", "Opis trasy");
	let C = document.createElement("h2");
	C.className = "place-route-compose-heading", C.textContent = "Opisz drogę";
	let w = document.createElement("div");
	w.className = "place-route-compose-field";
	let T = document.createElement("textarea");
	T.className = "place-route-compose-textarea", T.maxLength = f, T.value = y.routeDescription || p, T.placeholder = `Napisz lub nagraj opis trasy… Np. ${p}`;
	let E = document.createElement("div");
	E.className = "place-route-compose-field-footer";
	let D = document.createElement("span");
	D.className = "place-route-compose-counter", D.textContent = `${T.value.length} / ${f}`;
	let O = () => {
		D.textContent = `${T.value.length} / ${f}`, y.routeDescription = T.value, r(v, y);
	};
	T.addEventListener("input", O);
	let k = m((e) => {
		T.value = [T.value.trim(), e].filter(Boolean).join(" ").slice(0, f), O();
	});
	E.append(D, k), w.append(T, E);
	let { button: A, fill: j, label: M } = u("Generuj kroki"), N = document.createElement("p");
	N.className = "place-route-compose-hint", N.textContent = "Im więcej szczegółów, tym lepsze wskazówki.";
	let P = document.createElement("p");
	P.className = "place-route-compose-status", P.setAttribute("aria-live", "polite");
	let F = document.createElement("a");
	F.className = "place-route-compose-preview", F.href = l({
		mode: "view",
		draft: !0
	}), F.textContent = "Podgląd szkicu", F.hidden = !0;
	let I = !1;
	A.addEventListener("click", async () => {
		if (I) return;
		let e = T.value.trim();
		if (!e) {
			P.textContent = "Wpisz opis trasy, zanim wygenerujesz kroki.";
			return;
		}
		if (I = !0, A.disabled = !0, T.disabled = !0, P.textContent = "", A.classList.add("is-generating"), M.textContent = "Generuję kroki…", j.style.width = "0%", A.setAttribute("aria-busy", "true"), A.setAttribute("aria-valuemin", "0"), A.setAttribute("aria-valuemax", "100"), A.setAttribute("aria-valuenow", "0"), A.setAttribute("aria-label", "Generuję kroki…"), S.dataset.generating = "true", y.steps = [], r(v, y), F.hidden = !0, await d((e) => {
			j.style.width = `${e}%`, A.setAttribute("aria-valuenow", String(e));
		}), y.routeDescription = e, y.steps = s(e), r(v, y), y.steps.length > 0) {
			window.location.assign(l({
				mode: "view",
				draft: !0,
				fresh: !0
			}));
			return;
		}
		A.classList.remove("is-generating"), M.textContent = "Generuj kroki", j.style.width = "0%", A.removeAttribute("aria-busy"), A.removeAttribute("aria-valuemin"), A.removeAttribute("aria-valuemax"), A.removeAttribute("aria-valuenow"), A.removeAttribute("aria-label"), delete S.dataset.generating, A.disabled = !1, T.disabled = !1, I = !1, F.hidden = !0, P.textContent = "Nie udało się wygenerować kroków z tego opisu.";
	}), S.append(C, w, A, N, P, F);
	let L = _.querySelector("tup-place-photo");
	L ? L.insertAdjacentElement("afterend", S) : _.append(S), g(_.querySelector("tup-place-photo"));
}
function g(e) {
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
export { h as initPlaceEditorUi };
