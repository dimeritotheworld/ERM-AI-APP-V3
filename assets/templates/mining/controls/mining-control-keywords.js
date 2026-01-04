/**
 * Mining Industry Control Keywords
 * Keyword mappings for AI-powered control matching
 *
 * @version 1.0.0
 * ES5 Compatible
 * EXTENSIBLE: Add new keyword mappings to improve AI matching
 */

/* ========================================
   KEYWORD MAPPINGS
   ======================================== */

// Create namespace
if (!window.ERM) window.ERM = {};
if (!window.ERM.controlTemplates) window.ERM.controlTemplates = {};
if (!window.ERM.controlTemplates.mining) window.ERM.controlTemplates.mining = {};

/**
 * Keyword to Control ID mappings
 * EXTENSIBLE: Add more keywords to improve AI matching
 * Each keyword can map to multiple control IDs
 */
window.ERM.controlTemplates.mining.keywordMappings = {

  // Safety keywords
  "hazard": ["safety-hazid-shift"],
  "pre-shift": ["safety-hazid-shift", "ops-truck-pre-start"],
  "toolbox": ["safety-hazid-shift"],
  "JSA": ["safety-hazid-shift"],
  "SWMS": ["safety-hazid-shift"],
  "PPE": ["safety-ppe-inspection"],
  "helmet": ["safety-ppe-inspection"],
  "boots": ["safety-ppe-inspection"],
  "gloves": ["safety-ppe-inspection"],
  "safety glasses": ["safety-ppe-inspection"],
  "lockout": ["safety-isolation-verification", "proc-crusher-lockout"],
  "LOTO": ["safety-isolation-verification", "proc-crusher-lockout"],
  "isolation": ["safety-isolation-verification", "proc-crusher-lockout"],
  "tagout": ["safety-isolation-verification"],
  "emergency": ["safety-emergency-drill"],
  "evacuation": ["safety-emergency-drill", "ops-blast-clearance"],
  "drill": ["safety-emergency-drill", "ops-drill-pattern-approval"],
  "rescue": ["safety-emergency-drill"],

  // Operations keywords
  "blast": ["ops-drill-pattern-approval", "ops-blast-clearance", "exp-blast-approval"],
  "drilling": ["ops-drill-pattern-approval"],
  "pattern": ["ops-drill-pattern-approval", "exp-blast-approval"],
  "hole": ["ops-drill-pattern-approval"],
  "burden": ["ops-drill-pattern-approval"],
  "spacing": ["ops-drill-pattern-approval"],
  "clearance": ["ops-blast-clearance"],
  "all-clear": ["ops-blast-clearance"],
  "haul road": ["ops-haul-road-inspection"],
  "ramp": ["ops-haul-road-inspection"],
  "berm": ["ops-haul-road-inspection", "geo-slope-inspection"],
  "road": ["ops-haul-road-inspection"],
  "truck": ["ops-truck-pre-start"],
  "pre-start": ["ops-truck-pre-start"],
  "operator": ["ops-truck-pre-start"],
  "defect": ["ops-truck-pre-start"],

  // Processing keywords
  "crusher": ["proc-crusher-lockout"],
  "crushing": ["proc-crusher-lockout"],
  "mill": ["proc-mill-vibration"],
  "SAG": ["proc-mill-vibration"],
  "ball mill": ["proc-mill-vibration"],
  "vibration": ["proc-mill-vibration"],
  "bearing": ["proc-mill-vibration"],
  "condition monitoring": ["proc-mill-vibration", "maint-oil-analysis"],
  "tailings": ["proc-tailings-density", "water-tsf-inspection"],
  "slurry": ["proc-tailings-density"],
  "density": ["proc-tailings-density"],
  "pipeline": ["proc-tailings-density"],

  // Environmental keywords
  "water quality": ["env-water-discharge-test"],
  "discharge": ["env-water-discharge-test"],
  "pH": ["env-water-discharge-test"],
  "TSS": ["env-water-discharge-test"],
  "metals": ["env-water-discharge-test"],
  "dust": ["env-dust-monitoring", "vent-dust-suppression"],
  "PM10": ["env-dust-monitoring"],
  "air quality": ["env-dust-monitoring"],
  "monitoring": ["env-dust-monitoring", "geo-prism-monitoring", "vent-gas-detector", "water-pump-monitor", "water-license-compliance"],
  "waste": ["env-waste-segregation"],
  "hazardous waste": ["env-waste-segregation"],
  "recycling": ["env-waste-segregation"],
  "segregation": ["env-waste-segregation"],
  "rehabilitation": ["env-rehab-inspection"],
  "revegetation": ["env-rehab-inspection"],
  "landform": ["env-rehab-inspection"],
  "closure": ["env-rehab-inspection"],
  "erosion": ["env-rehab-inspection"],

  // Maintenance keywords
  "preventive maintenance": ["maint-pm-schedule"],
  "PM": ["maint-pm-schedule", "env-dust-monitoring"],
  "schedule": ["maint-pm-schedule"],
  "service": ["maint-pm-schedule"],
  "oil analysis": ["maint-oil-analysis"],
  "predictive": ["maint-oil-analysis"],
  "wear": ["maint-oil-analysis"],
  "contamination": ["maint-oil-analysis"],
  "spare parts": ["maint-critical-spares"],
  "inventory": ["maint-critical-spares", "exp-inventory-reconcile"],
  "critical spares": ["maint-critical-spares"],
  "stock": ["maint-critical-spares"],

  // Geotechnical keywords
  "prism": ["geo-prism-monitoring"],
  "movement": ["geo-prism-monitoring"],
  "displacement": ["geo-prism-monitoring"],
  "wall": ["geo-prism-monitoring", "geo-slope-inspection"],
  "slope": ["geo-slope-inspection"],
  "high wall": ["geo-slope-inspection"],
  "stability": ["geo-slope-inspection", "geo-prism-monitoring"],
  "crack": ["geo-slope-inspection"],
  "radar": ["geo-ground-radar"],
  "GPR": ["geo-ground-radar"],
  "void": ["geo-ground-radar"],
  "subsurface": ["geo-ground-radar"],

  // Ventilation keywords
  "airflow": ["vent-airflow-survey"],
  "ventilation": ["vent-airflow-survey", "vent-dust-suppression"],
  "underground": ["vent-airflow-survey", "vent-gas-detector", "vent-dust-suppression"],
  "fan": ["vent-airflow-survey"],
  "gas": ["vent-gas-detector"],
  "detector": ["vent-gas-detector"],
  "methane": ["vent-gas-detector"],
  "carbon monoxide": ["vent-gas-detector"],
  "CO": ["vent-gas-detector"],
  "oxygen": ["vent-gas-detector"],
  "suppression": ["vent-dust-suppression"],
  "spray": ["vent-dust-suppression"],
  "respirable": ["vent-dust-suppression"],

  // Explosives keywords
  "magazine": ["exp-magazine-access", "exp-inventory-reconcile"],
  "explosives": ["exp-magazine-access", "exp-inventory-reconcile", "exp-blast-approval"],
  "access control": ["exp-magazine-access"],
  "security": ["exp-magazine-access"],
  "CCTV": ["exp-magazine-access"],
  "reconciliation": ["exp-inventory-reconcile"],
  "count": ["exp-inventory-reconcile"],
  "audit": ["exp-inventory-reconcile"],
  "blast design": ["exp-blast-approval"],
  "approval": ["exp-blast-approval", "ops-drill-pattern-approval"],
  "authorization": ["exp-blast-approval"],

  // Water management keywords
  "pump": ["water-pump-monitor"],
  "dewatering": ["water-pump-monitor"],
  "flow": ["water-pump-monitor"],
  "pressure": ["water-pump-monitor"],
  "alarm": ["water-pump-monitor", "vent-gas-detector"],
  "dam": ["water-tsf-inspection"],
  "TSF": ["water-tsf-inspection"],
  "embankment": ["water-tsf-inspection"],
  "seepage": ["water-tsf-inspection", "geo-slope-inspection"],
  "freeboard": ["water-tsf-inspection"],
  "license": ["water-license-compliance"],
  "allocation": ["water-license-compliance"],
  "extraction": ["water-license-compliance"],
  "compliance": ["water-license-compliance", "env-water-discharge-test", "safety-ppe-inspection"]
};

