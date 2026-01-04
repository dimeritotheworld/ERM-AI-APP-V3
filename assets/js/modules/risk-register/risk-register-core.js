/**
 * Dimeri ERM - Risk Register Core Module
 * State, categories, icons, utilities, initialization
 *
 * @version 3.0.0
 * ES5 Compatible
 */

console.log("Loading risk-register-core.js...");

var ERM = window.ERM || {};
ERM.riskRegister = ERM.riskRegister || {};

/* ========================================
   STATE
   ======================================== */
ERM.riskRegister.state = {
  currentRegister: null,
  viewMode: "list",
  editingRiskId: null,
  categoryIntent: null,
  filters: {
    search: "",
    category: "",
    level: "",
    status: "",
  },
  heatmapFilter: null,
};

// Emit a custom event whenever risks change in storage (used by dashboard to refresh heatmaps/dots)
ERM.riskRegister.notifyRisksUpdated = function () {
  try {
    document.dispatchEvent(new CustomEvent("erm:risks-updated"));
  } catch (e) {
    console.warn("Failed to emit risks-updated event", e);
  }
};

// Wrap ERM.storage.set to detect risk CRUD operations (guard so it only wraps once)
if (!ERM.storage._wrappedForRisks) {
  ERM.storage._wrappedForRisks = true;
  var _ermStorageSet = ERM.storage.set;
  ERM.storage.set = function (key, value) {
    _ermStorageSet.call(ERM.storage, key, value);
    if (key === "risks" && ERM.riskRegister && ERM.riskRegister.notifyRisksUpdated) {
      ERM.riskRegister.notifyRisksUpdated();
    }
  };
}

/* ========================================
   CATEGORIES - Generic for Dropdown
   Industry-specific via AI suggestions
   ======================================== */

/**
 * Generic categories for dropdown (same across all industries)
 * These are broad categories for quick selection and reporting
 * AI suggestions provide industry-specific categories
 */
ERM.riskRegister.categories = [
  { value: "strategic", label: "Strategic Risk" },
  { value: "financial", label: "Financial Risk" },
  { value: "operational", label: "Operational Risk" },
  { value: "compliance", label: "Compliance Risk" },
  { value: "technology", label: "Technology Risk" },
  { value: "reputational", label: "Reputational Risk" },
  { value: "health-safety", label: "Health & Safety Risk" },
  { value: "environmental", label: "Environmental Risk" },
  { value: "human-resources", label: "Human Resources Risk" },
  { value: "project", label: "Project Risk" },
];

/**
 * Get industry name for display
 * @returns {string} Industry name or "Enterprise"
 */
ERM.riskRegister.getIndustryName = function () {
  if (typeof ERM_TEMPLATES !== "undefined" && ERM_TEMPLATES.loader) {
    return ERM_TEMPLATES.loader.getIndustryName() || "Enterprise";
  }
  return "Enterprise";
};

/**
 * Search industry-specific categories (for AI suggestions)
 * Searches the full 200+ category list from templates by keywords
 * @param {string} searchTerm - Term to search (title text)
 * @returns {Array} Matching categories with department info
 */
