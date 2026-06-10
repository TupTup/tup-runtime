import { defineCustomElement } from "./define-custom-element.js";
import { renderRouteStepMarkup, bindSecretRouteSteps } from "./tup-route-step.js";

export class TupRoute extends HTMLElement {

  #headingId = null;

  connectedCallback() {
    if (!this.#headingId) {
      this.#headingId = `place-route-heading-${crypto.randomUUID()}`;
    }

    this.#render();
  }

  #render() {
    const steps = [...this.querySelectorAll(":scope > tup-route-step")].map(
      (step) => ({
        type: step.getAttribute("type"),
        label: step.getAttribute("label"),
        text: step.getAttribute("text"),
        tone: step.getAttribute("tone"),
        emphasis: step.getAttribute("emphasis"),
        direction: step.getAttribute("direction"),
        code: step.getAttribute("code"),
        codeHideAfter: step.getAttribute("code-hide-after"),
      })
    );

    const stepsHtml = steps
      .map((step) => renderRouteStepMarkup(step))
      .join("");

    this.innerHTML = `
      <section class="place-route-section" aria-labelledby="${this.#headingId}">
        <h2 id="${this.#headingId}" class="visually-hidden">
          Trasa
        </h2>

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
