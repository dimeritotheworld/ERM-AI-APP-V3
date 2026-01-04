/**
 * Mining Industry Control Templates
 * Comprehensive control library organized by risk categories
 *
 * @version 2.0.0
 * ES5 Compatible
 * ORGANIZED BY 9 RISK CATEGORIES: strategic, financial, operational, compliance, technology, hr, hse, reputational, project
 */

/* ========================================
   NAMESPACE SETUP
   ======================================== */

// Create namespace
if (!window.ERM) window.ERM = {};
if (!window.ERM_TEMPLATES) window.ERM_TEMPLATES = {};
if (!window.ERM_TEMPLATES.mining) window.ERM_TEMPLATES.mining = {};
if (!window.ERM_TEMPLATES.mining.controls) window.ERM_TEMPLATES.mining.controls = {};

/* ========================================
   CONTROL TEMPLATE STRUCTURE
   ========================================

   Each control template includes:

   AI Matching Properties:
   - id: unique identifier
   - titles[]: 5-10 name variations for AI matching
   - descriptions[]: 4-5 full descriptions for AI to suggest
   - plainLanguage[]: simple phrases users might type
   - keywords[]: keywords for NLP matching

   Form Field Defaults:
   - type: preventive|detective|corrective|directive
   - category: policy|manual|automated|physical|segregation|monitoring
   - owners.primary[]: list of primary owner options
   - owners.secondary[]: list of secondary owner options
   - effectiveness: default effectiveness rating
   - status: default status
   - frequency: how often control operates
   - department: mining department
   - controlCategory: mining control category

   Risk Linkage:
   - mitigatesRiskCategories[]: which risk categories this addresses
   - mitigatesRiskKeywords[]: risk keywords this control addresses

   ======================================== */

/* ========================================
   STRATEGIC CONTROLS
   Business strategy, market, reserve management
   ======================================== */

