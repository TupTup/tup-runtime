import {
  applyPlaceToDom,
  clearDraft,
  clonePlaceModel,
  findPlaceRoot,
  getPlaceSlug,
  loadDraft,
  readPlaceFromDom,
  saveDraft,
} from "./place-model.js";
import { buildPlaceUrl } from "./place-mode.js";

const STEP_TYPES = [
  "start",
  "hand",
  "floor-up",
  "floor-down",
  "key",
  "left",
  "right",
  "straight",
  "forward",
  "target",
  "building",
  "entrance",
  "door",
  "stairs",
  "elevator",
  "reception",
];

const STEP_TONES = ["", "warning", "secondary"];
const STEP_EMPHASIS = ["", "primary"];

function createField(labelText, control) {
  const field = document.createElement("label");
  field.className = "place-editor-field";

  const label = document.createElement("span");
  label.className = "place-editor-field-label";
  label.textContent = labelText;

  field.append(label, control);

  return field;
}

function createInput(value, onInput) {
  const input = document.createElement("input");
  input.className = "place-editor-input";
  input.type = "text";
  input.value = value ?? "";
  input.addEventListener("input", () => onInput(input.value));

  return input;
}

function createTextarea(value, onInput) {
  const textarea = document.createElement("textarea");
  textarea.className = "place-editor-textarea";
  textarea.rows = 2;
  textarea.value = value ?? "";
  textarea.addEventListener("input", () => onInput(textarea.value));

  return textarea;
}

function createSelect(value, options, onChange) {
  const select = document.createElement("select");
  select.className = "place-editor-select";

  for (const optionValue of options) {
    const option = document.createElement("option");
    option.value = optionValue;
    option.textContent = optionValue || "—";
    select.appendChild(option);
  }

  select.value = value ?? "";
  select.addEventListener("change", () => onChange(select.value));

  return select;
}

function createButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", onClick);

  return button;
}

export function initPlaceEditorUi() {
  const app = document.querySelector(".app") || findPlaceRoot()?.parentElement;
  const placeRoot = findPlaceRoot();

  if (!app || !placeRoot) {
    return;
  }

  const slug = getPlaceSlug(placeRoot);
  const model = loadDraft(slug) || readPlaceFromDom(placeRoot) || {
    id: slug,
    header: {},
    photo: {},
    steps: [],
  };

  const editor = document.createElement("section");
  editor.className = "place-editor";
  editor.setAttribute("aria-label", "Edytor miejsca");

  const state = {
    model: clonePlaceModel(model),
    slug,
    placeRoot,
    statusEl: null,
  };

  const persist = () => {
    applyPlaceToDom(state.placeRoot, state.model);
    saveDraft(state.slug, state.model);

    if (state.statusEl) {
      state.statusEl.textContent = "Szkic zapisany lokalnie w tej przeglądarce.";
    }
  };

  const toolbar = document.createElement("div");
  toolbar.className = "place-editor-toolbar";

  const title = document.createElement("p");
  title.className = "place-editor-title";
  title.textContent = `Edycja: ${slug}`;

  const actions = document.createElement("div");
  actions.className = "place-editor-actions";

  actions.append(
    createButton("Zapisz szkic", "place-editor-button", persist),
    createButton("Podgląd", "place-editor-button place-editor-button--primary", () => {
      persist();
      window.location.href = buildPlaceUrl({ mode: "view", draft: true });
    }),
    createButton("Odrzuć szkic", "place-editor-button", () => {
      clearDraft(state.slug);
      window.location.href = buildPlaceUrl({ mode: "view", draft: false });
    }),
    createButton("Przywróć HTML", "place-editor-button", () => {
      clearDraft(state.slug);
      window.location.href = buildPlaceUrl({ mode: "view", draft: false });
    })
  );

  toolbar.append(title, actions);

  const notice = document.createElement("p");
  notice.className = "place-editor-notice";
  notice.textContent =
    "Szkic jest zapisywany tylko lokalnie w tej przeglądarce (localStorage).";

  state.statusEl = document.createElement("p");
  state.statusEl.className = "place-editor-status";
  state.statusEl.setAttribute("aria-live", "polite");

  const forms = document.createElement("div");
  forms.className = "place-editor-forms";

  forms.append(
    buildHeaderSection(state, persist),
    buildPhotoSection(state, persist),
    buildStepsSection(state, persist)
  );

  editor.append(toolbar, notice, state.statusEl, forms);
  app.insertBefore(editor, app.firstChild);
}

