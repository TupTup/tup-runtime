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

export function renderRouteStepMarkup({
  type,
  text,
  distance,
}) {
  const stepType = escapeHtml(type || "forward");
  const distanceHtml = distance
    ? `<span class="route-step-distance">${escapeHtml(distance)}</span>`
    : "";

  const textHtml = renderInlineMarkdown(text);

  return `
    <li class="route-step">
      <div class="route-step-icon-wrap" aria-hidden="true">
        <span class="route-step-icon route-step-icon--${stepType}"></span>
      </div>

      <span class="route-step-text">
        ${textHtml}
      </span>

      ${distanceHtml}
    </li>
  `;
}

class TupRouteStep extends HTMLElement {}

defineCustomElement(
  "tup-route-step",
  TupRouteStep
);
