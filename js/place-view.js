import { findPlaceContent, findPlaceRoot } from "./place-model.js";
import { buildPlaceUrl } from "./place-mode.js";

export function initPlaceViewUi() {
  const placeRoot = findPlaceRoot();
  const content = findPlaceContent(placeRoot);

  if (!placeRoot || !content || content.querySelector(".place-view-actions")) {
    return;
  }

  const actions = document.createElement("section");
  actions.className = "place-view-actions";

  const link = document.createElement("a");
  link.className = "place-route-compose-preview";
  link.href = buildPlaceUrl({ mode: "edit" });
  link.textContent = "Edytuj drogę";

  actions.append(link);

  const footer = content.querySelector("tup-footer");

  if (footer) {
    footer.insertAdjacentElement("beforebegin", actions);
  } else {
    content.append(actions);
  }
}
