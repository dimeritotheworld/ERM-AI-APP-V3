/**
 * ERM Template Loader
 * Manages industry templates for AI suggestions
 * Dimeri ERM - ES5 Compatible
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};

ERM_TEMPLATES.loader = {
  currentIndustry: null,

  /**
   * Map industry IDs (kebab-case) to namespace keys (camelCase)
   * Industry IDs are used in localStorage and UI dropdowns
   * Namespace keys are used to access ERM_TEMPLATES.{namespace}
   */
  industryNamespaceMap: {
    "mining": "mining",
    "healthcare": "healthcare",
    "oil-gas": "oilGas",
    "energy": "energy",
    "public-sector": "publicSector",
    "manufacturing": "manufacturing"
  },

  /* ========================================
     INDUSTRY MANAGEMENT
     ======================================== */

  /**
   * Set active industry
   */
  setIndustry: function (industryId) {
    this.currentIndustry = industryId;
    localStorage.setItem("ERM_industry", industryId);
    console.log("[Templates] Industry set to:", industryId);
  },

  /**
   * Get active industry ID (kebab-case)
   */
  getIndustry: function () {
    if (!this.currentIndustry) {
      this.currentIndustry = localStorage.getItem("ERM_industry") || "mining";
    }
    return this.currentIndustry;
  },

  /**
   * Get namespace key for current or specified industry
   */
  getIndustryNamespace: function (industryId) {
    var id = industryId || this.getIndustry();
    return this.industryNamespaceMap[id] || id;
  },

  /**
   * Get industry display name
   */
  getIndustryName: function () {
    var namespace = this.getIndustryNamespace();
    if (
      !namespace ||
      !ERM_TEMPLATES[namespace] ||
      !ERM_TEMPLATES[namespace].config
    ) {
      return "your industry";
    }
    return ERM_TEMPLATES[namespace].config.industryName || ERM_TEMPLATES[namespace].config.name || "your industry";
  },

  /**
   * Check if templates are loaded for current industry
   */
  hasTemplates: function () {
    var namespace = this.getIndustryNamespace();
    return namespace && ERM_TEMPLATES[namespace] && ERM_TEMPLATES[namespace].risks;
  },

  /**
   * Get current industry templates
   */
  getTemplates: function () {
    var namespace = this.getIndustryNamespace();
    if (!namespace || !ERM_TEMPLATES[namespace]) {
      return null;
    }
    return ERM_TEMPLATES[namespace];
  },

  /* ========================================
     DEPARTMENT FUNCTIONS
     ======================================== */

  /**
   * Get all departments for current industry
   */
  getDepartments: function () {
    var templates = this.getTemplates();
    if (!templates || !templates.departments) return [];

    var all = [];
    var i;

    // Universal departments
    if (templates.departments.universal) {
      for (i = 0; i < templates.departments.universal.length; i++) {
        var dept = templates.departments.universal[i];
        dept.type = "universal";
        all.push(dept);
      }
    }

    // Industry-specific departments
    if (templates.departments.industrySpecific) {
      for (i = 0; i < templates.departments.industrySpecific.length; i++) {
        var deptSpecific = templates.departments.industrySpecific[i];
        deptSpecific.type = "industry";
        all.push(deptSpecific);
      }
    }

    return all;
  },

  /**
   * Get department by ID
   */
  getDepartmentById: function (deptId) {
    var departments = this.getDepartments();
    for (var i = 0; i < departments.length; i++) {
      if (departments[i].id === deptId) {
        return departments[i];
      }
    }
    return null;
  },

  /* ========================================
     CATEGORY FUNCTIONS
     ======================================== */

  /**
   * Get categories for a department
   */
  getCategories: function (departmentId) {
    var templates = this.getTemplates();
    if (!templates || !templates.categories) return [];

    return templates.categories[departmentId] || [];
  },

  /**
   * Get all categories across all departments
   */
  getAllCategories: function () {
    var templates = this.getTemplates();
    if (!templates || !templates.categories) return [];

    var all = [];
    for (var deptId in templates.categories) {
      if (templates.categories.hasOwnProperty(deptId)) {
        var cats = templates.categories[deptId];
        for (var i = 0; i < cats.length; i++) {
          var cat = cats[i];
          cat.departmentId = deptId;
          all.push(cat);
        }
      }
    }
    return all;
  },

  /**
   * Get category by ID
   */
  getCategoryById: function (categoryId) {
    var allCats = this.getAllCategories();
    for (var i = 0; i < allCats.length; i++) {
      if (allCats[i].id === categoryId) {
        return allCats[i];
      }
    }
    return null;
  },

  /* ========================================
     RISK FUNCTIONS
     ======================================== */

  /**
   * Get risks for a category
   */
  getRisks: function (categoryId) {
    var templates = this.getTemplates();
    if (!templates || !templates.risks) return [];

    return templates.risks[categoryId] || [];
  },

  /**
   * Get a specific risk by ID
   */
  getRiskById: function (categoryId, riskId) {
    var risks = this.getRisks(categoryId);

    for (var i = 0; i < risks.length; i++) {
      if (risks[i].id === riskId) {
        return risks[i];
      }
    }

    return null;
  },

  /**
   * Get all risks across all categories
   */
  getAllRisks: function () {
    var templates = this.getTemplates();
    if (!templates || !templates.risks) return [];

    var all = [];
    for (var catId in templates.risks) {
      if (templates.risks.hasOwnProperty(catId)) {
        var risks = templates.risks[catId];
        for (var i = 0; i < risks.length; i++) {
          var risk = risks[i];
          risk.categoryId = catId;
          all.push(risk);
        }
      }
    }
    return all;
  },

  /**
   * Get common risks for quick selection
   */
  getCommonRisks: function () {
    var templates = this.getTemplates();
    if (!templates || !templates.keywords) return [];

    return templates.keywords.commonRisks || [];
  },

  /* ========================================
     SEARCH FUNCTIONS
     ======================================== */

  /**
   * Search risks by keyword
   * Searches: vocabulary, risk titles, risk keywords, risk plainLanguage, category keywords
   */
  searchRisks: function (query) {
    var templates = this.getTemplates();
    query = query.toLowerCase().trim();
    if (query.length < 2) return [];

    var results = [];
    var seen = {};

    // 1. Search vocabulary (from keywords.js) - highest priority
    if (templates && templates.keywords && templates.keywords.vocabulary) {
      var vocabulary = templates.keywords.vocabulary;
      for (var i = 0; i < vocabulary.length; i++) {
        var vocab = vocabulary[i];
        var matched = false;

        // Check term
        if (vocab.term.toLowerCase().indexOf(query) !== -1) {
          matched = true;
        }

        // Check variations
        if (!matched && vocab.variations) {
          for (var j = 0; j < vocab.variations.length; j++) {
            if (vocab.variations[j].toLowerCase().indexOf(query) !== -1) {
              matched = true;
              break;
            }
          }
        }

        if (matched && !seen[vocab.mapsToCategory]) {
          seen[vocab.mapsToCategory] = true;
          results.push({
            term: vocab.term,
            category: vocab.mapsToCategory,
            risk: vocab.mapsToRisk || null,
            weight: vocab.weight || 5,
          });
        }
      }
    }

    // 2. Search risk titles directly - weight 9
    var allRisks = this.getAllRisks();
    for (var k = 0; k < allRisks.length; k++) {
      var risk = allRisks[k];
      if (seen[risk.id]) continue;

      var riskMatched = false;
      var matchWeight = 0;

      // Check titles - weight 9
      if (risk.titles) {
        for (var t = 0; t < risk.titles.length; t++) {
          if (risk.titles[t].toLowerCase().indexOf(query) !== -1) {
            riskMatched = true;
            matchWeight = 9;
            break;
          }
        }
      }

      // Check keywords[] array - weight 8
      if (!riskMatched && risk.keywords) {
        for (var kw = 0; kw < risk.keywords.length; kw++) {
          if (risk.keywords[kw].toLowerCase().indexOf(query) !== -1) {
            riskMatched = true;
            matchWeight = 8;
            break;
          }
        }
      }

      // Check plain language - weight 7
      if (!riskMatched && risk.plainLanguage) {
        for (var p = 0; p < risk.plainLanguage.length; p++) {
          if (risk.plainLanguage[p].toLowerCase().indexOf(query) !== -1) {
            riskMatched = true;
            matchWeight = 7;
            break;
          }
        }
      }

      if (riskMatched) {
        seen[risk.id] = true;
        results.push({
          term: risk.titles ? risk.titles[0] : risk.id,
          category: risk.categoryId,
          risk: risk.id,
          weight: matchWeight,
        });
      }
    }

    // 3. Search category keywords - weight 6
    var allCategories = this.getAllCategories();
    for (var c = 0; c < allCategories.length; c++) {
      var cat = allCategories[c];
      if (seen[cat.id]) continue;

      // Categories have keywords as a string (comma or space separated)
      if (cat.keywords && cat.keywords.toLowerCase().indexOf(query) !== -1) {
        seen[cat.id] = true;
        results.push({
          term: cat.name,
          category: cat.id,
          risk: null,
          weight: 6,
        });
      }
    }

    // Sort by weight (higher = better match)
    results.sort(function (a, b) {
      return b.weight - a.weight;
    });

    return results;
  },

  /* ========================================
     SENTENCE BUILDER FUNCTIONS
     ======================================== */

  /**
   * Get sentence builder data
   */
  getSentenceBuilder: function () {
    var templates = this.getTemplates();
    if (!templates || !templates.keywords) return null;

    return templates.keywords.sentenceBuilder || null;
  },

  /**
   * Get risk types for sentence builder (level 1)
   */
  getRiskTypes: function () {
    var builder = this.getSentenceBuilder();
    if (!builder) return [];

    return builder.riskTypes || [];
  },

  /**
   * Get specifics for a risk type (level 2)
   */
  getSpecifics: function (riskTypeId) {
    var builder = this.getSentenceBuilder();
    if (!builder || !builder.specifics) return [];

    return builder.specifics[riskTypeId] || [];
  },

  /**
   * Get causes for a specific (level 3)
   */
  getCauses: function (specificId) {
    var builder = this.getSentenceBuilder();
    if (!builder || !builder.causes) return [];

    return builder.causes[specificId] || [];
  },

  /**
   * Get consequences for a specific (level 4)
   */
  getConsequences: function (specificId) {
    var builder = this.getSentenceBuilder();
    if (!builder || !builder.consequences) return [];

    return builder.consequences[specificId] || [];
  },

  /* ========================================
     FORM FIELD SUGGESTIONS
     ======================================== */

  /**
   * Get root causes for a risk (limited to 3)
   */
  getRootCauses: function (categoryId, riskId) {
    var risk = this.getRiskById(categoryId, riskId);
    if (!risk) return [];
    return (risk.rootCauses || []).slice(0, 3);
  },

  /**
   * Get consequences for a risk (limited to 3)
   */
  getRiskConsequences: function (categoryId, riskId) {
    var risk = this.getRiskById(categoryId, riskId);
    if (!risk) return [];
    return (risk.consequences || []).slice(0, 3);
  },

  /**
   * Get action plans for a risk
   */
  getActionPlans: function (categoryId, riskId) {
    var risk = this.getRiskById(categoryId, riskId);
    if (!risk) return [];
    return risk.actionPlans || [];
  },

  /**
   * Get treatment recommendation for a risk
   */
  getTreatment: function (categoryId, riskId) {
    var risk = this.getRiskById(categoryId, riskId);
    if (!risk) return null;
    return risk.treatment || null;
  },

  /**
   * Get owners for a risk
   */
  getOwners: function (categoryId, riskId) {
    var risk = this.getRiskById(categoryId, riskId);
    if (!risk) return null;
    return risk.owners || null;
  },

  /**
   * Get timing for a risk
   */
  getTiming: function (categoryId, riskId) {
    var risk = this.getRiskById(categoryId, riskId);
    if (!risk) return null;
    return risk.timing || null;
  },

  /**
   * Get scoring for a risk
   */
  getScoring: function (categoryId, riskId) {
    var risk = this.getRiskById(categoryId, riskId);
    if (!risk) return null;
    return risk.scoring || null;
  },

  /* ========================================
     CATEGORY MAPPING
     ======================================== */

  /**
   * Map template category to form category value
   */
  mapToFormCategory: function (categoryId) {
    var categoryMap = {
      // Safety categories
      "fatality-risk": "Health & Safety",
      "vehicle-mobile": "Health & Safety",
      "ground-control": "Health & Safety",
      "working-heights": "Health & Safety",
      "hazardous-substances": "Health & Safety",
      "confined-spaces": "Health & Safety",
      "fire-explosion": "Health & Safety",
      "contractor-safety": "Health & Safety",
      "occupational-health": "Health & Safety",

      // Environmental categories
      environmental: "Environmental",
      tailings: "Environmental",
      "water-management": "Environmental",
      "air-quality": "Environmental",
      rehabilitation: "Environmental",
      "waste-management": "Environmental",

      // Financial categories
      "financial-reporting": "Financial",
      "commodity-risk": "Financial",
      "cash-flow": "Financial",
      treasury: "Financial",
      "cost-management": "Financial",
      "capital-projects": "Financial",

      // Compliance categories
      regulatory: "Compliance",
      "mining-rights": "Compliance",
      permits: "Compliance",
      legal: "Compliance",

      // Technology categories
      cybersecurity: "Technology",
      systems: "Technology",
      "data-management": "Technology",
      automation: "Technology",

      // Strategic categories
      "strategic-planning": "Strategic",
      governance: "Strategic",
      stakeholder: "Strategic",

      // Operational categories
      production: "Operational",
      equipment: "Operational",
      "supply-chain": "Operational",
      processing: "Operational",

      // Reputational categories
      "community-relations": "Reputational",
      media: "Reputational",
      brand: "Reputational",
    };

    return categoryMap[categoryId] || "Operational";
  },
};

console.log("[Templates] Template loader initialized");
