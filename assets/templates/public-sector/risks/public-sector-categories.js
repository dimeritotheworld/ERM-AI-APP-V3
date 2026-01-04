/**
 * Public Sector - Risk Categories
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.publicSector = ERM_TEMPLATES.publicSector || {};

ERM_TEMPLATES.publicSector.categories = {
  financial: [
    {
      id: "financial-management",
      name: "Financial Management",
      keywords: "budget, revenue, deficit, fiscal, appropriation, audit, investment, debt",
      descriptions: ["Budget shortfall impacts services.", "Revenue below projections.", "Audit findings require action.", "Investment losses occur."],
      scenarios: ["Economic downturn reduces tax revenue.", "Major unexpected expenditure.", "Failed bond issue.", "Pension fund underperforms."],
      examples: ["Budget gap projected.", "Revenue down 10%.", "Audit finding issued.", "Bond rating downgraded."],
    },
    {
      id: "grants",
      name: "Grant Compliance",
      keywords: "grant, federal, state, compliance, match, reporting, clawback, single audit",
      descriptions: ["Grant compliance issue identified.", "Match requirement not met.", "Reporting deadline missed.", "Questioned costs in audit."],
      scenarios: ["Federal grant audit finding.", "Failure to meet grant conditions.", "Improper grant expenditure.", "Match funding unavailable."],
      examples: ["Single audit finding.", "Grant disallowance.", "Compliance report late.", "Questioned costs."],
    },
  ],

  operations: [
    {
      id: "service-delivery",
      name: "Service Delivery",
      keywords: "service, constituent, customer, wait time, backlog, quality, efficiency",
      descriptions: ["Service quality declining.", "Backlogs increasing.", "Customer complaints rising.", "Service targets missed."],
      scenarios: ["Permit processing delays.", "Call center wait times excessive.", "Service requests backlogged.", "Quality metrics declining."],
      examples: ["Customer complaint spike.", "Service level not met.", "Processing backlog.", "Response time exceeded."],
    },
    {
      id: "infrastructure",
      name: "Infrastructure",
      keywords: "infrastructure, roads, bridges, water, sewer, facilities, maintenance, capital",
      descriptions: ["Infrastructure condition declining.", "Maintenance backlog growing.", "Capital needs exceed funding.", "Facility condition poor."],
      scenarios: ["Water main break causes outage.", "Bridge rated structurally deficient.", "Building system failure.", "Road deterioration accelerates."],
      examples: ["Water main break.", "Bridge closure.", "HVAC failure.", "Pavement rating drops."],
    },
    {
      id: "emergency-management",
      name: "Emergency Management",
      keywords: "emergency, disaster, EOC, response, recovery, FEMA, shelter, evacuation",
      descriptions: ["Emergency response capacity inadequate.", "Disaster recovery delayed.", "EOC activation issues.", "Mutual aid unavailable."],
      scenarios: ["Major disaster exceeds capacity.", "Evacuation challenges.", "Shelter capacity insufficient.", "FEMA reimbursement delayed."],
      examples: ["Disaster declaration.", "EOC activated.", "Evacuation ordered.", "FEMA denial."],
    },
  ],

  publicSafety: [
    {
      id: "public-safety",
      name: "Public Safety",
      keywords: "crime, public safety, response time, use of force, pursuit, detention, arrest",
      descriptions: ["Crime rate increasing.", "Response times exceeding targets.", "Use of force incident.", "Public safety concern."],
      scenarios: ["Officer involved shooting.", "Pursuit results in injury.", "In-custody death.", "Major crime incident."],
      examples: ["Use of force review.", "Pursuit policy violation.", "Custody incident.", "Crime spike."],
    },
    {
      id: "fire-ems",
      name: "Fire & EMS",
      keywords: "fire, EMS, response time, apparatus, firefighter, rescue, hazmat",
      descriptions: ["Response times exceeding standards.", "Apparatus reliability issues.", "Staffing shortages.", "Training deficiencies."],
      scenarios: ["Fire response delay causes fatality.", "EMS unavailable.", "Firefighter injury.", "Hazmat incident."],
      examples: ["Response time exceeded.", "Apparatus out of service.", "Staffing shortage.", "Hazmat call."],
    },
  ],

  compliance: [
    {
      id: "compliance",
      name: "Regulatory Compliance",
      keywords: "compliance, regulation, audit, mandate, requirement, violation, consent decree",
      descriptions: ["Compliance finding issued.", "Regulatory requirement not met.", "Audit identifies deficiency.", "Consent decree violation."],
      scenarios: ["EPA compliance violation.", "ADA lawsuit filed.", "OSHA citation.", "State audit finding."],
      examples: ["Violation notice.", "Consent decree.", "Audit finding.", "Citation issued."],
    },
    {
      id: "legal",
      name: "Legal / Litigation",
      keywords: "litigation, lawsuit, liability, claim, settlement, tort, civil rights",
      descriptions: ["Litigation exposure increasing.", "Settlement costs rising.", "Civil rights claim filed.", "Class action threatened."],
      scenarios: ["Civil rights lawsuit.", "Slip and fall injury claim.", "Employment lawsuit.", "Class action certification."],
      examples: ["Lawsuit filed.", "Settlement reached.", "Verdict against.", "Claim filed."],
    },
  ],

  cyber: [
    {
      id: "cyber-risk",
      name: "Cybersecurity",
      keywords: "cyber, security, breach, ransomware, phishing, data, privacy, hacking",
      descriptions: ["Cyber attack attempted.", "Data breach occurred.", "Ransomware detected.", "Security vulnerability identified."],
      scenarios: ["Ransomware encrypts systems.", "Personal data breach.", "Phishing compromises credentials.", "Critical system hacked."],
      examples: ["Security incident.", "Data breach notification.", "Ransomware attack.", "Phishing success."],
    },
  ],

  workforce: [
    {
      id: "workforce",
      name: "Workforce",
      keywords: "staffing, recruitment, retention, union, grievance, discipline, vacancy, turnover",
      descriptions: ["Staffing shortages in critical areas.", "Turnover increasing.", "Grievances rising.", "Recruitment challenges."],
      scenarios: ["Critical position vacant.", "Mass retirement.", "Union job action.", "Key personnel departure."],
      examples: ["Vacancy rate high.", "Grievance filed.", "Retirement wave.", "Hiring freeze impact."],
    },
  ],

  fraud: [
    {
      id: "fraud",
      name: "Fraud & Misconduct",
      keywords: "fraud, corruption, theft, embezzlement, misconduct, ethics, conflict of interest",
      descriptions: ["Fraud detected in operations.", "Employee misconduct alleged.", "Ethics violation reported.", "Internal control failure."],
      scenarios: ["Embezzlement discovered.", "Bribery allegation.", "Timesheet fraud.", "Procurement fraud."],
      examples: ["Fraud investigation.", "Ethics complaint.", "Misconduct allegation.", "Internal control finding."],
    },
  ],
};

ERM_TEMPLATES.publicSector.categories.getAll = function () {
  var all = [];
  var departments = Object.keys(this);
  for (var i = 0; i < departments.length; i++) {
    if (typeof this[departments[i]] === "function") continue;
    var dept = this[departments[i]];
    if (!Array.isArray(dept)) continue;
    for (var j = 0; j < dept.length; j++) {
      dept[j].department = departments[i];
      all.push(dept[j]);
    }
  }
  return all;
};

ERM_TEMPLATES.publicSector.categories.findById = function (id) {
  var departments = Object.keys(this);
  for (var i = 0; i < departments.length; i++) {
    if (typeof this[departments[i]] === "function") continue;
    var dept = this[departments[i]];
    if (!Array.isArray(dept)) continue;
    for (var j = 0; j < dept.length; j++) {
      if (dept[j].id === id) { dept[j].department = departments[i]; return dept[j]; }
    }
  }
  return null;
};

ERM_TEMPLATES.publicSector.categories.search = function (keyword) {
  var results = [];
  var lowerKeyword = keyword.toLowerCase();
  var all = this.getAll();
  for (var i = 0; i < all.length; i++) {
    if (all[i].name.toLowerCase().indexOf(lowerKeyword) !== -1 || all[i].keywords.toLowerCase().indexOf(lowerKeyword) !== -1) {
      results.push(all[i]);
    }
  }
  return results;
};
