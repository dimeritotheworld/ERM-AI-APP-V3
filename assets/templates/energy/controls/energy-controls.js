/**
 * Energy & Utilities - Control Templates
 * Dimeri ERM Template Library
 */
if (!window.ERM_TEMPLATES) window.ERM_TEMPLATES = {};
if (!window.ERM_TEMPLATES.energy) window.ERM_TEMPLATES.energy = {};
if (!window.ERM_TEMPLATES.energy.controls) window.ERM_TEMPLATES.energy.controls = {};

window.ERM_TEMPLATES.energy.controls.reliability = [
  {
    id: "ctrl-asset-management",
    titles: [
      "Asset Management Program",
      "Infrastructure Reliability",
      "Equipment Condition Assessment",
      "Asset Health Management",
      "Reliability Centered Maintenance",
      "Asset Investment Planning",
      "Grid Modernization",
      "Infrastructure Investment",
    ],
    descriptions: [
      "Comprehensive asset management program including condition assessment, risk-based prioritization, and proactive replacement/refurbishment to maintain and improve system reliability.",
      "Reliability-focused asset management with predictive analytics, condition monitoring, and systematic investment in infrastructure health and modernization.",
      "Data-driven asset investment planning based on condition, criticality, and risk to optimize capital deployment and reliability outcomes.",
      "Asset health monitoring and management using sensors, diagnostics, and analytics to predict failures and prioritize maintenance.",
      "Grid modernization program deploying advanced technologies to improve reliability, resilience, and operational capabilities.",
    ],
    keywords: [
      "asset management",
      "reliability",
      "condition",
      "maintenance",
      "infrastructure",
      "replacement",
      "investment",
      "grid modernization",
      "predictive",
      "RCM",
    ],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Asset Management Director", "VP Engineering", "VP Distribution"],
      secondary: ["Reliability Engineer", "Distribution Manager", "Transmission Manager"],
    },
    frequency: "continuous",
    department: "asset-management",
    mitigatesRiskCategories: ["reliability", "operations", "public-safety"],
  },
  {
    id: "ctrl-outage-management",
    titles: [
      "Outage Management System",
      "Storm Response Program",
      "Emergency Restoration",
      "Outage Response Protocol",
      "Mutual Aid Program",
      "Service Restoration",
      "Customer Communications",
      "OMS/DMS Integration",
    ],
    descriptions: [
      "Outage management system and storm response procedures enabling rapid restoration of service, effective resource deployment, and proactive customer communication during events.",
      "Emergency response protocols including pre-staging, mutual aid activation, damage assessment, and restoration prioritization to minimize outage duration and customer impact.",
      "Integrated OMS/DMS providing real-time outage visibility, crew dispatch, and estimated restoration time communications to customers and stakeholders.",
      "Mutual aid agreements with neighboring utilities providing access to crews, equipment, and resources for major storm restoration efforts.",
      "Customer communication protocols ensuring timely, accurate outage information through multiple channels including web, mobile, IVR, and social media.",
    ],
    keywords: [
      "outage",
      "restoration",
      "storm",
      "emergency",
      "mutual aid",
      "response",
      "OMS",
      "DMS",
      "customer communication",
      "SAIDI",
    ],
    type: "corrective",
    category: "automated",
    owners: {
      primary: ["Emergency Manager", "VP Operations", "Storm Director"],
      secondary: ["Distribution Manager", "Customer Service", "Communications"],
    },
    frequency: "triggered",
    department: "operations",
    mitigatesRiskCategories: ["reliability", "customer-service"],
  },
  {
    id: "ctrl-vegetation-management",
    titles: [
      "Vegetation Management Program",
      "Tree Trimming Program",
      "ROW Maintenance",
      "Vegetation Clearance",
      "Enhanced Vegetation Management",
      "Hazard Tree Removal",
      "Transmission Vegetation",
      "Distribution Line Clearing",
    ],
    descriptions: [
      "Systematic vegetation management program maintaining clearances from power lines to prevent outages and reduce wildfire ignition risk through regular trimming cycles.",
      "Risk-based vegetation management prioritizing high fire-threat areas, critical circuits, and reliability problem areas for enhanced clearances and more frequent cycles.",
      "Hazard tree identification and removal program addressing trees outside normal clearance zone that could contact lines if they fall.",
      "Transmission right-of-way maintenance ensuring compliance with NERC FAC-003 vegetation management requirements.",
      "Enhanced vegetation management in high fire-threat districts including extended clearances, more frequent cycles, and bare-basing.",
    ],
    keywords: [
      "vegetation",
      "tree trimming",
      "clearance",
      "ROW",
      "right of way",
      "hazard tree",
      "FAC-003",
      "fire threat",
      "cycle",
      "maintenance",
    ],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["Vegetation Manager", "VP Distribution", "Forestry Director"],
      secondary: ["Distribution Manager", "Wildfire Director", "Transmission Manager"],
    },
    frequency: "scheduled",
    department: "operations",
    mitigatesRiskCategories: ["reliability", "wildfire-risk", "public-safety"],
  },
];

