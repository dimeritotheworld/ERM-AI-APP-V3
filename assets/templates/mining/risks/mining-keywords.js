/**
 * Mining & Resources - Keywords & Sentence Builder
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.mining = ERM_TEMPLATES.mining || {};

ERM_TEMPLATES.mining.keywords = {
  /**
   * Industry vocabulary for search matching
   * term: The primary search term
   * variations: Alternative spellings or synonyms
   * mapsToCategory: The risk category this term indicates
   * weight: Search relevance weight (1-10, higher = more relevant)
   */
  vocabulary: [
    // Vehicle and Mobile Equipment
    {
      term: "haul truck",
      variations: [
        "haul",
        "dumper",
        "dump truck",
        "rear dump",
        "off-highway truck",
      ],
      mapsToCategory: "fatal-risk-management",
      weight: 10,
    },
    {
      term: "LHD",
      variations: ["loader", "load haul dump", "scoop", "bogger", "scoop tram"],
      mapsToCategory: "equipment-availability",
      weight: 10,
    },
    {
      term: "excavator",
      variations: ["digger", "shovel", "backhoe", "face shovel"],
      mapsToCategory: "equipment-availability",
      weight: 8,
    },
    {
      term: "drill rig",
      variations: ["drill", "jumbo", "production drill", "blast hole drill"],
      mapsToCategory: "drill-blast",
      weight: 9,
    },
    {
      term: "light vehicle",
      variations: ["LV", "pickup", "utility", "ute", "4WD", "4x4"],
      mapsToCategory: "fatal-risk-management",
      weight: 10,
    },
    {
      term: "grader",
      variations: ["road grader", "motor grader"],
      mapsToCategory: "site-infrastructure",
      weight: 6,
    },
    {
      term: "dozer",
      variations: ["bulldozer", "track dozer", "D11", "crawler"],
      mapsToCategory: "equipment-availability",
      weight: 7,
    },
    {
      term: "water cart",
      variations: ["water truck", "dust suppression"],
      mapsToCategory: "dust-management",
      weight: 6,
    },

    // Ground Control
    {
      term: "rockfall",
      variations: ["fall of ground", "FOG", "ground failure", "rock fall"],
      mapsToCategory: "fatal-risk-management",
      weight: 10,
    },
    {
      term: "ground support",
      variations: [
        "rock bolts",
        "mesh",
        "shotcrete",
        "cable bolts",
        "split sets",
      ],
      mapsToCategory: "ground-support-design",
      weight: 10,
    },
    {
      term: "stope",
      variations: ["stoping", "extraction", "production stope"],
      mapsToCategory: "ground-control",
      weight: 9,
    },
    {
      term: "pillar",
      variations: ["crown pillar", "rib pillar", "sill pillar"],
      mapsToCategory: "geotechnical-engineering",
      weight: 9,
    },
    {
      term: "seismic",
      variations: [
        "seismicity",
        "rock burst",
        "micro seismic",
        "induced seismicity",
      ],
      mapsToCategory: "geotechnical-monitoring",
      weight: 10,
    },
    {
      term: "convergence",
      variations: ["closure", "squeeze", "ground movement"],
      mapsToCategory: "geotechnical-monitoring",
      weight: 8,
    },
    {
      term: "extensometer",
      variations: ["closure station", "ground monitoring"],
      mapsToCategory: "geotechnical-monitoring",
      weight: 8,
    },

    // Tailings and Water
    {
      term: "tailings",
      variations: [
        "TSF",
        "tailings dam",
        "tailings facility",
        "tailings storage",
      ],
      mapsToCategory: "tsf-stability",
      weight: 10,
    },
    {
      term: "GISTM",
      variations: ["global industry standard", "tailings governance"],
      mapsToCategory: "tailings-governance",
      weight: 10,
    },
    {
      term: "dam safety",
      variations: ["dam break", "dam failure", "dam stability"],
      mapsToCategory: "tsf-stability",
      weight: 10,
    },
    {
      term: "water balance",
      variations: ["water management", "water surplus", "water deficit"],
      mapsToCategory: "water-balance",
      weight: 8,
    },
    {
      term: "dewatering",
      variations: ["pumping", "groundwater control", "mine water"],
      mapsToCategory: "dewatering",
      weight: 8,
    },
    {
      term: "seepage",
      variations: ["leakage", "contamination", "plume"],
      mapsToCategory: "seepage-contamination",
      weight: 8,
    },
    {
      term: "AMD",
      variations: ["acid mine drainage", "ARD", "acid rock drainage"],
      mapsToCategory: "environmental-compliance",
      weight: 9,
    },

    // Processing
    {
      term: "crusher",
      variations: ["jaw crusher", "cone crusher", "gyratory", "HPGR"],
      mapsToCategory: "plant-throughput",
      weight: 8,
    },
    {
      term: "SAG mill",
      variations: ["semi-autogenous", "AG mill", "autogenous"],
      mapsToCategory: "plant-availability",
      weight: 9,
    },
    {
      term: "ball mill",
      variations: ["rod mill", "grinding mill", "comminution"],
      mapsToCategory: "plant-availability",
      weight: 9,
    },
    {
      term: "flotation",
      variations: ["flotation cell", "froth flotation", "rougher", "cleaner"],
      mapsToCategory: "recovery-performance",
      weight: 8,
    },
    {
      term: "leach",
      variations: ["heap leach", "CIL", "CIP", "tank leach"],
      mapsToCategory: "recovery-performance",
      weight: 8,
    },
    {
      term: "thickener",
      variations: ["clarifier", "settling"],
      mapsToCategory: "water-tailings-circuit",
      weight: 7,
    },
    {
      term: "recovery",
      variations: ["metal recovery", "extraction", "yield"],
      mapsToCategory: "recovery-performance",
      weight: 9,
    },
    {
      term: "reagent",
      variations: ["chemical", "flocculant", "lime", "cyanide"],
      mapsToCategory: "reagent-management",
      weight: 8,
    },
    {
      term: "throughput",
      variations: ["TPH", "MTPH", "tonnes per hour"],
      mapsToCategory: "plant-throughput",
      weight: 9,
    },

    // Geology
    {
      term: "grade control",
      variations: ["ore control", "grade management"],
      mapsToCategory: "grade-control",
      weight: 9,
    },
    {
      term: "resource",
      variations: ["mineral resource", "JORC resource", "NI 43-101"],
      mapsToCategory: "resource-estimation",
      weight: 8,
    },
    {
      term: "reserve",
      variations: ["ore reserve", "proven", "probable"],
      mapsToCategory: "ore-reserve-management",
      weight: 8,
    },
    {
      term: "dilution",
      variations: ["waste dilution", "ore loss"],
      mapsToCategory: "grade-ore-quality",
      weight: 8,
    },
    {
      term: "assay",
      variations: ["fire assay", "analysis", "grade"],
      mapsToCategory: "laboratory",
      weight: 7,
    },
    {
      term: "core",
      variations: ["diamond core", "drill core", "HQ", "NQ"],
      mapsToCategory: "drill-program-execution",
      weight: 7,
    },
    {
      term: "RC drilling",
      variations: ["reverse circulation", "RC"],
      mapsToCategory: "drill-program-execution",
      weight: 7,
    },

    // Safety
    {
      term: "fatal risk",
      variations: ["fatality risk", "critical risk", "life threatening"],
      mapsToCategory: "fatal-risk-management",
      weight: 10,
    },
    {
      term: "confined space",
      variations: ["permit space", "enclosed space"],
      mapsToCategory: "fatal-risk-management",
      weight: 10,
    },
    {
      term: "working at heights",
      variations: ["fall from height", "elevated work", "heights work"],
      mapsToCategory: "fatal-risk-management",
      weight: 10,
    },
    {
      term: "isolation",
      variations: ["LOTO", "lockout tagout", "energy isolation"],
      mapsToCategory: "fatal-risk-management",
      weight: 10,
    },
    {
      term: "arc flash",
      variations: ["electrical arc", "incident energy"],
      mapsToCategory: "fatal-risk-management",
      weight: 10,
    },
    {
      term: "entanglement",
      variations: ["rotating equipment", "nip point", "pinch point"],
      mapsToCategory: "fatal-risk-management",
      weight: 10,
    },
    {
      term: "explosives",
      variations: ["blasting", "detonator", "initiator", "ANFO", "emulsion"],
      mapsToCategory: "explosives-dg-supply",
      weight: 10,
    },
    {
      term: "self-rescuer",
      variations: ["SCSR", "escape device"],
      mapsToCategory: "emergency-preparedness",
      weight: 9,
    },
    {
      term: "refuge chamber",
      variations: ["refuge bay", "safe haven"],
      mapsToCategory: "emergency-preparedness",
      weight: 9,
    },

    // Maintenance
    {
      term: "breakdown",
      variations: ["failure", "unplanned downtime", "broke down"],
      mapsToCategory: "equipment-reliability",
      weight: 9,
    },
    {
      term: "availability",
      variations: ["uptime", "utilization"],
      mapsToCategory: "equipment-availability",
      weight: 8,
    },
    {
      term: "MTBF",
      variations: ["mean time between failure", "reliability"],
      mapsToCategory: "equipment-reliability",
      weight: 7,
    },
    {
      term: "MTTR",
      variations: ["mean time to repair"],
      mapsToCategory: "equipment-reliability",
      weight: 7,
    },
    {
      term: "condition monitoring",
      variations: ["vibration analysis", "oil analysis", "predictive"],
      mapsToCategory: "condition-monitoring",
      weight: 8,
    },
    {
      term: "shutdown",
      variations: ["turnaround", "outage", "maintenance shutdown"],
      mapsToCategory: "shutdown-execution",
      weight: 8,
    },
    {
      term: "spare parts",
      variations: ["spares", "critical spares", "inventory"],
      mapsToCategory: "spare-parts",
      weight: 7,
    },

    // Workforce
    {
      term: "FIFO",
      variations: ["fly in fly out", "fly-in fly-out"],
      mapsToCategory: "fifo-dido",
      weight: 8,
    },
    {
      term: "DIDO",
      variations: ["drive in drive out", "drive-in drive-out"],
      mapsToCategory: "fifo-dido",
      weight: 8,
    },
    {
      term: "fatigue",
      variations: ["tired", "fatigue management", "hours of work"],
      mapsToCategory: "fatigue-fitness",
      weight: 9,
    },
    {
      term: "roster",
      variations: ["shift", "rotation", "swing"],
      mapsToCategory: "shift-crew-management",
      weight: 7,
    },
    {
      term: "competency",
      variations: ["training", "skills", "certification"],
      mapsToCategory: "training-competency",
      weight: 7,
    },
    {
      term: "union",
      variations: ["industrial action", "strike", "collective agreement"],
      mapsToCategory: "industrial-relations",
      weight: 8,
    },

    // Financial
    {
      term: "commodity price",
      variations: ["gold price", "copper price", "iron ore price"],
      mapsToCategory: "commodity-hedging",
      weight: 8,
    },
    {
      term: "unit cost",
      variations: ["cost per tonne", "C1 cost", "AISC"],
      mapsToCategory: "cost-management",
      weight: 7,
    },
    {
      term: "capex",
      variations: ["capital expenditure", "capital project"],
      mapsToCategory: "capital-project-financial",
      weight: 7,
    },
    {
      term: "rehabilitation",
      variations: ["closure", "mine closure", "reclamation"],
      mapsToCategory: "rehabilitation-provisioning",
      weight: 8,
    },

    // Community and Environment
    {
      term: "social license",
      variations: ["community acceptance", "SLO"],
      mapsToCategory: "social-license",
      weight: 9,
    },
    {
      term: "indigenous",
      variations: ["traditional owner", "native title", "first nations"],
      mapsToCategory: "indigenous-relations",
      weight: 9,
    },
    {
      term: "cultural heritage",
      variations: ["heritage site", "sacred site"],
      mapsToCategory: "cultural-heritage",
      weight: 9,
    },
    {
      term: "grievance",
      variations: ["complaint", "community complaint"],
      mapsToCategory: "community-grievances",
      weight: 7,
    },
    {
      term: "permit",
      variations: ["license", "approval", "environmental permit"],
      mapsToCategory: "environmental-permits",
      weight: 8,
    },

    // Technology
    {
      term: "SCADA",
      variations: ["control system", "DCS", "PLC"],
      mapsToCategory: "operational-technology",
      weight: 8,
    },
    {
      term: "cybersecurity",
      variations: ["cyber attack", "ransomware", "data breach"],
      mapsToCategory: "cybersecurity",
      weight: 9,
    },
    {
      term: "automation",
      variations: ["autonomous", "AHS", "autonomous haulage"],
      mapsToCategory: "digital-transformation",
      weight: 8,
    },
    {
      term: "fleet management",
      variations: ["dispatch", "FMS"],
      mapsToCategory: "operational-technology",
      weight: 7,
    },
  ],

  /**
   * Keywords that indicate specific departments
   */
  departmentKeywords: {
    hse: [
      "safety",
      "SHE",
      "HSE",
      "incident",
      "injury",
      "fatality",
      "hazard",
      "environment",
      "health",
      "risk",
      "PPE",
      "permit",
    ],
    operations: [
      "production",
      "extraction",
      "underground",
      "open pit",
      "stope",
      "ore",
      "mining",
      "output",
      "tonnage",
      "target",
    ],
    processing: [
      "plant",
      "processing",
      "metallurgy",
      "recovery",
      "concentrate",
      "mill",
      "crusher",
      "flotation",
      "leach",
    ],
    geology: [
      "geology",
      "grade",
      "resource",
      "reserve",
      "exploration",
      "drilling",
      "assay",
      "model",
      "ore body",
    ],
    maintenance: [
      "maintenance",
      "repair",
      "breakdown",
      "reliability",
      "availability",
      "PM",
      "shutdown",
      "equipment",
    ],
    "tailings-water": [
      "tailings",
      "TSF",
      "dam",
      "water",
      "dewatering",
      "seepage",
      "GISTM",
      "water balance",
    ],
    community: [
      "community",
      "stakeholder",
      "indigenous",
      "social",
      "grievance",
      "heritage",
      "land access",
    ],
    finance: [
      "cost",
      "budget",
      "capex",
      "opex",
      "revenue",
      "commodity",
      "hedge",
      "insurance",
      "impairment",
    ],
    hr: [
      "workforce",
      "employee",
      "union",
      "fatigue",
      "roster",
      "FIFO",
      "training",
      "competency",
      "retention",
    ],
    projects: [
      "project",
      "construction",
      "commissioning",
      "feasibility",
      "EPCM",
      "capital",
      "schedule",
      "scope",
    ],
    "security-emergency": [
      "security",
      "emergency",
      "fire",
      "rescue",
      "crisis",
      "evacuation",
      "medical",
    ],
    legal: [
      "contract",
      "permit",
      "compliance",
      "tenement",
      "litigation",
      "regulatory",
      "license",
    ],
    it: [
      "IT",
      "cyber",
      "system",
      "network",
      "SCADA",
      "automation",
      "data",
      "software",
    ],
    "mining-engineering": [
      "mine design",
      "planning",
      "ventilation",
      "geotechnical",
      "drill blast",
      "scheduling",
    ],
    "technical-services": [
      "survey",
      "geotech",
      "hydro",
      "dust",
      "technical",
      "feasibility",
    ],
    executive: [
      "strategy",
      "board",
      "governance",
      "investor",
      "M&A",
      "leadership",
      "reputation",
    ],
    marketing: [
      "offtake",
      "sales",
      "customer",
      "brand",
      "communications",
      "ESG",
    ],
    procurement: [
      "supplier",
      "contractor",
      "procurement",
      "spare parts",
      "fuel",
      "logistics",
    ],
    facilities: [
      "camp",
      "accommodation",
      "catering",
      "airstrip",
      "infrastructure",
      "fleet",
    ],
    risk: [
      "risk",
      "audit",
      "compliance",
      "insurance",
      "BCP",
      "bow-tie",
      "critical control",
    ],
  },

  /**
   * Common risks for quick selection UI
   */
  commonRisks: [
    {
      id: "vehicle-interaction-fatal",
      label: "Vehicle collision with pedestrian",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "ground-fall-fatal",
      label: "Fall of ground / rockfall",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "confined-space-fatal",
      label: "Confined space entry incident",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "working-heights-fatal",
      label: "Fall from height",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "explosives-blasting-fatal",
      label: "Explosives / blasting incident",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "entanglement-fatal",
      label: "Rotating equipment entanglement",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "drowning-fatal",
      label: "Drowning / water inrush",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "electrical-fatal",
      label: "Electrical contact / arc flash",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "lifting-fatal",
      label: "Dropped load / crane failure",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "fire-explosion-fatal",
      label: "Fire or explosion",
      icon: "⚠️",
      category: "fatal-risk-management",
    },
    {
      id: "tsf-failure",
      label: "Tailings dam failure",
      icon: "🌍",
      category: "tsf-stability",
    },
    {
      id: "ore-grade-variability",
      label: "Grade variability / dilution",
      icon: "📉",
      category: "grade-ore-quality",
    },
    {
      id: "commodity-price-crash",
      label: "Commodity price collapse",
      icon: "💰",
      category: "commodity-hedging",
    },
    {
      id: "equipment-breakdown",
      label: "Major equipment breakdown",
      icon: "🔧",
      category: "equipment-availability",
    },
    {
      id: "skills-shortage",
      label: "Critical skills shortage",
      icon: "👥",
      category: "workforce-planning",
    },
    {
      id: "license-compliance",
      label: "Mining license non-compliance",
      icon: "⚖️",
      category: "regulatory-compliance",
    },
    {
      id: "community-opposition",
      label: "Community opposition / protest",
      icon: "🤝",
      category: "social-license",
    },
    {
      id: "cybersecurity-breach",
      label: "Cybersecurity incident",
      icon: "💻",
      category: "cybersecurity",
    },
    {
      id: "environmental-contamination",
      label: "Environmental contamination",
      icon: "🌍",
      category: "environmental-compliance",
    },
    {
      id: "power-outage",
      label: "Power supply failure",
      icon: "⚡",
      category: "energy-power-supply",
    },
  ],

  /**
   * Natural language phrase mapping
   * Maps common user phrases to risk categories and specific risks
   */
  phraseMapping: [
    {
      phrase: "we might lose production",
      category: "production-performance",
      risk: "ore-feed-shortage",
    },
    {
      phrase: "truck broke down",
      category: "equipment-availability",
      risk: "equipment-breakdown",
    },
    {
      phrase: "grade is low",
      category: "grade-ore-quality",
      risk: "ore-grade-variability",
    },
    {
      phrase: "can't find enough operators",
      category: "shift-crew-management",
      risk: null,
    },
    {
      phrase: "haul trucks are queuing",
      category: "materials-handling",
      risk: null,
    },
    { phrase: "blast didn't go well", category: "drill-blast", risk: null },
    { phrase: "mill is down", category: "plant-availability", risk: null },
    {
      phrase: "development is behind",
      category: "operational-planning",
      risk: null,
    },
    {
      phrase: "someone might get hurt",
      category: "fatal-risk-management",
      risk: null,
    },
    {
      phrase: "worried about the tailings dam",
      category: "tsf-stability",
      risk: "tsf-failure",
    },
    {
      phrase: "community is unhappy",
      category: "social-license",
      risk: "community-opposition",
    },
    {
      phrase: "permit is delayed",
      category: "environmental-permits",
      risk: null,
    },
    {
      phrase: "costs are blowing out",
      category: "cost-management",
      risk: null,
    },
    {
      phrase: "contractors aren't performing",
      category: "contractor-management",
      risk: null,
    },
    {
      phrase: "equipment keeps breaking",
      category: "equipment-reliability",
      risk: "equipment-breakdown",
    },
    { phrase: "running out of spares", category: "spare-parts", risk: null },
    {
      phrase: "pit wall looks unstable",
      category: "geotechnical-engineering",
      risk: null,
    },
    {
      phrase: "ground conditions are bad",
      category: "ground-control",
      risk: "ground-fall-fatal",
    },
    { phrase: "can't get enough water", category: "water-balance", risk: null },
    {
      phrase: "power keeps going out",
      category: "energy-power-supply",
      risk: "power-outage",
    },
    {
      phrase: "union is threatening action",
      category: "industrial-relations",
      risk: null,
    },
    {
      phrase: "people are leaving",
      category: "employee-retention",
      risk: null,
    },
    {
      phrase: "near miss with vehicle",
      category: "fatal-risk-management",
      risk: "vehicle-interaction-fatal",
    },
    {
      phrase: "someone fell",
      category: "fatal-risk-management",
      risk: "working-heights-fatal",
    },
    {
      phrase: "fire on equipment",
      category: "fatal-risk-management",
      risk: "fire-explosion-fatal",
    },
    { phrase: "chemical spill", category: "hazardous-materials", risk: null },
    { phrase: "flood in the pit", category: "weather-climatic", risk: null },
    {
      phrase: "can't meet the target",
      category: "production-performance",
      risk: "ore-feed-shortage",
    },
    { phrase: "project is over budget", category: "project-cost", risk: null },
    {
      phrase: "environmental incident",
      category: "environmental-compliance",
      risk: "environmental-contamination",
    },
    {
      phrase: "rock fell",
      category: "fatal-risk-management",
      risk: "ground-fall-fatal",
    },
    {
      phrase: "someone got caught in",
      category: "fatal-risk-management",
      risk: "entanglement-fatal",
    },
    {
      phrase: "electrical shock",
      category: "fatal-risk-management",
      risk: "electrical-fatal",
    },
    {
      phrase: "crane dropped load",
      category: "fatal-risk-management",
      risk: "lifting-fatal",
    },
    {
      phrase: "explosion",
      category: "fatal-risk-management",
      risk: "fire-explosion-fatal",
    },
    {
      phrase: "drowning",
      category: "fatal-risk-management",
      risk: "drowning-fatal",
    },
    {
      phrase: "blast fumes",
      category: "fatal-risk-management",
      risk: "explosives-blasting-fatal",
    },
  ],

  /**
   * Sentence builder dropdowns for guided risk creation
   */
  sentenceBuilder: {
    /**
     * Level 1: Risk types (by department/area)
     */
    riskTypes: [
      { id: "safety", label: "Safety incident", icon: "⚠️", department: "hse" },
      {
        id: "environmental",
        label: "Environmental incident",
        icon: "🌍",
        department: "hse",
      },
      {
        id: "financial",
        label: "Financial loss",
        icon: "💰",
        department: "finance",
      },
      {
        id: "operational",
        label: "Operational disruption",
        icon: "🏭",
        department: "operations",
      },
      {
        id: "compliance",
        label: "Compliance breach",
        icon: "⚖️",
        department: "legal",
      },
      {
        id: "people",
        label: "People / workforce issue",
        icon: "👥",
        department: "hr",
      },
      {
        id: "technology",
        label: "Technology failure",
        icon: "💻",
        department: "it",
      },
      {
        id: "community",
        label: "Community / stakeholder issue",
        icon: "🤝",
        department: "community",
      },
      {
        id: "geotechnical",
        label: "Geotechnical issue",
        icon: "⛰️",
        department: "technical-services",
      },
      {
        id: "processing",
        label: "Processing issue",
        icon: "🔧",
        department: "processing",
      },
    ],

    /**
     * Level 2: Specifics (filtered by level 1)
     */
    specifics: {
      safety: [
        {
          id: "vehicle",
          label: "vehicle collision with worker",
          mapsToRisk: "vehicle-interaction-fatal",
        },
        {
          id: "fall-ground",
          label: "fall of ground / rockfall",
          mapsToRisk: "ground-fall-fatal",
        },
        {
          id: "fall-height",
          label: "fall from height",
          mapsToRisk: "working-heights-fatal",
        },
        {
          id: "confined-space",
          label: "confined space incident",
          mapsToRisk: "confined-space-fatal",
        },
        {
          id: "entanglement",
          label: "machinery entanglement",
          mapsToRisk: "entanglement-fatal",
        },
        {
          id: "electrical",
          label: "electrical contact / arc flash",
          mapsToRisk: "electrical-fatal",
        },
        {
          id: "fire",
          label: "fire or explosion",
          mapsToRisk: "fire-explosion-fatal",
        },
        {
          id: "explosives",
          label: "explosives / blasting incident",
          mapsToRisk: "explosives-blasting-fatal",
        },
        {
          id: "lifting",
          label: "dropped load / crane failure",
          mapsToRisk: "lifting-fatal",
        },
        {
          id: "drowning",
          label: "drowning / water inrush",
          mapsToRisk: "drowning-fatal",
        },
      ],
      environmental: [
        {
          id: "tailings",
          label: "tailings dam incident",
          mapsToRisk: "tsf-failure",
        },
        {
          id: "water-contamination",
          label: "water contamination",
          mapsToRisk: null,
        },
        { id: "air-quality", label: "air quality breach", mapsToRisk: null },
        {
          id: "rehabilitation",
          label: "rehabilitation failure",
          mapsToRisk: null,
        },
        { id: "spill", label: "chemical or fuel spill", mapsToRisk: null },
        { id: "biodiversity", label: "biodiversity impact", mapsToRisk: null },
      ],
      financial: [
        {
          id: "commodity",
          label: "commodity price drop",
          mapsToRisk: "commodity-price-crash",
        },
        { id: "cost-overrun", label: "cost overrun", mapsToRisk: null },
        { id: "fx", label: "currency fluctuation", mapsToRisk: null },
        { id: "impairment", label: "asset impairment", mapsToRisk: null },
        { id: "fraud", label: "fraud or theft", mapsToRisk: null },
        { id: "insurance", label: "insurance gap", mapsToRisk: null },
      ],
      operational: [
        {
          id: "equipment-failure",
          label: "equipment breakdown",
          mapsToRisk: "equipment-breakdown",
        },
        {
          id: "ore-supply",
          label: "ore supply shortage",
          mapsToRisk: "ore-feed-shortage",
        },
        {
          id: "grade-issue",
          label: "grade / dilution issue",
          mapsToRisk: "ore-grade-variability",
        },
        {
          id: "power-failure",
          label: "power supply failure",
          mapsToRisk: "power-outage",
        },
        { id: "weather", label: "weather disruption", mapsToRisk: null },
        {
          id: "contractor-failure",
          label: "contractor underperformance",
          mapsToRisk: null,
        },
      ],
      compliance: [
        {
          id: "permit-breach",
          label: "permit / license breach",
          mapsToRisk: "license-compliance",
        },
        {
          id: "reporting-failure",
          label: "reporting failure",
          mapsToRisk: null,
        },
        {
          id: "indigenous",
          label: "indigenous agreement breach",
          mapsToRisk: null,
        },
        {
          id: "safety-breach",
          label: "safety regulation breach",
          mapsToRisk: null,
        },
        {
          id: "environment-breach",
          label: "environmental permit breach",
          mapsToRisk: null,
        },
      ],
      people: [
        {
          id: "skills-shortage",
          label: "skills shortage",
          mapsToRisk: "skills-shortage",
        },
        {
          id: "industrial-action",
          label: "industrial action / strike",
          mapsToRisk: null,
        },
        {
          id: "fatigue",
          label: "fatigue / fitness for work",
          mapsToRisk: null,
        },
        { id: "retention", label: "high turnover", mapsToRisk: null },
        { id: "competency", label: "competency gaps", mapsToRisk: null },
      ],
      technology: [
        {
          id: "cyber-attack",
          label: "cyber attack",
          mapsToRisk: "cybersecurity-breach",
        },
        {
          id: "system-failure",
          label: "system failure / outage",
          mapsToRisk: null,
        },
        { id: "data-loss", label: "data loss", mapsToRisk: null },
        { id: "ot-failure", label: "control system failure", mapsToRisk: null },
      ],
      community: [
        {
          id: "opposition",
          label: "community opposition",
          mapsToRisk: "community-opposition",
        },
        { id: "grievance", label: "grievance escalation", mapsToRisk: null },
        { id: "heritage", label: "cultural heritage breach", mapsToRisk: null },
        {
          id: "social-license",
          label: "social license loss",
          mapsToRisk: null,
        },
      ],
      geotechnical: [
        {
          id: "slope-failure",
          label: "slope / highwall failure",
          mapsToRisk: null,
        },
        { id: "subsidence", label: "subsidence", mapsToRisk: null },
        {
          id: "water-inrush",
          label: "water inrush",
          mapsToRisk: "drowning-fatal",
        },
      ],
      processing: [
        { id: "recovery-drop", label: "recovery drop", mapsToRisk: null },
        {
          id: "throughput-loss",
          label: "throughput reduction",
          mapsToRisk: null,
        },
        {
          id: "quality-issue",
          label: "product quality issue",
          mapsToRisk: null,
        },
        {
          id: "reagent-issue",
          label: "reagent supply issue",
          mapsToRisk: null,
        },
      ],
    },

    /**
     * Level 3: Causes (filtered by level 2 specific)
     */
    causes: {
      vehicle: [
        { id: "segregation", label: "lack of pedestrian barriers" },
        { id: "proximity", label: "no proximity detection" },
        { id: "visibility", label: "poor visibility" },
        { id: "fatigue", label: "operator fatigue" },
        { id: "training", label: "inadequate training" },
        { id: "comms", label: "communication failure" },
        { id: "speed", label: "speeding / speed limits" },
      ],
      "fall-ground": [
        { id: "support", label: "inadequate ground support" },
        { id: "geology", label: "unexpected geological conditions" },
        { id: "inspection", label: "poor inspection practices" },
        { id: "seismic", label: "seismic activity" },
        { id: "water", label: "water ingress" },
        { id: "scaling", label: "inadequate scaling" },
      ],
      "fall-height": [
        { id: "harness", label: "failure to use harness" },
        { id: "guardrails", label: "missing guardrails" },
        { id: "scaffold", label: "scaffold failure" },
        { id: "ladder", label: "improper ladder use" },
        { id: "anchor", label: "inadequate anchor points" },
      ],
      "confined-space": [
        { id: "atmosphere", label: "atmosphere not tested" },
        { id: "ventilation", label: "inadequate ventilation" },
        { id: "permit", label: "permit not obtained" },
        { id: "rescue", label: "no rescue capability" },
        { id: "isolation", label: "inadequate isolation" },
      ],
      entanglement: [
        { id: "guarding", label: "missing guards" },
        { id: "interlock", label: "interlock bypassed" },
        { id: "loto", label: "LOTO not applied" },
        { id: "clothing", label: "loose clothing" },
        { id: "blockage", label: "clearing while running" },
      ],
      electrical: [
        { id: "isolation", label: "isolation failure" },
        { id: "verification", label: "not tested before touch" },
        { id: "ppe", label: "inadequate PPE" },
        { id: "cables", label: "damaged cables" },
        { id: "unauthorized", label: "unauthorized work" },
      ],
      "equipment-failure": [
        { id: "maintenance", label: "inadequate maintenance" },
        { id: "spares", label: "parts unavailable" },
        { id: "age", label: "component beyond life" },
        { id: "operator", label: "operator damage" },
        { id: "monitoring", label: "no condition monitoring" },
      ],
      "ore-supply": [
        { id: "equipment", label: "mining equipment down" },
        { id: "ground", label: "poor ground conditions" },
        { id: "weather", label: "weather impacts" },
        { id: "planning", label: "planning failures" },
        { id: "workforce", label: "workforce shortage" },
      ],
    },

    /**
     * Level 4: Consequences (filtered by level 2 specific)
     */
    consequences: {
      vehicle: [
        { id: "fatality", label: "fatality" },
        { id: "injury", label: "serious injury" },
        { id: "shutdown", label: "operations shutdown" },
        { id: "prosecution", label: "criminal prosecution" },
        { id: "reputation", label: "reputation damage" },
      ],
      "fall-ground": [
        { id: "fatality", label: "multiple fatalities" },
        { id: "trapped", label: "workers trapped underground" },
        { id: "closure", label: "mine section closure" },
        { id: "reputation", label: "reputation damage" },
        { id: "prosecution", label: "prosecution" },
      ],
      "equipment-failure": [
        { id: "production", label: "production loss" },
        { id: "cost", label: "repair costs" },
        { id: "target", label: "missed targets" },
        { id: "delivery", label: "customer impacts" },
        { id: "cascade", label: "cascade failures" },
      ],
      "ore-supply": [
        { id: "throughput", label: "plant throughput loss" },
        { id: "cost", label: "unit cost increase" },
        { id: "revenue", label: "revenue shortfall" },
        { id: "stockpile", label: "stockpile depletion" },
        { id: "guidance", label: "guidance downgrade" },
      ],
      commodity: [
        { id: "revenue", label: "revenue decline" },
        { id: "impairment", label: "asset impairment" },
        { id: "jobs", label: "workforce reduction" },
        { id: "closure", label: "mine closure" },
        { id: "viability", label: "viability concerns" },
      ],
      "cyber-attack": [
        { id: "shutdown", label: "operations shutdown" },
        { id: "data", label: "data breach" },
        { id: "ransom", label: "ransom payment" },
        { id: "reputation", label: "reputation damage" },
        { id: "safety", label: "safety system compromise" },
      ],
      opposition: [
        { id: "permit", label: "permit delays" },
        { id: "blockade", label: "site blockade" },
        { id: "media", label: "negative media" },
        { id: "license", label: "license conditions" },
        { id: "access", label: "access restrictions" },
      ],
    },
  },

  /**
   * Search vocabulary by term
   * @param {string} searchTerm - Term to search
   * @returns {Array} Matching vocabulary items
   */
  searchVocabulary: function (searchTerm) {
    var results = [];
    var lowerTerm = searchTerm.toLowerCase();
    var i, j, item;

    for (i = 0; i < this.vocabulary.length; i++) {
      item = this.vocabulary[i];

      // Check primary term
      if (item.term.toLowerCase().indexOf(lowerTerm) !== -1) {
        results.push(item);
        continue;
      }

      // Check variations
      if (item.variations) {
        for (j = 0; j < item.variations.length; j++) {
          if (item.variations[j].toLowerCase().indexOf(lowerTerm) !== -1) {
            results.push(item);
            break;
          }
        }
      }
    }

    // Sort by weight
    results.sort(function (a, b) {
      return b.weight - a.weight;
    });

    return results;
  },

  /**
   * Detect department from keywords in text
   * @param {string} text - Text to analyze
   * @returns {Array} Detected departments sorted by match count
   */
  detectDepartment: function (text) {
    var lowerText = text.toLowerCase();
    var results = [];
    var departments = Object.keys(this.departmentKeywords);
    var i, j, keywords, count;

    for (i = 0; i < departments.length; i++) {
      keywords = this.departmentKeywords[departments[i]];
      count = 0;

      for (j = 0; j < keywords.length; j++) {
        if (lowerText.indexOf(keywords[j].toLowerCase()) !== -1) {
          count++;
        }
      }

      if (count > 0) {
        results.push({
          department: departments[i],
          matchCount: count,
        });
      }
    }

    // Sort by match count
    results.sort(function (a, b) {
      return b.matchCount - a.matchCount;
    });

    return results;
  },

  /**
   * Match phrase to risk
   * @param {string} phrase - User phrase to match
   * @returns {Object|null} Matching phrase mapping or null
   */
  matchPhrase: function (phrase) {
    var lowerPhrase = phrase.toLowerCase();
    var i, mapping;

    for (i = 0; i < this.phraseMapping.length; i++) {
      mapping = this.phraseMapping[i];
      if (lowerPhrase.indexOf(mapping.phrase) !== -1) {
        return mapping;
      }
    }

    return null;
  },

  /**
   * Get sentence builder options for a given level and selection
   * @param {string} level - Level name ('riskTypes', 'specifics', 'causes', 'consequences')
   * @param {string} parentSelection - Parent level selection ID (optional)
   * @returns {Array} Options for the requested level
   */
  getSentenceBuilderOptions: function (level, parentSelection) {
    if (level === "riskTypes") {
      return this.sentenceBuilder.riskTypes;
    }

    if (level === "specifics" && parentSelection) {
      return this.sentenceBuilder.specifics[parentSelection] || [];
    }

    if (level === "causes" && parentSelection) {
      return this.sentenceBuilder.causes[parentSelection] || [];
    }

    if (level === "consequences" && parentSelection) {
      return this.sentenceBuilder.consequences[parentSelection] || [];
    }

    return [];
  },
};
