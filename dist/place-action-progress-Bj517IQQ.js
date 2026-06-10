//#region js/place-action-progress.js
var e = 2800, t = 1400;
function n(e, t = {}) {
	let { icon: n = "sparkle", iconPosition: r = "start" } = typeof t == "string" ? { icon: t } : t, i = document.createElement("button");
	i.type = "button", i.className = "place-action-button";
	let a = document.createElement("span");
	a.className = "place-action-button-fill", a.setAttribute("aria-hidden", "true");
	let o = document.createElement("span");
	o.className = "place-action-button-inner";
	let s = document.createElement("span");
	s.className = `place-action-button-icon place-action-button-icon--${n}`, s.setAttribute("aria-hidden", "true"), n === "send" && (s.innerHTML = "<svg class=\"place-action-button-svg\" viewBox=\"0 0 24 24\" aria-hidden=\"true\"><path fill=\"currentColor\" d=\"M2.01 21 23 12 2.01 3 2 10l15 2-15 2z\"/></svg>");
	let c = document.createElement("span");
	return c.className = "place-action-button-label", c.textContent = e, r === "end" ? o.append(c, s) : o.append(s, c), i.append(a, o), {
		button: i,
		fill: a,
		label: c
	};
}
function r(t, n = e) {
	let r = performance.now();
	return new Promise((e) => {
		let i = (a) => {
			let o = a - r, s = Math.min(1, o / n), c = 1 - (1 - s) ** 2;
			if (t(Math.round(c * 100)), s >= 1) {
				e();
				return;
			}
			requestAnimationFrame(i);
		};
		requestAnimationFrame(i);
	});
}
//#endregion
export { n, r, t };
