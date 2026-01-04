/**
 * Manufacturing - Control Templates
 * Dimeri ERM Template Library
 */
if (!window.ERM_TEMPLATES) window.ERM_TEMPLATES = {};
if (!window.ERM_TEMPLATES.manufacturing) window.ERM_TEMPLATES.manufacturing = {};
if (!window.ERM_TEMPLATES.manufacturing.controls) window.ERM_TEMPLATES.manufacturing.controls = {};

window.ERM_TEMPLATES.manufacturing.controls.operational = [
  {
    id: "ctrl-preventive-maintenance",
    titles: ["Preventive Maintenance Program", "PM Program", "Planned Maintenance", "Scheduled Maintenance"],
    descriptions: [
      "Systematic preventive maintenance program to maintain equipment reliability and prevent unplanned downtime.",
      "Planned maintenance activities based on manufacturer recommendations, equipment condition, and criticality.",
    ],
    keywords: ["preventive", "maintenance", "PM", "planned", "reliability", "schedule"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["Maintenance Manager", "Plant Manager"], secondary: ["Reliability Engineer", "Maintenance Planner"] },
    frequency: "scheduled",
    department: "maintenance",
    mitigatesRiskCategories: ["equipment", "operational"],
  },
  {
    id: "ctrl-predictive-maintenance",
    titles: ["Predictive Maintenance", "Condition Monitoring", "PdM Program", "Equipment Monitoring"],
    descriptions: [
      "Condition-based monitoring using vibration analysis, thermography, oil analysis, and other techniques to predict failures.",
      "Predictive maintenance program enabling proactive intervention before equipment failure occurs.",
    ],
    keywords: ["predictive", "condition", "monitoring", "vibration", "thermography", "PdM"],
    type: "detective",
    category: "automated",
    owners: { primary: ["Reliability Engineer", "Maintenance Manager"], secondary: ["PdM Technician", "Maintenance Planner"] },
    frequency: "scheduled",
    department: "maintenance",
    mitigatesRiskCategories: ["equipment", "operational"],
  },
  {
    id: "ctrl-production-monitoring",
    titles: ["Production Monitoring", "OEE Tracking", "Real-Time Monitoring", "Production Dashboard"],
    descriptions: [
      "Real-time production monitoring enabling rapid identification and response to production issues.",
      "OEE and KPI tracking providing visibility into production performance and enabling data-driven decisions.",
    ],
    keywords: ["monitoring", "OEE", "tracking", "dashboard", "KPI", "real-time"],
    type: "detective",
    category: "automated",
    owners: { primary: ["Production Manager", "Plant Manager"], secondary: ["Manufacturing Engineer", "Shift Supervisor"] },
    frequency: "continuous",
    department: "production",
    mitigatesRiskCategories: ["operational"],
  },
];

