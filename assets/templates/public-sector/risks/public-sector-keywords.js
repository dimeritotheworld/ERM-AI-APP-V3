/**
 * Public Sector - Keywords & Vocabulary
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.publicSector = ERM_TEMPLATES.publicSector || {};

ERM_TEMPLATES.publicSector.keywords = {
  vocabulary: [
    { term: "budget", variations: ["funding", "appropriation", "fiscal", "deficit"], mapsToCategory: "financial-management", weight: 10 },
    { term: "compliance", variations: ["regulation", "audit", "mandate", "requirement"], mapsToCategory: "compliance", weight: 10 },
    { term: "cyber", variations: ["cybersecurity", "data breach", "hacking", "ransomware"], mapsToCategory: "cyber-risk", weight: 10 },
    { term: "fraud", variations: ["corruption", "theft", "embezzlement", "misconduct"], mapsToCategory: "fraud", weight: 10 },
    { term: "public safety", variations: ["crime", "emergency", "911", "response"], mapsToCategory: "public-safety", weight: 10 },
    { term: "infrastructure", variations: ["roads", "bridges", "water main", "facilities"], mapsToCategory: "infrastructure", weight: 9 },
    { term: "service delivery", variations: ["constituent", "customer service", "wait time"], mapsToCategory: "service-delivery", weight: 9 },
    { term: "grant", variations: ["federal funding", "state funding", "match", "compliance"], mapsToCategory: "grants", weight: 9 },
    { term: "election", variations: ["voting", "ballot", "polling", "election integrity"], mapsToCategory: "elections", weight: 9 },
    { term: "pension", variations: ["retirement", "OPEB", "unfunded liability"], mapsToCategory: "financial-management", weight: 8 },
    { term: "transparency", variations: ["FOIA", "public records", "open meetings"], mapsToCategory: "compliance", weight: 8 },
    { term: "lawsuit", variations: ["litigation", "liability", "claim", "settlement"], mapsToCategory: "legal", weight: 9 },
  ],

  departmentKeywords: {
    police: ["crime", "arrest", "patrol", "investigation", "use of force", "pursuit", "detention"],
    fire: ["fire", "EMS", "rescue", "response time", "apparatus", "hazmat"],
    "emergency-management": ["disaster", "emergency", "EOC", "evacuation", "shelter", "FEMA"],
    "public-works": ["roads", "water", "sewer", "infrastructure", "maintenance", "construction"],
    planning: ["zoning", "permit", "development", "land use", "variance", "code"],
    finance: ["budget", "audit", "revenue", "tax", "bond", "investment", "pension"],
    hr: ["hiring", "grievance", "discipline", "benefits", "union", "workforce"],
    transit: ["bus", "rail", "ridership", "fare", "route", "ADA", "paratransit"],
    "social-services": ["assistance", "welfare", "housing", "homeless", "benefits", "eligibility"],
    health: ["inspection", "disease", "outbreak", "clinic", "public health", "environmental"],
  },

  commonRisks: [
    { id: "cyber-attack", label: "Cyber attack / Data breach", icon: "💻", category: "cyber-risk" },
    { id: "budget-shortfall", label: "Budget shortfall / Revenue decline", icon: "💰", category: "financial-management" },
    { id: "infrastructure-failure", label: "Infrastructure failure", icon: "🏗️", category: "infrastructure" },
    { id: "public-safety-incident", label: "Public safety incident", icon: "🚨", category: "public-safety" },
    { id: "fraud-misconduct", label: "Fraud or employee misconduct", icon: "⚠️", category: "fraud" },
    { id: "natural-disaster", label: "Natural disaster response", icon: "🌪️", category: "emergency-management" },
    { id: "service-disruption", label: "Service delivery disruption", icon: "🚫", category: "service-delivery" },
    { id: "grant-compliance", label: "Grant compliance violation", icon: "📋", category: "grants" },
    { id: "use-of-force", label: "Use of force incident", icon: "👮", category: "public-safety" },
    { id: "pension-liability", label: "Pension/OPEB liability", icon: "📊", category: "financial-management" },
  ],

  phraseMapping: [
    { phrase: "data breach", category: "cyber-risk", risk: "cyber-attack" },
    { phrase: "budget deficit", category: "financial-management", risk: "budget-shortfall" },
    { phrase: "water main break", category: "infrastructure", risk: "infrastructure-failure" },
    { phrase: "officer involved shooting", category: "public-safety", risk: "use-of-force" },
    { phrase: "fraud investigation", category: "fraud", risk: "fraud-misconduct" },
    { phrase: "audit finding", category: "compliance", risk: "compliance-violation" },
    { phrase: "grant clawback", category: "grants", risk: "grant-compliance" },
    { phrase: "service outage", category: "service-delivery", risk: "service-disruption" },
    { phrase: "lawsuit filed", category: "legal", risk: "litigation" },
  ],

  searchVocabulary: function (searchTerm) {
    var results = [];
    var lowerTerm = searchTerm.toLowerCase();
    for (var i = 0; i < this.vocabulary.length; i++) {
      var item = this.vocabulary[i];
      if (item.term.toLowerCase().indexOf(lowerTerm) !== -1) { results.push(item); continue; }
      for (var j = 0; j < item.variations.length; j++) {
        if (item.variations[j].toLowerCase().indexOf(lowerTerm) !== -1) { results.push(item); break; }
      }
    }
    results.sort(function (a, b) { return b.weight - a.weight; });
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
    results.sort(function (a, b) { return b.matchCount - a.matchCount; });
    return results;
  },

  matchPhrase: function (phrase) {
    var lowerPhrase = phrase.toLowerCase();
    for (var i = 0; i < this.phraseMapping.length; i++) {
      if (lowerPhrase.indexOf(this.phraseMapping[i].phrase) !== -1) return this.phraseMapping[i];
    }
    return null;
  }
};
