/**
 * Mining & Resources - Sentence Builder Data
 * Dimeri ERM Template Library
 *
 * PURE DATA FILE - No logic here
 * Logic is in: _shared/sentence-builder.js
 *
 * This file defines:
 * - what: Hazards/risk types specific to mining
 * - where: Locations (contextual based on hazard)
 * - impact: Consequences
 * - mappings: Connect sentences to risk template IDs
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.mining = ERM_TEMPLATES.mining || {};

ERM_TEMPLATES.mining.sentences = {
  /* ========================================
     WHAT - What could go wrong?
     Mining-specific hazards and risk types
     ======================================== */
  what: [
    {
      id: "vehicle-collision",
      label: "Vehicle collision",
      icon: "🚛",
      keywords: [
        "truck",
        "LV",
        "HME",
        "haul",
        "vehicle",
        "collision",
        "traffic",
      ],
      thinkingText: "Analyzing vehicle interaction hazards...",
    },
    {
      id: "ground-fall",
      label: "Ground or roof fall",
      icon: "⛰️",
      keywords: [
        "rock",
        "fall",
        "ground",
        "roof",
        "stope",
        "collapse",
        "geotechnical",
      ],
      thinkingText: "Analyzing geotechnical hazards...",
    },
    {
      id: "confined-space",
      label: "Confined space incident",
      icon: "🕳️",
      keywords: ["confined", "space", "tank", "vessel", "atmosphere", "oxygen"],
      thinkingText: "Analyzing atmospheric hazards...",
    },
    {
      id: "fall-from-height",
      label: "Fall from height",
      icon: "🪜",
      keywords: ["fall", "height", "scaffold", "ladder", "platform", "edge"],
      thinkingText: "Analyzing working at heights hazards...",
    },
    {
      id: "explosives-blast",
      label: "Explosives or blasting incident",
      icon: "💥",
      keywords: ["explosive", "blast", "detonation", "flyrock", "misfire"],
      thinkingText: "Analyzing blasting hazards...",
    },
    {
      id: "entanglement",
      label: "Entanglement in machinery",
      icon: "⚙️",
      keywords: [
        "entanglement",
        "machinery",
        "conveyor",
        "rotating",
        "guarding",
      ],
      thinkingText: "Analyzing machinery hazards...",
    },
    {
      id: "drowning",
      label: "Drowning or inundation",
      icon: "💧",
      keywords: ["drowning", "water", "inrush", "dam", "pit lake", "flood"],
      thinkingText: "Analyzing water hazards...",
    },
    {
      id: "electrical",
      label: "Electrical contact",
      icon: "⚡",
      keywords: ["electrical", "electrocution", "arc flash", "high voltage"],
      thinkingText: "Analyzing electrical hazards...",
    },
    {
      id: "fire-explosion",
      label: "Fire or explosion",
      icon: "🔥",
      keywords: ["fire", "explosion", "combustion", "hot work", "flammable"],
      thinkingText: "Analyzing fire hazards...",
    },
    {
      id: "lifting-dropped",
      label: "Dropped load from lifting",
      icon: "🏗️",
      keywords: ["lifting", "crane", "rigging", "dropped", "suspended"],
      thinkingText: "Analyzing lifting hazards...",
    },
    {
      id: "production-shortfall",
      label: "Production shortfall",
      icon: "📉",
      keywords: ["production", "throughput", "target", "output", "shortage"],
      thinkingText: "Analyzing production risks...",
    },
    {
      id: "equipment-failure",
      label: "Equipment breakdown",
      icon: "🔧",
      keywords: [
        "equipment",
        "breakdown",
        "failure",
        "availability",
        "reliability",
      ],
      thinkingText: "Analyzing equipment risks...",
    },
    {
      id: "grade-variability",
      label: "Ore grade variability",
      icon: "📊",
      keywords: ["grade", "ore", "dilution", "quality", "variability"],
      thinkingText: "Analyzing grade control risks...",
    },
    {
      id: "environmental-incident",
      label: "Environmental incident",
      icon: "🌍",
      keywords: [
        "environmental",
        "spill",
        "contamination",
        "pollution",
        "emission",
      ],
      thinkingText: "Analyzing environmental risks...",
    },
    {
      id: "tailings-failure",
      label: "Tailings facility failure",
      icon: "🏔️",
      keywords: ["tailings", "TSF", "dam", "failure", "breach"],
      thinkingText: "Analyzing tailings risks...",
    },
    {
      id: "community-opposition",
      label: "Community opposition",
      icon: "👥",
      keywords: ["community", "social", "license", "protest", "stakeholder"],
      thinkingText: "Analyzing social risks...",
    },
  ],

  /* ========================================
     WHERE - Where could this happen?
     Contextual based on WHAT selection
     Key = what.id, Value = array of locations
     ======================================== */
  where: {
    "vehicle-collision": [
      { id: "haul-roads", label: "Haul roads", icon: "🛣️" },
      { id: "pit-area", label: "Pit / open cut area", icon: "⛏️" },
      { id: "processing-area", label: "Processing plant area", icon: "🏭" },
      { id: "workshop", label: "Workshop / maintenance area", icon: "🔧" },
      { id: "stockpile", label: "Stockpile / ROM area", icon: "📦" },
      { id: "site-entry", label: "Site entry / gatehouse", icon: "🚧" },
    ],
    "ground-fall": [
      { id: "underground-dev", label: "Underground development", icon: "⛏️" },
      { id: "stopes", label: "Stopes / production areas", icon: "🕳️" },
      { id: "decline", label: "Decline / ramp", icon: "📐" },
      { id: "pit-walls", label: "Pit walls / highwall", icon: "🏔️" },
      { id: "stockpile", label: "Stockpile faces", icon: "📦" },
    ],
    "confined-space": [
      { id: "tanks-vessels", label: "Tanks and vessels", icon: "🛢️" },
      { id: "hoppers-bins", label: "Hoppers and bins", icon: "📦" },
      { id: "pipelines", label: "Pipelines and ducts", icon: "🔧" },
      { id: "underground-voids", label: "Underground voids", icon: "🕳️" },
      { id: "sumps-pits", label: "Sumps and pits", icon: "💧" },
    ],
    "fall-from-height": [
      {
        id: "processing-plant",
        label: "Processing plant structures",
        icon: "🏭",
      },
      { id: "conveyors", label: "Conveyor gantries", icon: "⚙️" },
      { id: "tanks-structures", label: "Tanks and structures", icon: "🛢️" },
      { id: "mobile-equipment", label: "Mobile equipment access", icon: "🚛" },
      { id: "construction", label: "Construction areas", icon: "🏗️" },
    ],
    "explosives-blast": [
      { id: "pit-face", label: "Pit face / bench", icon: "⛏️" },
      {
        id: "underground-face",
        label: "Underground development face",
        icon: "🕳️",
      },
      { id: "magazine", label: "Magazine / storage area", icon: "📦" },
      { id: "charging-area", label: "Charging / loading area", icon: "💥" },
    ],
    entanglement: [
      { id: "processing-plant", label: "Processing plant", icon: "🏭" },
      { id: "conveyors", label: "Conveyor systems", icon: "⚙️" },
      { id: "workshop", label: "Workshop equipment", icon: "🔧" },
      { id: "crushing", label: "Crushing circuit", icon: "🪨" },
      { id: "screening", label: "Screening area", icon: "📊" },
    ],
    drowning: [
      { id: "pit-lake", label: "Pit lake / void", icon: "💧" },
      { id: "tailings-dam", label: "Tailings storage facility", icon: "🏔️" },
      { id: "process-ponds", label: "Process water ponds", icon: "🌊" },
      { id: "underground", label: "Underground workings", icon: "⛏️" },
      { id: "sediment-dams", label: "Sediment / stormwater dams", icon: "🌧️" },
    ],
    electrical: [
      { id: "substations", label: "Substations / switchrooms", icon: "⚡" },
      { id: "processing-plant", label: "Processing plant", icon: "🏭" },
      { id: "underground", label: "Underground distribution", icon: "⛏️" },
      { id: "mobile-equipment", label: "Mobile equipment", icon: "🚛" },
      { id: "surface-reticulation", label: "Surface power lines", icon: "🔌" },
    ],
    "fire-explosion": [
      { id: "underground", label: "Underground workings", icon: "⛏️" },
      { id: "fuel-storage", label: "Fuel storage / refueling", icon: "⛽" },
      { id: "processing-plant", label: "Processing plant", icon: "🏭" },
      { id: "workshop", label: "Workshop / hot work areas", icon: "🔧" },
      { id: "mobile-equipment", label: "Mobile equipment", icon: "🚛" },
    ],
    "lifting-dropped": [
      { id: "workshop", label: "Workshop area", icon: "🔧" },
      { id: "processing-plant", label: "Processing plant", icon: "🏭" },
      { id: "construction", label: "Construction sites", icon: "🏗️" },
      { id: "shutdown", label: "Shutdown / maintenance", icon: "⚙️" },
      { id: "laydown", label: "Laydown areas", icon: "📦" },
    ],
    "production-shortfall": [
      { id: "mining-operations", label: "Mining operations", icon: "⛏️" },
      { id: "processing-plant", label: "Processing plant", icon: "🏭" },
      { id: "materials-handling", label: "Materials handling", icon: "🚛" },
      { id: "grade-control", label: "Grade control", icon: "📊" },
    ],
    "equipment-failure": [
      { id: "mobile-fleet", label: "Mobile equipment fleet", icon: "🚛" },
      { id: "processing-plant", label: "Processing plant", icon: "🏭" },
      { id: "fixed-infrastructure", label: "Fixed infrastructure", icon: "🏗️" },
      {
        id: "underground-equipment",
        label: "Underground equipment",
        icon: "⛏️",
      },
    ],
    "grade-variability": [
      { id: "ore-body", label: "Ore body / deposit", icon: "💎" },
      { id: "mining-faces", label: "Mining faces", icon: "⛏️" },
      { id: "stockpiles", label: "Stockpiles", icon: "📦" },
      { id: "plant-feed", label: "Plant feed", icon: "🏭" },
    ],
    "environmental-incident": [
      { id: "processing-plant", label: "Processing plant", icon: "🏭" },
      { id: "tailings", label: "Tailings area", icon: "🏔️" },
      { id: "fuel-storage", label: "Fuel / chemical storage", icon: "⛽" },
      { id: "water-systems", label: "Water management systems", icon: "💧" },
      { id: "waste-areas", label: "Waste disposal areas", icon: "🗑️" },
    ],
    "tailings-failure": [
      { id: "tsf-embankment", label: "TSF embankment", icon: "🏔️" },
      { id: "spillway", label: "Spillway / decant", icon: "💧" },
      { id: "pipeline", label: "Tailings pipeline", icon: "🔧" },
      { id: "return-water", label: "Return water dam", icon: "🌊" },
    ],
    "community-opposition": [
      { id: "local-communities", label: "Local communities", icon: "🏘️" },
      {
        id: "indigenous-groups",
        label: "Indigenous / traditional owners",
        icon: "👥",
      },
      { id: "environmental-groups", label: "Environmental groups", icon: "🌿" },
      { id: "government", label: "Government / regulators", icon: "🏛️" },
    ],

    // Default locations for any unmapped hazard
    default: [
      { id: "site-wide", label: "Site-wide", icon: "🏭" },
      { id: "processing", label: "Processing area", icon: "⚙️" },
      { id: "mining-area", label: "Mining area", icon: "⛏️" },
      { id: "infrastructure", label: "Infrastructure", icon: "🏗️" },
    ],
  },

  /* ========================================
     IMPACT - What's the consequence?
     Severity levels for risk scoring
     ======================================== */
  impact: [
    {
      id: "fatality",
      label: "Fatality",
      icon: "☠️",
      severity: 5,
      thinkingText: "Assessing catastrophic outcomes...",
    },
    {
      id: "serious-injury",
      label: "Serious injury",
      icon: "🏥",
      severity: 4,
      thinkingText: "Assessing major injury outcomes...",
    },
    {
      id: "medical-injury",
      label: "Medical treatment injury",
      icon: "🩹",
      severity: 3,
      thinkingText: "Assessing moderate injury outcomes...",
    },
    {
      id: "major-production-loss",
      label: "Major production loss (>7 days)",
      icon: "📉",
      severity: 4,
      thinkingText: "Assessing production impacts...",
    },
    {
      id: "moderate-production-loss",
      label: "Moderate production loss (1-7 days)",
      icon: "📊",
      severity: 3,
      thinkingText: "Assessing production impacts...",
    },
    {
      id: "environmental-damage",
      label: "Significant environmental damage",
      icon: "🌍",
      severity: 4,
      thinkingText: "Assessing environmental impacts...",
    },
    {
      id: "regulatory-action",
      label: "Regulatory action / prosecution",
      icon: "⚖️",
      severity: 4,
      thinkingText: "Assessing regulatory impacts...",
    },
    {
      id: "reputation-damage",
      label: "Reputation damage",
      icon: "📰",
      severity: 3,
      thinkingText: "Assessing reputational impacts...",
    },
    {
      id: "financial-loss",
      label: "Significant financial loss (>$1M)",
      icon: "💰",
      severity: 4,
      thinkingText: "Assessing financial impacts...",
    },
    {
      id: "license-loss",
      label: "Loss of license to operate",
      icon: "🚫",
      severity: 5,
      thinkingText: "Assessing catastrophic outcomes...",
    },
  ],

  /* ========================================
     MAPPINGS - Connect sentences to templates
     Format: "what|where|impact" → [risk-ids]
     Use "*" as wildcard for any value
     ======================================== */
  mappings: {
    // Vehicle collision → Any severity injury
    "vehicle-collision|*|fatality": ["vehicle-interaction-fatal"],
    "vehicle-collision|*|serious-injury": ["vehicle-interaction-fatal"],

    // Ground fall
    "ground-fall|*|fatality": ["ground-fall-fatal"],
    "ground-fall|*|serious-injury": ["ground-fall-fatal"],

    // Confined space
    "confined-space|*|fatality": ["confined-space-fatal"],
    "confined-space|*|serious-injury": ["confined-space-fatal"],

    // Fall from height
    "fall-from-height|*|fatality": ["working-heights-fatal"],
    "fall-from-height|*|serious-injury": ["working-heights-fatal"],

    // Explosives
    "explosives-blast|*|fatality": ["explosives-blasting-fatal"],
    "explosives-blast|*|serious-injury": ["explosives-blasting-fatal"],

    // Entanglement
    "entanglement|*|fatality": ["entanglement-fatal"],
    "entanglement|*|serious-injury": ["entanglement-fatal"],

    // Drowning
    "drowning|*|fatality": ["drowning-fatal"],
    "drowning|*|serious-injury": ["drowning-fatal"],

    // Electrical
    "electrical|*|fatality": ["electrical-fatal"],
    "electrical|*|serious-injury": ["electrical-fatal"],

    // Fire/explosion
    "fire-explosion|*|fatality": ["fire-explosion-fatal"],
    "fire-explosion|*|serious-injury": ["fire-explosion-fatal"],

    // Lifting
    "lifting-dropped|*|fatality": ["lifting-fatal"],
    "lifting-dropped|*|serious-injury": ["lifting-fatal"],

    // Production risks
    "production-shortfall|*|major-production-loss": ["ore-feed-shortage"],
    "production-shortfall|*|moderate-production-loss": ["ore-feed-shortage"],
    "production-shortfall|*|financial-loss": ["ore-feed-shortage"],

    // Equipment failure
    "equipment-failure|*|major-production-loss": ["equipment-breakdown"],
    "equipment-failure|*|moderate-production-loss": ["equipment-breakdown"],
    "equipment-failure|*|financial-loss": ["equipment-breakdown"],

    // Grade variability
    "grade-variability|*|major-production-loss": ["ore-grade-variability"],
    "grade-variability|*|financial-loss": ["ore-grade-variability"],

    // Environmental - map when we have environmental risk templates
    // "environmental-incident|*|environmental-damage": ["environmental-spill"],

    // Tailings - map when we have tailings risk templates
    // "tailings-failure|*|*": ["tsf-failure"],

    // Community - map when we have community risk templates
    // "community-opposition|*|*": ["social-license-loss"]
  },
};
