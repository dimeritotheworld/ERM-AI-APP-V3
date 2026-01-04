/**
 * Sentence Builder Engine
 * Dimeri ERM - Shared Logic
 *
 * This is the ENGINE that powers the sentence builder UI.
 * It reads data from ERM_TEMPLATES[industry].sentences
 *
 * Each industry provides its own sentences data file:
 * - mining-sentences.js
 * - banking-sentences.js
 * - healthcare-sentences.js
 * etc.
 *
 * DATA STRUCTURE EXPECTED:
 * ERM_TEMPLATES[industry].sentences = {
 *   what: [
 *     { id: "...", label: "...", icon: "...", keywords: [...], thinkingText: "..." }
 *   ],
 *   where: {
 *     "what-id": [
 *       { id: "...", label: "...", icon: "..." }
 *     ]
 *   },
 *   impact: [
 *     { id: "...", label: "...", icon: "...", severity: 1-5, thinkingText: "..." }
 *   ],
 *   mappings: {
 *     "what|where|impact": ["risk-id-1", "risk-id-2"]
 *   }
 * }
 */

var ERM_TEMPLATES = ERM_TEMPLATES || {};

ERM_TEMPLATES.sentenceBuilder = {
  /**
   * Get sentences data for current industry
   * @returns {Object|null} Sentences data or null if not available
   */
  getData: function () {
    var industry = ERM_TEMPLATES.loader.getIndustry();
    if (!industry) return null;

    var templates = ERM_TEMPLATES[industry];
    if (!templates || !templates.sentences) return null;

    return templates.sentences;
  },

  /**
   * Check if sentence builder is available for current industry
   * @returns {boolean}
   */
  isAvailable: function () {
    return this.getData() !== null;
  },

  /**
   * Get "what" options (hazards/risk types)
   * @returns {Array}
   */
  getWhatOptions: function () {
    var data = this.getData();
    return data && data.what ? data.what : [];
  },

  /**
   * Get "where" options based on selected "what"
   * @param {string} whatId - Selected hazard ID
   * @returns {Array}
   */
  getWhereOptions: function (whatId) {
    var data = this.getData();
    if (!data || !data.where) return [];

    // Try exact match first
    if (data.where[whatId]) {
      return data.where[whatId];
    }

    // Try "default" locations if defined
    if (data.where["default"]) {
      return data.where["default"];
    }

    return [];
  },

  /**
   * Get "impact" options (consequences)
   * @returns {Array}
   */
  getImpactOptions: function () {
    var data = this.getData();
    return data && data.impact ? data.impact : [];
  },

  /**
   * Get thinking text for a selection step
   * @param {string} step - "what", "where", "impact", or "match"
   * @param {string} selectionId - ID of current selection (for contextual text)
   * @returns {string}
   */
  getThinkingText: function (step, selectionId) {
    var data = this.getData();
    var industryName = ERM_TEMPLATES.loader.getIndustryName() || "industry";

    if (step === "what") {
      // Try to find specific thinking text
      if (data && data.what) {
        for (var i = 0; i < data.what.length; i++) {
          if (data.what[i].id === selectionId && data.what[i].thinkingText) {
            return data.what[i].thinkingText;
          }
        }
      }
      return "Analyzing " + industryName + " hazards...";
    } else if (step === "where") {
      return "Identifying relevant locations...";
    } else if (step === "impact") {
      // Try to find specific thinking text
      if (data && data.impact) {
        for (var j = 0; j < data.impact.length; j++) {
          if (
            data.impact[j].id === selectionId &&
            data.impact[j].thinkingText
          ) {
            return data.impact[j].thinkingText;
          }
        }
      }
      return "Assessing potential outcomes...";
    } else if (step === "match") {
      return "Searching " + industryName + " risk templates...";
    }

    return "Processing...";
  },

  /**
   * Find matching risk templates for a completed sentence
   * @param {string} whatId - Selected hazard ID
   * @param {string} whereId - Selected location ID
   * @param {string} impactId - Selected impact ID
   * @returns {Array} Array of matching risk IDs
   */
  findMatches: function (whatId, whereId, impactId) {
    var data = this.getData();
    if (!data || !data.mappings) return [];

    var results = [];

    // Try exact match first: "what|where|impact"
    var exactKey = whatId + "|" + whereId + "|" + impactId;
    if (data.mappings[exactKey]) {
      results = results.concat(data.mappings[exactKey]);
    }

    // Try wildcard location: "what|*|impact"
    var wildcardLocationKey = whatId + "|*|" + impactId;
    if (data.mappings[wildcardLocationKey]) {
      var locMatches = data.mappings[wildcardLocationKey];
      for (var i = 0; i < locMatches.length; i++) {
        if (results.indexOf(locMatches[i]) === -1) {
          results.push(locMatches[i]);
        }
      }
    }

    // Try wildcard impact: "what|where|*"
    var wildcardImpactKey = whatId + "|" + whereId + "|*";
    if (data.mappings[wildcardImpactKey]) {
      var impMatches = data.mappings[wildcardImpactKey];
      for (var j = 0; j < impMatches.length; j++) {
        if (results.indexOf(impMatches[j]) === -1) {
          results.push(impMatches[j]);
        }
      }
    }

    // Try what-only match: "what|*|*"
    var whatOnlyKey = whatId + "|*|*";
    if (data.mappings[whatOnlyKey]) {
      var whatMatches = data.mappings[whatOnlyKey];
      for (var k = 0; k < whatMatches.length; k++) {
        if (results.indexOf(whatMatches[k]) === -1) {
          results.push(whatMatches[k]);
        }
      }
    }

    return results;
  },

  /**
   * Get risk data by ID (searches across all categories)
   * @param {string} riskId - Risk template ID
   * @returns {Object|null} { risk: {...}, categoryId: "..." } or null
   */
  getRiskData: function (riskId) {
    var industry = ERM_TEMPLATES.loader.getIndustry();
    if (!industry) return null;

    var templates = ERM_TEMPLATES[industry];
    if (!templates || !templates.risks) return null;

    // Use findById helper if available
    if (typeof templates.risks.findById === "function") {
      return templates.risks.findById(riskId);
    }

    // Manual search through categories
    for (var catId in templates.risks) {
      if (
        templates.risks.hasOwnProperty(catId) &&
        typeof templates.risks[catId] !== "function"
      ) {
        var risks = templates.risks[catId];
        if (Array.isArray(risks)) {
          for (var i = 0; i < risks.length; i++) {
            if (risks[i].id === riskId) {
              return { risk: risks[i], categoryId: catId };
            }
          }
        }
      }
    }

    return null;
  },

  /**
   * Calculate match percentage (for display)
   * Higher = better match
   * @param {number} index - Position in results (0 = best)
   * @param {number} totalMatches - Total number of matches
   * @returns {number} Percentage 0-100
   */
  calculateMatchPercent: function (index, totalMatches) {
    if (index === 0) return 98;
    if (index === 1) return 85;
    if (index === 2) return 72;
    return Math.max(50, 72 - (index - 2) * 10);
  },
};
