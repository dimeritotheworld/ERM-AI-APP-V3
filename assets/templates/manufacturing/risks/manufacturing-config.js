/**
 * Manufacturing - Industry Configuration
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 * Country-agnostic risk templates
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.manufacturing = ERM_TEMPLATES.manufacturing || {};

ERM_TEMPLATES.manufacturing.config = {
  id: "manufacturing",
  name: "Manufacturing",
  version: "1.0.0",

  subSectors: [
    {
      id: "automotive",
      name: "Automotive Manufacturing",
      description:
        "Production of motor vehicles, parts, and components including assembly operations, Tier 1 and Tier 2 suppliers, and specialized automotive subsystems manufacturing",
    },
    {
      id: "aerospace",
      name: "Aerospace & Defense",
      description:
        "Manufacturing of aircraft, spacecraft, defense equipment, and related components requiring precision engineering and stringent quality standards",
    },
    {
      id: "electronics",
      name: "Electronics Manufacturing",
      description:
        "Production of electronic components, semiconductors, printed circuit boards, consumer electronics, and industrial electronic equipment",
    },
    {
      id: "food-beverage",
      name: "Food & Beverage Processing",
      description:
        "Processing, packaging, and production of food products and beverages requiring strict hygiene, safety, and quality controls",
    },
    {
      id: "pharmaceutical",
      name: "Pharmaceutical & Life Sciences",
      description:
        "Manufacturing of pharmaceutical products, medical devices, and biotechnology products under strict regulatory and quality requirements",
    },
    {
      id: "chemical",
      name: "Chemical Manufacturing",
      description:
        "Production of industrial chemicals, specialty chemicals, petrochemicals, and chemical products through batch or continuous processing",
    },
    {
      id: "metals",
      name: "Metals & Heavy Industry",
      description:
        "Steel production, metal fabrication, foundry operations, and heavy industrial manufacturing including casting and forging",
    },
    {
      id: "plastics-rubber",
      name: "Plastics & Rubber",
      description:
        "Injection molding, extrusion, thermoforming, and rubber product manufacturing for industrial and consumer applications",
    },
    {
      id: "consumer-goods",
      name: "Consumer Goods & Packaging",
      description:
        "Manufacturing of consumer products, fast-moving consumer goods, and packaging materials for retail and consumer markets",
    },
    {
      id: "industrial-equipment",
      name: "Industrial Equipment & Machinery",
      description:
        "Production of industrial machinery, capital equipment, heavy equipment, and specialized manufacturing systems",
    },
    {
      id: "contract-manufacturing",
      name: "Contract Manufacturing",
      description:
        "Third-party manufacturing services providing production capacity, specialized processes, or complete product assembly for other companies",
    },
  ],

  characteristics: {
    regulatoryEnvironment:
      "Subject to workplace health and safety regulations, environmental permits, product safety standards, industry-specific quality requirements, labor laws, and trade compliance. Manufacturing facilities require operating permits and are subject to regular inspections across safety, environmental, and quality domains.",

    keyStakeholders: [
      "Shareholders and investors",
      "Employees and labor unions",
      "Customers and OEM partners",
      "Suppliers and subcontractors",
      "Regulatory agencies (safety, environmental, product)",
      "Local communities",
      "Insurance providers",
      "Industry associations",
      "Quality certification bodies",
      "Logistics and distribution partners",
    ],

    outsourcingPattern:
      "Contract manufacturing, Equipment maintenance and repair, Logistics and warehousing, IT services, Specialized testing and calibration, Waste management, Security services, Catering and facility services, Temporary labor, Engineering and consulting services",

    riskAppetite: {
      safety: "LOW",
      productQuality: "LOW",
      environmental: "LOW",
      operational: "MEDIUM",
      supplyChain: "MEDIUM",
      financial: "MEDIUM",
      innovation: "MEDIUM-HIGH",
      marketExpansion: "MEDIUM-HIGH",
    },

    criticalRiskAreas: [
      "Worker safety and serious injury prevention",
      "Product quality and recall prevention",
      "Equipment reliability and unplanned downtime",
      "Supply chain continuity and material availability",
      "Process safety and fire/explosion prevention",
      "Environmental compliance and spill prevention",
      "Cyber security for manufacturing systems",
      "Customer satisfaction and on-time delivery",
      "Workforce skills and labor availability",
      "Regulatory compliance across all domains",
    ],
  },

  treatmentTypes: {
    avoid: {
      id: "avoid",
      name: "Avoid",
      definition:
        "Deciding not to start or continue with the activity that gives rise to the risk. This involves eliminating the hazard or withdrawing from the risk exposure entirely.",
      whenToUse:
        "Use when the risk exceeds organizational risk appetite and no practical controls can reduce it to acceptable levels. Also appropriate when cost of treatment exceeds potential benefit of the activity.",
      considerations:
        "May result in lost opportunities. Consider whether avoiding one risk creates new risks. Document the decision rationale for governance purposes.",
    },
    mitigate: {
      id: "mitigate",
      name: "Mitigate",
      definition:
        "Taking action to reduce the likelihood and/or consequences of the risk to an acceptable level. This is the most common treatment involving implementation of controls, procedures, or safeguards.",
      whenToUse:
        "Use when the activity must continue but risk levels are above appetite. Appropriate when effective controls exist and can be implemented at reasonable cost relative to risk reduction achieved.",
      considerations:
        "Requires ongoing monitoring to ensure controls remain effective. Consider defense-in-depth with multiple control layers. Balance control costs against residual risk level.",
    },
    transfer: {
      id: "transfer",
      name: "Transfer",
      definition:
        "Sharing the risk with another party through insurance, contracts, partnerships, or outsourcing. Note: Transfer does not eliminate risk entirely - reputational and some legal risks typically cannot be transferred.",
      whenToUse:
        "Use when another party can better manage the risk, when insurance is cost-effective relative to potential loss, or when contractual arrangements can shift liability appropriately.",
      considerations:
        "Understand what is actually transferred versus retained. Insurance has limits, exclusions, and deductibles. Contractor transfer requires strong contract management.",
    },
    accept: {
      id: "accept",
      name: "Accept",
      definition:
        "Acknowledging the risk and deciding to retain it without additional treatment. May be active (informed decision with monitoring) or passive (risk not identified or ignored). Only active acceptance is appropriate.",
      whenToUse:
        "Use when risk is within appetite, when cost of treatment exceeds benefit, when risk is unavoidable, or when residual risk after treatment is accepted. All acceptance should be documented and authorized.",
      considerations:
        "Requires explicit approval at appropriate authority level. Must establish monitoring to detect changes. Review acceptance decisions periodically. Not appropriate for risks with catastrophic consequences.",
    },
    exploit: {
      id: "exploit",
      name: "Exploit",
      definition:
        "Taking action to increase exposure to the risk in order to capture potential upside opportunity. Common in strategic and market risks where uncertainty can have positive outcomes.",
      whenToUse:
        "Use when the uncertainty could result in positive outcomes (opportunities) and the organization wants to maximize the probability or impact of that positive outcome.",
      considerations:
        "Primarily for opportunity risks. Ensure downside is still managed. Balance potential gain against increased exposure.",
    },
  },

  scoringScales: {
    likelihood: [
      {
        score: 1,
        rating: "Rare",
        description: "May occur only in exceptional circumstances",
        frequency: "Less than 5% probability in next 12 months; less than once every 10 years historically",
      },
      {
        score: 2,
        rating: "Unlikely",
        description: "Could occur at some time but not expected",
        frequency: "5-20% probability in next 12 months; once every 3-10 years historically",
      },
      {
        score: 3,
        rating: "Possible",
        description: "Might occur at some time",
        frequency: "20-50% probability in next 12 months; once every 1-3 years historically",
      },
      {
        score: 4,
        rating: "Likely",
        description: "Will probably occur in most circumstances",
        frequency: "50-80% probability in next 12 months; expected to occur within the year",
      },
      {
        score: 5,
        rating: "Almost Certain",
        description: "Expected to occur in most circumstances",
        frequency: "Greater than 80% probability in next 12 months; may occur multiple times per year",
      },
    ],
    impact: [
      {
        score: 1,
        rating: "Insignificant",
        safety: "No injury or first aid only",
        quality: "No product impact, internal rework only",
        financial: "Less than $100K financial impact",
        reputation: "No external attention",
        production: "Less than 1 hour production impact",
      },
      {
        score: 2,
        rating: "Minor",
        safety: "Minor injury requiring medical treatment",
        quality: "Minor quality issue, contained before shipment",
        financial: "$100K to $1M financial impact",
        reputation: "Local attention, easily managed",
        production: "1-8 hours production impact",
      },
      {
        score: 3,
        rating: "Moderate",
        safety: "Significant injury, lost time, hospitalization",
        quality: "Quality escape to customer requiring response",
        financial: "$1M to $10M financial impact",
        reputation: "Regional media, stakeholder concern",
        production: "8-24 hours production impact",
      },
      {
        score: 4,
        rating: "Major",
        safety: "Serious injury, permanent disability, multiple injuries",
        quality: "Major quality event, customer line stoppage, limited recall",
        financial: "$10M to $50M financial impact",
        reputation: "National media, regulatory action",
        production: "1-7 days production impact",
      },
      {
        score: 5,
        rating: "Catastrophic",
        safety: "Fatality or multiple serious injuries",
        quality: "Major product recall, product liability",
        financial: "Greater than $50M financial impact",
        reputation: "International media, loss of major customers",
        production: "Greater than 7 days production impact, plant closure",
      },
    ],
  },

  thirdPartyCategories: [
    {
      id: "contract-manufacturing",
      name: "Contract Manufacturing",
      typical: "Manufacturing service providers, assembly subcontractors, component manufacturers",
    },
    {
      id: "equipment-maintenance",
      name: "Equipment Maintenance & Repair",
      typical: "OEM service providers, machine tool specialists, automation integrators",
    },
    {
      id: "logistics-warehousing",
      name: "Logistics & Warehousing",
      typical: "Third-party logistics providers, freight carriers, warehouse operators",
    },
    {
      id: "temporary-labor",
      name: "Temporary Labor & Staffing",
      typical: "Staffing agencies, temporary workforce providers, skilled trades contractors",
    },
    {
      id: "calibration-testing",
      name: "Calibration & Testing",
      typical: "Calibration services, testing laboratories, certification bodies",
    },
    {
      id: "waste-environmental",
      name: "Waste Management & Environmental",
      typical: "Waste haulers, recyclers, environmental consultants",
    },
    {
      id: "it-services",
      name: "IT & Technology Services",
      typical: "MES providers, ERP consultants, OT security specialists",
    },
    {
      id: "engineering-consulting",
      name: "Engineering & Consulting",
      typical: "Process engineers, automation consultants, lean consultants",
    },
    {
      id: "facility-services",
      name: "Facility Services",
      typical: "Cleaning, security, catering, building maintenance",
    },
    {
      id: "raw-material-suppliers",
      name: "Raw Material Suppliers",
      typical: "Metal suppliers, chemical suppliers, component distributors",
    },
  ],
};

console.log("Manufacturing Configuration loaded");
