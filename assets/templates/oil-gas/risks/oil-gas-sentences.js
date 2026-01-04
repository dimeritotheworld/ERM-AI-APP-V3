/**
 * Oil & Gas - Sentence Builder Data
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.oilGas = ERM_TEMPLATES.oilGas || {};

ERM_TEMPLATES.oilGas.sentences = {
  what: [
    { id: "well-blowout", label: "Well blowout / loss of control", icon: "🛢️", keywords: ["blowout", "kick", "well control", "BOP"], thinkingText: "Analyzing well control hazards..." },
    { id: "process-safety", label: "Process safety event", icon: "⚠️", keywords: ["LOPC", "release", "containment", "process"], thinkingText: "Analyzing process safety risks..." },
    { id: "hydrocarbon-release", label: "Hydrocarbon spill/release", icon: "🛢️", keywords: ["spill", "leak", "release", "oil", "gas"], thinkingText: "Analyzing spill hazards..." },
    { id: "fire-explosion", label: "Fire or explosion", icon: "🔥", keywords: ["fire", "explosion", "ignition", "flashfire"], thinkingText: "Analyzing fire hazards..." },
    { id: "toxic-gas", label: "H2S or toxic gas release", icon: "☠️", keywords: ["H2S", "toxic", "gas", "sour"], thinkingText: "Analyzing toxic gas hazards..." },
    { id: "dropped-object", label: "Dropped object", icon: "⬇️", keywords: ["dropped", "falling", "lifting", "crane"], thinkingText: "Analyzing lifting hazards..." },
    { id: "vessel-collision", label: "Vessel collision", icon: "🚢", keywords: ["vessel", "collision", "ship", "marine"], thinkingText: "Analyzing marine hazards..." },
    { id: "helicopter-incident", label: "Helicopter incident", icon: "🚁", keywords: ["helicopter", "aviation", "flight"], thinkingText: "Analyzing aviation hazards..." },
    { id: "pipeline-failure", label: "Pipeline rupture/leak", icon: "🔧", keywords: ["pipeline", "rupture", "leak", "integrity"], thinkingText: "Analyzing pipeline hazards..." },
    { id: "production-loss", label: "Production loss", icon: "📉", keywords: ["production", "output", "downtime", "shutdown"], thinkingText: "Analyzing production risks..." },
    { id: "equipment-failure", label: "Critical equipment failure", icon: "🔧", keywords: ["equipment", "failure", "breakdown", "reliability"], thinkingText: "Analyzing equipment risks..." },
    { id: "structural-failure", label: "Structural failure", icon: "🏗️", keywords: ["structural", "integrity", "collapse", "fatigue"], thinkingText: "Analyzing structural risks..." },
  ],

  where: {
    "well-blowout": [
      { id: "drilling-rig", label: "Drilling rig", icon: "🛢️" },
      { id: "wellhead", label: "Wellhead area", icon: "⚙️" },
      { id: "offshore-platform", label: "Offshore platform", icon: "🏗️" },
      { id: "workover-rig", label: "Workover/completion rig", icon: "🔧" },
    ],
    "process-safety": [
      { id: "process-area", label: "Process area", icon: "🏭" },
      { id: "separator", label: "Separator/vessel", icon: "🛢️" },
      { id: "compressor", label: "Compressor station", icon: "⚙️" },
      { id: "refinery-unit", label: "Refinery unit", icon: "🏭" },
    ],
    "hydrocarbon-release": [
      { id: "tank-farm", label: "Tank farm/storage", icon: "🛢️" },
      { id: "loading-facility", label: "Loading facility", icon: "🚛" },
      { id: "pipeline", label: "Pipeline", icon: "🔧" },
      { id: "process-area", label: "Process area", icon: "🏭" },
      { id: "wellsite", label: "Wellsite", icon: "⛽" },
    ],
    "fire-explosion": [
      { id: "process-area", label: "Process area", icon: "🏭" },
      { id: "tank-farm", label: "Tank farm", icon: "🛢️" },
      { id: "drilling-rig", label: "Drilling rig", icon: "🛢️" },
      { id: "offshore-platform", label: "Offshore platform", icon: "🏗️" },
      { id: "refinery", label: "Refinery", icon: "🏭" },
    ],
    "toxic-gas": [
      { id: "wellsite", label: "Wellsite (sour)", icon: "⛽" },
      { id: "gas-plant", label: "Gas processing plant", icon: "🏭" },
      { id: "confined-space", label: "Confined space", icon: "🕳️" },
    ],
    "dropped-object": [
      { id: "drilling-rig", label: "Drilling rig floor", icon: "🛢️" },
      { id: "derrick", label: "Derrick/mast", icon: "🏗️" },
      { id: "offshore-platform", label: "Offshore platform", icon: "🏗️" },
      { id: "construction-site", label: "Construction site", icon: "🏗️" },
    ],
    "vessel-collision": [
      { id: "offshore-installation", label: "Offshore installation", icon: "🏗️" },
      { id: "loading-terminal", label: "Loading terminal", icon: "🚢" },
      { id: "navigation-channel", label: "Navigation channel", icon: "🌊" },
    ],
    "helicopter-incident": [
      { id: "helideck", label: "Helideck", icon: "🚁" },
      { id: "heliport", label: "Heliport", icon: "🚁" },
      { id: "transit", label: "In transit", icon: "✈️" },
    ],
    "pipeline-failure": [
      { id: "onshore-pipeline", label: "Onshore pipeline", icon: "🔧" },
      { id: "offshore-pipeline", label: "Offshore/subsea pipeline", icon: "🌊" },
      { id: "gathering-system", label: "Gathering system", icon: "🔧" },
      { id: "transmission-line", label: "Transmission pipeline", icon: "🔧" },
    ],
    "production-loss": [
      { id: "production-facility", label: "Production facility", icon: "🏭" },
      { id: "offshore-platform", label: "Offshore platform", icon: "🏗️" },
      { id: "well", label: "Well(s)", icon: "⛽" },
      { id: "processing-plant", label: "Processing plant", icon: "🏭" },
    ],
    default: [
      { id: "facility", label: "Facility/site", icon: "🏭" },
      { id: "offshore", label: "Offshore installation", icon: "🏗️" },
      { id: "onshore", label: "Onshore operation", icon: "⛽" },
    ],
  },

  impact: [
    { id: "fatality", label: "Fatality", icon: "☠️", severity: 5, thinkingText: "Assessing fatal outcomes..." },
    { id: "multiple-fatalities", label: "Multiple fatalities", icon: "☠️", severity: 5, thinkingText: "Assessing catastrophic outcomes..." },
    { id: "permanent-disability", label: "Permanent disability", icon: "🏥", severity: 4, thinkingText: "Assessing major injury outcomes..." },
    { id: "major-spill", label: "Major environmental spill", icon: "🛢️", severity: 5, thinkingText: "Assessing environmental impacts..." },
    { id: "facility-shutdown", label: "Facility shutdown", icon: "🛑", severity: 4, thinkingText: "Assessing operational impacts..." },
    { id: "production-loss", label: "Major production loss", icon: "📉", severity: 4, thinkingText: "Assessing production impacts..." },
    { id: "regulatory-action", label: "Regulatory enforcement", icon: "⚖️", severity: 4, thinkingText: "Assessing regulatory impacts..." },
    { id: "reputation-damage", label: "Significant reputation damage", icon: "📰", severity: 3, thinkingText: "Assessing reputational impacts..." },
    { id: "financial-loss", label: "Major financial loss (>$10M)", icon: "💰", severity: 4, thinkingText: "Assessing financial impacts..." },
  ],

  mappings: {
    "well-blowout|*|fatality": ["well-blowout-fatal"],
    "well-blowout|*|major-spill": ["well-blowout-environmental"],
    "process-safety|*|fatality": ["process-safety-fatal"],
    "process-safety|*|facility-shutdown": ["process-safety-event"],
    "fire-explosion|*|fatality": ["fire-explosion-fatal"],
    "fire-explosion|*|facility-shutdown": ["fire-explosion-event"],
    "hydrocarbon-release|*|major-spill": ["major-spill"],
    "pipeline-failure|*|major-spill": ["pipeline-rupture"],
    "vessel-collision|*|fatality": ["marine-incident-fatal"],
    "helicopter-incident|*|fatality": ["aviation-incident-fatal"],
  },
};
