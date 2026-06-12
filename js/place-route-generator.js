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

const STEP_TYPE_RULES = [
  { type: "key", pattern: /kod|klawiatura|pin/i },
  { type: "hand", pattern: /ochron|portier/i },
  { type: "reception", pattern: /recepcj/i },
  { type: "floor", pattern: /\d+\s*pi[eę]tro|windzie|wind[ąę]/i },
  { type: "stairs", pattern: /schod/i },
  { type: "entrance", pattern: /wej[śs]ci|wejd[źz]|wjed[źz]/i },
  { type: "building", pattern: /budynek|budynku|\bC\d+\b/i },
  { type: "door", pattern: /drzwi|lokal/i },
  { type: "left", pattern: /\blewo\b|lew[aą]|w lewo/i },
  { type: "right", pattern: /\bprawo\b|praw[aą]|w prawo/i },
  { type: "straight", pattern: /prosto|na wprost/i },
];

function inferStepType(sentence, index, total) {
  const matchedType = STEP_TYPE_RULES.find(({ pattern }) =>
    pattern.test(String(sentence ?? "").trim())
  )?.type;

  if (total === 1) {
    return matchedType ?? "target";
  }

  if (index === total - 1) {
    return "target";
  }

  if (index === 0) {
    return matchedType ?? "start";
  }

  return matchedType ?? "forward";
}

export function generateStepsFromDescription(text) {
  const sentences = splitSentencesByDots(text);

  return sentences.map((sentence, index) => ({
    type: inferStepType(sentence, index, sentences.length),
    text: addBoldMarkers(sentence),
  }));
}

export function stepsToDescription(steps) {
  return (steps ?? [])
    .map((step) => String(step.text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1"))
    .filter(Boolean)
    .join(". ");
}
