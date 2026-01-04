/**
 * Healthcare & Medical Services - Industry Configuration
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 * Country-agnostic risk templates
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.healthcare = ERM_TEMPLATES.healthcare || {};
ERM_TEMPLATES.healthcare.risks = ERM_TEMPLATES.healthcare.risks || {};

ERM_TEMPLATES.healthcare.config = {
  id: "healthcare",
  name: "Healthcare & Medical Services",
  version: "1.0.0",

  subSectors: [
    {
      id: "acute-care",
      name: "Acute Care Hospitals",
      description:
        "Inpatient and emergency services including medical, surgical, and intensive care",
    },
    {
      id: "ambulatory",
      name: "Ambulatory & Outpatient Care",
      description:
        "Outpatient clinics, urgent care, day surgery centers, and specialist services",
    },
    {
      id: "long-term-care",
      name: "Long-Term & Aged Care",
      description:
        "Skilled nursing, assisted living, rehabilitation, and residential care facilities",
    },
    {
      id: "primary-care",
      name: "Primary Care Networks",
      description:
        "Community-based primary care, family medicine, and preventive health services",
    },
    {
      id: "diagnostic",
      name: "Diagnostic Services",
      description:
        "Laboratories, pathology, imaging centers, and diagnostic testing services",
    },
    {
      id: "pharmacy",
      name: "Pharmacy & Medication Services",
      description:
        "Hospital and community pharmacies, compounding, medication management programs",
    },
    {
      id: "mental-health",
      name: "Mental Health Services",
      description:
        "Psychiatric, behavioral health, and substance use treatment services",
    },
    {
      id: "home-care",
      name: "Home & Community Care",
      description:
        "Home health, hospice, community nursing, and remote monitoring services",
    },
  ],

  characteristics: {
    regulatoryEnvironment:
      "Heavily regulated across patient safety, clinical quality, licensing, privacy, labor standards, and facility safety. Requires ongoing accreditation, inspections, and incident reporting.",

    keyStakeholders: [
      "Patients and families",
      "Clinical staff and medical professionals",
      "Regulators and accreditation bodies",
      "Payers and insurers",
      "Community partners",
      "Suppliers and vendors",
      "Governing boards",
      "Emergency services",
      "Public health agencies",
      "Technology providers",
    ],

    outsourcingPattern:
      "Laboratory services, medical transcription, revenue cycle services, temporary clinical staffing, medical device maintenance, environmental services, catering, security services, IT hosting and support",

    riskAppetite: {
      safety: "LOW",
      clinical: "LOW",
      regulatory: "LOW",
      operational: "MEDIUM",
      financial: "MEDIUM",
      technology: "LOW",
      reputation: "LOW",
      growth: "MEDIUM",
    },

    criticalRiskAreas: [
      "Patient safety and avoidable harm",
      "Infection prevention and outbreak control",
      "Medication safety and controlled substances",
      "Clinical quality and diagnostic accuracy",
      "Workforce capacity and competency",
      "Privacy and health information security",
      "Emergency preparedness and continuity of care",
      "Medical equipment reliability",
      "Regulatory compliance and accreditation",
      "Financial sustainability and revenue integrity",
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
        "May result in lost opportunities or reduced access to care. Consider whether avoiding one risk creates new risks. Document the decision rationale for governance purposes.",
    },
    mitigate: {
      id: "mitigate",
      name: "Mitigate",
      definition:
        "Taking action to reduce the likelihood and/or consequences of the risk to an acceptable level. This is the most common treatment involving implementation of controls, procedures, or safeguards.",
      whenToUse:
        "Use when services must continue but risk levels are above appetite. Appropriate when effective controls exist and can be implemented at reasonable cost relative to risk reduction achieved.",
      considerations:
        "Requires ongoing monitoring to ensure controls remain effective. Consider layered controls with clinical, operational, and technology safeguards.",
    },
    transfer: {
      id: "transfer",
      name: "Transfer",
      definition:
        "Sharing the risk with another party through insurance, contracts, partnerships, or outsourcing. Transfer does not eliminate risk entirely - reputational and some legal risks typically cannot be transferred.",
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
        "Use when risk is within appetite, when cost of treatment exceeds benefit, or when risk is unavoidable. All acceptance should be documented and authorized.",
      considerations:
        "Requires explicit approval at appropriate authority level. Must establish monitoring to detect changes. Review acceptance decisions periodically.",
    },
    exploit: {
      id: "exploit",
      name: "Exploit",
      definition:
        "Taking action to increase exposure to the risk in order to capture potential upside opportunity. Common in strategic and service innovation risks where uncertainty can have positive outcomes.",
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
        safety: "No patient harm",
        clinical: "No measurable quality impact",
        financial: "<$100K or <1% revenue",
        reputation: "No external attention",
      },
      {
        score: 2,
        rating: "Minor",
        safety: "Minor or temporary harm",
        clinical: "Localized quality impact",
        financial: "$100K-1M or 1-5% revenue",
        reputation: "Local attention, contained",
      },
      {
        score: 3,
        rating: "Moderate",
        safety: "Serious temporary harm",
        clinical: "Sustained quality impact",
        financial: "$1-10M or 5-10% revenue",
        reputation: "Regional media, stakeholder concern",
      },
      {
        score: 4,
        rating: "Major",
        safety: "Permanent harm or multiple serious injuries",
        clinical: "Major quality failure",
        financial: "$10-50M or 10-20% revenue",
        reputation: "National media, regulatory action",
      },
      {
        score: 5,
        rating: "Catastrophic",
        safety: "Fatality or multiple fatalities",
        clinical: "Systemic quality breakdown",
        financial: ">$50M or >20% revenue",
        reputation: "International media, loss of license",
      },
    ],
  },

  thirdPartyCategories: [
    {
      id: "staffing",
      name: "Clinical Staffing Agencies",
      typical: "Travel nursing providers, locum tenens services, agency allied health",
    },
    {
      id: "laboratory",
      name: "Laboratory Services",
      typical: "Reference laboratories, pathology services, genetics testing",
    },
    {
      id: "medical-supplies",
      name: "Medical Supplies & Equipment",
      typical: "Disposables suppliers, implant vendors, device manufacturers",
    },
    {
      id: "pharmacy-services",
      name: "Pharmacy Services",
      typical: "Specialty pharmacy providers, compounding services, distribution",
    },
    {
      id: "it-services",
      name: "IT & Digital Health",
      typical: "EHR vendors, hosting providers, telehealth platforms, managed services",
    },
    {
      id: "revenue-cycle",
      name: "Revenue Cycle Services",
      typical: "Coding vendors, billing services, collections agencies",
    },
    {
      id: "facilities",
      name: "Facilities Services",
      typical: "Environmental services, maintenance contractors, food services",
    },
    {
      id: "transport",
      name: "Transport & Logistics",
      typical: "Ambulance providers, non-emergency transport, courier services",
    },
    {
      id: "security",
      name: "Security Services",
      typical: "Security contractors, access control providers",
    },
    {
      id: "professional",
      name: "Professional Services",
      typical: "Legal advisors, consultants, auditors, actuarial services",
    },
  ],
};

ERM_TEMPLATES.healthcare.risks.config = ERM_TEMPLATES.healthcare.config;
