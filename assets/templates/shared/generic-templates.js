/**
 * Generic/Universal Industry Templates
 * For users who select "Other" industry
 * Dimeri ERM Template Library
 * ES5 Compatible
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.other = ERM_TEMPLATES.other || {};

ERM_TEMPLATES.other.config = {
  id: "other",
  name: "General / Other Industry",
  version: "1.0.0",
  description: "Universal risk templates applicable across all industries"
};

/* ========================================
   DEPARTMENTS (Universal)
   ======================================== */
ERM_TEMPLATES.other.departments = {
  universal: [
    { id: "executive", name: "Executive / Leadership", icon: "crown" },
    { id: "finance", name: "Finance", icon: "dollar-sign" },
    { id: "hr", name: "Human Resources", icon: "users" },
    { id: "it", name: "Information Technology", icon: "monitor" },
    { id: "operations", name: "Operations", icon: "settings" },
    { id: "legal", name: "Legal & Compliance", icon: "scale" },
    { id: "marketing", name: "Marketing & Sales", icon: "trending-up" },
    { id: "procurement", name: "Procurement / Supply Chain", icon: "package" }
  ],
  industrySpecific: []
};

/* ========================================
   CATEGORIES
   ======================================== */
ERM_TEMPLATES.other.categories = {
  executive: [
    { id: "strategic", name: "Strategic Risk", keywords: "strategy, growth, planning, vision, mission" },
    { id: "governance", name: "Governance Risk", keywords: "board, oversight, accountability, ethics" },
    { id: "reputation", name: "Reputational Risk", keywords: "brand, image, public relations, media" }
  ],
  finance: [
    { id: "financial-reporting", name: "Financial Reporting Risk", keywords: "reporting, accounts, audit, statements" },
    { id: "cash-flow", name: "Cash Flow Risk", keywords: "liquidity, cash, working capital, collections" },
    { id: "fraud", name: "Fraud Risk", keywords: "fraud, theft, embezzlement, corruption" }
  ],
  hr: [
    { id: "talent", name: "Talent & Retention Risk", keywords: "retention, turnover, recruitment, talent" },
    { id: "workplace-safety", name: "Workplace Safety Risk", keywords: "safety, injury, accident, health" },
    { id: "employment-law", name: "Employment Law Risk", keywords: "labor, employment, discrimination, harassment" }
  ],
  it: [
    { id: "cybersecurity", name: "Cybersecurity Risk", keywords: "cyber, hacking, breach, security" },
    { id: "data-privacy", name: "Data Privacy Risk", keywords: "privacy, GDPR, POPIA, personal data" },
    { id: "system-failure", name: "System Failure Risk", keywords: "downtime, outage, failure, availability" }
  ],
  operations: [
    { id: "operational", name: "Operational Risk", keywords: "operations, process, efficiency, productivity" },
    { id: "quality", name: "Quality Risk", keywords: "quality, defects, standards, customer satisfaction" },
    { id: "business-continuity", name: "Business Continuity Risk", keywords: "continuity, disaster, recovery, resilience" }
  ],
  legal: [
    { id: "compliance", name: "Compliance Risk", keywords: "compliance, regulation, laws, requirements" },
    { id: "contract", name: "Contract Risk", keywords: "contracts, agreements, obligations, disputes" },
    { id: "litigation", name: "Litigation Risk", keywords: "lawsuits, legal action, claims, disputes" }
  ],
  marketing: [
    { id: "market", name: "Market Risk", keywords: "market, competition, demand, pricing" },
    { id: "customer", name: "Customer Risk", keywords: "customers, clients, retention, satisfaction" }
  ],
  procurement: [
    { id: "supply-chain", name: "Supply Chain Risk", keywords: "suppliers, procurement, sourcing, vendors" },
    { id: "vendor", name: "Vendor Risk", keywords: "vendor, third-party, contractor, outsourcing" }
  ]
};

/* ========================================
   RISKS
   ======================================== */
