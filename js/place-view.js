import {
  findPlaceContent,
  findPlaceRoot,
  getPlaceSlug,
  loadDraft,
  publishDraft,
} from "./place-model.js";
import {
  createActionButton,
  simulateActionProgress,
} from "./place-action-progress.js";
import { buildPlaceUrl, isFreshDraftPreview } from "./place-mode.js";

function resetPublishButton(button, fill, label) {
  button.classList.remove("is-generating");
  label.textContent = "Publikuj";
  fill.style.width = "0%";
  button.removeAttribute("aria-busy");
  button.removeAttribute("aria-valuemin");
  button.removeAttribute("aria-valuemax");
  button.removeAttribute("aria-valuenow");
  button.removeAttribute("aria-label");
  button.disabled = false;
}

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

  const editLink = document.createElement("a");
  editLink.className = "place-route-compose-preview";
  editLink.href = buildPlaceUrl({ mode: "edit" });
  editLink.textContent = "Edytuj drogę";

  let isPublishing = false;

  if (showPublish) {
    const {
      button: publishButton,
      fill: publishFill,
      label: publishLabel,
    } = createActionButton("Publikuj", {
      icon: "send",
      iconPosition: "end",
    });

    publishButton.classList.add("place-view-publish");

    publishButton.addEventListener("click", async () => {
      if (isPublishing) {
        return;
      }

      isPublishing = true;
      publishButton.disabled = true;
      editLink.inert = true;
      publishButton.classList.add("is-generating");
      publishLabel.textContent = "Publikuję…";
      publishFill.style.width = "0%";
      publishButton.setAttribute("aria-busy", "true");
      publishButton.setAttribute("aria-valuemin", "0");
      publishButton.setAttribute("aria-valuemax", "100");
      publishButton.setAttribute("aria-valuenow", "0");
      publishButton.setAttribute("aria-label", "Publikuję…");

      await simulateActionProgress((value) => {
        publishFill.style.width = `${value}%`;
        publishButton.setAttribute("aria-valuenow", String(value));
      });

      if (!publishDraft(slug)) {
        resetPublishButton(publishButton, publishFill, publishLabel);
        editLink.inert = false;
        isPublishing = false;
        return;
      }

      window.location.assign(buildPlaceUrl({ mode: "view", draft: false }));
    });

    actions.append(publishButton);
  }

  actions.append(editLink);

  const footer = content.querySelector("tup-footer");

  if (footer) {
    footer.insertAdjacentElement("beforebegin", actions);
  } else {
    content.append(actions);
  }
}
