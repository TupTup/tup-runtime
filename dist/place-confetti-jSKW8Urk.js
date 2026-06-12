//#region js/place-confetti.js
var e = [
	"#f59e0b",
	"#10b981",
	"#3b82f6",
	"#ef4444",
	"#8b5cf6",
	"#ec4899"
];
function t(t, n, r, i, a = 1) {
	for (let o = 0; o < i; o += 1) {
		let i = Math.random() * Math.PI * 2, o = (7 + Math.random() * 12) * a;
		t.push({
			x: n,
			y: r,
			vx: Math.cos(i) * o,
			vy: Math.sin(i) * o - (6 + Math.random() * 8),
			width: 5 + Math.random() * 7,
			height: 4 + Math.random() * 8,
			color: e[Math.floor(Math.random() * e.length)],
			rotation: Math.random() * Math.PI * 2,
			rotationSpeed: (Math.random() - .5) * .35,
			opacity: 1
		});
	}
}
function n() {
	if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
	let e = document.querySelector("#place");
	if (!e) return;
	let n = document.createElement("canvas");
	n.className = "place-publish-confetti", n.setAttribute("aria-hidden", "true"), e.append(n);
	let r = n.getContext("2d"), i = [], a = e.offsetWidth, o = e.offsetHeight, s = () => {
		a = e.offsetWidth, o = e.offsetHeight, n.width = a, n.height = o;
	};
	s(), window.addEventListener("resize", s), t(i, a * .5, o * .52, 90, 1.1), t(i, a * .35, o * .45, 35, .9), t(i, a * .65, o * .45, 35, .9);
	let c = .985, l = 0, u = () => {
		r.clearRect(0, 0, a, o);
		let e = !1;
		for (let t of i) t.vx *= c, t.vy = t.vy * c + .34, t.x += t.vx, t.y += t.vy, t.rotation += t.rotationSpeed, l > 190 * .55 && (t.opacity = Math.max(0, t.opacity - .025)), !(t.opacity <= 0 || t.y > o + 40) && (e = !0, r.save(), r.globalAlpha = t.opacity, r.translate(t.x, t.y), r.rotate(t.rotation), r.fillStyle = t.color, r.fillRect(-t.width / 2, -t.height / 2, t.width, t.height), r.restore());
		if (l += 1, e && l < 190) {
			requestAnimationFrame(u);
			return;
		}
		window.removeEventListener("resize", s), n.remove();
	};
	requestAnimationFrame(u);
}
//#endregion
export { n as firePublishConfetti };