ERM.riskRegister.searchCategories = function (searchTerm) {
  var results = [];
  if (!searchTerm) return results;

  // Stop words to filter out
  var stopWords = [
    "the",
    "a",
    "an",
    "of",
    "to",
    "in",
    "for",
    "and",
    "or",
    "is",
    "are",
    "be",
    "was",
    "were",
    "risk",
    "risks",
    "our",
    "we",
    "might",
    "could",
    "may",
    "would",
    "should",
    "can",
    "will",
    "that",
    "this",
    "with",
    "from",
    "about",
    "poor",
    "bad",
    "good",
  ];

  // Split search term into individual words (include 2+ char words, filter stop words)
  var words = searchTerm
    .toLowerCase()
    .split(/\s+/)
    .filter(function (w) {
      return w.length >= 2 && stopWords.indexOf(w) === -1;
    });

  if (words.length === 0) return results;

  // Get categories from templates
  var cats = null;
  var industry = null;

  // Get industry from localStorage (set during onboarding)
  industry = localStorage.getItem("ERM_industry");

  if (typeof ERM_TEMPLATES !== "undefined") {
    // Try loader first
    if (!industry && ERM_TEMPLATES.loader && ERM_TEMPLATES.loader.getIndustry) {
      industry = ERM_TEMPLATES.loader.getIndustry();
    }

    // Use detected industry
    if (
      industry &&
      ERM_TEMPLATES[industry] &&
      ERM_TEMPLATES[industry].categories
    ) {
      cats = ERM_TEMPLATES[industry].categories;
    }
  }

  if (cats) {
    // Iterate through all departments and search categories
    for (var deptId in cats) {
      if (!cats.hasOwnProperty(deptId)) continue;
      if (typeof cats[deptId] === "function") continue;
      if (!Array.isArray(cats[deptId])) continue;

      var deptCats = cats[deptId];
      for (var i = 0; i < deptCats.length; i++) {
        var cat = deptCats[i];
        var score = 0;
        var matchedTerms = 0;

        // For each search term
        for (var w = 0; w < words.length; w++) {
          var term = words[w];
          var isShortTerm = term.length <= 3;
          var termMatched = false;

          // Search by name - split into words
          if (cat.name) {
            var nameWords = cat.name.toLowerCase().split(/\s+/);
            for (var nw = 0; nw < nameWords.length; nw++) {
              var nameWord = nameWords[nw];
              if (isShortTerm) {
                // Short term: exact word match only
                if (nameWord === term) {
                  score += 5;
                  termMatched = true;
                  break;
                }
              } else {
                // Longer term: exact or partial word match
                if (nameWord === term) {
                  score += 5;
                  termMatched = true;
                  break;
                } else if (nameWord.indexOf(term) !== -1) {
                  score += 3;
                  termMatched = true;
                }
              }
            }
          }

          // Search by id - split by hyphen
          if (cat.id) {
            var idParts = cat.id.toLowerCase().split("-");
            for (var idp = 0; idp < idParts.length; idp++) {
              if (isShortTerm) {
                if (idParts[idp] === term) {
                  score += 4;
                  termMatched = true;
                  break;
                }
              } else {
                if (
                  idParts[idp] === term ||
                  idParts[idp].indexOf(term) !== -1
                ) {
                  score += 3;
                  termMatched = true;
                }
              }
            }
          }

          // Search by keywords - split each keyword into words
          if (cat.keywords) {
            var keywordList;
            if (Array.isArray(cat.keywords)) {
              keywordList = cat.keywords;
            } else if (typeof cat.keywords === "string") {
              // Split comma-separated string into array
              keywordList = cat.keywords.split(",").map(function (k) {
                return k.trim().toLowerCase();
              });
            } else {
              keywordList = [];
            }

            for (var k = 0; k < keywordList.length; k++) {
              var keywordPhrase = keywordList[k].toLowerCase();
              var keywordWords = keywordPhrase.split(/\s+/);

              for (var kw = 0; kw < keywordWords.length; kw++) {
                var kwWord = keywordWords[kw];
                if (isShortTerm) {
                  // Short term: exact word match only
                  if (kwWord === term) {
                    score += 4;
                    termMatched = true;
                    break;
                  }
                } else {
                  // Longer term: exact or partial word match
                  if (kwWord === term) {
                    score += 4;
                    termMatched = true;
                    break;
                  } else if (kwWord.length > 3 && kwWord.indexOf(term) !== -1) {
                    score += 2;
                    termMatched = true;
                  }
                }
              }
            }
          }

          if (termMatched) matchedTerms++;
        }

        // Multi-term bonus: if multiple search terms matched, boost score
        if (matchedTerms >= 2) {
          score += matchedTerms * 5;
        }

        if (score > 0) {
          results.push({
            category: cat,
            departmentId: deptId,
            score: score,
            matchedTerms: matchedTerms,
          });
        }
      }
    }

    // Sort by matchedTerms first (more words matched = better), then by score
    results.sort(function (a, b) {
      if (b.matchedTerms !== a.matchedTerms) return b.matchedTerms - a.matchedTerms;
      return b.score - a.score;
    });

    return results;
  }

  // Fallback: search generic categories
  for (var j = 0; j < this.categories.length; j++) {
    var genCat = this.categories[j];
    for (var gw = 0; gw < words.length; gw++) {
      if (genCat.label.toLowerCase().indexOf(words[gw]) !== -1) {
        results.push({ category: genCat, departmentId: null, score: 1 });
        break;
      }
    }
  }
  return results;
};

/**
 * Get all industry-specific categories
 * @returns {Array} All categories from industry templates
 */
ERM.riskRegister.getAllIndustryCategories = function () {
  if (typeof ERM_TEMPLATES !== "undefined" && ERM_TEMPLATES.loader) {
    var industry = ERM_TEMPLATES.loader.getIndustry();
    if (
      industry &&
      ERM_TEMPLATES[industry] &&
      ERM_TEMPLATES[industry].categories &&
      typeof ERM_TEMPLATES[industry].categories.getAll === "function"
    ) {
      return ERM_TEMPLATES[industry].categories.getAll();
    }
  }
  return [];
};

/* ========================================
   ICONS (Inline SVG)
   ======================================== */
ERM.riskRegister.icons = {
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>',
  close:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  plus: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  search:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  moreVertical:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>',
  edit: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  copy: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  userPlus:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
  download:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
  upload:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  trash:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
  chevronLeft:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>',
  alertTriangle:
    '<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  sparkles:
    '<svg class="ai-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>',
  mail: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  lock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
  star: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  sort: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5h10M11 9h7M11 13h4"/><path d="m3 17 3 3 3-3M6 18V4"/></svg>',
  filter:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
};

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */
ERM.riskRegister.getRiskLevelFromScore = function (score) {
  if (score >= 15) return "CRITICAL";
  if (score >= 10) return "HIGH";
  if (score >= 5) return "MEDIUM";
  return "LOW";
};