window.ERM_TEMPLATES.energy.controls.publicSafety = [
  {
    id: "ctrl-wildfire-mitigation",
    titles: [
      "Wildfire Mitigation Plan",
      "Fire Risk Reduction Program",
      "System Hardening",
      "PSPS Program",
      "Fire Weather Operations",
      "Covered Conductor Deployment",
      "Sectionalizing Program",
      "Ignition Prevention",
    ],
    descriptions: [
      "Comprehensive wildfire mitigation program including enhanced vegetation management, system hardening, situational awareness, and PSPS protocols to minimize ignition risk.",
      "Multi-layered approach to wildfire risk including inspection programs, equipment upgrades, weather monitoring, operational practices, and de-energization protocols.",
      "System hardening through covered conductor, undergrounding, stronger poles, and equipment upgrades to reduce ignition potential from utility equipment.",
      "Public Safety Power Shutoff (PSPS) program with protocols, thresholds, customer notification, and essential services coordination for extreme fire weather.",
      "Situational awareness capabilities including weather stations, cameras, satellite imagery, and fire spread modeling to inform operational decisions.",
    ],
    keywords: [
      "wildfire",
      "vegetation",
      "PSPS",
      "hardening",
      "fire weather",
      "mitigation",
      "covered conductor",
      "undergrounding",
      "ignition",
      "sectionalizing",
    ],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Wildfire Director", "VP Operations", "CEO"],
      secondary: ["Vegetation Manager", "Distribution Manager", "Emergency Manager"],
    },
    frequency: "continuous",
    department: "safety",
    mitigatesRiskCategories: ["wildfire-risk", "public-safety", "liability"],
  },
  {
    id: "ctrl-public-safety",
    titles: [
      "Public Safety Program",
      "Downed Wire Response",
      "Damage Prevention",
      "Public Awareness",
      "Contact Prevention",
      "811 Program Support",
      "Equipment Security",
      "Electrical Safety Education",
    ],
    descriptions: [
      "Public safety program including rapid response to downed wires, damage prevention, equipment security, public awareness campaigns, and community education.",
      "Downed wire response protocol ensuring rapid de-energization, first responder coordination, and public protection when wires are reported down.",
      "811 damage prevention program support including locating services, excavator outreach, and ticket management to prevent dig-ins.",
      "Public awareness and education programs teaching electrical safety to students, contractors, emergency responders, and the general public.",
      "Equipment security measures including locks, enclosures, fencing, and signage to prevent unauthorized access to electrical equipment.",
    ],
    keywords: [
      "public safety",
      "downed wire",
      "damage prevention",
      "811",
      "awareness",
      "education",
      "security",
      "response",
      "contact",
      "dig-in",
    ],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["VP Safety", "Community Manager", "VP Distribution"],
      secondary: ["Safety Director", "Distribution Manager", "Public Affairs"],
    },
    frequency: "continuous",
    department: "safety",
    mitigatesRiskCategories: ["public-safety", "liability"],
  },
  {
    id: "ctrl-worker-safety",
    titles: [
      "Worker Safety Program",
      "Electrical Safety Program",
      "Lockout/Tagout Program",
      "Arc Flash Protection",
      "Live Line Work Standards",
      "PPE Program",
      "Safety Training",
      "Job Briefings",
    ],
    descriptions: [
      "Comprehensive worker safety program for employees and contractors working on or near electrical systems including training, PPE, and safe work practices.",
      "Lockout/tagout program ensuring proper isolation, verification, and grounding before work on electrical equipment to prevent electrocution.",
      "Arc flash hazard analysis, labeling, and PPE requirements to protect workers from arc flash injuries during electrical work.",
      "Live line work standards and practices for qualified workers performing energized work including minimum approach distances and insulated tools.",
      "Job briefing requirements ensuring hazards are identified, controls discussed, and all workers understand the work plan before electrical activities.",
    ],
    keywords: [
      "worker safety",
      "electrical safety",
      "lockout tagout",
      "arc flash",
      "PPE",
      "training",
      "live line",
      "job briefing",
      "LOTO",
      "isolation",
    ],
    type: "preventive",
    category: "manual",
    owners: {
      primary: ["VP Safety", "Safety Director", "VP Operations"],
      secondary: ["Training Manager", "Line Supervisor", "Substation Manager"],
    },
    frequency: "continuous",
    department: "safety",
    mitigatesRiskCategories: ["safety", "occupational-health"],
  },
];

