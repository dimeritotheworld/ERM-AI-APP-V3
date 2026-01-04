/**
 * Dimeri ERM - Risk Register AI Templates
 * Industry-specific risk libraries and keyword mappings
 *
 * @version 1.0.0
 * ES5 Compatible
 */

console.log("Loading risk-register-ai-templates.js...");

var ERM = window.ERM || {};
ERM.riskAI = ERM.riskAI || {};

/* ========================================
   CATEGORY DEFINITIONS
   ======================================== */
ERM.riskAI.categories = {
  strategic: { label: "Strategic Risk", color: "#6366f1" },
  financial: { label: "Financial Risk", color: "#f59e0b" },
  operational: { label: "Operational Risk", color: "#3b82f6" },
  compliance: { label: "Compliance Risk", color: "#8b5cf6" },
  technology: { label: "Technology/Cyber Risk", color: "#ef4444" },
  reputational: { label: "Reputational Risk", color: "#ec4899" },
  "health-safety": { label: "Health & Safety Risk", color: "#10b981" },
  environmental: { label: "Environmental Risk", color: "#14b8a6" },
};

/* ========================================
   KEYWORD TO CATEGORY MAPPING
   Universal keywords for NLP detection
   ======================================== */
ERM.riskAI.keywordMap = {
  // Technology / Cyber
  cyber: "technology",
  hack: "technology",
  breach: "technology",
  "data loss": "technology",
  "data leak": "technology",
  "system failure": "technology",
  software: "technology",
  "IT infrastructure": "technology",
  network: "technology",
  server: "technology",
  cloud: "technology",
  ransomware: "technology",
  malware: "technology",
  phishing: "technology",
  DDoS: "technology",
  encryption: "technology",
  database: "technology",
  API: "technology",
  integration: "technology",
  downtime: "technology",
  backup: "technology",
  "disaster recovery": "technology",

  // Compliance
  compliance: "compliance",
  regulatory: "compliance",
  regulation: "compliance",
  license: "compliance",
  permit: "compliance",
  audit: "compliance",
  legal: "compliance",
  law: "compliance",
  policy: "compliance",
  privacy: "compliance",
  GDPR: "compliance",
  "data protection": "compliance",
  "anti-money laundering": "compliance",
  AML: "compliance",
  KYC: "compliance",
  sanctions: "compliance",
  "reporting requirements": "compliance",
  disclosure: "compliance",
  governance: "compliance",
  fiduciary: "compliance",

  // Financial
  financial: "financial",
  credit: "financial",
  "credit risk": "financial",
  liquidity: "financial",
  currency: "financial",
  "foreign exchange": "financial",
  FX: "financial",
  investment: "financial",
  capital: "financial",
  budget: "financial",
  "cash flow": "financial",
  debt: "financial",
  fraud: "financial",
  embezzlement: "financial",
  theft: "financial",
  "interest rate": "financial",
  inflation: "financial",
  revenue: "financial",
  profitability: "financial",
  insolvency: "financial",
  bankruptcy: "financial",

  // Operational
  operational: "operational",
  "process failure": "operational",
  "supply chain": "operational",
  supplier: "operational",
  vendor: "operational",
  logistics: "operational",
  production: "operational",
  manufacturing: "operational",
  inventory: "operational",
  quality: "operational",
  "power outage": "operational",
  electricity: "operational",
  outage: "operational",
  disruption: "operational",
  "business continuity": "operational",
  capacity: "operational",
  staffing: "operational",
  "key person": "operational",
  "single point of failure": "operational",
  "equipment failure": "operational",
  maintenance: "operational",

  // Strategic
  strategic: "strategic",
  competition: "strategic",
  competitor: "strategic",
  "market share": "strategic",
  growth: "strategic",
  expansion: "strategic",
  merger: "strategic",
  acquisition: "strategic",
  "M&A": "strategic",
  brand: "strategic",
  innovation: "strategic",
  disruption: "strategic",
  "new entrant": "strategic",
  "market change": "strategic",
  "business model": "strategic",
  "digital transformation": "strategic",

  // Health & Safety
  safety: "health-safety",
  health: "health-safety",
  injury: "health-safety",
  accident: "health-safety",
  workplace: "health-safety",
  occupational: "health-safety",
  hazard: "health-safety",
  PPE: "health-safety",
  fatality: "health-safety",
  incident: "health-safety",
  emergency: "health-safety",
  fire: "health-safety",
  explosion: "health-safety",
  chemical: "health-safety",
  ergonomic: "health-safety",

  // Environmental
  environmental: "environmental",
  pollution: "environmental",
  climate: "environmental",
  carbon: "environmental",
  emissions: "environmental",
  waste: "environmental",
  water: "environmental",
  sustainability: "environmental",
  ESG: "environmental",
  contamination: "environmental",
  spill: "environmental",
  biodiversity: "environmental",
  deforestation: "environmental",

  // Reputational
  reputation: "reputational",
  reputational: "reputational",
  media: "reputational",
  "public relations": "reputational",
  "PR crisis": "reputational",
  "social media": "reputational",
  scandal: "reputational",
  trust: "reputational",
  "brand damage": "reputational",
  "customer complaint": "reputational",
  "negative press": "reputational",
  viral: "reputational",
  boycott: "reputational",
};
