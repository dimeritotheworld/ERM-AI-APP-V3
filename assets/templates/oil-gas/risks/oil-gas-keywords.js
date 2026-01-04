/**
 * Oil & Gas - Keywords & Vocabulary
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.oilGas = ERM_TEMPLATES.oilGas || {};

ERM_TEMPLATES.oilGas.keywords = {
  vocabulary: [
    { term: "blowout", variations: ["well control", "kick", "loss of well control"], mapsToCategory: "well-control", weight: 10 },
    { term: "process safety", variations: ["PSM", "LOPC", "loss of containment"], mapsToCategory: "process-safety", weight: 10 },
    { term: "hydrocarbon release", variations: ["spill", "leak", "release", "loss of primary containment"], mapsToCategory: "environmental", weight: 10 },
    { term: "H2S", variations: ["hydrogen sulfide", "sour gas", "toxic gas"], mapsToCategory: "hazardous-materials", weight: 10 },
    { term: "dropped object", variations: ["falling object", "dropped load"], mapsToCategory: "lifting-operations", weight: 9 },
    { term: "confined space", variations: ["permit space", "vessel entry"], mapsToCategory: "permit-to-work", weight: 10 },
    { term: "pipeline", variations: ["flowline", "pipeline integrity", "pigging"], mapsToCategory: "pipeline-integrity", weight: 9 },
    { term: "turnaround", variations: ["shutdown", "TAR", "outage"], mapsToCategory: "turnaround-management", weight: 8 },
    { term: "reserves", variations: ["resources", "P1", "P2", "proved", "probable"], mapsToCategory: "reserves-management", weight: 8 },
    { term: "production", variations: ["output", "barrels", "mcf", "boe"], mapsToCategory: "production-performance", weight: 8 },
    { term: "drilling", variations: ["well", "rig", "drill"], mapsToCategory: "drilling-operations", weight: 9 },
    { term: "offshore", variations: ["platform", "FPSO", "rig", "subsea"], mapsToCategory: "offshore-operations", weight: 9 },
    { term: "refinery", variations: ["processing", "refining", "downstream"], mapsToCategory: "refinery-operations", weight: 8 },
    { term: "fire", variations: ["explosion", "ignition", "flashfire"], mapsToCategory: "fire-explosion", weight: 10 },
    { term: "vessel collision", variations: ["marine incident", "ship collision"], mapsToCategory: "marine-operations", weight: 9 },
    { term: "helicopter", variations: ["aviation", "chopper", "helideck"], mapsToCategory: "aviation", weight: 9 },
  ],

  departmentKeywords: {
    drilling: ["drill", "rig", "wellbore", "casing", "mud", "BOP", "directional", "well control"],
    production: ["production", "reservoir", "well", "artificial lift", "ESP", "gas lift", "injection"],
    hse: ["safety", "environment", "incident", "hazard", "permit", "PPE", "emergency", "spill"],
    operations: ["operations", "facility", "platform", "plant", "process", "shutdown"],
    pipeline: ["pipeline", "integrity", "pig", "corrosion", "leak detection", "SCADA"],
    projects: ["project", "construction", "FEED", "EPC", "commissioning", "hookup"],
    subsea: ["subsea", "ROV", "diving", "umbilical", "manifold", "tree"],
    marine: ["vessel", "marine", "cargo", "tanker", "supply boat", "anchor handling"],
    maintenance: ["maintenance", "turnaround", "inspection", "reliability", "PM"],
    geoscience: ["seismic", "geology", "exploration", "prospect", "resource"],
  },

  commonRisks: [
    { id: "well-blowout", label: "Well blowout / loss of well control", icon: "⚠️", category: "well-control" },
    { id: "process-safety-event", label: "Process safety event / LOPC", icon: "⚠️", category: "process-safety" },
    { id: "major-spill", label: "Major hydrocarbon spill", icon: "🛢️", category: "environmental" },
    { id: "fire-explosion", label: "Fire or explosion", icon: "🔥", category: "fire-explosion" },
    { id: "h2s-release", label: "H2S or toxic gas release", icon: "☠️", category: "hazardous-materials" },
    { id: "dropped-object", label: "Dropped object fatality", icon: "⚠️", category: "lifting-operations" },
    { id: "confined-space", label: "Confined space incident", icon: "⚠️", category: "permit-to-work" },
    { id: "vessel-collision", label: "Vessel collision", icon: "🚢", category: "marine-operations" },
    { id: "helicopter-incident", label: "Helicopter incident", icon: "🚁", category: "aviation" },
    { id: "pipeline-rupture", label: "Pipeline rupture", icon: "🔧", category: "pipeline-integrity" },
    { id: "production-loss", label: "Unplanned production loss", icon: "📉", category: "production-performance" },
    { id: "reserve-downgrade", label: "Reserves downgrade", icon: "📊", category: "reserves-management" },
    { id: "project-overrun", label: "Project cost/schedule overrun", icon: "💰", category: "project-delivery" },
    { id: "regulatory-action", label: "Regulatory enforcement action", icon: "⚖️", category: "regulatory-compliance" },
  ],

  phraseMapping: [
    { phrase: "lost well control", category: "well-control", risk: "well-blowout" },
    { phrase: "kick on the well", category: "well-control", risk: "well-blowout" },
    { phrase: "oil spill", category: "environmental", risk: "major-spill" },
    { phrase: "gas leak", category: "process-safety", risk: "process-safety-event" },
    { phrase: "fire on platform", category: "fire-explosion", risk: "fire-explosion" },
    { phrase: "someone fell", category: "working-at-heights", risk: null },
    { phrase: "production is down", category: "production-performance", risk: "production-loss" },
    { phrase: "pipeline leak", category: "pipeline-integrity", risk: "pipeline-rupture" },
    { phrase: "project over budget", category: "project-delivery", risk: "project-overrun" },
    { phrase: "regulator is investigating", category: "regulatory-compliance", risk: "regulatory-action" },
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
