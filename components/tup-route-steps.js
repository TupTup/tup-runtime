import { defineCustomElement } from "./define-custom-element.js";
import { TupRoute } from "./tup-route.js";

class TupRouteSteps extends TupRoute {}

defineCustomElement(
  "tup-route-steps",
  TupRouteSteps
);
