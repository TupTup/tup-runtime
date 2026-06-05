import { renderRouteStepMarkup } from "./tup-route-step.js";

export class TupRoute extends HTMLElement {

  connectedCallback() {
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
      <section class="place-route-section" aria-labelledby="place-route-heading">
        <h2 id="place-route-heading" class="visually-hidden">
          Trasa
        </h2>

        <div class="route-steps-scroll" tabindex="0">
          <ol class="instruction-steps">
            ${stepsHtml}
          </ol>
        </div>
      </section>
    `;
  }
}

customElements.define(
  "tup-route",
  TupRoute
);
