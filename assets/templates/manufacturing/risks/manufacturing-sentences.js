/**
 * Manufacturing - Sentence Builder Data
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.manufacturing = ERM_TEMPLATES.manufacturing || {};

ERM_TEMPLATES.manufacturing.sentences = {
  what: [
    { id: "production-stoppage", label: "Production stoppage / Line down", icon: "🏭", keywords: ["downtime", "stoppage", "shutdown", "line down"], thinkingText: "Analyzing operational risks..." },
    { id: "equipment-failure", label: "Equipment failure", icon: "🔧", keywords: ["breakdown", "failure", "machine", "equipment"], thinkingText: "Analyzing equipment risks..." },
    { id: "quality-escape", label: "Quality escape / Defect", icon: "⚠️", keywords: ["quality", "defect", "escape", "reject"], thinkingText: "Analyzing quality risks..." },
    { id: "worker-injury", label: "Worker injury", icon: "🏥", keywords: ["injury", "accident", "safety", "incident"], thinkingText: "Analyzing safety risks..." },
    { id: "supply-disruption", label: "Supply chain disruption", icon: "📦", keywords: ["supply", "shortage", "supplier", "delivery"], thinkingText: "Analyzing supply chain risks..." },
    { id: "product-recall", label: "Product recall", icon: "🔄", keywords: ["recall", "field action", "safety", "defect"], thinkingText: "Analyzing product risks..." },
    { id: "environmental-release", label: "Environmental release", icon: "🌍", keywords: ["spill", "emission", "release", "environmental"], thinkingText: "Analyzing environmental risks..." },
    { id: "fire-explosion", label: "Fire / Explosion", icon: "🔥", keywords: ["fire", "explosion", "combustion"], thinkingText: "Analyzing fire risks..." },
    { id: "cyber-attack", label: "Cyber attack on OT systems", icon: "💻", keywords: ["cyber", "attack", "ransomware", "OT"], thinkingText: "Analyzing cyber risks..." },
    { id: "labor-disruption", label: "Labor disruption / Strike", icon: "👥", keywords: ["strike", "labor", "union", "walkout"], thinkingText: "Analyzing workforce risks..." },
  ],

  where: {
    "production-stoppage": [
      { id: "assembly-line", label: "Assembly line", icon: "🏭" },
      { id: "fabrication", label: "Fabrication area", icon: "⚙️" },
      { id: "paint-finish", label: "Paint / Finishing", icon: "🎨" },
      { id: "packaging", label: "Packaging", icon: "📦" },
    ],
    "equipment-failure": [
      { id: "production-equipment", label: "Production equipment", icon: "🏭" },
      { id: "utilities", label: "Utilities (power, air, water)", icon: "⚡" },
      { id: "material-handling", label: "Material handling", icon: "🏗️" },
      { id: "automation", label: "Automation / Robotics", icon: "🤖" },
    ],
    "quality-escape": [
      { id: "incoming", label: "Incoming materials", icon: "📥" },
      { id: "in-process", label: "In-process", icon: "🏭" },
      { id: "final-inspection", label: "Final inspection", icon: "✅" },
      { id: "customer", label: "At customer", icon: "👤" },
    ],
    "worker-injury": [
      { id: "production-floor", label: "Production floor", icon: "🏭" },
      { id: "warehouse", label: "Warehouse", icon: "📦" },
      { id: "maintenance", label: "Maintenance activity", icon: "🔧" },
      { id: "loading-dock", label: "Loading dock", icon: "🚛" },
    ],
    "supply-disruption": [
      { id: "raw-materials", label: "Raw materials", icon: "📦" },
      { id: "components", label: "Components", icon: "⚙️" },
      { id: "packaging-materials", label: "Packaging materials", icon: "📦" },
      { id: "logistics", label: "Logistics / Transportation", icon: "🚛" },
    ],
    "environmental-release": [
      { id: "wastewater", label: "Wastewater treatment", icon: "💧" },
      { id: "air-emissions", label: "Air emissions", icon: "💨" },
      { id: "chemical-storage", label: "Chemical storage", icon: "🧪" },
      { id: "waste-handling", label: "Waste handling", icon: "🗑️" },
    ],
    default: [
      { id: "plant-wide", label: "Plant-wide", icon: "🏭" },
      { id: "specific-area", label: "Specific production area", icon: "📍" },
      { id: "warehouse", label: "Warehouse / Logistics", icon: "📦" },
    ],
  },

  impact: [
    { id: "fatality", label: "Fatality", icon: "☠️", severity: 5, thinkingText: "Assessing fatal outcomes..." },
    { id: "plant-shutdown", label: "Plant shutdown", icon: "🏭", severity: 5, thinkingText: "Assessing plant shutdown..." },
    { id: "major-recall", label: "Major product recall", icon: "🔄", severity: 5, thinkingText: "Assessing recall impact..." },
    { id: "line-shutdown", label: "Production line shutdown (>24 hours)", icon: "⚙️", severity: 4, thinkingText: "Assessing line shutdown..." },
    { id: "significant-quality", label: "Significant quality event", icon: "⚠️", severity: 4, thinkingText: "Assessing quality impact..." },
    { id: "regulatory-action", label: "Regulatory action / Shutdown", icon: "📋", severity: 4, thinkingText: "Assessing regulatory impact..." },
    { id: "major-customer", label: "Major customer impact / Loss", icon: "👤", severity: 4, thinkingText: "Assessing customer impact..." },
    { id: "significant-financial", label: "Significant financial impact (>$1M)", icon: "💰", severity: 3, thinkingText: "Assessing financial impact..." },
  ],

  mappings: {
    "production-stoppage|*|plant-shutdown": ["major-production-failure"],
    "equipment-failure|*|line-shutdown": ["critical-equipment-failure"],
    "quality-escape|customer|major-recall": ["product-recall-event"],
    "worker-injury|*|fatality": ["workplace-fatality"],
    "supply-disruption|*|plant-shutdown": ["supply-chain-crisis"],
    "environmental-release|*|regulatory-action": ["major-environmental-event"],
    "fire-explosion|*|plant-shutdown": ["major-fire-incident"],
    "cyber-attack|*|plant-shutdown": ["manufacturing-cyber-attack"],
  },
};
