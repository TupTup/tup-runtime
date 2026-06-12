import {
  clonePlaceModel,
  findPlaceContent,
  findPlaceRoot,
  getPlaceSlug,
  loadDraft,
  readPlaceFromDom,
  saveDraft,
  syncPhotosFromDom,
} from "./place-model.js";
import { buildPlaceUrl } from "./place-mode.js";
import {
  createActionButton,
  simulateActionProgress,
} from "./place-action-progress.js";
import {
  generateStepsFromDescription,
  stepsToDescription,
} from "./place-route-generator.js";

const DESCRIPTION_LIMIT = 500;

const EXAMPLE_ROUTE_DESCRIPTION =
  "Wejdź do budynku C10. Poproś ochronę o aktywację windy. Wjedź na 2 piętro. Wprowadź kod 1234. Skręć w lewo. Idź prosto do końca korytarza. Lokal 229 po prawej stronie.";

function createMicButton(onResult) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "place-route-compose-mic";
  button.setAttribute("aria-label", "Nagraj opis trasy");
  button.innerHTML = `<span class="place-route-compose-mic-icon" aria-hidden="true"></span>`;

  button.addEventListener("click", () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "pl-PL";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener("result", (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();

      if (transcript) {
        onResult(transcript);
      }
    });

    recognition.start();
  });

  if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
    button.hidden = true;
  }

  return button;
}

export function initPlaceEditorUi() {
  const placeRoot = findPlaceRoot();
  const content = findPlaceContent(placeRoot);

  if (!placeRoot || !content) {
    return;
  }

  const slug = getPlaceSlug(placeRoot);
  const loaded = loadDraft(slug) || readPlaceFromDom(placeRoot);
  const model = clonePlaceModel(loaded || {
    id: slug,
    header: {},
    photo: {},
    routeDescription: "",
    steps: [],
  });

  if (!model.routeDescription && model.steps?.length) {
    model.routeDescription = stepsToDescription(model.steps);
  }

  const route = content.querySelector("tup-route");
  const navigation = content.querySelector("tup-navigation-button");

  if (route) {
    route.remove();
  }

  if (navigation) {
    navigation.hidden = true;
  }

  const compose = document.createElement("section");
  compose.className = "place-route-compose";
  compose.setAttribute("aria-label", "Opis trasy");

  const heading = document.createElement("h2");
  heading.className = "place-route-compose-heading";
  heading.textContent = "Opisz drogę";

  const field = document.createElement("div");
  field.className = "place-route-compose-field";

  const textarea = document.createElement("textarea");
  textarea.className = "place-route-compose-textarea";
  textarea.maxLength = DESCRIPTION_LIMIT;
  textarea.value = model.routeDescription || EXAMPLE_ROUTE_DESCRIPTION;
  textarea.placeholder =
    `Napisz lub nagraj opis trasy… Np. ${EXAMPLE_ROUTE_DESCRIPTION}`;

  const fieldFooter = document.createElement("div");
  fieldFooter.className = "place-route-compose-field-footer";

  const counter = document.createElement("span");
  counter.className = "place-route-compose-counter";
  counter.textContent = `${textarea.value.length} / ${DESCRIPTION_LIMIT}`;

  const updateCounter = () => {
    counter.textContent = `${textarea.value.length} / ${DESCRIPTION_LIMIT}`;
    model.routeDescription = textarea.value;
    saveDraft(slug, model);
  };

  textarea.addEventListener("input", updateCounter);

  const micButton = createMicButton((transcript) => {
    const nextValue = [textarea.value.trim(), transcript]
      .filter(Boolean)
      .join(" ")
      .slice(0, DESCRIPTION_LIMIT);

    textarea.value = nextValue;
    updateCounter();
  });

  fieldFooter.append(counter, micButton);
  field.append(textarea, fieldFooter);

  const { button: generateButton, fill: progressFill, label: generateLabel } =
    createActionButton("Generuj kroki");

  const hint = document.createElement("p");
  hint.className = "place-route-compose-hint";
  hint.textContent = "Im więcej szczegółów, tym lepsze wskazówki.";

  const status = document.createElement("p");
  status.className = "place-route-compose-status";
  status.setAttribute("aria-live", "polite");

  const previewLink = document.createElement("a");
  previewLink.className = "place-route-compose-preview";
  previewLink.href = buildPlaceUrl({ mode: "view", draft: true });
  previewLink.textContent = "Podgląd szkicu";
  previewLink.hidden = true;

  let isGenerating = false;

  generateButton.addEventListener("click", async () => {
    if (isGenerating) {
      return;
    }

    const description = textarea.value.trim();

    if (!description) {
      status.textContent = "Wpisz opis trasy, zanim wygenerujesz kroki.";
      return;
    }

    isGenerating = true;
    generateButton.disabled = true;
    textarea.disabled = true;
    status.textContent = "";
    generateButton.classList.add("is-generating");
    generateLabel.textContent = "Generuję kroki…";
    progressFill.style.width = "0%";
    generateButton.setAttribute("aria-busy", "true");
    generateButton.setAttribute("aria-valuemin", "0");
    generateButton.setAttribute("aria-valuemax", "100");
    generateButton.setAttribute("aria-valuenow", "0");
    generateButton.setAttribute("aria-label", "Generuję kroki…");
    compose.dataset.generating = "true";

    model.steps = [];
    saveDraft(slug, model);
    previewLink.hidden = true;

    await simulateActionProgress((value) => {
      progressFill.style.width = `${value}%`;
      generateButton.setAttribute("aria-valuenow", String(value));
    });

    model.routeDescription = description;
    model.steps = generateStepsFromDescription(description);
    saveDraft(slug, model);

    if (model.steps.length > 0) {
      window.location.assign(
        buildPlaceUrl({ mode: "view", draft: true, fresh: true })
      );
      return;
    }

    generateButton.classList.remove("is-generating");
    generateLabel.textContent = "Generuj kroki";
    progressFill.style.width = "0%";
    generateButton.removeAttribute("aria-busy");
    generateButton.removeAttribute("aria-valuemin");
    generateButton.removeAttribute("aria-valuemax");
    generateButton.removeAttribute("aria-valuenow");
    generateButton.removeAttribute("aria-label");
    delete compose.dataset.generating;
    generateButton.disabled = false;
    textarea.disabled = false;
    isGenerating = false;

    previewLink.hidden = true;

    status.textContent = "Nie udało się wygenerować kroków z tego opisu.";
  });

  compose.append(heading, field, generateButton, hint, status, previewLink);

  const photoAnchor =
    content.querySelector(":scope > tup-bento-layout") ??
    content.querySelector(":scope > tup-place-photo");

  if (photoAnchor) {
    photoAnchor.insertAdjacentElement("afterend", compose);
  } else {
    content.append(compose);
  }

  initPhotoEditing(content, { slug, model });

  content.addEventListener("tup-map-pickup-change", (event) => {
    const { lat, lng } = event.detail;
    model.pickup = { lat, lng };

    const map = content.querySelector("tup-map");

    if (map) {
      map.setAttribute("pickup-lat", String(lat));
      map.setAttribute("pickup-lng", String(lng));
    }

    saveDraft(slug, model);
  });
}

