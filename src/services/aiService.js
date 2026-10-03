const CATEGORY_RULES = [
  {
    category: "Road & Potholes",
    department: "Public Works Department",
    keywords: [
      "pothole",
      "potholes",
      "road",
      "roads",
      "broken road",
      "damaged road",
      "road damage",
      "crater",
      "footpath",
      "pavement",
      "street damage",
    ],
  },

  {
    category: "Garbage & Sanitation",
    department: "Municipal Sanitation Department",
    keywords: [
      "garbage",
      "waste",
      "trash",
      "dump",
      "dumping",
      "dirty",
      "sanitation",
      "litter",
      "rubbish",
      "kachra",
      "dustbin",
      "waste collection",
      "garbage collection",
    ],
  },

  {
    category: "Streetlight",
    department: "Electricity / Street Lighting Department",
    keywords: [
      "streetlight",
      "street light",
      "street lamp",
      "lamp post",
      "light pole",
      "lights",
      "light not working",
      "dark street",
      "dark road",
      "bulb",
      "electric light",
    ],
  },

  {
    category: "Water Supply",
    department: "Water Supply Department",
    keywords: [
      "water",
      "water supply",
      "water shortage",
      "no water",
      "dirty water",
      "water leakage",
      "water leak",
      "pipeline",
      "pipe",
      "tap",
      "drinking water",
      "jal",
      "pani",
    ],
  },

  {
    category: "Drainage",
    department: "Drainage & Sewerage Department",
    keywords: [
      "drain",
      "drainage",
      "sewer",
      "sewage",
      "sewerage",
      "blocked drain",
      "overflowing drain",
      "open drain",
      "stagnant water",
      "waterlogging",
      "flooded street",
      "gutter",
      "nali",
    ],
  },

  {
    category: "Traffic & Transport",
    department: "Traffic & Transport Department",
    keywords: [
      "traffic",
      "signal",
      "traffic signal",
      "red light",
      "road crossing",
      "bus",
      "bus stop",
      "parking",
      "illegal parking",
      "transport",
      "congestion",
      "jam",
      "vehicle",
    ],
  },

  {
    category: "Public Safety",
    department: "Public Safety Department",
    keywords: [
      "unsafe",
      "safety",
      "danger",
      "dangerous",
      "crime",
      "theft",
      "security",
      "accident",
      "hazard",
      "open manhole",
      "exposed wire",
      "broken railing",
    ],
  },

  {
    category: "Public Health",
    department: "Public Health Department",
    keywords: [
      "health",
      "hospital",
      "clinic",
      "medicine",
      "disease",
      "mosquito",
      "mosquitoes",
      "dengue",
      "malaria",
      "medical",
      "public health",
      "health hazard",
    ],
  },

  {
    category: "Environment",
    department: "Environment Department",
    keywords: [
      "pollution",
      "air pollution",
      "noise pollution",
      "water pollution",
      "tree",
      "trees",
      "cutting tree",
      "illegal tree",
      "smoke",
      "environment",
      "plastic",
    ],
  },

  {
    category: "Public Infrastructure",
    department: "Municipal Infrastructure Department",
    keywords: [
      "park",
      "public park",
      "bench",
      "community hall",
      "public toilet",
      "toilet",
      "playground",
      "building",
      "public building",
      "infrastructure",
    ],
  },
];

const PRIORITY_RULES = {
  Critical: [
    "life threatening",
    "life-threatening",
    "emergency",
    "critical",
    "fire",
    "accident",
    "major accident",
    "danger to life",
    "risk to life",
    "electrocution",
    "electric shock",
    "gas leak",
    "collapsed building",
    "collapse",
    "open manhole",
    "exposed wire",
  ],

  High: [
    "urgent",
    "dangerous",
    "danger",
    "severe",
    "serious",
    "immediate",
    "health risk",
    "health hazard",
    "major",
    "overflowing",
    "flooding",
    "flooded",
    "large pothole",
    "huge pothole",
    "accident risk",
    "risk",
  ],

  Medium: [
    "broken",
    "damaged",
    "leak",
    "leaking",
    "blocked",
    "not working",
    "poor",
    "problem",
    "issue",
    "complaint",
  ],

  Low: [
    "minor",
    "small",
    "suggestion",
    "request",
    "cosmetic",
    "improvement",
  ],
};


// --------------------------------------------------
// TEXT NORMALIZATION
// --------------------------------------------------

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


// --------------------------------------------------
// WORD TOKENIZATION
// --------------------------------------------------

function tokenizeWords(text) {
  return normalizeText(text)
    .split(" ")
    .filter(Boolean);
}