/**
 * Synonym mappings for better AI matching
 * Maps alternative terms to standard keywords
 */
window.ERM.controlTemplates.mining.synonyms = {
  // Safety synonyms
  "risk assessment": "hazard",
  "danger": "hazard",
  "peril": "hazard",
  "hard hat": "helmet",
  "safety boots": "boots",
  "safety shoes": "boots",
  "eye protection": "safety glasses",
  "goggles": "safety glasses",
  "lock-out": "lockout",
  "tag-out": "tagout",
  "energy isolation": "isolation",
  "evacuation drill": "evacuation",

  // Operations synonyms
  "blasting": "blast",
  "shot": "blast",
  "detonation": "blast",
  "drill hole": "hole",
  "blast hole": "hole",
  "haul truck": "truck",
  "dump truck": "truck",
  "haulage": "truck",
  "pre-operation": "pre-start",
  "pre-shift check": "pre-start",
  "maintenance issue": "defect",
  "fault": "defect",

  // Processing synonyms
  "jaw crusher": "crusher",
  "cone crusher": "crusher",
  "gyratory crusher": "crusher",
  "grinding": "mill",
  "milling": "mill",
  "SAG mill": "SAG",
  "semi-autogenous": "SAG",
  "ore slurry": "slurry",
  "pulp": "slurry",

  // Environmental synonyms
  "effluent": "discharge",
  "wastewater": "discharge",
  "particulate matter": "dust",
  "PM": "dust",
  "air emissions": "air quality",
  "rubbish": "waste",
  "garbage": "waste",
  "trash": "waste",
  "mine closure": "closure",
  "reclamation": "rehabilitation",

  // Maintenance synonyms
  "planned maintenance": "preventive maintenance",
  "scheduled maintenance": "preventive maintenance",
  "routine maintenance": "preventive maintenance",
  "lube oil": "oil analysis",
  "lubricant": "oil analysis",
  "spare part": "spare parts",
  "consumables": "spare parts",

  // Geotechnical synonyms
  "pit wall": "wall",
  "slope angle": "slope",
  "batter": "slope",
  "rockfall": "crack",
  "failure": "crack",
  "ground movement": "movement",
  "deformation": "movement",

  // Ventilation synonyms
  "air flow": "airflow",
  "air velocity": "airflow",
  "methane gas": "methane",
  "CO gas": "CO",
  "dust control": "suppression",

  // Explosives synonyms
  "powder": "explosives",
  "ANFO": "explosives",
  "emulsion": "explosives",
  "detonator": "explosives",
  "shot firing": "blast",

  // Water synonyms
  "pumping": "pump",
  "water pump": "pump",
  "tailings dam": "dam",
  "water storage": "dam",
  "water licence": "license",
  "permit": "license"
};

