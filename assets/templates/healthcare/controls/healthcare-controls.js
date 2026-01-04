/**
 * Healthcare Industry Control Templates
 * Comprehensive control library organized by risk categories
 *
 * @version 1.0.0
 * ES5 Compatible
 */

/* ========================================
   NAMESPACE SETUP
   ======================================== */

// Create namespace
if (!window.ERM) window.ERM = {};
if (!window.ERM_TEMPLATES) window.ERM_TEMPLATES = {};
if (!window.ERM_TEMPLATES.healthcare) window.ERM_TEMPLATES.healthcare = {};
if (!window.ERM_TEMPLATES.healthcare.controls) window.ERM_TEMPLATES.healthcare.controls = {};

/* ========================================
   PATIENT SAFETY CONTROLS
   ======================================== */

window.ERM_TEMPLATES.healthcare.controls.patientSafety = [
  {
    id: "ctrl-fall-prevention",
    titles: [
      "Fall Prevention Program",
      "Patient Fall Risk Assessment",
      "Fall Prevention Protocol",
      "Fall Risk Mitigation Program",
      "Inpatient Fall Prevention",
      "Fall Prevention Bundle",
      "High Fall Risk Interventions",
      "Patient Fall Prevention Protocol"
    ],
    descriptions: [
      "Comprehensive fall prevention program including validated risk assessment on admission and reassessment, tiered prevention interventions, post-fall huddles, and continuous improvement based on fall data analysis.",
      "Systematic fall prevention approach using evidence-based assessment tools and standardized interventions. Includes bed alarms, hourly rounding, environmental modifications, and patient/family education.",
      "Fall prevention bundle with risk stratification, individualized care plans, and consistent implementation of prevention strategies. Program includes root cause analysis of all falls with injury.",
      "Hospital-wide fall prevention initiative combining risk identification, preventive interventions, staff education, and ongoing monitoring. Dashboard tracks fall rates and injury severity."
    ],
    plainLanguage: [
      "Assess patients for fall risk",
      "Prevent patient falls",
      "Use bed alarms for high-risk patients",
      "Round on patients frequently",
      "Keep patients safe from falls"
    ],
    keywords: ["fall", "prevention", "risk assessment", "bed alarm", "rounding", "injury", "safety", "mobility", "patient"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Chief Nursing Officer", "Nurse Manager", "Patient Safety Officer", "Unit Director"],
      secondary: ["Clinical Nurse Specialist", "Quality Director", "Risk Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "per-patient",
    department: "nursing",
    controlCategory: "patient-safety",
    mitigatesRiskCategories: ["patient-safety", "quality"],
    mitigatesRiskKeywords: ["fall", "injury", "patient harm", "safety", "prevention"]
  },
  {
    id: "ctrl-medication-safety",
    titles: [
      "Medication Safety Program",
      "Barcode Medication Administration",
      "BCMA Implementation",
      "Medication Error Prevention",
      "High-Alert Medication Safety",
      "Medication Verification Process",
      "Five Rights of Medication Administration",
      "Medication Safety Bundle"
    ],
    descriptions: [
      "Comprehensive medication safety program utilizing barcode scanning for medication administration, electronic prescribing with clinical decision support, independent double-checks for high-alert medications, and ongoing error analysis.",
      "Multi-layered medication safety system including CPOE with drug interaction checking, barcode verification at point of care, pharmacist review of all orders, and smart pump technology.",
      "High-alert medication safety protocol requiring independent double verification, standardized concentrations, pharmacy preparation of high-risk drugs, and segregated storage to prevent mix-ups.",
      "Medication safety bundle encompassing the five rights verification, allergy checking, drug interaction screening, and reconciliation at all transitions of care."
    ],
    plainLanguage: [
      "Scan medications before giving them",
      "Check patient ID before meds",
      "Double-check high-risk medications",
      "Make sure right patient gets right med",
      "Prevent medication errors"
    ],
    keywords: ["medication", "barcode", "BCMA", "safety", "verification", "high-alert", "error", "drug", "administration"],
    type: "preventive",
    category: "automated",
    owners: {
      primary: ["Chief Pharmacy Officer", "Pharmacy Director", "Chief Nursing Officer", "Patient Safety Officer"],
      secondary: ["Nurse Manager", "Clinical Pharmacist", "Quality Director"]
    },
    effectiveness: "highly-effective",
    status: "active",
    frequency: "per-patient",
    department: "pharmacy",
    controlCategory: "patient-safety",
    mitigatesRiskCategories: ["patient-safety", "medication-safety"],
    mitigatesRiskKeywords: ["medication", "error", "drug", "adverse", "harm", "safety"]
  },
  {
    id: "ctrl-surgical-safety",
    titles: [
      "Surgical Safety Checklist",
      "Universal Protocol Compliance",
      "Surgical Time-Out Procedure",
      "Wrong-Site Surgery Prevention",
      "Safe Surgery Checklist",
      "OR Safety Protocol",
      "Surgical Verification Process",
      "Pre-operative Verification"
    ],
    descriptions: [
      "Mandatory surgical safety checklist based on WHO Safe Surgery framework, including pre-operative verification, surgical site marking, and time-out with all team members actively participating.",
      "Universal Protocol compliance program with three-phase verification: pre-procedure verification, site marking, and active time-out. Empowers any team member to stop procedure for safety concerns.",
      "Surgical safety protocol requiring documented site marking by operating surgeon, verified consent, and team time-out confirming patient identity, procedure, site, and laterality.",
      "Comprehensive OR safety program including checklist compliance monitoring, time-out quality audits, near-miss reporting, and simulation training for verification processes."
    ],
    plainLanguage: [
      "Do the surgical time-out",
      "Mark the surgical site",
      "Verify right patient right procedure",
      "Use the surgical checklist",
      "Prevent wrong-site surgery"
    ],
    keywords: ["surgical", "checklist", "time-out", "verification", "site marking", "universal protocol", "safety", "OR"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Chief of Surgery", "OR Director", "Chief Medical Officer", "Patient Safety Officer"],
      secondary: ["Surgeon", "Anesthesiologist", "OR Nurse Manager"]
    },
    effectiveness: "highly-effective",
    status: "active",
    frequency: "per-patient",
    department: "surgical",
    controlCategory: "patient-safety",
    mitigatesRiskCategories: ["patient-safety", "surgical-safety"],
    mitigatesRiskKeywords: ["wrong site", "surgery", "verification", "time-out", "safety", "procedure"]
  },
  {
    id: "ctrl-sepsis-screening",
    titles: [
      "Sepsis Screening Protocol",
      "Early Sepsis Detection",
      "Sepsis Bundle Implementation",
      "Sepsis Alert System",
      "Sepsis Management Protocol",
      "Surviving Sepsis Guidelines",
      "Sepsis Recognition Program",
      "Sepsis Hour-1 Bundle"
    ],
    descriptions: [
      "Electronic sepsis screening and alert system integrated with EHR to identify patients meeting SIRS criteria or qSOFA score. Triggers nursing assessment and physician notification for early intervention.",
      "Sepsis bundle implementation program following Surviving Sepsis Campaign guidelines. Includes lactate measurement, blood cultures, broad-spectrum antibiotics, and fluid resuscitation within defined timeframes.",
      "Multi-disciplinary sepsis protocol with automated screening, rapid response activation, and standardized order sets for sepsis management. Performance monitored through mortality and bundle compliance metrics.",
      "Early sepsis recognition program with staff education, screening tools, clinical decision support, and escalation pathways to ensure timely treatment initiation."
    ],
    plainLanguage: [
      "Screen patients for sepsis",
      "Catch sepsis early",
      "Start sepsis treatment quickly",
      "Use sepsis protocols",
      "Get antibiotics started fast"
    ],
    keywords: ["sepsis", "screening", "early detection", "bundle", "antibiotics", "lactate", "SIRS", "mortality"],
    type: "detective",
    category: "automated",
    owners: {
      primary: ["Chief Medical Officer", "Chief Nursing Officer", "Emergency Medicine Director", "Hospitalist Director"],
      secondary: ["Quality Director", "Clinical Informatics", "Sepsis Coordinator"]
    },
    effectiveness: "highly-effective",
    status: "active",
    frequency: "continuous",
    department: "clinical-services",
    controlCategory: "clinical-quality",
    mitigatesRiskCategories: ["clinical-quality", "patient-safety"],
    mitigatesRiskKeywords: ["sepsis", "mortality", "infection", "deterioration", "early warning"]
  }
];

/* ========================================
   INFECTION PREVENTION CONTROLS
   ======================================== */

window.ERM_TEMPLATES.healthcare.controls.infectionPrevention = [
  {
    id: "ctrl-hand-hygiene",
    titles: [
      "Hand Hygiene Compliance Program",
      "Hand Hygiene Monitoring",
      "Hand Hygiene Protocol",
      "Infection Prevention Through Hand Hygiene",
      "Hand Hygiene Observation",
      "Hand Hygiene Compliance Monitoring",
      "Moments of Hand Hygiene",
      "Hand Hygiene Initiative"
    ],
    descriptions: [
      "Comprehensive hand hygiene program with real-time monitoring, direct observation, and feedback mechanisms. Targets compliance with WHO 5 Moments of Hand Hygiene with goal of >95% compliance.",
      "Hand hygiene compliance monitoring using direct observation, electronic monitoring, and product usage tracking. Results shared publicly at unit level to drive improvement.",
      "Infection prevention program centered on hand hygiene as foundational practice. Includes product accessibility, just-in-time training, and accountability at all levels.",
      "Evidence-based hand hygiene initiative with multi-modal implementation strategy including system change, training, observation, feedback, and institutional safety climate."
    ],
    plainLanguage: [
      "Make sure everyone washes hands",
      "Monitor hand hygiene compliance",
      "Clean hands before and after patient contact",
      "Use hand sanitizer or soap",
      "Track hand hygiene rates"
    ],
    keywords: ["hand hygiene", "compliance", "infection prevention", "handwashing", "sanitizer", "monitoring"],
    type: "preventive",
    category: "monitoring",
    owners: {
      primary: ["Infection Preventionist", "Infection Control Director", "Chief Nursing Officer"],
      secondary: ["Nurse Manager", "Quality Director", "Environmental Services Director"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "infection-control",
    controlCategory: "infection-prevention",
    mitigatesRiskCategories: ["infection-prevention", "patient-safety"],
    mitigatesRiskKeywords: ["infection", "HAI", "transmission", "hygiene", "prevention"]
  },
  {
    id: "ctrl-central-line-bundle",
    titles: [
      "Central Line Insertion Bundle",
      "CLABSI Prevention Bundle",
      "Central Line Safety Protocol",
      "Central Line Insertion Checklist",
      "CLABSI Prevention Program",
      "Central Line Care Bundle",
      "Line Insertion Best Practices",
      "Zero CLABSI Initiative"
    ],
    descriptions: [
      "Evidence-based central line insertion bundle including hand hygiene, full barrier precautions, chlorhexidine skin prep, optimal site selection, and daily line necessity review. Documented checklist for every insertion.",
      "CLABSI prevention program with insertion bundle compliance monitoring, maintenance bundle adherence, and daily rounds to assess continued line necessity. Goal of zero preventable infections.",
      "Central line safety protocol empowering any team member to stop insertion for bundle breaks. Includes standardized kit, checklist verification, and real-time compliance feedback.",
      "Comprehensive CLABSI prevention initiative combining insertion and maintenance bundles with unit-level data feedback, root cause analysis of events, and leadership engagement."
    ],
    plainLanguage: [
      "Use the central line checklist",
      "Full barrier precautions for line insertion",
      "Check if central line still needed daily",
      "Follow the CLABSI bundle",
      "Prevent central line infections"
    ],
    keywords: ["central line", "CLABSI", "bundle", "insertion", "maintenance", "infection", "catheter", "prevention"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Infection Preventionist", "ICU Director", "Chief Nursing Officer", "Chief Medical Officer"],
      secondary: ["Nurse Manager", "Quality Director", "Critical Care Medical Director"]
    },
    effectiveness: "highly-effective",
    status: "active",
    frequency: "per-patient",
    department: "infection-control",
    controlCategory: "infection-prevention",
    mitigatesRiskCategories: ["infection-prevention", "patient-safety"],
    mitigatesRiskKeywords: ["CLABSI", "central line", "infection", "catheter", "bloodstream"]
  },
  {
    id: "ctrl-isolation-precautions",
    titles: [
      "Isolation Precautions Protocol",
      "Transmission-Based Precautions",
      "Patient Isolation Program",
      "Isolation Compliance Monitoring",
      "Infection Control Precautions",
      "Isolation Signage and PPE",
      "Contact/Droplet/Airborne Isolation",
      "Isolation Practice Standards"
    ],
    descriptions: [
      "Standardized transmission-based precautions program with clear isolation categories (contact, droplet, airborne), signage, PPE requirements, and compliance monitoring through observation and audits.",
      "Isolation precautions protocol integrated with EHR for automatic flags and order generation. Includes staff training, readily available PPE, and regular compliance auditing.",
      "Infection control program ensuring appropriate isolation for patients with communicable diseases or multi-drug resistant organisms. Includes patient and family education on isolation requirements.",
      "Evidence-based isolation practices with standardized signage, anteroom management, negative pressure room assignment, and environmental cleaning protocols."
    ],
    plainLanguage: [
      "Put patients on proper isolation",
      "Wear correct PPE for isolation",
      "Follow isolation protocols",
      "Use proper precautions for infections",
      "Prevent spread of infections"
    ],
    keywords: ["isolation", "precautions", "PPE", "transmission", "contact", "droplet", "airborne", "MDRO"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Infection Preventionist", "Infection Control Director", "Chief Nursing Officer"],
      secondary: ["Nurse Manager", "Environmental Services Director", "Employee Health"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "per-patient",
    department: "infection-control",
    controlCategory: "infection-prevention",
    mitigatesRiskCategories: ["infection-prevention", "patient-safety"],
    mitigatesRiskKeywords: ["isolation", "transmission", "infection", "PPE", "outbreak", "MDRO"]
  }
];

/* ========================================
   REGULATORY COMPLIANCE CONTROLS
   ======================================== */

window.ERM_TEMPLATES.healthcare.controls.compliance = [
  {
    id: "ctrl-survey-readiness",
    titles: [
      "Survey Readiness Program",
      "Accreditation Preparedness",
      "Continuous Readiness Initiative",
      "Mock Survey Program",
      "Survey Preparation Protocol",
      "Regulatory Compliance Readiness",
      "Accreditation Survey Readiness",
      "Always Ready Program"
    ],
    descriptions: [
      "Continuous survey readiness program with regular environmental rounds, tracer methodology, mock surveys, and staff education to maintain compliance with accreditation standards at all times.",
      "Comprehensive accreditation preparedness initiative including gap analysis, corrective action tracking, standard-specific education, and leadership engagement in compliance oversight.",
      "Always ready approach to regulatory compliance with daily huddles, weekly rounds, monthly mock surveys, and real-time issue identification and resolution.",
      "Survey readiness framework with role-based competency training, documentation audits, environmental safety rounds, and rapid response process for identified deficiencies."
    ],
    plainLanguage: [
      "Be ready for survey any day",
      "Do mock surveys regularly",
      "Fix compliance issues before survey",
      "Train staff on standards",
      "Keep up with accreditation requirements"
    ],
    keywords: ["survey", "readiness", "accreditation", "compliance", "accreditation", "accreditation body", "regulator", "standards"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Chief Compliance Officer", "Accreditation Coordinator", "Chief Quality Officer"],
      secondary: ["Department Directors", "Quality Director", "Patient Safety Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "quality",
    controlCategory: "regulatory-compliance",
    mitigatesRiskCategories: ["regulatory-compliance", "accreditation"],
    mitigatesRiskKeywords: ["survey", "accreditation", "deficiency", "compliance", "standards", "regulator", "accreditation"]
  },
  {
    id: "ctrl-hipaa-compliance",
    titles: [
      "Health Information Privacy Program",
      "Privacy and Security Program",
      "patient data Protection Protocol",
      "Privacy Training and Monitoring",
      "Privacy Compliance Framework",
      "Information Security Program",
      "Privacy Risk Management",
      "Privacy and Confidentiality Program"
    ],
    descriptions: [
      "Comprehensive health information privacy compliance program including annual risk assessment, workforce training, access controls, audit logging, breach prevention and response procedures, and business associate management.",
      "Privacy and security program meeting privacy requirements with policies, procedures, training, monitoring, and incident response. Includes regular audits and risk analysis updates.",
      "patient data protection framework with minimum necessary standards, access-based role security, audit log monitoring, encryption requirements, and breach notification procedures.",
      "privacy compliance initiative encompassing workforce training, ongoing awareness, access management, security incident response, and regular compliance audits."
    ],
    plainLanguage: [
      "Protect patient information",
      "Train staff on privacy requirements",
      "Monitor who accesses records",
      "Prevent privacy breaches",
      "Keep patient data secure"
    ],
    keywords: ["privacy", "privacy", "security", "patient data", "compliance", "breach", "access", "confidentiality"],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Privacy Officer", "Chief Compliance Officer", "Chief Information Security Officer"],
      secondary: ["IT Security Manager", "HIM Director", "Compliance Director"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "legal",
    controlCategory: "privacy-security",
    mitigatesRiskCategories: ["privacy-security", "regulatory-compliance"],
    mitigatesRiskKeywords: ["privacy", "privacy", "breach", "patient data", "security", "confidentiality", "access"]
  },
  {
    id: "ctrl-emtala-compliance",
    titles: [
      "Emergency Care Access Compliance Program",
      "Emergency Department Access Compliance",
      "Medical Screening Exam Protocol",
      "Emergency Care Access Compliance Monitoring",
      "Emergency Care Access Control",
      "Transfer Protocol Compliance",
      "On-Call Coverage Management",
      "Emergency Care Access Training Program"
    ],
    descriptions: [
      "Comprehensive emergency care access compliance program ensuring medical screening exams for all ED patients, appropriate stabilization, and compliant transfers. Includes on-call physician coverage and documentation requirements.",
      "Emergency department access control ensuring no patient is turned away or discriminated against. Monitoring of triage times, MSE documentation, and transfer compliance.",
      "Emergency care access compliance framework with defined processes for screening, stabilization, transfer, and on-call coverage. Regular audits and staff training on emergency access obligations.",
      "Program ensuring appropriate emergency care access including registration procedures, MSE timeliness, stabilization protocols, and transfer documentation requirements."
    ],
    plainLanguage: [
      "Screen all ED patients",
      "Don't turn patients away",
      "Stabilize before transfer",
      "Have on-call physicians available",
      "Document emergency care properly"
    ],
    keywords: ["emergency access", "emergency", "screening", "stabilization", "transfer", "on-call", "MSE", "compliance"],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["ED Medical Director", "ED Nurse Manager", "Chief Compliance Officer"],
      secondary: ["Chief Medical Officer", "Chief Nursing Officer", "Registration Manager"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "emergency",
    controlCategory: "regulatory-compliance",
    mitigatesRiskCategories: ["regulatory-compliance", "patient-access"],
    mitigatesRiskKeywords: ["emergency access", "emergency", "screening", "transfer", "stabilization", "on-call"]
  }
];

/* ========================================
   OPERATIONAL CONTROLS
   ======================================== */

window.ERM_TEMPLATES.healthcare.controls.operational = [
  {
    id: "ctrl-patient-flow",
    titles: [
      "Patient Flow Management",
      "Throughput Optimization",
      "Capacity Management System",
      "Bed Management Protocol",
      "Patient Flow Command Center",
      "Hospital Flow Optimization",
      "Discharge Planning Protocol",
      "Capacity and Flow Management"
    ],
    descriptions: [
      "Hospital-wide patient flow management program with real-time bed tracking, proactive discharge planning, transfer center coordination, and executive escalation protocols for capacity constraints.",
      "Throughput optimization initiative with predictive analytics for census, discharge by noon goals, multidisciplinary rounds, and barrier removal processes to accelerate appropriate discharges.",
      "Capacity command center with visibility into current and projected census, ED boarding, OR schedule, and staffing. Activates surge protocols based on defined triggers.",
      "Comprehensive flow management program addressing admission, transfer, and discharge processes. Includes case management, utilization review, and post-acute placement coordination."
    ],
    plainLanguage: [
      "Manage hospital beds effectively",
      "Get patients discharged on time",
      "Prevent ED boarding",
      "Know capacity in real-time",
      "Move patients through efficiently"
    ],
    keywords: ["flow", "capacity", "bed management", "discharge", "throughput", "boarding", "census", "transfer"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Chief Operating Officer", "Patient Flow Director", "Case Management Director"],
      secondary: ["Bed Management", "Nurse Manager", "ED Director"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "operations",
    controlCategory: "operational",
    mitigatesRiskCategories: ["operational", "patient-access"],
    mitigatesRiskKeywords: ["flow", "capacity", "boarding", "throughput", "discharge", "overcrowding", "diversion"]
  },
  {
    id: "ctrl-staffing-management",
    titles: [
      "Staffing Management Protocol",
      "Nurse Staffing Optimization",
      "Acuity-Based Staffing",
      "Staffing and Scheduling System",
      "Workforce Management Program",
      "Clinical Staffing Model",
      "Float Pool Management",
      "Staffing Adequacy Control"
    ],
    descriptions: [
      "Acuity-based staffing system matching nurse competencies and staffing ratios to patient needs. Includes predictive scheduling, float pool utilization, and escalation protocols for staffing shortfalls.",
      "Workforce management program with demand forecasting, optimized scheduling, real-time staffing adjustments, and contingency planning for census fluctuations and call-offs.",
      "Clinical staffing model with defined ratios, skill mix requirements, and competency matching. Monitoring of overtime, agency usage, and staff satisfaction indicators.",
      "Staffing adequacy control with daily assessment of staffing versus census, proactive adjustment mechanisms, and leadership visibility into staffing gaps."
    ],
    plainLanguage: [
      "Make sure units are properly staffed",
      "Match staffing to patient needs",
      "Plan for staffing shortages",
      "Use float pool effectively",
      "Reduce agency nurse usage"
    ],
    keywords: ["staffing", "scheduling", "acuity", "ratio", "workforce", "float pool", "nurse", "agency"],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Chief Nursing Officer", "Nursing Director", "Workforce Manager"],
      secondary: ["Nurse Manager", "HR Director", "Staffing Coordinator"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "daily",
    department: "nursing",
    controlCategory: "operational",
    mitigatesRiskCategories: ["workforce-management", "patient-safety"],
    mitigatesRiskKeywords: ["staffing", "shortage", "ratio", "nurse", "workforce", "vacancy", "overtime"]
  },
  {
    id: "ctrl-supply-chain",
    titles: [
      "Supply Chain Management",
      "Critical Supply Monitoring",
      "Inventory Management System",
      "Supply Shortage Response",
      "Par Level Management",
      "Vendor Management Program",
      "Supply Chain Resilience",
      "Medical Supply Control"
    ],
    descriptions: [
      "Supply chain management program with real-time inventory tracking, automated reorder points, critical supply monitoring, and multi-vendor sourcing strategies to ensure availability.",
      "Critical supply monitoring with dashboard visibility into inventory levels, shortage alerts, and conservation/substitution protocols for supply disruptions.",
      "Vendor management program with qualification, performance monitoring, contract management, and contingency planning for sole-source dependencies.",
      "Supply chain resilience initiative with safety stock levels, alternative product identification, and rapid response protocols for shortage situations."
    ],
    plainLanguage: [
      "Keep adequate supplies on hand",
      "Monitor for supply shortages",
      "Have backup suppliers ready",
      "Respond quickly to shortages",
      "Manage inventory effectively"
    ],
    keywords: ["supply chain", "inventory", "shortage", "vendor", "par level", "reorder", "supplies", "medical"],
    type: "preventive",
    category: "automated",
    owners: {
      primary: ["Supply Chain Director", "Chief Operating Officer", "Pharmacy Director"],
      secondary: ["Materials Manager", "Purchasing Manager", "Clinical Directors"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "procurement",
    controlCategory: "operational",
    mitigatesRiskCategories: ["operational", "supply-chain"],
    mitigatesRiskKeywords: ["supply", "shortage", "inventory", "vendor", "availability", "procurement"]
  }
];

/* ========================================
   TECHNOLOGY CONTROLS
   ======================================== */

window.ERM_TEMPLATES.healthcare.controls.technology = [
  {
    id: "ctrl-cybersecurity",
    titles: [
      "Cybersecurity Program",
      "Information Security Controls",
      "Cyber Defense Program",
      "Security Operations",
      "Threat Protection System",
      "Ransomware Prevention",
      "Network Security Program",
      "Cybersecurity Risk Management"
    ],
    descriptions: [
      "Multi-layered cybersecurity program with endpoint protection, network segmentation, intrusion detection, vulnerability management, and security operations center monitoring.",
      "Information security controls framework including access management, encryption, security awareness training, incident response, and regular penetration testing.",
      "Cyber defense program with advanced threat protection, email security, web filtering, and security information and event management (SIEM) for threat detection.",
      "Ransomware prevention initiative with offline backups, email filtering, user training, network segmentation, and incident response planning."
    ],
    plainLanguage: [
      "Protect systems from hackers",
      "Prevent ransomware attacks",
      "Monitor for security threats",
      "Train staff on security",
      "Keep backups safe"
    ],
    keywords: ["cybersecurity", "security", "ransomware", "threat", "protection", "breach", "hacking", "network"],
    type: "preventive",
    category: "automated",
    owners: {
      primary: ["Chief Information Security Officer", "IT Security Director", "Chief Information Officer"],
      secondary: ["IT Director", "Network Security Manager", "Security Operations Team"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "it",
    controlCategory: "technology",
    mitigatesRiskCategories: ["cybersecurity", "technology"],
    mitigatesRiskKeywords: ["cyber", "ransomware", "security", "breach", "attack", "threat", "hacking"]
  },
  {
    id: "ctrl-ehr-availability",
    titles: [
      "EHR Availability Controls",
      "Clinical System Uptime Management",
      "EHR Disaster Recovery",
      "System Availability Monitoring",
      "Downtime Procedures",
      "Clinical Application Resilience",
      "EHR Business Continuity",
      "System Redundancy Controls"
    ],
    descriptions: [
      "EHR availability management with redundant infrastructure, failover capabilities, 24/7 monitoring, and defined service level agreements for system uptime and performance.",
      "Clinical system resilience program with load balancing, database replication, backup systems, and tested disaster recovery procedures for rapid restoration.",
      "Downtime procedures including paper-based workflows, downtime forms, data reconciliation processes, and communication protocols for planned and unplanned outages.",
      "System availability monitoring with alerting thresholds, escalation procedures, vendor management, and regular disaster recovery testing."
    ],
    plainLanguage: [
      "Keep EHR running",
      "Have backup systems ready",
      "Know what to do when system is down",
      "Test disaster recovery",
      "Monitor system performance"
    ],
    keywords: ["EHR", "availability", "downtime", "disaster recovery", "uptime", "backup", "system", "resilience"],
    type: "preventive",
    category: "automated",
    owners: {
      primary: ["Chief Information Officer", "IT Director", "Clinical Informatics Director"],
      secondary: ["Application Manager", "IT Operations Manager", "Chief Medical Information Officer"]
    },
    effectiveness: "effective",
    status: "active",
    frequency: "continuous",
    department: "it",
    controlCategory: "technology",
    mitigatesRiskCategories: ["technology", "operational"],
    mitigatesRiskKeywords: ["EHR", "downtime", "system", "availability", "outage", "failure", "recovery"]
  }
];

/* ========================================
   UTILITY FUNCTIONS
   ======================================== */

/**
 * Get all controls as flat array
 */
window.ERM_TEMPLATES.healthcare.controls.getAll = function () {
  var all = [];
  var categories = ["patientSafety", "infectionPrevention", "compliance", "operational", "technology"];
  var i, j;

  for (i = 0; i < categories.length; i++) {
    var cat = this[categories[i]];
    if (cat && Array.isArray(cat)) {
      for (j = 0; j < cat.length; j++) {
        cat[j].category = categories[i];
        all.push(cat[j]);
      }
    }
  }

  return all;
};

/**
 * Find control by ID
 */
window.ERM_TEMPLATES.healthcare.controls.findById = function (id) {
  var all = this.getAll();
  for (var i = 0; i < all.length; i++) {
    if (all[i].id === id) {
      return all[i];
    }
  }
  return null;
};

/**
 * Search controls by keyword
 */
window.ERM_TEMPLATES.healthcare.controls.search = function (keyword) {
  var results = [];
  var lowerKeyword = keyword.toLowerCase();
  var all = this.getAll();

  for (var i = 0; i < all.length; i++) {
    var control = all[i];
    var found = false;

    // Check titles
    for (var j = 0; j < control.titles.length; j++) {
      if (control.titles[j].toLowerCase().indexOf(lowerKeyword) !== -1) {
        found = true;
        break;
      }
    }

    // Check keywords
    if (!found && control.keywords) {
      for (var k = 0; k < control.keywords.length; k++) {
        if (control.keywords[k].toLowerCase().indexOf(lowerKeyword) !== -1) {
          found = true;
          break;
        }
      }
    }

    if (found) {
      results.push(control);
    }
  }

  return results;
};

console.log("Healthcare Control Templates loaded");
