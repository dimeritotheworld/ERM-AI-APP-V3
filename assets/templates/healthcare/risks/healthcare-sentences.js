/**
 * Healthcare & Medical Services - Sentence Builder Data
 * Dimeri ERM Template Library
 *
 * PURE DATA FILE - No logic here
 * Logic is in: _shared/sentence-builder.js
 *
 * This file defines:
 * - what: Hazards/risk types specific to healthcare
 * - where: Locations (contextual based on hazard)
 * - impact: Consequences
 * - mappings: Connect sentences to risk template IDs
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.healthcare = ERM_TEMPLATES.healthcare || {};

ERM_TEMPLATES.healthcare.sentences = {
  /* ========================================
     WHAT - What could go wrong?
     Healthcare-specific hazards and risk types
     ======================================== */
  what: [
    {
      id: "patient-fall",
      label: "Patient fall",
      icon: "risk",
      keywords: ["fall", "slip", "trip", "patient safety", "injury"],
      thinkingText: "Analyzing patient fall hazards...",
    },
    {
      id: "medication-error",
      label: "Medication error",
      icon: "risk",
      keywords: ["medication", "drug", "prescription", "dose", "wrong medication"],
      thinkingText: "Analyzing medication safety risks...",
    },
    {
      id: "surgical-error",
      label: "Surgical error",
      icon: "risk",
      keywords: ["surgery", "procedure", "wrong site", "surgical", "operative"],
      thinkingText: "Analyzing surgical safety risks...",
    },
    {
      id: "infection",
      label: "Healthcare-associated infection",
      icon: "risk",
      keywords: ["infection", "HAI", "CLABSI", "CAUTI", "SSI", "sepsis"],
      thinkingText: "Analyzing infection risks...",
    },
    {
      id: "diagnostic-error",
      label: "Diagnostic error",
      icon: "risk",
      keywords: ["diagnosis", "misdiagnosis", "delayed", "missed", "error"],
      thinkingText: "Analyzing diagnostic accuracy risks...",
    },
    {
      id: "privacy-breach",
      label: "Privacy / data breach",
      icon: "risk",
      keywords: ["privacy", "patient data", "breach", "data", "security"],
      thinkingText: "Analyzing privacy and security risks...",
    },
    {
      id: "staffing-shortage",
      label: "Staffing shortage",
      icon: "risk",
      keywords: ["staffing", "shortage", "nurse", "physician", "workforce"],
      thinkingText: "Analyzing workforce risks...",
    },
    {
      id: "equipment-failure",
      label: "Medical equipment failure",
      icon: "risk",
      keywords: ["equipment", "device", "failure", "malfunction", "biomedical"],
      thinkingText: "Analyzing equipment risks...",
    },
    {
      id: "supply-shortage",
      label: "Critical supply shortage",
      icon: "risk",
      keywords: ["supply", "shortage", "PPE", "medication", "inventory"],
      thinkingText: "Analyzing supply chain risks...",
    },
    {
      id: "regulatory-violation",
      label: "Regulatory violation",
      icon: "risk",
      keywords: ["compliance", "regulation", "violation", "survey", "accreditation"],
      thinkingText: "Analyzing regulatory risks...",
    },
    {
      id: "patient-elopement",
      label: "Patient elopement",
      icon: "risk",
      keywords: ["elopement", "leave", "missing", "escape"],
      thinkingText: "Analyzing patient security risks...",
    },
    {
      id: "workplace-violence",
      label: "Workplace violence",
      icon: "risk",
      keywords: ["violence", "assault", "aggression", "threat", "safety"],
      thinkingText: "Analyzing workplace safety risks...",
    },
    {
      id: "system-downtime",
      label: "IT system downtime",
      icon: "risk",
      keywords: ["EHR", "system", "downtime", "outage", "IT"],
      thinkingText: "Analyzing technology risks...",
    },
    {
      id: "billing-error",
      label: "Billing / coding error",
      icon: "risk",
      keywords: ["billing", "coding", "claim", "denial", "revenue"],
      thinkingText: "Analyzing revenue cycle risks...",
    },
    {
      id: "malpractice-claim",
      label: "Malpractice claim",
      icon: "risk",
      keywords: ["malpractice", "lawsuit", "liability", "negligence", "claim"],
      thinkingText: "Analyzing legal liability risks...",
    },
    {
      id: "capacity-crisis",
      label: "Capacity / overcrowding",
      icon: "risk",
      keywords: ["capacity", "overcrowding", "boarding", "diversion", "bed"],
      thinkingText: "Analyzing capacity risks...",
    },
    {
      id: "cyber-attack",
      label: "Cybersecurity attack",
      icon: "risk",
      keywords: ["cyber", "ransomware", "phishing", "attack", "breach"],
      thinkingText: "Analyzing cybersecurity risks...",
    },
    {
      id: "self-harm",
      label: "Behavioral health self-harm",
      icon: "risk",
      keywords: ["self-harm", "suicide", "behavioral", "mental health", "risk"],
      thinkingText: "Analyzing behavioral health risks...",
    },
    {
      id: "sepsis-delay",
      label: "Sepsis recognition delay",
      icon: "risk",
      keywords: ["sepsis", "delay", "bundle", "recognition", "treatment"],
      thinkingText: "Analyzing sepsis risks...",
    },
  ],

  /* ========================================
     WHERE - Where could this happen?
     Contextual based on WHAT selection
     Key = what.id, Value = array of locations
     ======================================== */
  where: {
    "patient-fall": [
      { id: "patient-room", label: "Patient room", icon: "loc" },
      { id: "bathroom", label: "Bathroom", icon: "loc" },
      { id: "hallway", label: "Hallway / corridor", icon: "loc" },
      { id: "exam-room", label: "Exam room", icon: "loc" },
      { id: "rehab", label: "Rehabilitation", icon: "loc" },
    ],
    "medication-error": [
      { id: "nursing-unit", label: "Nursing unit", icon: "loc" },
      { id: "pharmacy", label: "Pharmacy", icon: "loc" },
      { id: "operating-room", label: "Operating room", icon: "loc" },
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
      { id: "icu", label: "ICU / Critical care", icon: "loc" },
    ],
    "surgical-error": [
      { id: "operating-room", label: "Operating room", icon: "loc" },
      { id: "procedure-room", label: "Procedure room", icon: "loc" },
      { id: "cath-lab", label: "Cath lab", icon: "loc" },
      { id: "endoscopy", label: "Endoscopy suite", icon: "loc" },
    ],
    "infection": [
      { id: "icu", label: "ICU / Critical care", icon: "loc" },
      { id: "surgical-floor", label: "Surgical floor", icon: "loc" },
      { id: "dialysis", label: "Dialysis unit", icon: "loc" },
      { id: "oncology", label: "Oncology unit", icon: "loc" },
      { id: "operating-room", label: "Operating room", icon: "loc" },
    ],
    "diagnostic-error": [
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
      { id: "radiology", label: "Radiology", icon: "loc" },
      { id: "laboratory", label: "Laboratory", icon: "loc" },
      { id: "pathology", label: "Pathology", icon: "loc" },
      { id: "primary-care", label: "Primary care clinic", icon: "loc" },
    ],
    "privacy-breach": [
      { id: "registration", label: "Registration / admitting", icon: "loc" },
      { id: "nursing-station", label: "Nursing station", icon: "loc" },
      { id: "health-information", label: "Health Information", icon: "loc" },
      { id: "billing-office", label: "Billing office", icon: "loc" },
      { id: "remote-access", label: "Remote access", icon: "loc" },
    ],
    "staffing-shortage": [
      { id: "nursing-units", label: "Nursing units", icon: "loc" },
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
      { id: "operating-room", label: "Operating room", icon: "loc" },
      { id: "icu", label: "ICU", icon: "loc" },
      { id: "laboratory", label: "Laboratory", icon: "loc" },
    ],
    "equipment-failure": [
      { id: "icu", label: "ICU / Critical care", icon: "loc" },
      { id: "operating-room", label: "Operating room", icon: "loc" },
      { id: "radiology", label: "Radiology / imaging", icon: "loc" },
      { id: "laboratory", label: "Laboratory", icon: "loc" },
      { id: "dialysis", label: "Dialysis unit", icon: "loc" },
    ],
    "supply-shortage": [
      { id: "central-supply", label: "Central supply", icon: "loc" },
      { id: "pharmacy", label: "Pharmacy", icon: "loc" },
      { id: "operating-room", label: "Operating room", icon: "loc" },
      { id: "nursing-units", label: "Nursing units", icon: "loc" },
    ],
    "regulatory-violation": [
      { id: "entire-facility", label: "Entire facility", icon: "loc" },
      { id: "pharmacy", label: "Pharmacy", icon: "loc" },
      { id: "laboratory", label: "Laboratory", icon: "loc" },
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
    ],
    "patient-elopement": [
      { id: "behavioral-health", label: "Behavioral health", icon: "loc" },
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
      { id: "nursing-units", label: "Nursing units", icon: "loc" },
    ],
    "workplace-violence": [
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
      { id: "behavioral-health", label: "Behavioral health", icon: "loc" },
      { id: "waiting-areas", label: "Waiting areas", icon: "loc" },
      { id: "parking-areas", label: "Parking areas", icon: "loc" },
    ],
    "system-downtime": [
      { id: "entire-facility", label: "Entire facility", icon: "loc" },
      { id: "data-center", label: "Data center", icon: "loc" },
      { id: "nursing-stations", label: "Nursing stations", icon: "loc" },
      { id: "pharmacy", label: "Pharmacy", icon: "loc" },
    ],
    "billing-error": [
      { id: "billing-office", label: "Billing office", icon: "loc" },
      { id: "health-information", label: "Health Information", icon: "loc" },
      { id: "registration", label: "Registration", icon: "loc" },
    ],
    "malpractice-claim": [
      { id: "clinical-areas", label: "Clinical areas", icon: "loc" },
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
      { id: "operating-room", label: "Operating room", icon: "loc" },
      { id: "obstetrics", label: "Obstetrics", icon: "loc" },
    ],
    "capacity-crisis": [
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
      { id: "icu", label: "ICU", icon: "loc" },
      { id: "inpatient-units", label: "Inpatient units", icon: "loc" },
      { id: "operating-room", label: "Operating room", icon: "loc" },
    ],
    "cyber-attack": [
      { id: "network", label: "Network", icon: "loc" },
      { id: "data-center", label: "Data center", icon: "loc" },
      { id: "endpoints", label: "Endpoints", icon: "loc" },
      { id: "remote-access", label: "Remote access", icon: "loc" },
    ],
    "self-harm": [
      { id: "behavioral-health", label: "Behavioral health", icon: "loc" },
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
      { id: "inpatient-units", label: "Inpatient units", icon: "loc" },
    ],
    "sepsis-delay": [
      { id: "emergency-dept", label: "Emergency department", icon: "loc" },
      { id: "icu", label: "ICU", icon: "loc" },
      { id: "inpatient-units", label: "Inpatient units", icon: "loc" },
    ],

    // Default locations for any unmapped hazard
    default: [
      { id: "entire-facility", label: "Entire facility", icon: "loc" },
      { id: "clinical-areas", label: "Clinical areas", icon: "loc" },
      { id: "administrative-areas", label: "Administrative areas", icon: "loc" },
      { id: "support-services", label: "Support services", icon: "loc" },
    ],
  },

  /* ========================================
     IMPACT - What's the consequence?
     Severity levels for risk scoring
     ======================================== */
  impact: [
    {
      id: "patient-death",
      label: "Patient death",
      icon: "impact",
      severity: 5,
      thinkingText: "Assessing catastrophic outcomes...",
    },
    {
      id: "permanent-harm",
      label: "Permanent patient harm",
      icon: "impact",
      severity: 5,
      thinkingText: "Assessing major harm outcomes...",
    },
    {
      id: "serious-harm",
      label: "Serious temporary harm",
      icon: "impact",
      severity: 4,
      thinkingText: "Assessing serious harm outcomes...",
    },
    {
      id: "moderate-harm",
      label: "Moderate harm / extended stay",
      icon: "impact",
      severity: 3,
      thinkingText: "Assessing moderate harm outcomes...",
    },
    {
      id: "minor-harm",
      label: "Minor harm / no extended stay",
      icon: "impact",
      severity: 2,
      thinkingText: "Assessing minor harm outcomes...",
    },
    {
      id: "near-miss",
      label: "Near miss / no harm",
      icon: "impact",
      severity: 1,
      thinkingText: "Assessing near miss outcomes...",
    },
    {
      id: "regulatory-action",
      label: "Regulatory action / sanctions",
      icon: "impact",
      severity: 4,
      thinkingText: "Assessing regulatory impacts...",
    },
    {
      id: "accreditation-loss",
      label: "Loss of accreditation",
      icon: "impact",
      severity: 5,
      thinkingText: "Assessing accreditation impacts...",
    },
    {
      id: "major-financial-loss",
      label: "Major financial loss (>$1M)",
      icon: "impact",
      severity: 4,
      thinkingText: "Assessing financial impacts...",
    },
    {
      id: "reputation-damage",
      label: "Significant reputation damage",
      icon: "impact",
      severity: 3,
      thinkingText: "Assessing reputational impacts...",
    },
    {
      id: "service-disruption",
      label: "Major service disruption",
      icon: "impact",
      severity: 4,
      thinkingText: "Assessing operational impacts...",
    },
    {
      id: "legal-action",
      label: "Malpractice lawsuit",
      icon: "impact",
      severity: 4,
      thinkingText: "Assessing legal impacts...",
    },
  ],

  /* ========================================
     MAPPINGS - Connect sentences to templates
     Format: "what|where|impact" => [risk-ids]
     Use "*" as wildcard for any value
     ======================================== */
  mappings: {
    "patient-fall|*|patient-death": ["patient-fall-fatal"],
    "patient-fall|*|serious-harm": ["patient-fall-injury"],
    "patient-fall|*|moderate-harm": ["patient-fall-injury"],

    "medication-error|*|patient-death": ["medication-error-fatal"],
    "medication-error|*|serious-harm": ["medication-error-harm"],
    "medication-error|*|moderate-harm": ["medication-error-harm"],

    "surgical-error|*|patient-death": ["surgical-never-event"],
    "surgical-error|*|permanent-harm": ["surgical-never-event"],
    "surgical-error|*|serious-harm": ["surgical-never-event"],

    "infection|*|patient-death": ["healthcare-acquired-infection"],
    "infection|*|serious-harm": ["healthcare-acquired-infection"],
    "infection|*|moderate-harm": ["healthcare-acquired-infection"],

    "diagnostic-error|*|patient-death": ["diagnostic-error-delay"],
    "diagnostic-error|*|serious-harm": ["diagnostic-error-delay"],

    "privacy-breach|*|regulatory-action": ["privacy-breach-incident"],
    "privacy-breach|*|major-financial-loss": ["privacy-breach-incident"],

    "staffing-shortage|*|service-disruption": ["staffing-shortage-crisis"],
    "staffing-shortage|*|serious-harm": ["staffing-shortage-crisis"],

    "equipment-failure|*|patient-death": ["equipment-failure-critical"],
    "equipment-failure|*|service-disruption": ["equipment-failure-critical"],

    "regulatory-violation|*|accreditation-loss": ["regulatory-noncompliance"],
    "regulatory-violation|*|regulatory-action": ["regulatory-noncompliance"],

    "capacity-crisis|*|patient-death": ["ed-overcrowding"],
    "capacity-crisis|*|service-disruption": ["ed-overcrowding"],

    "cyber-attack|*|service-disruption": ["cybersecurity-attack"],
    "system-downtime|*|service-disruption": ["ehr-downtime"],

    "malpractice-claim|*|legal-action": ["malpractice-liability"],
    "billing-error|*|major-financial-loss": ["revenue-cycle-failure"],

    "self-harm|*|patient-death": ["behavioral-health-self-harm"],
    "self-harm|*|serious-harm": ["behavioral-health-self-harm"],

    "sepsis-delay|*|patient-death": ["sepsis-recognition-delay"],
    "sepsis-delay|*|serious-harm": ["sepsis-recognition-delay"],
  },
};
