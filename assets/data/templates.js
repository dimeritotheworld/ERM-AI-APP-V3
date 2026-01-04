/**
 * Dimeri ERM - Industry Risk Templates
 * Pre-populated risks for different industries
 * ES5 Compatible
 */

var ERM = window.ERM || {};

ERM.templates = {
  // Template metadata
  list: [
    { id: "banking", icon: "🏦", name: "Banking & Financial Services" },
    { id: "mining", icon: "⛏️", name: "Mining & Resources" },
    { id: "telecom", icon: "📡", name: "Telecommunications" },
    { id: "healthcare", icon: "🏥", name: "Healthcare" },
    { id: "public-sector", icon: "🏛️", name: "Public Sector" },
    { id: "manufacturing", icon: "🏭", name: "Manufacturing" },
  ],

  // Risk data by template
  risks: {
    banking: [
      {
        title: "Credit Risk",
        category: "Financial",
        inherentRisk: "CRITICAL",
        description:
          "Risk of loss due to borrowers failing to meet their debt obligations, including loan defaults and credit deterioration.",
      },
      {
        title: "Market Risk",
        category: "Financial",
        inherentRisk: "HIGH",
        description:
          "Potential losses from changes in market prices, interest rates, foreign exchange rates, and equity prices.",
      },
      {
        title: "Liquidity Risk",
        category: "Financial",
        inherentRisk: "HIGH",
        description:
          "Risk that the institution cannot meet its financial obligations when they fall due without incurring unacceptable losses.",
      },
      {
        title: "Operational Risk",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Risk of loss from inadequate or failed internal processes, people, systems, or external events.",
      },
      {
        title: "Regulatory Non-Compliance",
        category: "Compliance",
        inherentRisk: "CRITICAL",
        description:
          "Failure to comply with SARB prudential requirements, FAIS, FICA, and other banking regulations.",
      },
      {
        title: "Cybersecurity Breach",
        category: "Technology",
        inherentRisk: "CRITICAL",
        description:
          "Unauthorized access to systems resulting in data theft, financial fraud, or service disruption.",
      },
      {
        title: "Money Laundering",
        category: "Compliance",
        inherentRisk: "HIGH",
        description:
          "Risk of being used to launder proceeds of crime, with associated regulatory penalties and reputational damage.",
      },
      {
        title: "Interest Rate Risk",
        category: "Financial",
        inherentRisk: "MEDIUM",
        description:
          "Exposure to adverse movements in interest rates affecting net interest income and economic value.",
      },
      {
        title: "Reputational Risk",
        category: "Strategic",
        inherentRisk: "HIGH",
        description:
          "Potential damage to brand and stakeholder confidence from negative publicity or conduct issues.",
      },
      {
        title: "Third-Party Risk",
        category: "Operational",
        inherentRisk: "MEDIUM",
        description:
          "Risks arising from outsourced services, vendor dependencies, and supply chain vulnerabilities.",
      },
      {
        title: "Data Privacy Breach",
        category: "Compliance",
        inherentRisk: "HIGH",
        description:
          "Unauthorized disclosure of customer personal information in violation of POPIA requirements.",
      },
      {
        title: "Business Continuity",
        category: "Operational",
        inherentRisk: "MEDIUM",
        description:
          "Inability to maintain critical operations during disruptive events including load shedding and natural disasters.",
      },
    ],

    mining: [
      {
        title: "Safety Incident",
        category: "Health & Safety",
        inherentRisk: "CRITICAL",
        description:
          "Risk of fatalities, serious injuries, or occupational diseases affecting workers in mining operations.",
      },
      {
        title: "Environmental Damage",
        category: "Environmental",
        inherentRisk: "CRITICAL",
        description:
          "Contamination of land, water, or air from mining activities, including acid mine drainage and dust emissions.",
      },
      {
        title: "Commodity Price Volatility",
        category: "Financial",
        inherentRisk: "HIGH",
        description:
          "Fluctuations in commodity prices affecting revenue, profitability, and project viability.",
      },
      {
        title: "Equipment Failure",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Breakdown of critical mining equipment leading to production delays and safety hazards.",
      },
      {
        title: "Mining License Revocation",
        category: "Compliance",
        inherentRisk: "HIGH",
        description:
          "Loss of mining rights due to non-compliance with DMRE requirements or social license issues.",
      },
      {
        title: "Community Relations",
        category: "Social",
        inherentRisk: "MEDIUM",
        description:
          "Conflict with local communities regarding employment, environmental impact, and benefit sharing.",
      },
      {
        title: "Water Management",
        category: "Environmental",
        inherentRisk: "HIGH",
        description:
          "Challenges in water supply, treatment, and discharge in compliance with DWS requirements.",
      },
      {
        title: "Tailings Dam Failure",
        category: "Environmental",
        inherentRisk: "CRITICAL",
        description:
          "Catastrophic failure of tailings storage facilities resulting in environmental disaster and loss of life.",
      },
      {
        title: "Skills Shortage",
        category: "Human Resources",
        inherentRisk: "MEDIUM",
        description:
          "Difficulty attracting and retaining skilled workers, engineers, and technical specialists.",
      },
      {
        title: "Power Supply Disruption",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Impact of Eskom load shedding and power quality issues on mining operations and safety systems.",
      },
      {
        title: "Geological Uncertainty",
        category: "Operational",
        inherentRisk: "MEDIUM",
        description:
          "Variance between estimated and actual ore grades, geological structures, and ground conditions.",
      },
      {
        title: "Foreign Exchange Risk",
        category: "Financial",
        inherentRisk: "MEDIUM",
        description:
          "Exposure to ZAR/USD volatility affecting export revenues and imported input costs.",
      },
    ],

    telecom: [
      {
        title: "Network Outage",
        category: "Operational",
        inherentRisk: "CRITICAL",
        description:
          "Major service disruption affecting voice, data, or messaging services for significant customer base.",
      },
      {
        title: "Cybersecurity Attack",
        category: "Technology",
        inherentRisk: "CRITICAL",
        description:
          "Targeted attacks on network infrastructure, customer data, or billing systems.",
      },
      {
        title: "Spectrum License Issues",
        category: "Compliance",
        inherentRisk: "HIGH",
        description:
          "Failure to comply with ICASA spectrum license conditions or loss of spectrum rights.",
      },
      {
        title: "Technology Obsolescence",
        category: "Strategic",
        inherentRisk: "HIGH",
        description:
          "Failure to keep pace with technology evolution including 5G, fiber, and digital services.",
      },
      {
        title: "Customer Churn",
        category: "Commercial",
        inherentRisk: "MEDIUM",
        description:
          "Loss of subscribers to competitors due to pricing, service quality, or network coverage.",
      },
      {
        title: "Regulatory Changes",
        category: "Compliance",
        inherentRisk: "HIGH",
        description:
          "Impact of new ICASA regulations on pricing, interconnection, or service obligations.",
      },
      {
        title: "Infrastructure Damage",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Physical damage to towers, fiber, or equipment from weather, vandalism, or cable theft.",
      },
      {
        title: "Data Privacy Non-Compliance",
        category: "Compliance",
        inherentRisk: "HIGH",
        description:
          "Failure to protect customer data and communications in accordance with POPIA and RICA.",
      },
      {
        title: "Vendor Dependency",
        category: "Operational",
        inherentRisk: "MEDIUM",
        description:
          "Over-reliance on key equipment vendors and potential supply chain disruptions.",
      },
      {
        title: "Load Shedding Impact",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Effect of electricity interruptions on network availability and battery/generator capacity.",
      },
      {
        title: "Competition Pressure",
        category: "Strategic",
        inherentRisk: "MEDIUM",
        description:
          "Margin pressure from aggressive competitor pricing and new market entrants.",
      },
      {
        title: "Service Quality Degradation",
        category: "Operational",
        inherentRisk: "MEDIUM",
        description:
          "Network congestion and quality issues affecting customer experience and retention.",
      },
    ],

    healthcare: [
      {
        title: "Patient Safety Incident",
        category: "Clinical",
        inherentRisk: "CRITICAL",
        description:
          "Adverse events causing patient harm including surgical errors, falls, and diagnostic failures.",
      },
      {
        title: "Medical Malpractice",
        category: "Clinical",
        inherentRisk: "CRITICAL",
        description:
          "Clinical negligence resulting in patient injury, litigation, and reputational damage.",
      },
      {
        title: "Medication Error",
        category: "Clinical",
        inherentRisk: "HIGH",
        description:
          "Errors in prescribing, dispensing, or administering medications leading to patient harm.",
      },
      {
        title: "Healthcare Associated Infection",
        category: "Clinical",
        inherentRisk: "HIGH",
        description:
          "Hospital-acquired infections including surgical site infections and antimicrobial resistance.",
      },
      {
        title: "Data Breach (Patient Records)",
        category: "Compliance",
        inherentRisk: "CRITICAL",
        description:
          "Unauthorized access to patient health information violating POPIA and medical ethics.",
      },
      {
        title: "Regulatory Non-Compliance",
        category: "Compliance",
        inherentRisk: "HIGH",
        description:
          "Failure to meet OHSC, HPCSA, SANC, and other healthcare regulatory requirements.",
      },
      {
        title: "Equipment Failure",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Malfunction of critical medical equipment affecting diagnosis, treatment, or life support.",
      },
      {
        title: "Staff Shortage",
        category: "Human Resources",
        inherentRisk: "HIGH",
        description:
          "Insufficient nursing, medical, and allied health staff affecting care quality and access.",
      },
      {
        title: "Supply Chain Disruption",
        category: "Operational",
        inherentRisk: "MEDIUM",
        description:
          "Shortages of medicines, consumables, or medical devices affecting patient care.",
      },
      {
        title: "Reputational Damage",
        category: "Strategic",
        inherentRisk: "HIGH",
        description:
          "Negative publicity from clinical incidents, complaints, or regulatory findings.",
      },
      {
        title: "Financial Sustainability",
        category: "Financial",
        inherentRisk: "MEDIUM",
        description:
          "Pressure on margins from medical scheme negotiations, bad debt, and cost escalation.",
      },
      {
        title: "Emergency Preparedness",
        category: "Operational",
        inherentRisk: "MEDIUM",
        description:
          "Capacity to respond to mass casualty events, disease outbreaks, or facility emergencies.",
      },
    ],

    "public-sector": [
      {
        title: "Fraud and Corruption",
        category: "Compliance",
        inherentRisk: "CRITICAL",
        description:
          "Misappropriation of public funds, bribery, and corrupt practices in procurement and service delivery.",
      },
      {
        title: "Irregular Expenditure",
        category: "Financial",
        inherentRisk: "HIGH",
        description:
          "Expenditure incurred without complying with applicable legislation and supply chain procedures.",
      },
      {
        title: "Service Delivery Failure",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Inability to deliver mandated services to citizens effectively and efficiently.",
      },
      {
        title: "Non-Compliance with PFMA/MFMA",
        category: "Compliance",
        inherentRisk: "CRITICAL",
        description:
          "Failure to comply with Public Finance Management Act or Municipal Finance Management Act requirements.",
      },
      {
        title: "Cybersecurity Breach",
        category: "Technology",
        inherentRisk: "HIGH",
        description:
          "Unauthorized access to government systems and citizen data.",
      },
      {
        title: "Skills Vacancy",
        category: "Human Resources",
        inherentRisk: "HIGH",
        description:
          "Critical vacancies in key positions affecting institutional capacity and service delivery.",
      },
      {
        title: "Budget Overrun",
        category: "Financial",
        inherentRisk: "HIGH",
        description:
          "Expenditure exceeding approved budgets leading to unauthorized spending and cash flow problems.",
      },
      {
        title: "Political Interference",
        category: "Governance",
        inherentRisk: "MEDIUM",
        description:
          "Undue political influence in administrative decisions, appointments, and procurement.",
      },
      {
        title: "Infrastructure Maintenance",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Deterioration of public infrastructure due to inadequate maintenance and capital investment.",
      },
      {
        title: "Procurement Irregularities",
        category: "Compliance",
        inherentRisk: "HIGH",
        description:
          "Non-compliance with SCM regulations, fronting, and unfair procurement practices.",
      },
      {
        title: "Data Protection (POPIA)",
        category: "Compliance",
        inherentRisk: "MEDIUM",
        description:
          "Failure to protect personal information of citizens in accordance with POPIA requirements.",
      },
      {
        title: "Stakeholder Management",
        category: "Strategic",
        inherentRisk: "MEDIUM",
        description:
          "Ineffective engagement with communities, oversight bodies, and other stakeholders.",
      },
    ],

    manufacturing: [
      {
        title: "Workplace Safety Incident",
        category: "Health & Safety",
        inherentRisk: "CRITICAL",
        description:
          "Injuries or fatalities from machinery, chemical exposure, or unsafe working conditions.",
      },
      {
        title: "Production Downtime",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Unplanned stoppages affecting output, delivery commitments, and customer relationships.",
      },
      {
        title: "Supply Chain Disruption",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Interruption of raw material supply due to logistics, supplier failure, or global shortages.",
      },
      {
        title: "Quality Control Failure",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Production of defective goods leading to customer complaints, returns, and recalls.",
      },
      {
        title: "Equipment Breakdown",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Failure of critical production machinery requiring emergency repairs or replacement.",
      },
      {
        title: "Environmental Compliance",
        category: "Compliance",
        inherentRisk: "HIGH",
        description:
          "Non-compliance with air emissions, effluent discharge, and waste management regulations.",
      },
      {
        title: "Raw Material Price Volatility",
        category: "Financial",
        inherentRisk: "MEDIUM",
        description:
          "Fluctuations in input costs affecting margins and pricing competitiveness.",
      },
      {
        title: "Product Recall",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Need to recall products due to safety defects or contamination issues.",
      },
      {
        title: "Load Shedding Impact",
        category: "Operational",
        inherentRisk: "HIGH",
        description:
          "Production losses and equipment damage from Eskom power interruptions.",
      },
      {
        title: "Skills Shortage",
        category: "Human Resources",
        inherentRisk: "MEDIUM",
        description:
          "Difficulty finding qualified artisans, technicians, and engineers.",
      },
      {
        title: "Cybersecurity (OT Systems)",
        category: "Technology",
        inherentRisk: "HIGH",
        description:
          "Attacks on operational technology and industrial control systems.",
      },
      {
        title: "Currency Fluctuation",
        category: "Financial",
        inherentRisk: "MEDIUM",
        description:
          "Impact of ZAR volatility on imported inputs and export competitiveness.",
      },
    ],
  },

  /**
   * Get template metadata by ID
   */
  getTemplate: function (templateId) {
    for (var i = 0; i < this.list.length; i++) {
      if (this.list[i].id === templateId) {
        return this.list[i];
      }
    }
    return null;
  },

  /**
   * Get risks for a template
   */
  getRisks: function (templateId) {
    return this.risks[templateId] || [];
  },
};

console.log("templates.js loaded successfully");
