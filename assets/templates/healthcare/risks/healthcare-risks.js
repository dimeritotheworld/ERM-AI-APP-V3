/**
 * Healthcare - Risk Templates
 * Part of Dimeri ERM Risk Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.healthcare = ERM_TEMPLATES.healthcare || {};
ERM_TEMPLATES.healthcare.risks = ERM_TEMPLATES.healthcare.risks || {};

(function () {
  function uniqList(list) {
    var seen = {};
    var out = [];
    var i, item;
    for (i = 0; i < list.length; i++) {
      item = list[i];
      if (!item || seen[item]) continue;
      seen[item] = true;
      out.push(item);
    }
    return out;
  }

  function mergeList(specific, base, n, prefix) {
    var merged = uniqList((specific || []).concat(base || []));
    return merged.slice(0, n);
  }

  function buildList(base, patterns, tokens, limit) {
    var list = base.slice(0);
    var i, j, phrase;
    for (i = 0; i < patterns.length; i++) {
      for (j = 0; j < tokens.length; j++) {
        phrase = patterns[i].replace("{x}", tokens[j]);
        list.push(phrase);
      }
    }
    return uniqList(list).slice(0, limit);
  }

  var rootPatterns = [
    "Inadequate {x}",
    "Insufficient {x}",
    "Delayed {x}",
    "Unclear {x}",
    "Failure to maintain {x}",
  ];

  var consequencePatterns = [
    "Increase in {x}",
    "Loss of {x}",
    "Escalation of {x}",
    "Reduction in {x}",
    "{x} impacts",
  ];

  var actionPatterns = [
    "Improve {x}",
    "Standardize {x}",
    "Monitor {x}",
    "Strengthen {x}",
    "Review {x}",
  ];

  function buildTitles(base) {
    return [
      base,
      base + " Risk",
      base + " Incident",
      base + " Failure",
      "Risk of " + base,
      base + " Exposure",
      base + " Breakdown",
      base + " Disruption",
      base + " Control Failure",
      base + " Event",
    ];
  }

  function buildDescriptions(baseLower) {
    return [
      "The risk of " + baseLower + " leading to patient harm, disruption, or financial loss.",
      "Failures in controls related to " + baseLower + " can compromise safety, quality, and compliance.",
      baseLower.charAt(0).toUpperCase() + baseLower.slice(1) + " can occur due to process gaps, technology issues, or human error.",
      "If " + baseLower + " occurs, it may trigger regulatory scrutiny and reputational damage.",
      "This risk requires proactive monitoring and corrective actions to reduce likelihood and impact.",
    ];
  }

  function buildPlain(baseLower) {
    return [
      "We could face " + baseLower + ".",
      baseLower + " could harm patients.",
      "This could happen if controls fail for " + baseLower + ".",
      "We might see " + baseLower + " during peak demand.",
      "There is a chance of " + baseLower + " if we are not vigilant.",
      "Staff may encounter " + baseLower + " on a busy shift.",
      "This risk is about " + baseLower + " happening unexpectedly.",
      "We need to prevent " + baseLower + " before it causes harm.",
      "We could be exposed to " + baseLower + " without early warning.",
      "This is the risk that " + baseLower + " will occur.",
    ];
  }

  var domainData = {
    patientSafety: {
      keywords: ["patient", "safety", "harm", "incident", "care"],
      rootCauses: ["Protocol gaps", "Communication failures", "Staffing shortfalls", "Training gaps", "Equipment issues"],
      rootTokens: [
        "risk assessments",
        "handoff practices",
        "patient identification",
        "monitoring coverage",
        "environmental safety",
        "alarm management",
        "escalation pathways",
      ],
      consequences: ["Patient harm", "Patient death", "Extended stay", "Regulatory review", "Reputation damage"],
      consequenceTokens: [
        "patient injury",
        "family complaints",
        "length of stay",
        "regulatory scrutiny",
        "reputation damage",
        "care delays",
        "litigation exposure",
      ],
      actionPlans: ["Strengthen protocols", "Improve training", "Monitor events", "Standardize handoffs", "Audit safety controls"],
      actionTokens: [
        "safety checklists",
        "bedside rounding",
        "incident reporting",
        "escalation procedures",
        "safety audits",
        "patient education",
        "equipment checks",
      ],
      owners: { riskOwner: ["Chief Medical Officer", "Chief Nursing Officer"], actionOwner: ["Patient Safety Officer", "Quality Manager"] },
      reviewFrequency: "weekly",
      scoring: { inherentLikelihood: 4, inherentImpact: 5, residualLikelihood: 3, residualImpact: 4 },
    },
    clinicalQuality: {
      keywords: ["clinical", "quality", "outcomes", "standards", "performance"],
      rootCauses: ["Variation in care", "Delayed diagnostics", "Documentation gaps", "Coordination failures", "Resource constraints"],
      rootTokens: [
        "clinical pathways",
        "diagnostic turnaround",
        "specialist availability",
        "follow-up routines",
        "care transitions",
        "documentation quality",
        "clinical monitoring",
      ],
      consequences: ["Complications", "Readmissions", "Quality downgrades", "Patient dissatisfaction", "Cost increases"],
      consequenceTokens: [
        "complication rates",
        "readmission volumes",
        "quality ratings",
        "patient satisfaction",
        "treatment delays",
        "avoidable harm",
        "care costs",
      ],
      actionPlans: ["Standardize pathways", "Improve diagnostics", "Enhance documentation", "Coordinate care", "Track quality KPIs"],
      actionTokens: [
        "clinical pathways",
        "peer review",
        "quality dashboards",
        "care coordination",
        "case reviews",
        "follow-up protocols",
        "provider feedback",
      ],
      owners: { riskOwner: ["Chief Medical Officer", "Chief Quality Officer"], actionOwner: ["Clinical Lead", "Quality Manager"] },
      reviewFrequency: "monthly",
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
    },
    operational: {
      keywords: ["operations", "capacity", "flow", "supply", "scheduling"],
      rootCauses: ["Capacity constraints", "Process bottlenecks", "Supply delays", "Scheduling failures", "IT disruptions"],
      rootTokens: [
        "bed availability",
        "discharge barriers",
        "staff coverage",
        "transport delays",
        "inventory visibility",
        "workflow handoffs",
        "surge planning",
      ],
      consequences: ["Delays", "Access issues", "Operational disruption", "Financial loss", "Reputation impact"],
      consequenceTokens: [
        "wait times",
        "diversions",
        "service cancellations",
        "throughput loss",
        "patient complaints",
        "missed revenue",
        "staff burnout",
      ],
      actionPlans: ["Optimize flow", "Strengthen supply chain", "Improve scheduling", "Use dashboards", "Conduct drills"],
      actionTokens: [
        "capacity planning",
        "discharge coordination",
        "transport workflows",
        "inventory controls",
        "surge protocols",
        "throughput metrics",
        "escalation triggers",
      ],
      owners: { riskOwner: ["Chief Operating Officer"], actionOwner: ["Operations Manager", "Patient Flow Lead"] },
      reviewFrequency: "weekly",
      scoring: { inherentLikelihood: 4, inherentImpact: 4, residualLikelihood: 3, residualImpact: 3 },
    },
    workforce: {
      keywords: ["workforce", "staffing", "competency", "burnout", "safety"],
      rootCauses: ["Recruitment challenges", "Retention issues", "Burnout", "Training gaps", "Scheduling inefficiency"],
      rootTokens: [
        "staffing models",
        "roster design",
        "training capacity",
        "leadership support",
        "workload balance",
        "credentialing timelines",
        "engagement programs",
      ],
      consequences: ["Staff shortages", "Quality risks", "Overtime costs", "Turnover", "Safety incidents"],
      consequenceTokens: [
        "vacancy rates",
        "agency costs",
        "overtime usage",
        "patient safety events",
        "service capacity",
        "staff morale",
        "retention risk",
      ],
      actionPlans: ["Recruitment plan", "Retention strategies", "Competency assessments", "Wellbeing programs", "Optimize scheduling"],
      actionTokens: [
        "recruitment pipelines",
        "retention incentives",
        "training plans",
        "wellbeing support",
        "skill mix reviews",
        "staffing dashboards",
        "succession planning",
      ],
      owners: { riskOwner: ["Chief Human Resources Officer", "Chief Nursing Officer"], actionOwner: ["HR Director", "Nursing Director"] },
      reviewFrequency: "monthly",
      scoring: { inherentLikelihood: 4, inherentImpact: 4, residualLikelihood: 3, residualImpact: 3 },
    },
    technology: {
      keywords: ["technology", "system", "downtime", "cyber", "data"],
      rootCauses: ["Configuration errors", "Vulnerabilities", "Monitoring gaps", "Network issues", "Change failures"],
      rootTokens: [
        "patch management",
        "access controls",
        "interface stability",
        "backup testing",
        "capacity planning",
        "vendor support",
        "incident response",
      ],
      consequences: ["Downtime", "Data loss", "Service disruption", "Financial loss", "Patient safety impact"],
      consequenceTokens: [
        "system outages",
        "workflow disruptions",
        "data integrity issues",
        "care delays",
        "recovery costs",
        "security incidents",
        "regulatory reporting",
      ],
      actionPlans: ["Change management", "Security controls", "Backup testing", "Monitoring", "Incident response"],
      actionTokens: [
        "system monitoring",
        "cybersecurity controls",
        "recovery testing",
        "interface validation",
        "access audits",
        "incident drills",
        "vendor escalation",
      ],
      owners: { riskOwner: ["Chief Information Officer", "Chief Information Security Officer"], actionOwner: ["IT Director", "Security Manager"] },
      reviewFrequency: "monthly",
      scoring: { inherentLikelihood: 4, inherentImpact: 4, residualLikelihood: 3, residualImpact: 3 },
    },
    regulatory: {
      keywords: ["regulatory", "compliance", "audit", "licensing", "standards"],
      rootCauses: ["Policy noncompliance", "Documentation gaps", "Training gaps", "Oversight weakness", "Delayed actions"],
      rootTokens: [
        "policy awareness",
        "evidence files",
        "audit readiness",
        "license renewals",
        "reporting deadlines",
        "control testing",
        "third-party oversight",
      ],
      consequences: ["Findings", "Penalties", "Service restrictions", "Reputation damage", "Operational disruption"],
      consequenceTokens: [
        "survey findings",
        "license conditions",
        "compliance penalties",
        "public reporting impact",
        "oversight costs",
        "service limitations",
        "stakeholder concern",
      ],
      actionPlans: ["Compliance audits", "Policy updates", "Training", "Mock surveys", "Corrective tracking"],
      actionTokens: [
        "readiness checks",
        "policy updates",
        "training completion",
        "corrective action tracking",
        "documentation audits",
        "regulatory monitoring",
        "evidence management",
      ],
      owners: { riskOwner: ["Chief Compliance Officer"], actionOwner: ["Compliance Manager", "Regulatory Lead"] },
      reviewFrequency: "monthly",
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
    },
    financial: {
      keywords: ["financial", "revenue", "billing", "cash", "payer"],
      rootCauses: ["Coding errors", "Denial management", "Contracting gaps", "Cost overruns", "Cash flow issues"],
      rootTokens: [
        "clean claim rates",
        "pricing accuracy",
        "payer contract terms",
        "collection workflows",
        "charge capture",
        "cost controls",
        "billing timeliness",
      ],
      consequences: ["Cash pressure", "Margin decline", "Project delays", "Credit impact", "Staffing constraints"],
      consequenceTokens: [
        "cash reserves",
        "margin erosion",
        "capital deferrals",
        "credit risk",
        "vendor delays",
        "staffing freezes",
        "service reductions",
      ],
      actionPlans: ["Revenue cycle improvement", "Contract review", "Cost controls", "Cash monitoring", "Audit billing"],
      actionTokens: [
        "denial prevention",
        "coding audits",
        "payer negotiations",
        "collection improvement",
        "cost containment",
        "cash forecasting",
        "charge capture checks",
      ],
      owners: { riskOwner: ["Chief Financial Officer"], actionOwner: ["Revenue Cycle Director", "Finance Director"] },
      reviewFrequency: "monthly",
      scoring: { inherentLikelihood: 4, inherentImpact: 4, residualLikelihood: 3, residualImpact: 3 },
    },
    strategic: {
      keywords: ["strategy", "growth", "market", "investment", "governance"],
      rootCauses: ["Market change", "Misaligned strategy", "Capital constraints", "Weak governance", "Execution gaps"],
      rootTokens: [
        "strategy alignment",
        "capital prioritization",
        "market intelligence",
        "partnership evaluation",
        "program governance",
        "change capacity",
        "portfolio balance",
      ],
      consequences: ["Strategic miss", "Market share loss", "Financial underperformance", "Reputation impact", "Leadership scrutiny"],
      consequenceTokens: [
        "growth targets",
        "portfolio performance",
        "investment returns",
        "stakeholder confidence",
        "service availability",
        "competitive position",
        "board scrutiny",
      ],
      actionPlans: ["Strategic refresh", "Scenario planning", "Governance oversight", "Capital prioritization", "KPIs"],
      actionTokens: [
        "strategic reviews",
        "market scanning",
        "portfolio governance",
        "capital discipline",
        "execution tracking",
        "stakeholder engagement",
        "benefits realization",
      ],
      owners: { riskOwner: ["Chief Executive Officer", "Chief Strategy Officer"], actionOwner: ["Strategy Director"] },
      reviewFrequency: "quarterly",
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
    },
    reputation: {
      keywords: ["reputation", "brand", "media", "trust", "complaints"],
      rootCauses: ["Adverse events", "Poor communication", "Service failures", "Media coverage", "Unresolved complaints"],
      rootTokens: [
        "public messaging",
        "complaint follow-up",
        "service recovery",
        "transparency practices",
        "media response",
        "community engagement",
        "experience monitoring",
      ],
      consequences: ["Trust erosion", "Referral decline", "Negative media", "Stakeholder concern", "Financial loss"],
      consequenceTokens: [
        "reputation scores",
        "patient trust",
        "referral volumes",
        "media scrutiny",
        "community confidence",
        "market share",
        "staff morale",
      ],
      actionPlans: ["Crisis communications", "Complaint resolution", "Transparency", "Media monitoring", "Patient experience"],
      actionTokens: [
        "communications plans",
        "service recovery",
        "public reporting accuracy",
        "stakeholder updates",
        "complaint management",
        "community outreach",
        "experience surveys",
      ],
      owners: { riskOwner: ["Chief Executive Officer", "Communications Director"], actionOwner: ["Public Relations Lead"] },
      reviewFrequency: "monthly",
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
    },
    thirdParty: {
      keywords: ["vendor", "third-party", "outsourcing", "supplier", "contract"],
      rootCauses: ["Vendor capacity", "Service level breaches", "Quality defects", "Single-source dependency", "Oversight gaps"],
      rootTokens: [
        "vendor oversight",
        "service level tracking",
        "contract terms",
        "cybersecurity controls",
        "supply resilience",
        "quality inspections",
        "incident response coordination",
      ],
      consequences: ["Service disruption", "Quality failures", "Regulatory findings", "Financial losses", "Reputation impact"],
      consequenceTokens: [
        "service interruptions",
        "clinical delays",
        "compliance findings",
        "replacement costs",
        "data exposure",
        "supplier risk",
        "stakeholder concern",
      ],
      actionPlans: ["Vendor due diligence", "Performance monitoring", "Contingency plans", "Contract governance", "Compliance audits"],
      actionTokens: [
        "vendor scorecards",
        "contract enforcement",
        "contingency sourcing",
        "security requirements",
        "performance reviews",
        "compliance attestations",
        "risk assessments",
      ],
      owners: { riskOwner: ["Chief Operating Officer", "Procurement Director"], actionOwner: ["Vendor Manager"] },
      reviewFrequency: "quarterly",
      scoring: { inherentLikelihood: 3, inherentImpact: 4, residualLikelihood: 2, residualImpact: 3 },
    },
  };

  var riskDefs = [
    { id: "medication-error-harm", name: "Medication Error Causing Patient Harm", domain: "patientSafety", keywords: ["medication", "error", "dose", "drug", "reconciliation"], related: ["quality-patient-safety", "pharmacy-medication-safety"] },
    { id: "medication-error-fatal", name: "Fatal Medication Error", domain: "patientSafety", keywords: ["medication", "fatal", "overdose", "high-alert"], related: ["quality-patient-safety", "pharmacy-medication-safety"] },
    { id: "patient-fall-injury", name: "Patient Fall with Injury", domain: "patientSafety", keywords: ["fall", "injury", "mobility", "bed alarm"], related: ["nursing-patient-safety"] },
    { id: "patient-fall-fatal", name: "Patient Fall Resulting in Death", domain: "patientSafety", keywords: ["fall", "fatal", "head injury", "trauma"], related: ["nursing-patient-safety"] },
    { id: "surgical-never-event", name: "Surgical Never Event", domain: "patientSafety", keywords: ["wrong site", "retained item", "timeout", "surgery"], related: ["surgical-patient-safety"] },
    { id: "healthcare-acquired-infection", name: "Healthcare-Acquired Infection", domain: "patientSafety", keywords: ["HAI", "infection", "CLABSI", "CAUTI"], related: ["infection-control-infection-prevention"] },
    { id: "pressure-injury-harm", name: "Pressure Injury Harm", domain: "patientSafety", keywords: ["pressure injury", "skin", "ulcer", "wound"], related: ["nursing-clinical-quality"] },
    { id: "patient-elopement", name: "Patient Elopement", domain: "patientSafety", keywords: ["elopement", "missing", "behavioral", "security"], related: ["quality-patient-safety"] },
    { id: "behavioral-health-self-harm", name: "Behavioral Health Self-Harm", domain: "patientSafety", keywords: ["self-harm", "suicide", "behavioral", "risk"], related: ["quality-patient-safety"] },
    { id: "transfusion-reaction", name: "Transfusion Reaction", domain: "patientSafety", keywords: ["transfusion", "blood bank", "reaction", "compatibility"], related: ["laboratory-diagnostic-accuracy"] },

    { id: "diagnostic-error-delay", name: "Diagnostic Error or Delay", domain: "clinicalQuality", keywords: ["diagnostic", "delay", "missed", "error"], related: ["quality-diagnostic-accuracy"] },
    { id: "sepsis-recognition-delay", name: "Sepsis Recognition Delay", domain: "clinicalQuality", keywords: ["sepsis", "delay", "bundle", "recognition"], related: ["quality-clinical-quality"] },
    { id: "readmission-spike", name: "Readmission Rate Spike", domain: "clinicalQuality", keywords: ["readmission", "transition", "follow-up", "discharge"], related: ["quality-clinical-quality"] },
    { id: "clinical-pathway-variance", name: "Clinical Pathway Variance", domain: "clinicalQuality", keywords: ["pathway", "variation", "protocol", "standard"], related: ["clinical-services-clinical-quality"] },
    { id: "documentation-integrity-failure", name: "Clinical Documentation Integrity Failure", domain: "clinicalQuality", keywords: ["documentation", "accuracy", "completeness", "coding"], related: ["clinical-services-documentation-integrity"] },
    { id: "maternal-neonatal-harm", name: "Maternal or Neonatal Harm", domain: "clinicalQuality", keywords: ["obstetrics", "neonatal", "birth", "complication"], related: ["quality-clinical-quality"] },
    { id: "imaging-diagnostic-delay", name: "Imaging Diagnostic Delay", domain: "clinicalQuality", keywords: ["imaging", "delay", "radiology", "report"], related: ["imaging-diagnostic-accuracy"] },
    { id: "laboratory-error", name: "Laboratory Testing Error", domain: "clinicalQuality", keywords: ["laboratory", "specimen", "error", "results"], related: ["laboratory-diagnostic-accuracy"] },

    { id: "ed-overcrowding", name: "Emergency Department Overcrowding", domain: "operational", keywords: ["ED", "overcrowding", "boarding", "wait"], related: ["operations-patient-flow"] },
    { id: "discharge-delay", name: "Discharge Delay", domain: "operational", keywords: ["discharge", "delay", "placement", "bed"], related: ["operations-discharge-planning"] },
    { id: "capacity-crisis", name: "Capacity Crisis", domain: "operational", keywords: ["capacity", "surge", "census", "overflow"], related: ["operations-capacity-management"] },
    { id: "supply-chain-disruption", name: "Supply Chain Disruption", domain: "operational", keywords: ["supply", "shortage", "inventory", "vendor"], related: ["procurement-critical-supplies"] },
    { id: "equipment-failure-critical", name: "Critical Equipment Failure", domain: "operational", keywords: ["equipment", "failure", "device", "downtime"], related: ["facilities-maintenance-reliability"] },
    { id: "ambulance-diversion", name: "Ambulance Diversion", domain: "operational", keywords: ["diversion", "ambulance", "capacity", "ED"], related: ["operations-patient-flow"] },
    { id: "utility-outage", name: "Utility Outage", domain: "operational", keywords: ["power", "water", "HVAC", "utility"], related: ["facilities-utilities-management"] },
    { id: "scheduling-breakdown", name: "Scheduling Breakdown", domain: "operational", keywords: ["scheduling", "access", "appointment", "delay"], related: ["operations-scheduling-access"] },

    { id: "staffing-shortage-crisis", name: "Staffing Shortage Crisis", domain: "workforce", keywords: ["staffing", "vacancy", "coverage", "ratio"], related: ["hr-workforce-planning"] },
    { id: "workforce-burnout", name: "Workforce Burnout", domain: "workforce", keywords: ["burnout", "fatigue", "turnover", "morale"], related: ["hr-burnout-wellbeing"] },
    { id: "competency-gaps", name: "Competency Gaps", domain: "workforce", keywords: ["competency", "training", "skills", "performance"], related: ["hr-credentialing-competency"] },
    { id: "labor-disruption", name: "Labor Disruption", domain: "workforce", keywords: ["strike", "labor", "union", "disruption"], related: ["hr-labor-relations"] },
    { id: "workplace-violence-incident", name: "Workplace Violence Incident", domain: "workforce", keywords: ["violence", "assault", "threat", "security"], related: ["hr-workplace-safety"] },
    { id: "staff-exposure-outbreak", name: "Staff Exposure Outbreak", domain: "workforce", keywords: ["exposure", "infection", "staff", "outbreak"], related: ["infection-control-infection-prevention"] },

    { id: "ehr-downtime", name: "EHR System Downtime", domain: "technology", keywords: ["EHR", "downtime", "outage", "system"], related: ["it-ehr-availability"] },
    { id: "cybersecurity-attack", name: "Cybersecurity Attack", domain: "technology", keywords: ["cyber", "ransomware", "phishing", "breach"], related: ["it-cybersecurity"] },
    { id: "data-integrity-loss", name: "Clinical Data Integrity Loss", domain: "technology", keywords: ["data", "integrity", "loss", "corruption"], related: ["it-data-governance"] },
    { id: "medical-device-cybersecurity", name: "Medical Device Cybersecurity Risk", domain: "technology", keywords: ["device", "cybersecurity", "IoMT", "vulnerability"], related: ["it-device-integration"] },
    { id: "interoperability-failure", name: "Interoperability Failure", domain: "technology", keywords: ["interface", "integration", "data exchange", "HIE"], related: ["it-interoperability"] },
    { id: "telehealth-service-failure", name: "Telehealth Service Failure", domain: "technology", keywords: ["telehealth", "virtual", "remote", "platform"], related: ["it-interoperability"] },

    { id: "regulatory-noncompliance", name: "Regulatory Non-Compliance", domain: "regulatory", keywords: ["regulatory", "compliance", "survey", "finding"], related: ["legal-regulatory-compliance"] },
    { id: "accreditation-loss", name: "Accreditation Loss", domain: "regulatory", keywords: ["accreditation", "standards", "survey", "loss"], related: ["legal-regulatory-compliance"] },
    { id: "privacy-breach-incident", name: "Privacy Breach Incident", domain: "regulatory", keywords: ["privacy", "breach", "records", "unauthorized"], related: ["legal-privacy-confidentiality"] },
    { id: "controlled-substance-diversion", name: "Controlled Substance Diversion", domain: "regulatory", keywords: ["diversion", "controlled", "opioid", "audit"], related: ["pharmacy-medication-safety"] },
    { id: "licensing-lapse", name: "Licensing Lapse", domain: "regulatory", keywords: ["license", "credential", "renewal", "permit"], related: ["legal-licensing-credentialing"] },
    { id: "billing-compliance-breach", name: "Billing Compliance Breach", domain: "regulatory", keywords: ["billing", "compliance", "audit", "overpayment"], related: ["finance-fraud-waste-abuse"] },

    { id: "revenue-cycle-failure", name: "Revenue Cycle Failure", domain: "financial", keywords: ["revenue", "billing", "denials", "collections"], related: ["finance-revenue-cycle"] },
    { id: "payer-mix-deterioration", name: "Payer Mix Deterioration", domain: "financial", keywords: ["payer mix", "insurance", "reimbursement", "margin"], related: ["finance-payer-contracting"] },
    { id: "reimbursement-rate-cut", name: "Reimbursement Rate Reduction", domain: "financial", keywords: ["rate cut", "reimbursement", "payment", "margin"], related: ["finance-reimbursement-models"] },
    { id: "fraud-waste-abuse-loss", name: "Fraud, Waste and Abuse Loss", domain: "financial", keywords: ["fraud", "abuse", "overbilling", "penalty"], related: ["finance-fraud-waste-abuse"] },
    { id: "cash-flow-crisis", name: "Cash Flow Crisis", domain: "financial", keywords: ["cash flow", "liquidity", "reserves", "covenant"], related: ["finance-cash-flow"] },

    { id: "reputation-crisis", name: "Reputation Crisis", domain: "reputation", keywords: ["reputation", "media", "public", "trust"], related: ["marketing-reputation-communications"] },
    { id: "community-trust-erosion", name: "Community Trust Erosion", domain: "reputation", keywords: ["community", "trust", "engagement", "confidence"], related: ["marketing-community-outreach"] },
    { id: "vendor-service-failure", name: "Vendor Service Failure", domain: "thirdParty", keywords: ["vendor", "service", "SLA", "outsourcing"], related: ["procurement-vendor-management"] },
    { id: "outsourced-lab-error", name: "Outsourced Lab Error", domain: "thirdParty", keywords: ["reference lab", "outsourced", "results", "quality"], related: ["procurement-vendor-management"] },
    { id: "merger-integration-failure", name: "Merger Integration Failure", domain: "strategic", keywords: ["integration", "merger", "acquisition", "synergy"], related: ["executive-mergers-acquisitions"] },
    { id: "capital-project-overrun", name: "Capital Project Overrun", domain: "strategic", keywords: ["capital", "project", "overrun", "schedule"], related: ["executive-capital-allocation"] },
  ];

  function buildRisk(def) {
    var domain = domainData[def.domain];
    var baseLower = def.name.toLowerCase();
    return {
      id: def.id,
      titles: buildTitles(def.name),
      descriptions: buildDescriptions(baseLower),
      keywords: mergeList(
        def.keywords.concat(domain.keywords, domain.rootTokens, domain.actionTokens),
        ["healthcare", "risk", "control"],
        20
      ),
      plainLanguage: buildPlain(baseLower),
      rootCauses: buildList(mergeList(def.rootCauses || [], domain.rootCauses, 15), rootPatterns, domain.rootTokens, 15),
      consequences: buildList(mergeList(def.consequences || [], domain.consequences, 15), consequencePatterns, domain.consequenceTokens, 15),
      actionPlans: buildList(mergeList(def.actionPlans || [], domain.actionPlans, 15), actionPatterns, domain.actionTokens, 15),
      treatment: {
        recommended: "mitigate",
        reasoning: "Risk requires proactive controls to reduce likelihood and impact",
        alternatives: ["accept", "transfer"],
        whyNotOthers: "Acceptance only when within appetite; transfer is limited for clinical and reputational impacts",
      },
      owners: {
        riskOwner: domain.owners.riskOwner,
        actionOwner: domain.owners.actionOwner,
      },
      timing: {
        targetDateOptions: [
          { value: 7, unit: "days", reason: "Address immediate risk controls" },
          { value: 30, unit: "days", reason: "Implement corrective actions" },
          { value: 90, unit: "days", reason: "Validate sustained improvement" },
        ],
        reviewFrequency: domain.reviewFrequency,
      },
      scoring: {
        inherentLikelihood: domain.scoring.inherentLikelihood,
        inherentImpact: domain.scoring.inherentImpact,
        residualLikelihood: domain.scoring.residualLikelihood,
        residualImpact: domain.scoring.residualImpact,
        rationale: "Baseline risk is material; controls reduce impact and likelihood",
      },
      relatedCategories: def.related,
    };
  }

  var groups = {
    patientSafety: [],
    clinicalQuality: [],
    operational: [],
    workforce: [],
    technology: [],
    regulatory: [],
    financial: [],
    reputation: [],
    strategic: [],
    thirdParty: [],
  };

  var i;
  for (i = 0; i < riskDefs.length; i++) {
    groups[riskDefs[i].domain].push(buildRisk(riskDefs[i]));
  }

  ERM_TEMPLATES.healthcare.risks.patientSafety = groups.patientSafety;
  ERM_TEMPLATES.healthcare.risks.clinicalQuality = groups.clinicalQuality;
  ERM_TEMPLATES.healthcare.risks.operational = groups.operational;
  ERM_TEMPLATES.healthcare.risks.workforce = groups.workforce;
  ERM_TEMPLATES.healthcare.risks.technology = groups.technology;
  ERM_TEMPLATES.healthcare.risks.regulatory = groups.regulatory;
  ERM_TEMPLATES.healthcare.risks.financial = groups.financial;
  ERM_TEMPLATES.healthcare.risks.reputation = groups.reputation;
  ERM_TEMPLATES.healthcare.risks.strategic = groups.strategic;
  ERM_TEMPLATES.healthcare.risks.thirdParty = groups.thirdParty;
})();

// ============================================
// HELPER FUNCTIONS
// ============================================
ERM_TEMPLATES.healthcare.risks.getAll = function () {
  var all = [];
  var categories = [
    "patientSafety",
    "clinicalQuality",
    "operational",
    "workforce",
    "technology",
    "regulatory",
    "financial",
    "reputation",
    "strategic",
    "thirdParty",
  ];
  for (var i = 0; i < categories.length; i++) {
    var cat = this[categories[i]];
    if (cat && Array.isArray(cat)) {
      for (var j = 0; j < cat.length; j++) {
        cat[j].riskCategory = categories[i];
        all.push(cat[j]);
      }
    }
  }
  return all;
};

ERM_TEMPLATES.healthcare.risks.findById = function (id) {
  var all = this.getAll();
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) return all[i];
  }
  return null;
};

ERM_TEMPLATES.healthcare.risks.search = function (keyword) {
  var results = [];
  var lowerKeyword = keyword.toLowerCase();
  var all = this.getAll();
  for (var i = 0; i < all.length; i++) {
    var risk = all[i];
    var found = false;
    for (var j = 0; j < risk.titles.length; j++) {
      if (risk.titles[j].toLowerCase().indexOf(lowerKeyword) !== -1) {
        found = true;
        break;
      }
    }
    if (!found && risk.keywords) {
      for (var k = 0; k < risk.keywords.length; k++) {
        if (risk.keywords[k].toLowerCase().indexOf(lowerKeyword) !== -1) {
          found = true;
          break;
        }
      }
    }
    if (!found && risk.plainLanguage) {
      for (var p = 0; p < risk.plainLanguage.length; p++) {
        if (risk.plainLanguage[p].toLowerCase().indexOf(lowerKeyword) !== -1) {
          found = true;
          break;
        }
      }
    }
    if (found) results.push(risk);
  }
  return results;
};

console.log("Healthcare Risk Templates loaded - " + ERM_TEMPLATES.healthcare.risks.getAll().length + " risks");
