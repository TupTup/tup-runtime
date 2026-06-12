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

const ACCESS_CODE_PATTERN =
  /\b((?:wprowadź|wpisz|wprowadz)\s+(?:kod|pin)|(?:kod|pin|klawiatura))\s*:?\s*(\S+)/i;

function normalizeAccessCodeStepText(matchedPhrase) {
  const phrase = matchedPhrase.trim().toLowerCase();

  if (/^(wprowadź|wpisz|wprowadz)\s+(kod|pin)/.test(phrase)) {
    return phrase.charAt(0).toUpperCase() + phrase.slice(1);
  }

  if (phrase === "pin") {
    return "Wprowadź pin";
  }

  return "Wprowadź kod";
}

function extractAccessCode(sentence) {
  const value = String(sentence ?? "").trim();
  const match = value.match(ACCESS_CODE_PATTERN);

  if (!match) {
    return { text: value };
  }

  const code = match[2].replace(/[,;!.…]+$/g, "");

  if (!code) {
    return { text: value };
  }

  return {
    text: normalizeAccessCodeStepText(match[1]),
    code,
  };
}

export function generateStepsFromDescription(text) {
  const sentences = splitSentencesByDots(text);

  return sentences.map((sentence, index) => {
    const { text: stepText, code } = extractAccessCode(sentence);
    const step = {
      type: inferStepType(sentence, index, sentences.length),
      text: addBoldMarkers(stepText),
    };

    if (code) {
      step.type = "key";
      step.code = code;
    }

    return step;
  });
}

export function stepsToDescription(steps) {
  return (steps ?? [])
    .map((step) => {
      const plainText = String(step.text ?? "").replace(/\*\*([^*]+)\*\*/g, "$1");

      if (!plainText) {
        return "";
      }

      if (step.code && !plainText.includes(step.code)) {
        return `${plainText} ${step.code}`;
      }

      return plainText;
    })
    .filter(Boolean)
    .join(". ");
}