/**
 * Control type indicators
 * Keywords that suggest control type
 */
window.ERM.controlTemplates.mining.typeIndicators = {
  preventive: [
    "approval", "authorization", "permit", "restrict", "prevent", "require",
    "mandate", "prohibit", "limit", "before", "pre-", "segregation", "control"
  ],
  detective: [
    "monitor", "inspect", "audit", "review", "check", "detect", "measure",
    "survey", "test", "track", "log", "record", "surveillance", "observe"
  ],
  corrective: [
    "repair", "fix", "correct", "remediate", "restore", "recover", "respond",
    "address", "resolve", "action", "investigate", "rectify"
  ],
  directive: [
    "policy", "procedure", "guideline", "standard", "training", "awareness",
    "communication", "education", "define", "establish", "protocol"
  ]
};

/**
 * Find controls matching text using keywords
 */
window.ERM.controlTemplates.mining.findControlsByKeywords = function(text) {
  if (!text) return [];

  var textLower = text.toLowerCase();
  var matches = {};

  // Apply synonyms
  for (var synonym in this.synonyms) {
    if (textLower.indexOf(synonym.toLowerCase()) !== -1) {
      var standardTerm = this.synonyms[synonym];
      if (textLower.indexOf(standardTerm.toLowerCase()) === -1) {
        textLower += " " + standardTerm.toLowerCase();
      }
    }
  }

  // Check keyword mappings
  for (var keyword in this.keywordMappings) {
    if (textLower.indexOf(keyword.toLowerCase()) !== -1) {
      var controlIds = this.keywordMappings[keyword];
      for (var i = 0; i < controlIds.length; i++) {
        var controlId = controlIds[i];
        if (!matches[controlId]) {
          matches[controlId] = {
            controlId: controlId,
            score: 0,
            keywords: []
          };
        }
        matches[controlId].score += 10;
        matches[controlId].keywords.push(keyword);
      }
    }
  }

  // Check control template keywords directly
  // Updated to support new 9-category structure
  var controls = [];
  if (window.ERM_TEMPLATES && window.ERM_TEMPLATES.mining && window.ERM_TEMPLATES.mining.controls) {
    if (typeof window.ERM_TEMPLATES.mining.controls.getAll === "function") {
      controls = window.ERM_TEMPLATES.mining.controls.getAll();
    } else if (Array.isArray(window.ERM_TEMPLATES.mining.controls)) {
      controls = window.ERM_TEMPLATES.mining.controls;
    }
  }

  for (var j = 0; j < controls.length; j++) {
    var control = controls[j];

    // Match against keywords (highest weight)
    var controlKeywords = control.keywords || [];
    for (var k = 0; k < controlKeywords.length; k++) {
      if (textLower.indexOf(controlKeywords[k].toLowerCase()) !== -1) {
        if (!matches[control.id]) {
          matches[control.id] = {
            controlId: control.id,
            score: 0,
            keywords: []
          };
        }
        matches[control.id].score += 15;
        if (matches[control.id].keywords.indexOf(controlKeywords[k]) === -1) {
          matches[control.id].keywords.push(controlKeywords[k]);
        }
      }
    }

    // Match against titles (medium weight)
    var controlTitles = control.titles || [];
    for (var t = 0; t < controlTitles.length; t++) {
      if (textLower.indexOf(controlTitles[t].toLowerCase()) !== -1) {
        if (!matches[control.id]) {
          matches[control.id] = {
            controlId: control.id,
            score: 0,
            keywords: []
          };
        }
        matches[control.id].score += 20;
        if (matches[control.id].keywords.indexOf(controlTitles[t]) === -1) {
          matches[control.id].keywords.push(controlTitles[t]);
        }
      }
    }

    // Match against plain language (high weight for exact match)
    var plainLanguage = control.plainLanguage || [];
    for (var p = 0; p < plainLanguage.length; p++) {
      var plainPhrase = plainLanguage[p].toLowerCase();
      if (textLower.indexOf(plainPhrase) !== -1) {
        if (!matches[control.id]) {
          matches[control.id] = {
            controlId: control.id,
            score: 0,
            keywords: []
          };
        }
        matches[control.id].score += 25;
        if (matches[control.id].keywords.indexOf(plainLanguage[p]) === -1) {
          matches[control.id].keywords.push(plainLanguage[p]);
        }
      }
    }
  }

  // Convert to array and sort by score
  var results = [];
  for (var id in matches) {
    if (matches.hasOwnProperty(id)) {
      results.push(matches[id]);
    }
  }

  results.sort(function(a, b) {
    return b.score - a.score;
  });

  return results;
};

