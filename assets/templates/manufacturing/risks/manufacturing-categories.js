/**
 * Manufacturing - Risk Categories
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.manufacturing = ERM_TEMPLATES.manufacturing || {};

ERM_TEMPLATES.manufacturing.categories = {
  operations: [
    {
      id: "production-operations",
      name: "Production Operations",
      keywords: "production, downtime, efficiency, OEE, throughput, capacity, utilization, output, line speed, cycle time, takt time, bottleneck, constraint, yield, productivity, shift, changeover, setup, startup, shutdown",
      descriptions: [
        "Production targets are not being met due to equipment issues, material shortages, or labor constraints that are affecting throughput and customer deliveries.",
        "Operational efficiency is declining with increased downtime, slower cycle times, and reduced output per shift compared to planned capacity.",
        "Manufacturing capacity is constrained by bottlenecks, equipment limitations, or workforce availability preventing the plant from meeting demand.",
        "Production schedule adherence is suffering due to unplanned interruptions, changeover delays, or quality issues requiring rework and inspection.",
      ],
      scenarios: [
        "A critical production line shuts down unexpectedly due to equipment failure, causing missed customer shipments and expediting costs to recover the schedule.",
        "Chronic bottleneck in a key process area limits overall plant output despite available capacity elsewhere in the facility.",
        "Staffing shortages on critical shifts result in reduced production rates and inability to meet customer demand during peak periods.",
        "Quality issues require production slowdown for additional inspection and rework, reducing effective output and increasing costs.",
      ],
      examples: [
        "OEE is below target at 65% versus 85% goal.",
        "Production line has been down for 4 hours awaiting maintenance.",
        "Throughput is 15% below plan due to material shortages.",
        "Changeover times have increased, reducing available production time.",
      ],
    },
    {
      id: "equipment-reliability",
      name: "Equipment Reliability",
      keywords: "equipment, machine, breakdown, maintenance, reliability, uptime, PM, preventive, predictive, MTBF, MTTR, spare parts, asset, condition, vibration, wear, failure mode, repair, overhaul, rebuild",
      descriptions: [
        "Critical production equipment is experiencing increased breakdowns and unplanned downtime, threatening production schedules and customer commitments.",
        "Equipment reliability metrics are declining with reduced mean time between failures and extended repair times affecting plant availability.",
        "Aging equipment is becoming increasingly difficult to maintain with obsolete parts and limited technical support from original equipment manufacturers.",
        "Preventive maintenance programs are falling behind schedule, increasing the risk of unexpected equipment failures during production.",
      ],
      scenarios: [
        "A critical piece of production equipment fails catastrophically, requiring weeks for repair or replacement and causing significant production losses.",
        "Spare parts for key equipment are unavailable, extending downtime while parts are fabricated or sourced from alternative suppliers.",
        "Preventive maintenance is deferred due to production pressure, leading to increased breakdown frequency and emergency repair costs.",
        "Equipment obsolescence means replacement parts are no longer manufactured, requiring expensive custom fabrication or equipment replacement.",
      ],
      examples: [
        "CNC machine has broken down three times this month.",
        "MTBF has declined from 500 hours to 200 hours on key equipment.",
        "PM backlog has grown to 150 overdue work orders.",
        "Critical spare part has 12-week lead time and no stock.",
      ],
    },
  ],

  quality: [
    {
      id: "product-quality",
      name: "Product Quality",
      keywords: "quality, defect, scrap, rework, reject, SPC, nonconformance, inspection, specification, tolerance, measurement, gauge, capability, Cpk, yield, first pass, escape, containment, disposition, concession",
      descriptions: [
        "Product quality metrics are deteriorating with increased defect rates, higher scrap costs, and more frequent customer complaints about product conformance.",
        "Manufacturing processes are producing out-of-specification product requiring rework, sorting, or scrapping, increasing costs and reducing effective capacity.",
        "Quality escapes are occurring where nonconforming product reaches customers, resulting in complaints, returns, and potential loss of business.",
        "Process capability studies indicate declining performance with key characteristics drifting out of control limits and requiring intervention.",
      ],
      scenarios: [
        "A systematic quality defect is discovered after product has shipped to multiple customers, requiring field containment and customer notification.",
        "Statistical process control charts indicate a process shift that has resulted in production of nonconforming product over multiple shifts.",
        "Customer rejects an entire shipment due to quality issues, requiring expedited replacement and damaging the supplier scorecard.",
        "Raw material quality issue from supplier causes production of defective finished goods before the problem is detected.",
      ],
      examples: [
        "Scrap rate has increased from 2% to 5% this month.",
        "Customer has rejected shipment due to dimensional issues.",
        "SPC chart shows process has shifted out of control.",
        "First pass yield has dropped below 90% threshold.",
      ],
    },
    {
      id: "product-recall",
      name: "Product Safety & Recall",
      keywords: "recall, product safety, field action, warranty, liability, defect, consumer, injury, notification, traceability, lot, batch, serial number, regulatory, investigation, root cause, containment, remediation",
      descriptions: [
        "A product safety defect has been identified that may require a field recall, customer notification, and regulatory reporting with significant cost and reputation impact.",
        "Product liability concerns have been raised regarding potential customer injury or property damage from a product defect that escaped manufacturing quality controls.",
        "Warranty claims are increasing significantly, indicating a potential systematic product quality or design issue requiring investigation and corrective action.",
        "Regulatory agencies are investigating product safety concerns based on customer complaints or reported incidents involving manufactured products.",
      ],
      scenarios: [
        "A safety-critical defect is discovered requiring recall of thousands of products already in customer hands, with significant cost and reputation damage.",
        "Customer injury results from product failure, triggering product liability investigation and potential legal action against the manufacturer.",
        "Regulatory agency issues product safety warning based on reported incidents, requiring immediate response and potential mandatory recall.",
        "Manufacturing defect in a critical component creates risk of product failure in service, requiring proactive field inspection and replacement program.",
      ],
      examples: [
        "Product recall affecting 50,000 units has been initiated.",
        "Customer reported injury from product failure.",
        "Regulatory agency has requested product safety documentation.",
        "Warranty costs have tripled due to systematic defect.",
      ],
    },
  ],

  safety: [
    {
      id: "worker-safety",
      name: "Worker Safety",
      keywords: "safety, injury, accident, incident, recordable, lost time, near miss, hazard, PPE, ergonomic, machine guarding, lockout, tagout, LOTO, training, observation, behavior, culture, investigation, prevention",
      descriptions: [
        "Worker safety incident has occurred resulting in injury requiring medical treatment, lost time, or regulatory reporting with potential for regulatory investigation.",
        "Safety hazards have been identified in the workplace that could result in serious worker injury if not promptly addressed through engineering or administrative controls.",
        "Near miss incidents are occurring with increasing frequency, indicating underlying safety system weaknesses that could result in actual injuries.",
        "Safety culture and compliance are declining as evidenced by observation findings, training gaps, and employee concerns about workplace safety conditions.",
      ],
      scenarios: [
        "Worker is seriously injured by production equipment due to inadequate machine guarding or failure to follow lockout tagout procedures.",
        "Ergonomic injuries are increasing due to repetitive motion tasks without adequate job rotation or workstation modifications.",
        "Multiple near miss incidents in a work area indicate a significant hazard that could result in serious injury if not corrected.",
        "Safety audit reveals significant gaps in hazard controls, training documentation, and safety system implementation requiring immediate action.",
      ],
      examples: [
        "Worker suffered serious hand injury requiring surgery.",
        "OSHA recordable rate has exceeded industry benchmark.",
        "Three near misses reported in the same work area this week.",
        "Safety audit identified 25 critical findings requiring action.",
      ],
    },
    {
      id: "process-safety",
      name: "Process Safety",
      keywords: "fire, explosion, release, hazardous, PSM, process safety, chemical, flammable, combustible, ignition, containment, pressure, temperature, interlock, alarm, emergency, evacuation, fire suppression, hot work, permit",
      descriptions: [
        "Process safety event has occurred involving fire, explosion, or hazardous material release with potential for serious injuries, property damage, and environmental impact.",
        "Process safety management system gaps have been identified that increase the risk of catastrophic events involving hazardous materials or energy.",
        "Safety instrumented systems and process interlocks are not functioning as designed, reducing the layers of protection against process safety events.",
        "Hot work, confined space entry, or other high-risk activities are being conducted without adequate permit controls and safety precautions.",
      ],
      scenarios: [
        "Fire breaks out in production area due to ignition of flammable materials, requiring evacuation and emergency response with production impact.",
        "Chemical release from process equipment exposes workers and requires emergency response, regulatory notification, and investigation.",
        "Explosion occurs due to accumulation of combustible dust or flammable vapors that ignited from an uncontrolled ignition source.",
        "Process upset causes pressure vessel or piping failure with release of hazardous materials and potential for serious injuries.",
      ],
      examples: [
        "Fire in paint booth caused evacuation and 8 hours downtime.",
        "Chemical spill required hazmat response and cleanup.",
        "Dust collector explosion caused facility damage.",
        "Pressure relief valve lifted during process upset.",
      ],
    },
  ],

  supplyChain: [
    {
      id: "supply-chain",
      name: "Supply Chain & Materials",
      keywords: "supply chain, supplier, shortage, delivery, logistics, inventory, procurement, vendor, source, lead time, stockout, buffer, safety stock, single source, dual source, expedite, disruption, continuity",
      descriptions: [
        "Critical supply chain disruption is affecting material availability and threatening production continuity with potential customer delivery impact.",
        "Key supplier is experiencing difficulties that may affect their ability to deliver materials on time and in full to support production requirements.",
        "Inventory levels of critical materials have fallen below safety stock thresholds, creating risk of production stoppages due to material shortages.",
        "Single-source suppliers for critical materials represent a vulnerability in the supply chain that could cause extended production disruption if the supplier fails.",
      ],
      scenarios: [
        "Key supplier declares force majeure and cannot deliver critical materials for an extended period, requiring emergency sourcing or production shutdown.",
        "Logistics disruption prevents timely delivery of materials despite supplier availability, causing production delays and customer impact.",
        "Raw material quality issue requires rejection of incoming shipment, leaving insufficient inventory to support production until replacement arrives.",
        "Supplier financial difficulties raise concerns about their ability to continue operations and fulfill committed orders.",
      ],
      examples: [
        "Critical component is out of stock with 8-week lead time.",
        "Supplier has notified of 30% allocation on key material.",
        "Freight carrier strike is delaying incoming shipments.",
        "Key supplier has filed for bankruptcy protection.",
      ],
    },
    {
      id: "logistics-distribution",
      name: "Logistics & Distribution",
      keywords: "logistics, shipping, transportation, freight, carrier, warehouse, distribution, delivery, on-time, expedite, customs, import, export, damage, loss, tracking, capacity, cost, fuel, route",
      descriptions: [
        "Logistics and transportation issues are affecting on-time delivery to customers and increasing costs due to expediting and alternative shipping methods.",
        "Warehouse and distribution capacity constraints are limiting ability to receive, store, and ship materials efficiently to support operations.",
        "Import and export compliance issues are causing delays in receipt of materials or shipment of finished goods across international borders.",
        "Freight damage and loss rates are increasing, resulting in customer complaints, replacement costs, and potential liability claims.",
      ],
      scenarios: [
        "Major transportation carrier experiences service disruption affecting ability to ship finished goods to customers on time.",
        "Customs clearance delays for imported materials cause production shortages and require expedited alternative sourcing.",
        "Warehouse fire or natural disaster destroys finished goods inventory, requiring emergency production to fulfill customer orders.",
        "Freight cost increases significantly due to fuel prices or capacity constraints, impacting product margins and pricing.",
      ],
      examples: [
        "On-time delivery rate has dropped to 85% from 95% target.",
        "Customs hold has delayed critical imported components.",
        "Warehouse is at 98% capacity limiting receipt of materials.",
        "Freight costs have increased 25% versus budget.",
      ],
    },
  ],

  environmental: [
    {
      id: "environmental",
      name: "Environmental Compliance",
      keywords: "environmental, emission, discharge, waste, permit, compliance, spill, release, air, water, hazardous, contamination, remediation, monitoring, reporting, inspection, violation, fine, penalty",
      descriptions: [
        "Environmental compliance violation has occurred or is at risk due to permit exceedances, improper waste handling, or inadequate monitoring and reporting.",
        "Environmental release or spill has occurred requiring cleanup, regulatory notification, and potential remediation of contaminated areas.",
        "Environmental permit conditions are at risk of being exceeded due to process changes, equipment issues, or inadequate pollution control equipment.",
        "Environmental regulatory inspection has identified findings requiring corrective action and potential enforcement proceedings.",
      ],
      scenarios: [
        "Wastewater discharge exceeds permit limits, requiring regulatory notification, investigation, and potential enforcement action.",
        "Hazardous waste storage or disposal violation is discovered during inspection, resulting in citations and required corrective actions.",
        "Air emission monitoring indicates exceedance of permitted limits, requiring process adjustments and regulatory reporting.",
        "Chemical spill reaches stormwater drain, requiring emergency response, cleanup, and notification to environmental agencies.",
      ],
      examples: [
        "Air permit exceedance reported for particulate emissions.",
        "Hazardous waste storage area cited for labeling violations.",
        "Stormwater sample exceeded permit limits for oil and grease.",
        "Soil contamination discovered during construction activity.",
      ],
    },
  ],

  cyber: [
    {
      id: "cyber-ot",
      name: "Manufacturing Cybersecurity",
      keywords: "cyber, OT, security, ransomware, PLC, SCADA, ICS, network, attack, vulnerability, patch, malware, phishing, access, authentication, firewall, segmentation, backup, recovery, incident",
      descriptions: [
        "Cyber attack or security incident is affecting manufacturing systems, production equipment, or business operations with potential for extended disruption.",
        "Vulnerabilities in operational technology systems create risk of cyber attack that could disrupt production, compromise safety systems, or cause equipment damage.",
        "Ransomware attack has encrypted manufacturing systems or business data, requiring incident response and potentially affecting production continuity.",
        "Unauthorized access to manufacturing systems has been detected, indicating potential compromise that requires investigation and containment.",
      ],
      scenarios: [
        "Ransomware attack encrypts manufacturing execution system and production databases, halting production until systems are restored.",
        "Cyber attack targets programmable logic controllers, causing equipment to malfunction or operate unsafely.",
        "Phishing attack compromises employee credentials, providing attacker access to manufacturing network and systems.",
        "Vendor remote access is exploited to gain unauthorized access to manufacturing systems and data.",
      ],
      examples: [
        "MES system encrypted by ransomware, production halted.",
        "Unauthorized access detected on plant floor network.",
        "Phishing email led to credential compromise.",
        "Unpatched vulnerability discovered on critical PLC system.",
      ],
    },
  ],

  workforce: [
    {
      id: "workforce",
      name: "Workforce & Labor",
      keywords: "labor, staffing, skills, training, retention, turnover, union, strike, contract, negotiation, absenteeism, vacancy, recruitment, competency, succession, aging, knowledge, workforce planning",
      descriptions: [
        "Workforce challenges are affecting production capability including skill shortages, high turnover, and difficulty recruiting qualified workers.",
        "Labor relations issues including union negotiations, grievances, or potential work actions are creating uncertainty and risk to operations.",
        "Critical knowledge and skills are at risk due to aging workforce, retirements, and inadequate succession planning or knowledge transfer.",
        "Training gaps and competency issues are resulting in quality problems, safety incidents, and reduced operational performance.",
      ],
      scenarios: [
        "Strike or work stoppage by unionized workforce halts production, requiring contingency operations or customer allocation.",
        "Key technical expert retires without adequate knowledge transfer, leaving critical capability gaps in specialized processes.",
        "High turnover in production roles results in inexperienced workforce, increasing training costs and affecting quality and safety.",
        "Unable to recruit sufficient skilled workers to support production expansion or replace departing employees.",
      ],
      examples: [
        "Turnover rate has reached 35% in production roles.",
        "Union contract expires next month without agreement.",
        "Three maintenance technicians retiring this quarter.",
        "Training completion rate is below 80% target.",
      ],
    },
  ],

  financial: [
    {
      id: "cost-management",
      name: "Cost Management",
      keywords: "cost, margin, budget, variance, overhead, labor cost, material cost, efficiency, waste, scrap, rework, overtime, inventory, working capital, pricing, profitability, cost reduction",
      descriptions: [
        "Manufacturing costs are exceeding budget due to material cost increases, labor inefficiencies, scrap and rework, or unplanned overtime.",
        "Gross margin is being compressed by rising input costs that cannot be fully passed through to customers due to competitive pressure.",
        "Working capital is increasing due to excess inventory, slow-moving stock, or extended customer payment terms affecting cash flow.",
        "Cost reduction targets are not being achieved, putting financial performance and competitiveness at risk.",
      ],
      scenarios: [
        "Raw material prices increase significantly without ability to raise product prices, severely impacting margins.",
        "Quality problems require extensive rework and scrap, increasing manufacturing costs and reducing profitability.",
        "Labor costs exceed budget due to overtime required to meet production schedules with reduced workforce.",
        "Inventory write-offs required for obsolete or slow-moving materials, impacting financial results.",
      ],
      examples: [
        "Material costs are 10% over budget year to date.",
        "Overtime is running 150% of planned levels.",
        "Scrap and rework costs have increased 25%.",
        "Inventory turns have declined from 8 to 6 times per year.",
      ],
    },
  ],

  customer: [
    {
      id: "customer-satisfaction",
      name: "Customer Satisfaction",
      keywords: "customer, satisfaction, complaint, delivery, quality, service, relationship, scorecard, rating, on-time, in-full, OTIF, responsiveness, communication, escalation, penalty, chargeback, cancellation",
      descriptions: [
        "Customer satisfaction is declining due to delivery performance issues, quality problems, or inadequate responsiveness to customer concerns.",
        "Customer complaints are increasing in frequency and severity, threatening the business relationship and potential loss of business.",
        "Delivery performance is below customer expectations with late shipments, incomplete orders, and expediting requirements.",
        "Customer is escalating concerns about quality, delivery, or service to senior management level, indicating risk to the business relationship.",
      ],
      scenarios: [
        "Major customer issues formal notice of quality or delivery concerns with threat of reduced business or termination.",
        "Customer stops production line due to quality issue with supplied parts, resulting in significant chargeback and relationship damage.",
        "Repeated delivery failures result in customer implementing secondary source and reducing orders with the supplier.",
        "Customer audit identifies significant gaps in quality systems, resulting in conditional approval status and required improvements.",
      ],
      examples: [
        "Customer satisfaction score has dropped from 8.5 to 7.2.",
        "Major customer has issued formal quality concern letter.",
        "On-time delivery to key customer is at 82% versus 95% target.",
        "Customer has charged back $150,000 for line stoppage caused by quality issue.",
      ],
    },
  ],

  regulatory: [
    {
      id: "regulatory-compliance",
      name: "Regulatory Compliance",
      keywords: "regulatory, compliance, audit, inspection, certification, standard, requirement, violation, fine, penalty, license, permit, approval, documentation, record, traceability, validation",
      descriptions: [
        "Regulatory compliance gaps have been identified that could result in citations, fines, or loss of operating permits or certifications.",
        "Regulatory audit or inspection has identified findings requiring corrective action and follow-up verification to maintain compliance status.",
        "Required certifications or approvals are at risk due to compliance issues, process changes, or failure to complete required assessments.",
        "Documentation and record-keeping deficiencies create risk of regulatory findings and difficulty demonstrating compliance during inspections.",
      ],
      scenarios: [
        "Regulatory inspection identifies significant compliance gaps requiring immediate corrective action and potential enforcement proceedings.",
        "Required certification audit reveals nonconformances that could result in suspension or withdrawal of certification.",
        "Failure to complete required regulatory submissions or notifications results in violation and potential penalties.",
        "Product certification or approval is at risk due to process changes that were not properly validated and reported.",
      ],
      examples: [
        "Quality system certification audit scheduled with known gaps.",
        "Regulatory inspection resulted in warning letter.",
        "Required annual report was submitted late.",
        "Product certification requires re-validation after process change.",
      ],
    },
  ],

  strategic: [
    {
      id: "market-demand",
      name: "Market & Demand",
      keywords: "market, demand, forecast, customer, order, backlog, capacity, volume, growth, decline, competition, share, pricing, product mix, seasonality, trend, cycle, economic",
      descriptions: [
        "Market demand is declining or shifting away from current product offerings, threatening revenue and requiring strategic response.",
        "Demand volatility is making production planning difficult with significant forecast errors causing either excess inventory or shortages.",
        "Competitive pressure is increasing with new entrants, substitute products, or aggressive pricing threatening market position.",
        "Customer demand is exceeding capacity, creating risk of lost sales or customer defection to competitors who can supply.",
      ],
      scenarios: [
        "Major customer shifts significant volume to competitor, causing substantial revenue decline and excess capacity.",
        "Economic downturn causes broad demand reduction across customer base, requiring cost reduction and capacity adjustments.",
        "New competitive product or technology threatens to make current products obsolete or uncompetitive.",
        "Demand surge exceeds capacity, requiring decisions about customer allocation, capital investment, or outsourcing.",
      ],
      examples: [
        "Order backlog has declined 30% from prior year.",
        "Key customer has notified of 25% volume reduction.",
        "Competitor has launched disruptive new product.",
        "Demand forecast accuracy is only 60%.",
      ],
    },
    {
      id: "new-product",
      name: "New Product Launch",
      keywords: "new product, launch, introduction, NPI, development, prototype, validation, qualification, ramp-up, yield, quality, schedule, cost, design, engineering, tooling, capacity",
      descriptions: [
        "New product launch is at risk due to development delays, quality issues during qualification, or production ramp-up challenges.",
        "Product development schedule is slipping, potentially missing market window or customer commitment dates for new product introduction.",
        "Manufacturing readiness for new product is behind plan with tooling, equipment, or process validation issues threatening launch date.",
        "Production ramp-up of new product is experiencing lower than expected yields and quality issues requiring engineering intervention.",
      ],
      scenarios: [
        "New product launch is delayed due to design issues discovered during validation testing, impacting customer commitments.",
        "Production tooling for new product is delayed, pushing back manufacturing readiness and launch date.",
        "Initial production yields on new product are significantly below target, requiring engineering support and rework.",
        "Quality issues during new product ramp-up cause customer concerns and potential delay of full production release.",
      ],
      examples: [
        "New product launch is 3 months behind schedule.",
        "Validation testing has revealed design issues requiring changes.",
        "Initial production yield is 65% versus 90% target.",
        "Customer has delayed approval due to qualification test failures.",
      ],
    },
  ],
};

ERM_TEMPLATES.manufacturing.categories.getAll = function () {
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

ERM_TEMPLATES.manufacturing.categories.findById = function (id) {
  var departments = Object.keys(this);
  for (var i = 0; i < departments.length; i++) {
    if (typeof this[departments[i]] === "function") continue;
    var dept = this[departments[i]];
    if (!Array.isArray(dept)) continue;
    for (var j = 0; j < dept.length; j++) {
      if (dept[j].id === id) {
        dept[j].department = departments[i];
        return dept[j];
      }
    }
  }
  return null;
};

ERM_TEMPLATES.manufacturing.categories.search = function (keyword) {
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

console.log("Manufacturing Categories loaded");
