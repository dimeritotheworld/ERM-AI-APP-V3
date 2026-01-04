/**
 * Manufacturing - Departments
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.manufacturing = ERM_TEMPLATES.manufacturing || {};

ERM_TEMPLATES.manufacturing.departments = {
  universal: [
    {
      id: "executive",
      name: "Executive / C-Suite",
      focus:
        "Strategic direction, capital allocation, investor relations, customer relationships, safety leadership visibility, organizational culture, merger and acquisition decisions, board governance",
    },
    {
      id: "finance",
      name: "Finance & Accounting",
      focus:
        "Cost accounting, product costing, capital project funding, working capital management, variance analysis, budgeting and forecasting, financial reporting, tax compliance",
    },
    {
      id: "hr",
      name: "Human Resources",
      focus:
        "Workforce planning, labor relations, union negotiations, skills development, shift scheduling, turnover management, compensation and benefits, employee engagement, training programs",
    },
    {
      id: "it",
      name: "Information Technology",
      focus:
        "ERP systems, manufacturing execution systems (MES), OT/IT integration, cybersecurity, network infrastructure, data analytics, business intelligence, system availability",
    },
    {
      id: "legal",
      name: "Legal & Compliance",
      focus:
        "Contract management, regulatory compliance, intellectual property, product liability, employment law, environmental permits, litigation management, trade compliance",
    },
    {
      id: "operations",
      name: "Operations",
      focus:
        "Production scheduling, capacity planning, throughput optimization, OEE improvement, shift management, production targets, resource allocation, operational excellence",
    },
    {
      id: "procurement",
      name: "Procurement / Supply Chain",
      focus:
        "Supplier management, strategic sourcing, contract negotiation, cost reduction, supplier quality, inventory management, logistics coordination, material availability",
    },
    {
      id: "sales-marketing",
      name: "Sales & Marketing",
      focus:
        "Customer relationships, demand forecasting, order management, pricing strategy, market development, product promotion, customer satisfaction, competitive intelligence",
    },
    {
      id: "risk",
      name: "Risk Management",
      focus:
        "Enterprise risk management, insurance programs, business continuity planning, incident investigation, risk assessments, compliance monitoring, crisis management",
    },
    {
      id: "facilities",
      name: "Facilities & Administration",
      focus:
        "Building maintenance, utilities management, security, cleaning services, space planning, capital projects, vendor management, reception and administrative support",
    },
  ],

  industrySpecific: [
    {
      id: "production",
      name: "Production / Manufacturing",
      focus:
        "Assembly operations, fabrication, machine operation, production line management, shift supervision, output targets, labor allocation, work instructions, standard work adherence",
    },
    {
      id: "quality",
      name: "Quality Assurance & Control",
      focus:
        "Incoming inspection, in-process quality, final inspection, SPC implementation, quality management system, customer complaints, corrective actions, supplier quality audits, calibration",
    },
    {
      id: "engineering",
      name: "Engineering",
      focus:
        "Product design, process engineering, tooling design, equipment specifications, engineering changes, design for manufacturing, cost reduction projects, new product introduction",
    },
    {
      id: "maintenance",
      name: "Maintenance & Reliability",
      focus:
        "Preventive maintenance, predictive maintenance, breakdown repair, spare parts management, equipment reliability, CMMS management, shutdown planning, condition monitoring",
    },
    {
      id: "ehs",
      name: "Environment, Health & Safety (EHS)",
      focus:
        "Safety programs, incident investigation, hazard identification, environmental compliance, permit management, waste management, emergency response, safety training, PPE programs",
    },
    {
      id: "supply-chain",
      name: "Supply Chain & Logistics",
      focus:
        "Materials planning, inventory control, warehouse management, shipping and receiving, logistics coordination, demand planning, MRP management, supplier scheduling",
    },
    {
      id: "plant-management",
      name: "Plant Management",
      focus:
        "Site leadership, operational KPIs, budget management, capital projects, community relations, regulatory interface, continuous improvement, cross-functional coordination",
    },
    {
      id: "r-and-d",
      name: "Research & Development",
      focus:
        "New product development, prototype creation, testing and validation, technology scouting, innovation management, intellectual property development, product lifecycle management",
    },
    {
      id: "process-engineering",
      name: "Process Engineering",
      focus:
        "Process optimization, process capability studies, equipment utilization, cycle time reduction, bottleneck analysis, process validation, scale-up activities, process documentation",
    },
    {
      id: "automation",
      name: "Automation & Controls",
      focus:
        "PLC programming, robotics integration, automation systems, control system maintenance, HMI development, motion control, vision systems, system integration",
    },
    {
      id: "tooling",
      name: "Tooling & Tool Room",
      focus:
        "Tool and die making, fixture design, mold maintenance, tooling repair, gauge management, cutting tool management, jig and fixture maintenance, prototype tooling",
    },
    {
      id: "continuous-improvement",
      name: "Continuous Improvement / Lean",
      focus:
        "Lean manufacturing, kaizen events, waste elimination, value stream mapping, 5S implementation, standard work development, visual management, problem solving facilitation",
    },
    {
      id: "planning-scheduling",
      name: "Planning & Scheduling",
      focus:
        "Production planning, master scheduling, capacity planning, sequencing optimization, schedule adherence, customer delivery dates, work order management, resource balancing",
    },
    {
      id: "regulatory-affairs",
      name: "Regulatory Affairs",
      focus:
        "Regulatory submissions, compliance documentation, audit preparation, certification maintenance, product registration, regulatory intelligence, change notifications",
    },
    {
      id: "customer-quality",
      name: "Customer Quality",
      focus:
        "Customer complaints, returns processing, root cause analysis, corrective action responses, customer audits, quality agreements, customer scorecards, supplier development",
    },
  ],

  /**
   * Get all departments as a flat array
   * @returns {Array} All departments
   */
  getAll: function () {
    var all = [];
    var i;
    for (i = 0; i < this.universal.length; i++) {
      this.universal[i].type = "universal";
      all.push(this.universal[i]);
    }
    for (i = 0; i < this.industrySpecific.length; i++) {
      this.industrySpecific[i].type = "industry-specific";
      all.push(this.industrySpecific[i]);
    }
    return all;
  },

  /**
   * Find department by ID
   * @param {string} id - Department ID
   * @returns {Object|null} Department object or null
   */
  findById: function (id) {
    var i;
    for (i = 0; i < this.universal.length; i++) {
      if (this.universal[i].id === id) {
        return this.universal[i];
      }
    }
    for (i = 0; i < this.industrySpecific.length; i++) {
      if (this.industrySpecific[i].id === id) {
        return this.industrySpecific[i];
      }
    }
    return null;
  },

  /**
   * Get departments by subsector relevance
   * @param {string} subsectorId - Subsector ID
   * @returns {Array} Relevant departments
   */
  getBySubsector: function (subsectorId) {
    var all = this.getAll();
    var subsectorRelevance = {
      automotive: ["production", "quality", "engineering", "supply-chain", "tooling", "automation"],
      aerospace: ["production", "quality", "engineering", "regulatory-affairs", "r-and-d"],
      electronics: ["production", "quality", "engineering", "automation", "r-and-d"],
      "food-beverage": ["production", "quality", "ehs", "regulatory-affairs", "maintenance"],
      pharmaceutical: ["production", "quality", "regulatory-affairs", "r-and-d", "process-engineering"],
      chemical: ["production", "process-engineering", "ehs", "maintenance", "quality"],
      metals: ["production", "maintenance", "ehs", "quality", "process-engineering"],
      "plastics-rubber": ["production", "tooling", "quality", "process-engineering", "maintenance"],
      "consumer-goods": ["production", "quality", "supply-chain", "planning-scheduling"],
      "industrial-equipment": ["production", "engineering", "quality", "r-and-d", "supply-chain"],
      "contract-manufacturing": ["production", "quality", "planning-scheduling", "customer-quality"],
    };
    var relevant = subsectorRelevance[subsectorId] || [];
    var result = [];
    for (var i = 0; i < all.length; i++) {
      if (all[i].type === "universal" || relevant.indexOf(all[i].id) !== -1) {
        result.push(all[i]);
      }
    }
    return result;
  },
};

console.log("Manufacturing Departments loaded");