window.ERM_TEMPLATES.energy.controls.cyber = [
  {
    id: "ctrl-grid-cybersecurity",
    titles: [
      "Grid Cybersecurity Program",
      "NERC CIP Compliance",
      "OT Security Program",
      "SCADA Security",
      "Critical Infrastructure Protection",
      "Network Segmentation",
      "Security Monitoring",
      "Cyber Defense",
    ],
    descriptions: [
      "Comprehensive grid cybersecurity program meeting NERC CIP requirements with OT-specific security controls, monitoring, detection, and incident response capabilities.",
      "Critical infrastructure protection program with network segmentation, access controls, security monitoring, vulnerability management, and regular assessments.",
      "OT security program addressing unique challenges of industrial control systems including legacy systems, availability requirements, and vendor access.",
      "Security monitoring and detection for grid control systems including SCADA, EMS, DMS, and distribution automation systems.",
      "NERC CIP compliance program ensuring all critical cyber assets meet mandatory reliability standards with evidence collection and audit readiness.",
    ],
    keywords: [
      "cybersecurity",
      "NERC CIP",
      "OT",
      "SCADA",
      "security",
      "protection",
      "network segmentation",
      "monitoring",
      "EMS",
      "DMS",
    ],
    type: "preventive",
    category: "automated",
    owners: {
      primary: ["CISO", "OT Security Manager", "CIP Compliance Manager"],
      secondary: ["IT Security", "Control System Engineer", "Compliance Manager"],
    },
    frequency: "continuous",
    department: "it",
    mitigatesRiskCategories: ["cyber-risk", "reliability", "regulatory-compliance"],
  },
  {
    id: "ctrl-cyber-incident-response",
    titles: [
      "Cyber Incident Response",
      "Grid Cyber Response Plan",
      "OT Incident Response",
      "Cyber Recovery",
      "Backup and Recovery",
      "Cyber Drills",
      "Threat Intelligence",
      "E-ISAC Participation",
    ],
    descriptions: [
      "Cyber incident response plan for grid systems including detection, containment, eradication, recovery, and communication procedures.",
      "OT-specific incident response procedures addressing unique challenges of responding to cyber events in operational environments.",
      "Backup and recovery capabilities for critical control systems enabling restoration from ransomware or destructive cyber attacks.",
      "Regular cyber incident response drills and tabletop exercises testing response procedures and coordination.",
      "Participation in Electricity ISAC (E-ISAC) for threat intelligence sharing and industry coordination on cyber threats.",
    ],
    keywords: [
      "incident response",
      "cyber",
      "recovery",
      "backup",
      "drills",
      "E-ISAC",
      "threat intelligence",
      "containment",
      "restoration",
      "ransomware",
    ],
    type: "corrective",
    category: "policy",
    owners: {
      primary: ["CISO", "OT Security Manager", "Emergency Manager"],
      secondary: ["IT Security", "Operations Manager", "Communications"],
    },
    frequency: "triggered",
    department: "it",
    mitigatesRiskCategories: ["cyber-risk", "reliability", "business-continuity"],
  },
];

