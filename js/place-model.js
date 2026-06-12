import { stepsToDescription } from "./place-route-generator.js";

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
  const photoEls = [...content.querySelectorAll("tup-place-photo")];
  const route = content.querySelector("tup-route");
  const steps = readSteps(route);

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
    photo: readPhotoFromElement(photoEls[0]),
    bentoPhotos:
      photoEls.length > 1
        ? photoEls.slice(1).map(readPhotoFromElement)
        : undefined,
    routeDescription: stepsToDescription(steps),
    steps,
    pickup: readMapPickup(content.querySelector("tup-map")),
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

export function readPhotoFromElement(photo) {
  if (!photo) {
    return {
      src: "",
      alt: "",
    };
  }

  return {
    src: photo.getAttribute("src") || "",
    alt: photo.getAttribute("alt") || "",
    caption: readOptionalAttr(photo, "caption"),
    fallbackSrc: readOptionalAttr(photo, "fallback-src"),
  };
}

export function syncPhotosFromDom(content, model) {
  const photoEls = [...content.querySelectorAll("tup-place-photo")];

  if (photoEls[0]) {
    model.photo = readPhotoFromElement(photoEls[0]);
  }

  if (photoEls.length > 1) {
    model.bentoPhotos = photoEls.slice(1).map(readPhotoFromElement);
  } else {
    delete model.bentoPhotos;
  }
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

function readMapPickup(map) {
  if (!map) {
    return undefined;
  }

  const lat = readOptionalAttr(map, "pickup-lat");
  const lng = readOptionalAttr(map, "pickup-lng");

  if (lat === undefined || lng === undefined) {
    return undefined;
  }

  return { lat, lng };
}

function applyMapModel(map, pickup) {
  if (!map || !pickup) {
    return;
  }

  const lat = pickup.lat;
  const lng = pickup.lng;

  if (lat === undefined || lat === null || lng === undefined || lng === null) {
    return;
  }

  setOptionalAttr(map, "pickup-lat", String(lat));
  setOptionalAttr(map, "pickup-lng", String(lng));
}

function applyPhotosModel(content, photo, bentoPhotos) {
  const photoEls = [...content.querySelectorAll("tup-place-photo")];

  applyPhotoModel(photoEls[0], photo);

  if (!bentoPhotos?.length) {
    return;
  }

  bentoPhotos.forEach((entry, index) => {
    applyPhotoModel(photoEls[index + 1], entry);
  });
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

export function applyPlaceToDom(placeRoot, model, { includeRoute = true } = {}) {
  const content = findPlaceContent(placeRoot);

  if (!content || !model) {
    return;
  }

  applyHeaderModel(content.querySelector("tup-place-header"), model.header);
  applyPhotosModel(content, model.photo, model.bentoPhotos);
  applyMapModel(content.querySelector("tup-map"), model.pickup);

  if (includeRoute) {
    applyStepsModel(content.querySelector("tup-route"), model.steps);
  }
}

function draftStorageKey(slug) {
  return `${DRAFT_PREFIX}${slug}`;
}

function publishedStorageKey(slug) {
  return `${draftStorageKey(slug)}:published`;
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

export function loadPublished(slug) {
  try {
    const raw = localStorage.getItem(publishedStorageKey(slug));

    if (!raw) {
      return null;
    }

    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function savePublished(slug, model) {
  localStorage.setItem(
    publishedStorageKey(slug),
    JSON.stringify({
      ...model,
      id: slug,
      publishedAt: new Date().toISOString(),
    })
  );
}

export function publishDraft(slug) {
  const draft = loadDraft(slug);

  if (!draft) {
    return false;
  }

  savePublished(slug, draft);
  clearDraft(slug);

  return true;
}

export function clearDraft(slug) {
  localStorage.removeItem(draftStorageKey(slug));
}

export function clonePlaceModel(model) {
  return structuredClone(model);
}