// --------------------------------------------------
// STOP WORDS
// Used mainly by duplicate detection.
// These words usually do not describe the actual
// civic issue.
// --------------------------------------------------

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "is",
  "are",
  "was",
  "were",
  "has",
  "have",
  "had",
  "to",
  "of",
  "in",
  "on",
  "at",
  "for",
  "with",
  "from",
  "near",
  "there",
  "this",
  "that",
  "very",
  "my",
  "our",
  "me",
  "we",
  "it",
  "not",
  "been",
  "being",
  "due",
  "because",
  "please",
  "kindly",
  "need",
  "needs",
  "request",
  "complaint",
  "issue",
  "problem",
]);


// --------------------------------------------------
// KEYWORD MATCHING
// --------------------------------------------------

function containsKeyword(text, keyword) {
  const normalizedText = normalizeText(text);
  const normalizedKeyword = normalizeText(keyword);

  if (!normalizedText || !normalizedKeyword) {
    return false;
  }

  /*
   * Multi-word keywords are matched as complete phrases.
   *
   * Example:
   * "road damage" -> matches
   * "road damages" -> does not accidentally match
   * "railroad" -> does not match "road"
   */
  if (normalizedKeyword.includes(" ")) {
    const escapedKeyword = normalizedKeyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const phrasePattern = new RegExp(
      `(^|\\s)${escapedKeyword}(?=\\s|$)`,
      "i"
    );

    return phrasePattern.test(normalizedText);
  }

  /*
   * Single-word keywords are matched as complete words.
   *
   * This prevents substring problems such as:
   * "road" accidentally matching another word
   * that merely contains "road".
   */
  const escapedKeyword = normalizedKeyword.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );

  const wordPattern = new RegExp(
    `(^|\\s)${escapedKeyword}(?=\\s|$)`,
    "i"
  );

  return wordPattern.test(normalizedText);
}


// --------------------------------------------------
// CATEGORY SCORING
// --------------------------------------------------

function calculateCategoryScores(text) {
  return CATEGORY_RULES.map((rule) => {
    const matchedKeywords = rule.keywords.filter(
      (keyword) => containsKeyword(text, keyword)
    );

    let score = matchedKeywords.length;

    /*
     * More specific phrases receive additional weight.
     *
     * Example:
     * "water"            -> normal weight
     * "water leakage"    -> higher weight
     * "garbage collection" -> higher weight
     */
    matchedKeywords.forEach((keyword) => {
      const normalized = normalizeText(keyword);
      const wordCount = normalized.split(" ").length;

      if (wordCount >= 2) {
        score += 0.75;
      } else if (normalized.length >= 8) {
        score += 0.25;
      }
    });

    return {
      ...rule,
      score,
      matchedKeywords,
    };
  }).sort((first, second) => {
    return second.score - first.score;
  });
}


// --------------------------------------------------
// PRIORITY DETECTION
// --------------------------------------------------

function getPrioritySignals(text, priority) {
  return PRIORITY_RULES[priority].filter((keyword) =>
    containsKeyword(text, keyword)
  );
}

function detectPriority(text) {
  const priorityOrder = [
    "Critical",
    "High",
    "Medium",
    "Low",
  ];

  for (const priority of priorityOrder) {
    const signals = getPrioritySignals(text, priority);

    if (signals.length > 0) {
      return {
        priority,
        signals,
      };
    }
  }

  return {
    priority: "Low",
    signals: [],
  };
}


// --------------------------------------------------
// SUMMARY GENERATION
// --------------------------------------------------

function buildSummary({
  category,
  department,
  priority,
  matchedKeywords,
}) {
  const issue = category.toLowerCase();

  let summary =
    `This grievance appears to concern ${issue}. `;

  summary +=
    `The suggested department is ${department}. `;

  if (priority === "Critical") {
    summary +=
      "The complaint contains signals that may require immediate attention.";
  } else if (priority === "High") {
    summary +=
      "The complaint contains urgency or public-impact signals and may require prompt attention.";
  } else if (priority === "Medium") {
    summary +=
      "The complaint appears to require routine departmental action.";
  } else {
    summary +=
      "The complaint appears suitable for normal service processing.";
  }

  if (matchedKeywords.length > 0) {
    summary +=
      ` Detected signals include ${matchedKeywords
        .slice(0, 4)
        .join(", ")}.`;
  }

  return summary;
}


// --------------------------------------------------
// CONFIDENCE CALCULATION
// --------------------------------------------------

function calculateConfidence(
  topMatch,
  secondMatch
) {
  if (!topMatch || topMatch.score <= 0) {
    return 0.35;
  }

  /*
   * Base confidence increases with the number and
   * specificity of matched signals.
   */
  const baseConfidence =
    0.68 +
    Math.min(
      topMatch.score * 0.06,
      0.22
    );

  /*
   * If two categories are very close, reduce confidence.
   */
  const scoreDifference =
    topMatch.score -
    (secondMatch?.score || 0);

  const ambiguityPenalty =
    secondMatch &&
    secondMatch.score > 0 &&
    scoreDifference < 1
      ? 0.08
      : 0;

  const confidence = Math.max(
    0.35,
    Math.min(
      0.95,
      baseConfidence - ambiguityPenalty
    )
  );

  return Number(
    confidence.toFixed(2)
  );
}