window.ERM_TEMPLATES.energy.controls.regulatory = [
  {
    id: "ctrl-nerc-compliance",
    titles: [
      "NERC Compliance Program",
      "Reliability Standards Compliance",
      "CIP Compliance Program",
      "Compliance Management System",
      "Internal Controls Program",
      "Audit Readiness",
      "Evidence Management",
      "Compliance Monitoring",
    ],
    descriptions: [
      "Comprehensive NERC compliance program ensuring adherence to all applicable reliability standards through controls, monitoring, and evidence collection.",
      "CIP compliance program managing all critical infrastructure protection requirements including access control, change management, and security monitoring.",
      "Internal controls program for NERC compliance with defined processes, evidence collection, testing, and gap remediation.",
      "Compliance monitoring and testing program validating control effectiveness and identifying gaps before audits.",
      "Evidence management system maintaining required documentation and demonstrating compliance during audits and spot checks.",
    ],
    keywords: [
      "NERC",
      "compliance",
      "CIP",
      "reliability standards",
      "audit",
      "evidence",
      "internal controls",
      "monitoring",
      "testing",
      "self-certification",
    ],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Chief Compliance Officer", "NERC Compliance Manager", "CIP Manager"],
      secondary: ["Compliance Analyst", "IT Compliance", "Operations Compliance"],
    },
    frequency: "continuous",
    department: "compliance",
    mitigatesRiskCategories: ["regulatory-compliance", "cyber-risk"],
  },
  {
    id: "ctrl-regulatory-affairs",
    titles: [
      "Regulatory Affairs Program",
      "Rate Case Management",
      "Regulatory Strategy",
      "Commission Relations",
      "Stakeholder Engagement",
      "Regulatory Intelligence",
      "Rate Design",
      "Cost Recovery Filings",
    ],
    descriptions: [
      "Regulatory affairs program managing utility commission relationships, rate cases, and regulatory proceedings to achieve constructive outcomes.",
      "Rate case preparation and management including cost studies, testimony, data requests, and settlement negotiations.",
      "Regulatory strategy development aligning utility investments and operations with regulatory expectations and policy direction.",
      "Stakeholder engagement with consumer advocates, environmental groups, and other parties to rate proceedings.",
      "Regulatory intelligence monitoring commission orders, rulings, and policy developments affecting utility operations and strategy.",
    ],
    keywords: [
      "regulatory",
      "rate case",
      "commission",
      "stakeholder",
      "cost recovery",
      "rate design",
      "testimony",
      "settlement",
      "policy",
      "PUC",
    ],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["VP Regulatory", "Regulatory Affairs Director", "General Counsel"],
      secondary: ["Rate Case Manager", "External Affairs", "Finance"],
    },
    frequency: "continuous",
    department: "regulatory",
    mitigatesRiskCategories: ["regulatory-compliance", "financial"],
  },
];

