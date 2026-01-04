/**
 * Energy & Utilities - Departments
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.energy = ERM_TEMPLATES.energy || {};

ERM_TEMPLATES.energy.departments = {
  universal: [
    { id: "executive", name: "Executive / C-Suite", focus: "Strategic planning, regulatory strategy, rate cases, capital allocation, stakeholder relations" },
    { id: "finance", name: "Finance", focus: "Rate case support, capital planning, commodity hedging, regulatory accounting, investor relations" },
    { id: "hr", name: "Human Resources", focus: "Workforce planning, safety culture, union relations, training, succession planning" },
    { id: "it", name: "Information Technology", focus: "IT/OT systems, cybersecurity, smart grid, AMI, customer systems" },
    { id: "legal", name: "Legal & Compliance", focus: "Regulatory filings, contracts, environmental compliance, NERC compliance" },
    { id: "operations", name: "Operations", focus: "System operations, dispatch, outage management, reliability, asset management" },
    { id: "customer", name: "Customer Service", focus: "Customer care, billing, collections, energy efficiency programs" },
    { id: "risk", name: "Risk Management", focus: "Enterprise risk, insurance, business continuity, crisis management" },
  ],

  industrySpecific: [
    { id: "generation", name: "Generation", focus: "Power plant operations, fuel management, emissions, maintenance, dispatch" },
    { id: "transmission", name: "Transmission", focus: "Transmission operations, planning, reliability, interconnection, NERC compliance" },
    { id: "distribution", name: "Distribution", focus: "Distribution operations, reliability, outage response, vegetation management, metering" },
    { id: "gas-ops", name: "Gas Operations", focus: "Gas system operations, integrity, leak detection, emergency response" },
    { id: "grid-control", name: "Grid Control Center", focus: "System operations, SCADA, energy management, load management, emergency operations" },
    { id: "asset-management", name: "Asset Management", focus: "Asset strategy, capital planning, reliability, condition assessment" },
    { id: "engineering", name: "Engineering", focus: "System planning, design, standards, reliability studies, interconnection" },
    { id: "environmental", name: "Environmental", focus: "Environmental compliance, permits, emissions, sustainability" },
    { id: "safety", name: "Safety", focus: "Worker safety, public safety, contractor safety, safety culture" },
    { id: "emergency", name: "Emergency Management", focus: "Emergency planning, storm response, mutual aid, restoration" },
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
