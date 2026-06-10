function addBoldMarkers(text) {
  return text
    .replace(/\b(C\d+)\b/gi, "**$1**")
    .replace(/\b(lokal\s*\d+)\b/gi, (_, match) => `**${match}**`)
    .replace(/\b(\d+)\s*pi[eę]tro\b/gi, "**$1 piętro**");
}

function inferStep(text, index, total) {
  const lower = text.toLowerCase();
  let type = "straight";
  let tone;

  if (index === 0 || /wejd|budynek|bram|klatk|drzwi|C\d+/i.test(text)) {
    type = "start";
  } else if (
    index === total - 1 ||
    /lokal|cel\b|miejsce docel|docelow/i.test(text)
  ) {
    type = "target";
  } else if (/ochron|wind|recepc|aktywacj/i.test(text)) {
    type = "hand";
    tone = "warning";
  } else if (/kod|pin|klawiat|hasło/i.test(text)) {
    type = "key";
  } else if (/pi[eę]tro|wjedź na|jedź na|poziom/i.test(text)) {
    type = "floor-up";
  } else if (/w lewo|skr[eę][ćc] w lewo/i.test(text)) {
    type = "left";
  } else if (/w prawo|skr[eę][ćc] w prawo/i.test(text)) {
    type = "right";
  } else if (/prosto|korytarz|idź do|idz do/i.test(text)) {
    type = "straight";
  }

  const step = {
    type,
    text: addBoldMarkers(text),
  };

  if (tone) {
    step.tone = tone;
  }

  return step;
}

export function generateStepsFromDescription(text) {
  const normalized = String(text ?? "").trim();

  if (!normalized) {
    return [];
  }

  const parts = normalized
    .split(/\n+|(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return [];
  }

  return parts.map((part, index) => inferStep(part, index, parts.length));
}

export function stepsToDescription(steps) {
  return (steps ?? [])
    .map((step) => String(step.text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1"))
    .filter(Boolean)
    .join(" ");
}
