import { defineCustomElement } from "./define-custom-element.js";

class TupFooter extends HTMLElement {

  connectedCallback() {
    if (this.querySelector(".place-footer")) {
      return;
    }

    this.innerHTML = `
      <footer class="place-footer">
        <span class="place-footer-logo" role="img" aria-label="TupTup"></span>
      </footer>
    `;
  }
}

defineCustomElement(
  "tup-footer",
  TupFooter
);
