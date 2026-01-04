/**
 * Energy & Utilities - Risk Categories
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.energy = ERM_TEMPLATES.energy || {};

ERM_TEMPLATES.energy.categories = {
  operations: [
    {
      id: "reliability",
      name: "System Reliability",
      keywords: "reliability, outage, SAIDI, SAIFI, interruption, restoration, uptime, availability",
      descriptions: ["Customer outages exceed targets.", "Reliability performance declining.", "Restoration times increasing.", "System experiencing frequent interruptions."],
      scenarios: ["Major storm causes widespread outages.", "Equipment failure causes extended outage.", "Cascading failure across system.", "Peak demand exceeds capacity."],
      examples: ["SAIDI above target.", "Major event day declared.", "Customers without power.", "Reliability penalty triggered."],
    },
    {
      id: "generation",
      name: "Generation Performance",
      keywords: "generation, plant, capacity, availability, forced outage, dispatch, fuel, emissions",
      descriptions: ["Generation unit availability below target.", "Forced outage rate increasing.", "Fuel supply constraints.", "Emissions compliance issues."],
      scenarios: ["Unit trips during peak demand.", "Fuel supply interrupted.", "Emissions limit exceeded.", "Capacity shortfall during heat wave."],
      examples: ["Forced outage rate high.", "Unit unavailable.", "Fuel inventory low.", "Emissions exceedance."],
    },
    {
      id: "grid-operations",
      name: "Grid Operations",
      keywords: "grid, transmission, distribution, SCADA, control center, dispatch, voltage, frequency",
      descriptions: ["Grid operations failure.", "Control center issues.", "Voltage or frequency deviation.", "Interconnection problems."],
      scenarios: ["SCADA system failure.", "Operator error causes outage.", "Frequency deviation event.", "Interconnection trip."],
      examples: ["Control center alarm.", "Voltage excursion.", "Frequency event.", "Islanding occurred."],
    },
  ],

  safety: [
    {
      id: "worker-safety",
      name: "Worker Safety",
      keywords: "safety, worker, employee, contractor, injury, fatality, arc flash, fall, contact",
      descriptions: ["Worker injury or fatality.", "Safety incident occurs.", "High-risk work exposure.", "Safety culture concerns."],
      scenarios: ["Arc flash injury.", "Fall from height.", "Electrical contact.", "Vehicle incident."],
      examples: ["OSHA recordable.", "Near miss reported.", "Safety violation.", "Contractor injury."],
    },
    {
      id: "public-safety",
      name: "Public Safety",
      keywords: "public, contact, downed wire, electrocution, third party, community, safety",
      descriptions: ["Public contact with energized equipment.", "Downed wire incident.", "Third-party injury.", "Public safety hazard."],
      scenarios: ["Member of public contacts downed wire.", "Vehicle hits pole causing injury.", "Dig-in to underground cable.", "Child contacts equipment."],
      examples: ["Public contact incident.", "Downed wire call.", "Dig-in reported.", "Safety notification issued."],
    },
    {
      id: "wildfire-risk",
      name: "Wildfire Risk",
      keywords: "wildfire, fire, ignition, vegetation, red flag, PSPS, de-energization",
      descriptions: ["Utility equipment ignites wildfire.", "Fire risk during extreme conditions.", "Vegetation contact with lines.", "PSPS decision required."],
      scenarios: ["Equipment failure starts fire.", "Wind event causes line contact.", "Wildfire threatens facilities.", "PSPS implemented."],
      examples: ["Fire investigation.", "Red flag warning.", "PSPS activated.", "Fire agency contact."],
    },
    {
      id: "gas-safety",
      name: "Gas Safety",
      keywords: "gas, leak, explosion, pipeline, integrity, odorization, emergency, excavation",
      descriptions: ["Gas leak or explosion.", "Pipeline integrity failure.", "Third-party damage.", "Emergency response required."],
      scenarios: ["Gas explosion at customer location.", "Main leak detected.", "Excavator hits gas line.", "Odorization failure."],
      examples: ["Gas emergency call.", "Leak survey finding.", "Damage prevention issue.", "Pressure loss."],
    },
  ],

  cyber: [
    {
      id: "cyber-risk",
      name: "Cybersecurity",
      keywords: "cyber, security, attack, SCADA, OT, IT, ransomware, CIP, NERC",
      descriptions: ["Cyber attack on grid systems.", "NERC CIP violation.", "Ransomware incident.", "OT/IT security breach."],
      scenarios: ["SCADA system compromised.", "Ransomware encrypts systems.", "Control center attacked.", "Phishing success."],
      examples: ["Security incident.", "CIP violation.", "Malware detected.", "Access anomaly."],
    },
  ],

  regulatory: [
    {
      id: "regulatory-compliance",
      name: "Regulatory Compliance",
      keywords: "regulatory, compliance, NERC, FERC, PUC, rate case, tariff, permit, violation",
      descriptions: ["Regulatory violation or penalty.", "Rate case outcome unfavorable.", "Permit compliance issue.", "Regulatory relationship strained."],
      scenarios: ["NERC violation penalty.", "Rate case denial.", "Environmental permit issue.", "PUC investigation."],
      examples: ["Violation notice.", "Rate case filing.", "Compliance finding.", "Penalty assessed."],
    },
  ],
};

ERM_TEMPLATES.energy.categories.getAll = function () {
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

ERM_TEMPLATES.energy.categories.findById = function (id) {
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

ERM_TEMPLATES.energy.categories.search = function (keyword) {
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
