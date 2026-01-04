/**
 * Dimeri ERM - Risk Register AI Module
 * AI-First Risk Creation with Natural Language Processing
 *
 * Main entry point - loads icons and initializes module
 *
 * Dependencies (load before this file):
 * - risk-register-ai-templates.js
 * - risk-register-ai-parser.js
 * - risk-register-ai-ui.js
 *
 * @version 1.0.0
 * ES5 Compatible
 */

console.log("Loading risk-register-ai.js (main)...");

var ERM = window.ERM || {};
ERM.riskAI = ERM.riskAI || {};

/* ========================================
   ICONS
   ======================================== */
ERM.riskAI.icons = {
  sparkles:
    '<svg class="ai-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>',
  edit: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
  zap: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  check:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
  alertTriangle:
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  lightbulb:
    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.3A7 7 0 0 0 12 2z"/></svg>',
};

/* ========================================
   INITIALIZATION
   ======================================== */
ERM.riskAI.init = function () {
  console.log("Risk Register AI module initialized");
  console.log(
    "- Templates:",
    typeof ERM.riskAI.industryRisks !== "undefined" ? "loaded" : "MISSING"
  );
  console.log(
    "- Parser:",
    typeof ERM.riskAI.parseNaturalLanguage !== "undefined"
      ? "loaded"
      : "MISSING"
  );
  console.log(
    "- UI:",
    typeof ERM.riskAI.showAddRiskChoice !== "undefined" ? "loaded" : "MISSING"
  );
};

// Auto-init
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function () {
    ERM.riskAI.init();
  });
} else {
  ERM.riskAI.init();
}

window.ERM = ERM;
console.log("risk-register-ai.js (main) loaded successfully");