window.ERM_TEMPLATES.energy.controls.generation = [
  {
    id: "ctrl-generation-reliability",
    titles: [
      "Generation Reliability Program",
      "Plant Maintenance Program",
      "Forced Outage Reduction",
      "Unit Availability",
      "Predictive Maintenance",
      "Outage Planning",
      "Equipment Reliability",
      "Performance Monitoring",
    ],
    descriptions: [
      "Generation reliability program focusing on reducing forced outages, improving availability, and ensuring units perform when needed.",
      "Planned maintenance and overhaul program optimizing unit availability and reliability through systematic inspection and refurbishment.",
      "Predictive maintenance program using condition monitoring, diagnostics, and analytics to identify developing issues before failure.",
      "Outage planning and execution ensuring planned outages are completed efficiently and units return to service on schedule.",
      "Unit performance monitoring tracking heat rate, capacity, and operating parameters to optimize efficiency and identify issues.",
    ],
    keywords: [
      "generation",
      "reliability",
      "availability",
      "forced outage",
      "maintenance",
      "predictive",
      "outage planning",
      "performance",
      "EFOR",
      "capacity",
    ],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["VP Generation", "Plant Manager", "Maintenance Manager"],
      secondary: ["Reliability Engineer", "Operations Manager", "Planning Manager"],
    },
    frequency: "continuous",
    department: "generation",
    mitigatesRiskCategories: ["reliability", "generation"],
  },
  {
    id: "ctrl-resource-planning",
    titles: [
      "Resource Planning Program",
      "Integrated Resource Plan",
      "Capacity Planning",
      "Reserve Margin Management",
      "Demand Forecasting",
      "Portfolio Optimization",
      "Supply Procurement",
      "IRP Process",
    ],
    descriptions: [
      "Integrated resource planning program ensuring adequate capacity to meet projected demand with appropriate reserve margin.",
      "Demand forecasting and load research providing basis for resource planning and procurement decisions.",
      "Capacity procurement through owned generation, purchase power agreements, and market purchases to maintain resource adequacy.",
      "Portfolio optimization balancing reliability, cost, and environmental objectives across the generation fleet.",
      "Reserve margin monitoring and management ensuring compliance with reliability requirements and stakeholder expectations.",
    ],
    keywords: [
      "resource planning",
      "IRP",
      "capacity",
      "reserve margin",
      "demand forecast",
      "portfolio",
      "procurement",
      "adequacy",
      "peak demand",
      "load",
    ],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["VP Resource Planning", "VP Generation", "CFO"],
      secondary: ["Planning Manager", "Power Supply", "Regulatory Affairs"],
    },
    frequency: "continuous",
    department: "planning",
    mitigatesRiskCategories: ["reliability", "resource-planning", "financial"],
  },
];

window.ERM_TEMPLATES.energy.controls.transmission = [
  {
    id: "ctrl-transmission-reliability",
    titles: [
      "Transmission Reliability Program",
      "Grid Operations",
      "System Protection",
      "Transmission Maintenance",
      "Substation Program",
      "Line Patrol Program",
      "Spare Equipment Program",
      "N-1 Contingency",
    ],
    descriptions: [
      "Transmission reliability program ensuring bulk power system meets NERC reliability standards through operations, maintenance, and investment.",
      "System protection program ensuring relay systems are properly coordinated and tested to protect equipment and prevent cascading.",
      "Transmission maintenance program including line patrol, substation inspection, and equipment testing to maintain reliability.",
      "Spare equipment program maintaining critical spare transformers and other equipment for rapid restoration after failures.",
      "N-1 contingency analysis ensuring system can withstand single contingencies without load loss or cascading.",
    ],
    keywords: [
      "transmission",
      "reliability",
      "protection",
      "substation",
      "maintenance",
      "spare equipment",
      "N-1",
      "contingency",
      "line patrol",
      "BES",
    ],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["VP Transmission", "Transmission Manager", "Grid Operations"],
      secondary: ["Protection Engineer", "Substation Manager", "Relay Technician"],
    },
    frequency: "continuous",
    department: "transmission",
    mitigatesRiskCategories: ["reliability", "transmission"],
  },
];

