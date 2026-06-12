const CONFETTI_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function createBurst(particles, originX, originY, count, velocityScale = 1) {
  for (let index = 0; index < count; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const velocity = (7 + Math.random() * 12) * velocityScale;

    particles.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * velocity,
      vy: Math.sin(angle) * velocity - (6 + Math.random() * 8),
      width: 5 + Math.random() * 7,
      height: 4 + Math.random() * 8,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.35,
      opacity: 1,
    });
  }
}

export function firePublishConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  const article = document.querySelector("#place");

  if (!article) {
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.className = "place-publish-confetti";
  canvas.setAttribute("aria-hidden", "true");
  article.append(canvas);

  const context = canvas.getContext("2d");
  const particles = [];

  let width = article.offsetWidth;
  let height = article.offsetHeight;

  const resize = () => {
    width = article.offsetWidth;
    height = article.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  };

  resize();
  window.addEventListener("resize", resize);

  createBurst(particles, width * 0.5, height * 0.52, 90, 1.1);
  createBurst(particles, width * 0.35, height * 0.45, 35, 0.9);
  createBurst(particles, width * 0.65, height * 0.45, 35, 0.9);

  const gravity = 0.34;
  const drag = 0.985;
  let frame = 0;
  const maxFrames = 190;

  const animate = () => {
    context.clearRect(0, 0, width, height);

    let hasVisibleParticles = false;

    for (const particle of particles) {
      particle.vx *= drag;
      particle.vy = particle.vy * drag + gravity;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.rotation += particle.rotationSpeed;

      if (frame > maxFrames * 0.55) {
        particle.opacity = Math.max(0, particle.opacity - 0.025);
      }

      if (particle.opacity <= 0 || particle.y > height + 40) {
        continue;
      }

      hasVisibleParticles = true;

      context.save();
      context.globalAlpha = particle.opacity;
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillStyle = particle.color;
      context.fillRect(
        -particle.width / 2,
        -particle.height / 2,
        particle.width,
        particle.height,
      );
      context.restore();
    }

    frame += 1;

    if (hasVisibleParticles && frame < maxFrames) {
      requestAnimationFrame(animate);
      return;
    }

    window.removeEventListener("resize", resize);
    canvas.remove();
  };

  requestAnimationFrame(animate);
}
