/**
 * Mining Industry Control Configuration
 * Defines industry metadata and common controls
 *
 * @version 1.0.0
 * ES5 Compatible
 */

/* ========================================
   INDUSTRY CONFIGURATION
   ======================================== */

// Create namespace
if (!window.ERM) window.ERM = {};
if (!window.ERM.controlTemplates) window.ERM.controlTemplates = {};
if (!window.ERM.controlTemplates.mining) window.ERM.controlTemplates.mining = {};

/**
 * Mining Industry Configuration
 */
window.ERM.controlTemplates.mining.config = {
  // Industry metadata
  industryId: "mining",
  industryName: "Mining & Resources",
  version: "1.0.0",

  // Industry description
  description: "Comprehensive control framework for mining operations including extraction, processing, and resource management",

  // Industry-specific risk areas
  riskAreas: [
    "Safety & Health",
    "Environmental Compliance",
    "Operational Efficiency",
    "Equipment Management",
    "Community Relations",
    "Regulatory Compliance"
  ],

  // Common control categories for mining
  controlCategories: [
    {
      id: "safety",
      name: "Safety Controls",
      description: "Controls for worker safety, accident prevention, and hazard management"
    },
    {
      id: "environmental",
      name: "Environmental Controls",
      description: "Controls for environmental protection, waste management, and sustainability"
    },
    {
      id: "operational",
      name: "Operational Controls",
      description: "Controls for mining operations, extraction, and processing"
    },
    {
      id: "equipment",
      name: "Equipment Controls",
      description: "Controls for equipment maintenance, monitoring, and reliability"
    },
    {
      id: "compliance",
      name: "Compliance Controls",
      description: "Controls for regulatory compliance, permits, and reporting"
    },
    {
      id: "community",
      name: "Community Relations Controls",
      description: "Controls for stakeholder engagement, social license, and community impact"
    }
  ],

  // Common mining-specific terms for AI matching
  commonTerms: [
    "extraction",
    "ore",
    "tailings",
    "blast",
    "haul",
    "pit",
    "underground",
    "surface",
    "crushing",
    "processing",
    "mill",
    "smelting",
    "refining",
    "stockpile",
    "waste rock",
    "rehabilitation",
    "closure",
    "subsidence",
    "ventilation",
    "ground control",
    "drilling",
    "explosives"
  ],

  // Industry-specific control frequencies
  frequencies: [
    {
      id: "shift",
      label: "Per Shift",
      description: "Every operational shift (typically 8-12 hours)"
    },
    {
      id: "daily",
      label: "Daily",
      description: "Once per day"
    },
    {
      id: "weekly",
      label: "Weekly",
      description: "Once per week"
    },
    {
      id: "monthly",
      label: "Monthly",
      description: "Once per month"
    },
    {
      id: "quarterly",
      label: "Quarterly",
      description: "Every three months"
    },
    {
      id: "annual",
      label: "Annual",
      description: "Once per year"
    },
    {
      id: "continuous",
      label: "Continuous",
      description: "Real-time monitoring"
    },
    {
      id: "triggered",
      label: "Event-Triggered",
      description: "When specific conditions occur"
    }
  ]
};

/**
 * Get industry configuration
 */
window.ERM.controlTemplates.mining.getConfig = function() {
  return this.config;
};

/**
 * Get control categories
 */
window.ERM.controlTemplates.mining.getCategories = function() {
  return this.config.controlCategories;
};

/**
 * Get frequencies
 */
window.ERM.controlTemplates.mining.getFrequencies = function() {
  return this.config.frequencies;
};

console.log("Mining Control Config loaded");
