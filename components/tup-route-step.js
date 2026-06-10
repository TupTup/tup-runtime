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
  forward: "Dalej",
};

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
  const labelHtml = hasLabel ? escapeHtml(label) : "";
  const labelClass = hasLabel
    ? "route-step-label"
    : "route-step-label route-step-label--placeholder";

  return `
    <span class="route-step-text">
      <span class="${labelClass}"${hasLabel ? "" : " aria-hidden=\"true\""}>${labelHtml}</span>
      <span class="route-step-value${direction ? " route-step-value--directed" : ""}">${valueHtml}</span>
    </span>
  `;
}

export function renderRouteStepMarkup({
  type,
  label,
  text,
  tone,
  emphasis,
  direction,
}) {
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