// --------------------------------------------------
// MAIN AI ANALYSIS
// --------------------------------------------------

export function analyzeComplaint({
  title = "",
  description = "",
}) {
  const normalizedTitle =
    normalizeText(title);

  const normalizedDescription =
    normalizeText(description);

  const combinedText =
    `${normalizedTitle} ${normalizedDescription}`.trim();

  /*
   * No meaningful input.
   */
  if (!combinedText) {
    return {
      category: "Other",
      department: "General Administration",
      priority: "Low",
      confidence: 0.35,
      summary:
        "Insufficient complaint information for reliable classification.",
      keywords: [],
    };
  }

  const categoryScores =
    calculateCategoryScores(combinedText);

  const topMatch =
    categoryScores[0];

  const secondMatch =
    categoryScores[1];

  let category =
    topMatch?.category ||
    "Other";

  let department =
    topMatch?.department ||
    "General Administration";

  let matchedKeywords =
    topMatch?.matchedKeywords ||
    [];

  /*
   * If nothing meaningful was detected,
   * do not pretend the classifier knows the category.
   */
  if (
    !topMatch ||
    topMatch.score === 0
  ) {
    category = "Other";
    department =
      "General Administration";
    matchedKeywords = [];
  }

  const priorityResult =
    detectPriority(combinedText);

  const confidence =
    calculateConfidence(
      topMatch,
      secondMatch
    );

  /*
   * If no category was found, keep confidence low.
   */
  const finalConfidence =
    category === "Other"
      ? 0.35
      : confidence;

  const allKeywords = [
    ...matchedKeywords,
    ...priorityResult.signals,
  ];

  return {
    category,
    department,

    priority:
      priorityResult.priority,

    confidence:
      finalConfidence,

    summary: buildSummary({
      category,
      department,
      priority:
        priorityResult.priority,
      matchedKeywords,
    }),

    keywords: [
      ...new Set(allKeywords),
    ].slice(0, 8),
  };
}


// --------------------------------------------------
// DUPLICATE DETECTION
// --------------------------------------------------

function tokenizeForDuplicateDetection(text) {
  return new Set(
    tokenizeWords(text)
      .filter(
        (word) =>
          word.length >= 3 &&
          !STOP_WORDS.has(word)
      )
  );
}


// --------------------------------------------------
// JACCARD SIMILARITY
// --------------------------------------------------

function calculateSimilarity(
  firstText,
  secondText
) {
  const firstTokens =
    tokenizeForDuplicateDetection(
      firstText
    );

  const secondTokens =
    tokenizeForDuplicateDetection(
      secondText
    );

  if (
    firstTokens.size === 0 ||
    secondTokens.size === 0
  ) {
    return 0;
  }

  let intersection = 0;

  firstTokens.forEach((token) => {
    if (secondTokens.has(token)) {
      intersection += 1;
    }
  });

  const union =
    new Set([
      ...firstTokens,
      ...secondTokens,
    ]).size;

  if (union === 0) {
    return 0;
  }

  return Math.round(
    (intersection / union) * 100
  );
}


// --------------------------------------------------
// DUPLICATE DETECTION
// --------------------------------------------------

export function findPossibleDuplicates(
  newComplaint,
  complaints = []
) {
  const newTitle =
    normalizeText(
      newComplaint?.title
    );

  const newDescription =
    normalizeText(
      newComplaint?.description
    );

  const newText =
    `${newTitle} ${newDescription}`.trim();

  if (!newText) {
    return [];
  }

  return complaints
    .map((complaint) => {
      const existingText =
        `${complaint.title || ""} ${
          complaint.description || ""
        }`;

      const similarity =
        calculateSimilarity(
          newText,
          existingText
        );

      return {
        id: complaint.id,

        referenceId:
          complaint.referenceId,

        title:
          complaint.title,

        description:
          complaint.description,

        status:
          complaint.status,

        category:
          complaint.category,

        similarity,
      };
    })
    .filter(
      (item) =>
        item.similarity >= 45
    )
    .sort(
      (first, second) =>
        second.similarity -
        first.similarity
    )
    .slice(0, 3);
}


// --------------------------------------------------
// AI CONFIDENCE LABEL
// --------------------------------------------------

export function getAIStatusLabel(
  confidence
) {
  if (confidence >= 0.85) {
    return "High Confidence";
  }

  if (confidence >= 0.65) {
    return "Moderate Confidence";
  }

  return "Low Confidence";
}