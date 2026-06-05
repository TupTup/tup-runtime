export function defineCustomElement(name, constructor) {
  if (!customElements.get(name)) {
    customElements.define(name, constructor);
  }
}
