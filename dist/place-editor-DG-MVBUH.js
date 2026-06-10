import { a as e, c as t, i as n, l as r, o as i, r as a, s as o, t as s, u as c } from "./place-mode-Dd-VvGFI.js";
//#region js/place-editor.js
var l = [
	"start",
	"hand",
	"floor-up",
	"floor-down",
	"key",
	"left",
	"right",
	"straight",
	"forward",
	"target",
	"building",
	"entrance",
	"door",
	"stairs",
	"elevator",
	"reception"
], u = [
	"",
	"warning",
	"secondary"
], d = ["", "primary"];
function f(e, t) {
	let n = document.createElement("label");
	n.className = "place-editor-field";
	let r = document.createElement("span");
	return r.className = "place-editor-field-label", r.textContent = e, n.append(r, t), n;
}
function p(e, t) {
	let n = document.createElement("input");
	return n.className = "place-editor-input", n.type = "text", n.value = e ?? "", n.addEventListener("input", () => t(n.value)), n;
}
function m(e, t) {
	let n = document.createElement("textarea");
	return n.className = "place-editor-textarea", n.rows = 2, n.value = e ?? "", n.addEventListener("input", () => t(n.value)), n;
}
function h(e, t, n) {
	let r = document.createElement("select");
	r.className = "place-editor-select";
	for (let e of t) {
		let t = document.createElement("option");
		t.value = e, t.textContent = e || "—", r.appendChild(t);
	}
	return r.value = e ?? "", r.addEventListener("change", () => n(r.value)), r;
}
function g(e, t, n) {
	let r = document.createElement("button");
	return r.type = "button", r.className = t, r.textContent = e, r.addEventListener("click", n), r;
}
function _() {
	let l = document.querySelector(".app") || i()?.parentElement, u = i();
	if (!l || !u) return;
	let d = o(u), f = t(d) || r(u) || {
		id: d,
		header: {},
		photo: {},
		steps: []
	}, p = document.createElement("section");
	p.className = "place-editor", p.setAttribute("aria-label", "Edytor miejsca");
	let m = {
		model: e(f),
		slug: d,
		placeRoot: u,
		statusEl: null
	}, h = () => {
		a(m.placeRoot, m.model), c(m.slug, m.model), m.statusEl && (m.statusEl.textContent = "Szkic zapisany lokalnie w tej przeglądarce.");
	}, _ = document.createElement("div");
	_.className = "place-editor-toolbar";
	let x = document.createElement("p");
	x.className = "place-editor-title", x.textContent = `Edycja: ${d}`;
	let S = document.createElement("div");
	S.className = "place-editor-actions", S.append(g("Zapisz szkic", "place-editor-button", h), g("Podgląd", "place-editor-button place-editor-button--primary", () => {
		h(), window.location.href = s({
			mode: "view",
			draft: !0
		});
	}), g("Odrzuć szkic", "place-editor-button", () => {
		n(m.slug), window.location.href = s({
			mode: "view",
			draft: !1
		});
	}), g("Przywróć HTML", "place-editor-button", () => {
		n(m.slug), window.location.href = s({
			mode: "view",
			draft: !1
		});
	})), _.append(x, S);
	let C = document.createElement("p");
	C.className = "place-editor-notice", C.textContent = "Szkic jest zapisywany tylko lokalnie w tej przeglądarce (localStorage).", m.statusEl = document.createElement("p"), m.statusEl.className = "place-editor-status", m.statusEl.setAttribute("aria-live", "polite");
	let w = document.createElement("div");
	w.className = "place-editor-forms", w.append(v(m, h), y(m, h), b(m, h)), p.append(_, C, m.statusEl, w), l.insertBefore(p, l.firstChild);
}
function v(e, t) {
	let n = document.createElement("section");
	n.className = "place-editor-section", n.innerHTML = "<h2 class=\"place-editor-section-title\">Nagłówek</h2>";
	let r = document.createElement("div");
	return r.className = "place-editor-grid", r.append(f("Nazwa", p(e.model.header.name, (n) => {
		e.model.header.name = n, t();
	})), f("Summary", p(e.model.header.summary, (n) => {
		e.model.header.summary = n, t();
	})), f("Adres", p(e.model.header.address, (n) => {
		e.model.header.address = n, t();
	}))), n.append(r), n;
}
function y(e, t) {
	let n = document.createElement("section");
	n.className = "place-editor-section", n.innerHTML = "<h2 class=\"place-editor-section-title\">Zdjęcie</h2>";
	let r = document.createElement("div");
	return r.className = "place-editor-grid", r.append(f("URL", p(e.model.photo.src, (n) => {
		e.model.photo.src = n, t();
	})), f("Alt", p(e.model.photo.alt, (n) => {
		e.model.photo.alt = n, t();
	}))), n.append(r), n;
}
function b(e, t) {
	let n = document.createElement("section");
	n.className = "place-editor-section";
	let r = document.createElement("div");
	r.className = "place-editor-section-header";
	let i = document.createElement("h2");
	i.className = "place-editor-section-title", i.textContent = "Kroki trasy";
	let a = g("Dodaj krok", "place-editor-button", () => {
		e.model.steps.push({
			type: "forward",
			text: ""
		}), s(), t();
	});
	r.append(i, a);
	let o = document.createElement("div");
	o.className = "place-editor-steps";
	let s = () => {
		o.replaceChildren(), e.model.steps.forEach((n, r) => {
			o.appendChild(x(e, n, r, s, t));
		});
	};
	return s(), n.append(r, o), n;
}
function x(e, t, n, r, i) {
	let a = document.createElement("article");
	a.className = "place-editor-step";
	let o = document.createElement("h3");
	o.className = "place-editor-step-title", o.textContent = `Krok ${n + 1}`;
	let s = document.createElement("div");
	s.className = "place-editor-step-controls", s.append(g("↑", "place-editor-icon-button", () => {
		if (n === 0) return;
		let t = e.model.steps;
		[t[n - 1], t[n]] = [t[n], t[n - 1]], r(), i();
	}), g("↓", "place-editor-icon-button", () => {
		if (n >= e.model.steps.length - 1) return;
		let t = e.model.steps;
		[t[n + 1], t[n]] = [t[n], t[n + 1]], r(), i();
	}), g("Usuń", "place-editor-icon-button place-editor-icon-button--danger", () => {
		e.model.steps.splice(n, 1), r(), i();
	}));
	let c = document.createElement("div");
	return c.className = "place-editor-grid", c.append(f("Typ", h(t.type, l, (e) => {
		t.type = e, i();
	})), f("Tekst", m(t.text, (e) => {
		t.text = e, i();
	})), f("Label", p(t.label, (e) => {
		t.label = e || void 0, i();
	})), f("Tone", h(t.tone ?? "", u, (e) => {
		t.tone = e || void 0, i();
	})), f("Emphasis", h(t.emphasis ?? "", d, (e) => {
		t.emphasis = e || void 0, i();
	})), f("Kod", p(t.code, (e) => {
		t.code = e || void 0, i();
	})), f("Ukryj kod po (s)", p(t.codeHideAfter, (e) => {
		t.codeHideAfter = e || void 0, i();
	}))), a.append(o, s, c), a;
}
//#endregion
export { _ as initPlaceEditorUi };
