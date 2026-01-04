/**
 * Mining & Resources - Departments
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.mining = ERM_TEMPLATES.mining || {};

ERM_TEMPLATES.mining.departments = {
  universal: [
    {
      id: "executive",
      name: "Executive / C-Suite",
      focus:
        "Strategic mine planning, investor relations, commodity market positioning, major capital allocation, stakeholder management, safety leadership visibility",
    },
    {
      id: "finance",
      name: "Finance",
      focus:
        "Mine economic modeling, commodity hedging, capital project funding, cost per tonne tracking, royalty calculations, rehabilitation provisioning",
    },
    {
      id: "hr",
      name: "Human Resources",
      focus:
        "FIFO/DIDO workforce management, skills shortages, union relations, fatigue management, remote site accommodation, mining-specific competencies",
    },
    {
      id: "it",
      name: "Information Technology",
      focus:
        "Remote site connectivity, operational technology (OT) systems, fleet management systems, mine planning software, real-time production monitoring",
    },
    {
      id: "legal",
      name: "Legal & Compliance",
      focus:
        "Mining rights and tenements, environmental permits, indigenous agreements, water licenses, regulatory submissions, contract disputes",
    },
    {
      id: "operations",
      name: "Operations",
      focus:
        "Production targets, ore extraction, processing throughput, grade control, equipment utilization, shift scheduling, stockpile management",
    },
    {
      id: "procurement",
      name: "Procurement / Supply Chain",
      focus:
        "Critical spares management, long-lead items, fuel supply, explosives logistics, remote location delivery, contractor management",
    },
    {
      id: "marketing",
      name: "Marketing & Communications",
      focus:
        "Offtake agreements, commodity sales, community communications, crisis communications, investor presentations, sustainability reporting",
    },
    {
      id: "risk",
      name: "Risk & Compliance",
      focus:
        "Critical risk management, bow-tie analysis, incident investigation, regulatory compliance tracking, insurance programs, business continuity",
    },
    {
      id: "facilities",
      name: "Facilities & Administration",
      focus:
        "Camp management, site infrastructure, access roads, airstrip operations, waste management, potable water supply",
    },
  ],

  industrySpecific: [
    {
      id: "mining-engineering",
      name: "Mining Engineering",
      focus:
        "Mine design and planning, drill and blast design, ventilation design, ground support systems, production scheduling, ore reserve management",
    },
    {
      id: "geology",
      name: "Geology & Resource Development",
      focus:
        "Geological modeling, resource estimation, grade control, exploration programs, drill program management, ore body knowledge",
    },
    {
      id: "processing",
      name: "Processing / Metallurgy",
      focus:
        "Mineral processing operations, recovery optimization, reagent management, plant maintenance, metallurgical accounting, product quality",
    },
    {
      id: "hse",
      name: "Health, Safety & Environment (HSE)",
      focus:
        "Safety management systems, incident investigation, environmental monitoring, rehabilitation, occupational health, emergency response",
    },
    {
      id: "maintenance",
      name: "Maintenance & Engineering",
      focus:
        "Fixed plant maintenance, mobile equipment maintenance, reliability engineering, shutdown planning, condition monitoring, workshop operations",
    },
    {
      id: "technical-services",
      name: "Technical Services",
      focus:
        "Survey, geotechnical engineering, hydrogeology, mine ventilation, dust suppression, technical standards",
    },
    {
      id: "community",
      name: "Community & Stakeholder Relations",
      focus:
        "Community engagement, indigenous relations, land access, social investment, grievance management, local employment programs",
    },
    {
      id: "tailings-water",
      name: "Tailings & Water Management",
      focus:
        "Tailings storage facility management, water balance, dewatering operations, water treatment, dam safety, water licensing",
    },
    {
      id: "projects",
      name: "Projects & Construction",
      focus:
        "Capital project delivery, feasibility studies, construction management, commissioning, project controls",
    },
    {
      id: "security-emergency",
      name: "Security & Emergency Services",
      focus:
        "Site security, access control, emergency response, mine rescue, crisis management, asset protection",
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
      all.push(this.universal[i]);
    }
    for (i = 0; i < this.industrySpecific.length; i++) {
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
};
