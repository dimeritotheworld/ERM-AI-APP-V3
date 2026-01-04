/**
 * Public Sector - Industry Configuration
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.publicSector = ERM_TEMPLATES.publicSector || {};

ERM_TEMPLATES.publicSector.config = {
  industryId: "public-sector",
  industryName: "Public Sector",
  description: "Government agencies, municipalities, public services, and state-owned enterprises",

  subsectors: [
    { id: "federal", name: "Federal Government", keywords: ["federal", "national", "agency"] },
    { id: "state", name: "State/Provincial Government", keywords: ["state", "provincial", "regional"] },
    { id: "municipal", name: "Municipal/Local Government", keywords: ["municipal", "local", "city", "county"] },
    { id: "public-safety", name: "Public Safety Services", keywords: ["police", "fire", "emergency", "911"] },
    { id: "public-works", name: "Public Works", keywords: ["infrastructure", "roads", "water", "utilities"] },
    { id: "education", name: "Public Education", keywords: ["schools", "education", "district", "university"] },
    { id: "healthcare", name: "Public Healthcare", keywords: ["hospital", "clinic", "health department"] },
    { id: "social-services", name: "Social Services", keywords: ["welfare", "social", "benefits", "housing"] },
    { id: "transit", name: "Public Transit", keywords: ["transit", "bus", "rail", "transportation"] },
  ],

  characteristics: {
    regulatoryEnvironment: "heavy",
    stakeholderComplexity: "high",
    budgetConstraints: "high",
    politicalSensitivity: "high",
    transparencyRequirements: "high",
  },

  riskAppetite: {
    default: "low",
    byCategory: {
      "public-safety": "very-low",
      "financial-management": "low",
      "service-delivery": "moderate",
      "compliance": "very-low",
      "reputation": "low",
    },
  },

  impactScales: {
    financial: [
      { level: 1, label: "Minimal", description: "Less than $100K" },
      { level: 2, label: "Minor", description: "$100K - $1M" },
      { level: 3, label: "Moderate", description: "$1M - $10M" },
      { level: 4, label: "Major", description: "$10M - $50M" },
      { level: 5, label: "Severe", description: "Over $50M" },
    ],
    serviceImpact: [
      { level: 1, label: "Minimal", description: "No disruption to services" },
      { level: 2, label: "Minor", description: "Brief service delays" },
      { level: 3, label: "Moderate", description: "Partial service disruption" },
      { level: 4, label: "Major", description: "Significant service interruption" },
      { level: 5, label: "Severe", description: "Critical services unavailable" },
    ],
    publicTrust: [
      { level: 1, label: "Minimal", description: "No impact on public trust" },
      { level: 2, label: "Minor", description: "Limited local concern" },
      { level: 3, label: "Moderate", description: "Negative media coverage" },
      { level: 4, label: "Major", description: "Significant public outcry" },
      { level: 5, label: "Severe", description: "Loss of public confidence" },
    ],
  },

  likelihoodScales: [
    { level: 1, label: "Rare", description: "Less than 5% chance in next year" },
    { level: 2, label: "Unlikely", description: "5-20% chance in next year" },
    { level: 3, label: "Possible", description: "20-50% chance in next year" },
    { level: 4, label: "Likely", description: "50-80% chance in next year" },
    { level: 5, label: "Almost Certain", description: "Greater than 80% chance" },
  ],
};

console.log("Public Sector Configuration loaded");
