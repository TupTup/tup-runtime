import {
  applyPlaceToDom,
  findPlaceRoot,
  getPlaceSlug,
  loadDraft,
  loadPublished,
} from "./place-model.js";

let currentMode = "view";
let usesDraft = false;

function readSearchParams() {
  return new URLSearchParams(window.location.search);
}

function resolveMode(params) {
  return params.get("mode") === "edit" ? "edit" : "view";
}

function resolveUsesDraft(params, mode, slug) {
  if (params.get("draft") === "1") {
    return Boolean(loadDraft(slug));
  }

  if (mode === "edit") {
    return Boolean(loadDraft(slug));
  }

  return false;
}

export function isRouteEditMode(params = readSearchParams()) {
  if (resolveMode(params) !== "edit" || params.get("draft") !== "1") {
    return false;
  }

  const placeRoot = findPlaceRoot();
  const slug = getPlaceSlug(placeRoot);

  return Boolean(loadDraft(slug)?.steps?.length);
}

function bootstrapPlaceMode() {
  const params = readSearchParams();
  const placeRoot = findPlaceRoot();

  currentMode = resolveMode(params);

  document.documentElement.dataset.mode = currentMode;

  if (!placeRoot) {
    return;
  }

  const slug = getPlaceSlug(placeRoot);

  document.documentElement.dataset.placeId = slug;
  usesDraft = resolveUsesDraft(params, currentMode, slug);

  if (usesDraft) {
    const draft = loadDraft(slug);

    if (draft) {
      applyPlaceToDom(placeRoot, draft, {
        includeRoute: currentMode !== "edit" || isRouteEditMode(params),
      });
    }

    if (currentMode === "view" && params.get("draft") === "1") {
      document.documentElement.dataset.draftPreview = "true";
    }
  } else if (currentMode === "view") {
    const published = loadPublished(slug);

    if (published) {
      applyPlaceToDom(placeRoot, published);
    }
  }
}

bootstrapPlaceMode();

export function getMode() {
  return currentMode;
}

export function isFreshDraftPreview() {
  const params = readSearchParams();

  return params.get("draft") === "1" && params.get("fresh") === "1";
}

export function buildPlaceUrl({
  mode = "view",
  draft = false,
  fresh = false,
  published = false,
} = {}) {
  const url = new URL(window.location.href);

  if (mode === "edit") {
    url.searchParams.set("mode", "edit");

    if (draft) {
      url.searchParams.set("draft", "1");
    } else {
      url.searchParams.delete("draft");
    }

    if (fresh && draft) {
      url.searchParams.set("fresh", "1");
    } else {
      url.searchParams.delete("fresh");
    }

    url.searchParams.delete("published");
  } else {
    url.searchParams.delete("mode");

    if (draft) {
      url.searchParams.set("draft", "1");
    } else {
      url.searchParams.delete("draft");
    }

    if (fresh && draft) {
      url.searchParams.set("fresh", "1");
    } else {
      url.searchParams.delete("fresh");
    }

    if (published) {
      url.searchParams.set("published", "1");
    } else {
      url.searchParams.delete("published");
    }
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function clearPublishedCelebrationParam() {
  const url = new URL(window.location.href);

  if (!url.searchParams.has("published")) {
    return;
  }

  url.searchParams.delete("published");
  window.history.replaceState(
    {},
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function isPublishedCelebration() {
  return readSearchParams().get("published") === "1";
}

export async function initPlaceEditor() {
  if (getMode() !== "edit") {
    return;
  }

  const { initPlaceEditActions } = await import("./place-view.js");

  initPlaceEditActions();

  if (isRouteEditMode()) {
    const { initPlaceRouteEditUi } = await import("./place-route-reorder.js");

    initPlaceRouteEditUi();
    return;
  }

  const { initPlaceEditorUi } = await import("./place-editor.js");

  initPlaceEditorUi();
}

export async function initPlaceView() {
  if (getMode() !== "view") {
    return;
  }

  const { initPlaceViewUi } = await import("./place-view.js");

  initPlaceViewUi();

  if (isPublishedCelebration()) {
    clearPublishedCelebrationParam();

    const { firePublishConfetti } = await import("./place-confetti.js");

    firePublishConfetti();
  }
}
