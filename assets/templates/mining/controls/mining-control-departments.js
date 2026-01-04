/**
 * Mining Industry Departments
 * Defines departments/functional areas in mining operations
 *
 * @version 1.0.0
 * ES5 Compatible
 */

/* ========================================
   MINING DEPARTMENTS
   ======================================== */

// Create namespace
if (!window.ERM) window.ERM = {};
if (!window.ERM.controlTemplates) window.ERM.controlTemplates = {};
if (!window.ERM.controlTemplates.mining) window.ERM.controlTemplates.mining = {};

/**
 * Mining Departments
 * EXTENSIBLE: Add new departments here
 */
window.ERM.controlTemplates.mining.departments = [
  {
    id: "operations",
    name: "Mining Operations",
    description: "Extraction, drilling, blasting, and material movement",
    keywords: ["extraction", "drill", "blast", "haul", "load", "excavate", "mine", "dig"]
  },
  {
    id: "processing",
    name: "Processing & Metallurgy",
    description: "Ore processing, crushing, milling, and refining",
    keywords: ["crush", "mill", "process", "grind", "separate", "concentrate", "smelt", "refine", "metallurg"]
  },
  {
    id: "safety",
    name: "Safety & Health",
    description: "Occupational health, safety management, and emergency response",
    keywords: ["safety", "health", "hazard", "injury", "accident", "emergency", "rescue", "first aid", "PPE", "incident"]
  },
  {
    id: "environmental",
    name: "Environmental Management",
    description: "Environmental compliance, monitoring, and sustainability",
    keywords: ["environment", "emission", "discharge", "waste", "water", "air quality", "pollution", "rehab", "closure", "sustainability"]
  },
  {
    id: "maintenance",
    name: "Maintenance & Engineering",
    description: "Equipment maintenance, reliability, and engineering support",
    keywords: ["maintenance", "repair", "service", "engineering", "equipment", "machinery", "reliability", "breakdown", "preventive"]
  },
  {
    id: "geotechnical",
    name: "Geotechnical & Geology",
    description: "Ground stability, geological assessment, and resource modeling",
    keywords: ["geotechnical", "geology", "ground", "stability", "subsidence", "slope", "rock", "soil", "core", "sample", "resource"]
  },
  {
    id: "ventilation",
    name: "Ventilation & Underground Services",
    description: "Underground ventilation, air quality, and services",
    keywords: ["ventilation", "air", "underground", "shaft", "tunnel", "airflow", "fan", "dust", "gas", "refuge"]
  },
  {
    id: "explosives",
    name: "Explosives Management",
    description: "Explosives handling, storage, and blast management",
    keywords: ["explosive", "blast", "detonator", "ANFO", "emulsion", "magazine", "powder", "initiation", "shot"]
  },
  {
    id: "water",
    name: "Water Management",
    description: "Water supply, dewatering, and water treatment",
    keywords: ["water", "dewater", "pump", "discharge", "treatment", "tailings dam", "pond", "drainage", "aquifer"]
  },
  {
    id: "community",
    name: "Community & Stakeholder Relations",
    description: "Community engagement, indigenous relations, and social license",
    keywords: ["community", "stakeholder", "indigenous", "local", "social", "engagement", "consultation", "impact", "benefit"]
  },
  {
    id: "compliance",
    name: "Regulatory Compliance",
    description: "Permits, licenses, and regulatory reporting",
    keywords: ["compliance", "regulatory", "permit", "license", "report", "audit", "inspection", "authority", "legal"]
  },
  {
    id: "security",
    name: "Security & Access Control",
    description: "Site security, access control, and asset protection",
    keywords: ["security", "access", "guard", "surveillance", "CCTV", "fence", "gate", "patrol", "theft", "trespass"]
  },
  {
    id: "supply",
    name: "Supply Chain & Logistics",
    description: "Procurement, inventory, and logistics management",
    keywords: ["supply", "procurement", "inventory", "logistics", "warehouse", "spare parts", "vendor", "contractor", "delivery"]
  },
  {
    id: "planning",
    name: "Mine Planning & Scheduling",
    description: "Mine design, planning, and production scheduling",
    keywords: ["planning", "schedule", "design", "sequence", "production", "stockpile", "blend", "grade control", "survey"]
  }
];

/**
 * Get all departments
 */
window.ERM.controlTemplates.mining.getDepartments = function() {
  return this.departments;
};

/**
 * Get department by ID
 */
window.ERM.controlTemplates.mining.getDepartmentById = function(id) {
  for (var i = 0; i < this.departments.length; i++) {
    if (this.departments[i].id === id) {
      return this.departments[i];
    }
  }
  return null;
};

/**
 * Find departments matching keywords
 */
window.ERM.controlTemplates.mining.findDepartmentsByKeywords = function(text) {
  if (!text) return [];

  var textLower = text.toLowerCase();
  var matches = [];

  for (var i = 0; i < this.departments.length; i++) {
    var dept = this.departments[i];
    var score = 0;

    // Check department name
    if (textLower.indexOf(dept.name.toLowerCase()) !== -1) {
      score += 20;
    }

    // Check keywords
    for (var j = 0; j < dept.keywords.length; j++) {
      if (textLower.indexOf(dept.keywords[j].toLowerCase()) !== -1) {
        score += 10;
      }
    }

    if (score > 0) {
      matches.push({
        department: dept,
        score: score
      });
    }
  }

  // Sort by score descending
  matches.sort(function(a, b) {
    return b.score - a.score;
  });

  return matches;
};

console.log("Mining Departments loaded");