function buildHeaderSection(state, persist) {
  const section = document.createElement("section");
  section.className = "place-editor-section";
  section.innerHTML = `<h2 class="place-editor-section-title">Nagłówek</h2>`;

  const grid = document.createElement("div");
  grid.className = "place-editor-grid";

  grid.append(
    createField(
      "Nazwa",
      createInput(state.model.header.name, (value) => {
        state.model.header.name = value;
        persist();
      })
    ),
    createField(
      "Summary",
      createInput(state.model.header.summary, (value) => {
        state.model.header.summary = value;
        persist();
      })
    ),
    createField(
      "Adres",
      createInput(state.model.header.address, (value) => {
        state.model.header.address = value;
        persist();
      })
    )
  );

  section.append(grid);

  return section;
}

function buildPhotoSection(state, persist) {
  const section = document.createElement("section");
  section.className = "place-editor-section";
  section.innerHTML = `<h2 class="place-editor-section-title">Zdjęcie</h2>`;

  const grid = document.createElement("div");
  grid.className = "place-editor-grid";

  grid.append(
    createField(
      "URL",
      createInput(state.model.photo.src, (value) => {
        state.model.photo.src = value;
        persist();
      })
    ),
    createField(
      "Alt",
      createInput(state.model.photo.alt, (value) => {
        state.model.photo.alt = value;
        persist();
      })
    )
  );

  section.append(grid);

  return section;
}

function buildStepsSection(state, persist) {
  const section = document.createElement("section");
  section.className = "place-editor-section";

  const header = document.createElement("div");
  header.className = "place-editor-section-header";

  const title = document.createElement("h2");
  title.className = "place-editor-section-title";
  title.textContent = "Kroki trasy";

  const addButton = createButton("Dodaj krok", "place-editor-button", () => {
    state.model.steps.push({
      type: "forward",
      text: "",
    });
    rerenderSteps();
    persist();
  });

  header.append(title, addButton);

  const list = document.createElement("div");
  list.className = "place-editor-steps";

  const rerenderSteps = () => {
    list.replaceChildren();

    state.model.steps.forEach((step, index) => {
      list.appendChild(buildStepEditor(state, step, index, rerenderSteps, persist));
    });
  };

  rerenderSteps();

  section.append(header, list);

  return section;
}

function buildStepEditor(state, step, index, rerenderSteps, persist) {
  const item = document.createElement("article");
  item.className = "place-editor-step";

  const heading = document.createElement("h3");
  heading.className = "place-editor-step-title";
  heading.textContent = `Krok ${index + 1}`;

  const controls = document.createElement("div");
  controls.className = "place-editor-step-controls";

  controls.append(
    createButton("↑", "place-editor-icon-button", () => {
      if (index === 0) {
        return;
      }

      const steps = state.model.steps;
      [steps[index - 1], steps[index]] = [steps[index], steps[index - 1]];
      rerenderSteps();
      persist();
    }),
    createButton("↓", "place-editor-icon-button", () => {
      if (index >= state.model.steps.length - 1) {
        return;
      }

      const steps = state.model.steps;
      [steps[index + 1], steps[index]] = [steps[index], steps[index + 1]];
      rerenderSteps();
      persist();
    }),
    createButton("Usuń", "place-editor-icon-button place-editor-icon-button--danger", () => {
      state.model.steps.splice(index, 1);
      rerenderSteps();
      persist();
    })
  );

  const grid = document.createElement("div");
  grid.className = "place-editor-grid";

  grid.append(
    createField(
      "Typ",
      createSelect(step.type, STEP_TYPES, (value) => {
        step.type = value;
        persist();
      })
    ),
    createField(
      "Tekst",
      createTextarea(step.text, (value) => {
        step.text = value;
        persist();
      })
    ),
    createField(
      "Label",
      createInput(step.label, (value) => {
        step.label = value || undefined;
        persist();
      })
    ),
    createField(
      "Tone",
      createSelect(step.tone ?? "", STEP_TONES, (value) => {
        step.tone = value || undefined;
        persist();
      })
    ),
    createField(
      "Emphasis",
      createSelect(step.emphasis ?? "", STEP_EMPHASIS, (value) => {
        step.emphasis = value || undefined;
        persist();
      })
    ),
    createField(
      "Kod",
      createInput(step.code, (value) => {
        step.code = value || undefined;
        persist();
      })
    ),
    createField(
      "Ukryj kod po (s)",
      createInput(step.codeHideAfter, (value) => {
        step.codeHideAfter = value || undefined;
        persist();
      })
    )
  );

  item.append(heading, controls, grid);

  return item;
}
