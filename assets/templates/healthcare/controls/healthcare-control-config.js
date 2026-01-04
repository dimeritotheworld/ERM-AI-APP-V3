/**
 * Healthcare Industry Control Configuration
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
if (!window.ERM.controlTemplates.healthcare) window.ERM.controlTemplates.healthcare = {};

/**
 * Healthcare Industry Configuration
 */
window.ERM.controlTemplates.healthcare.config = {
  // Industry metadata
  industryId: "healthcare",
  industryName: "Healthcare & Medical Services",
  version: "1.0.0",

  // Industry description
  description: "Comprehensive control framework for healthcare organizations including patient safety, clinical quality, regulatory compliance, and operational excellence",

  // Industry-specific risk areas
  riskAreas: [
    "Patient Safety",
    "Clinical Quality",
    "Regulatory Compliance",
    "Privacy & Security",
    "Workforce Management",
    "Revenue Cycle"
  ],

  // Common control categories for healthcare
  controlCategories: [
    {
      id: "patient-safety",
      name: "Patient Safety Controls",
      description: "Controls for preventing patient harm, falls, medication errors, and never events"
    },
    {
      id: "clinical-quality",
      name: "Clinical Quality Controls",
      description: "Controls for ensuring high-quality clinical care and outcomes"
    },
    {
      id: "infection-prevention",
      name: "Infection Prevention Controls",
      description: "Controls for preventing healthcare-associated infections"
    },
    {
      id: "regulatory-compliance",
      name: "Regulatory Compliance Controls",
      description: "Controls for meeting national and regional healthcare regulatory requirements"
    },
    {
      id: "privacy-security",
      name: "Privacy & Security Controls",
      description: "Controls for health information privacy compliance, data protection, and cybersecurity"
    },
    {
      id: "operational",
      name: "Operational Controls",
      description: "Controls for patient flow, staffing, and operational efficiency"
    },
    {
      id: "financial",
      name: "Financial Controls",
      description: "Controls for revenue cycle, billing compliance, and financial management"
    }
  ],

  // Common healthcare-specific terms for AI matching
  commonTerms: [
    "patient",
    "clinical",
    "hospital",
    "nursing",
    "physician",
    "medication",
    "surgery",
    "emergency",
    "inpatient",
    "outpatient",
    "ICU",
    "OR",
    "ED",
    "pharmacy",
    "laboratory",
    "radiology",
    "privacy regulations",
    "emergency care access",
    "accreditation",
    "accreditation",
    "regulatory survey",
    "infection",
    "safety",
    "quality"
  ],

  // Industry-specific control frequencies
  frequencies: [
    {
      id: "shift",
      label: "Per Shift",
      description: "Every nursing shift (typically 8-12 hours)"
    },
    {
      id: "hourly",
      label: "Hourly",
      description: "Every hour (purposeful rounding)"
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
    },
    {
      id: "per-patient",
      label: "Per Patient",
      description: "For each patient encounter"
    }
  ]
};

/**
 * Get industry configuration
 */
window.ERM.controlTemplates.healthcare.getConfig = function() {
  return this.config;
};

/**
 * Get control categories
 */
window.ERM.controlTemplates.healthcare.getCategories = function() {
  return this.config.controlCategories;
};

/**
 * Get frequencies
 */
window.ERM.controlTemplates.healthcare.getFrequencies = function() {
  return this.config.frequencies;
};

console.log("Healthcare Control Config loaded");