/**
 * Suggest control type based on text
 */
window.ERM.controlTemplates.mining.suggestControlType = function(text) {
  if (!text) return null;

  var textLower = text.toLowerCase();
  var scores = {
    preventive: 0,
    detective: 0,
    corrective: 0,
    directive: 0
  };

  // Score each type
  for (var type in this.typeIndicators) {
    if (this.typeIndicators.hasOwnProperty(type)) {
      var indicators = this.typeIndicators[type];
      for (var i = 0; i < indicators.length; i++) {
        if (textLower.indexOf(indicators[i].toLowerCase()) !== -1) {
          scores[type] += 1;
        }
      }
    }
  }

  // Find highest scoring type
  var maxScore = 0;
  var suggestedType = null;
  for (var t in scores) {
    if (scores[t] > maxScore) {
      maxScore = scores[t];
      suggestedType = t;
    }
  }

  return {
    type: suggestedType,
    score: maxScore,
    confidence: Math.min(95, maxScore * 15 + 50)
  };
};

/**
 * Get related keywords for a keyword
 */
window.ERM.controlTemplates.mining.getRelatedKeywords = function(keyword) {
  var related = [];
  var keywordLower = keyword.toLowerCase();

  // Find controls matching this keyword
  var controlIds = this.keywordMappings[keywordLower] || [];

  // Get all keywords from those controls
  for (var i = 0; i < controlIds.length; i++) {
    var control = window.ERM.controlTemplates.mining.getControlById(controlIds[i]);
    if (control && control.keywords) {
      for (var j = 0; j < control.keywords.length; j++) {
        var kw = control.keywords[j];
        if (kw.toLowerCase() !== keywordLower && related.indexOf(kw) === -1) {
          related.push(kw);
        }
      }
    }
  }

  // Find synonyms
  for (var synonym in this.synonyms) {
    if (this.synonyms[synonym].toLowerCase() === keywordLower) {
      related.push(synonym);
    }
  }

  return related;
};

console.log("Mining Control Keywords loaded");