window.ERM_TEMPLATES.energy.controls.environmental = [
  {
    id: "ctrl-environmental-compliance",
    titles: [
      "Environmental Compliance Program",
      "Air Quality Compliance",
      "Water Discharge Compliance",
      "Waste Management",
      "PCB Management",
      "Environmental Monitoring",
      "Permit Management",
      "Spill Prevention",
    ],
    descriptions: [
      "Comprehensive environmental compliance program managing air, water, waste, and other environmental requirements across utility operations.",
      "Air quality compliance including emissions monitoring, reporting, and control for generation facilities and other sources.",
      "Water discharge compliance ensuring wastewater and stormwater discharges meet permit requirements.",
      "Hazardous and non-hazardous waste management including characterization, storage, and disposal.",
      "PCB management for transformers and other equipment containing polychlorinated biphenyls.",
    ],
    keywords: [
      "environmental",
      "compliance",
      "air quality",
      "water",
      "waste",
      "PCB",
      "permit",
      "monitoring",
      "emissions",
      "discharge",
    ],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Environmental Manager", "VP Environmental", "Plant Manager"],
      secondary: ["Environmental Specialist", "Compliance Coordinator", "Operations"],
    },
    frequency: "continuous",
    department: "environmental",
    mitigatesRiskCategories: ["environmental", "regulatory-compliance"],
  },
  {
    id: "ctrl-sustainability",
    titles: [
      "Sustainability Program",
      "Clean Energy Transition",
      "Emissions Reduction",
      "Renewable Energy",
      "ESG Reporting",
      "Climate Strategy",
      "Carbon Management",
      "Net Zero Program",
    ],
    descriptions: [
      "Sustainability program driving clean energy transition, emissions reduction, and environmental stewardship across utility operations.",
      "Clean energy transition strategy investing in renewables, storage, and grid modernization while managing fossil asset phase-down.",
      "Emissions reduction program tracking and reducing greenhouse gas emissions toward established targets.",
      "ESG reporting and disclosure providing stakeholders with transparent information on environmental, social, and governance performance.",
      "Climate strategy addressing physical and transition risks while pursuing decarbonization opportunities.",
    ],
    keywords: [
      "sustainability",
      "clean energy",
      "emissions",
      "renewable",
      "ESG",
      "climate",
      "carbon",
      "net zero",
      "transition",
      "decarbonization",
    ],
    type: "preventive",
    category: "policy",
    owners: {
      primary: ["Chief Sustainability Officer", "VP Strategy", "CEO"],
      secondary: ["Sustainability Manager", "Environmental Manager", "Investor Relations"],
    },
    frequency: "continuous",
    department: "sustainability",
    mitigatesRiskCategories: ["environmental", "strategic", "financial"],
  },
];

window.ERM_TEMPLATES.energy.controls.getAll = function () {
  var all = [];
  var categories = ["reliability", "publicSafety", "cyber", "regulatory", "generation", "transmission", "environmental"];
  for (var i = 0; i < categories.length; i++) {
    var cat = this[categories[i]];
    if (cat && Array.isArray(cat)) {
      for (var j = 0; j < cat.length; j++) {
        cat[j].controlCategory = categories[i];
        all.push(cat[j]);
      }
    }
  }
  return all;
};

window.ERM_TEMPLATES.energy.controls.findById = function (id) {
  var all = this.getAll();
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
};

window.ERM_TEMPLATES.energy.controls.search = function (keyword) {
  var results = [];
  var lowerKeyword = keyword.toLowerCase();
  var all = this.getAll();
  for (var i = 0; i < all.length; i++) {
    var control = all[i];
    var found = false;
    for (var j = 0; j < control.titles.length; j++) {
      if (control.titles[j].toLowerCase().indexOf(lowerKeyword) !== -1) { found = true; break; }
    }
    if (!found && control.keywords) {
      for (var k = 0; k < control.keywords.length; k++) {
        if (control.keywords[k].toLowerCase().indexOf(lowerKeyword) !== -1) { found = true; break; }
      }
    }
    if (found) results.push(control);
  }
  return results;
};

console.log("Energy & Utilities Control Templates loaded - " + window.ERM_TEMPLATES.energy.controls.getAll().length + " controls available");
