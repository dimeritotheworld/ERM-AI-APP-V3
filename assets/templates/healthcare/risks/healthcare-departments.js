/**
 * Healthcare & Medical Services - Departments
 * Dimeri ERM Template Library
 * ISO 31000:2018 Aligned
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.healthcare = ERM_TEMPLATES.healthcare || {};

ERM_TEMPLATES.healthcare.departments = {
  universal: [
    {
      id: "executive",
      name: "Executive / C-Suite",
      focus:
        "Strategic healthcare planning, patient experience leadership, regulatory compliance oversight, stakeholder relations, quality improvement governance, physician relations",
    },
    {
      id: "finance",
      name: "Finance",
      focus:
        "Revenue cycle management, reimbursement optimization, payer negotiations, cost containment, capital planning, charity care, bad debt management",
    },
    {
      id: "hr",
      name: "Human Resources",
      focus:
        "Clinical staffing, credentialing, workforce planning, nurse recruitment, physician contracts, training compliance, workplace safety",
    },
    {
      id: "it",
      name: "Information Technology",
      focus:
        "Electronic health records (EHR), health information exchange, telehealth infrastructure, medical device integration, security controls, clinical decision support",
    },
    {
      id: "legal",
      name: "Legal & Compliance",
      focus:
        "Healthcare privacy regulations, medical malpractice, regulatory submissions, patient rights, informed consent, credentialing verification, fraud prevention",
    },
    {
      id: "operations",
      name: "Operations",
      focus:
        "Patient flow management, bed capacity, scheduling optimization, supply chain, environmental services, patient transport, discharge planning",
    },
    {
      id: "procurement",
      name: "Procurement / Supply Chain",
      focus:
        "Medical supplies, pharmaceuticals, equipment contracts, group purchasing, inventory management, vendor credentialing, contract compliance",
    },
    {
      id: "marketing",
      name: "Marketing & Communications",
      focus:
        "Patient acquisition, community outreach, service line marketing, reputation management, physician referral development, crisis communications",
    },
    {
      id: "risk",
      name: "Risk & Compliance",
      focus:
        "Patient safety events, incident reporting, regulatory compliance, accreditation, insurance programs, enterprise risk management, root cause analysis",
    },
    {
      id: "facilities",
      name: "Facilities & Administration",
      focus:
        "Physical plant maintenance, medical gas systems, life safety compliance, environment of care, capital projects, space planning, parking management",
    },
  ],

  industrySpecific: [
    {
      id: "nursing",
      name: "Nursing Administration",
      focus:
        "Nursing practice standards, staffing ratios, patient care quality, nurse competency, professional practice governance, care coordination, patient advocacy",
    },
    {
      id: "medical-staff",
      name: "Medical Staff Services",
      focus:
        "Physician credentialing, peer review, privileging, medical staff bylaws, provider enrollment, locum tenens management, continuing education tracking",
    },
    {
      id: "quality",
      name: "Quality & Patient Safety",
      focus:
        "Quality metrics, patient outcomes, core quality indicators, infection prevention, fall prevention, medication safety, sentinel event investigation",
    },
    {
      id: "clinical-services",
      name: "Clinical Services",
      focus:
        "Clinical protocols, care pathways, utilization review, case management, clinical documentation, treatment planning, multidisciplinary care",
    },
    {
      id: "pharmacy",
      name: "Pharmacy Services",
      focus:
        "Medication management, drug formulary, adverse drug events, controlled substances, compounding, clinical pharmacy, medication reconciliation",
    },
    {
      id: "laboratory",
      name: "Laboratory Services",
      focus:
        "Diagnostic testing, specimen handling, laboratory accreditation requirements, point-of-care testing, blood bank, pathology, reference lab management",
    },
    {
      id: "imaging",
      name: "Radiology & Imaging",
      focus:
        "Diagnostic imaging, radiation safety, equipment maintenance, imaging systems, radiology reporting, contrast media safety, imaging protocols",
    },
    {
      id: "emergency",
      name: "Emergency Services",
      focus:
        "Emergency department operations, triage, emergency care access requirements, trauma response, disaster preparedness, patient boarding, behavioral emergencies",
    },
    {
      id: "surgical",
      name: "Surgical Services",
      focus:
        "Operating room management, surgical safety, anesthesia services, sterile processing, surgical scheduling, wrong-site prevention, instrument tracking",
    },
    {
      id: "patient-experience",
      name: "Patient Experience",
      focus:
        "Patient satisfaction, complaint resolution, patient advocacy, family engagement, communication quality, service recovery",
    },
    {
      id: "infection-control",
      name: "Infection Prevention",
      focus:
        "Healthcare-associated infection prevention, isolation protocols, hand hygiene, antimicrobial stewardship, outbreak management, environmental cleaning, surveillance",
    },
    {
      id: "health-information",
      name: "Health Information Management",
      focus:
        "Medical records, coding accuracy, documentation integrity, release of information, record retention, chart completion, privacy compliance",
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
