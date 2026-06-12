import { defineCustomElement } from "./define-custom-element.js";
import { renderRouteStepMarkup, bindSecretRouteSteps } from "./tup-route-step.js";

function readStepFromElement(step) {
  return {
    type: step.getAttribute("type"),
    label: step.getAttribute("label") || undefined,
    text: step.getAttribute("text"),
    tone: step.getAttribute("tone") || undefined,
    emphasis: step.getAttribute("emphasis") || undefined,
    direction: step.getAttribute("direction") || undefined,
    code: step.getAttribute("code") || undefined,
    codeHideAfter: step.getAttribute("code-hide-after") || undefined,
  };
}

export class TupRoute extends HTMLElement {

  #steps = [];
  #initialized = false;

  connectedCallback() {
    if (!this.#initialized) {
      this.#steps = this.#readStepsFromDom();
      this.#initialized = true;
    }

    this.#render();
  }

  #readStepsFromDom() {
    return [...this.querySelectorAll(":scope > tup-route-step")].map(
      readStepFromElement
    );
  }

  getSteps() {
    return this.#steps.map((step) => ({ ...step }));
  }

  setSteps(steps) {
    this.#steps = steps.map((step) => ({ ...step }));

    if (this.isConnected) {
      this.#render();
    }
  }

  refresh() {
    if (this.isConnected) {
      this.#render();
    }
  }

  #render() {
    const stepsHtml = this.#steps
      .map((step) => renderRouteStepMarkup(step))
      .join("");

    this.innerHTML = `
      <section class="place-route-section" aria-label="Trasa">
        <div class="route-steps-scroll" tabindex="0">
          <ol class="route-steps">
            ${stepsHtml}
          </ol>
        </div>
      </section>
    `;

    bindSecretRouteSteps(this);
  }
}

defineCustomElement(
  "tup-route",
  TupRoute
);
