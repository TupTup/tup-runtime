export const ACTION_SIMULATION_MS = 2800;

export function createActionButton(labelText, options = {}) {
  const {
    icon = "sparkle",
    iconPosition = "start",
  } = typeof options === "string" ? { icon: options } : options;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "place-action-button";

  const fill = document.createElement("span");
  fill.className = "place-action-button-fill";
  fill.setAttribute("aria-hidden", "true");

  const inner = document.createElement("span");
  inner.className = "place-action-button-inner";

  const iconEl = document.createElement("span");
  iconEl.className = `place-action-button-icon place-action-button-icon--${icon}`;
  iconEl.setAttribute("aria-hidden", "true");

  if (icon === "send") {
    iconEl.innerHTML =
      `<svg class="place-action-button-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z"/></svg>`;
  }

  const label = document.createElement("span");
  label.className = "place-action-button-label";
  label.textContent = labelText;

  if (iconPosition === "end") {
    inner.append(label, iconEl);
  } else {
    inner.append(iconEl, label);
  }

  button.append(fill, inner);

  return { button, fill, label };
}

export function simulateActionProgress(onProgress, duration = ACTION_SIMULATION_MS) {
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = (now) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / duration);
      const eased = 1 - (1 - ratio) ** 2;

      onProgress(Math.round(eased * 100));

      if (ratio >= 1) {
        resolve();
        return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
}
