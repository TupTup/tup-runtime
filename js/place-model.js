const DRAFT_PREFIX = "tuptup:place:";

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

export function findPlaceRoot() {
  return document.querySelector("#place");
}

export function findPlaceContent(placeRoot) {
  if (!placeRoot) {
    return null;
  }

  return placeRoot.querySelector(".sheet-content") || placeRoot;
}

export function getPlaceSlug(placeRoot = findPlaceRoot()) {
  const explicitId = placeRoot?.getAttribute("data-place-id")?.trim();

  if (explicitId) {
    return explicitId;
  }

  const segment = window.location.pathname
    .split("/")
    .filter(Boolean)
    .pop();

  return segment || "default";
}

function readOptionalAttr(element, name) {
  const value = element.getAttribute(name);

  if (value === null || value === "") {
    return undefined;
  }

  return value;
}

function readStepFromElement(step) {
  return {
    type: step.getAttribute("type") || "forward",
    label: readOptionalAttr(step, "label"),
    text: step.getAttribute("text") || "",
    tone: readOptionalAttr(step, "tone"),
    emphasis: readOptionalAttr(step, "emphasis"),
    direction: readOptionalAttr(step, "direction"),
    code: readOptionalAttr(step, "code"),
    codeHideAfter: readOptionalAttr(step, "code-hide-after"),
  };
}

function readSteps(routeEl) {
  if (!routeEl) {
    return [];
  }

  if (typeof routeEl.getSteps === "function") {
    return routeEl.getSteps();
  }

  return [...routeEl.querySelectorAll(":scope > tup-route-step")].map(
    readStepFromElement
  );
}

export function readPlaceFromDom(placeRoot = findPlaceRoot()) {
  const content = findPlaceContent(placeRoot);

  if (!content) {
    return null;
  }

  const header = content.querySelector("tup-place-header");
  const photo = content.querySelector("tup-place-photo");
  const route = content.querySelector("tup-route");

  return {
    id: getPlaceSlug(placeRoot),
    header: {
      name: header?.getAttribute("name") || "",
      summary: header?.getAttribute("summary") || "",
      address: header?.getAttribute("address") || "",
      lat: readOptionalAttr(header, "lat"),
      lng: readOptionalAttr(header, "lng"),
      plusCode: readOptionalAttr(header, "plus-code"),
      mapHref:
        readOptionalAttr(header, "map-href") ||
        readOptionalAttr(header, "maps"),
      vcard: readOptionalAttr(header, "vcard"),
      preview: readOptionalAttr(header, "preview"),
    },
    photo: {
      src: photo?.getAttribute("src") || "",
      alt: photo?.getAttribute("alt") || "",
      caption: readOptionalAttr(photo, "caption"),
      fallbackSrc: readOptionalAttr(photo, "fallback-src"),
    },
    steps: readSteps(route),
  };
}

function setOptionalAttr(element, name, value) {
  if (value === undefined || value === null || value === "") {
    element.removeAttribute(name);
    return;
  }

  element.setAttribute(name, value);
}

function applyHeaderModel(header, model) {
  if (!header || !model) {
    return;
  }

  setOptionalAttr(header, "name", model.name);
  setOptionalAttr(header, "summary", model.summary);
  setOptionalAttr(header, "address", model.address);
  setOptionalAttr(header, "lat", model.lat);
  setOptionalAttr(header, "lng", model.lng);
  setOptionalAttr(header, "plus-code", model.plusCode);
  setOptionalAttr(header, "map-href", model.mapHref);
  setOptionalAttr(header, "vcard", model.vcard);
  setOptionalAttr(header, "preview", model.preview);
}

function applyPhotoModel(photo, model) {
  if (!photo || !model) {
    return;
  }

  setOptionalAttr(photo, "src", model.src);
  setOptionalAttr(photo, "alt", model.alt);
  setOptionalAttr(photo, "caption", model.caption);
  setOptionalAttr(photo, "fallback-src", model.fallbackSrc);
}

function renderStepMarker(step) {
  const attrs = [
    `type="${escapeAttr(step.type || "forward")}"`,
    `text="${escapeAttr(step.text || "")}"`,
  ];

  if (step.label) {
    attrs.push(`label="${escapeAttr(step.label)}"`);
  }

  if (step.tone) {
    attrs.push(`tone="${escapeAttr(step.tone)}"`);
  }

  if (step.emphasis) {
    attrs.push(`emphasis="${escapeAttr(step.emphasis)}"`);
  }

  if (step.direction) {
    attrs.push(`direction="${escapeAttr(step.direction)}"`);
  }

  if (step.code) {
    attrs.push(`code="${escapeAttr(step.code)}"`);
  }

  if (step.codeHideAfter) {
    attrs.push(`code-hide-after="${escapeAttr(step.codeHideAfter)}"`);
  }

  return `<tup-route-step ${attrs.join(" ")}></tup-route-step>`;
}

function applyStepsModel(route, steps) {
  if (!route) {
    return;
  }

  if (typeof route.setSteps === "function") {
    route.setSteps(steps);
    return;
  }

  route.innerHTML = steps.map(renderStepMarker).join("");
}

export function applyPlaceToDom(placeRoot, model) {
  const content = findPlaceContent(placeRoot);

  if (!content || !model) {
    return;
  }

  applyHeaderModel(content.querySelector("tup-place-header"), model.header);
  applyPhotoModel(content.querySelector("tup-place-photo"), model.photo);
  applyStepsModel(content.querySelector("tup-route"), model.steps);
}

export function draftStorageKey(slug) {
  return `${DRAFT_PREFIX}${slug}`;
}

export function loadDraft(slug) {
  try {
    const raw = localStorage.getItem(draftStorageKey(slug));

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveDraft(slug, model) {
  localStorage.setItem(
    draftStorageKey(slug),
    JSON.stringify({
      ...model,
      id: slug,
      savedAt: new Date().toISOString(),
    })
  );
}

export function clearDraft(slug) {
  localStorage.removeItem(draftStorageKey(slug));
}

export function clonePlaceModel(model) {
  return structuredClone(model);
}
