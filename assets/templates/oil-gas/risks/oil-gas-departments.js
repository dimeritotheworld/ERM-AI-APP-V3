/**
 * Oil & Gas - Departments
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.oilGas = ERM_TEMPLATES.oilGas || {};

ERM_TEMPLATES.oilGas.departments = {
  universal: [
    { id: "executive", name: "Executive / C-Suite", focus: "Strategic planning, capital allocation, stakeholder relations, portfolio management, safety leadership" },
    { id: "finance", name: "Finance", focus: "Capital budgeting, commodity hedging, JV accounting, reserves valuation, project economics" },
    { id: "hr", name: "Human Resources", focus: "Workforce planning, contractor management, competency assurance, remote location staffing" },
    { id: "it", name: "Information Technology", focus: "SCADA systems, process control, cybersecurity, field communications, digital oilfield" },
    { id: "legal", name: "Legal & Compliance", focus: "Contracts, JV agreements, regulatory filings, land rights, environmental permits" },
    { id: "operations", name: "Operations", focus: "Production optimization, facilities management, process safety, asset integrity" },
    { id: "procurement", name: "Procurement / Supply Chain", focus: "Contractor management, materials, equipment, logistics, strategic sourcing" },
    { id: "hse", name: "Health, Safety & Environment", focus: "Process safety, personal safety, environmental compliance, emergency response" },
    { id: "risk", name: "Risk Management", focus: "Enterprise risk, insurance, crisis management, business continuity" },
  ],

  industrySpecific: [
    { id: "drilling", name: "Drilling", focus: "Well planning, drilling operations, rig management, well control, directional drilling" },
    { id: "production", name: "Production", focus: "Reservoir management, production optimization, artificial lift, well interventions" },
    { id: "reservoir", name: "Reservoir Engineering", focus: "Reserves estimation, reservoir simulation, recovery optimization, field development" },
    { id: "facilities", name: "Facilities Engineering", focus: "Process design, mechanical integrity, modifications, debottlenecking" },
    { id: "projects", name: "Projects", focus: "Capital project delivery, FEED, construction, commissioning, project controls" },
    { id: "subsea", name: "Subsea Operations", focus: "Subsea systems, ROV operations, diving, umbilicals, risers" },
    { id: "pipeline", name: "Pipeline Operations", focus: "Pipeline integrity, SCADA, metering, compression, leak detection" },
    { id: "marine", name: "Marine Operations", focus: "Vessel management, offshore logistics, cargo operations, marine safety" },
    { id: "geoscience", name: "Geoscience", focus: "Exploration, seismic interpretation, prospect generation, resource assessment" },
    { id: "maintenance", name: "Maintenance", focus: "Preventive maintenance, turnarounds, reliability, inspection" },
  ],

  getAll: function () {
    var all = [];
    for (var i = 0; i < this.universal.length; i++) all.push(this.universal[i]);
    for (var i = 0; i < this.industrySpecific.length; i++) all.push(this.industrySpecific[i]);
    return all;
  },

  findById: function (id) {
    for (var i = 0; i < this.universal.length; i++) if (this.universal[i].id === id) return this.universal[i];
    for (var i = 0; i < this.industrySpecific.length; i++) if (this.industrySpecific[i].id === id) return this.industrySpecific[i];
    return null;
  }
};
