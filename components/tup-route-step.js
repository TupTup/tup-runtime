import { escapeHtml } from "./tup-html.js";

export const ROUTE_ICONS = {
  door: "door.svg",
  stairs: "stairs.svg",
  user: "reception.svg",
  reception: "reception.svg",
  elevator: "elevator-up.svg",
  left: "turn-left.svg",
  right: "turn-right.svg",
  forward: "forward.svg",
  target: "target.svg",
};

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
      `<strong class="instruction-step-bold">${escapeHtml(match[1])}</strong>`
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
  const iconFile = ROUTE_ICONS[type] ?? ROUTE_ICONS.forward;
  const distanceHtml = distance
    ? `<span class="instruction-step-distance">${escapeHtml(distance)}</span>`
    : "";

  const textHtml = renderInlineMarkdown(text);

  return `
    <li class="instruction-step">
      <div class="instruction-step-icon-wrap" aria-hidden="true">
        <img
          class="instruction-step-icon"
          src="/images/icons/${iconFile}"
          alt=""
        />
      </div>

      <span class="instruction-step-text">
        ${textHtml}
      </span>

      ${distanceHtml}
    </li>
  `;
}

class TupRouteStep extends HTMLElement {}

customElements.define(
  "tup-route-step",
  TupRouteStep
);
