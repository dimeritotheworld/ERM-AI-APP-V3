/**
 * Manufacturing - Keywords & Vocabulary
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.manufacturing = ERM_TEMPLATES.manufacturing || {};

ERM_TEMPLATES.manufacturing.keywords = {
  vocabulary: [
    {
      term: "production downtime",
      variations: ["line down", "shutdown", "stoppage", "outage", "breakdown", "equipment failure", "machine down", "plant down", "production halt", "line stoppage", "unplanned downtime", "scheduled downtime", "forced outage", "production interruption", "manufacturing stoppage", "equipment outage", "line failure", "system down", "production loss", "capacity loss"],
      mapsToCategory: "production-operations",
      weight: 10,
    },
    {
      term: "quality defect",
      variations: ["defect", "reject", "scrap", "rework", "nonconformance", "out of spec", "defective", "faulty", "quality issue", "quality problem", "specification deviation", "tolerance violation", "quality escape", "quality failure", "inspection failure", "test failure", "dimensional issue", "appearance defect", "functional defect", "cosmetic defect"],
      mapsToCategory: "product-quality",
      weight: 10,
    },
    {
      term: "safety incident",
      variations: ["injury", "accident", "incident", "recordable", "lost time", "LTI", "near miss", "safety event", "workplace injury", "occupational injury", "work injury", "job injury", "industrial accident", "safety accident", "harm", "hurt", "wounded", "safety occurrence", "safety issue", "safety problem"],
      mapsToCategory: "worker-safety",
      weight: 10,
    },
    {
      term: "supply disruption",
      variations: ["supply chain", "supplier", "shortage", "delivery", "logistics", "stockout", "material shortage", "parts shortage", "component shortage", "vendor failure", "supplier failure", "supply issue", "supply problem", "delivery delay", "late delivery", "missed delivery", "supply constraint", "material availability", "sourcing issue", "procurement issue"],
      mapsToCategory: "supply-chain",
      weight: 10,
    },
    {
      term: "product recall",
      variations: ["recall", "field action", "safety recall", "product withdrawal", "market withdrawal", "customer notification", "field campaign", "voluntary recall", "mandatory recall", "safety notice", "product safety", "consumer safety", "field replacement", "field repair", "service campaign", "corrective action campaign", "safety bulletin", "product alert", "customer alert", "recall notice"],
      mapsToCategory: "product-recall",
      weight: 10,
    },
    {
      term: "equipment failure",
      variations: ["equipment", "machine", "breakdown", "failure", "malfunction", "reliability", "uptime", "availability", "equipment problem", "machine problem", "mechanical failure", "electrical failure", "equipment breakdown", "machine breakdown", "asset failure", "system failure", "component failure", "equipment malfunction", "machine malfunction", "equipment issue"],
      mapsToCategory: "equipment-reliability",
      weight: 9,
    },
    {
      term: "regulatory compliance",
      variations: ["regulatory", "compliance", "audit", "inspection", "certification", "standard", "requirement", "violation", "noncompliance", "regulatory finding", "audit finding", "inspection finding", "compliance gap", "compliance issue", "regulatory issue", "certification issue", "permit issue", "license issue", "approval issue", "regulatory requirement"],
      mapsToCategory: "regulatory-compliance",
      weight: 9,
    },
    {
      term: "OEE",
      variations: ["efficiency", "utilization", "uptime", "availability", "performance", "quality rate", "throughput", "productivity", "output", "yield", "first pass yield", "overall equipment effectiveness", "equipment efficiency", "line efficiency", "production efficiency", "capacity utilization", "asset utilization", "operational efficiency", "manufacturing efficiency", "process efficiency"],
      mapsToCategory: "production-operations",
      weight: 8,
    },
    {
      term: "lean manufacturing",
      variations: ["lean", "waste", "kaizen", "continuous improvement", "5S", "value stream", "pull system", "kanban", "just in time", "JIT", "takt time", "cycle time", "standard work", "visual management", "poka-yoke", "error proofing", "muda", "mura", "muri", "process improvement"],
      mapsToCategory: "production-operations",
      weight: 7,
    },
    {
      term: "inventory",
      variations: ["stock", "WIP", "work in process", "raw material", "finished goods", "safety stock", "buffer stock", "inventory level", "stock level", "inventory management", "stock management", "warehouse", "storage", "stockpile", "reserve", "supply", "materials", "goods", "parts", "components"],
      mapsToCategory: "supply-chain",
      weight: 8,
    },
    {
      term: "customer complaint",
      variations: ["complaint", "customer issue", "customer concern", "customer problem", "warranty claim", "return", "rejection", "chargeback", "claim", "dispute", "customer feedback", "negative feedback", "quality complaint", "delivery complaint", "service complaint", "dissatisfaction", "customer dissatisfaction", "customer rejection", "shipment rejection", "lot rejection"],
      mapsToCategory: "customer-satisfaction",
      weight: 9,
    },
    {
      term: "environmental incident",
      variations: ["environmental", "emission", "discharge", "waste", "permit", "spill", "release", "contamination", "pollution", "environmental impact", "environmental issue", "environmental problem", "air emission", "water discharge", "hazardous waste", "environmental violation", "permit violation", "environmental spill", "chemical release", "environmental release"],
      mapsToCategory: "environmental",
      weight: 9,
    },
    {
      term: "fire hazard",
      variations: ["fire", "explosion", "combustion", "flammable", "ignition", "fire risk", "fire hazard", "explosion hazard", "combustible", "flame", "burn", "conflagration", "blaze", "fire incident", "fire event", "fire emergency", "explosion event", "dust explosion", "vapor explosion", "flash fire"],
      mapsToCategory: "process-safety",
      weight: 10,
    },
    {
      term: "cyber attack",
      variations: ["cyber", "ransomware", "malware", "virus", "hack", "breach", "security incident", "cyber incident", "cyber threat", "cyber risk", "OT security", "IT security", "network attack", "system attack", "data breach", "security breach", "unauthorized access", "cyber intrusion", "cyber compromise", "digital attack"],
      mapsToCategory: "cyber-ot",
      weight: 10,
    },
    {
      term: "labor issue",
      variations: ["labor", "staffing", "workforce", "employee", "worker", "union", "strike", "walkout", "work stoppage", "labor dispute", "labor action", "staffing issue", "staffing shortage", "worker shortage", "skill shortage", "talent shortage", "turnover", "attrition", "retention", "absenteeism"],
      mapsToCategory: "workforce",
      weight: 9,
    },
    {
      term: "maintenance",
      variations: ["PM", "preventive maintenance", "predictive maintenance", "breakdown maintenance", "corrective maintenance", "repair", "service", "overhaul", "rebuild", "maintenance backlog", "deferred maintenance", "maintenance schedule", "maintenance program", "equipment service", "machine service", "asset maintenance", "reliability maintenance", "condition monitoring", "CMMS", "work order"],
      mapsToCategory: "equipment-reliability",
      weight: 8,
    },
    {
      term: "cost overrun",
      variations: ["cost", "expense", "budget", "variance", "overspend", "overrun", "cost increase", "cost escalation", "budget overrun", "budget variance", "cost variance", "material cost", "labor cost", "overhead cost", "manufacturing cost", "production cost", "operating cost", "cost problem", "cost issue", "financial impact"],
      mapsToCategory: "cost-management",
      weight: 8,
    },
    {
      term: "market demand",
      variations: ["market", "demand", "order", "sales", "volume", "forecast", "customer demand", "market demand", "order volume", "sales volume", "demand forecast", "sales forecast", "market trend", "demand trend", "order trend", "backlog", "order backlog", "pipeline", "booking", "customer order"],
      mapsToCategory: "market-demand",
      weight: 8,
    },
    {
      term: "new product",
      variations: ["new product", "product launch", "NPI", "new product introduction", "product development", "R&D", "prototype", "pilot", "qualification", "validation", "ramp-up", "launch", "introduction", "rollout", "product release", "product rollout", "development", "design", "engineering change", "product design"],
      mapsToCategory: "new-product",
      weight: 8,
    },
    {
      term: "process safety",
      variations: ["process safety", "PSM", "chemical safety", "hazardous material", "HAZOP", "safety system", "interlock", "safety instrumented system", "SIS", "emergency shutdown", "ESD", "loss of containment", "LOC", "pressure relief", "overpressure", "runaway reaction", "process upset", "process deviation", "process hazard", "chemical hazard"],
      mapsToCategory: "process-safety",
      weight: 10,
    },
  ],

  departmentKeywords: {
    production: ["line", "shift", "output", "throughput", "cycle time", "takt", "assembly", "fabrication", "production", "manufacturing", "operator", "machine", "cell", "station", "work center", "batch", "lot", "run", "order", "schedule"],
    quality: ["inspection", "test", "defect", "SPC", "control chart", "audit", "specification", "tolerance", "gauge", "measurement", "calibration", "capability", "Cpk", "yield", "scrap", "rework", "nonconformance", "NCR", "CAPA", "quality system"],
    engineering: ["design", "drawing", "specification", "change", "tooling", "process", "CAD", "CAM", "BOM", "bill of materials", "ECN", "engineering change", "revision", "design review", "DFMEA", "PFMEA", "validation", "verification", "prototype", "development"],
    maintenance: ["PM", "preventive", "breakdown", "repair", "spare parts", "reliability", "MTBF", "MTTR", "work order", "CMMS", "condition monitoring", "vibration", "lubrication", "overhaul", "rebuild", "calibration", "asset", "equipment", "machine", "uptime"],
    "supply-chain": ["supplier", "inventory", "logistics", "shipping", "receiving", "MRP", "purchase order", "PO", "lead time", "safety stock", "reorder point", "min-max", "kanban", "pull", "delivery", "freight", "warehouse", "distribution", "sourcing", "procurement"],
    ehs: ["safety", "environmental", "permit", "PPE", "training", "incident", "hazard", "risk assessment", "JSA", "LOTO", "lockout tagout", "ergonomic", "audit", "inspection", "waste", "emission", "spill", "emergency", "fire", "evacuation"],
    "plant-management": ["KPI", "budget", "headcount", "shift", "operations", "capacity", "utilization", "OEE", "cost", "schedule", "delivery", "quality", "safety", "morale", "turnover", "productivity", "efficiency", "target", "goal", "performance"],
    "r-and-d": ["prototype", "development", "testing", "validation", "launch", "innovation", "research", "design", "experiment", "trial", "pilot", "scale-up", "formulation", "specification", "requirement", "feasibility", "concept", "patent", "intellectual property", "technology"],
  },

  commonRisks: [
    { id: "production-stoppage", label: "Production stoppage or line down condition requiring immediate response to minimize customer impact and recover production schedule", category: "production-operations" },
    { id: "quality-escape", label: "Quality defect escape to customer requiring containment, investigation, and corrective action", category: "product-quality" },
    { id: "worker-injury", label: "Worker injury requiring medical treatment and investigation with potential regulatory reporting", category: "worker-safety" },
    { id: "supply-disruption", label: "Supply chain disruption affecting material availability and production continuity", category: "supply-chain" },
    { id: "product-recall", label: "Product recall or field action due to safety or quality concern", category: "product-recall" },
    { id: "equipment-failure", label: "Critical equipment failure causing production impact and requiring emergency repair", category: "equipment-reliability" },
    { id: "environmental-incident", label: "Environmental release or permit exceedance requiring response and notification", category: "environmental" },
    { id: "regulatory-violation", label: "Regulatory compliance violation or audit finding requiring corrective action", category: "regulatory-compliance" },
    { id: "cyber-attack", label: "Cyber attack on manufacturing systems causing production disruption or data breach", category: "cyber-ot" },
    { id: "labor-dispute", label: "Labor dispute or work action threatening production continuity", category: "workforce" },
    { id: "fire-explosion", label: "Fire or explosion in manufacturing facility requiring emergency response", category: "process-safety" },
    { id: "customer-complaint", label: "Significant customer complaint or chargeback affecting relationship", category: "customer-satisfaction" },
    { id: "cost-overrun", label: "Manufacturing cost overrun impacting margins and profitability", category: "cost-management" },
    { id: "demand-decline", label: "Market demand decline requiring capacity and cost adjustments", category: "market-demand" },
    { id: "launch-delay", label: "New product launch delay affecting customer commitments and revenue", category: "new-product" },
  ],

  phraseMapping: [
    { phrase: "line is down", category: "production-operations", risk: "production-stoppage" },
    { phrase: "production stopped", category: "production-operations", risk: "production-stoppage" },
    { phrase: "machine broke down", category: "equipment-reliability", risk: "equipment-failure" },
    { phrase: "equipment failure", category: "equipment-reliability", risk: "equipment-failure" },
    { phrase: "customer complaint", category: "customer-satisfaction", risk: "customer-complaint" },
    { phrase: "quality issue at customer", category: "product-quality", risk: "quality-escape" },
    { phrase: "defect found", category: "product-quality", risk: "quality-escape" },
    { phrase: "someone got hurt", category: "worker-safety", risk: "worker-injury" },
    { phrase: "injury occurred", category: "worker-safety", risk: "worker-injury" },
    { phrase: "safety incident", category: "worker-safety", risk: "worker-injury" },
    { phrase: "supplier cannot deliver", category: "supply-chain", risk: "supply-disruption" },
    { phrase: "material shortage", category: "supply-chain", risk: "supply-disruption" },
    { phrase: "parts not available", category: "supply-chain", risk: "supply-disruption" },
    { phrase: "recalling product", category: "product-recall", risk: "product-recall" },
    { phrase: "field action required", category: "product-recall", risk: "product-recall" },
    { phrase: "fire broke out", category: "process-safety", risk: "fire-explosion" },
    { phrase: "explosion occurred", category: "process-safety", risk: "fire-explosion" },
    { phrase: "chemical spill", category: "environmental", risk: "environmental-incident" },
    { phrase: "permit violation", category: "environmental", risk: "environmental-incident" },
    { phrase: "audit finding", category: "regulatory-compliance", risk: "regulatory-violation" },
    { phrase: "compliance issue", category: "regulatory-compliance", risk: "regulatory-violation" },
    { phrase: "ransomware attack", category: "cyber-ot", risk: "cyber-attack" },
    { phrase: "systems hacked", category: "cyber-ot", risk: "cyber-attack" },
    { phrase: "union strike", category: "workforce", risk: "labor-dispute" },
    { phrase: "workers walking out", category: "workforce", risk: "labor-dispute" },
    { phrase: "costs over budget", category: "cost-management", risk: "cost-overrun" },
    { phrase: "margins declining", category: "cost-management", risk: "cost-overrun" },
    { phrase: "orders declining", category: "market-demand", risk: "demand-decline" },
    { phrase: "customer reducing volume", category: "market-demand", risk: "demand-decline" },
    { phrase: "launch delayed", category: "new-product", risk: "launch-delay" },
    { phrase: "product not ready", category: "new-product", risk: "launch-delay" },
  ],

  searchVocabulary: function (searchTerm) {
    var results = [];
    var lowerTerm = searchTerm.toLowerCase();
    for (var i = 0; i < this.vocabulary.length; i++) {
      var item = this.vocabulary[i];
      if (item.term.toLowerCase().indexOf(lowerTerm) !== -1) {
        results.push(item);
        continue;
      }
      for (var j = 0; j < item.variations.length; j++) {
        if (item.variations[j].toLowerCase().indexOf(lowerTerm) !== -1) {
          results.push(item);
          break;
        }
      }
    }
    results.sort(function (a, b) {
      return b.weight - a.weight;
    });
    return results;
  },

  detectDepartment: function (text) {
    var lowerText = text.toLowerCase();
    var results = [];
    var departments = Object.keys(this.departmentKeywords);
    for (var i = 0; i < departments.length; i++) {
      var keywords = this.departmentKeywords[departments[i]];
      var count = 0;
      for (var j = 0; j < keywords.length; j++) {
        if (lowerText.indexOf(keywords[j].toLowerCase()) !== -1) count++;
      }
      if (count > 0) results.push({ department: departments[i], matchCount: count });
    }
    results.sort(function (a, b) {
      return b.matchCount - a.matchCount;
    });
    return results;
  },

  matchPhrase: function (phrase) {
    var lowerPhrase = phrase.toLowerCase();
    for (var i = 0; i < this.phraseMapping.length; i++) {
      if (lowerPhrase.indexOf(this.phraseMapping[i].phrase) !== -1) return this.phraseMapping[i];
    }
    return null;
  },
};

console.log("Manufacturing Keywords loaded");
