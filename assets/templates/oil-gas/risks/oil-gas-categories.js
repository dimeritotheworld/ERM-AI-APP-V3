/**
 * Oil & Gas - Risk Categories by Department
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.oilGas = ERM_TEMPLATES.oilGas || {};

ERM_TEMPLATES.oilGas.categories = {
  hse: [
    {
      id: "well-control",
      name: "Well Control / Blowout Prevention",
      keywords: "well control, blowout, kick, BOP, barrier, well integrity, pressure, drilling, completion",
      descriptions: ["Loss of well control during drilling or workover.", "Blowout prevention systems fail.", "Well barrier integrity compromised.", "Kick not detected or managed properly."],
      scenarios: ["Blowout during drilling operations.", "Well control lost during completion.", "BOP fails to activate.", "Uncontrolled flow from well."],
      examples: ["Kick detected during drilling.", "BOP test failed.", "Well shut-in required.", "Mud weight inadequate."],
    },
    {
      id: "process-safety",
      name: "Process Safety Management",
      keywords: "process safety, LOPC, loss of containment, release, PSM, MOC, barrier, safeguard, critical control",
      descriptions: ["Process safety event with loss of containment.", "Safety critical element failure.", "Barrier or safeguard bypassed.", "Management of change failure."],
      scenarios: ["Hydrocarbon release from process equipment.", "Safety system bypassed during operation.", "MOC not followed for modification.", "Multiple barrier failures."],
      examples: ["Gas detector alarm.", "Safety valve lifted.", "LOPC event reported.", "PSM audit finding."],
    },
    {
      id: "environmental",
      name: "Environmental Protection",
      keywords: "environment, spill, release, contamination, emission, permit, water, air, waste, remediation",
      descriptions: ["Environmental release or contamination.", "Permit limits exceeded.", "Waste management failure.", "Environmental damage."],
      scenarios: ["Major oil spill to water.", "Air emission exceedance.", "Groundwater contamination.", "Waste disposed improperly."],
      examples: ["Spill reported to regulator.", "Air monitoring alert.", "Groundwater sample exceeded.", "Waste manifest missing."],
    },
    {
      id: "personal-safety",
      name: "Personal / Occupational Safety",
      keywords: "safety, injury, incident, fatality, PPE, hazard, permit to work, confined space, working at height",
      descriptions: ["Worker injury or fatality.", "Permit to work system failure.", "PPE not used properly.", "Unsafe act or condition."],
      scenarios: ["Fall from height.", "Struck by object.", "Confined space incident.", "Vehicle incident."],
      examples: ["LTI recorded.", "Near miss reported.", "Permit violation.", "Safety observation."],
    },
  ],

  drilling: [
    {
      id: "drilling-operations",
      name: "Drilling Operations",
      keywords: "drilling, well, rig, wellbore, casing, cementing, stuck pipe, lost circulation, NPT",
      descriptions: ["Drilling operations failure or delay.", "Wellbore integrity issues.", "Non-productive time increases.", "Equipment failure during drilling."],
      scenarios: ["Stuck pipe requires fishing.", "Lost circulation zone encountered.", "Casing cannot be run.", "Rig equipment breakdown."],
      examples: ["NPT due to equipment.", "Wellbore instability.", "Cement job failure.", "Weather downtime."],
    },
  ],

  production: [
    {
      id: "production-performance",
      name: "Production Performance",
      keywords: "production, output, decline, uptime, availability, deferment, optimization, recovery",
      descriptions: ["Production below target.", "Unplanned deferment.", "Accelerated decline.", "Recovery below expectation."],
      scenarios: ["Well production declining faster than expected.", "Facility uptime below target.", "Water breakthrough.", "Equipment reliability issues."],
      examples: ["Daily production below budget.", "Deferment logged.", "Well shut-in.", "ESP failure."],
    },
    {
      id: "reserves-management",
      name: "Reserves & Resources",
      keywords: "reserves, resources, P1, P2, PRMS, SEC, estimation, booking, downgrade",
      descriptions: ["Reserves downgrade required.", "Resource estimation uncertainty.", "Reserves replacement inadequate.", "Booking criteria not met."],
      scenarios: ["Year-end reserves reduced.", "Discovery smaller than expected.", "Technical revisions required.", "Economic assumptions changed."],
      examples: ["Reserves revision.", "Resource downgrade.", "Booking delayed.", "Auditor qualification."],
    },
  ],

  pipeline: [
    {
      id: "pipeline-integrity",
      name: "Pipeline Integrity",
      keywords: "pipeline, integrity, corrosion, pigging, ILI, leak detection, coating, cathodic protection",
      descriptions: ["Pipeline integrity failure.", "Corrosion exceeds limits.", "Leak detection failure.", "Third-party damage."],
      scenarios: ["Pipeline leak discovered.", "ILI identifies critical defects.", "External corrosion progressing.", "Excavation damage."],
      examples: ["Anomaly identified by ILI.", "Leak detected.", "Repair required.", "Integrity dig completed."],
    },
  ],

  projects: [
    {
      id: "project-delivery",
      name: "Project Delivery",
      keywords: "project, capital, cost, schedule, FEED, EPC, commissioning, startup, overrun",
      descriptions: ["Project cost overrun.", "Schedule delay.", "Scope creep.", "Contractor performance issues."],
      scenarios: ["Project exceeds budget.", "First oil delayed.", "Change orders accumulating.", "Contractor disputes."],
      examples: ["AFE exceeded.", "Schedule slippage.", "Commissioning delayed.", "Cost variance."],
    },
  ],

  executive: [
    {
      id: "strategic",
      name: "Strategic Risk",
      keywords: "strategy, portfolio, M&A, commodity, price, market, competition, energy transition",
      descriptions: ["Strategic direction unclear.", "Portfolio underperforming.", "Market changes unfavorable.", "Energy transition impacts."],
      scenarios: ["Commodity price collapse.", "Asset impairment required.", "M&A deal fails.", "Policy change impacts operations."],
      examples: ["Strategic review initiated.", "Impairment recorded.", "Divestiture considered.", "Market outlook changed."],
    },
  ],
};

ERM_TEMPLATES.oilGas.categories.getAll = function () {
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

ERM_TEMPLATES.oilGas.categories.findById = function (id) {
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

ERM_TEMPLATES.oilGas.categories.search = function (keyword) {
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