ERM.riskRegister.getRiskLevelClass = function (score) {
  if (score >= 15) return "critical";
  if (score >= 10) return "high";
  if (score >= 5) return "medium";
  return "low";
};

ERM.riskRegister.getHeatMapColorClass = function (score) {
  if (score >= 15) return "critical";
  if (score >= 10) return "high";
  if (score >= 5) return "medium";
  return "low";
};

ERM.riskRegister.getRiskLevelDescription = function (score) {
  if (score >= 15) return "Immediate action needed. Escalate to leadership.";
  if (score >= 10) return "Action required. Implement controls promptly.";
  if (score >= 5) return "Consider controls. Regular monitoring required.";
  return "Acceptable risk level. Monitor periodically.";
};

ERM.riskRegister.getRiskHeatmapCoords = function (risk, type) {
  var iL = parseInt(risk.inherentLikelihood, 10);
  var iI = parseInt(risk.inherentImpact, 10);
  if (!iL) iL = parseInt(risk.likelihood, 10) || 3;
  if (!iI) iI = parseInt(risk.impact, 10) || 3;

  var rL = parseInt(risk.residualLikelihood, 10);
  var rI = parseInt(risk.residualImpact, 10);
  var rScore = parseFloat(risk.residualScore) || parseFloat(risk.residualRisk) || 0;

  if (!rL) rL = iL;
  if (!rI) rI = iI;
  if (rScore && rL) {
    rI = Math.max(1, Math.min(5, Math.round(rScore / rL)));
  }

  return type === "residual"
    ? { likelihood: Math.max(1, Math.min(5, rL)), impact: Math.max(1, Math.min(5, rI)) }
    : { likelihood: Math.max(1, Math.min(5, iL)), impact: Math.max(1, Math.min(5, iI)) };
};

ERM.riskRegister.formatCategory = function (value) {
  if (!value) return "-";

  // First check generic categories (quick lookup)
  for (var i = 0; i < this.categories.length; i++) {
    if (this.categories[i].value === value) {
      return this.categories[i].label;
    }
  }

  // Search industry-specific category list from templates
  if (typeof ERM_TEMPLATES !== "undefined" && ERM_TEMPLATES.loader) {
    var industry = ERM_TEMPLATES.loader.getIndustry();
    if (
      industry &&
      ERM_TEMPLATES[industry] &&
      ERM_TEMPLATES[industry].categories &&
      typeof ERM_TEMPLATES[industry].categories.findById === "function"
    ) {
      var result = ERM_TEMPLATES[industry].categories.findById(value);
      if (result && result.category) {
        return result.category.name;
      }
    }
  }

  // Fallback: format the value nicely
  return value.replace(/-/g, " ").replace(/\b\w/g, function (l) {
    return l.toUpperCase();
  });
};

ERM.riskRegister.matchesHeatmapFilter = function (risk, heatmapFilter) {
  if (!heatmapFilter) return false;
  var coords = this.getRiskHeatmapCoords(risk, heatmapFilter.type || "inherent");
  return coords.likelihood === heatmapFilter.likelihood && coords.impact === heatmapFilter.impact;
};

ERM.riskRegister.findRegisterForHeatmap = function (heatmapFilter) {
  if (!heatmapFilter) return null;
  var registers = ERM.storage.get("registers") || [];
  var risks = ERM.storage.get("risks") || [];
  for (var i = 0; i < registers.length; i++) {
    var reg = registers[i];
    for (var r = 0; r < risks.length; r++) {
      if (risks[r].registerId === reg.id && this.matchesHeatmapFilter(risks[r], heatmapFilter)) {
        return reg;
      }
    }
  }
  return null;
};

/* ========================================
   INITIALIZATION
   ======================================== */
ERM.riskRegister.init = function () {
  console.log("Initializing Risk Register module...");
  this.state.viewMode = "list";
  this.state.currentRegister = null;
  this.state.editingRiskId = null;
  this.state.categoryIntent = null;
  // Load any pending heatmap filter intent
  var pendingHeat = ERM.storage.get("heatmapFilter");
  if (pendingHeat) {
    this.state.heatmapFilter = pendingHeat;
    var matchingRegister = this.findRegisterForHeatmap(pendingHeat);
    if (matchingRegister) {
      this.state.currentRegister = matchingRegister;
      this.state.viewMode = "detail";
    }
  }
  // Load category filter intent (from dashboard bar click)
  var pendingCategory = ERM.storage.get("categoryFilterIntent");
  if (pendingCategory) {
    this.state.categoryIntent = pendingCategory;
    this.state.filters.category = pendingCategory.category;
    // Clear stored intent after consuming
    ERM.storage.set("categoryFilterIntent", null);
  }
  if (this.state.viewMode === "detail" && this.state.currentRegister) {
    this.renderRegisterDetail();
  } else {
    this.renderRegisterList();
  }
};

/* ========================================
   EXPORTS
   ======================================== */
window.ERM = ERM;
console.log("risk-register-core.js loaded");
