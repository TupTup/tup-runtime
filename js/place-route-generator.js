function addBoldMarkers(text) {
  return text
    .replace(/\b(C\d+)\b/gi, "**$1**")
    .replace(/\b(lokal\s*\d+)\b/gi, (_, match) => `**${match}**`)
    .replace(/\b(\d+)\s*pi[eę]tro\b/gi, "**$1 piętro**");
}

function cleanSentence(text) {
  return String(text ?? "")
    .replace(/[.!?…]+$/g, "")
    .trim();
}

/** Fake generator: jeden krok na zdanie, podział po kropkach. */
function splitSentencesByDots(text) {
  const normalized = String(text ?? "").trim();

  if (!normalized) {
    return [];
  }

  return normalized
    .split(/\.\s+/)
    .map(cleanSentence)
    .filter(Boolean);
}

function fakeStepType(index, total) {
  if (total === 1) {
    return "start";
  }

  if (index === 0) {
    return "start";
  }

  if (index === total - 1) {
    return "target";
  }

  return "straight";
}

export function generateStepsFromDescription(text) {
  const sentences = splitSentencesByDots(text);

  return sentences.map((sentence, index) => ({
    type: fakeStepType(index, sentences.length),
    text: addBoldMarkers(sentence),
  }));
}

export function stepsToDescription(steps) {
  return (steps ?? [])
    .map((step) => String(step.text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1"))
    .filter(Boolean)
    .join(". ");
}
