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

function getSortable() {
  return window.Sortable;
}

export function decorateRouteReorderHandles(routeEl) {
  const list = routeEl?.querySelector(".route-steps");

  if (!list) {
    return;
  }

  const items = [...list.querySelectorAll(":scope > .route-step")];

  items.forEach((item, index) => {
    item.classList.remove("route-step--fixed", "route-step--reorderable");

    if (index === 0 || index === items.length - 1) {
      item.classList.add("route-step--fixed");
      item.querySelector(".route-step-reorder-handle")?.remove();
      return;
    }

    item.classList.add("route-step--reorderable");

    if (item.querySelector(".route-step-reorder-handle")) {
      return;
    }

    const handle = document.createElement("span");
    handle.className = "route-step-reorder-handle";
    handle.setAttribute("aria-hidden", "true");
    item.append(handle);
  });
}

function destroyRouteSortable(routeEl) {
  routeEl._sortable?.destroy();
  routeEl._sortable = null;
}

function bindRouteSortable(routeEl, { slug, model }) {
  const Sortable = getSortable();
  const list = routeEl.querySelector(".route-steps");

  if (!Sortable || !list) {
    return;
  }

  destroyRouteSortable(routeEl);

  routeEl._sortable = Sortable.create(list, {
    animation: 280,
    easing: "cubic-bezier(0.2, 0, 0, 1)",
    draggable: ".route-step--reorderable",
    filter: "button, a, input, textarea",
    preventOnFilter: true,
    ghostClass: "route-step--sortable-ghost",
    chosenClass: "route-step--sortable-chosen",
    dragClass: "route-step--sortable-drag",
    onStart() {
      list.classList.add("is-reorder-active");
    },
    onEnd(event) {
      list.classList.remove("is-reorder-active");

      if (event.oldIndex === event.newIndex) {
        return;
      }

      const next = [...model.steps];
      const [moved] = next.splice(event.oldIndex, 1);
      next.splice(event.newIndex, 0, moved);
      model.steps = next;
      saveDraft(slug, model);
    },
  });
}

export function initRouteReorder(routeEl, { slug, model }) {
  if (!routeEl || !model?.steps?.length) {
    return;
  }

  if (model.steps.length < MIN_REORDERABLE_STEPS) {
    return;
  }

  if (!getSortable()) {
    return;
  }

  routeEl.classList.add("place-route-reorderable");
  decorateRouteReorderHandles(routeEl);
  bindRouteSortable(routeEl, { slug, model });
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