function initPhotoEditing(content, { slug, model }) {
  content.querySelectorAll("tup-place-photo").forEach((photo) => {
    setupPhotoEditing(photo, { slug, model, content });
  });
}

function setupPhotoEditing(photo, { slug, model, content }) {
  if (!photo || photo.dataset.photoEditBound === "true") {
    return;
  }

  photo.dataset.photoEditBound = "true";

  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.capture = "environment";
  input.hidden = true;
  input.className = "place-photo-edit-input";

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "place-photo-edit-remove";
  removeButton.setAttribute("aria-label", "Usuń zdjęcie");
  removeButton.innerHTML = "&times;";

  const openFilePicker = () => {
    input.value = "";
    input.click();
  };

  const syncRemoveButtonVisibility = () => {
    removeButton.hidden = !photo.getAttribute("src")?.trim();
  };

  photo.addEventListener(
    "click",
    (event) => {
      if (event.target.closest(".place-photo-edit-remove")) {
        return;
      }

      if (!event.target.closest("[data-photo-add]")) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      openFilePicker();
    },
    true
  );

  removeButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    photo.removeAttribute("src");
    syncRemoveButtonVisibility();
    syncPhotosFromDom(content, model);
    saveDraft(slug, model);
  });

  input.addEventListener("change", () => {
    const file = input.files?.[0];

    if (!file?.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", () => {
      const src = typeof reader.result === "string" ? reader.result : "";

      if (!src) {
        return;
      }

      photo.setAttribute("src", src);
      syncRemoveButtonVisibility();
      syncPhotosFromDom(content, model);
      saveDraft(slug, model);
    });

    reader.readAsDataURL(file);
  });

  photo.append(input, removeButton);
  syncRemoveButtonVisibility();
}
