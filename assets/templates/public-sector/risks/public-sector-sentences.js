/**
 * Public Sector - Sentence Builder Data
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.publicSector = ERM_TEMPLATES.publicSector || {};

ERM_TEMPLATES.publicSector.sentences = {
  what: [
    { id: "cyber-attack", label: "Cyber attack / Data breach", icon: "💻", keywords: ["cyber", "breach", "ransomware", "hacking"], thinkingText: "Analyzing cyber risks..." },
    { id: "budget-shortfall", label: "Budget shortfall", icon: "💰", keywords: ["budget", "deficit", "revenue", "funding"], thinkingText: "Analyzing financial risks..." },
    { id: "infrastructure-failure", label: "Infrastructure failure", icon: "🏗️", keywords: ["infrastructure", "failure", "collapse", "break"], thinkingText: "Analyzing infrastructure risks..." },
    { id: "natural-disaster", label: "Natural disaster", icon: "🌪️", keywords: ["disaster", "storm", "flood", "earthquake"], thinkingText: "Analyzing disaster risks..." },
    { id: "fraud", label: "Fraud / Misconduct", icon: "⚠️", keywords: ["fraud", "corruption", "theft", "misconduct"], thinkingText: "Analyzing fraud risks..." },
    { id: "service-disruption", label: "Service disruption", icon: "🚫", keywords: ["service", "disruption", "outage", "delay"], thinkingText: "Analyzing service risks..." },
    { id: "public-safety-event", label: "Public safety event", icon: "🚨", keywords: ["crime", "shooting", "emergency", "incident"], thinkingText: "Analyzing public safety risks..." },
    { id: "compliance-violation", label: "Compliance violation", icon: "📋", keywords: ["compliance", "violation", "audit", "finding"], thinkingText: "Analyzing compliance risks..." },
    { id: "litigation", label: "Litigation / Claim", icon: "⚖️", keywords: ["lawsuit", "claim", "liability", "settlement"], thinkingText: "Analyzing legal risks..." },
    { id: "workforce-issue", label: "Workforce issue", icon: "👥", keywords: ["staffing", "retention", "union", "grievance"], thinkingText: "Analyzing workforce risks..." },
  ],

  where: {
    "cyber-attack": [
      { id: "it-systems", label: "IT systems / Network", icon: "💻" },
      { id: "public-records", label: "Public records database", icon: "📁" },
      { id: "financial-systems", label: "Financial systems", icon: "💰" },
      { id: "public-safety-systems", label: "911 / CAD systems", icon: "🚨" },
    ],
    "budget-shortfall": [
      { id: "general-fund", label: "General Fund", icon: "💰" },
      { id: "enterprise-fund", label: "Enterprise Fund", icon: "💧" },
      { id: "grant-funded", label: "Grant-funded programs", icon: "📋" },
      { id: "capital-projects", label: "Capital projects", icon: "🏗️" },
    ],
    "infrastructure-failure": [
      { id: "water-system", label: "Water / Sewer system", icon: "💧" },
      { id: "roads-bridges", label: "Roads / Bridges", icon: "🛣️" },
      { id: "buildings", label: "Public buildings", icon: "🏛️" },
      { id: "fleet", label: "Fleet / Equipment", icon: "🚗" },
    ],
    "natural-disaster": [
      { id: "citywide", label: "Citywide / Jurisdiction-wide", icon: "🌐" },
      { id: "specific-area", label: "Specific neighborhood/area", icon: "📍" },
      { id: "critical-facilities", label: "Critical facilities", icon: "🏛️" },
      { id: "evacuation-routes", label: "Evacuation routes", icon: "🛣️" },
    ],
    "public-safety-event": [
      { id: "community", label: "Community / Public area", icon: "👥" },
      { id: "school", label: "School", icon: "🏫" },
      { id: "custody", label: "In custody / Detention", icon: "🏢" },
      { id: "response", label: "Emergency response", icon: "🚒" },
    ],
    default: [
      { id: "jurisdiction-wide", label: "Jurisdiction-wide", icon: "🌐" },
      { id: "specific-department", label: "Specific department", icon: "🏛️" },
      { id: "public-facility", label: "Public facility", icon: "🏢" },
    ],
  },

  impact: [
    { id: "loss-of-life", label: "Loss of life", icon: "☠️", severity: 5, thinkingText: "Assessing fatal outcomes..." },
    { id: "critical-service-loss", label: "Loss of critical services", icon: "🚨", severity: 5, thinkingText: "Assessing critical service impact..." },
    { id: "major-financial", label: "Major financial impact (>$10M)", icon: "💰", severity: 5, thinkingText: "Assessing financial impact..." },
    { id: "significant-service", label: "Significant service disruption", icon: "🚫", severity: 4, thinkingText: "Assessing service disruption..." },
    { id: "legal-liability", label: "Significant legal liability", icon: "⚖️", severity: 4, thinkingText: "Assessing legal exposure..." },
    { id: "public-trust", label: "Loss of public trust", icon: "📰", severity: 4, thinkingText: "Assessing reputational impact..." },
    { id: "regulatory-action", label: "Regulatory action / Sanction", icon: "📋", severity: 4, thinkingText: "Assessing regulatory impact..." },
    { id: "moderate-financial", label: "Moderate financial impact ($1-10M)", icon: "💵", severity: 3, thinkingText: "Assessing financial impact..." },
  ],

  mappings: {
    "cyber-attack|*|critical-service-loss": ["cyber-breach-critical"],
    "cyber-attack|*|major-financial": ["ransomware-attack"],
    "budget-shortfall|*|major-financial": ["fiscal-crisis"],
    "infrastructure-failure|water-system|critical-service-loss": ["water-system-failure"],
    "natural-disaster|*|loss-of-life": ["major-disaster-response"],
    "fraud|*|major-financial": ["major-fraud-event"],
    "public-safety-event|*|loss-of-life": ["critical-public-safety-event"],
    "litigation|*|major-financial": ["major-litigation"],
  },
};