window.ERM_TEMPLATES.mining.controls.strategic = [
  {
    id: "strat-commodity-hedge",
    titles: [
      "Commodity Price Hedging Program",
      "Price Risk Management Strategy",
      "Commodity Derivatives Program",
      "Revenue Protection Hedging",
      "Metal Price Hedging Policy",
      "Commodity Forward Contracts",
      "Price Volatility Hedging",
      "Financial Hedging Program"
    ],
    descriptions: [
      "Formal commodity price hedging program using derivatives (futures, options, swaps) to protect revenue against adverse price movements. Program includes hedging policy, limits, and governance approvals.",
      "Systematic use of financial instruments to reduce exposure to commodity price volatility. Hedging strategy covers percentage of production, timeframes, and instruments permitted under board-approved policy.",
      "Active management of commodity price risk through forward sales, options, and collar strategies. Program provides revenue certainty while allowing participation in favorable price movements.",
      "Board-approved hedging framework establishing limits, instruments, counterparties, and approval authorities. Regular reporting to board on hedge positions, effectiveness, and market outlook.",
      "Risk management program utilizing commodity derivatives to stabilize cash flows and protect margins. Includes scenario analysis, stress testing, and monthly revaluation of hedge book."
    ],
    plainLanguage: [
      "Lock in prices to protect revenue",
      "Use hedges to manage price risk",
      "Protect against price drops",
      "Forward sell some production",
      "Manage commodity price exposure",
      "Hedge metal prices",
      "Use derivatives for price protection"
    ],
    keywords: ["hedge", "commodity", "price", "derivatives", "futures", "options", "forward", "revenue", "protection", "volatility", "swap", "metal", "market"],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Chief Financial Officer", "Treasury Manager", "Commercial Director", "Risk Manager"],
      secondary: ["Chief Executive Officer", "Board Risk Committee", "Finance Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "finance",
    controlCategory: "risk-management",
    mitigatesRiskCategories: ["strategic", "financial"],
    mitigatesRiskKeywords: ["commodity", "price", "volatility", "metal", "market", "revenue", "margin", "cycle", "downturn", "hedge"]
  },

  {
    id: "strat-reserve-replacement",
    titles: [
      "Reserve Replacement Program",
      "Exploration Investment Strategy",
      "Resource Replenishment Plan",
      "Mine Life Extension Program",
      "Brownfield Exploration Program",
      "Resource Conversion Strategy",
      "Ore Reserve Management",
      "Mineral Resource Development"
    ],
    descriptions: [
      "Systematic exploration and resource development program to replace depleted reserves and extend mine life. Includes annual exploration budget, drilling targets, and resource conversion milestones.",
      "Multi-year exploration strategy covering brownfield extensions and greenfield discoveries. Program funded at defined percentage of revenue to ensure continuous reserve replacement.",
      "Integrated resource management program tracking depletion rates, conversion success, and reserve replacement ratios. Board-monitored KPIs ensure adequate investment in future reserves.",
      "Exploration and evaluation program designed to discover and develop new ore bodies. Includes geological targeting, drilling campaigns, resource estimation, and feasibility studies.",
      "Strategic initiative to maintain and grow mineral reserves through systematic exploration, acquisition, and resource conversion. Annual reporting to board on reserve replacement performance."
    ],
    plainLanguage: [
      "Find new ore to replace what we mine",
      "Invest in exploration to grow reserves",
      "Extend mine life through drilling",
      "Convert resources to reserves",
      "Replace reserves we're depleting",
      "Find more ore bodies",
      "Keep exploring for new deposits"
    ],
    keywords: ["reserve", "exploration", "drilling", "resource", "mine life", "ore body", "discovery", "replacement", "JORC", "conversion", "geology"],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Chief Geologist", "Exploration Manager", "General Manager Geology", "Vice President Exploration"],
      secondary: ["Chief Operating Officer", "Mine Manager", "Technical Services Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "annual",
    department: "planning",
    controlCategory: "mine-design",
    mitigatesRiskCategories: ["strategic", "operational"],
    mitigatesRiskKeywords: ["reserve", "resource", "depletion", "exploration", "mine life", "ore body", "discovery", "replacement", "conversion"]
  },

  {
    id: "strat-production-forecast",
    titles: [
      "Production Guidance Framework",
      "Mine Planning and Forecasting",
      "Production Target Setting",
      "Annual Production Budget",
      "Life of Mine Planning",
      "Production Forecasting Process",
      "Mine Plan Review and Approval",
      "Production Scheduling Control"
    ],
    descriptions: [
      "Annual production planning process establishing realistic guidance based on reserve models, equipment capacity, and operating assumptions. Multi-level review ensures achievable targets.",
      "Integrated mine planning linking reserves, production rates, capital requirements, and operating costs. Plan reviewed quarterly and updated for actuals, with variance analysis.",
      "Formal process for setting and approving production forecasts incorporating geological, operational, and market factors. Board approval required for published guidance.",
      "Life of mine planning framework updated annually with detailed 5-year outlook and long-term strategic plan. Includes sensitivity analysis and contingency scenarios.",
      "Production planning governance requiring technical review, operational validation, and management approval before market disclosure. Variance triggers require explanation and remediation."
    ],
    plainLanguage: [
      "Plan our production realistically",
      "Set achievable production targets",
      "Create accurate mine plans",
      "Forecast production properly",
      "Make sure production goals are realistic",
      "Plan what we'll produce",
      "Review and approve production plans"
    ],
    keywords: ["production", "forecast", "guidance", "planning", "target", "budget", "schedule", "mine plan", "LOM", "variance"],
    type: "directive",
    category: "policy",
    owners: {
      primary: ["Chief Operating Officer", "Mine Manager", "Mine Planner", "General Manager Operations"],
      secondary: ["Chief Executive Officer", "Technical Services Manager", "Chief Geologist"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "annual",
    department: "planning",
    controlCategory: "scheduling",
    mitigatesRiskCategories: ["strategic", "operational", "financial"],
    mitigatesRiskKeywords: ["production", "forecast", "guidance", "target", "schedule", "plan", "variance", "achievement", "delivery"]
  },

  {
    id: "strat-market-diversification",
    titles: [
      "Market Diversification Strategy",
      "Customer Diversification Program",
      "Geographic Market Expansion",
      "Revenue Diversification Initiative",
      "Market Risk Diversification",
      "Customer Base Expansion",
      "Market Portfolio Management",
      "Revenue Stream Diversification"
    ],
    descriptions: [
      "Strategic market diversification to reduce dependence on single customers or geographic markets. Includes customer acquisition targets, geographic expansion plans, and concentration limit policies.",
      "Formal diversification program targeting multiple end markets and customer segments. Strategy balances concentration risk with relationship depth and margin optimization.",
      "Market expansion strategy reducing revenue concentration through new customer acquisition and geographic market development. Board-approved concentration limits trigger diversification actions.",
      "Revenue diversification framework establishing targets for customer mix, product mix, and geographic spread. Monthly monitoring of concentration metrics with quarterly strategy reviews.",
      "Strategic initiative to broaden market exposure and reduce single customer dependency. Includes business development resources, market entry analysis, and relationship management for key accounts."
    ],
    plainLanguage: [
      "Don't rely on one customer",
      "Diversify our customer base",
      "Expand into new markets",
      "Spread revenue across customers",
      "Reduce customer concentration",
      "Sell to more markets",
      "Build diverse customer portfolio"
    ],
    keywords: ["diversification", "market", "customer", "geographic", "concentration", "revenue", "expansion", "portfolio", "risk", "dependency"],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Chief Commercial Officer", "Sales Director", "Chief Executive Officer", "Business Development Manager"],
      secondary: ["Chief Operating Officer", "Marketing Manager", "Board"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "quarterly",
    department: "commercial",
    controlCategory: "strategy",
    mitigatesRiskCategories: ["strategic", "financial"],
    mitigatesRiskKeywords: ["customer", "concentration", "market", "dependency", "single customer", "revenue", "diversification", "exposure"]
  },

  {
    id: "strat-competitor-monitoring",
    titles: [
      "Competitive Intelligence Program",
      "Competitor Monitoring System",
      "Market Intelligence Gathering",
      "Competitive Analysis Framework",
      "Industry Benchmarking Program",
      "Competitor Tracking System",
      "Market Position Monitoring",
      "Competitive Landscape Analysis"
    ],
    descriptions: [
      "Systematic competitive intelligence program monitoring competitor activities, market positioning, pricing strategies, and new developments. Quarterly competitive analysis presented to executive team.",
      "Formal competitor monitoring process tracking industry developments, competitor announcements, technology advances, and market trends. Intelligence informs strategic planning and risk assessment.",
      "Market intelligence framework combining public filings, industry reports, site visits, and stakeholder feedback. Competitive insights integrated into business planning and strategy development.",
      "Competitive analysis program benchmarking performance, costs, technology, and practices against peer companies. Annual deep-dive reviews identify competitive advantages and vulnerabilities.",
      "Intelligence gathering system providing early warning of competitive threats including new entrants, technology disruption, and market shifts. Board receives quarterly competitive environment updates."
    ],
    plainLanguage: [
      "Watch what competitors are doing",
      "Monitor market competition",
      "Track competitor activities",
      "Analyze competitive threats",
      "Benchmark against peers",
      "Stay aware of competition",
      "Monitor industry changes"
    ],
    keywords: ["competitor", "competitive", "intelligence", "monitoring", "benchmarking", "market", "analysis", "industry", "peer", "threat"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["Strategy Manager", "Chief Executive Officer", "Commercial Director", "Market Analyst"],
      secondary: ["Board", "Executive Team", "Business Development Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "quarterly",
    department: "strategy",
    controlCategory: "market-analysis",
    mitigatesRiskCategories: ["strategic", "operational"],
    mitigatesRiskKeywords: ["competitor", "competitive", "market", "disruption", "technology", "new entrant", "substitution", "threat"]
  }
];

/* ========================================
   FINANCIAL CONTROLS
   Cash management, credit, budgeting, cost control
   ======================================== */

window.ERM_TEMPLATES.mining.controls.financial = [
  {
    id: "fin-cash-flow-forecast",
    titles: [
      "Cash Flow Forecasting System",
      "Liquidity Management Framework",
      "Treasury Forecasting Process",
      "Working Capital Planning",
      "Cash Position Monitoring",
      "Liquidity Planning Model",
      "Cash Projection Framework",
      "Treasury Cash Management"
    ],
    descriptions: [
      "Rolling 13-week cash flow forecast updated weekly, tracking expected cash inflows and outflows. Includes contingency scenarios and covenant compliance monitoring. Variance analysis triggers management review.",
      "Integrated treasury forecasting covering operating cash flows, capital expenditure, and financing activities. Daily cash positioning with weekly reforecasting and monthly reconciliation to actuals.",
      "Systematic cash flow planning process incorporating revenue forecasts, cost budgets, capital plans, and working capital movements. Board receives monthly cash flow reports with variance explanations.",
      "Liquidity management framework maintaining minimum cash balances and undrawn credit facilities. Automated alerts for low cash positions and covenant breach triggers.",
      "Treasury system providing real-time visibility of cash positions across all bank accounts and entities. Integrated with ERP for automatic cash flow projection updates."
    ],
    plainLanguage: [
      "Forecast cash needs weekly",
      "Monitor liquidity position",
      "Track cash in and out",
      "Plan working capital needs",
      "Ensure we have enough cash",
      "Predict cash shortfalls",
      "Manage treasury forecasts"
    ],
    keywords: ["cash", "liquidity", "treasury", "forecast", "working capital", "cash flow", "funding", "facilities", "covenant"],
    type: "detective",
    category: "automated",
    owners: {
      primary: ["Chief Financial Officer", "Treasury Manager", "Finance Manager", "Financial Controller"],
      secondary: ["Chief Executive Officer", "Board", "Finance Director"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "weekly",
    department: "finance",
    controlCategory: "financial-planning",
    mitigatesRiskCategories: ["financial", "strategic"],
    mitigatesRiskKeywords: ["liquidity", "cash flow", "cash", "working capital", "funding", "treasury", "facilities", "covenant", "shortfall"]
  },

  {
    id: "fin-credit-approval",
    titles: [
      "Customer Credit Approval Process",
      "Credit Risk Assessment Framework",
      "Trade Credit Management",
      "Customer Credit Limits",
      "Receivables Credit Control",
      "Credit Approval Authority Matrix",
      "Customer Financial Assessment",
      "Credit Risk Evaluation"
    ],
    descriptions: [
      "Formal credit approval process requiring financial analysis of customer creditworthiness before extending trade credit. Includes credit scoring, reference checks, and approval authority limits based on exposure amount.",
      "Credit risk framework establishing credit limits, payment terms, and security requirements for each customer. Annual credit review with interim reviews triggered by adverse information or payment delays.",
      "Multi-level credit approval authority matrix with board approval required for exposures exceeding defined thresholds. Credit committee reviews large exposures and concentrations monthly.",
      "Customer credit assessment process incorporating financial statements, credit reports, trade references, and payment history. Credit insurance or bank guarantees required for higher risk customers.",
      "Systematic credit risk management including credit application forms, financial analysis templates, and documented approval workflows. Credit limits enforced in sales order processing system."
    ],
    plainLanguage: [
      "Check customer creditworthiness before selling",
      "Set credit limits for customers",
      "Approve trade credit properly",
      "Assess customer financial health",
      "Manage customer payment risk",
      "Control receivables exposure",
      "Review customer credit regularly"
    ],
    keywords: ["credit", "customer", "receivables", "payment", "financial", "approval", "limit", "trade", "exposure", "assessment"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Credit Manager", "Chief Financial Officer", "Finance Manager", "Commercial Manager"],
      secondary: ["Sales Manager", "Financial Controller", "Chief Executive Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "triggered",
    department: "finance",
    controlCategory: "credit-management",
    mitigatesRiskCategories: ["financial", "operational"],
    mitigatesRiskKeywords: ["credit", "receivables", "bad debt", "customer", "payment", "default", "exposure", "concentration"]
  },

  {
    id: "fin-budget-variance",
    titles: [
      "Budget Variance Analysis",
      "Financial Performance Monitoring",
      "Budget vs Actual Review",
      "Cost Variance Reporting",
      "Financial Variance Tracking",
      "Budget Monitoring Process",
      "Performance to Budget Analysis",
      "Financial Results Review"
    ],
    descriptions: [
      "Monthly variance analysis comparing actual financial results to approved budget. Material variances require written explanation from responsible managers. Variance trends trigger corrective action plans.",
      "Systematic review of revenue, costs, capital expenditure, and cash flow against budget. Variance reports submitted to executive team and board with explanations for variances exceeding 10% or defined thresholds.",
      "Financial performance monitoring process identifying favorable and unfavorable budget variances. Includes root cause analysis, impact assessment, and forecast updates. Significant variances trigger immediate management review.",
      "Formal budget monitoring framework with monthly financial packs showing budget vs actual for all cost centers. Variance commentary required from each department head. Cumulative variance tracking identifies trends.",
      "Budget control process requiring variance explanations, corrective actions, and forecast revisions. Budget holders accountable for performance. Regular reforecasting process updates full-year outlook based on actuals and trends."
    ],
    plainLanguage: [
      "Compare actual spending to budget",
      "Track budget variances monthly",
      "Explain why we're over or under budget",
      "Monitor financial performance",
      "Review spending against plan",
      "Identify budget overruns",
      "Report on financial variances"
    ],
    keywords: ["budget", "variance", "actual", "performance", "monitoring", "forecast", "cost", "spend", "overrun", "tracking"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["Chief Financial Officer", "Financial Controller", "Finance Manager", "Management Accountant"],
      secondary: ["Department Heads", "Cost Center Managers", "Chief Executive Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "monthly",
    department: "finance",
    controlCategory: "financial-reporting",
    mitigatesRiskCategories: ["financial", "operational"],
    mitigatesRiskKeywords: ["budget", "cost", "overrun", "variance", "spending", "expense", "forecast", "financial", "performance"]
  },

  {
    id: "fin-debt-covenant-monitoring",
    titles: [
      "Debt Covenant Compliance Monitoring",
      "Loan Covenant Tracking System",
      "Financial Covenant Monitoring",
      "Debt Agreement Compliance",
      "Covenant Breach Prevention",
      "Lending Covenant Tracking",
      "Financial Ratio Monitoring",
      "Debt Compliance Framework"
    ],
    descriptions: [
      "Monthly monitoring of financial covenants in debt agreements including leverage ratios, interest cover, tangible net worth, and working capital requirements. Automated alerts when ratios approach covenant thresholds.",
      "Formal covenant tracking system calculating compliance metrics monthly with quarterly reporting to lenders. Early warning triggers at 90% of covenant limits prompt management action.",
      "Debt covenant management framework with defined calculation methodologies, monthly compliance certification, and board reporting. Covenant breaches escalated immediately with waiver negotiations if required.",
      "Systematic financial covenant monitoring integrated with management accounts. Includes sensitivity analysis showing covenant headroom under adverse scenarios. Quarterly lender reporting demonstrates compliance.",
      "Covenant compliance program with monthly calculations, independent verification, and documented sign-off. Material covenant risks flagged in board reports with mitigation strategies."
    ],
    plainLanguage: [
      "Monitor loan agreement compliance",
      "Track debt covenants",
      "Ensure we meet lender requirements",
      "Check financial ratios monthly",
      "Avoid covenant breaches",
      "Monitor lending limits",
      "Track debt agreement terms"
    ],
    keywords: ["covenant", "debt", "lender", "compliance", "ratio", "leverage", "interest cover", "loan", "breach", "monitoring"],
    type: "detective",
    category: "automated",
    owners: {
      primary: ["Chief Financial Officer", "Financial Controller", "Treasury Manager", "Finance Manager"],
      secondary: ["Chief Executive Officer", "Board", "Finance Director"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "monthly",
    department: "finance",
    controlCategory: "debt-management",
    mitigatesRiskCategories: ["financial", "strategic"],
    mitigatesRiskKeywords: ["covenant", "breach", "debt", "lender", "default", "loan", "leverage", "compliance", "facility"]
  },

  {
    id: "fin-insurance-coverage",
    titles: [
      "Insurance Coverage Review",
      "Risk Insurance Program",
      "Insurance Policy Management",
      "Coverage Adequacy Assessment",
      "Insurance Portfolio Review",
      "Risk Transfer Program",
      "Insurance Compliance Monitoring",
      "Policy Coverage Verification"
    ],
    descriptions: [
      "Annual insurance coverage review assessing adequacy of property, liability, business interruption, and specialty coverages. Independent broker review of coverage gaps and market benchmarking.",
      "Comprehensive insurance program covering insurable risks including property damage, general liability, professional indemnity, directors and officers, and cyber. Annual policy renewal with coverage assessment.",
      "Insurance risk transfer framework with defined coverage levels, deductibles, and policy terms. Annual review by risk committee ensures coverage aligns with risk appetite and asset values.",
      "Systematic insurance management including policy register, renewal calendar, claims tracking, and coverage verification. Material changes to operations trigger insurance review.",
      "Risk insurance program with annual broker tender process ensuring competitive terms. Coverage includes property all risks, business interruption, public liability, and environmental impairment."
    ],
    plainLanguage: [
      "Review insurance coverage annually",
      "Ensure adequate insurance",
      "Manage insurance policies",
      "Check we're properly insured",
      "Transfer risk through insurance",
      "Verify insurance is sufficient",
      "Maintain insurance program"
    ],
    keywords: ["insurance", "coverage", "policy", "risk transfer", "liability", "property", "business interruption", "claim", "premium", "broker"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Risk Manager", "Chief Financial Officer", "Insurance Manager", "General Counsel"],
      secondary: ["Chief Executive Officer", "Board Risk Committee", "Finance Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "annual",
    department: "finance",
    controlCategory: "risk-management",
    mitigatesRiskCategories: ["financial", "operational"],
    mitigatesRiskKeywords: ["insurance", "uninsured", "coverage", "loss", "damage", "liability", "claim", "financial loss", "catastrophic"]
  },

  {
    id: "fin-fx-risk-management",
    titles: [
      "Foreign Exchange Risk Management",
      "Currency Hedging Program",
      "FX Exposure Management",
      "Currency Risk Hedging",
      "Foreign Exchange Policy",
      "Currency Hedging Strategy",
      "FX Risk Monitoring",
      "Exchange Rate Risk Control"
    ],
    descriptions: [
      "Foreign exchange risk management program identifying currency exposures and implementing hedging strategies. Policy defines hedging instruments, limits, and approval authorities.",
      "Formal FX hedging framework covering transaction risk, translation risk, and economic exposure. Monthly exposure reporting with quarterly hedge effectiveness testing.",
      "Currency risk management policy requiring hedging of committed foreign currency cash flows. Treasury executes forward contracts, options, and swaps within board-approved limits.",
      "Systematic FX exposure monitoring with monthly reporting of net currency positions. Hedging program covers export revenues, import costs, and foreign currency debt.",
      "Foreign exchange governance framework with defined hedging ratios, tenor limits, and counterparty restrictions. Regular reporting demonstrates hedge effectiveness and policy compliance."
    ],
    plainLanguage: [
      "Manage currency risk",
      "Hedge foreign exchange exposure",
      "Protect against currency movements",
      "Manage FX risk",
      "Hedge currency positions",
      "Control exchange rate risk",
      "Manage foreign currency exposure"
    ],
    keywords: ["foreign exchange", "FX", "currency", "hedging", "exposure", "exchange rate", "translation", "transaction", "hedge", "forex"],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Chief Financial Officer", "Treasury Manager", "Finance Director", "Risk Manager"],
      secondary: ["Chief Executive Officer", "Board", "Commercial Director"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "monthly",
    department: "finance",
    controlCategory: "risk-management",
    mitigatesRiskCategories: ["financial", "strategic"],
    mitigatesRiskKeywords: ["currency", "foreign exchange", "FX", "exchange rate", "translation", "devaluation", "forex", "hedge"]
  },

  {
    id: "fin-financial-reporting",
    titles: [
      "Financial Reporting Controls",
      "External Financial Reporting",
      "Statutory Reporting Framework",
      "Financial Statement Controls",
      "Accounting Policy Framework",
      "Financial Disclosure Controls",
      "IFRS Compliance Framework",
      "Financial Reporting Governance"
    ],
    descriptions: [
      "Formal financial reporting process with documented accounting policies, multi-level review, and external audit. Quarterly and annual financial statements comply with IFRS and listing requirements.",
      "Financial reporting framework ensuring accurate and timely preparation of statutory accounts, management reports, and regulatory filings. Internal controls over financial reporting documented and tested.",
      "Systematic financial close process with month-end procedures, reconciliations, journal entry approvals, and financial statement review. CFO certification of accuracy and completeness.",
      "External reporting governance with audit committee oversight, external auditor engagement, and disclosure committee review. Material accounting judgments escalated to board.",
      "Financial reporting compliance framework covering accounting standards, regulatory requirements, and stock exchange disclosure rules. Annual SOX compliance testing if applicable."
    ],
    plainLanguage: [
      "Prepare accurate financial reports",
      "Comply with accounting standards",
      "Report financials correctly",
      "Ensure financial statements are accurate",
      "Meet reporting obligations",
      "Control financial reporting",
      "Prepare audited accounts"
    ],
    keywords: ["financial reporting", "IFRS", "accounting", "audit", "financial statements", "disclosure", "statutory", "compliance", "SOX", "accounts"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["Chief Financial Officer", "Financial Controller", "Finance Director", "Group Accountant"],
      secondary: ["Chief Executive Officer", "Audit Committee", "External Auditor"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "monthly",
    department: "finance",
    controlCategory: "financial-reporting",
    mitigatesRiskCategories: ["financial", "compliance", "reputational"],
    mitigatesRiskKeywords: ["financial reporting", "misstatement", "error", "accounting", "compliance", "audit", "disclosure", "financial statements"]
  }
];

/* ========================================
   OPERATIONAL CONTROLS
   Production, equipment, maintenance, operations
   ======================================== */

window.ERM_TEMPLATES.mining.controls.operational = [
  {
    id: "ops-drill-pattern-approval",
    titles: [
      "Drill Pattern Design Approval",
      "Blast Hole Pattern Review",
      "Drilling Plan Authorization",
      "Blast Design Technical Review",
      "Drill Pattern Verification",
      "Blast Hole Layout Approval",
      "Drilling Pattern Control",
      "Technical Blast Design Review"
    ],
    descriptions: [
      "All blast hole patterns require technical approval before drilling commences. Review includes hole spacing, burden, depth, diameter, and geological considerations. Approved patterns documented and filed.",
      "Multi-level approval process for drill patterns with technical review by mine engineer and final approval by mining manager. Pattern considers rock mass conditions, fragmentation objectives, and safety exclusion zones.",
      "Formal drill pattern approval workflow incorporating geotechnical assessment, explosive load calculations, and vibration predictions. Patterns peer-reviewed before implementation.",
      "Technical evaluation of proposed blast patterns including burden-spacing ratios, powder factors, hole angles, and initiation sequences. Approval sign-off required in daily blast records.",
      "Systematic blast design control requiring engineering calculations, safety assessments, and management authorization. Design considers community impacts, structural protection, and fragmentation targets."
    ],
    plainLanguage: [
      "Approve drill patterns before drilling",
      "Review blast hole designs",
      "Check drilling plans are safe",
      "Get blast patterns approved",
      "Verify drill spacing is correct",
      "Sign off on blast designs",
      "Review drill hole layouts"
    ],
    keywords: ["drill", "pattern", "blast", "design", "spacing", "burden", "approval", "hole", "drilling", "review"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Mine Engineer", "Mining Manager", "Senior Mining Engineer", "Blast Engineer"],
      secondary: ["Mine Manager", "Technical Services Manager", "Chief Operating Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "triggered",
    department: "operations",
    controlCategory: "drilling",
    mitigatesRiskCategories: ["hse", "operational"],
    mitigatesRiskKeywords: ["blast", "explosion", "flyrock", "vibration", "damage", "community", "property damage", "overpressure", "fragmentation"]
  },

  {
    id: "ops-blast-clearance",
    titles: [
      "Blast Area Clearance Procedure",
      "Pre-Blast Safety Clearance",
      "Blast Zone Evacuation Process",
      "Blast Area Inspection Protocol",
      "Exclusion Zone Clearance",
      "Blast Safety Clearance Check",
      "Personnel Evacuation Before Blast",
      "All-Clear Verification Process"
    ],
    descriptions: [
      "Comprehensive area clearance before blast initiation. Includes personnel evacuation, equipment withdrawal, perimeter establishment, visual inspection, radio communication, and all-clear verification from blast supervisor.",
      "Systematic pre-blast clearance requiring visual inspection of entire exclusion zone, removal of all personnel and equipment, establishment of safety perimeter with signage, and documented all-clear from multiple checkpoints.",
      "Multi-step blast clearance protocol with checklist verification. Includes siren warnings, radio announcements, physical area sweeps, guard posting at access points, and final authorization from blast controller.",
      "Blast safety procedure requiring confirmed clearance from each sector of the exclusion zone before firing. Area remains restricted until post-blast inspection confirms safety for re-entry.",
      "Formal blast clearance process with defined exclusion zones, evacuation procedures, communication protocols, and sign-off requirements. Non-compliance results in blast postponement."
    ],
    plainLanguage: [
      "Clear people from blast area",
      "Evacuate before blasting",
      "Check area is clear before firing",
      "Get all-clear before blast",
      "Make sure everyone is out",
      "Inspect blast zone is empty",
      "Confirm area clearance"
    ],
    keywords: ["blast", "clearance", "evacuation", "safety", "area", "personnel", "all-clear", "exclusion", "zone", "inspection"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Blast Supervisor", "Shot Firer", "Blast Controller", "Senior Shot Firer"],
      secondary: ["Mine Manager", "Safety Manager", "Operations Superintendent"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "triggered",
    department: "operations",
    controlCategory: "blasting",
    mitigatesRiskCategories: ["hse", "operational"],
    mitigatesRiskKeywords: ["fatality", "fatal", "injury", "blast", "flyrock", "explosion", "personnel", "critical control", "death"]
  },

  {
    id: "ops-haul-road-inspection",
    titles: [
      "Haul Road Daily Inspection",
      "Mine Road Condition Check",
      "Haul Road Safety Inspection",
      "Ramp and Road Assessment",
      "Road Maintenance Inspection",
      "Haul Road Defect Check",
      "Mine Access Road Review",
      "Road Surface Inspection"
    ],
    descriptions: [
      "Daily inspection of haul roads and ramps before shift commencement. Checks road surface condition, width, gradient, drainage, berm height, visibility, and signage. Defects recorded and rectified before use.",
      "Pre-shift haul road inspection covering surface integrity, berm condition, drainage effectiveness, windrow placement, signage visibility, and intersection safety. Failed sections isolated until repairs completed.",
      "Systematic road inspection program with documented checklists. Covers pavement condition, potholes, corrugations, loose material, water ponding, berm height adequacy, and rollover protection. Deficiencies trigger maintenance work orders.",
      "Formal haul road assessment process identifying hazards and defects. Inspection includes width verification, grade checking, visibility assessment, and traffic management effectiveness. Critical defects result in road closure.",
      "Daily road condition monitoring by supervisors using inspection app or checklist. Results logged in system with photos of defects. Maintenance crew assigned to rectify deficiencies before traffic permitted."
    ],
    plainLanguage: [
      "Inspect haul roads daily",
      "Check roads are safe to use",
      "Look for road defects",
      "Verify berm heights are good",
      "Ensure roads are maintained",
      "Check for potholes and issues",
      "Inspect ramps before use"
    ],
    keywords: ["haul road", "inspection", "ramp", "surface", "berm", "safety", "maintenance", "road", "defect", "condition"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["Pit Supervisor", "Mine Supervisor", "Shift Supervisor", "Operations Foreman"],
      secondary: ["Mine Manager", "Road Maintenance Supervisor", "Safety Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "daily",
    department: "operations",
    controlCategory: "hauling",
    mitigatesRiskCategories: ["hse", "operational"],
    mitigatesRiskKeywords: ["vehicle", "collision", "rollover", "fatality", "fatal", "light vehicle interaction", "accident", "road", "haul truck"]
  },

  {
    id: "ops-truck-pre-start",
    titles: [
      "Haul Truck Pre-Start Inspection",
      "Mobile Equipment Pre-Op Check",
      "Truck Operator Daily Inspection",
      "Vehicle Pre-Start Checklist",
      "Equipment Pre-Use Inspection",
      "Operator Pre-Shift Check",
      "Mobile Plant Pre-Start",
      "Truck Condition Verification"
    ],
    descriptions: [
      "Operator pre-start inspection of haul trucks covering brakes, steering, lights, horns, fire suppression, tires, fluid levels, and cab condition. Defects logged in maintenance system. Failed equipment quarantined.",
      "Mandatory pre-operational check before operating mobile equipment. Systematic inspection following checklist covering all safety-critical components. Equipment tagged out if defects affect safe operation.",
      "Daily pre-start inspection by operators using electronic or paper checklist. Covers service brakes, park brake, steering, lights, mirrors, fire extinguisher, seatbelt, horn, and hydraulics. Digital sign-off required.",
      "Formal pre-use inspection protocol requiring operator walkround and functional checks before equipment use. Defects classified as operate/operate with caution/do not operate. Maintenance notified of all defects.",
      "Systematic pre-start inspection program with operator accountability for equipment condition. Training provided on inspection standards. Supervision spot-checks verify inspections completed correctly."
    ],
    plainLanguage: [
      "Check truck before driving",
      "Do pre-start inspection",
      "Inspect equipment before use",
      "Verify truck is safe to operate",
      "Complete operator checks",
      "Check brakes and lights work",
      "Inspect mobile equipment daily"
    ],
    keywords: ["truck", "pre-start", "inspection", "equipment", "defect", "maintenance", "operator", "check", "mobile", "vehicle"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Haul Truck Operator", "Equipment Operator", "Mobile Equipment Operator", "Truck Driver"],
      secondary: ["Shift Supervisor", "Maintenance Supervisor", "Operations Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "shift",
    department: "operations",
    controlCategory: "hauling",
    mitigatesRiskCategories: ["hse", "operational"],
    mitigatesRiskKeywords: ["vehicle", "failure", "brake", "fire", "collision", "breakdown", "defect", "equipment failure", "fatality", "maintenance"]
  },

  {
    id: "ops-preventive-maintenance",
    titles: [
      "Preventive Maintenance Schedule",
      "Planned Maintenance Program",
      "Time-Based Maintenance Schedule",
      "Equipment PM Program",
      "Routine Maintenance Schedule",
      "Scheduled Servicing Program",
      "Preventive Maintenance System",
      "Equipment Service Schedule"
    ],
    descriptions: [
      "Time-based and hour-based preventive maintenance schedule for mobile equipment. Automated work order generation from equipment hours. Includes inspections, servicing, and component replacement.",
      "Formal PM program with defined service intervals based on OEM recommendations and site operating conditions. Equipment tracked in CMMS with automated scheduling. Overdue PMs prevent equipment dispatch.",
      "Systematic preventive maintenance covering daily inspections, weekly services, monthly checks, and major overhauls. Service tasks documented in standard job plans. Completion verified before equipment release.",
      "Equipment reliability program utilizing preventive maintenance to reduce failures. PM compliance tracked as KPI. Root cause analysis performed when equipment fails before next PM due.",
      "Maintenance planning system scheduling PMs based on operating hours, calendar time, or usage triggers. Parts pre-kitted for scheduled services. PM backlog monitored and managed to maintain schedule compliance."
    ],
    plainLanguage: [
      "Service equipment regularly",
      "Do scheduled maintenance",
      "Follow PM schedule",
      "Maintain equipment on time",
      "Complete routine servicing",
      "Keep up with maintenance plan",
      "Service machines as scheduled"
    ],
    keywords: ["preventive", "maintenance", "schedule", "PM", "service", "equipment", "routine", "planned", "inspection", "reliability"],
    type: "preventive",
    category: "automated",
    owners: {
      primary: ["Maintenance Planner", "Maintenance Manager", "Maintenance Superintendent", "Reliability Engineer"],
      secondary: ["Chief Operating Officer", "Engineering Manager", "Maintenance Coordinator"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "maintenance",
    controlCategory: "preventive",
    mitigatesRiskCategories: ["operational", "financial"],
    mitigatesRiskKeywords: ["equipment failure", "breakdown", "unplanned downtime", "reliability", "maintenance", "production loss", "availability"]
  },

  {
    id: "ops-production-reporting",
    titles: [
      "Production Reporting System",
      "Daily Production Reconciliation",
      "Production Metrics Tracking",
      "Operations Performance Reporting",
      "Production Data Management",
      "Shift Production Reporting",
      "Output Tracking System",
      "Production KPI Monitoring"
    ],
    descriptions: [
      "Daily production reporting system capturing tonnes mined, tonnes milled, grade, recovery, and equipment utilization. Automated data collection from mine management system with manual verification.",
      "Formal production reconciliation process comparing survey measurements, truck counts, and process plant meters. Variances investigated and explained. Monthly reconciliation to reserves model.",
      "Production metrics framework tracking key performance indicators including productivity, utilization, availability, and quality. Daily reports to operations management with weekly trends.",
      "Systematic production data management with standardized definitions, automated calculations, and quality checks. Production database provides single source of truth for reporting.",
      "Shift-based production reporting with supervisor sign-off. Data feeds financial systems, mine planning software, and executive dashboards. Accuracy verified through periodic audits."
    ],
    plainLanguage: [
      "Report production daily",
      "Track what we produce",
      "Monitor production metrics",
      "Reconcile production data",
      "Measure daily output",
      "Track production performance",
      "Report shift production"
    ],
    keywords: ["production", "reporting", "metrics", "reconciliation", "KPI", "tonnes", "output", "performance", "tracking", "data"],
    type: "detective",
    category: "automated",
    owners: {
      primary: ["Mine Manager", "Operations Manager", "Production Superintendent", "Shift Supervisor"],
      secondary: ["Chief Operating Officer", "Mine Planner", "Metallurgist"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "daily",
    department: "operations",
    controlCategory: "reporting",
    mitigatesRiskCategories: ["operational", "financial"],
    mitigatesRiskKeywords: ["production", "reporting", "data", "accuracy", "reconciliation", "performance", "metrics", "variance"]
  },

  {
    id: "ops-grade-control",
    titles: [
      "Grade Control Program",
      "Ore Grade Management",
      "Blast Hole Sampling",
      "Grade Control Drilling",
      "Ore Definition Process",
      "Grade Control Modeling",
      "Ore-Waste Definition",
      "Production Geology"
    ],
    descriptions: [
      "Systematic grade control program using close-spaced drilling and sampling to define ore boundaries. Blast hole samples analyzed and modeled before mining. Grade control plans updated daily.",
      "Formal ore-waste definition process with defined grade cut-offs, geological logging, and assay analysis. Grade control geologist marks ore boundaries for mining execution.",
      "Grade control drilling program with defined grid spacing, sample collection protocols, and rapid assay turnaround. Results modeled to optimize ore recovery and minimize dilution.",
      "Production geology framework integrating geological mapping, face sampling, and blast hole assays. Grade control model reconciled monthly against mill head grade.",
      "Ore definition process using grade control drilling, geological interpretation, and geostatistical modeling. Mining follows approved grade control plans minimizing ore loss and dilution."
    ],
    plainLanguage: [
      "Control ore grade",
      "Sample to find ore boundaries",
      "Drill to define ore",
      "Manage ore-waste contact",
      "Ensure we mine ore not waste",
      "Sample blast holes",
      "Define ore for mining"
    ],
    keywords: ["grade control", "ore", "assay", "sampling", "blast hole", "geology", "waste", "dilution", "recovery", "grade"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Grade Control Geologist", "Production Geologist", "Mine Geologist", "Chief Geologist"],
      secondary: ["Mine Manager", "Mine Planner", "Metallurgist"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "daily",
    department: "geology",
    controlCategory: "grade-control",
    mitigatesRiskCategories: ["operational", "financial"],
    mitigatesRiskKeywords: ["grade", "dilution", "ore loss", "recovery", "metallurgical", "production", "ore", "waste"]
  }
];

/* ========================================
   COMPLIANCE CONTROLS
   Regulatory, permits, legal, reporting
   ======================================== */

window.ERM_TEMPLATES.mining.controls.compliance = [
  {
    id: "comp-permit-register",
    titles: [
      "Permit and License Register",
      "Regulatory Approvals Register",
      "License Compliance Tracking",
      "Permit Management System",
      "Approvals and Permits Register",
      "Environmental Permit Tracker",
      "Mining License Register",
      "Regulatory Consent Register"
    ],
    descriptions: [
      "Comprehensive register of all mining permits, licenses, and approvals. Includes expiry dates, renewal triggers, condition tracking, and compliance status. Monthly review of upcoming renewals.",
      "Centralized permit register tracking mining leases, environmental licenses, water permits, explosives licenses, and regulatory approvals. Automated alerts for renewals due within 90 days.",
      "Permit management system documenting all regulatory authorizations with conditions, obligations, reporting requirements, and renewal dates. Responsibility assigned for each permit with escalation for non-compliance.",
      "Formal permit tracking process with register updated for new approvals, amendments, and renewals. Monthly compliance review confirms all conditions met and reporting obligations fulfilled.",
      "Regulatory approvals database linking permits to physical locations and activities. Geospatial mapping shows permit coverage. System prevents activities in areas lacking required approvals."
    ],
    plainLanguage: [
      "Track all permits and licenses",
      "Monitor permit expiry dates",
      "Manage regulatory approvals",
      "Keep permit register updated",
      "Renew licenses on time",
      "Track mining approvals",
      "Register environmental permits"
    ],
    keywords: ["permit", "license", "register", "approval", "renewal", "expiry", "compliance", "regulatory", "authorization", "tracking"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["Compliance Officer", "Regulatory Affairs Manager", "Environmental Manager", "Legal Counsel"],
      secondary: ["General Manager", "Chief Operating Officer", "Company Secretary"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "monthly",
    department: "compliance",
    controlCategory: "permits",
    mitigatesRiskCategories: ["compliance", "operational", "reputational"],
    mitigatesRiskKeywords: ["permit", "license", "breach", "regulatory", "approval", "expiry", "renewal", "non-compliance", "shutdown"]
  },

  {
    id: "comp-regulatory-reporting",
    titles: [
      "Regulatory Reporting Schedule",
      "Compliance Reporting Calendar",
      "Statutory Reporting Program",
      "Regulatory Submission Tracker",
      "Mandatory Reporting System",
      "Government Reporting Schedule",
      "Compliance Returns Calendar",
      "Regulatory Filing Program"
    ],
    descriptions: [
      "Calendar of all regulatory reporting obligations including environmental returns, production reports, safety statistics, and financial disclosures. Automated reminders and submission tracking.",
      "Comprehensive reporting schedule documenting all submissions required to regulators, government agencies, and statutory bodies. Includes submission deadlines, responsible parties, and approval workflows.",
      "Formal regulatory reporting program with annual calendar showing all compliance reports, returns, and filings. Progress tracked monthly with escalation for at-risk submissions.",
      "Compliance reporting system generating automated reminders 60/30/14 days before deadlines. Templates and procedures documented for each report. Submission evidence filed and tracked.",
      "Regulatory obligations register linking reporting requirements to source legislation, submission frequency, and accountable manager. Board receives quarterly compliance reporting update."
    ],
    plainLanguage: [
      "Submit regulatory reports on time",
      "Track compliance deadlines",
      "Meet reporting obligations",
      "File government returns",
      "Complete mandatory reporting",
      "Submit required reports",
      "Track regulatory submissions"
    ],
    keywords: ["reporting", "regulatory", "submission", "deadline", "return", "statistics", "compliance", "filing", "government", "statutory"],
    type: "directive",
    category: "automated",
    owners: {
      primary: ["Regulatory Affairs Manager", "Compliance Officer", "Company Secretary", "Legal Counsel"],
      secondary: ["Chief Financial Officer", "Chief Operating Officer", "General Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "compliance",
    controlCategory: "reporting",
    mitigatesRiskCategories: ["compliance", "reputational"],
    mitigatesRiskKeywords: ["reporting", "regulatory", "deadline", "submission", "breach", "non-compliance", "filing", "disclosure"]
  },

  {
    id: "comp-inspection-response",
    titles: [
      "Regulatory Inspection Response",
      "Government Inspector Protocol",
      "Inspection Management Process",
      "Regulatory Visit Procedure",
      "Inspector Access Protocol",
      "Compliance Inspection Response",
      "Audit and Inspection Management",
      "Regulatory Compliance Inspection"
    ],
    descriptions: [
      "Protocol for managing regulatory inspections including inspector access, information provision, finding documentation, and corrective action implementation. Root cause analysis for non-compliances.",
      "Formal procedure for regulatory visits with designated inspection coordinator, escort requirements, information request process, and finding close-out tracking. Management briefed on inspection outcomes.",
      "Inspection management process ensuring professional response to regulators, accurate information provision, and timely rectification of findings. Serious non-compliances escalated to board.",
      "Systematic approach to regulatory inspections covering preparation, escort, documentation, finding response, and corrective action verification. Legal review for contested findings.",
      "Regulatory inspection protocol with defined responsibilities, communication procedures, and response timeframes. All findings tracked to closure with verification evidence. Lessons learned captured."
    ],
    plainLanguage: [
      "Manage regulatory inspections professionally",
      "Respond to inspector findings",
      "Handle government visits properly",
      "Fix compliance issues found",
      "Cooperate with regulators",
      "Address inspection findings",
      "Implement corrective actions"
    ],
    keywords: ["inspection", "regulatory", "finding", "corrective action", "non-compliance", "response", "regulator", "audit", "visit", "government"],
    type: "corrective",
    category: "manual",
    owners: {
      primary: ["Site Manager", "Compliance Officer", "General Manager", "Regulatory Affairs Manager"],
      secondary: ["Chief Operating Officer", "Legal Counsel", "Chief Executive Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "triggered",
    department: "compliance",
    controlCategory: "inspection",
    mitigatesRiskCategories: ["compliance", "reputational"],
    mitigatesRiskKeywords: ["inspection", "regulatory", "finding", "non-compliance", "breach", "penalty", "enforcement", "regulator"]
  }
];

/* ========================================
   TECHNOLOGY CONTROLS
   IT systems, cybersecurity, automation
   ======================================== */

window.ERM_TEMPLATES.mining.controls.technology = [
  {
    id: "tech-user-access-review",
    titles: [
      "User Access Review",
      "Access Rights Audit",
      "System Access Recertification",
      "User Permission Review",
      "Periodic Access Review",
      "Access Control Audit",
      "User Entitlement Review",
      "System Access Verification"
    ],
    descriptions: [
      "Quarterly review of user access rights to critical systems. Managers certify their team's access is appropriate. Orphaned accounts and excessive permissions removed. Review results documented and filed.",
      "Systematic access review process where system owners verify user permissions remain appropriate for current roles. Terminated employees' access confirmed removed. Segregation of duties conflicts identified.",
      "Formal user access recertification requiring managers to approve or revoke each user's system permissions. Automated report generation with manager sign-off. Non-responses escalated.",
      "Periodic audit of user accounts and permissions across all IT systems. Identifies dormant accounts, inappropriate access, and permission creep. Remediation tracked to completion.",
      "Access governance program with quarterly review cycles. Covers business applications, network access, database permissions, and admin rights. Board receives summary of access control effectiveness."
    ],
    plainLanguage: [
      "Review who has access to systems",
      "Check user permissions regularly",
      "Verify access is still needed",
      "Remove unnecessary access",
      "Audit system user rights",
      "Certify access is appropriate",
      "Review user accounts quarterly"
    ],
    keywords: ["access", "review", "user", "permission", "audit", "rights", "certification", "system", "entitlement", "identity"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["IT Security Manager", "IT Manager", "Chief Information Officer", "Security Administrator"],
      secondary: ["Internal Audit", "Compliance Officer", "Chief Information Security Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "quarterly",
    department: "it",
    controlCategory: "access-control",
    mitigatesRiskCategories: ["technology", "compliance"],
    mitigatesRiskKeywords: ["unauthorized access", "data breach", "cyber", "hacking", "security", "insider threat", "access control", "privilege"]
  },

  {
    id: "tech-backup-recovery",
    titles: [
      "Data Backup and Recovery",
      "System Backup Program",
      "Business Continuity Backup",
      "Disaster Recovery Backup",
      "Data Protection Backup",
      "Backup and Restore Process",
      "Critical Data Backup",
      "IT Backup Solution"
    ],
    descriptions: [
      "Automated daily backup of all critical business systems and data to offsite location. Monthly restore testing verifies backup integrity and recovery procedures. Backup logs monitored for failures.",
      "Comprehensive backup program covering databases, file servers, email, and business applications. Incremental daily backups with weekly full backups. Retention periods align with regulatory and business requirements.",
      "Enterprise backup solution with geographic redundancy and encryption. Automated backup monitoring with alerting for failures. Quarterly disaster recovery drills test full system restoration.",
      "Formal data protection program utilizing backup software with deduplication and compression. Backup media securely stored offsite. Recovery time objectives tested annually.",
      "Business continuity backup strategy ensuring critical systems can be restored within defined recovery time objectives. Backup documentation maintained with restoration procedures. IT disaster recovery plan tested."
    ],
    plainLanguage: [
      "Backup data regularly",
      "Protect against data loss",
      "Test backups work properly",
      "Store backups offsite safely",
      "Ensure we can restore systems",
      "Backup critical information",
      "Recover from IT failures"
    ],
    keywords: ["backup", "recovery", "restore", "data", "disaster", "business continuity", "protection", "IT", "system", "offsite"],
    type: "preventive",
    category: "automated",
    owners: {
      primary: ["IT Manager", "Systems Administrator", "Chief Information Officer", "IT Infrastructure Manager"],
      secondary: ["IT Support Manager", "Chief Technology Officer", "Business Continuity Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "daily",
    department: "it",
    controlCategory: "data-protection",
    mitigatesRiskCategories: ["technology", "operational"],
    mitigatesRiskKeywords: ["data loss", "system failure", "disaster", "ransomware", "corruption", "IT failure", "cyber attack", "recovery"]
  },

  {
    id: "tech-patch-management",
    titles: [
      "Security Patch Management",
      "Software Update Program",
      "System Patching Process",
      "Vulnerability Patch Management",
      "OS and Application Patching",
      "Security Update Management",
      "Critical Patch Deployment",
      "Software Patch Schedule"
    ],
    descriptions: [
      "Systematic security patch management program for operating systems, applications, and network devices. Critical security patches deployed within 30 days. Patch testing in non-production environment before deployment.",
      "Formal patch management process with monthly patch cycles. Includes vulnerability scanning, patch prioritization, testing, and scheduled deployment. Emergency patching process for critical zero-day vulnerabilities.",
      "Enterprise patch management solution automating patch deployment to endpoints and servers. Patch compliance monitored with reporting to management. Missing patches trigger remediation.",
      "Risk-based patch management prioritizing critical and high-severity security updates. Patch deployment windows scheduled during maintenance periods. Rollback procedures documented for failed patches.",
      "Patch management framework covering Windows, Linux, database, and application patches. Change control approval required before production patching. Patch status dashboard provides visibility."
    ],
    plainLanguage: [
      "Install security updates",
      "Patch systems regularly",
      "Fix software vulnerabilities",
      "Deploy security patches",
      "Update systems monthly",
      "Apply critical updates",
      "Keep software current"
    ],
    keywords: ["patch", "update", "security", "vulnerability", "software", "deployment", "OS", "application", "fix", "remediation"],
    type: "preventive",
    category: "automated",
    owners: {
      primary: ["IT Security Manager", "Systems Administrator", "IT Manager", "Security Operations"],
      secondary: ["Chief Information Security Officer", "IT Infrastructure Manager", "Change Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "monthly",
    department: "it",
    controlCategory: "vulnerability-management",
    mitigatesRiskCategories: ["technology", "operational"],
    mitigatesRiskKeywords: ["vulnerability", "exploit", "cyber attack", "hacking", "security breach", "malware", "ransomware", "patch"]
  },

  {
    id: "tech-change-management",
    titles: [
      "IT Change Management Process",
      "Change Control Procedure",
      "System Change Authorization",
      "IT Change Governance",
      "Technology Change Management",
      "Change Request Process",
      "Production Change Control",
      "IT Change Approval"
    ],
    descriptions: [
      "Formal IT change management process requiring documented change requests, risk assessment, testing, and approval before production implementation. Emergency change process for urgent fixes.",
      "Change control framework with change advisory board reviewing and approving standard and major changes. All changes logged in change management system with implementation and backout plans.",
      "IT governance process ensuring changes to production systems are properly authorized, tested, and documented. Change success rate monitored. Failed changes trigger root cause analysis.",
      "Systematic change management covering infrastructure, applications, databases, and network changes. Change windows scheduled for minimal business impact. Post-implementation review confirms success.",
      "Enterprise change management tool workflow routing change requests for technical review, business approval, and implementation scheduling. Change calendar prevents conflicting changes."
    ],
    plainLanguage: [
      "Control changes to IT systems",
      "Approve system changes properly",
      "Test changes before production",
      "Manage IT changes formally",
      "Document system modifications",
      "Review change requests",
      "Authorize production changes"
    ],
    keywords: ["change", "management", "control", "approval", "IT", "system", "production", "authorization", "governance", "CAB"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Change Manager", "IT Manager", "Chief Information Officer", "Service Delivery Manager"],
      secondary: ["Systems Administrator", "Application Manager", "IT Director"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "it",
    controlCategory: "change-control",
    mitigatesRiskCategories: ["technology", "operational"],
    mitigatesRiskKeywords: ["system outage", "IT failure", "unauthorized change", "production incident", "service disruption", "downtime", "change"]
  }
];

/* ========================================
   HR CONTROLS
   Workforce, training, fatigue, competency
   ======================================== */

window.ERM_TEMPLATES.mining.controls.hr = [
  {
    id: "hr-competency-assessment",
    titles: [
      "Competency Assessment Program",
      "Skills Verification Process",
      "Operator Competency Checks",
      "Technical Competency Assessment",
      "Worker Skills Evaluation",
      "Qualification Verification",
      "Competency Based Training",
      "Skills Gap Assessment"
    ],
    descriptions: [
      "Formal competency assessment program verifying workers possess required skills and knowledge for their roles. Includes initial assessment, periodic reassessment, and verification of training effectiveness.",
      "Systematic competency verification for safety-critical roles covering operators, supervisors, and technical specialists. Competency standards documented with assessment criteria and frequencies.",
      "Risk-based competency framework requiring assessment before workers operate equipment or perform high-risk tasks. Competency records maintained and verified during audits.",
      "Competency management system tracking qualifications, licenses, and skill verifications. Automated alerts for expiring competencies. Workers restricted from tasks without current competency.",
      "Competency assessment process including written tests, practical demonstrations, and workplace observations. Assessors trained and qualified. Failed assessments trigger remedial training."
    ],
    plainLanguage: [
      "Verify workers are competent",
      "Check skills before allowing work",
      "Assess operator abilities",
      "Test knowledge and skills",
      "Ensure workers are qualified",
      "Verify technical competence",
      "Check people can do the job"
    ],
    keywords: ["competency", "assessment", "skills", "training", "qualification", "verification", "operator", "testing", "capability", "evaluation"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Training Manager", "Human Resources Manager", "Operations Manager", "Technical Services Manager"],
      secondary: ["Department Managers", "Chief Operating Officer", "Learning and Development Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "annual",
    department: "human-resources",
    controlCategory: "training",
    mitigatesRiskCategories: ["hr", "hse", "operational"],
    mitigatesRiskKeywords: ["competency", "training", "skill", "capability", "qualification", "error", "mistake", "inexperience", "knowledge"]
  },

  {
    id: "hr-fatigue-management",
    titles: [
      "Fatigue Risk Management",
      "Work Hours Management",
      "Fatigue Monitoring System",
      "Roster Fatigue Assessment",
      "Hours of Work Control",
      "Fatigue Risk Controls",
      "Shift Pattern Management",
      "Fitness for Work Checks"
    ],
    descriptions: [
      "Fatigue management system including maximum work hours, minimum rest periods, fatigue risk assessment for rosters, and fitness-for-work checks. Automated roster compliance monitoring.",
      "Formal fatigue management framework limiting consecutive shifts, total hours, and ensuring adequate rest breaks. Fatigue risk assessment for roster changes. Workers can refuse work if fatigued.",
      "Systematic work hours management preventing excessive fatigue. Includes daily hour limits, weekly limits, minimum break requirements, and fatigue risk scoring for rosters.",
      "Fatigue control program with roster design principles, hour tracking, and fatigue awareness training. Supervisors trained to recognize fatigue signs. Fatigued workers stood down.",
      "Work hour management system enforcing regulatory hour limits and company policies. Automated alerts for workers approaching limits. Overtime pre-approval required."
    ],
    plainLanguage: [
      "Manage worker fatigue",
      "Control working hours",
      "Prevent excessive shifts",
      "Ensure adequate rest",
      "Monitor fatigue risk",
      "Check fitness for work",
      "Manage shift rosters safely"
    ],
    keywords: ["fatigue", "hours", "rest", "roster", "fitness", "work hours", "shift", "FIFO", "overtime", "breaks"],
    type: "preventive",
    category: "automated",
    owners: {
      primary: ["Human Resources Manager", "Operations Manager", "Safety Manager", "Workforce Planning Manager"],
      secondary: ["Shift Supervisors", "Chief Operating Officer", "Health and Safety Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "human-resources",
    controlCategory: "hazard-id",
    mitigatesRiskCategories: ["hse", "hr"],
    mitigatesRiskKeywords: ["fatigue", "hours", "rest", "roster", "fitness", "impairment", "accident", "injury", "error"]
  },

  {
    id: "hr-critical-role-succession",
    titles: [
      "Critical Role Succession Planning",
      "Key Person Risk Management",
      "Leadership Succession Plan",
      "Talent Pipeline Development",
      "Key Role Backup Planning",
      "Succession Management Program",
      "Critical Position Coverage",
      "Leadership Development Plan"
    ],
    descriptions: [
      "Succession planning program identifying critical roles and developing internal talent pipeline. Each key position has identified successors with development plans. Board reviews succession annually.",
      "Formal succession management for executive and key technical roles. Includes identification of high-potential employees, accelerated development programs, and interim coverage arrangements.",
      "Risk-based succession planning focusing on roles with limited external market, specialized skills, or business-critical knowledge. Succession readiness assessed quarterly.",
      "Leadership development program preparing internal candidates for succession to senior roles. Includes mentoring, job rotation, and formal training. Succession bench strength reported to board.",
      "Critical role identification with succession coverage analysis. Roles lacking ready successors flagged as key person risks. Mitigation includes knowledge transfer, documentation, and external recruitment."
    ],
    plainLanguage: [
      "Plan for key people leaving",
      "Develop internal successors",
      "Manage key person risk",
      "Have backups for critical roles",
      "Build leadership pipeline",
      "Prepare people for promotion",
      "Cover important positions"
    ],
    keywords: ["succession", "key person", "critical role", "talent", "leadership", "pipeline", "development", "backup", "transition", "retention"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Human Resources Manager", "Chief Executive Officer", "Chief Operating Officer", "Talent Manager"],
      secondary: ["Board", "Executive Team", "Learning and Development Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "annual",
    department: "human-resources",
    controlCategory: "workforce-planning",
    mitigatesRiskCategories: ["hr", "strategic"],
    mitigatesRiskKeywords: ["key person", "succession", "talent", "turnover", "knowledge loss", "critical role", "retention", "resignation"]
  }
];

/* ========================================
   HSE CONTROLS
   Health, Safety, Environment
   ======================================== */

window.ERM_TEMPLATES.mining.controls.hse = [
  {
    id: "hse-hazid-shift",
    titles: [
      "Pre-Shift Hazard Identification",
      "Daily Hazard Assessment",
      "Crew Pre-Start Safety Meeting",
      "Shift Hazard Review",
      "Take 5 Hazard ID",
      "Pre-Task Risk Assessment",
      "Toolbox Talk Hazard ID",
      "JSA Pre-Shift Review"
    ],
    descriptions: [
      "Mandatory hazard identification and risk assessment conducted before each shift. Crew members identify potential hazards, assess controls, and document findings in pre-start register. Supervisor reviews and approves before work commences.",
      "Daily pre-shift safety meeting where crew discusses planned work, identifies hazards, confirms control measures, and assigns responsibilities. Meeting documented with attendee sign-off.",
      "Systematic pre-start hazard identification process covering shift tasks, work locations, equipment to be used, and environmental conditions. High-risk tasks require additional JSA.",
      "Formal shift hazard review requiring crew participation in hazard identification. Control effectiveness verified. New or changed hazards trigger supervisor review.",
      "Pre-shift risk assessment process with documented checklist. Covers fatigue, fitness for work, hazard awareness, and control verification. Non-routine tasks escalated for additional review."
    ],
    plainLanguage: [
      "Identify hazards before starting work",
      "Discuss safety at shift start",
      "Review risks each shift",
      "Do toolbox talk daily",
      "Check hazards before work",
      "Have pre-start safety meeting",
      "Talk about dangers each day"
    ],
    keywords: ["pre-shift", "hazard", "safety", "risk", "crew", "meeting", "toolbox", "JSA", "take 5", "hazard ID"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Shift Supervisor", "Crew Leader", "Foreman", "Team Leader"],
      secondary: ["Safety Officer", "Operations Manager", "Mine Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "shift",
    department: "safety",
    controlCategory: "hazard-id",
    mitigatesRiskCategories: ["hse", "operational"],
    mitigatesRiskKeywords: ["fatality", "serious injury", "fatal", "death", "injury", "accident", "hazard", "unsafe", "incident", "SIF", "HPI"]
  },

  {
    id: "hse-ppe-inspection",
    titles: [
      "PPE Inspection and Compliance",
      "Personal Protective Equipment Check",
      "PPE Enforcement Program",
      "Safety Equipment Inspection",
      "PPE Compliance Monitoring",
      "Personal Protection Verification",
      "Safety Gear Inspection",
      "PPE Standards Enforcement"
    ],
    descriptions: [
      "Daily inspection of personal protective equipment for all personnel entering operational areas. Checks include hard hats, safety boots, high-visibility clothing, eye protection, and task-specific PPE. Non-compliant personnel denied site access.",
      "Systematic PPE compliance program with gate checks, supervisor spot-checks, and documented enforcement. PPE standards defined for different work areas and tasks.",
      "Formal PPE inspection process verifying condition and proper use of safety equipment. Damaged PPE replaced immediately. Repeat non-compliance triggers disciplinary action.",
      "Personal protective equipment compliance monitoring using visual inspection and random checks. PPE defects reported and rectified. Contractor PPE compliance verified.",
      "PPE enforcement program with defined minimum standards, inspection criteria, and consequences for non-compliance. Safety observers conduct field verification checks."
    ],
    plainLanguage: [
      "Check people wear proper PPE",
      "Inspect safety equipment",
      "Enforce PPE requirements",
      "Verify hard hats and boots worn",
      "Ensure protective gear used",
      "Check safety equipment is good",
      "Make sure PPE is worn"
    ],
    keywords: ["PPE", "inspection", "helmet", "boots", "safety", "compliance", "equipment", "hard hat", "vest", "protection"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["Safety Officer", "Gate Security", "Supervisor", "Safety Representative"],
      secondary: ["Mine Manager", "Safety Manager", "HSE Coordinator"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "daily",
    department: "safety",
    controlCategory: "ppe",
    mitigatesRiskCategories: ["hse", "compliance"],
    mitigatesRiskKeywords: ["fatality", "serious injury", "head", "injury", "protection", "safety", "compliance", "PPE"]
  },

  {
    id: "hse-isolation-verification",
    titles: [
      "Isolation Verification Procedure",
      "Lock Out Tag Out (LOTO)",
      "Energy Isolation Control",
      "Equipment Isolation Process",
      "Lock-Out Verification",
      "Isolation Permit System",
      "Energy Control Procedure",
      "LOTO Compliance Process"
    ],
    descriptions: [
      "Multi-step lock-out tag-out procedure for equipment maintenance. Requires authorized isolation, lock application, energy verification, and documented sign-off. Equipment remains isolated until work completion and removal authorization.",
      "Formal energy isolation process covering electrical, mechanical, hydraulic, pneumatic, and gravitational energy sources. Personal locks applied by each worker. Group lockout for multi-person jobs.",
      "Systematic isolation procedure with isolation authority, lock application, stored energy release, zero energy verification, and isolation certificate. Periodic compliance audits conducted.",
      "Equipment isolation control requiring written permit, authorized isolator, lock-out device application, and try-test verification. Isolation points identified on equipment with tags.",
      "LOTO program with training for authorized workers, isolation procedures for each equipment type, and periodic competency assessment. Non-compliance investigated as serious safety breach."
    ],
    plainLanguage: [
      "Lock out equipment safely",
      "Isolate energy before maintenance",
      "Use LOTO procedure",
      "Verify isolation is effective",
      "Lock and tag equipment",
      "Control hazardous energy",
      "Prevent accidental startup"
    ],
    keywords: ["LOTO", "lockout", "tagout", "isolation", "energy", "maintenance", "permit", "verification", "lock", "tag"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Maintenance Supervisor", "Electrician", "Fitter", "Authorized Isolator"],
      secondary: ["Safety Manager", "Maintenance Manager", "Engineering Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "triggered",
    department: "safety",
    controlCategory: "isolation",
    mitigatesRiskCategories: ["hse", "operational"],
    mitigatesRiskKeywords: ["fatality", "fatal", "electrocution", "shock", "energy", "injury", "crush", "critical control", "death"]
  },

  {
    id: "hse-emergency-drill",
    titles: [
      "Emergency Response Drill",
      "Evacuation Drill Exercise",
      "Emergency Preparedness Drill",
      "Rescue Response Exercise",
      "Emergency Simulation Drill",
      "Crisis Response Exercise",
      "Emergency Evacuation Practice",
      "Disaster Response Drill"
    ],
    descriptions: [
      "Quarterly emergency evacuation and response drills covering fire, medical emergency, and mine rescue scenarios. Includes muster point assembly, head count verification, emergency equipment checks, and response team deployment.",
      "Scheduled emergency exercises testing response procedures, communication systems, and personnel preparedness. Drills evaluated with lessons learned documented and improvements implemented.",
      "Formal emergency drill program covering evacuation, first aid response, fire fighting, and emergency communication. Participation mandatory for all site personnel. Drill performance reviewed by management.",
      "Emergency preparedness testing through realistic scenario-based drills. Includes incident controller activation, emergency services liaison, and family notification procedures. Critical equipment functionality verified.",
      "Systematic emergency response exercises with announced and unannounced drills. Performance benchmarked against target times. Deficiencies trigger procedure updates or additional training."
    ],
    plainLanguage: [
      "Practice emergency evacuation",
      "Run emergency drills",
      "Test emergency response",
      "Exercise rescue procedures",
      "Drill fire evacuation",
      "Practice emergency plans",
      "Test crisis response"
    ],
    keywords: ["emergency", "drill", "evacuation", "rescue", "response", "training", "exercise", "preparedness", "fire", "simulation"],
    type: "directive",
    category: "manual",
    owners: {
      primary: ["Emergency Response Team Leader", "Safety Manager", "Mine Manager", "Emergency Controller"],
      secondary: ["HSE Manager", "Operations Manager", "Security Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "quarterly",
    department: "safety",
    controlCategory: "emergency",
    mitigatesRiskCategories: ["hse", "operational"],
    mitigatesRiskKeywords: ["emergency", "fire", "explosion", "evacuation", "fatality", "injury", "rescue", "incident", "response", "disaster"]
  },

  {
    id: "hse-water-discharge-test",
    titles: [
      "Discharge Water Quality Testing",
      "Effluent Quality Monitoring",
      "Water Quality Compliance Testing",
      "Discharge Permit Compliance",
      "Environmental Water Testing",
      "Effluent Discharge Control",
      "Water Quality Verification",
      "Discharge Quality Assurance"
    ],
    descriptions: [
      "Water quality testing before discharge to receiving environment. Parameters include pH, total suspended solids, metals, and hydrocarbons. Non-compliant water detained for treatment. Results logged and reported.",
      "Formal discharge water monitoring program with sampling frequency, test parameters, and compliance limits defined in environmental license. Automated sampling or manual grab samples analyzed by accredited laboratory.",
      "Systematic effluent quality testing ensuring discharge meets regulatory limits and license conditions. Exceedances trigger discharge cessation and investigation. Results reported to regulator monthly.",
      "Water quality compliance program with pre-discharge testing, results verification, and regulatory reporting. Discharge valves locked closed with only authorized personnel permitted to release water after test results confirm compliance.",
      "Environmental water testing procedure covering sampling methodology, chain of custody, laboratory analysis, and results interpretation. Non-compliant discharges reported as environmental incidents."
    ],
    plainLanguage: [
      "Test water before releasing",
      "Check discharge quality",
      "Monitor effluent water",
      "Ensure water meets standards",
      "Test water meets permit limits",
      "Verify discharge is clean",
      "Sample water before releasing"
    ],
    keywords: ["water", "discharge", "quality", "testing", "pH", "TSS", "compliance", "environment", "effluent", "monitoring"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["Environmental Officer", "Environmental Coordinator", "Environmental Manager", "Water Quality Technician"],
      secondary: ["Operations Manager", "Processing Manager", "Compliance Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "triggered",
    department: "environmental",
    controlCategory: "water-quality",
    mitigatesRiskCategories: ["hse", "compliance", "reputational"],
    mitigatesRiskKeywords: ["environmental", "pollution", "discharge", "water", "contamination", "breach", "regulatory", "license", "effluent"]
  },

  {
    id: "hse-dust-monitoring",
    titles: [
      "Real-Time Dust Monitoring",
      "Air Quality Dust Monitoring",
      "PM10 Monitoring System",
      "Dust Emission Monitoring",
      "Particulate Monitoring",
      "Boundary Dust Monitoring",
      "Community Air Quality Monitoring",
      "Dust Level Monitoring"
    ],
    descriptions: [
      "Automated dust monitoring stations at mine boundary and sensitive receptors. Continuous PM10 measurement with alert thresholds. Exceedances trigger suppression measures and investigation.",
      "Real-time dust monitoring network with meteorological data integration. Monitors total suspended particulates and PM10. Automated alerts sent to operations and environment team when levels approach limits.",
      "Continuous air quality monitoring at site boundary locations. Data logged and reported to regulator. High dust readings trigger water cart deployment, speed reductions, or activity cessation.",
      "Environmental dust monitoring program with TEOM or beta attenuation monitors. 1-hour and 24-hour averaging periods compared to regulatory criteria. Exceedances reported as environmental incidents.",
      "Air quality monitoring system providing real-time visibility of dust levels. Monitors linked to weather station for wind correlation. Proactive dust suppression deployed when conditions favor dust generation."
    ],
    plainLanguage: [
      "Monitor dust levels continuously",
      "Track air quality at boundary",
      "Measure dust emissions",
      "Check PM10 levels",
      "Monitor dust at mine fence",
      "Watch for dust exceedances",
      "Track particulates in air"
    ],
    keywords: ["dust", "monitoring", "PM10", "air quality", "particulate", "suppression", "boundary", "TSP", "TEOM", "emission"],
    type: "detective",
    category: "automated",
    owners: {
      primary: ["Environmental Coordinator", "Environmental Officer", "Environmental Manager", "Air Quality Specialist"],
      secondary: ["Operations Manager", "Mine Manager", "Compliance Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "environmental",
    controlCategory: "air-quality",
    mitigatesRiskCategories: ["hse", "compliance", "reputational"],
    mitigatesRiskKeywords: ["environmental", "dust", "air quality", "PM10", "community complaint", "exceedance", "pollution", "regulatory"]
  },

  {
    id: "hse-tailings-inspection",
    titles: [
      "Tailings Dam Daily Inspection",
      "TSF Integrity Monitoring",
      "Tailings Storage Facility Inspection",
      "Dam Safety Inspection",
      "Tailings Embankment Check",
      "TSF Condition Assessment",
      "Tailings Dam Surveillance",
      "Dam Wall Inspection"
    ],
    descriptions: [
      "Daily visual inspection of tailings storage facility including embankment condition, seepage, freeboard, beach profile, and return water system. Inspection checklist documented and filed.",
      "Systematic TSF inspection program with daily visual checks, weekly detailed inspections, and quarterly engineer reviews. Piezometers and survey monuments monitored. Anomalies trigger investigation.",
      "Tailings dam surveillance procedure covering crest settlement, downstream face condition, seepage locations, pool position, and freeboard adequacy. Photographs taken of any concerns.",
      "Daily dam safety inspection by trained personnel using checklist covering embankment integrity, foundation conditions, internal drainage performance, and operational compliance. Results reported to dam engineer.",
      "TSF monitoring program integrating visual inspections, instrumentation readings, and survey data. Trigger action response plan activated for adverse trends. Annual dam safety review by independent expert."
    ],
    plainLanguage: [
      "Inspect tailings dam daily",
      "Check dam condition",
      "Monitor TSF safety",
      "Walk embankment daily",
      "Look for seepage or cracks",
      "Verify dam is stable",
      "Check tailings facility"
    ],
    keywords: ["tailings", "dam", "TSF", "inspection", "embankment", "seepage", "freeboard", "monitoring", "safety", "surveillance"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["TSF Engineer", "Environmental Officer", "Dam Operations Manager", "Tailings Engineer"],
      secondary: ["Mine Manager", "Chief Operating Officer", "Geotechnical Engineer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "daily",
    department: "environmental",
    controlCategory: "tailings",
    mitigatesRiskCategories: ["hse", "compliance", "reputational"],
    mitigatesRiskKeywords: ["dam", "failure", "breach", "TSF", "tailings", "collapse", "seepage", "overflow", "environmental", "catastrophic"]
  }
];

/* ========================================
   REPUTATIONAL CONTROLS
   Community, stakeholder, media, ESG
   ======================================== */

window.ERM_TEMPLATES.mining.controls.reputational = [
  {
    id: "rep-community-engagement",
    titles: [
      "Community Engagement Schedule",
      "Stakeholder Consultation Program",
      "Community Relations Meetings",
      "Local Engagement Framework",
      "Stakeholder Engagement Plan",
      "Community Consultation Process",
      "Public Engagement Program",
      "Community Liaison Meetings"
    ],
    descriptions: [
      "Regular scheduled meetings with community representatives and stakeholders. Includes quarterly town halls, monthly liaison meetings, and annual general meetings. Minutes documented and actions tracked.",
      "Formal community engagement program with defined consultation schedule, meeting formats, and communication protocols. Community feedback register maintained with response tracking.",
      "Stakeholder engagement framework covering local residents, traditional owners, government, and interest groups. Engagement frequency based on stakeholder impact assessment.",
      "Community consultation process for major projects, changes, or incidents. Includes information sessions, feedback mechanisms, and grievance handling. Engagement outcomes inform decision-making.",
      "Systematic community relations program with proactive engagement, transparent communication, and collaborative problem-solving. Community investment and support programs enhance social license."
    ],
    plainLanguage: [
      "Meet with community regularly",
      "Talk to local stakeholders",
      "Consult with neighbors",
      "Hold community meetings",
      "Engage with locals",
      "Listen to community concerns",
      "Maintain community relations"
    ],
    keywords: ["community", "engagement", "meeting", "stakeholder", "consultation", "liaison", "relations", "communication", "public"],
    type: "directive",
    category: "manual",
    owners: {
      primary: ["Community Relations Manager", "External Affairs Manager", "Stakeholder Engagement Manager", "Social Performance Manager"],
      secondary: ["General Manager", "Chief Executive Officer", "Communications Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "monthly",
    department: "community",
    controlCategory: "engagement",
    mitigatesRiskCategories: ["reputational", "compliance"],
    mitigatesRiskKeywords: ["community", "stakeholder", "opposition", "protest", "social license", "relations", "complaint", "reputation"]
  },

  {
    id: "rep-grievance-process",
    titles: [
      "Community Grievance Process",
      "Complaint Management System",
      "Stakeholder Grievance Mechanism",
      "Community Feedback Process",
      "Complaint Handling Procedure",
      "Grievance Resolution Process",
      "Community Concerns Management",
      "Complaint Response System"
    ],
    descriptions: [
      "Formal process for receiving, investigating, and responding to community complaints and concerns. Includes complaint register, investigation procedures, response timeframes, and escalation protocols.",
      "Community grievance mechanism with multiple channels for lodging complaints (phone, email, web, in-person). All grievances logged, acknowledged within 24 hours, and investigated with response provided within defined timeframes.",
      "Systematic complaint management process with root cause analysis, corrective action implementation, and complainant feedback. Complaint trends analyzed to identify systemic issues.",
      "Stakeholder feedback system capturing concerns, suggestions, and grievances. Transparent response process with updates provided to complainant. Grievance data reported to board quarterly.",
      "Formal grievance resolution framework with defined response standards, investigation protocols, and closure criteria. Anonymous complaints accepted. Retaliation against complainants prohibited."
    ],
    plainLanguage: [
      "Handle community complaints",
      "Respond to grievances",
      "Manage stakeholder concerns",
      "Investigate complaints properly",
      "Resolve community issues",
      "Track and address feedback",
      "Manage complaint process"
    ],
    keywords: ["grievance", "complaint", "community", "investigation", "response", "feedback", "concern", "resolution", "stakeholder"],
    type: "corrective",
    category: "manual",
    owners: {
      primary: ["Community Liaison Officer", "Community Relations Manager", "External Affairs Manager", "Stakeholder Manager"],
      secondary: ["General Manager", "Compliance Officer", "Chief Executive Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "community",
    controlCategory: "grievance",
    mitigatesRiskCategories: ["reputational", "compliance"],
    mitigatesRiskKeywords: ["community", "complaint", "grievance", "stakeholder", "dissatisfaction", "protest", "opposition", "reputation"]
  },

  {
    id: "rep-media-protocol",
    titles: [
      "Media Relations Protocol",
      "Press Engagement Procedure",
      "Media Response Framework",
      "Public Relations Protocol",
      "Media Spokesperson Policy",
      "Press Inquiry Management",
      "Media Communication Guidelines",
      "Public Affairs Protocol"
    ],
    descriptions: [
      "Formal media relations protocol designating authorized spokespersons, approval processes for statements, and response procedures for media inquiries. Media training provided to spokespeople.",
      "Media engagement framework with approved messaging, spokesperson authorization matrix, and crisis communication procedures. All media contact logged and communications team informed.",
      "Public relations protocol requiring media inquiries to be directed to communications team. Spokespersons briefed before interviews. Post-interview debrief and monitoring of media coverage.",
      "Media response procedure with rapid response capability for urgent inquiries. Holding statements available for common topics. Legal review required for sensitive issues.",
      "Communications governance with defined media channels, approval authorities for public statements, and social media guidelines. Proactive media engagement balanced with appropriate confidentiality."
    ],
    plainLanguage: [
      "Manage media inquiries properly",
      "Control media communications",
      "Have authorized spokespeople",
      "Handle press properly",
      "Manage public relations",
      "Respond to media correctly",
      "Control public statements"
    ],
    keywords: ["media", "press", "public relations", "spokesperson", "communications", "inquiry", "statement", "interview", "journalist"],
    type: "directive",
    category: "manual",
    owners: {
      primary: ["Communications Manager", "External Affairs Manager", "Public Relations Manager", "Corporate Affairs Manager"],
      secondary: ["Chief Executive Officer", "General Manager", "Legal Counsel"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "triggered",
    department: "communications",
    controlCategory: "media-relations",
    mitigatesRiskCategories: ["reputational"],
    mitigatesRiskKeywords: ["media", "reputation", "public", "press", "communications", "negative publicity", "crisis", "image"]
  },

  {
    id: "rep-esg-reporting",
    titles: [
      "ESG Reporting Framework",
      "Sustainability Reporting Program",
      "Environmental Social Governance Reporting",
      "Corporate Sustainability Report",
      "ESG Disclosure Framework",
      "Sustainability Performance Reporting",
      "ESG Metrics Reporting",
      "Responsible Mining Report"
    ],
    descriptions: [
      "Annual ESG reporting framework aligned with GRI standards covering environmental performance, social impact, and governance practices. Report externally assured and published.",
      "Sustainability reporting program with defined metrics, data collection processes, and disclosure standards. Covers emissions, water, waste, community investment, safety, diversity, and governance.",
      "Comprehensive ESG disclosure including carbon footprint, water stewardship, tailings management, community development, safety performance, and board composition. Benchmarked against peers.",
      "Corporate responsibility reporting framework providing transparent disclosure of environmental and social performance. Includes targets, progress tracking, and stakeholder engagement outcomes.",
      "ESG reporting aligned with investor requirements and reporting frameworks (GRI, SASB, TCFD). Data collection integrated with operational systems. Report approved by board before publication."
    ],
    plainLanguage: [
      "Report on sustainability",
      "Publish ESG performance",
      "Disclose environmental data",
      "Report social impacts",
      "Publish sustainability report",
      "Share ESG metrics",
      "Report responsibly"
    ],
    keywords: ["ESG", "sustainability", "reporting", "disclosure", "environmental", "social", "governance", "GRI", "SASB", "carbon"],
    type: "directive",
    category: "manual",
    owners: {
      primary: ["Sustainability Manager", "ESG Manager", "Corporate Affairs Manager", "Chief Sustainability Officer"],
      secondary: ["Chief Executive Officer", "Chief Financial Officer", "Board"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "annual",
    department: "sustainability",
    controlCategory: "reporting",
    mitigatesRiskCategories: ["reputational", "compliance"],
    mitigatesRiskKeywords: ["ESG", "sustainability", "investor", "disclosure", "reputation", "environmental", "social", "governance", "reporting"]
  }
];

/* ========================================
   PROJECT CONTROLS
   Capital projects, expansion, development
   ======================================== */

window.ERM_TEMPLATES.mining.controls.project = [
  {
    id: "proj-gate-review",
    titles: [
      "Project Gate Review Process",
      "Stage Gate Approval",
      "Capital Project Gate Review",
      "Project Phase Gate Control",
      "Investment Decision Gate",
      "Project Approval Gateway",
      "Stage Gate Framework",
      "Project Milestone Review"
    ],
    descriptions: [
      "Multi-stage gate review process for capital projects with defined gates (concept, feasibility, execute, operate). Each gate requires documented deliverables, independent review, and formal approval before proceeding.",
      "Formal project governance with stage gates requiring technical review, economic assessment, risk evaluation, and management/board approval. Projects failing gate criteria returned for additional work.",
      "Capital allocation framework with investment gates at key decision points. Gate reviews assess scope definition, cost estimates, schedule, risks, and strategic alignment. Toll-gate criteria must be met.",
      "Project phase gate control requiring deliverables completion, peer review, lessons learned incorporation, and authorization before next phase. Gates prevent premature advancement and scope creep.",
      "Systematic project approval process with gates aligned to project lifecycle. Each gate has defined entry criteria, deliverables, review process, and exit criteria. Board approves major gate transitions."
    ],
    plainLanguage: [
      "Review projects at key stages",
      "Have formal approval gates",
      "Check project readiness",
      "Gate projects properly",
      "Review before advancing",
      "Control project phases",
      "Approve at milestones"
    ],
    keywords: ["gate", "review", "project", "approval", "stage", "capital", "investment", "milestone", "governance", "phase"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Projects Director", "Project Manager", "Chief Operating Officer", "Capital Projects Manager"],
      secondary: ["Chief Executive Officer", "Board", "Chief Financial Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "triggered",
    department: "projects",
    controlCategory: "project-governance",
    mitigatesRiskCategories: ["project", "financial"],
    mitigatesRiskKeywords: ["project", "overrun", "delay", "cost", "scope creep", "capital", "investment", "budget", "schedule"]
  },

  {
    id: "proj-cost-control",
    titles: [
      "Project Cost Control",
      "Capital Budget Monitoring",
      "Project Cost Tracking",
      "Cost Variance Management",
      "Project Budget Control",
      "Capital Cost Monitoring",
      "Project Financial Control",
      "Cost Management Process"
    ],
    descriptions: [
      "Formal project cost control process with approved budget, change control, commitment tracking, and variance reporting. Monthly cost reports to project board. Forecast at completion updated regularly.",
      "Capital project cost management with baseline budget, work breakdown structure, cost coding, and earned value analysis. Cost overruns require investigation and recovery plan.",
      "Systematic project budget monitoring with commitments register, invoices tracking, and accruals. Monthly financial reports showing budget vs actual vs forecast. Material variances explained.",
      "Project cost control framework requiring purchase orders for all expenditure, multi-level approval authorities, and budget holder accountability. Unbudgeted expenditure requires change request approval.",
      "Cost management system integrating project accounting with ERP. Real-time visibility of expenditure and commitments. Budget alerts for cost centers approaching limits. Forecast accuracy tracked."
    ],
    plainLanguage: [
      "Control project costs",
      "Monitor capital spending",
      "Track project budget",
      "Manage cost overruns",
      "Control project expenditure",
      "Watch project finances",
      "Manage capital budget"
    ],
    keywords: ["cost", "budget", "project", "capital", "expenditure", "variance", "forecast", "control", "overrun", "tracking"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["Project Manager", "Project Controls Manager", "Projects Director", "Capital Projects Manager"],
      secondary: ["Chief Financial Officer", "Finance Manager", "Cost Engineer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "monthly",
    department: "projects",
    controlCategory: "cost-control",
    mitigatesRiskCategories: ["project", "financial"],
    mitigatesRiskKeywords: ["cost", "overrun", "budget", "project", "capital", "expenditure", "variance", "financial", "forecast"]
  },

  {
    id: "proj-schedule-monitoring",
    titles: [
      "Project Schedule Monitoring",
      "Critical Path Tracking",
      "Project Timeline Control",
      "Schedule Performance Monitoring",
      "Project Milestone Tracking",
      "Schedule Variance Management",
      "Project Progress Monitoring",
      "Delay Management Process"
    ],
    descriptions: [
      "Project schedule monitoring using critical path method with regular progress updates, variance analysis, and recovery planning for delays. Monthly schedule reports to project board.",
      "Formal schedule management with baseline schedule, regular updates, critical path tracking, and float management. Schedule risks identified and mitigated proactively.",
      "Systematic project progress monitoring with physical progress measurement, schedule variance calculation, and trend analysis. Delays trigger investigation and acceleration measures.",
      "Project timeline control process requiring detailed schedule with logic links, resource loading, and regular updates. Schedule performance index tracked. Look-ahead planning identifies upcoming constraints.",
      "Schedule monitoring framework using project management software with integrated cost and schedule tracking. Critical milestones tracked separately. Delay reports require explanation and recovery plan."
    ],
    plainLanguage: [
      "Monitor project schedule",
      "Track project progress",
      "Watch for delays",
      "Control project timeline",
      "Track milestones",
      "Manage schedule variance",
      "Monitor critical path"
    ],
    keywords: ["schedule", "project", "milestone", "delay", "timeline", "progress", "critical path", "variance", "tracking", "monitoring"],
    type: "detective",
    category: "manual",
    owners: {
      primary: ["Project Manager", "Project Controls Manager", "Planning Engineer", "Project Scheduler"],
      secondary: ["Projects Director", "Chief Operating Officer", "Program Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "weekly",
    department: "projects",
    controlCategory: "scheduling",
    mitigatesRiskCategories: ["project", "operational"],
    mitigatesRiskKeywords: ["delay", "schedule", "project", "timeline", "milestone", "critical path", "overrun", "late", "commissioning"]
  },

  {
    id: "proj-contract-management",
    titles: [
      "Contract Management Process",
      "Contractor Performance Management",
      "Contract Administration",
      "Vendor Contract Control",
      "Contract Compliance Monitoring",
      "Contractor Management System",
      "Contract Governance Framework",
      "Supplier Contract Management"
    ],
    descriptions: [
      "Formal contract management process covering tendering, award, administration, variation control, and close-out. Contract managers assigned for major contracts with performance monitoring.",
      "Systematic contractor management including pre-qualification, competitive tendering, contract negotiation, performance monitoring, and payment control. Contracts contain key performance indicators.",
      "Contract administration framework with defined roles, variation approval process, progress claim verification, and dispute resolution procedures. Contract register maintained.",
      "Vendor contract control requiring legal review, financial assessment, insurance verification, and multi-level approval. Standard terms used where possible. Material variations require re-approval.",
      "Contract governance process ensuring contracts protect company interests, allocate risks appropriately, and include performance incentives. Regular contract reviews identify issues early."
    ],
    plainLanguage: [
      "Manage contracts properly",
      "Control contractor performance",
      "Administer contracts",
      "Monitor vendor contracts",
      "Manage supplier agreements",
      "Control contract variations",
      "Track contractor performance"
    ],
    keywords: ["contract", "contractor", "vendor", "supplier", "performance", "management", "variation", "claim", "compliance", "administration"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Contract Manager", "Procurement Manager", "Project Manager", "Commercial Manager"],
      secondary: ["Legal Counsel", "Chief Financial Officer", "Projects Director"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "projects",
    controlCategory: "contract-management",
    mitigatesRiskCategories: ["project", "financial", "compliance"],
    mitigatesRiskKeywords: ["contract", "contractor", "performance", "dispute", "variation", "claim", "vendor", "supplier", "legal"]
  }
];

/* ========================================
   HELPER FUNCTIONS
   ======================================== */

/**
 * Get all control templates across all categories
 */
window.ERM_TEMPLATES.mining.controls.getAll = function() {
  var allControls = [];
  var categories = ['strategic', 'financial', 'operational', 'compliance', 'technology', 'hr', 'hse', 'reputational', 'project'];

  for (var i = 0; i < categories.length; i++) {
    var category = categories[i];
    if (this[category] && Array.isArray(this[category])) {
      allControls = allControls.concat(this[category]);
    }
  }

  return allControls;
};

/**
 * Get controls by category
 */
window.ERM_TEMPLATES.mining.controls.getByCategory = function(categoryId) {
  if (!categoryId) return [];
  return this[categoryId] || [];
};

/**
 * Get control by ID
 */
window.ERM_TEMPLATES.mining.controls.getById = function(id) {
  var allControls = this.getAll();
  for (var i = 0; i < allControls.length; i++) {
    if (allControls[i].id === id) {
      return allControls[i];
    }
  }
  return null;
};

/**
 * Get controls by type
 */
window.ERM_TEMPLATES.mining.controls.getByType = function(type) {
  var allControls = this.getAll();
  var results = [];

  for (var i = 0; i < allControls.length; i++) {
    if (allControls[i].type === type) {
      results.push(allControls[i]);
    }
  }

  return results;
};

/**
 * Get controls by department
 */
window.ERM_TEMPLATES.mining.controls.getByDepartment = function(department) {
  var allControls = this.getAll();
  var results = [];

  for (var i = 0; i < allControls.length; i++) {
    if (allControls[i].department === department) {
      results.push(allControls[i]);
    }
  }

  return results;
};

/**
 * Search controls by keyword
 */
window.ERM_TEMPLATES.mining.controls.searchByKeyword = function(keyword) {
  if (!keyword) return [];

  var allControls = this.getAll();
  var results = [];
  var searchTerm = keyword.toLowerCase();

  for (var i = 0; i < allControls.length; i++) {
    var control = allControls[i];
    var match = false;

    // Check titles
    if (control.titles) {
      for (var j = 0; j < control.titles.length; j++) {
        if (control.titles[j].toLowerCase().indexOf(searchTerm) !== -1) {
          match = true;
          break;
        }
      }
    }

    // Check keywords
    if (!match && control.keywords) {
      for (var k = 0; k < control.keywords.length; k++) {
        if (control.keywords[k].toLowerCase().indexOf(searchTerm) !== -1) {
          match = true;
          break;
        }
      }
    }

    // Check plain language
    if (!match && control.plainLanguage) {
      for (var l = 0; l < control.plainLanguage.length; l++) {
        if (control.plainLanguage[l].toLowerCase().indexOf(searchTerm) !== -1) {
          match = true;
          break;
        }
      }
    }

    if (match) {
      results.push(control);
    }
  }

  return results;
};

/* ========================================
   REGISTER WITH CONTROL LOADER
   ======================================== */

// Register mining controls with ERM.controlTemplates namespace for loader
if (!window.ERM) window.ERM = {};
if (!window.ERM.controlTemplates) window.ERM.controlTemplates = {};

window.ERM.controlTemplates.mining = {
  config: {
    industryName: "Mining",
    description: "Mining industry control templates",
    version: "2.0.0"
  },
  controls: window.ERM_TEMPLATES.mining.controls,
  departments: [], // Not used for controls
  categories: [], // Not used for controls
  keywordMappings: {} // Handled by mining-control-keywords.js
};

// Log successful load
console.log("Mining Control Templates v2.0 loaded: " + window.ERM_TEMPLATES.mining.controls.getAll().length + " controls across 9 categories");
console.log("Categories: strategic(" + window.ERM_TEMPLATES.mining.controls.strategic.length +
            "), financial(" + window.ERM_TEMPLATES.mining.controls.financial.length +
            "), operational(" + window.ERM_TEMPLATES.mining.controls.operational.length +
            "), compliance(" + window.ERM_TEMPLATES.mining.controls.compliance.length +
            "), technology(" + window.ERM_TEMPLATES.mining.controls.technology.length +
            "), hr(" + window.ERM_TEMPLATES.mining.controls.hr.length +
            "), hse(" + window.ERM_TEMPLATES.mining.controls.hse.length +
            "), reputational(" + window.ERM_TEMPLATES.mining.controls.reputational.length +
            "), project(" + window.ERM_TEMPLATES.mining.controls.project.length + ")");
