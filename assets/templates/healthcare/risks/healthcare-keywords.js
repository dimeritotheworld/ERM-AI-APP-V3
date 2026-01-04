/**
 * Healthcare & Medical Services - Keywords & Sentence Builder
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.healthcare = ERM_TEMPLATES.healthcare || {};

ERM_TEMPLATES.healthcare.keywords = {
  /**
   * Industry vocabulary for search matching
   * term: The primary search term
   * variations: Alternative spellings or synonyms
   * mapsToCategory: The risk category this term indicates
   * weight: Search relevance weight (1-10, higher = more relevant)
   */
  vocabulary: [
  {
    "term": "adverse event",
    "variations": [
      "harm event",
      "clinical incident"
    ],
    "mapsToCategory": "quality-patient-safety",
    "weight": 10
  },
  {
    "term": "patient safety",
    "variations": [
      "safety event",
      "patient harm"
    ],
    "mapsToCategory": "quality-patient-safety",
    "weight": 10
  },
  {
    "term": "near miss",
    "variations": [
      "close call",
      "almost event"
    ],
    "mapsToCategory": "quality-patient-safety",
    "weight": 8
  },
  {
    "term": "sentinel event",
    "variations": [
      "serious event",
      "critical event"
    ],
    "mapsToCategory": "quality-patient-safety",
    "weight": 9
  },
  {
    "term": "incident reporting",
    "variations": [
      "event reporting",
      "safety report"
    ],
    "mapsToCategory": "quality-patient-safety",
    "weight": 7
  },
  {
    "term": "safety culture",
    "variations": [
      "just culture",
      "safety climate"
    ],
    "mapsToCategory": "quality-patient-safety",
    "weight": 7
  },
  {
    "term": "root cause analysis",
    "variations": [
      "RCA",
      "investigation"
    ],
    "mapsToCategory": "quality-patient-safety",
    "weight": 7
  },
  {
    "term": "patient identification",
    "variations": [
      "ID check",
      "two identifiers"
    ],
    "mapsToCategory": "quality-patient-safety",
    "weight": 8
  },
  {
    "term": "patient fall",
    "variations": [
      "fall",
      "fall injury"
    ],
    "mapsToCategory": "nursing-patient-safety",
    "weight": 10
  },
  {
    "term": "fall risk",
    "variations": [
      "fall prevention",
      "high fall risk"
    ],
    "mapsToCategory": "nursing-patient-safety",
    "weight": 9
  },
  {
    "term": "bed alarm",
    "variations": [
      "chair alarm",
      "alarm"
    ],
    "mapsToCategory": "nursing-patient-safety",
    "weight": 7
  },
  {
    "term": "ambulation",
    "variations": [
      "mobility",
      "gait"
    ],
    "mapsToCategory": "nursing-patient-safety",
    "weight": 7
  },
  {
    "term": "toileting",
    "variations": [
      "bathroom assist",
      "rounding"
    ],
    "mapsToCategory": "nursing-patient-safety",
    "weight": 7
  },
  {
    "term": "post-fall",
    "variations": [
      "post fall",
      "fall huddle"
    ],
    "mapsToCategory": "nursing-patient-safety",
    "weight": 7
  },
  {
    "term": "restraint",
    "variations": [
      "sitters",
      "observation"
    ],
    "mapsToCategory": "nursing-patient-safety",
    "weight": 6
  },
  {
    "term": "transfer safety",
    "variations": [
      "safe transfer",
      "lift assist"
    ],
    "mapsToCategory": "nursing-patient-safety",
    "weight": 7
  },
  {
    "term": "pressure injury",
    "variations": [
      "pressure ulcer",
      "bedsore"
    ],
    "mapsToCategory": "nursing-clinical-quality",
    "weight": 9
  },
  {
    "term": "skin breakdown",
    "variations": [
      "skin integrity",
      "wound"
    ],
    "mapsToCategory": "nursing-clinical-quality",
    "weight": 7
  },
  {
    "term": "turning schedule",
    "variations": [
      "repositioning",
      "turning"
    ],
    "mapsToCategory": "nursing-clinical-quality",
    "weight": 7
  },
  {
    "term": "wound care",
    "variations": [
      "dressings",
      "wound management"
    ],
    "mapsToCategory": "nursing-clinical-quality",
    "weight": 7
  },
  {
    "term": "ulcer staging",
    "variations": [
      "stage 1",
      "stage 2"
    ],
    "mapsToCategory": "nursing-clinical-quality",
    "weight": 6
  },
  {
    "term": "skin assessment",
    "variations": [
      "skin check",
      "assessment"
    ],
    "mapsToCategory": "nursing-clinical-quality",
    "weight": 7
  },
  {
    "term": "nutrition risk",
    "variations": [
      "malnutrition",
      "diet"
    ],
    "mapsToCategory": "nursing-clinical-quality",
    "weight": 6
  },
  {
    "term": "pressure prevention",
    "variations": [
      "pressure relief",
      "offloading"
    ],
    "mapsToCategory": "nursing-clinical-quality",
    "weight": 7
  },
  {
    "term": "medication error",
    "variations": [
      "med error",
      "drug error"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 10
  },
  {
    "term": "wrong dose",
    "variations": [
      "dose error",
      "overdose"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 9
  },
  {
    "term": "wrong drug",
    "variations": [
      "wrong medication",
      "wrong med"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 9
  },
  {
    "term": "adverse drug event",
    "variations": [
      "ADE",
      "drug reaction"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 9
  },
  {
    "term": "medication reconciliation",
    "variations": [
      "med rec",
      "med list"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 8
  },
  {
    "term": "high-alert medication",
    "variations": [
      "high risk med",
      "high alert"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 8
  },
  {
    "term": "barcode scanning",
    "variations": [
      "BCMA",
      "scan med"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 8
  },
  {
    "term": "drug interaction",
    "variations": [
      "interaction",
      "contraindication"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 8
  },
  {
    "term": "controlled substance",
    "variations": [
      "narcotic",
      "opioid"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 9
  },
  {
    "term": "diversion",
    "variations": [
      "drug diversion",
      "theft"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 9
  },
  {
    "term": "narcotic count",
    "variations": [
      "count discrepancy",
      "count"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 8
  },
  {
    "term": "waste documentation",
    "variations": [
      "waste",
      "wasting"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 7
  },
  {
    "term": "chain of custody",
    "variations": [
      "custody",
      "tracking"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 7
  },
  {
    "term": "dispensing cabinet",
    "variations": [
      "ADC",
      "automated cabinet"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 7
  },
  {
    "term": "audit log",
    "variations": [
      "access log",
      "monitoring"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 7
  },
  {
    "term": "opioid stewardship",
    "variations": [
      "opioid monitoring",
      "opioid program"
    ],
    "mapsToCategory": "pharmacy-medication-safety",
    "weight": 7
  },
  {
    "term": "healthcare-associated infection",
    "variations": [
      "HAI",
      "nosocomial"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 10
  },
  {
    "term": "hand hygiene",
    "variations": [
      "hand washing",
      "sanitizer"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 9
  },
  {
    "term": "isolation",
    "variations": [
      "contact precautions",
      "airborne"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 8
  },
  {
    "term": "outbreak",
    "variations": [
      "cluster",
      "epidemic"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 9
  },
  {
    "term": "sterile technique",
    "variations": [
      "aseptic",
      "sterile"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 8
  },
  {
    "term": "C. diff",
    "variations": [
      "clostridioides",
      "c diff"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 8
  },
  {
    "term": "MRSA",
    "variations": [
      "resistant organism",
      "MDRO"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 8
  },
  {
    "term": "environmental cleaning",
    "variations": [
      "disinfection",
      "cleaning"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 8
  },
  {
    "term": "CLABSI",
    "variations": [
      "central line infection",
      "line infection"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 9
  },
  {
    "term": "CAUTI",
    "variations": [
      "catheter infection",
      "urinary catheter"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 9
  },
  {
    "term": "VAP",
    "variations": [
      "ventilator pneumonia",
      "ventilator"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 8
  },
  {
    "term": "central line",
    "variations": [
      "line care",
      "line days"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 8
  },
  {
    "term": "catheter",
    "variations": [
      "foley",
      "urinary catheter"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 8
  },
  {
    "term": "ventilator",
    "variations": [
      "intubation",
      "ventilator days"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 7
  },
  {
    "term": "bundle compliance",
    "variations": [
      "care bundle",
      "bundle"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 7
  },
  {
    "term": "device utilization",
    "variations": [
      "device days",
      "device use"
    ],
    "mapsToCategory": "infection-control-infection-prevention",
    "weight": 7
  },
  {
    "term": "misdiagnosis",
    "variations": [
      "wrong diagnosis",
      "diagnostic error"
    ],
    "mapsToCategory": "quality-diagnostic-accuracy",
    "weight": 9
  },
  {
    "term": "delayed diagnosis",
    "variations": [
      "diagnostic delay",
      "late diagnosis"
    ],
    "mapsToCategory": "quality-diagnostic-accuracy",
    "weight": 9
  },
  {
    "term": "missed diagnosis",
    "variations": [
      "missed condition",
      "missed"
    ],
    "mapsToCategory": "quality-diagnostic-accuracy",
    "weight": 8
  },
  {
    "term": "critical result",
    "variations": [
      "critical value",
      "stat result"
    ],
    "mapsToCategory": "quality-diagnostic-accuracy",
    "weight": 8
  },
  {
    "term": "abnormal result",
    "variations": [
      "abnormal test",
      "positive result"
    ],
    "mapsToCategory": "quality-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "test follow-up",
    "variations": [
      "follow-up",
      "result follow-up"
    ],
    "mapsToCategory": "quality-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "diagnostic communication",
    "variations": [
      "result communication",
      "reporting"
    ],
    "mapsToCategory": "quality-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "clinical decision",
    "variations": [
      "diagnostic decision",
      "assessment"
    ],
    "mapsToCategory": "quality-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "CT",
    "variations": [
      "computed tomography",
      "scan"
    ],
    "mapsToCategory": "imaging-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "MRI",
    "variations": [
      "magnetic resonance",
      "scan"
    ],
    "mapsToCategory": "imaging-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "X-ray",
    "variations": [
      "radiograph",
      "plain film"
    ],
    "mapsToCategory": "imaging-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "ultrasound",
    "variations": [
      "sonography",
      "US"
    ],
    "mapsToCategory": "imaging-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "radiology report",
    "variations": [
      "imaging report",
      "read"
    ],
    "mapsToCategory": "imaging-diagnostic-accuracy",
    "weight": 8
  },
  {
    "term": "PACS",
    "variations": [
      "imaging system",
      "archive"
    ],
    "mapsToCategory": "imaging-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "image quality",
    "variations": [
      "artifact",
      "repeat"
    ],
    "mapsToCategory": "imaging-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "contrast reaction",
    "variations": [
      "contrast allergy",
      "contrast"
    ],
    "mapsToCategory": "imaging-diagnostic-accuracy",
    "weight": 8
  },
  {
    "term": "lab error",
    "variations": [
      "laboratory error",
      "test error"
    ],
    "mapsToCategory": "laboratory-diagnostic-accuracy",
    "weight": 8
  },
  {
    "term": "specimen labeling",
    "variations": [
      "labeling error",
      "mislabel"
    ],
    "mapsToCategory": "laboratory-diagnostic-accuracy",
    "weight": 8
  },
  {
    "term": "critical lab",
    "variations": [
      "critical value",
      "critical result"
    ],
    "mapsToCategory": "laboratory-diagnostic-accuracy",
    "weight": 8
  },
  {
    "term": "test turnaround",
    "variations": [
      "TAT",
      "delay"
    ],
    "mapsToCategory": "laboratory-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "blood bank",
    "variations": [
      "transfusion",
      "crossmatch"
    ],
    "mapsToCategory": "laboratory-diagnostic-accuracy",
    "weight": 8
  },
  {
    "term": "pathology",
    "variations": [
      "histology",
      "biopsy"
    ],
    "mapsToCategory": "laboratory-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "LIS",
    "variations": [
      "lab system",
      "laboratory system"
    ],
    "mapsToCategory": "laboratory-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "phlebotomy",
    "variations": [
      "blood draw",
      "collection"
    ],
    "mapsToCategory": "laboratory-diagnostic-accuracy",
    "weight": 7
  },
  {
    "term": "wrong site surgery",
    "variations": [
      "wrong site",
      "wrong patient"
    ],
    "mapsToCategory": "surgical-patient-safety",
    "weight": 10
  },
  {
    "term": "surgical timeout",
    "variations": [
      "time-out",
      "time out"
    ],
    "mapsToCategory": "surgical-patient-safety",
    "weight": 9
  },
  {
    "term": "retained item",
    "variations": [
      "retained sponge",
      "foreign body"
    ],
    "mapsToCategory": "surgical-patient-safety",
    "weight": 9
  },
  {
    "term": "count discrepancy",
    "variations": [
      "sponge count",
      "instrument count"
    ],
    "mapsToCategory": "surgical-patient-safety",
    "weight": 8
  },
  {
    "term": "surgical checklist",
    "variations": [
      "safe surgery",
      "checklist"
    ],
    "mapsToCategory": "surgical-patient-safety",
    "weight": 8
  },
  {
    "term": "site marking",
    "variations": [
      "marking",
      "laterality"
    ],
    "mapsToCategory": "surgical-patient-safety",
    "weight": 8
  },
  {
    "term": "OR safety",
    "variations": [
      "operating room",
      "OR"
    ],
    "mapsToCategory": "surgical-patient-safety",
    "weight": 7
  },
  {
    "term": "surgical error",
    "variations": [
      "operative error",
      "procedure error"
    ],
    "mapsToCategory": "surgical-patient-safety",
    "weight": 8
  },
  {
    "term": "anesthesia",
    "variations": [
      "anesthetic",
      "anesthetics"
    ],
    "mapsToCategory": "surgical-clinical-quality",
    "weight": 8
  },
  {
    "term": "airway",
    "variations": [
      "intubation",
      "ventilation"
    ],
    "mapsToCategory": "surgical-clinical-quality",
    "weight": 8
  },
  {
    "term": "sedation",
    "variations": [
      "moderate sedation",
      "deep sedation"
    ],
    "mapsToCategory": "surgical-clinical-quality",
    "weight": 8
  },
  {
    "term": "PACU",
    "variations": [
      "recovery",
      "post-anesthesia"
    ],
    "mapsToCategory": "surgical-clinical-quality",
    "weight": 7
  },
  {
    "term": "aspiration",
    "variations": [
      "airway event",
      "vomit"
    ],
    "mapsToCategory": "surgical-clinical-quality",
    "weight": 7
  },
  {
    "term": "hemodynamic",
    "variations": [
      "blood pressure",
      "instability"
    ],
    "mapsToCategory": "surgical-clinical-quality",
    "weight": 6
  },
  {
    "term": "post-op monitoring",
    "variations": [
      "post operative",
      "recovery"
    ],
    "mapsToCategory": "surgical-clinical-quality",
    "weight": 7
  },
  {
    "term": "anesthesia complication",
    "variations": [
      "anesthesia event",
      "complication"
    ],
    "mapsToCategory": "surgical-clinical-quality",
    "weight": 8
  },
  {
    "term": "ED crowding",
    "variations": [
      "overcrowding",
      "crowding"
    ],
    "mapsToCategory": "operations-patient-flow",
    "weight": 9
  },
  {
    "term": "boarding",
    "variations": [
      "ED boarding",
      "hold"
    ],
    "mapsToCategory": "operations-patient-flow",
    "weight": 8
  },
  {
    "term": "diversion",
    "variations": [
      "ambulance diversion",
      "divert"
    ],
    "mapsToCategory": "operations-patient-flow",
    "weight": 8
  },
  {
    "term": "door to provider",
    "variations": [
      "door-to-provider",
      "wait time"
    ],
    "mapsToCategory": "operations-patient-flow",
    "weight": 8
  },
  {
    "term": "left without being seen",
    "variations": [
      "LWBS",
      "walkout"
    ],
    "mapsToCategory": "operations-patient-flow",
    "weight": 8
  },
  {
    "term": "triage",
    "variations": [
      "screening",
      "acuity"
    ],
    "mapsToCategory": "operations-patient-flow",
    "weight": 7
  },
  {
    "term": "surge",
    "variations": [
      "capacity surge",
      "overflow"
    ],
    "mapsToCategory": "operations-patient-flow",
    "weight": 7
  },
  {
    "term": "wait time",
    "variations": [
      "waiting",
      "delay"
    ],
    "mapsToCategory": "operations-patient-flow",
    "weight": 7
  },
  {
    "term": "sepsis",
    "variations": [
      "septic",
      "septic shock"
    ],
    "mapsToCategory": "quality-clinical-quality",
    "weight": 9
  },
  {
    "term": "lactate",
    "variations": [
      "lactic",
      "lactate level"
    ],
    "mapsToCategory": "quality-clinical-quality",
    "weight": 7
  },
  {
    "term": "sepsis bundle",
    "variations": [
      "bundle",
      "sepsis protocol"
    ],
    "mapsToCategory": "quality-clinical-quality",
    "weight": 8
  },
  {
    "term": "early recognition",
    "variations": [
      "early detection",
      "screening"
    ],
    "mapsToCategory": "quality-clinical-quality",
    "weight": 8
  },
  {
    "term": "antibiotics",
    "variations": [
      "broad-spectrum",
      "antimicrobial"
    ],
    "mapsToCategory": "quality-clinical-quality",
    "weight": 7
  },
  {
    "term": "sepsis alert",
    "variations": [
      "alert",
      "sepsis flag"
    ],
    "mapsToCategory": "quality-clinical-quality",
    "weight": 7
  },
  {
    "term": "SOFA",
    "variations": [
      "qSOFA",
      "score"
    ],
    "mapsToCategory": "quality-clinical-quality",
    "weight": 6
  },
  {
    "term": "time to treatment",
    "variations": [
      "time to antibiotics",
      "timeliness"
    ],
    "mapsToCategory": "quality-clinical-quality",
    "weight": 7
  },
  {
    "term": "staffing shortage",
    "variations": [
      "shortage",
      "vacancy"
    ],
    "mapsToCategory": "hr-workforce-planning",
    "weight": 9
  },
  {
    "term": "vacancy",
    "variations": [
      "open position",
      "unfilled"
    ],
    "mapsToCategory": "hr-workforce-planning",
    "weight": 8
  },
  {
    "term": "overtime",
    "variations": [
      "OT",
      "extra shifts"
    ],
    "mapsToCategory": "hr-workforce-planning",
    "weight": 7
  },
  {
    "term": "agency nurse",
    "variations": [
      "agency",
      "temp staff"
    ],
    "mapsToCategory": "hr-workforce-planning",
    "weight": 7
  },
  {
    "term": "ratio",
    "variations": [
      "staffing ratio",
      "nurse ratio"
    ],
    "mapsToCategory": "hr-workforce-planning",
    "weight": 8
  },
  {
    "term": "skill mix",
    "variations": [
      "mix",
      "competency"
    ],
    "mapsToCategory": "hr-workforce-planning",
    "weight": 7
  },
  {
    "term": "coverage",
    "variations": [
      "shift coverage",
      "coverage gap"
    ],
    "mapsToCategory": "hr-workforce-planning",
    "weight": 7
  },
  {
    "term": "turnover",
    "variations": [
      "attrition",
      "retention"
    ],
    "mapsToCategory": "hr-workforce-planning",
    "weight": 7
  },
  {
    "term": "burnout",
    "variations": [
      "fatigue",
      "stress"
    ],
    "mapsToCategory": "hr-burnout-wellbeing",
    "weight": 8
  },
  {
    "term": "moral distress",
    "variations": [
      "distress",
      "moral injury"
    ],
    "mapsToCategory": "hr-burnout-wellbeing",
    "weight": 7
  },
  {
    "term": "engagement",
    "variations": [
      "staff engagement",
      "morale"
    ],
    "mapsToCategory": "hr-burnout-wellbeing",
    "weight": 7
  },
  {
    "term": "wellbeing",
    "variations": [
      "well-being",
      "resilience"
    ],
    "mapsToCategory": "hr-burnout-wellbeing",
    "weight": 7
  },
  {
    "term": "retention",
    "variations": [
      "staff retention",
      "stay"
    ],
    "mapsToCategory": "hr-burnout-wellbeing",
    "weight": 7
  },
  {
    "term": "turnover",
    "variations": [
      "attrition",
      "leavers"
    ],
    "mapsToCategory": "hr-burnout-wellbeing",
    "weight": 7
  },
  {
    "term": "sick leave",
    "variations": [
      "absence",
      "leave"
    ],
    "mapsToCategory": "hr-burnout-wellbeing",
    "weight": 6
  },
  {
    "term": "workload",
    "variations": [
      "workload pressure",
      "overload"
    ],
    "mapsToCategory": "hr-burnout-wellbeing",
    "weight": 7
  },
  {
    "term": "credentialing",
    "variations": [
      "credentials",
      "verification"
    ],
    "mapsToCategory": "medical-staff-staffing-competency",
    "weight": 8
  },
  {
    "term": "privileging",
    "variations": [
      "privileges",
      "scope"
    ],
    "mapsToCategory": "medical-staff-staffing-competency",
    "weight": 8
  },
  {
    "term": "license verification",
    "variations": [
      "license",
      "registration"
    ],
    "mapsToCategory": "medical-staff-staffing-competency",
    "weight": 7
  },
  {
    "term": "peer review",
    "variations": [
      "peer review",
      "case review"
    ],
    "mapsToCategory": "medical-staff-staffing-competency",
    "weight": 7
  },
  {
    "term": "competency",
    "variations": [
      "skills",
      "competence"
    ],
    "mapsToCategory": "medical-staff-staffing-competency",
    "weight": 7
  },
  {
    "term": "scope of practice",
    "variations": [
      "scope",
      "scope compliance"
    ],
    "mapsToCategory": "medical-staff-staffing-competency",
    "weight": 7
  },
  {
    "term": "locum",
    "variations": [
      "locum tenens",
      "temporary provider"
    ],
    "mapsToCategory": "medical-staff-staffing-competency",
    "weight": 6
  },
  {
    "term": "provider enrollment",
    "variations": [
      "enrollment",
      "payer enrollment"
    ],
    "mapsToCategory": "medical-staff-staffing-competency",
    "weight": 7
  },
  {
    "term": "privacy breach",
    "variations": [
      "confidentiality breach",
      "data incident"
    ],
    "mapsToCategory": "legal-privacy-confidentiality",
    "weight": 9
  },
  {
    "term": "confidentiality",
    "variations": [
      "privacy",
      "secrecy"
    ],
    "mapsToCategory": "legal-privacy-confidentiality",
    "weight": 8
  },
  {
    "term": "patient records",
    "variations": [
      "medical records",
      "health records"
    ],
    "mapsToCategory": "legal-privacy-confidentiality",
    "weight": 8
  },
  {
    "term": "unauthorized access",
    "variations": [
      "snooping",
      "inappropriate access"
    ],
    "mapsToCategory": "legal-privacy-confidentiality",
    "weight": 8
  },
  {
    "term": "minimum necessary",
    "variations": [
      "need to know",
      "least privilege"
    ],
    "mapsToCategory": "legal-privacy-confidentiality",
    "weight": 7
  },
  {
    "term": "release of information",
    "variations": [
      "ROI",
      "disclosure"
    ],
    "mapsToCategory": "legal-privacy-confidentiality",
    "weight": 7
  },
  {
    "term": "data disclosure",
    "variations": [
      "disclosure",
      "release"
    ],
    "mapsToCategory": "legal-privacy-confidentiality",
    "weight": 7
  },
  {
    "term": "identity theft",
    "variations": [
      "impersonation",
      "fraud"
    ],
    "mapsToCategory": "legal-privacy-confidentiality",
    "weight": 6
  },
  {
    "term": "ransomware",
    "variations": [
      "crypto",
      "encryption attack"
    ],
    "mapsToCategory": "it-cybersecurity",
    "weight": 10
  },
  {
    "term": "phishing",
    "variations": [
      "phish",
      "email scam"
    ],
    "mapsToCategory": "it-cybersecurity",
    "weight": 9
  },
  {
    "term": "malware",
    "variations": [
      "virus",
      "trojan"
    ],
    "mapsToCategory": "it-cybersecurity",
    "weight": 8
  },
  {
    "term": "data breach",
    "variations": [
      "breach",
      "exfiltration"
    ],
    "mapsToCategory": "it-cybersecurity",
    "weight": 9
  },
  {
    "term": "cyber attack",
    "variations": [
      "attack",
      "intrusion"
    ],
    "mapsToCategory": "it-cybersecurity",
    "weight": 9
  },
  {
    "term": "endpoint",
    "variations": [
      "endpoint security",
      "AV"
    ],
    "mapsToCategory": "it-cybersecurity",
    "weight": 7
  },
  {
    "term": "vulnerability",
    "variations": [
      "patch",
      "exploit"
    ],
    "mapsToCategory": "it-cybersecurity",
    "weight": 8
  },
  {
    "term": "security monitoring",
    "variations": [
      "SIEM",
      "alerting"
    ],
    "mapsToCategory": "it-cybersecurity",
    "weight": 7
  },
  {
    "term": "EHR downtime",
    "variations": [
      "system downtime",
      "outage"
    ],
    "mapsToCategory": "it-ehr-availability",
    "weight": 9
  },
  {
    "term": "system outage",
    "variations": [
      "outage",
      "system down"
    ],
    "mapsToCategory": "it-ehr-availability",
    "weight": 9
  },
  {
    "term": "application performance",
    "variations": [
      "slow system",
      "latency"
    ],
    "mapsToCategory": "it-ehr-availability",
    "weight": 7
  },
  {
    "term": "login failure",
    "variations": [
      "access failure",
      "locked out"
    ],
    "mapsToCategory": "it-ehr-availability",
    "weight": 7
  },
  {
    "term": "interface failure",
    "variations": [
      "interface",
      "feed down"
    ],
    "mapsToCategory": "it-ehr-availability",
    "weight": 7
  },
  {
    "term": "clinical system",
    "variations": [
      "clinical application",
      "system"
    ],
    "mapsToCategory": "it-ehr-availability",
    "weight": 7
  },
  {
    "term": "downtime procedures",
    "variations": [
      "paper downtime",
      "contingency"
    ],
    "mapsToCategory": "it-ehr-availability",
    "weight": 7
  },
  {
    "term": "data loss",
    "variations": [
      "lost data",
      "missing data"
    ],
    "mapsToCategory": "it-ehr-availability",
    "weight": 8
  },
  {
    "term": "interface",
    "variations": [
      "HL7",
      "integration"
    ],
    "mapsToCategory": "it-interoperability",
    "weight": 8
  },
  {
    "term": "data exchange",
    "variations": [
      "interoperability",
      "HIE"
    ],
    "mapsToCategory": "it-interoperability",
    "weight": 8
  },
  {
    "term": "integration",
    "variations": [
      "connectivity",
      "interface"
    ],
    "mapsToCategory": "it-interoperability",
    "weight": 7
  },
  {
    "term": "results feed",
    "variations": [
      "lab feed",
      "results interface"
    ],
    "mapsToCategory": "it-interoperability",
    "weight": 7
  },
  {
    "term": "order feed",
    "variations": [
      "orders interface",
      "orders"
    ],
    "mapsToCategory": "it-interoperability",
    "weight": 7
  },
  {
    "term": "API",
    "variations": [
      "integration API",
      "web service"
    ],
    "mapsToCategory": "it-interoperability",
    "weight": 6
  },
  {
    "term": "message queue",
    "variations": [
      "queue",
      "routing"
    ],
    "mapsToCategory": "it-interoperability",
    "weight": 6
  },
  {
    "term": "data mapping",
    "variations": [
      "mapping",
      "translation"
    ],
    "mapsToCategory": "it-interoperability",
    "weight": 6
  },
  {
    "term": "claim denial",
    "variations": [
      "denial",
      "rejection"
    ],
    "mapsToCategory": "finance-revenue-cycle",
    "weight": 9
  },
  {
    "term": "revenue cycle",
    "variations": [
      "RCM",
      "billing cycle"
    ],
    "mapsToCategory": "finance-revenue-cycle",
    "weight": 9
  },
  {
    "term": "billing",
    "variations": [
      "claims",
      "invoicing"
    ],
    "mapsToCategory": "finance-revenue-cycle",
    "weight": 8
  },
  {
    "term": "coding",
    "variations": [
      "CPT",
      "ICD"
    ],
    "mapsToCategory": "finance-revenue-cycle",
    "weight": 7
  },
  {
    "term": "AR days",
    "variations": [
      "accounts receivable",
      "aging"
    ],
    "mapsToCategory": "finance-revenue-cycle",
    "weight": 7
  },
  {
    "term": "underpayment",
    "variations": [
      "short payment",
      "variance"
    ],
    "mapsToCategory": "finance-revenue-cycle",
    "weight": 7
  },
  {
    "term": "charge capture",
    "variations": [
      "charges",
      "missed charge"
    ],
    "mapsToCategory": "finance-revenue-cycle",
    "weight": 8
  },
  {
    "term": "collections",
    "variations": [
      "cash collection",
      "self-pay"
    ],
    "mapsToCategory": "finance-revenue-cycle",
    "weight": 7
  },
  {
    "term": "payer contract",
    "variations": [
      "payer",
      "contract"
    ],
    "mapsToCategory": "finance-payer-contracting",
    "weight": 8
  },
  {
    "term": "reimbursement rate",
    "variations": [
      "rate",
      "payment"
    ],
    "mapsToCategory": "finance-payer-contracting",
    "weight": 8
  },
  {
    "term": "payer mix",
    "variations": [
      "insurance mix",
      "coverage"
    ],
    "mapsToCategory": "finance-payer-contracting",
    "weight": 7
  },
  {
    "term": "contract negotiation",
    "variations": [
      "negotiation",
      "terms"
    ],
    "mapsToCategory": "finance-payer-contracting",
    "weight": 7
  },
  {
    "term": "payment delay",
    "variations": [
      "late payment",
      "slow pay"
    ],
    "mapsToCategory": "finance-payer-contracting",
    "weight": 7
  },
  {
    "term": "authorization",
    "variations": [
      "prior authorization",
      "approval"
    ],
    "mapsToCategory": "finance-payer-contracting",
    "weight": 7
  },
  {
    "term": "denial appeal",
    "variations": [
      "appeal",
      "reconsideration"
    ],
    "mapsToCategory": "finance-payer-contracting",
    "weight": 7
  },
  {
    "term": "case mix",
    "variations": [
      "DRG",
      "case mix index"
    ],
    "mapsToCategory": "finance-payer-contracting",
    "weight": 6
  },
  {
    "term": "fraud",
    "variations": [
      "false claim",
      "fraudulent"
    ],
    "mapsToCategory": "finance-fraud-waste-abuse",
    "weight": 9
  },
  {
    "term": "abuse",
    "variations": [
      "waste",
      "improper"
    ],
    "mapsToCategory": "finance-fraud-waste-abuse",
    "weight": 8
  },
  {
    "term": "overbilling",
    "variations": [
      "overcharge",
      "double bill"
    ],
    "mapsToCategory": "finance-fraud-waste-abuse",
    "weight": 8
  },
  {
    "term": "upcoding",
    "variations": [
      "coding inflation",
      "DRG creep"
    ],
    "mapsToCategory": "finance-fraud-waste-abuse",
    "weight": 8
  },
  {
    "term": "kickback",
    "variations": [
      "bribe",
      "inducement"
    ],
    "mapsToCategory": "finance-fraud-waste-abuse",
    "weight": 7
  },
  {
    "term": "audit finding",
    "variations": [
      "audit",
      "finding"
    ],
    "mapsToCategory": "finance-fraud-waste-abuse",
    "weight": 7
  },
  {
    "term": "overpayment",
    "variations": [
      "refund",
      "recoupment"
    ],
    "mapsToCategory": "finance-fraud-waste-abuse",
    "weight": 7
  },
  {
    "term": "billing integrity",
    "variations": [
      "integrity",
      "compliance"
    ],
    "mapsToCategory": "finance-fraud-waste-abuse",
    "weight": 7
  },
  {
    "term": "supply shortage",
    "variations": [
      "shortage",
      "stockout"
    ],
    "mapsToCategory": "procurement-critical-supplies",
    "weight": 9
  },
  {
    "term": "PPE",
    "variations": [
      "protective equipment",
      "gloves"
    ],
    "mapsToCategory": "procurement-critical-supplies",
    "weight": 8
  },
  {
    "term": "backorder",
    "variations": [
      "delayed order",
      "allocation"
    ],
    "mapsToCategory": "procurement-critical-supplies",
    "weight": 7
  },
  {
    "term": "inventory stockout",
    "variations": [
      "stockout",
      "out of stock"
    ],
    "mapsToCategory": "procurement-critical-supplies",
    "weight": 7
  },
  {
    "term": "vendor delay",
    "variations": [
      "supplier delay",
      "late delivery"
    ],
    "mapsToCategory": "procurement-critical-supplies",
    "weight": 7
  },
  {
    "term": "substitution",
    "variations": [
      "alternate product",
      "substitute"
    ],
    "mapsToCategory": "procurement-critical-supplies",
    "weight": 6
  },
  {
    "term": "par level",
    "variations": [
      "par",
      "inventory level"
    ],
    "mapsToCategory": "procurement-critical-supplies",
    "weight": 6
  },
  {
    "term": "allocation",
    "variations": [
      "rationing",
      "distribution"
    ],
    "mapsToCategory": "procurement-critical-supplies",
    "weight": 7
  },
  {
    "term": "equipment failure",
    "variations": [
      "device failure",
      "breakdown"
    ],
    "mapsToCategory": "facilities-maintenance-reliability",
    "weight": 8
  },
  {
    "term": "device malfunction",
    "variations": [
      "malfunction",
      "failure"
    ],
    "mapsToCategory": "facilities-maintenance-reliability",
    "weight": 8
  },
  {
    "term": "biomedical",
    "variations": [
      "biomed",
      "clinical engineering"
    ],
    "mapsToCategory": "facilities-maintenance-reliability",
    "weight": 7
  },
  {
    "term": "maintenance",
    "variations": [
      "preventive maintenance",
      "PM"
    ],
    "mapsToCategory": "facilities-maintenance-reliability",
    "weight": 7
  },
  {
    "term": "service contract",
    "variations": [
      "service",
      "vendor"
    ],
    "mapsToCategory": "facilities-maintenance-reliability",
    "weight": 6
  },
  {
    "term": "calibration",
    "variations": [
      "calibrate",
      "calibration"
    ],
    "mapsToCategory": "facilities-maintenance-reliability",
    "weight": 6
  },
  {
    "term": "asset",
    "variations": [
      "asset management",
      "inventory"
    ],
    "mapsToCategory": "facilities-maintenance-reliability",
    "weight": 6
  },
  {
    "term": "equipment downtime",
    "variations": [
      "downtime",
      "out of service"
    ],
    "mapsToCategory": "facilities-maintenance-reliability",
    "weight": 7
  },
  {
    "term": "power outage",
    "variations": [
      "power failure",
      "blackout"
    ],
    "mapsToCategory": "facilities-utilities-management",
    "weight": 9
  },
  {
    "term": "generator",
    "variations": [
      "backup generator",
      "standby"
    ],
    "mapsToCategory": "facilities-utilities-management",
    "weight": 8
  },
  {
    "term": "HVAC",
    "variations": [
      "heating",
      "cooling"
    ],
    "mapsToCategory": "facilities-utilities-management",
    "weight": 7
  },
  {
    "term": "water supply",
    "variations": [
      "water outage",
      "water system"
    ],
    "mapsToCategory": "facilities-utilities-management",
    "weight": 7
  },
  {
    "term": "medical gas",
    "variations": [
      "oxygen",
      "vacuum"
    ],
    "mapsToCategory": "facilities-utilities-management",
    "weight": 7
  },
  {
    "term": "utility failure",
    "variations": [
      "utility",
      "system failure"
    ],
    "mapsToCategory": "facilities-utilities-management",
    "weight": 7
  },
  {
    "term": "chiller",
    "variations": [
      "cooling plant",
      "chiller failure"
    ],
    "mapsToCategory": "facilities-utilities-management",
    "weight": 6
  },
  {
    "term": "boiler",
    "variations": [
      "steam",
      "boiler failure"
    ],
    "mapsToCategory": "facilities-utilities-management",
    "weight": 6
  },
  {
    "term": "workplace violence",
    "variations": [
      "violence",
      "assault"
    ],
    "mapsToCategory": "hr-workplace-safety",
    "weight": 9
  },
  {
    "term": "aggression",
    "variations": [
      "aggressive",
      "threat"
    ],
    "mapsToCategory": "hr-workplace-safety",
    "weight": 8
  },
  {
    "term": "security incident",
    "variations": [
      "security",
      "incident"
    ],
    "mapsToCategory": "hr-workplace-safety",
    "weight": 7
  },
  {
    "term": "threat",
    "variations": [
      "threatening",
      "harassment"
    ],
    "mapsToCategory": "hr-workplace-safety",
    "weight": 7
  },
  {
    "term": "de-escalation",
    "variations": [
      "deescalation",
      "calming"
    ],
    "mapsToCategory": "hr-workplace-safety",
    "weight": 7
  },
  {
    "term": "staff safety",
    "variations": [
      "employee safety",
      "safety"
    ],
    "mapsToCategory": "hr-workplace-safety",
    "weight": 7
  },
  {
    "term": "behavioral",
    "variations": [
      "behavior",
      "violent"
    ],
    "mapsToCategory": "hr-workplace-safety",
    "weight": 7
  },
  {
    "term": "restraint use",
    "variations": [
      "restraint",
      "seclusion"
    ],
    "mapsToCategory": "hr-workplace-safety",
    "weight": 6
  },
  {
    "term": "complaint",
    "variations": [
      "grievance",
      "complaints"
    ],
    "mapsToCategory": "patient-experience-handover-communication",
    "weight": 8
  },
  {
    "term": "patient experience",
    "variations": [
      "experience",
      "satisfaction"
    ],
    "mapsToCategory": "patient-experience-handover-communication",
    "weight": 8
  },
  {
    "term": "service recovery",
    "variations": [
      "service",
      "recovery"
    ],
    "mapsToCategory": "patient-experience-handover-communication",
    "weight": 7
  },
  {
    "term": "communication",
    "variations": [
      "communication issue",
      "updates"
    ],
    "mapsToCategory": "patient-experience-handover-communication",
    "weight": 7
  },
  {
    "term": "billing complaint",
    "variations": [
      "billing issue",
      "statement"
    ],
    "mapsToCategory": "patient-experience-handover-communication",
    "weight": 6
  },
  {
    "term": "feedback",
    "variations": [
      "survey",
      "rating"
    ],
    "mapsToCategory": "patient-experience-handover-communication",
    "weight": 6
  },
  {
    "term": "family concern",
    "variations": [
      "family complaint",
      "caregiver"
    ],
    "mapsToCategory": "patient-experience-handover-communication",
    "weight": 6
  },
  {
    "term": "access barrier",
    "variations": [
      "access",
      "wait"
    ],
    "mapsToCategory": "patient-experience-handover-communication",
    "weight": 6
  },
  {
    "term": "disaster",
    "variations": [
      "mass casualty",
      "incident"
    ],
    "mapsToCategory": "operations-emergency-preparedness",
    "weight": 8
  },
  {
    "term": "surge",
    "variations": [
      "surge capacity",
      "overflow"
    ],
    "mapsToCategory": "operations-emergency-preparedness",
    "weight": 7
  },
  {
    "term": "emergency plan",
    "variations": [
      "contingency",
      "response plan"
    ],
    "mapsToCategory": "operations-emergency-preparedness",
    "weight": 7
  },
  {
    "term": "drill",
    "variations": [
      "exercise",
      "simulation"
    ],
    "mapsToCategory": "operations-emergency-preparedness",
    "weight": 6
  },
  {
    "term": "incident command",
    "variations": [
      "command",
      "ICS"
    ],
    "mapsToCategory": "operations-emergency-preparedness",
    "weight": 6
  },
  {
    "term": "evacuation",
    "variations": [
      "evacuate",
      "relocation"
    ],
    "mapsToCategory": "operations-emergency-preparedness",
    "weight": 7
  },
  {
    "term": "continuity",
    "variations": [
      "business continuity",
      "BCP"
    ],
    "mapsToCategory": "operations-emergency-preparedness",
    "weight": 7
  },
  {
    "term": "preparedness",
    "variations": [
      "readiness",
      "planning"
    ],
    "mapsToCategory": "operations-emergency-preparedness",
    "weight": 7
  }
],

  /**
   * Keywords that indicate specific departments
   */
  departmentKeywords: {
  "executive": [
    "strategy",
    "board",
    "governance",
    "leadership",
    "reputation",
    "stakeholder",
    "partnership"
  ],
  "finance": [
    "finance",
    "revenue",
    "billing",
    "claims",
    "budget",
    "payer",
    "cost"
  ],
  "hr": [
    "staffing",
    "recruitment",
    "retention",
    "training",
    "competency",
    "workforce",
    "employee"
  ],
  "it": [
    "IT",
    "EHR",
    "system",
    "downtime",
    "cybersecurity",
    "network",
    "integration"
  ],
  "legal": [
    "compliance",
    "privacy",
    "consent",
    "lawsuit",
    "regulation",
    "legal",
    "contract"
  ],
  "operations": [
    "flow",
    "capacity",
    "discharge",
    "transport",
    "throughput",
    "operations",
    "scheduling"
  ],
  "procurement": [
    "supply",
    "vendor",
    "contract",
    "inventory",
    "equipment",
    "purchasing",
    "procurement"
  ],
  "marketing": [
    "reputation",
    "brand",
    "community",
    "communications",
    "media",
    "campaign"
  ],
  "risk": [
    "risk",
    "incident",
    "investigation",
    "insurance",
    "audit",
    "RCA"
  ],
  "facilities": [
    "facility",
    "utilities",
    "maintenance",
    "life safety",
    "HVAC",
    "security"
  ],
  "nursing": [
    "nursing",
    "nurse",
    "RN",
    "patient care",
    "bedside",
    "shift",
    "unit"
  ],
  "medical-staff": [
    "physician",
    "provider",
    "credentialing",
    "privileging",
    "peer review"
  ],
  "quality": [
    "quality",
    "safety",
    "outcomes",
    "metrics",
    "improvement",
    "patient safety"
  ],
  "clinical-services": [
    "clinical",
    "pathway",
    "protocol",
    "care plan",
    "utilization"
  ],
  "pharmacy": [
    "pharmacy",
    "medication",
    "drug",
    "dispensing",
    "formulary",
    "controlled"
  ],
  "laboratory": [
    "lab",
    "laboratory",
    "specimen",
    "testing",
    "blood",
    "pathology"
  ],
  "imaging": [
    "radiology",
    "imaging",
    "CT",
    "MRI",
    "X-ray",
    "PACS"
  ],
  "emergency": [
    "emergency",
    "ED",
    "triage",
    "trauma",
    "boarding",
    "diversion"
  ],
  "surgical": [
    "surgery",
    "OR",
    "operating",
    "anesthesia",
    "sterile",
    "procedure"
  ],
  "patient-experience": [
    "patient experience",
    "complaint",
    "communication",
    "service",
    "feedback"
  ],
  "infection-control": [
    "infection",
    "HAI",
    "isolation",
    "hand hygiene",
    "outbreak"
  ],
  "health-information": [
    "records",
    "coding",
    "documentation",
    "ROI",
    "data quality"
  ]
},

  /**
   * Common risks for quick selection UI
   */
  commonRisks: [
  {
    "id": "patient-fall-injury",
    "label": "Patient fall with injury",
    "icon": "dY?E",
    "category": "nursing-patient-safety"
  },
  {
    "id": "medication-error-harm",
    "label": "Medication error",
    "icon": "dY'S",
    "category": "pharmacy-medication-safety"
  },
  {
    "id": "surgical-never-event",
    "label": "Surgical never event",
    "icon": "dYj",
    "category": "surgical-patient-safety"
  },
  {
    "id": "healthcare-acquired-infection",
    "label": "Healthcare-associated infection",
    "icon": "dYO?",
    "category": "infection-control-infection-prevention"
  },
  {
    "id": "diagnostic-error-delay",
    "label": "Diagnostic error or delay",
    "icon": "dYk",
    "category": "quality-diagnostic-accuracy"
  },
  {
    "id": "privacy-breach-incident",
    "label": "Privacy breach",
    "icon": "dY'",
    "category": "legal-privacy-confidentiality"
  },
  {
    "id": "cybersecurity-attack",
    "label": "Cybersecurity attack",
    "icon": "dY'?",
    "category": "it-cybersecurity"
  },
  {
    "id": "staffing-shortage-crisis",
    "label": "Staffing shortage",
    "icon": "dY`E",
    "category": "hr-workforce-planning"
  },
  {
    "id": "revenue-cycle-failure",
    "label": "Revenue cycle failure",
    "icon": "dY'?",
    "category": "finance-revenue-cycle"
  },
  {
    "id": "equipment-failure-critical",
    "label": "Critical equipment failure",
    "icon": "dY\u0015",
    "category": "facilities-maintenance-reliability"
  },
  {
    "id": "supply-chain-disruption",
    "label": "Supply shortage",
    "icon": "dYý",
    "category": "procurement-critical-supplies"
  },
  {
    "id": "regulatory-noncompliance",
    "label": "Regulatory non-compliance",
    "icon": "dY-",
    "category": "legal-regulatory-compliance"
  },
  {
    "id": "workplace-violence-incident",
    "label": "Workplace violence",
    "icon": "dY`E",
    "category": "hr-workplace-safety"
  },
  {
    "id": "patient-elopement",
    "label": "Patient elopement",
    "icon": "dYs",
    "category": "quality-patient-safety"
  },
  {
    "id": "ed-overcrowding",
    "label": "ED overcrowding",
    "icon": "dY?E",
    "category": "operations-patient-flow"
  },
  {
    "id": "pressure-injury-harm",
    "label": "Pressure injury",
    "icon": "dY?E",
    "category": "nursing-clinical-quality"
  },
  {
    "id": "controlled-substance-diversion",
    "label": "Controlled substance diversion",
    "icon": "dY'?",
    "category": "pharmacy-medication-safety"
  },
  {
    "id": "laboratory-error",
    "label": "Laboratory error",
    "icon": "dYk",
    "category": "laboratory-diagnostic-accuracy"
  },
  {
    "id": "imaging-diagnostic-delay",
    "label": "Imaging delay",
    "icon": "dYý",
    "category": "imaging-diagnostic-accuracy"
  },
  {
    "id": "sepsis-recognition-delay",
    "label": "Sepsis recognition delay",
    "icon": "dY?E",
    "category": "quality-clinical-quality"
  }
],

  /**
   * Natural language phrase mapping
   * Maps common user phrases to risk categories and specific risks
   */
  phraseMapping: [
  {
    "phrase": "patient fell",
    "category": "nursing-patient-safety",
    "risk": "patient-fall-injury"
  },
  {
    "phrase": "wrong medication",
    "category": "pharmacy-medication-safety",
    "risk": "medication-error-harm"
  },
  {
    "phrase": "wrong site",
    "category": "surgical-patient-safety",
    "risk": "surgical-never-event"
  },
  {
    "phrase": "patient acquired infection",
    "category": "infection-control-infection-prevention",
    "risk": "healthcare-acquired-infection"
  },
  {
    "phrase": "data breach",
    "category": "legal-privacy-confidentiality",
    "risk": "privacy-breach-incident"
  },
  {
    "phrase": "cyber attack",
    "category": "it-cybersecurity",
    "risk": "cybersecurity-attack"
  },
  {
    "phrase": "not enough staff",
    "category": "hr-workforce-planning",
    "risk": "staffing-shortage-crisis"
  },
  {
    "phrase": "claims denied",
    "category": "finance-revenue-cycle",
    "risk": "revenue-cycle-failure"
  },
  {
    "phrase": "ED overcrowded",
    "category": "operations-patient-flow",
    "risk": "ed-overcrowding"
  },
  {
    "phrase": "privacy complaint",
    "category": "legal-privacy-confidentiality",
    "risk": "privacy-breach-incident"
  },
  {
    "phrase": "sepsis delay",
    "category": "quality-clinical-quality",
    "risk": "sepsis-recognition-delay"
  },
  {
    "phrase": "pressure ulcer",
    "category": "nursing-clinical-quality",
    "risk": "pressure-injury-harm"
  },
  {
    "phrase": "diversion suspected",
    "category": "pharmacy-medication-safety",
    "risk": "controlled-substance-diversion"
  },
  {
    "phrase": "lab error",
    "category": "laboratory-diagnostic-accuracy",
    "risk": "laboratory-error"
  },
  {
    "phrase": "imaging delayed",
    "category": "imaging-diagnostic-accuracy",
    "risk": "imaging-diagnostic-delay"
  }
],

  /**
   * Sentence builder dropdowns for guided risk creation
   */
  sentenceBuilder: {
  "riskTypes": [
    {
      "id": "safety",
      "label": "Patient safety incident",
      "icon": "dY?E",
      "department": "quality"
    },
    {
      "id": "clinical",
      "label": "Clinical quality issue",
      "icon": "dY?E",
      "department": "clinical-services"
    },
    {
      "id": "medication",
      "label": "Medication safety issue",
      "icon": "dY'S",
      "department": "pharmacy"
    },
    {
      "id": "infection",
      "label": "Infection prevention issue",
      "icon": "dYO?",
      "department": "infection-control"
    },
    {
      "id": "technology",
      "label": "Technology failure",
      "icon": "dY'?",
      "department": "it"
    },
    {
      "id": "operations",
      "label": "Operational disruption",
      "icon": "dY?-",
      "department": "operations"
    }
  ],
  "specifics": {
    "safety": [
      {
        "id": "fall",
        "label": "patient fall",
        "mapsToRisk": "patient-fall-injury"
      },
      {
        "id": "elopement",
        "label": "patient elopement",
        "mapsToRisk": "patient-elopement"
      },
      {
        "id": "violence",
        "label": "workplace violence",
        "mapsToRisk": "workplace-violence-incident"
      }
    ],
    "clinical": [
      {
        "id": "diagnostic",
        "label": "diagnostic delay",
        "mapsToRisk": "diagnostic-error-delay"
      },
      {
        "id": "sepsis",
        "label": "sepsis recognition delay",
        "mapsToRisk": "sepsis-recognition-delay"
      },
      {
        "id": "pressure",
        "label": "pressure injury",
        "mapsToRisk": "pressure-injury-harm"
      }
    ],
    "medication": [
      {
        "id": "med-error",
        "label": "medication error",
        "mapsToRisk": "medication-error-harm"
      },
      {
        "id": "diversion",
        "label": "controlled substance diversion",
        "mapsToRisk": "controlled-substance-diversion"
      }
    ],
    "infection": [
      {
        "id": "hai",
        "label": "healthcare-associated infection",
        "mapsToRisk": "healthcare-acquired-infection"
      },
      {
        "id": "outbreak",
        "label": "outbreak",
        "mapsToRisk": "outbreak-response-failure"
      }
    ],
    "technology": [
      {
        "id": "ehr",
        "label": "EHR downtime",
        "mapsToRisk": "ehr-downtime"
      },
      {
        "id": "cyber",
        "label": "cyber attack",
        "mapsToRisk": "cybersecurity-attack"
      }
    ],
    "operations": [
      {
        "id": "capacity",
        "label": "capacity crisis",
        "mapsToRisk": "ed-overcrowding"
      },
      {
        "id": "supply",
        "label": "supply shortage",
        "mapsToRisk": "supply-chain-disruption"
      }
    ]
  },
  "causes": {
    "fall": [
      {
        "id": "assessment",
        "label": "fall risk not assessed"
      },
      {
        "id": "alarm",
        "label": "bed alarm not used"
      },
      {
        "id": "rounding",
        "label": "rounding missed"
      }
    ],
    "med-error": [
      {
        "id": "verification",
        "label": "verification bypassed"
      },
      {
        "id": "barcode",
        "label": "barcode not scanned"
      },
      {
        "id": "communication",
        "label": "handover error"
      }
    ]
  },
  "consequences": {
    "fall": [
      {
        "id": "injury",
        "label": "patient injury"
      },
      {
        "id": "stay",
        "label": "extended stay"
      },
      {
        "id": "claim",
        "label": "claim or complaint"
      }
    ],
    "med-error": [
      {
        "id": "harm",
        "label": "adverse drug reaction"
      },
      {
        "id": "icu",
        "label": "ICU transfer"
      },
      {
        "id": "reporting",
        "label": "regulatory reporting"
      }
    ]
  }
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
