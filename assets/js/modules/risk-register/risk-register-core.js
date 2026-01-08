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
   IDEMPOTENCY GUARDS
   Prevent duplicate event binding on view re-entry
   ======================================== */
ERM.riskRegister._initialized = false;
ERM.riskRegister._listEventsBound = false;
ERM.riskRegister._detailEventsBound = false;
ERM.riskRegister._modalsEventsBound = false;
ERM.riskRegister._aiUIEventsBound = false;

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
 * Get industry name for display (templates removed - returns "Enterprise")
 */
ERM.riskRegister.getIndustryName = function () {
  return "Enterprise";
};

/**
 * Search categories (templates removed - searches generic categories only)
 */
ERM.riskRegister.searchCategories = function (searchTerm) {
  var results = [];
  if (!searchTerm) return results;

  var searchLower = searchTerm.toLowerCase();

  // Search generic categories
  for (var j = 0; j < this.categories.length; j++) {
    var genCat = this.categories[j];
    if (genCat.label.toLowerCase().indexOf(searchLower) !== -1) {
      results.push({ category: genCat, departmentId: null, score: 1 });
    }
  }
  return results;
};

/**
 * Get all industry categories (templates removed - returns empty array)
 */
ERM.riskRegister.getAllIndustryCategories = function () {
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

  // Check generic categories
  for (var i = 0; i < this.categories.length; i++) {
    if (this.categories[i].value === value) {
      return this.categories[i].label;
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
  // Guard: only run full init once per session, re-entry just re-renders
  var isFirstInit = !ERM.riskRegister._initialized;
  ERM.riskRegister._initialized = true;

  if (isFirstInit) {
    console.log("Initializing Risk Register module (first time)...");
  } else {
    console.log("Risk Register re-entry (skipping event rebind)...");
  }

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
