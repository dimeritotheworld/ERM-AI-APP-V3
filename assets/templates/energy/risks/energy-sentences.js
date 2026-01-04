/**
 * Energy & Utilities - Sentence Builder Data
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.energy = ERM_TEMPLATES.energy || {};

ERM_TEMPLATES.energy.sentences = {
  what: [
    { id: "power-outage", label: "Power outage / service interruption", icon: "⚡", keywords: ["outage", "blackout", "interruption", "power"], thinkingText: "Analyzing reliability risks..." },
    { id: "equipment-failure", label: "Equipment failure", icon: "🔧", keywords: ["failure", "breakdown", "equipment", "transformer"], thinkingText: "Analyzing equipment risks..." },
    { id: "cyber-attack", label: "Cyber attack", icon: "💻", keywords: ["cyber", "attack", "hacking", "SCADA"], thinkingText: "Analyzing cyber risks..." },
    { id: "wildfire", label: "Wildfire ignition", icon: "🔥", keywords: ["fire", "wildfire", "ignition", "vegetation"], thinkingText: "Analyzing wildfire risks..." },
    { id: "storm-damage", label: "Storm/weather damage", icon: "🌪️", keywords: ["storm", "weather", "hurricane", "ice"], thinkingText: "Analyzing weather risks..." },
    { id: "generation-outage", label: "Generation unit outage", icon: "🏭", keywords: ["generation", "plant", "unit", "trip"], thinkingText: "Analyzing generation risks..." },
    { id: "gas-incident", label: "Gas leak/explosion", icon: "💥", keywords: ["gas", "leak", "explosion", "pipeline"], thinkingText: "Analyzing gas risks..." },
    { id: "public-safety", label: "Public contact incident", icon: "⚠️", keywords: ["public", "contact", "electrocution", "downed wire"], thinkingText: "Analyzing public safety risks..." },
    { id: "regulatory-violation", label: "Regulatory violation", icon: "⚖️", keywords: ["NERC", "violation", "compliance", "regulatory"], thinkingText: "Analyzing regulatory risks..." },
    { id: "worker-injury", label: "Worker injury", icon: "🏥", keywords: ["injury", "worker", "employee", "contractor"], thinkingText: "Analyzing worker safety risks..." },
  ],

  where: {
    "power-outage": [
      { id: "transmission", label: "Transmission system", icon: "⚡" },
      { id: "distribution", label: "Distribution system", icon: "🔌" },
      { id: "substation", label: "Substation", icon: "🏭" },
      { id: "generation", label: "Generation facility", icon: "🏭" },
    ],
    "equipment-failure": [
      { id: "substation", label: "Substation", icon: "🏭" },
      { id: "power-plant", label: "Power plant", icon: "🏭" },
      { id: "transmission-line", label: "Transmission line", icon: "⚡" },
      { id: "distribution-line", label: "Distribution line", icon: "🔌" },
    ],
    "cyber-attack": [
      { id: "control-center", label: "Control center", icon: "💻" },
      { id: "scada", label: "SCADA systems", icon: "💻" },
      { id: "substations", label: "Substation automation", icon: "🏭" },
      { id: "corporate-it", label: "Corporate IT", icon: "💻" },
    ],
    "wildfire": [
      { id: "distribution-lines", label: "Distribution lines", icon: "🔌" },
      { id: "transmission-lines", label: "Transmission lines", icon: "⚡" },
      { id: "substations", label: "Substations", icon: "🏭" },
      { id: "vegetation", label: "ROW vegetation", icon: "🌲" },
    ],
    "storm-damage": [
      { id: "overhead-lines", label: "Overhead lines", icon: "⚡" },
      { id: "substations", label: "Substations", icon: "🏭" },
      { id: "generation", label: "Generation facilities", icon: "🏭" },
      { id: "service-territory", label: "Service territory", icon: "🗺️" },
    ],
    "gas-incident": [
      { id: "distribution-main", label: "Distribution main", icon: "🔧" },
      { id: "service-line", label: "Service line", icon: "🔧" },
      { id: "meter", label: "Meter/regulator", icon: "⚙️" },
      { id: "transmission-pipe", label: "Transmission pipeline", icon: "🔧" },
    ],
    default: [
      { id: "system-wide", label: "System-wide", icon: "🌐" },
      { id: "local-area", label: "Local area", icon: "📍" },
      { id: "facility", label: "Facility", icon: "🏭" },
    ],
  },

  impact: [
    { id: "fatality", label: "Fatality", icon: "☠️", severity: 5, thinkingText: "Assessing fatal outcomes..." },
    { id: "major-outage", label: "Major outage (>100K customers)", icon: "⚡", severity: 5, thinkingText: "Assessing major outage..." },
    { id: "extended-outage", label: "Extended outage (>24 hours)", icon: "⚡", severity: 4, thinkingText: "Assessing extended outage..." },
    { id: "significant-outage", label: "Significant outage (>10K customers)", icon: "⚡", severity: 3, thinkingText: "Assessing outage impacts..." },
    { id: "environmental-damage", label: "Environmental damage", icon: "🌍", severity: 4, thinkingText: "Assessing environmental impacts..." },
    { id: "regulatory-penalty", label: "Regulatory penalty/action", icon: "⚖️", severity: 4, thinkingText: "Assessing regulatory impacts..." },
    { id: "major-financial", label: "Major financial impact (>$10M)", icon: "💰", severity: 4, thinkingText: "Assessing financial impacts..." },
    { id: "reputation-damage", label: "Significant reputation damage", icon: "📰", severity: 3, thinkingText: "Assessing reputational impacts..." },
  ],

  mappings: {
    "power-outage|*|major-outage": ["major-service-outage"],
    "cyber-attack|*|major-outage": ["cyber-grid-attack"],
    "wildfire|*|fatality": ["wildfire-ignition-fatal"],
    "wildfire|*|environmental-damage": ["wildfire-ignition"],
    "storm-damage|*|major-outage": ["storm-damage-outage"],
    "gas-incident|*|fatality": ["gas-explosion-fatal"],
    "public-safety|*|fatality": ["public-contact-fatal"],
    "regulatory-violation|*|regulatory-penalty": ["nerc-violation"],
  },
};
