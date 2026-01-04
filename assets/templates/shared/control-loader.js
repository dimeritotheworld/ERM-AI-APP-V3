/**
 * Control Template Loader
 * Auto-discovers and loads control templates from all industries
 *
 * @version 1.0.0
 * ES5 Compatible
 * INDUSTRY-AGNOSTIC: Automatically discovers templates without hardcoded lists
 */

/* ========================================
   CONTROL TEMPLATE LOADER
   ======================================== */

// Create namespace
if (!window.ERM) window.ERM = {};
if (!window.ERM.controlTemplates) window.ERM.controlTemplates = {};

/**
 * Control Template Loader
 */
window.ERM.controlTemplates.loader = {

  /**
   * List of available industries
   * Auto-populated by checking window.ERM.controlTemplates namespace
   */
  availableIndustries: [],

  /**
   * Currently selected industry
   */
  currentIndustry: null,

  /**
   * Discover available industries
   * Scans window.ERM.controlTemplates for registered industries
   */
  discoverIndustries: function() {
    this.availableIndustries = [];

    // Check for industries registered in namespace
    for (var key in window.ERM.controlTemplates) {
      if (window.ERM.controlTemplates.hasOwnProperty(key)) {
        // Skip loader itself and utility functions
        if (key === "loader" || key === "parser" || key === "shared") {
          continue;
        }

        var industry = window.ERM.controlTemplates[key];

        // Verify it has required structure
        if (
          industry.config &&
          industry.departments &&
          industry.categories &&
          industry.controls &&
          industry.keywordMappings
        ) {
          this.availableIndustries.push({
            id: key,
            name: industry.config.industryName || key,
            description: industry.config.description || "",
            version: industry.config.version || "1.0.0",
            controlCount: industry.controls ? industry.controls.length : 0
          });
        }
      }
    }

    console.log("Discovered " + this.availableIndustries.length + " industries");
    return this.availableIndustries;
  },

  /**
   * Get list of available industries
   */
  getAvailableIndustries: function() {
    if (this.availableIndustries.length === 0) {
      this.discoverIndustries();
    }
    return this.availableIndustries;
  },

  /**
   * Set current industry
   */
  setIndustry: function(industryId) {
    // Verify industry exists
    var industry = window.ERM.controlTemplates[industryId];
    if (!industry) {
      console.error("Industry not found:", industryId);
      return false;
    }

    this.currentIndustry = industryId;
    console.log("Set current industry to:", industryId);
    return true;
  },

  /**
   * Get current industry
   */
  getCurrentIndustry: function() {
    if (!this.currentIndustry && this.availableIndustries.length > 0) {
      // Default to first available industry
      this.currentIndustry = this.availableIndustries[0].id;
    }
    return this.currentIndustry;
  },

  /**
   * Get industry object
   */
  getIndustry: function(industryId) {
    var id = industryId || this.getCurrentIndustry();
    if (!id) return null;

    return window.ERM.controlTemplates[id];
  },

  /**
   * Get all control templates from current industry
   * Updated to support new category-based structure
   */
  getAllControls: function() {
    var industry = this.getIndustry();
    if (!industry || !industry.controls) return [];

    // Check if controls have getAll() method (new structure)
    if (typeof industry.controls.getAll === "function") {
      return industry.controls.getAll();
    }

    // Fallback to old array structure
    if (Array.isArray(industry.controls)) {
      return industry.controls;
    }

    return [];
  },

  /**
   * Get controls by category from current industry
   * NEW: Supports 9-category risk-based structure
   */
  getControlsByCategory: function(categoryId) {
    var industry = this.getIndustry();
    if (!industry || !industry.controls) return [];

    // Check if controls have getByCategory() method (new structure)
    if (typeof industry.controls.getByCategory === "function") {
      return industry.controls.getByCategory(categoryId);
    }

    // Fallback: filter by mitigatesRiskCategories
    var allControls = this.getAllControls();
    var results = [];
    for (var i = 0; i < allControls.length; i++) {
      var control = allControls[i];
      if (control.mitigatesRiskCategories && control.mitigatesRiskCategories.indexOf(categoryId) !== -1) {
        results.push(control);
      }
    }
    return results;
  },

  /**
   * Get control by ID from current industry
   * Updated to support new category-based structure
   */
  getControlById: function(controlId) {
    var industry = this.getIndustry();
    if (!industry || !industry.controls) return null;

    // Check if controls have getById() method (new structure)
    if (typeof industry.controls.getById === "function") {
      return industry.controls.getById(controlId);
    }

    // Fallback: search in array
    var allControls = this.getAllControls();
    for (var i = 0; i < allControls.length; i++) {
      if (allControls[i].id === controlId) {
        return allControls[i];
      }
    }
    return null;
  },

  /**
   * Get all departments from current industry
   */
  getDepartments: function() {
    var industry = this.getIndustry();
    if (!industry || !industry.getDepartments) return [];

    return industry.getDepartments();
  },

  /**
   * Get categories for department from current industry
   */
  getCategoriesByDepartment: function(departmentId) {
    var industry = this.getIndustry();
    if (!industry || !industry.getCategoriesByDepartment) return [];

    return industry.getCategoriesByDepartment(departmentId);
  },

  /**
   * Get all categories from current industry
   */
  getAllCategories: function() {
    var industry = this.getIndustry();
    if (!industry || !industry.getAllCategories) return [];

    return industry.getAllCategories();
  },

  /**
   * Find controls matching keywords
   */
  findControlsByKeywords: function(text) {
    var industry = this.getIndustry();
    if (!industry || !industry.findControlsByKeywords) return [];

    return industry.findControlsByKeywords(text);
  },

  /**
   * Suggest control type based on text
   */
  suggestControlType: function(text) {
    var industry = this.getIndustry();
    if (!industry || !industry.suggestControlType) return null;

    return industry.suggestControlType(text);
  },

  /**
   * Find departments matching keywords
   */
  findDepartmentsByKeywords: function(text) {
    var industry = this.getIndustry();
    if (!industry || !industry.findDepartmentsByKeywords) return [];

    return industry.findDepartmentsByKeywords(text);
  },

  /**
   * Find categories matching keywords
   */
  findCategoriesByKeywords: function(text) {
    var industry = this.getIndustry();
    if (!industry || !industry.findCategoriesByKeywords) return [];

    return industry.findCategoriesByKeywords(text);
  },

  /**
   * Get statistics about loaded templates
   */
  getStatistics: function() {
    var industry = this.getIndustry();
    if (!industry) {
      return {
        industryCount: this.availableIndustries.length,
        currentIndustry: null,
        controlCount: 0,
        departmentCount: 0,
        categoryCount: 0
      };
    }

    var departments = this.getDepartments();
    var categories = this.getAllCategories();
    var controls = this.getAllControls();

    return {
      industryCount: this.availableIndustries.length,
      currentIndustry: this.currentIndustry,
      industryName: industry.config ? industry.config.industryName : null,
      controlCount: controls.length,
      departmentCount: departments.length,
      categoryCount: categories.length
    };
  },

  /**
   * Match user input to control templates
   * Returns best matching templates with scores
   */
  matchUserInput: function(userInput) {
    if (!userInput || !userInput.trim()) return [];

    var results = [];

    // Find controls by keywords
    var keywordMatches = this.findControlsByKeywords(userInput);

    // Get full control objects
    for (var i = 0; i < keywordMatches.length; i++) {
      var match = keywordMatches[i];
      var control = this.getControlById(match.controlId);

      if (control) {
        results.push({
          control: control,
          score: match.score,
          matchedKeywords: match.keywords || [],
          matchType: "keyword"
        });
      }
    }

    // Sort by score descending
    results.sort(function(a, b) {
      return b.score - a.score;
    });

    return results;
  },

  /**
   * Get control template suggestions based on risk description
   * Useful for suggesting controls during risk assessment
   */
  suggestControlsForRisk: function(riskDescription) {
    if (!riskDescription) return [];

    var matches = this.matchUserInput(riskDescription);

    // Limit to top 5 suggestions
    return matches.slice(0, 5);
  },

  /**
   * Initialize loader
   * Discovers industries and sets default
   */
  init: function() {
    console.log("Initializing Control Template Loader...");

    // Discover available industries
    this.discoverIndustries();

    // Auto-select first industry if available
    if (this.availableIndustries.length > 0) {
      this.setIndustry(this.availableIndustries[0].id);
    }

    // Log statistics
    var stats = this.getStatistics();
    console.log("Control Template Loader initialized:");
    console.log("  Industries:", stats.industryCount);
    console.log("  Current Industry:", stats.currentIndustry);
    console.log("  Controls:", stats.controlCount);
    console.log("  Departments:", stats.departmentCount);
    console.log("  Categories:", stats.categoryCount);

    return true;
  }
};

/**
 * Auto-initialize when DOM ready
 */
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() {
    window.ERM.controlTemplates.loader.init();
  });
} else {
  // DOM already loaded, initialize immediately
  window.ERM.controlTemplates.loader.init();
}

console.log("Control Template Loader loaded");
