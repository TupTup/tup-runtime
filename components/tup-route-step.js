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

function plainStepText(text) {
  return String(text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1");
}

function stepAriaLabel(type, label, text) {
  const typeLabel = stepTypeLabel(type || "forward");
  const plainLabel = String(label ?? "").trim();
  const plainText = plainStepText(text).trim();
  const parts = [plainLabel, plainText].filter(Boolean);

  if (parts.length) {
    return parts.join(": ");
  }

  return typeLabel;
}

function renderStepText(label, text) {
  const textHtml = renderInlineMarkdown(text);

  if (!label) {
    return `
      <span class="route-step-text">
        <span class="route-step-value">${textHtml}</span>
      </span>
    `;
  }

  return `
    <span class="route-step-text">
      <span class="route-step-label">${escapeHtml(label)}</span>
      <span class="route-step-value">${textHtml}</span>
    </span>
  `;
}

export function renderRouteStepMarkup({
  type,
  label,
  text,
  tone,
  emphasis,
}) {
  const stepType = escapeHtml(type || "forward");
  const toneClass = tone === "warning" || tone === "secondary"
    ? ` route-step--${escapeHtml(tone)}`
    : "";
  const emphasisClass = emphasis === "primary"
    ? " route-step--primary"
    : "";

  const textHtml = renderStepText(label, text);
  const ariaLabel = escapeHtml(stepAriaLabel(type, label, text));

  return `
    <li class="route-step${toneClass}${emphasisClass}" aria-label="${ariaLabel}">
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
