import {
  clonePlaceModel,
  findPlaceContent,
  findPlaceRoot,
  getPlaceSlug,
  loadDraft,
  saveDraft,
} from "./place-model.js";
import { initPlaceViewUi } from "./place-view.js";

const MIN_REORDERABLE_STEPS = 3;

function clampReorderIndex(index, stepsLength) {
  const min = 1;
  const max = stepsLength - 2;

  return Math.max(min, Math.min(max, index));
}

function clampInsertIndex(index, stepsLength) {
  const min = 1;
  const max = stepsLength - 1;

  return Math.max(min, Math.min(max, index));
}

function reorderSteps(steps, fromIndex, toIndex) {
  if (fromIndex === toIndex) {
    return steps;
  }

  const next = [...steps];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);

  return next;
}

function resolveDropIndex(list, target, clientY, fallbackIndex) {
  if (!target) {
    return fallbackIndex;
  }

  const targetIndex = [...list.children].indexOf(target);
  const rect = target.getBoundingClientRect();
  const insertAfter = clientY >= rect.top + rect.height / 2;

  return insertAfter ? targetIndex + 1 : targetIndex;
}

export function decorateRouteReorderHandles(routeEl) {
  const list = routeEl?.querySelector(".route-steps");

  if (!list) {
    return;
  }

  const items = [...list.querySelectorAll(":scope > .route-step")];

  items.forEach((item, index) => {
    item.classList.remove(
      "route-step--fixed",
      "route-step--reorderable",
      "is-dragging",
      "is-drop-before",
      "is-drop-after",
    );

    if (index === 0 || index === items.length - 1) {
      item.classList.add("route-step--fixed");
      item.querySelector(".route-step-reorder-handle")?.remove();
      return;
    }

    item.classList.add("route-step--reorderable");

    if (item.querySelector(".route-step-reorder-handle")) {
      return;
    }

    const handle = document.createElement("button");
    handle.type = "button";
    handle.className = "route-step-reorder-handle";
    handle.setAttribute("aria-label", "Przenieś krok");
    item.append(handle);
  });
}

function clearDropMarkers(list) {
  list.querySelectorAll(".is-drop-before, .is-drop-after").forEach((item) => {
    item.classList.remove("is-drop-before", "is-drop-after");
  });
}

function bindReorderInteractions(routeEl, { slug, model }) {
  if (routeEl.dataset.reorderBound === "true") {
    return;
  }

  routeEl.dataset.reorderBound = "true";

  let active = null;

  const finishDrag = () => {
    if (!active) {
      return;
    }

    active.item.classList.remove("is-dragging");
    clearDropMarkers(active.list);
    active = null;
  };

  const applyReorder = (fromIndex, toIndex) => {
    const boundedFrom = clampReorderIndex(fromIndex, model.steps.length);
    let boundedTo = clampInsertIndex(toIndex, model.steps.length);

    if (boundedFrom < boundedTo) {
      boundedTo -= 1;
    }

    if (boundedFrom === boundedTo) {
      return;
    }

    model.steps = reorderSteps(model.steps, boundedFrom, boundedTo);
    saveDraft(slug, model);
    routeEl.setSteps(model.steps);
    decorateRouteReorderHandles(routeEl);
  };

  routeEl.addEventListener("pointerdown", (event) => {
    const handle = event.target.closest(".route-step-reorder-handle");

    if (!handle || event.button !== 0) {
      return;
    }

    const list = routeEl.querySelector(".route-steps");
    const item = handle.closest(".route-step--reorderable");

    if (!list || !item) {
      return;
    }

    event.preventDefault();
    handle.setPointerCapture(event.pointerId);

    active = {
      list,
      item,
      fromIndex: [...list.children].indexOf(item),
      pointerId: event.pointerId,
    };

    item.classList.add("is-dragging");
  });

  routeEl.addEventListener("pointermove", (event) => {
    if (!active || event.pointerId !== active.pointerId) {
      return;
    }

    clearDropMarkers(active.list);

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest(".route-step--reorderable");

    if (!target || target === active.item) {
      return;
    }

    const rect = target.getBoundingClientRect();
    target.classList.add(
      event.clientY < rect.top + rect.height / 2
        ? "is-drop-before"
        : "is-drop-after",
    );
  });

  const finishPointer = (event) => {
    if (!active || event.pointerId !== active.pointerId) {
      return;
    }

    const target = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest(".route-step--reorderable");

    const toIndex = clampInsertIndex(
      resolveDropIndex(active.list, target, event.clientY, active.fromIndex),
      model.steps.length,
    );

    applyReorder(active.fromIndex, toIndex);
    finishDrag();
  };

  routeEl.addEventListener("pointerup", finishPointer);
  routeEl.addEventListener("pointercancel", finishDrag);
}

export function initRouteReorder(routeEl, { slug, model }) {
  if (!routeEl || !model?.steps?.length) {
    return;
  }

  if (model.steps.length < MIN_REORDERABLE_STEPS) {
    return;
  }

  routeEl.classList.add("place-route-reorderable");
  decorateRouteReorderHandles(routeEl);
  bindReorderInteractions(routeEl, { slug, model });
}

export function initPlaceRouteEditUi() {
  const placeRoot = findPlaceRoot();
  const content = findPlaceContent(placeRoot);

  if (!placeRoot || !content) {
    return;
  }

  const slug = getPlaceSlug(placeRoot);
  const loaded = loadDraft(slug);

  if (!loaded?.steps?.length) {
    return;
  }

  const model = clonePlaceModel(loaded);
  const route = content.querySelector("tup-route");

  if (!route) {
    return;
  }

  route.setSteps(model.steps);
  initRouteReorder(route, { slug, model });

  const navigation = content.querySelector("tup-navigation-button");

  if (navigation) {
    navigation.hidden = true;
  }

  initPlaceViewUi();
}