ERM_TEMPLATES.other.risks = {
  // Strategic Risks
  "strategic": [
    {
      id: "strategy-execution",
      titles: ["Strategy Execution Failure", "Strategic Plan Not Achieved"],
      plainLanguage: ["Our strategic plans fail to be implemented", "We don't achieve our strategic goals"],
      descriptions: ["Risk that strategic initiatives fail to deliver intended outcomes due to poor execution, resource constraints, or changing market conditions."],
      rootCauses: [
        "Inadequate resource allocation",
        "Poor communication of strategy",
        "Lack of clear accountability",
        "Competing priorities",
        "Insufficient change management",
        "Market conditions change faster than strategy adapts"
      ],
      consequences: [
        "Failure to achieve business objectives",
        "Loss of competitive position",
        "Wasted resources on failed initiatives",
        "Stakeholder confidence erosion",
        "Missed market opportunities",
        "Financial underperformance"
      ],
      actionPlans: [
        "Establish clear strategic KPIs and milestones",
        "Assign accountable owners for each initiative",
        "Conduct quarterly strategy reviews",
        "Ensure adequate budget and resources",
        "Implement change management program"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    },
    {
      id: "competitive-threat",
      titles: ["Competitive Threat", "Loss of Market Position"],
      plainLanguage: ["Competitors are gaining on us", "We're losing market share"],
      descriptions: ["Risk of losing market position due to new entrants, competitor innovation, or failure to adapt to changing customer needs."],
      rootCauses: [
        "Failure to monitor competitive landscape",
        "Slow response to market changes",
        "Product/service innovation lag",
        "Pricing pressure from competitors",
        "Customer expectations not met"
      ],
      consequences: [
        "Loss of market share",
        "Reduced revenue and margins",
        "Customer attrition",
        "Pressure on pricing",
        "Difficulty attracting talent"
      ],
      actionPlans: [
        "Implement regular competitive analysis",
        "Invest in product/service innovation",
        "Strengthen customer relationships",
        "Monitor industry trends and disruption",
        "Develop differentiation strategy"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  // Governance Risks
  "governance": [
    {
      id: "governance-failure",
      titles: ["Governance Failure", "Weak Board Oversight"],
      plainLanguage: ["Board oversight is inadequate", "Decision-making processes are flawed"],
      descriptions: ["Risk of inadequate governance leading to poor decision-making, lack of accountability, or failure to identify and manage key risks."],
      rootCauses: [
        "Unclear roles and responsibilities",
        "Inadequate board expertise",
        "Poor information flow to board",
        "Conflicts of interest",
        "Insufficient meeting frequency"
      ],
      consequences: [
        "Poor strategic decisions",
        "Regulatory scrutiny",
        "Reputational damage",
        "Stakeholder loss of confidence",
        "Increased risk exposure"
      ],
      actionPlans: [
        "Define clear governance framework",
        "Conduct board skills assessment",
        "Improve board reporting quality",
        "Implement conflict of interest policy",
        "Regular governance reviews"
      ],
      scoring: { inherentLikelihood: 2, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  // Reputational Risks
  "reputation": [
    {
      id: "reputation-damage",
      titles: ["Reputational Damage", "Brand Damage"],
      plainLanguage: ["Our reputation is at risk", "Negative publicity could harm us"],
      descriptions: ["Risk of damage to organizational reputation through negative publicity, social media, or failure to meet stakeholder expectations."],
      rootCauses: [
        "Service or product failures",
        "Ethical lapses",
        "Poor crisis management",
        "Social media incidents",
        "Customer complaints",
        "Environmental or social issues"
      ],
      consequences: [
        "Loss of customer trust",
        "Revenue decline",
        "Difficulty attracting talent",
        "Increased scrutiny",
        "Share price impact",
        "Regulatory attention"
      ],
      actionPlans: [
        "Develop crisis communication plan",
        "Monitor social media and news",
        "Establish stakeholder engagement program",
        "Train spokespersons",
        "Define escalation procedures"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  // Financial Risks
  "financial-reporting": [
    {
      id: "financial-misstatement",
      titles: ["Financial Misstatement", "Inaccurate Financial Reporting"],
      plainLanguage: ["Our financial reports might be wrong", "Accounting errors could occur"],
      descriptions: ["Risk of material misstatement in financial reports due to errors, fraud, or inadequate controls."],
      rootCauses: [
        "Weak internal controls",
        "Complex accounting treatments",
        "Inadequate staff training",
        "Manual processes prone to error",
        "Pressure to meet targets"
      ],
      consequences: [
        "Regulatory penalties",
        "Audit qualifications",
        "Investor loss of confidence",
        "Restatement costs",
        "Management credibility damage"
      ],
      actionPlans: [
        "Strengthen internal controls",
        "Implement account reconciliation procedures",
        "Provide ongoing accounting training",
        "Automate key processes",
        "Conduct internal audit reviews"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "cash-flow": [
    {
      id: "liquidity-risk",
      titles: ["Liquidity Risk", "Cash Flow Shortage"],
      plainLanguage: ["We might run out of cash", "Cash flow could be insufficient"],
      descriptions: ["Risk of insufficient cash to meet operational needs or financial obligations."],
      rootCauses: [
        "Poor cash flow forecasting",
        "Delayed customer payments",
        "Unexpected expenses",
        "Revenue shortfalls",
        "Over-investment in assets"
      ],
      consequences: [
        "Inability to pay suppliers",
        "Missed debt payments",
        "Damaged supplier relationships",
        "Operational disruption",
        "Credit rating impact"
      ],
      actionPlans: [
        "Implement rolling cash flow forecasts",
        "Strengthen credit control",
        "Maintain cash reserves",
        "Negotiate credit facilities",
        "Monitor key cash metrics weekly"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "fraud": [
    {
      id: "fraud-risk",
      titles: ["Fraud Risk", "Financial Crime"],
      plainLanguage: ["Fraud could occur", "Employees or others might steal from us"],
      descriptions: ["Risk of intentional misappropriation of assets or manipulation of financial information."],
      rootCauses: [
        "Weak segregation of duties",
        "Inadequate authorization controls",
        "Poor oversight of high-risk areas",
        "Pressure on employees",
        "Rationalization of dishonest behavior"
      ],
      consequences: [
        "Financial losses",
        "Reputational damage",
        "Regulatory investigation",
        "Legal costs",
        "Employee morale impact"
      ],
      actionPlans: [
        "Implement segregation of duties",
        "Conduct fraud risk assessment",
        "Establish whistleblower hotline",
        "Perform background checks",
        "Regular fraud awareness training"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  // HR Risks
  "talent": [
    {
      id: "talent-retention",
      titles: ["Talent Retention Risk", "Key Person Dependency"],
      plainLanguage: ["We might lose key people", "Staff turnover is too high"],
      descriptions: ["Risk of losing key talent or high turnover impacting operational capability and institutional knowledge."],
      rootCauses: [
        "Non-competitive compensation",
        "Limited career progression",
        "Poor workplace culture",
        "Inadequate recognition",
        "Work-life balance issues"
      ],
      consequences: [
        "Loss of institutional knowledge",
        "Recruitment costs",
        "Productivity decline",
        "Project delays",
        "Customer service impact"
      ],
      actionPlans: [
        "Conduct compensation benchmarking",
        "Develop succession plans",
        "Implement employee engagement surveys",
        "Create career development programs",
        "Strengthen retention incentives"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 3, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "workplace-safety": [
    {
      id: "workplace-injury",
      titles: ["Workplace Injury", "Occupational Health and Safety"],
      plainLanguage: ["Employees could get hurt at work", "Safety incidents might occur"],
      descriptions: ["Risk of workplace injuries or illness due to unsafe conditions, practices, or behaviors."],
      rootCauses: [
        "Inadequate safety training",
        "Poor housekeeping",
        "Equipment not maintained",
        "Safety procedures not followed",
        "Inadequate PPE"
      ],
      consequences: [
        "Employee injury or illness",
        "Regulatory penalties",
        "Workers compensation costs",
        "Productivity loss",
        "Reputational damage"
      ],
      actionPlans: [
        "Conduct workplace hazard assessments",
        "Implement safety training programs",
        "Establish incident reporting system",
        "Ensure PPE availability and use",
        "Regular safety inspections"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "employment-law": [
    {
      id: "employment-compliance",
      titles: ["Employment Law Non-Compliance", "Labor Relations Risk"],
      plainLanguage: ["We might violate employment laws", "Employee disputes could arise"],
      descriptions: ["Risk of non-compliance with employment legislation leading to legal action or regulatory penalties."],
      rootCauses: [
        "Outdated HR policies",
        "Inadequate manager training",
        "Poor documentation practices",
        "Inconsistent treatment of employees",
        "Failure to keep up with law changes"
      ],
      consequences: [
        "Legal claims and settlements",
        "Regulatory fines",
        "Reputational damage",
        "Employee morale impact",
        "Union action"
      ],
      actionPlans: [
        "Review and update HR policies annually",
        "Train managers on employment law",
        "Maintain thorough documentation",
        "Establish grievance procedures",
        "Seek legal advice on complex matters"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 3, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  // IT Risks
  "cybersecurity": [
    {
      id: "cyber-attack",
      titles: ["Cyber Attack", "Cybersecurity Breach"],
      plainLanguage: ["Hackers could attack our systems", "We could be victim of cybercrime"],
      descriptions: ["Risk of unauthorized access to systems or data through cyber attacks, malware, or social engineering."],
      rootCauses: [
        "Outdated security software",
        "Weak password practices",
        "Phishing susceptibility",
        "Unpatched systems",
        "Inadequate access controls"
      ],
      consequences: [
        "Data breach",
        "Operational disruption",
        "Financial losses",
        "Regulatory penalties",
        "Reputational damage"
      ],
      actionPlans: [
        "Implement cybersecurity awareness training",
        "Deploy endpoint protection",
        "Conduct regular penetration testing",
        "Implement multi-factor authentication",
        "Establish incident response plan"
      ],
      scoring: { inherentLikelihood: 4, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "data-privacy": [
    {
      id: "data-breach",
      titles: ["Data Privacy Breach", "Personal Data Exposure"],
      plainLanguage: ["Personal data could be exposed", "We might violate privacy laws"],
      descriptions: ["Risk of unauthorized disclosure of personal or sensitive data leading to regulatory action and reputational harm."],
      rootCauses: [
        "Inadequate data protection controls",
        "Lack of data classification",
        "Employee negligence",
        "Third-party data handling",
        "Insufficient consent management"
      ],
      consequences: [
        "Regulatory fines (GDPR, POPIA)",
        "Legal claims from affected individuals",
        "Reputational damage",
        "Customer trust erosion",
        "Notification and remediation costs"
      ],
      actionPlans: [
        "Conduct data protection impact assessments",
        "Implement data classification policy",
        "Train staff on data handling",
        "Review third-party data processors",
        "Establish breach notification procedures"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "system-failure": [
    {
      id: "it-outage",
      titles: ["IT System Failure", "Critical System Outage"],
      plainLanguage: ["Our IT systems could go down", "Technology failures might disrupt operations"],
      descriptions: ["Risk of critical system failures causing operational disruption and business impact."],
      rootCauses: [
        "Aging infrastructure",
        "Inadequate backup systems",
        "Single points of failure",
        "Poor change management",
        "Insufficient capacity planning"
      ],
      consequences: [
        "Operational disruption",
        "Revenue loss",
        "Customer service impact",
        "Data loss",
        "Recovery costs"
      ],
      actionPlans: [
        "Implement system redundancy",
        "Establish backup and recovery procedures",
        "Conduct disaster recovery testing",
        "Monitor system health",
        "Maintain infrastructure upgrade roadmap"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  // Operational Risks
  "operational": [
    {
      id: "process-failure",
      titles: ["Process Failure", "Operational Inefficiency"],
      plainLanguage: ["Our processes might break down", "Operations could be inefficient"],
      descriptions: ["Risk of operational failures or inefficiencies impacting service delivery and costs."],
      rootCauses: [
        "Outdated processes",
        "Inadequate training",
        "Poor process documentation",
        "Lack of automation",
        "Resource constraints"
      ],
      consequences: [
        "Service delivery failures",
        "Increased costs",
        "Customer dissatisfaction",
        "Staff frustration",
        "Competitive disadvantage"
      ],
      actionPlans: [
        "Document and review key processes",
        "Identify automation opportunities",
        "Implement process metrics",
        "Conduct regular process reviews",
        "Train staff on procedures"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 3, residualLikelihood: 2, residualImpact: 2 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "quality": [
    {
      id: "quality-failure",
      titles: ["Quality Failure", "Product/Service Defects"],
      plainLanguage: ["Quality could slip", "Products/services might not meet standards"],
      descriptions: ["Risk of products or services failing to meet quality standards leading to customer complaints and costs."],
      rootCauses: [
        "Inadequate quality controls",
        "Supplier quality issues",
        "Training gaps",
        "Process variations",
        "Pressure to meet deadlines"
      ],
      consequences: [
        "Customer complaints",
        "Returns and rework costs",
        "Reputation damage",
        "Regulatory issues",
        "Lost business"
      ],
      actionPlans: [
        "Implement quality management system",
        "Establish quality metrics and targets",
        "Conduct regular quality audits",
        "Train staff on quality standards",
        "Monitor supplier quality"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 3, residualLikelihood: 2, residualImpact: 2 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "business-continuity": [
    {
      id: "business-disruption",
      titles: ["Business Disruption", "Business Continuity Failure"],
      plainLanguage: ["Operations could be disrupted", "We might not recover from a disaster"],
      descriptions: ["Risk of extended business disruption from disasters, pandemics, or other major incidents."],
      rootCauses: [
        "No business continuity plan",
        "Untested recovery procedures",
        "Single location dependency",
        "Key supplier dependency",
        "Inadequate insurance"
      ],
      consequences: [
        "Extended operational downtime",
        "Revenue loss",
        "Customer loss",
        "Reputational damage",
        "Recovery costs"
      ],
      actionPlans: [
        "Develop business continuity plan",
        "Conduct business impact analysis",
        "Test recovery procedures regularly",
        "Establish alternative work arrangements",
        "Review insurance coverage"
      ],
      scoring: { inherentLikelihood: 2, inherentImpact: 5, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  // Compliance Risks
  "compliance": [
    {
      id: "regulatory-non-compliance",
      titles: ["Regulatory Non-Compliance", "Compliance Failure"],
      plainLanguage: ["We might break regulations", "Compliance requirements might not be met"],
      descriptions: ["Risk of failing to comply with applicable laws and regulations leading to penalties and restrictions."],
      rootCauses: [
        "Lack of regulatory awareness",
        "Inadequate compliance resources",
        "Complex regulatory environment",
        "Poor compliance monitoring",
        "Rapid regulatory change"
      ],
      consequences: [
        "Regulatory fines and penalties",
        "License or permit revocation",
        "Operational restrictions",
        "Reputational damage",
        "Management liability"
      ],
      actionPlans: [
        "Maintain regulatory register",
        "Conduct compliance gap assessments",
        "Implement compliance monitoring",
        "Provide compliance training",
        "Engage with regulators proactively"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "contract": [
    {
      id: "contract-risk",
      titles: ["Contract Risk", "Contractual Non-Compliance"],
      plainLanguage: ["Contracts might not be honored", "Contractual obligations might be breached"],
      descriptions: ["Risk of contract disputes, breaches, or unfavorable terms impacting the organization."],
      rootCauses: [
        "Poor contract drafting",
        "Inadequate contract review",
        "Failure to monitor obligations",
        "Counterparty issues",
        "Ambiguous terms"
      ],
      consequences: [
        "Financial losses",
        "Legal disputes",
        "Relationship damage",
        "Operational disruption",
        "Reputation impact"
      ],
      actionPlans: [
        "Implement contract management system",
        "Establish contract review procedures",
        "Monitor contract milestones and obligations",
        "Conduct counterparty due diligence",
        "Seek legal review for significant contracts"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 3, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "litigation": [
    {
      id: "litigation-risk",
      titles: ["Litigation Risk", "Legal Claims"],
      plainLanguage: ["We might get sued", "Legal action could be taken against us"],
      descriptions: ["Risk of legal claims or litigation resulting in financial and reputational harm."],
      rootCauses: [
        "Contract disputes",
        "Employment matters",
        "Product liability",
        "Professional negligence",
        "Regulatory breaches"
      ],
      consequences: [
        "Legal costs",
        "Settlement payments",
        "Management time diversion",
        "Reputational damage",
        "Operational restrictions"
      ],
      actionPlans: [
        "Maintain appropriate insurance coverage",
        "Implement risk management procedures",
        "Document key decisions and actions",
        "Seek early legal advice on disputes",
        "Track and manage pending claims"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Transfer" }
    }
  ],

  // Market Risks
  "market": [
    {
      id: "market-risk",
      titles: ["Market Risk", "Demand Decline"],
      plainLanguage: ["Market conditions could change", "Demand for our products/services might fall"],
      descriptions: ["Risk of adverse market conditions or demand changes impacting revenue and profitability."],
      rootCauses: [
        "Economic downturn",
        "Changing customer preferences",
        "New competitors",
        "Industry disruption",
        "Pricing pressure"
      ],
      consequences: [
        "Revenue decline",
        "Margin compression",
        "Market share loss",
        "Asset impairment",
        "Workforce reductions"
      ],
      actionPlans: [
        "Monitor market trends and indicators",
        "Diversify customer base",
        "Develop flexible cost structure",
        "Maintain scenario plans",
        "Build customer relationships"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 3, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "customer": [
    {
      id: "customer-concentration",
      titles: ["Customer Concentration Risk", "Key Customer Loss"],
      plainLanguage: ["We depend too much on few customers", "Losing a big customer would hurt us"],
      descriptions: ["Risk of over-reliance on a small number of customers leading to revenue vulnerability."],
      rootCauses: [
        "Limited customer base",
        "High revenue concentration",
        "Weak customer relationships",
        "Competitor targeting",
        "Customer financial difficulties"
      ],
      consequences: [
        "Significant revenue loss",
        "Operational disruption",
        "Stranded capacity",
        "Profitability impact",
        "Cash flow issues"
      ],
      actionPlans: [
        "Diversify customer base",
        "Strengthen key customer relationships",
        "Monitor customer financial health",
        "Develop new market segments",
        "Improve customer value proposition"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  // Supply Chain Risks
  "supply-chain": [
    {
      id: "supply-disruption",
      titles: ["Supply Chain Disruption", "Supplier Failure"],
      plainLanguage: ["Suppliers might fail to deliver", "Supply chain could be disrupted"],
      descriptions: ["Risk of supply chain disruptions impacting ability to deliver products or services."],
      rootCauses: [
        "Single source suppliers",
        "Supplier financial instability",
        "Logistics disruptions",
        "Natural disasters",
        "Geopolitical events"
      ],
      consequences: [
        "Production disruption",
        "Revenue loss",
        "Customer dissatisfaction",
        "Increased costs",
        "Contract penalties"
      ],
      actionPlans: [
        "Identify and qualify alternative suppliers",
        "Monitor supplier financial health",
        "Build safety stock for critical items",
        "Develop supply chain contingency plans",
        "Establish supplier relationship programs"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
      treatment: { recommended: "Mitigate" }
    }
  ],

  "vendor": [
    {
      id: "vendor-management",
      titles: ["Vendor Management Risk", "Third-Party Risk"],
      plainLanguage: ["Vendors might underperform", "Third parties could cause problems"],
      descriptions: ["Risk of third-party vendors failing to meet contractual obligations or causing harm to the organization."],
      rootCauses: [
        "Inadequate vendor due diligence",
        "Poor contract terms",
        "Insufficient oversight",
        "Vendor capacity issues",
        "Misaligned incentives"
      ],
      consequences: [
        "Service quality issues",
        "Compliance failures",
        "Security breaches",
        "Operational disruption",
        "Reputational damage"
      ],
      actionPlans: [
        "Implement vendor assessment framework",
        "Establish vendor performance monitoring",
        "Include appropriate contract protections",
        "Conduct regular vendor reviews",
        "Maintain vendor risk register"
      ],
      scoring: { inherentLikelihood: 3, inherentImpact: 3, residualLikelihood: 2, residualImpact: 2 },
      treatment: { recommended: "Mitigate" }
    }
  ]
};

/* ========================================
   KEYWORDS FOR SEARCH
   ======================================== */
ERM_TEMPLATES.other.keywords = {
  commonRisks: [
    "Cybersecurity",
    "Data Privacy",
    "Financial Reporting",
    "Regulatory Compliance",
    "Business Continuity",
    "Talent Retention",
    "Reputation",
    "Strategic Execution",
    "Supply Chain",
    "Fraud"
  ],
  vocabulary: [
    { term: "cyber", mapsToCategory: "cybersecurity", weight: 9 },
    { term: "hack", mapsToCategory: "cybersecurity", weight: 9 },
    { term: "data breach", mapsToCategory: "data-privacy", weight: 9 },
    { term: "privacy", mapsToCategory: "data-privacy", weight: 8 },
    { term: "GDPR", mapsToCategory: "data-privacy", weight: 9 },
    { term: "POPIA", mapsToCategory: "data-privacy", weight: 9 },
    { term: "fraud", mapsToCategory: "fraud", weight: 9 },
    { term: "compliance", mapsToCategory: "compliance", weight: 8 },
    { term: "regulation", mapsToCategory: "compliance", weight: 7 },
    { term: "financial", mapsToCategory: "financial-reporting", weight: 7 },
    { term: "audit", mapsToCategory: "financial-reporting", weight: 7 },
    { term: "strategy", mapsToCategory: "strategic", weight: 8 },
    { term: "reputation", mapsToCategory: "reputation", weight: 8 },
    { term: "brand", mapsToCategory: "reputation", weight: 7 },
    { term: "supplier", mapsToCategory: "supply-chain", weight: 8 },
    { term: "vendor", mapsToCategory: "vendor", weight: 8 },
    { term: "safety", mapsToCategory: "workplace-safety", weight: 8 },
    { term: "injury", mapsToCategory: "workplace-safety", weight: 8 },
    { term: "talent", mapsToCategory: "talent", weight: 8 },
    { term: "retention", mapsToCategory: "talent", weight: 7 },
    { term: "quality", mapsToCategory: "quality", weight: 7 },
    { term: "continuity", mapsToCategory: "business-continuity", weight: 8 },
    { term: "disaster", mapsToCategory: "business-continuity", weight: 8 },
    { term: "IT", mapsToCategory: "system-failure", weight: 6 },
    { term: "system", mapsToCategory: "system-failure", weight: 5 },
    { term: "market", mapsToCategory: "market", weight: 7 },
    { term: "customer", mapsToCategory: "customer", weight: 7 },
    { term: "contract", mapsToCategory: "contract", weight: 7 },
    { term: "legal", mapsToCategory: "litigation", weight: 7 },
    { term: "lawsuit", mapsToCategory: "litigation", weight: 9 }
  ]
};

console.log("[Templates] Generic/Other industry templates loaded");
