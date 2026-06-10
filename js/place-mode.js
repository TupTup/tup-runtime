import {
  applyPlaceToDom,
  findPlaceRoot,
  getPlaceSlug,
  loadDraft,
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
      applyPlaceToDom(placeRoot, draft);
    }
  }
}

bootstrapPlaceMode();

export function getMode() {
  return currentMode;
}

export function isDraftActive() {
  return usesDraft;
}

export function buildPlaceUrl({ mode = "view", draft = false } = {}) {
  const url = new URL(window.location.href);

  if (mode === "edit") {
    url.searchParams.set("mode", "edit");
    url.searchParams.delete("draft");
  } else {
    url.searchParams.delete("mode");

    if (draft) {
      url.searchParams.set("draft", "1");
    } else {
      url.searchParams.delete("draft");
    }
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export async function initPlaceEditor() {
  if (getMode() !== "edit") {
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
}
