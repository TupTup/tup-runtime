import { defineCustomElement } from "./define-custom-element.js";

class TupNavigationButton extends HTMLElement {

  connectedCallback() {
    if (this.querySelector("button")) {
      return;
    }

    const label = this.textContent.trim() || "Prowadź";

    this.textContent = "";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "navigation-button";
    button.textContent = label;

    button.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("tup:navigate", {
          bubbles: true,
          composed: true,
        })
      );
    });

    this.append(button);
  }
}

defineCustomElement(
  "tup-navigation-button",
  TupNavigationButton
);