window.ERM_TEMPLATES.manufacturing.controls.quality = [
  {
    id: "ctrl-quality-management-system",
    titles: ["Quality Management System", "QMS", "ISO 9001", "IATF 16949", "Quality System"],
    descriptions: [
      "Documented quality management system providing framework for consistent quality and continuous improvement.",
      "Comprehensive QMS aligned with industry standards ensuring product quality and customer satisfaction.",
    ],
    keywords: ["QMS", "quality", "ISO", "IATF", "documentation", "system"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["Quality Director", "Plant Manager"], secondary: ["Quality Manager", "Quality Engineer"] },
    frequency: "continuous",
    department: "quality",
    mitigatesRiskCategories: ["quality", "product-quality"],
  },
  {
    id: "ctrl-spc",
    titles: ["Statistical Process Control", "SPC", "Process Control Charts", "Process Monitoring"],
    descriptions: [
      "Statistical process control system monitoring critical process parameters and alerting to out-of-control conditions.",
      "Real-time SPC enabling early detection of process variation before defects occur.",
    ],
    keywords: ["SPC", "statistical", "control chart", "process", "variation", "monitoring"],
    type: "detective",
    category: "automated",
    owners: { primary: ["Quality Engineer", "Quality Manager"], secondary: ["Production Supervisor", "Operator"] },
    frequency: "continuous",
    department: "quality",
    mitigatesRiskCategories: ["quality"],
  },
  {
    id: "ctrl-inspection",
    titles: ["Inspection Program", "Quality Inspection", "Final Inspection", "Incoming Inspection"],
    descriptions: [
      "Systematic inspection program including incoming, in-process, and final inspection to catch defects.",
      "Inspection activities at critical points ensuring product conformance to specifications.",
    ],
    keywords: ["inspection", "testing", "verification", "incoming", "final", "in-process"],
    type: "detective",
    category: "manual",
    owners: { primary: ["Quality Manager", "Quality Supervisor"], secondary: ["Inspector", "Lab Technician"] },
    frequency: "continuous",
    department: "quality",
    mitigatesRiskCategories: ["quality", "product-quality"],
  },
  {
    id: "ctrl-error-proofing",
    titles: ["Error-Proofing", "Poka-Yoke", "Mistake-Proofing", "Defect Prevention"],
    descriptions: [
      "Error-proofing devices and methods preventing defects from being made or escaping to next operation.",
      "Poka-yoke implementation making it impossible to produce or pass defective product.",
    ],
    keywords: ["error-proofing", "poka-yoke", "mistake-proofing", "prevention", "fool-proof"],
    type: "preventive",
    category: "automated",
    owners: { primary: ["Manufacturing Engineer", "Quality Engineer"], secondary: ["Production Supervisor", "Tooling"] },
    frequency: "continuous",
    department: "engineering",
    mitigatesRiskCategories: ["quality"],
  },
];

window.ERM_TEMPLATES.manufacturing.controls.safety = [
  {
    id: "ctrl-safety-program",
    titles: ["Safety Program", "EHS Program", "Safety Management System", "Occupational Safety"],
    descriptions: [
      "Comprehensive safety program including hazard identification, training, PPE, and continuous improvement.",
      "EHS management system ensuring worker safety and regulatory compliance.",
    ],
    keywords: ["safety", "EHS", "hazard", "PPE", "OSHA", "training"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["EHS Manager", "Plant Manager"], secondary: ["Safety Coordinator", "Production Manager"] },
    frequency: "continuous",
    department: "ehs",
    mitigatesRiskCategories: ["worker-safety"],
  },
  {
    id: "ctrl-machine-guarding",
    titles: ["Machine Guarding", "Safety Guards", "Interlock Systems", "Physical Safeguards"],
    descriptions: [
      "Machine guarding and safety interlocks preventing worker contact with hazardous moving parts.",
      "Physical safeguards and safety devices protecting workers from machinery hazards.",
    ],
    keywords: ["guarding", "interlock", "safety", "machine", "physical", "barrier"],
    type: "preventive",
    category: "automated",
    owners: { primary: ["Safety Engineer", "EHS Manager"], secondary: ["Maintenance", "Production"] },
    frequency: "continuous",
    department: "ehs",
    mitigatesRiskCategories: ["worker-safety"],
  },
  {
    id: "ctrl-lockout-tagout",
    titles: ["Lockout/Tagout Program", "LOTO", "Energy Control", "Machine Isolation"],
    descriptions: [
      "Lockout/tagout program ensuring proper isolation of hazardous energy during maintenance and service.",
      "Energy control procedures preventing unexpected equipment startup during maintenance activities.",
    ],
    keywords: ["lockout", "tagout", "LOTO", "energy", "isolation", "control"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["EHS Manager", "Maintenance Manager"], secondary: ["Safety Coordinator", "Maintenance Supervisor"] },
    frequency: "triggered",
    department: "ehs",
    mitigatesRiskCategories: ["worker-safety"],
  },
  {
    id: "ctrl-psm",
    titles: ["Process Safety Management", "PSM Program", "Safety Instrumented Systems", "Process Hazard Analysis"],
    descriptions: [
      "Process safety management program for facilities with highly hazardous chemicals.",
      "Comprehensive PSM including process hazard analysis, mechanical integrity, management of change, and emergency response.",
    ],
    keywords: ["PSM", "process safety", "hazard analysis", "SIS", "mechanical integrity"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["Process Safety Manager", "EHS Director"], secondary: ["Operations Manager", "Engineering"] },
    frequency: "continuous",
    department: "ehs",
    mitigatesRiskCategories: ["process-safety"],
  },
];

