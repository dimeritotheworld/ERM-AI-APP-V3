/**
 * Energy & Utilities - Keywords & Vocabulary
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.energy = ERM_TEMPLATES.energy || {};

ERM_TEMPLATES.energy.keywords = {
  vocabulary: [
    { term: "outage", variations: ["power outage", "blackout", "interruption", "service disruption"], mapsToCategory: "reliability", weight: 10 },
    { term: "SAIDI", variations: ["reliability", "duration", "interruption index"], mapsToCategory: "reliability", weight: 9 },
    { term: "SAIFI", variations: ["frequency", "interruption frequency"], mapsToCategory: "reliability", weight: 9 },
    { term: "grid", variations: ["transmission", "distribution", "network", "system"], mapsToCategory: "grid-operations", weight: 9 },
    { term: "generation", variations: ["power plant", "generating", "capacity", "megawatt"], mapsToCategory: "generation", weight: 9 },
    { term: "NERC", variations: ["reliability standards", "CIP", "compliance"], mapsToCategory: "regulatory", weight: 10 },
    { term: "cyber", variations: ["cybersecurity", "SCADA", "hacking", "OT security"], mapsToCategory: "cyber-risk", weight: 10 },
    { term: "storm", variations: ["weather", "hurricane", "ice storm", "severe weather"], mapsToCategory: "weather-events", weight: 9 },
    { term: "rate case", variations: ["tariff", "pricing", "PUC", "regulatory"], mapsToCategory: "regulatory", weight: 8 },
    { term: "wildfire", variations: ["fire", "vegetation", "ignition"], mapsToCategory: "wildfire-risk", weight: 10 },
    { term: "gas leak", variations: ["leak", "gas emergency", "pipeline"], mapsToCategory: "gas-safety", weight: 10 },
    { term: "renewable", variations: ["solar", "wind", "clean energy", "distributed"], mapsToCategory: "renewable-integration", weight: 8 },
  ],

  departmentKeywords: {
    generation: ["plant", "generator", "turbine", "boiler", "fuel", "capacity", "dispatch", "emissions"],
    transmission: ["transmission", "substation", "voltage", "interconnection", "NERC", "planning"],
    distribution: ["distribution", "feeder", "transformer", "meter", "AMI", "outage", "restoration"],
    "grid-control": ["control center", "SCADA", "EMS", "dispatch", "operations", "load"],
    "gas-ops": ["gas", "pipeline", "pressure", "leak", "odorization", "emergency"],
    safety: ["safety", "public", "contact", "electrocution", "arc flash", "contractor"],
    environmental: ["environmental", "emissions", "permit", "air", "water", "compliance"],
    customer: ["customer", "billing", "complaint", "service", "satisfaction", "call center"],
  },

  commonRisks: [
    { id: "major-outage", label: "Major service outage", icon: "⚡", category: "reliability" },
    { id: "cyber-attack", label: "Cyber attack on grid systems", icon: "💻", category: "cyber-risk" },
    { id: "wildfire-ignition", label: "Wildfire ignition from equipment", icon: "🔥", category: "wildfire-risk" },
    { id: "storm-damage", label: "Storm damage to infrastructure", icon: "🌪️", category: "weather-events" },
    { id: "generation-failure", label: "Generation unit forced outage", icon: "🏭", category: "generation" },
    { id: "gas-explosion", label: "Gas explosion incident", icon: "💥", category: "gas-safety" },
    { id: "public-contact", label: "Public contact with energized equipment", icon: "⚠️", category: "public-safety" },
    { id: "nerc-violation", label: "NERC compliance violation", icon: "⚖️", category: "regulatory" },
    { id: "rate-case-denial", label: "Rate case denial/reduction", icon: "💰", category: "regulatory" },
    { id: "renewable-integration", label: "Renewable integration challenges", icon: "🌱", category: "renewable-integration" },
  ],

  phraseMapping: [
    { phrase: "power is out", category: "reliability", risk: "major-outage" },
    { phrase: "customers without power", category: "reliability", risk: "major-outage" },
    { phrase: "hacked our systems", category: "cyber-risk", risk: "cyber-attack" },
    { phrase: "fire started by our line", category: "wildfire-risk", risk: "wildfire-ignition" },
    { phrase: "storm coming", category: "weather-events", risk: "storm-damage" },
    { phrase: "plant tripped", category: "generation", risk: "generation-failure" },
    { phrase: "gas leak", category: "gas-safety", risk: "gas-explosion" },
    { phrase: "someone got shocked", category: "public-safety", risk: "public-contact" },
    { phrase: "NERC audit", category: "regulatory", risk: "nerc-violation" },
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
