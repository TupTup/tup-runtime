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
	let e = document.createElement("canvas");
	e.className = "place-publish-confetti", e.setAttribute("aria-hidden", "true"), document.body.append(e);
	let n = e.getContext("2d"), r = [], i = window.innerWidth, a = window.innerHeight, o = () => {
		i = window.innerWidth, a = window.innerHeight, e.width = i, e.height = a;
	};
	o(), window.addEventListener("resize", o), t(r, i * .5, a * .52, 90, 1.1), t(r, i * .35, a * .45, 35, .9), t(r, i * .65, a * .45, 35, .9);
	let s = .985, c = 0, l = () => {
		n.clearRect(0, 0, i, a);
		let t = !1;
		for (let e of r) e.vx *= s, e.vy = e.vy * s + .34, e.x += e.vx, e.y += e.vy, e.rotation += e.rotationSpeed, c > 190 * .55 && (e.opacity = Math.max(0, e.opacity - .025)), !(e.opacity <= 0 || e.y > a + 40) && (t = !0, n.save(), n.globalAlpha = e.opacity, n.translate(e.x, e.y), n.rotate(e.rotation), n.fillStyle = e.color, n.fillRect(-e.width / 2, -e.height / 2, e.width, e.height), n.restore());
		if (c += 1, t && c < 190) {
			requestAnimationFrame(l);
			return;
		}
		window.removeEventListener("resize", o), e.remove();
	};
	requestAnimationFrame(l);
}
//#endregion
export { n as firePublishConfetti };
