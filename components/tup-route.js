import { defineCustomElement } from "./define-custom-element.js";
import { renderRouteStepMarkup } from "./tup-route-step.js";

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
        text: step.getAttribute("text"),
        distance: step.getAttribute("distance"),
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
  }
}

defineCustomElement("tup-route", TupRoute);
defineCustomElement("tup-route-steps", TupRoute);
