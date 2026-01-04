/**
 * Mining & Resources - Industry Configuration
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 * Country-agnostic risk templates
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.mining = ERM_TEMPLATES.mining || {};

ERM_TEMPLATES.mining.config = {
  id: "mining",
  name: "Mining & Resources",
  version: "1.0.0",

  subSectors: [
    {
      id: "underground",
      name: "Underground Mining",
      description:
        "Extraction of minerals and ores through subsurface tunnels and shafts, including hard rock mining, coal mining, and solution mining operations",
    },
    {
      id: "open-pit",
      name: "Open Pit / Surface Mining",
      description:
        "Large-scale extraction from surface excavations including strip mining, quarrying, and mountaintop removal operations",
    },
    {
      id: "processing",
      name: "Mineral Processing & Beneficiation",
      description:
        "Crushing, grinding, separation, and concentration of extracted ore to produce marketable mineral concentrates",
    },
    {
      id: "exploration",
      name: "Exploration & Geology",
      description:
        "Prospecting, geological surveying, drilling programs, and resource estimation activities to identify and quantify mineral deposits",
    },
    {
      id: "smelting",
      name: "Smelting & Refining",
      description:
        "Metallurgical processing to extract pure metals from concentrates through pyrometallurgical or hydrometallurgical methods",
    },
    {
      id: "services",
      name: "Mining Services & Contractors",
      description:
        "Contract mining operations, drilling services, blasting contractors, equipment maintenance, and specialized mining support services",
    },
  ],

  characteristics: {
    regulatoryEnvironment:
      "Heavily regulated across multiple domains including occupational health and safety, environmental protection, land use and mining rights, community relations, and financial reporting. Requires multiple permits and licenses. Subject to frequent inspections and audits.",

    keyStakeholders: [
      "Shareholders and investors",
      "Employees and unions",
      "Local and indigenous communities",
      "Government regulators (mining, environment, labor)",
      "Contractors and suppliers",
      "Customers and offtake partners",
      "Environmental groups and NGOs",
      "Financial institutions and insurers",
      "Joint venture partners",
      "Industry associations",
    ],

    outsourcingPattern:
      "Contract mining operations, Exploration drilling, Equipment maintenance, Catering and camp management, Security services, Transportation and logistics, Environmental monitoring, Laboratory services, Engineering and construction, IT and telecommunications",

    riskAppetite: {
      safety: "LOW",
      environmental: "LOW",
      regulatory: "LOW",
      operational: "MEDIUM",
      financial: "MEDIUM",
      exploration: "MEDIUM-HIGH",
      growth: "MEDIUM-HIGH",
    },

    criticalRiskAreas: [
      "Fatal and serious injury prevention",
      "Ground control and geotechnical stability",
      "Tailings storage facility management",
      "Environmental incidents and contamination",
      "Community relations and social license",
      "Commodity price and market volatility",
      "Water management and supply",
      "Equipment and infrastructure reliability",
      "Contractor management",
      "Regulatory compliance",
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
        frequency: "<10% in 12 months; less than once every 10 years",
      },
      {
        score: 2,
        rating: "Unlikely",
        description: "Could occur at some time",
        frequency: "10-30% in 12 months; once every 3-10 years",
      },
      {
        score: 3,
        rating: "Possible",
        description: "Might occur at some time",
        frequency: "30-60% in 12 months; once every 1-3 years",
      },
      {
        score: 4,
        rating: "Likely",
        description: "Will probably occur in most circumstances",
        frequency: "60-90% in 12 months; once per year",
      },
      {
        score: 5,
        rating: "Almost Certain",
        description: "Expected to occur in most circumstances",
        frequency: ">90% in 12 months; multiple times per year",
      },
    ],
    impact: [
      {
        score: 1,
        rating: "Insignificant",
        safety: "No injury",
        environment: "Negligible impact",
        financial: "<$100K or <1% revenue",
        reputation: "No external attention",
      },
      {
        score: 2,
        rating: "Minor",
        safety: "First aid treatment",
        environment: "Minor damage, easily remediated",
        financial: "$100K-1M or 1-5% revenue",
        reputation: "Local attention, contained",
      },
      {
        score: 3,
        rating: "Moderate",
        safety: "Medical treatment injury, hospitalization <14 days",
        environment: "Moderate damage, contained on-site",
        financial: "$1-10M or 5-10% revenue",
        reputation: "Regional media, stakeholder concern",
      },
      {
        score: 4,
        rating: "Major",
        safety: "Serious injury, hospitalization >14 days",
        environment: "Significant damage requiring major remediation",
        financial: "$10-50M or 10-20% revenue",
        reputation: "National media, regulatory action",
      },
      {
        score: 5,
        rating: "Catastrophic",
        safety: "Fatality or permanent disability",
        environment: "Severe widespread long-term damage",
        financial: ">$50M or >20% revenue",
        reputation: "International media, loss of license",
      },
    ],
  },

  thirdPartyCategories: [
    {
      id: "contract-mining",
      name: "Contract Mining Operations",
      typical: "Tier 1 mining contractors, regional mining contractors",
    },
    {
      id: "exploration-drilling",
      name: "Exploration Drilling",
      typical: "Diamond drilling contractors, RC drilling contractors",
    },
    {
      id: "equipment-maintenance",
      name: "Equipment Maintenance",
      typical: "OEM service providers, specialist maintenance contractors",
    },
    {
      id: "catering-camp",
      name: "Catering & Camp Management",
      typical: "Hospitality contractors, camp management companies",
    },
    {
      id: "security",
      name: "Security Services",
      typical: "Security firms, guarding companies",
    },
    {
      id: "transport-logistics",
      name: "Transport & Logistics",
      typical: "Trucking companies, shipping agents",
    },
    {
      id: "laboratory",
      name: "Laboratory & Assay",
      typical: "Commercial laboratories, specialist assay services",
    },
    {
      id: "environmental",
      name: "Environmental Services",
      typical: "Environmental consultants, rehabilitation contractors",
    },
    {
      id: "engineering-construction",
      name: "Engineering & Construction",
      typical: "EPCM contractors, civil contractors",
    },
    {
      id: "professional",
      name: "Professional Services",
      typical: "Consultants, legal firms, accounting firms",
    },
  ],
};
