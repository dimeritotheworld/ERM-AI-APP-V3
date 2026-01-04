/**
 * Public Sector - Department Definitions
 * Dimeri ERM Template Library
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.publicSector = ERM_TEMPLATES.publicSector || {};

ERM_TEMPLATES.publicSector.departments = {
  universal: [
    { id: "executive", name: "Executive Leadership", description: "Mayor, City Manager, Agency Head, elected officials" },
    { id: "finance", name: "Finance & Budget", description: "Budget, treasury, accounting, grants management" },
    { id: "hr", name: "Human Resources", description: "Personnel, benefits, labor relations, recruitment" },
    { id: "legal", name: "Legal/City Attorney", description: "Legal counsel, litigation, contracts, compliance" },
    { id: "it", name: "Information Technology", description: "IT services, cybersecurity, systems, data management" },
    { id: "procurement", name: "Procurement", description: "Purchasing, contracts, vendor management" },
    { id: "communications", name: "Communications", description: "Public affairs, media relations, community engagement" },
    { id: "clerk", name: "Clerk/Records", description: "Records management, public records requests, archives" },
  ],

  industrySpecific: [
    { id: "police", name: "Police/Law Enforcement", description: "Public safety, crime prevention, investigations", subsectors: ["municipal", "state", "federal", "public-safety"] },
    { id: "fire", name: "Fire & Rescue", description: "Fire suppression, EMS, emergency response", subsectors: ["municipal", "public-safety"] },
    { id: "emergency-management", name: "Emergency Management", description: "Disaster preparedness, EOC, emergency planning", subsectors: ["all"] },
    { id: "public-works", name: "Public Works", description: "Roads, water, wastewater, infrastructure", subsectors: ["municipal", "public-works"] },
    { id: "planning", name: "Planning & Development", description: "Land use, zoning, permitting, development review", subsectors: ["municipal", "state"] },
    { id: "parks", name: "Parks & Recreation", description: "Parks, facilities, recreational programs", subsectors: ["municipal", "state"] },
    { id: "transit", name: "Transit Operations", description: "Bus, rail, paratransit services", subsectors: ["transit", "municipal"] },
    { id: "social-services", name: "Social Services", description: "Welfare, housing assistance, community programs", subsectors: ["municipal", "state", "social-services"] },
    { id: "health", name: "Public Health", description: "Health inspections, disease control, clinics", subsectors: ["municipal", "state", "healthcare"] },
    { id: "schools", name: "Education", description: "K-12 schools, administration, student services", subsectors: ["education"] },
    { id: "utilities", name: "Public Utilities", description: "Water, electric, gas utilities", subsectors: ["municipal", "public-works"] },
    { id: "corrections", name: "Corrections", description: "Jails, probation, community corrections", subsectors: ["municipal", "state", "federal", "public-safety"] },
    { id: "courts", name: "Courts/Judicial", description: "Court administration, case management", subsectors: ["municipal", "state", "federal"] },
  ],

  getAll: function () {
    var all = [];
    for (var i = 0; i < this.universal.length; i++) {
      this.universal[i].type = "universal";
      all.push(this.universal[i]);
    }
    for (var j = 0; j < this.industrySpecific.length; j++) {
      this.industrySpecific[j].type = "industry-specific";
      all.push(this.industrySpecific[j]);
    }
    return all;
  },

  getBySubsector: function (subsectorId) {
    var result = this.universal.slice();
    for (var i = 0; i < this.industrySpecific.length; i++) {
      var dept = this.industrySpecific[i];
      if (dept.subsectors.indexOf("all") !== -1 || dept.subsectors.indexOf(subsectorId) !== -1) {
        result.push(dept);
      }
    }
    return result;
  },

  findById: function (id) {
    var all = this.getAll();
    for (var i = 0; i < all.length; i++) {
      if (all[i].id === id) return all[i];
    }
    return null;
  },
};

console.log("Public Sector Departments loaded");
