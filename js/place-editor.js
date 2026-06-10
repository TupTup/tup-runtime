import {
  applyPlaceToDom,
  clonePlaceModel,
  findPlaceContent,
  findPlaceRoot,
  getPlaceSlug,
  loadDraft,
  readPlaceFromDom,
  saveDraft,
} from "./place-model.js";
import { buildPlaceUrl } from "./place-mode.js";
import {
  generateStepsFromDescription,
  stepsToDescription,
} from "./place-route-generator.js";

const DESCRIPTION_LIMIT = 500;

const GENERATE_SIMULATION_MS = 2800;

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

function createGenerateButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "place-route-compose-generate";

  const fill = document.createElement("span");
  fill.className = "place-route-compose-generate-fill";
  fill.setAttribute("aria-hidden", "true");

  const inner = document.createElement("span");
  inner.className = "place-route-compose-generate-inner";

  const icon = document.createElement("span");
  icon.className = "place-route-compose-generate-icon";
  icon.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "place-route-compose-generate-label";
  label.textContent = "Generuj kroki";

  inner.append(icon, label);
  button.append(fill, inner);

  return { button, fill, label };
}

function simulateGenerateProgress(onProgress) {
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = (now) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / GENERATE_SIMULATION_MS);
      const eased = 1 - (1 - ratio) ** 2;

      onProgress(Math.round(eased * 100));

      if (ratio >= 1) {
        resolve();
        return;
      }

      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  });
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
    route.hidden = true;

    if (typeof route.setSteps === "function") {
      route.setSteps([]);
    }
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
    createGenerateButton();

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
    applyPlaceToDom(placeRoot, model);
    saveDraft(slug, model);
    previewLink.hidden = true;

    await simulateGenerateProgress((value) => {
      progressFill.style.width = `${value}%`;
      generateButton.setAttribute("aria-valuenow", String(value));
    });

    model.routeDescription = description;
    model.steps = generateStepsFromDescription(description);
    applyPlaceToDom(placeRoot, model);
    saveDraft(slug, model);

    if (model.steps.length > 0) {
      window.location.assign(buildPlaceUrl({ mode: "view", draft: true }));
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

  if (route) {
    route.insertAdjacentElement("beforebegin", compose);
  } else {
    content.append(compose);
  }

  addPhotoEditButton(content.querySelector("tup-place-photo"));
}

function addPhotoEditButton(photo) {
  if (!photo || photo.querySelector(".place-photo-edit-button")) {
    return;
  }

  const hero = photo.querySelector(".place-hero, .hero-image-trigger");

  if (!hero) {
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "place-photo-edit-button";
  button.innerHTML =
    `<span class="place-photo-edit-button-icon" aria-hidden="true"></span><span>Zmień zdjęcie</span>`;

  button.addEventListener("click", () => {
    const nextSrc = window.prompt("Adres URL zdjęcia:", photo.getAttribute("src") || "");

    if (nextSrc === null) {
      return;
    }

    photo.setAttribute("src", nextSrc.trim());
  });

  hero.append(button);
}
