import {
  findPlaceContent,
  findPlaceRoot,
  getPlaceSlug,
  loadDraft,
  publishDraft,
} from "./place-model.js";
import { buildPlaceUrl, isFreshDraftPreview } from "./place-mode.js";

export function initPlaceViewUi() {
  const placeRoot = findPlaceRoot();
  const content = findPlaceContent(placeRoot);

  if (!placeRoot || !content || content.querySelector(".place-view-actions")) {
    return;
  }

  const slug = getPlaceSlug(placeRoot);
  const draft = loadDraft(slug);
  const showPublish =
    isFreshDraftPreview() && Boolean(draft?.steps?.length);

  const actions = document.createElement("section");
  actions.className = "place-view-actions";

  if (showPublish) {
    const publishButton = document.createElement("button");
    publishButton.type = "button";
    publishButton.className = "place-view-publish";
    publishButton.textContent = "Publikuj";

    publishButton.addEventListener("click", () => {
      if (!publishDraft(slug)) {
        return;
      }

      window.location.assign(buildPlaceUrl({ mode: "view", draft: false }));
    });

    actions.append(publishButton);
  }

  const editLink = document.createElement("a");
  editLink.className = "place-route-compose-preview";
  editLink.href = buildPlaceUrl({ mode: "edit" });
  editLink.textContent = "Edytuj drogę";

  actions.append(editLink);

  const footer = content.querySelector("tup-footer");

  if (footer) {
    footer.insertAdjacentElement("beforebegin", actions);
  } else {
    content.append(actions);
  }
}
