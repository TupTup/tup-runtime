import {
  findPlaceContent,
  findPlaceRoot,
  getPlaceSlug,
  loadDraft,
  publishDraft,
} from "./place-model.js";
import {
  createActionButton,
  PUBLISH_SIMULATION_MS,
  simulateActionProgress,
} from "./place-action-progress.js";
import { buildPlaceUrl } from "./place-mode.js";

function readSearchParams() {
  return new URLSearchParams(window.location.search);
}

function isDraftPreviewMode(params = readSearchParams()) {
  return params.get("draft") === "1";
}

function buildEditTupUrl(slug) {
  const draft = loadDraft(slug);

  if (draft?.steps?.length) {
    return buildPlaceUrl({ mode: "edit", draft: true });
  }

  return buildPlaceUrl({ mode: "edit" });
}

function insertActionsBeforeFooter(content, actions) {
  const footer = content.querySelector("tup-footer");

  if (footer) {
    footer.insertAdjacentElement("beforebegin", actions);
  } else {
    content.append(actions);
  }
}

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

export function initPlaceEditActions() {
  const placeRoot = findPlaceRoot();
  const content = findPlaceContent(placeRoot);

  if (!placeRoot || !content || content.querySelector(".place-edit-actions")) {
    return;
  }

  const slug = getPlaceSlug(placeRoot);

  if (!loadDraft(slug)) {
    return;
  }

  const actions = document.createElement("section");
  actions.className = "place-view-actions place-edit-actions";

  const previewLink = document.createElement("a");
  previewLink.className = "place-route-compose-preview";
  previewLink.href = buildPlaceUrl({ mode: "view", draft: true });
  previewLink.textContent = "Podgląd tupa";

  actions.append(previewLink);
  insertActionsBeforeFooter(content, actions);
}

export function initPlaceViewUi() {
  const params = readSearchParams();

  if (!isDraftPreviewMode(params)) {
    return;
  }

  const placeRoot = findPlaceRoot();
  const content = findPlaceContent(placeRoot);

  if (!placeRoot || !content || content.querySelector(".place-view-actions")) {
    return;
  }

  const slug = getPlaceSlug(placeRoot);
  const draft = loadDraft(slug);
  const showPublish = Boolean(draft?.steps?.length);

  const actions = document.createElement("section");
  actions.className = "place-view-actions";

  const editLink = document.createElement("a");
  editLink.className = "place-route-compose-preview";
  editLink.href = buildEditTupUrl(slug);
  editLink.textContent = "Edytuj tupa";

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
      }, PUBLISH_SIMULATION_MS);

      if (!publishDraft(slug)) {
        resetPublishButton(publishButton, publishFill, publishLabel);
        editLink.inert = false;
        isPublishing = false;
        return;
      }

      window.location.assign(
        buildPlaceUrl({ mode: "view", draft: false, published: true }),
      );
    });

    actions.append(publishButton);
  }

  actions.append(editLink);
  insertActionsBeforeFooter(content, actions);
}