window.ERM_TEMPLATES.manufacturing.controls.supplyChain = [
  {
    id: "ctrl-supplier-management",
    titles: ["Supplier Management", "Supplier Quality", "Vendor Management", "Supply Base Management"],
    descriptions: [
      "Supplier management program including qualification, monitoring, and development of supply base.",
      "Systematic approach to supplier selection, evaluation, and ongoing performance management.",
    ],
    keywords: ["supplier", "vendor", "qualification", "evaluation", "performance", "management"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["Procurement Manager", "Quality Manager"], secondary: ["Supplier Quality Engineer", "Buyer"] },
    frequency: "continuous",
    department: "procurement",
    mitigatesRiskCategories: ["supply-chain", "quality"],
  },
  {
    id: "ctrl-inventory-management",
    titles: ["Inventory Management", "Safety Stock", "Material Planning", "MRP"],
    descriptions: [
      "Inventory management system balancing service levels with inventory investment.",
      "Safety stock and material planning providing buffer against supply variability.",
    ],
    keywords: ["inventory", "safety stock", "MRP", "planning", "materials", "buffer"],
    type: "preventive",
    category: "automated",
    owners: { primary: ["Materials Manager", "Supply Chain Manager"], secondary: ["Planner", "Inventory Analyst"] },
    frequency: "continuous",
    department: "supply-chain",
    mitigatesRiskCategories: ["supply-chain"],
  },
];

window.ERM_TEMPLATES.manufacturing.controls.cyber = [
  {
    id: "ctrl-ot-security",
    titles: ["OT Security Program", "Industrial Cybersecurity", "ICS Security", "Manufacturing IT Security"],
    descriptions: [
      "Cybersecurity program specifically addressing operational technology and industrial control systems.",
      "OT security controls including network segmentation, access control, and monitoring.",
    ],
    keywords: ["OT", "security", "ICS", "cyber", "industrial", "SCADA"],
    type: "preventive",
    category: "automated",
    owners: { primary: ["IT Director", "Plant Manager"], secondary: ["OT Security Manager", "Controls Engineer"] },
    frequency: "continuous",
    department: "it",
    mitigatesRiskCategories: ["cyber-risk"],
  },
];

window.ERM_TEMPLATES.manufacturing.controls.getAll = function () {
  var all = [];
  var categories = ["operational", "quality", "safety", "supplyChain", "cyber"];
  for (var i = 0; i < categories.length; i++) {
    var cat = this[categories[i]];
    if (cat && Array.isArray(cat)) {
      for (var j = 0; j < cat.length; j++) {
        cat[j].controlCategory = categories[i];
        all.push(cat[j]);
      }
    }
  }
  return all;
};

window.ERM_TEMPLATES.manufacturing.controls.findById = function (id) {
  var all = this.getAll();
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
};

window.ERM_TEMPLATES.manufacturing.controls.search = function (keyword) {
  var results = [];
  var lowerKeyword = keyword.toLowerCase();
  var all = this.getAll();
  for (var i = 0; i < all.length; i++) {
    var control = all[i];
    var found = false;
    for (var j = 0; j < control.titles.length; j++) {
      if (control.titles[j].toLowerCase().indexOf(lowerKeyword) !== -1) { found = true; break; }
    }
    if (!found && control.keywords) {
      for (var k = 0; k < control.keywords.length; k++) {
        if (control.keywords[k].toLowerCase().indexOf(lowerKeyword) !== -1) { found = true; break; }
      }
    }
    if (found) results.push(control);
  }
  return results;
};

console.log("Manufacturing Control Templates loaded");
