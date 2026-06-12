import { defineCustomElement } from "./define-custom-element.js";
import { escapeHtml } from "./tup-html.js";

function renderInlineMarkdown(text) {
  const value = String(text ?? "");
  const parts = [];
  const boldPattern = /\*\*([^*]+)\*\*/g;
  let lastIndex = 0;
  let match;

  while ((match = boldPattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      parts.push(escapeHtml(value.slice(lastIndex, match.index)));
    }

    parts.push(
      `<strong class="route-step-bold">${escapeHtml(match[1])}</strong>`
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push(escapeHtml(value.slice(lastIndex)));
  }

  return parts.length ? parts.join("") : escapeHtml(value);
}

const STEP_TYPE_LABELS = {
  building: "Budynek",
  entrance: "Wejście",
  hand: "Ochrona",
  reception: "Recepcja",
  stairs: "Schody",
  door: "Drzwi",
  start: "Start",
  left: "Skręć w lewo",
  right: "Skręć w prawo",
  forward: "Idź prosto",
  straight: "Idź prosto",
  floor: "Zmiana piętra",
  key: "Kod",
};

const SECRET_MASK = "****";
const DEFAULT_CODE_HIDE_SECONDS = 15;

function parseHideAfterSeconds(value) {
  const seconds = Number.parseInt(String(value ?? "").trim(), 10);

  if (!Number.isFinite(seconds) || seconds <= 0) {
    return DEFAULT_CODE_HIDE_SECONDS;
  }

  return seconds;
}

function stepTypeLabel(type) {
  return STEP_TYPE_LABELS[type] ?? "Krok";
}

const DIRECTION_MARKERS = {
  right: { position: "after", symbol: "→", label: "po prawej" },
  left: { position: "before", symbol: "←", label: "po lewej" },
  up: { position: "after", symbol: "↑", label: "naprzeciwko" },
  down: { position: "after", symbol: "↓", label: "niżej" },
};

function directionMarker(direction) {
  const key = String(direction ?? "").trim().toLowerCase();

  return DIRECTION_MARKERS[key] ?? null;
}

function plainStepText(text) {
  return String(text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1");
}

function renderDirectedValue(text, direction) {
  const marker = directionMarker(direction);

  if (!marker) {
    return renderInlineMarkdown(text);
  }

  const valueHtml = renderInlineMarkdown(text);
  const arrowHtml = `<span class="route-step-direction" aria-hidden="true">${escapeHtml(marker.symbol)}</span>`;

  if (marker.position === "before") {
    return `${arrowHtml}<span class="route-step-value-text">${valueHtml}</span>`;
  }

  return `<span class="route-step-value-text">${valueHtml}</span>${arrowHtml}`;
}

function stepAriaLabel(type, label, text, direction) {
  const typeLabel = stepTypeLabel(type || "forward");
  const plainLabel = String(label ?? "").trim();
  const plainText = plainStepText(text).trim();
  const marker = directionMarker(direction);
  const valueLabel = marker && plainText
    ? `${plainText} ${marker.label}`
    : plainText;
  const parts = [plainLabel, valueLabel].filter(Boolean);

  if (parts.length) {
    return parts.join(": ");
  }

  return typeLabel;
}

function renderStepText(label, text, direction) {
  const valueHtml = renderDirectedValue(text, direction);
  const hasLabel = Boolean(String(label ?? "").trim());
  const labelHtml = hasLabel
    ? `<span class="route-step-label">${escapeHtml(label)}</span>`
    : "";

  return `
    <span class="route-step-text">
      ${labelHtml}
      <span class="route-step-value${direction ? " route-step-value--directed" : ""}">${valueHtml}</span>
    </span>
  `;
}

function renderSecretCodeStep({ type, text, code, codeHideAfter }) {
  const stepType = escapeHtml(type || "key");
  const prefix = String(text ?? "").trim() || "Wprowadź kod";
  const safeCode = escapeHtml(code);
  const hideAfter = parseHideAfterSeconds(codeHideAfter);
  const ariaLabel = escapeHtml(`${prefix}: kod ukryty`);

  return `
    <li
      class="route-step route-step--secret"
      data-code="${safeCode}"
      data-hide-after="${hideAfter}"
      aria-label="${ariaLabel}"
    >
      <div class="route-step-icon-wrap" aria-hidden="true">
        <span class="route-step-icon route-step-icon--${stepType}"></span>
      </div>

      <span class="route-step-text route-step-text--secret">
        <span class="route-step-value">
          ${escapeHtml(prefix)}
          <span class="route-step-code" aria-live="polite">${escapeHtml(SECRET_MASK)}</span>
        </span>

        <button
          type="button"
          class="route-step-reveal"
          aria-label="Pokaż kod"
          aria-pressed="false"
        ></button>
      </span>
    </li>
  `;
}

export function bindSecretRouteSteps(root) {
  root.querySelectorAll(".route-step--secret").forEach((step) => {
    const code = step.dataset.code ?? "";
    const badge = step.querySelector(".route-step-code");
    const button = step.querySelector(".route-step-reveal");

    if (!code || !badge || !button || button.dataset.bound === "true") {
      return;
    }

    button.dataset.bound = "true";

    const prefix = (step.getAttribute("aria-label") ?? "Wprowadź kod: kod ukryty")
      .replace(/: kod ukryty$/, "")
      .trim() || "Wprowadź kod";
    const hideAfterMs = parseHideAfterSeconds(step.dataset.hideAfter) * 1000;
    let hideTimer = null;

    function clearHideTimer() {
      if (hideTimer !== null) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    }

    function hideCode() {
      clearHideTimer();
      badge.textContent = SECRET_MASK;
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Pokaż kod");
      button.classList.remove("route-step-reveal--visible");
      step.setAttribute("aria-label", `${prefix}: kod ukryty`);
    }

    function revealCode() {
      clearHideTimer();
      badge.textContent = code;
      button.setAttribute("aria-pressed", "true");
      button.setAttribute("aria-label", "Ukryj kod");
      button.classList.add("route-step-reveal--visible");
      step.setAttribute("aria-label", `${prefix}: ${code}`);
      hideTimer = setTimeout(hideCode, hideAfterMs);
    }

    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") {
        hideCode();
        return;
      }

      revealCode();
    });
  });
}

export function renderRouteStepMarkup({
  type,
  label,
  text,
  tone,
  emphasis,
  direction,
  code,
  codeHideAfter,
}) {
  if (code) {
    return renderSecretCodeStep({
      type,
      text,
      code,
      codeHideAfter,
    });
  }

  const stepType = escapeHtml(type || "forward");
  const toneClass = tone === "warning" || tone === "secondary"
    ? ` route-step--${escapeHtml(tone)}`
    : "";
  const emphasisClass = emphasis === "primary"
    ? " route-step--primary"
    : "";
  const targetClass = type === "target"
    ? " route-step--target"
    : "";

  const textHtml = renderStepText(label, text, direction);
  const ariaLabel = escapeHtml(stepAriaLabel(type, label, text, direction));

  return `
    <li class="route-step${toneClass}${emphasisClass}${targetClass}" aria-label="${ariaLabel}">
      <div class="route-step-icon-wrap" aria-hidden="true">
        <span class="route-step-icon route-step-icon--${stepType}"></span>
      </div>

      ${textHtml}
    </li>
  `;
}

class TupRouteStep extends HTMLElement {}

defineCustomElement(
  "tup-route-step",
  TupRouteStep
);
