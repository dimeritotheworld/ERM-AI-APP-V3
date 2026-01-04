/**
 * Public Sector - Control Templates
 * Dimeri ERM Template Library
 * Comprehensive controls for local/state government risk management
 */
if (!window.ERM_TEMPLATES) window.ERM_TEMPLATES = {};
if (!window.ERM_TEMPLATES.publicSector) window.ERM_TEMPLATES.publicSector = {};
if (!window.ERM_TEMPLATES.publicSector.controls) window.ERM_TEMPLATES.publicSector.controls = {};

window.ERM_TEMPLATES.publicSector.controls.cyber = [
  {
    id: "ctrl-cybersecurity-program",
    titles: ["Cybersecurity Program", "IT Security Program", "Information Security Management", "Cyber Defense Program", "Security Operations Center", "Enterprise Security", "Cyber Risk Management", "Digital Security Framework"],
    descriptions: [
      "Comprehensive cybersecurity program including firewalls, intrusion detection, endpoint protection, and security monitoring to protect government systems and citizen data.",
      "Multi-layered information security program with preventive controls, detection capabilities, and incident response procedures aligned with NIST Cybersecurity Framework.",
      "Enterprise-wide security operations providing 24/7 monitoring, threat intelligence, vulnerability management, and coordinated incident response.",
      "Risk-based cybersecurity program protecting critical infrastructure, sensitive data, and essential government services from cyber threats.",
      "Integrated security framework addressing network security, application security, data protection, and user access management.",
    ],
    keywords: ["cybersecurity", "security", "firewall", "intrusion", "endpoint", "monitoring", "NIST", "SOC", "threat", "vulnerability", "malware", "ransomware"],
    type: "preventive",
    category: "automated",
    owners: { primary: ["CIO", "CISO", "IT Director"], secondary: ["Security Analyst", "Network Administrator", "Systems Administrator"] },
    frequency: "continuous",
    department: "it",
    mitigatesRiskCategories: ["cyber-risk", "data-breach"],
  },
  {
    id: "ctrl-incident-response",
    titles: ["Cyber Incident Response Plan", "Security Incident Response", "Breach Response Protocol", "IT Emergency Response", "Computer Security Incident Response", "CSIRT Operations", "Breach Notification Program", "Cyber Emergency Response"],
    descriptions: [
      "Documented incident response plan with defined roles, communication protocols, and procedures for responding to cybersecurity incidents affecting government systems.",
      "Cyber incident response capability including detection, containment, eradication, recovery, and lessons learned processes aligned with industry standards.",
      "Multi-agency incident response coordination enabling rapid response to significant cyber events affecting critical government services.",
      "Breach notification program ensuring timely communication to affected citizens, regulators, and stakeholders as required by state law.",
      "Computer Security Incident Response Team (CSIRT) providing specialized expertise for investigating and remediating cyber incidents.",
    ],
    keywords: ["incident", "response", "breach", "containment", "recovery", "CSIRT", "notification", "forensics", "eradication", "remediation"],
    type: "corrective",
    category: "manual",
    owners: { primary: ["CISO", "IT Director", "Emergency Manager"], secondary: ["Security Team", "Legal Counsel", "Communications Director"] },
    frequency: "triggered",
    department: "it",
    mitigatesRiskCategories: ["cyber-risk", "data-breach"],
  },
  {
    id: "ctrl-access-management",
    titles: ["Identity and Access Management", "IAM Program", "Access Control System", "User Provisioning", "Privileged Access Management", "Role-Based Access Control", "Multi-Factor Authentication", "Single Sign-On"],
    descriptions: [
      "Identity and access management program controlling user access to government systems based on job responsibilities and need-to-know principles.",
      "Automated user provisioning and de-provisioning integrated with HR systems to ensure timely access changes for new hires, transfers, and terminations.",
      "Privileged access management providing enhanced controls for administrative accounts including vaulting, session recording, and just-in-time access.",
      "Multi-factor authentication required for remote access, sensitive systems, and privileged accounts to prevent unauthorized access.",
      "Role-based access control framework aligning system permissions with job functions and enforcing least privilege principles.",
    ],
    keywords: ["access", "identity", "IAM", "MFA", "provisioning", "privileged", "RBAC", "authentication", "authorization", "SSO"],
    type: "preventive",
    category: "automated",
    owners: { primary: ["CISO", "IT Director"], secondary: ["Identity Administrator", "Security Analyst", "HR Director"] },
    frequency: "continuous",
    department: "it",
    mitigatesRiskCategories: ["cyber-risk", "data-breach", "insider-threat"],
  },
  {
    id: "ctrl-security-awareness",
    titles: ["Security Awareness Training", "Cybersecurity Education", "Phishing Awareness", "Employee Security Training", "Social Engineering Prevention", "Cyber Hygiene Program", "Information Security Awareness"],
    descriptions: [
      "Mandatory security awareness training for all employees covering phishing recognition, password security, data handling, and incident reporting.",
      "Ongoing security education program including simulated phishing exercises, security newsletters, and role-specific training for high-risk positions.",
      "Annual cybersecurity training with regular reinforcement through simulations, awareness campaigns, and performance tracking.",
      "Targeted training for employees handling sensitive data including PII, financial information, and law enforcement records.",
      "Social engineering prevention program teaching employees to recognize and report suspicious requests, pretexting, and manipulation attempts.",
    ],
    keywords: ["awareness", "training", "phishing", "education", "social engineering", "cyber hygiene", "simulation", "testing"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["CISO", "Training Director", "HR Director"], secondary: ["Security Analyst", "Department Managers"] },
    frequency: "annual",
    department: "it",
    mitigatesRiskCategories: ["cyber-risk", "data-breach"],
  },
  {
    id: "ctrl-data-backup-recovery",
    titles: ["Data Backup and Recovery", "Business Continuity", "Disaster Recovery Plan", "System Recovery", "Data Resilience", "Ransomware Recovery", "IT Continuity", "Backup Operations"],
    descriptions: [
      "Comprehensive backup program protecting critical data and systems with regular testing of recovery procedures to ensure recoverability.",
      "Immutable backup solution providing protection against ransomware with air-gapped or offline copies of critical data.",
      "Disaster recovery capability enabling restoration of essential government services within defined recovery time objectives.",
      "Tiered backup strategy based on data criticality with appropriate retention, replication, and recovery point objectives.",
      "Regular disaster recovery testing and exercises validating recovery procedures and identifying gaps before actual incidents.",
    ],
    keywords: ["backup", "recovery", "disaster", "continuity", "ransomware", "restoration", "RTO", "RPO", "resilience", "replication"],
    type: "corrective",
    category: "automated",
    owners: { primary: ["IT Director", "CISO"], secondary: ["Systems Administrator", "Database Administrator", "Emergency Manager"] },
    frequency: "continuous",
    department: "it",
    mitigatesRiskCategories: ["cyber-risk", "business-continuity"],
  },
];

window.ERM_TEMPLATES.publicSector.controls.financial = [
  {
    id: "ctrl-internal-controls",
    titles: ["Internal Control Framework", "Financial Controls", "Segregation of Duties", "Control Environment", "COSO Framework Implementation", "Financial Management Controls", "Transaction Controls", "Authorization Controls"],
    descriptions: [
      "Internal control framework ensuring proper authorization, segregation of duties, and oversight of financial transactions per COSO principles.",
      "System of financial controls including approval authorities, reconciliations, and management oversight to prevent errors and fraud.",
      "Segregation of duties matrix preventing single individuals from controlling all aspects of financial transactions from initiation to recording.",
      "Multi-level approval requirements for expenditures based on dollar thresholds with documented delegation of authority.",
      "Control environment establishing tone at the top, management philosophy, and organizational commitment to strong financial governance.",
    ],
    keywords: ["internal controls", "segregation", "authorization", "reconciliation", "oversight", "COSO", "approval", "delegation", "governance"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["Finance Director", "Controller", "City Manager"], secondary: ["Internal Auditor", "Department Heads", "Accounting Manager"] },
    frequency: "continuous",
    department: "finance",
    mitigatesRiskCategories: ["financial-management", "fraud"],
  },
  {
    id: "ctrl-budget-monitoring",
    titles: ["Budget Monitoring", "Fiscal Monitoring", "Revenue Tracking", "Financial Reporting", "Budget Variance Analysis", "Fiscal Dashboard", "Revenue Forecasting", "Expenditure Monitoring"],
    descriptions: [
      "Regular budget monitoring and variance analysis to identify potential shortfalls early and enable timely corrective action.",
      "Monthly financial reporting and analysis comparing actual results to budget with explanation of significant variances.",
      "Real-time fiscal dashboard providing management visibility into revenue collections, expenditure rates, and fund balances.",
      "Quarterly revenue forecasting updating projections based on actual collections and economic indicators.",
      "Department-level budget monitoring with automatic alerts when expenditures approach or exceed allocated amounts.",
    ],
    keywords: ["budget", "monitoring", "variance", "reporting", "forecast", "revenue", "expenditure", "dashboard", "fiscal"],
    type: "detective",
    category: "manual",
    owners: { primary: ["Budget Director", "Finance Director", "CFO"], secondary: ["Department Heads", "Accountants", "Financial Analysts"] },
    frequency: "monthly",
    department: "finance",
    mitigatesRiskCategories: ["financial-management", "fiscal-sustainability"],
  },
  {
    id: "ctrl-grant-management",
    titles: ["Grant Management Program", "Federal Grant Compliance", "Grant Administration", "Grant Monitoring", "Single Audit Compliance", "Subrecipient Monitoring", "Grant Closeout", "Cost Allocation"],
    descriptions: [
      "Comprehensive grant management program ensuring compliance with federal Uniform Guidance, state requirements, and grantor-specific terms.",
      "Grant administration procedures including pre-award assessment, ongoing monitoring, reporting, and closeout to ensure compliance.",
      "Subrecipient monitoring program assessing risk, conducting site visits, and reviewing financial and programmatic reports.",
      "Cost allocation methodology ensuring proper charging of direct and indirect costs to grants in accordance with approved cost allocation plans.",
      "Grant closeout procedures ensuring timely final reporting, drawdown reconciliation, and record retention.",
    ],
    keywords: ["grant", "compliance", "federal", "reporting", "Uniform Guidance", "subrecipient", "cost allocation", "Single Audit", "2 CFR 200"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["Grants Manager", "Finance Director"], secondary: ["Program Managers", "Department Heads", "Accountants"] },
    frequency: "continuous",
    department: "finance",
    mitigatesRiskCategories: ["grants", "compliance", "audit-findings"],
  },
  {
    id: "ctrl-pension-governance",
    titles: ["Pension Fund Governance", "Retirement System Oversight", "Investment Policy", "Fiduciary Oversight", "Actuarial Monitoring", "Pension Board Governance", "OPEB Management"],
    descriptions: [
      "Pension fund governance framework with fiduciary board, investment policy, and independent oversight of retirement system administration.",
      "Investment policy statement defining asset allocation, risk tolerance, and performance benchmarks for pension fund investments.",
      "Actuarial monitoring program tracking funded status, contribution requirements, and demographic assumptions.",
      "Fiduciary training program ensuring board members and staff understand duties of loyalty, prudence, and diversification.",
      "OPEB (Other Post-Employment Benefits) trust management with dedicated funding strategy and investment oversight.",
    ],
    keywords: ["pension", "fiduciary", "investment", "actuarial", "retirement", "OPEB", "funded status", "governance", "board"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["Pension Board", "Finance Director", "City Manager"], secondary: ["Investment Consultant", "Actuary", "HR Director"] },
    frequency: "quarterly",
    department: "finance",
    mitigatesRiskCategories: ["pension-liability", "financial-management"],
  },
  {
    id: "ctrl-procurement-controls",
    titles: ["Procurement Controls", "Purchasing Procedures", "Competitive Bidding", "Contract Management", "Vendor Selection", "P-Card Controls", "Sole Source Review"],
    descriptions: [
      "Procurement program ensuring competitive bidding, fair vendor selection, and compliance with state procurement laws.",
      "Purchasing procedures with appropriate approval thresholds, bid requirements, and documentation standards.",
      "Contract management system tracking contract terms, renewals, performance, and compliance with scope and budget.",
      "Procurement card (P-Card) program with transaction limits, blocked merchant categories, and monthly reconciliation requirements.",
      "Sole source and emergency procurement review process ensuring proper justification and approval for non-competitive purchases.",
    ],
    keywords: ["procurement", "purchasing", "bidding", "contract", "vendor", "RFP", "P-Card", "sole source", "competitive"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["Procurement Director", "Finance Director"], secondary: ["Purchasing Agents", "Contract Administrators", "Department Heads"] },
    frequency: "continuous",
    department: "finance",
    mitigatesRiskCategories: ["procurement-fraud", "compliance", "financial-management"],
  },
];

window.ERM_TEMPLATES.publicSector.controls.publicSafety = [
  {
    id: "ctrl-use-of-force-policy",
    titles: ["Use of Force Policy", "Force Continuum", "De-escalation Policy", "Response to Resistance", "Force Review Board", "Duty to Intervene", "Sanctity of Life Policy", "Less-Lethal Options"],
    descriptions: [
      "Comprehensive use of force policy defining authorized force levels, de-escalation requirements, duty to intervene, and reporting procedures.",
      "Policy governing officer use of force with emphasis on de-escalation, proportionality, and sanctity of life principles.",
      "Force continuum model guiding appropriate response options based on subject resistance and threat level.",
      "Duty to intervene requirement obligating officers to stop or report inappropriate force by fellow officers.",
      "Force review board process examining significant use of force incidents for policy compliance and training implications.",
    ],
    keywords: ["use of force", "policy", "de-escalation", "force continuum", "proportionality", "duty to intervene", "sanctity of life"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["Police Chief", "Training Commander", "City Attorney"], secondary: ["Patrol Commander", "Professional Standards", "Civilian Oversight"] },
    frequency: "continuous",
    department: "police",
    mitigatesRiskCategories: ["public-safety", "legal-liability", "civil-rights"],
  },
  {
    id: "ctrl-body-cameras",
    titles: ["Body-Worn Camera Program", "BWC Program", "Officer Recording", "Video Documentation", "In-Car Camera System", "Video Evidence Management", "Public Safety Recording"],
    descriptions: [
      "Body-worn camera program providing video documentation of police interactions for transparency, accountability, and evidence preservation.",
      "Mandatory body camera program with clear activation policies, data retention periods, and public release procedures.",
      "Video evidence management system ensuring secure storage, chain of custody, and appropriate access controls.",
      "In-car and body camera integration providing comprehensive documentation of traffic stops and citizen encounters.",
      "Camera audit program verifying officer compliance with activation requirements and proper evidence handling.",
    ],
    keywords: ["body camera", "BWC", "video", "recording", "transparency", "evidence", "accountability", "in-car camera"],
    type: "detective",
    category: "automated",
    owners: { primary: ["Police Chief", "IT Director", "Evidence Custodian"], secondary: ["Professional Standards", "Legal Counsel", "Records Manager"] },
    frequency: "continuous",
    department: "police",
    mitigatesRiskCategories: ["public-safety", "legal-liability", "transparency"],
  },
  {
    id: "ctrl-emergency-management",
    titles: ["Emergency Management Program", "Disaster Preparedness", "EOC Operations", "Emergency Response Plan", "NIMS Compliance", "Hazard Mitigation Plan", "COOP Planning", "Emergency Exercises"],
    descriptions: [
      "Comprehensive emergency management program including planning, training, exercises, and coordination for effective disaster response.",
      "Emergency operations capability including EOC activation protocols, incident command, mutual aid, and recovery procedures.",
      "NIMS-compliant emergency management system enabling effective coordination with federal, state, and local partners.",
      "Hazard mitigation plan identifying risks and implementing projects to reduce vulnerability to natural and man-made disasters.",
      "Continuity of Operations Planning (COOP) ensuring essential government functions continue during and after emergencies.",
    ],
    keywords: ["emergency", "disaster", "EOC", "incident command", "preparedness", "response", "NIMS", "mitigation", "COOP", "exercise"],
    type: "corrective",
    category: "manual",
    owners: { primary: ["Emergency Manager", "City Manager", "Fire Chief"], secondary: ["Police Chief", "Public Works Director", "Communications Director"] },
    frequency: "triggered",
    department: "emergency-management",
    mitigatesRiskCategories: ["emergency-management", "public-safety", "business-continuity"],
  },
  {
    id: "ctrl-911-operations",
    titles: ["911 Communications Center", "Emergency Dispatch", "Public Safety Answering Point", "PSAP Operations", "CAD System", "Priority Dispatch", "Emergency Call Processing"],
    descriptions: [
      "24/7 emergency communications center providing call-taking, dispatch, and coordination services for police, fire, and EMS.",
      "Computer-aided dispatch (CAD) system enabling efficient resource deployment and real-time incident tracking.",
      "Priority dispatch protocols ensuring appropriate resource allocation based on call type and severity.",
      "Quality assurance program monitoring call processing times, dispatch accuracy, and protocol compliance.",
      "Redundant communications systems ensuring 911 service continuity during technical failures or disasters.",
    ],
    keywords: ["911", "dispatch", "PSAP", "CAD", "communications", "call processing", "emergency", "priority dispatch"],
    type: "preventive",
    category: "automated",
    owners: { primary: ["911 Director", "Police Chief", "Fire Chief"], secondary: ["Communications Supervisors", "IT Director", "Quality Assurance"] },
    frequency: "continuous",
    department: "emergency-management",
    mitigatesRiskCategories: ["public-safety", "emergency-response"],
  },
  {
    id: "ctrl-fire-prevention",
    titles: ["Fire Prevention Program", "Fire Code Enforcement", "Building Inspections", "Fire Safety Education", "Fire Investigation", "Sprinkler Monitoring", "Fire Marshal Operations"],
    descriptions: [
      "Fire prevention program including code enforcement, plan review, inspections, and public education to reduce fire risk.",
      "Fire code enforcement ensuring commercial and multi-family buildings meet fire safety requirements.",
      "Annual fire safety inspections of high-risk occupancies including schools, hospitals, and places of assembly.",
      "Fire investigation capability determining origin and cause of fires to support prosecution and prevention efforts.",
      "Community risk reduction program targeting high-risk populations with smoke alarm installation and fire safety education.",
    ],
    keywords: ["fire prevention", "inspection", "code enforcement", "fire safety", "fire marshal", "sprinkler", "investigation", "education"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["Fire Chief", "Fire Marshal"], secondary: ["Fire Inspectors", "Building Official", "Community Outreach"] },
    frequency: "continuous",
    department: "fire",
    mitigatesRiskCategories: ["public-safety", "fire-risk", "code-compliance"],
  },
];

window.ERM_TEMPLATES.publicSector.controls.infrastructure = [
  {
    id: "ctrl-asset-management",
    titles: ["Asset Management Program", "Infrastructure Management", "Capital Planning", "Facility Management", "GIS Asset Inventory", "Condition Assessment", "Life Cycle Planning", "Capital Improvement Program"],
    descriptions: [
      "Asset management program including inventory, condition assessment, and risk-based prioritization for capital investment decisions.",
      "Systematic approach to managing infrastructure assets through their lifecycle to optimize performance and investment.",
      "GIS-based asset inventory providing location, condition, and attribute data for all major infrastructure assets.",
      "Risk-based capital improvement program prioritizing projects based on condition, criticality, and consequence of failure.",
      "Facility condition assessment program regularly evaluating building systems and prioritizing maintenance and replacement.",
    ],
    keywords: ["asset management", "infrastructure", "capital", "condition assessment", "lifecycle", "GIS", "CIP", "facility"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["Public Works Director", "Facilities Manager", "Asset Manager"], secondary: ["GIS Coordinator", "Budget Director", "Engineers"] },
    frequency: "continuous",
    department: "public-works",
    mitigatesRiskCategories: ["infrastructure", "capital-planning"],
  },
  {
    id: "ctrl-water-quality",
    titles: ["Water Quality Program", "Water Testing", "Distribution Monitoring", "Treatment Operations", "Cross-Connection Control", "Source Water Protection", "Lead and Copper Rule Compliance", "Disinfection Monitoring"],
    descriptions: [
      "Water quality monitoring and testing program ensuring safe drinking water and compliance with EPA and state regulations.",
      "Comprehensive water quality program including source monitoring, treatment optimization, and distribution system management.",
      "Lead and Copper Rule compliance program including corrosion control, sampling, and lead service line replacement.",
      "Cross-connection control program preventing backflow contamination through inspection, testing, and enforcement.",
      "Disinfection monitoring ensuring adequate residual throughout distribution system while minimizing disinfection byproducts.",
    ],
    keywords: ["water quality", "testing", "monitoring", "treatment", "compliance", "lead", "copper", "disinfection", "cross-connection"],
    type: "detective",
    category: "automated",
    owners: { primary: ["Utilities Director", "Water Superintendent", "Lab Director"], secondary: ["Water Quality Manager", "Treatment Operators", "Compliance Officer"] },
    frequency: "continuous",
    department: "utilities",
    mitigatesRiskCategories: ["infrastructure", "public-safety", "compliance", "public-health"],
  },
  {
    id: "ctrl-stormwater-management",
    titles: ["Stormwater Management Program", "MS4 Permit Compliance", "Flood Control", "Drainage Maintenance", "Green Infrastructure", "Erosion Control", "NPDES Stormwater", "Flood Plain Management"],
    descriptions: [
      "Stormwater management program meeting MS4 permit requirements including pollution prevention, public education, and monitoring.",
      "Flood control and drainage maintenance program reducing flood risk through infrastructure maintenance and improvement.",
      "Green infrastructure program using natural systems to manage stormwater and improve water quality.",
      "Erosion and sediment control enforcement during construction to prevent water quality degradation.",
      "Flood plain management program regulating development in flood-prone areas and maintaining flood insurance eligibility.",
    ],
    keywords: ["stormwater", "MS4", "flood", "drainage", "green infrastructure", "NPDES", "erosion", "flood plain"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["Public Works Director", "Stormwater Manager"], secondary: ["Environmental Compliance", "Engineering", "Planning Director"] },
    frequency: "continuous",
    department: "public-works",
    mitigatesRiskCategories: ["environmental", "flood-risk", "compliance"],
  },
  {
    id: "ctrl-transportation-safety",
    titles: ["Transportation Safety Program", "Traffic Safety", "Vision Zero", "Road Safety Audit", "Work Zone Safety", "Pedestrian Safety", "Traffic Engineering", "ADA Accessibility"],
    descriptions: [
      "Transportation safety program identifying and addressing high-crash locations through engineering, education, and enforcement.",
      "Vision Zero initiative working toward eliminating traffic fatalities through data-driven safety improvements.",
      "Road safety audits systematically evaluating roadway segments and intersections for safety deficiencies.",
      "Work zone traffic control ensuring safe conditions for workers and motorists during construction and maintenance.",
      "ADA transition plan for public rights-of-way ensuring accessible pedestrian facilities throughout the community.",
    ],
    keywords: ["transportation", "traffic safety", "Vision Zero", "road safety", "work zone", "pedestrian", "ADA", "accessibility"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["Public Works Director", "Traffic Engineer", "Transportation Planner"], secondary: ["Police Traffic Unit", "ADA Coordinator", "Engineering"] },
    frequency: "continuous",
    department: "public-works",
    mitigatesRiskCategories: ["public-safety", "legal-liability", "ada-compliance"],
  },
  {
    id: "ctrl-utility-operations",
    titles: ["Utility Operations Management", "SCADA Security", "Treatment Plant Operations", "Collection System Management", "Water Loss Control", "Energy Management", "Utility Master Planning"],
    descriptions: [
      "Utility operations management ensuring reliable water, wastewater, and electric services to the community.",
      "SCADA system security protecting industrial control systems from cyber threats while maintaining operational functionality.",
      "Treatment plant operations maintaining regulatory compliance and optimal performance of water and wastewater facilities.",
      "Collection system management program preventing sanitary sewer overflows through inspection, cleaning, and rehabilitation.",
      "Water loss control program reducing non-revenue water through leak detection, meter accuracy, and infrastructure repair.",
    ],
    keywords: ["utility", "SCADA", "treatment plant", "collection system", "water loss", "operations", "wastewater", "SSO"],
    type: "preventive",
    category: "automated",
    owners: { primary: ["Utilities Director", "Plant Superintendent"], secondary: ["SCADA Administrator", "Operations Supervisors", "Maintenance Manager"] },
    frequency: "continuous",
    department: "utilities",
    mitigatesRiskCategories: ["infrastructure", "service-reliability", "compliance"],
  },
];

window.ERM_TEMPLATES.publicSector.controls.fraud = [
  {
    id: "ctrl-fraud-prevention",
    titles: ["Fraud Prevention Program", "Anti-Fraud Controls", "Ethics Program", "Fraud Deterrence", "Whistleblower Program", "Fraud Risk Assessment", "Code of Ethics", "Conflict of Interest Policy"],
    descriptions: [
      "Fraud prevention program including ethics training, fraud awareness, anonymous hotline, and investigation procedures.",
      "Comprehensive approach to fraud deterrence through tone at the top, controls, monitoring, and accountability.",
      "Anonymous whistleblower hotline enabling employees and citizens to report suspected fraud, waste, and abuse.",
      "Annual fraud risk assessment identifying high-risk areas and implementing targeted controls.",
      "Conflict of interest policy requiring disclosure and management of financial interests and outside activities.",
    ],
    keywords: ["fraud", "prevention", "ethics", "hotline", "whistleblower", "conflict of interest", "code of ethics", "deterrence"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["City Manager", "Internal Auditor", "Ethics Officer"], secondary: ["HR Director", "Legal Counsel", "Department Heads"] },
    frequency: "continuous",
    department: "executive",
    mitigatesRiskCategories: ["fraud", "ethics", "governance"],
  },
  {
    id: "ctrl-fraud-detection",
    titles: ["Fraud Detection Program", "Data Analytics", "Continuous Auditing", "Exception Reporting", "Forensic Analysis", "Transaction Monitoring", "Audit Analytics"],
    descriptions: [
      "Fraud detection program using data analytics to identify anomalies, duplicate payments, and suspicious patterns.",
      "Continuous auditing techniques automatically monitoring high-risk transactions and generating exception reports.",
      "Regular data matching with state and federal databases to identify ghost employees, false vendors, and benefit fraud.",
      "Payroll analytics identifying potential timecard fraud, unauthorized overtime, and payroll irregularities.",
      "Procurement analytics detecting bid rigging indicators, vendor favoritism, and contract splitting.",
    ],
    keywords: ["fraud detection", "data analytics", "continuous auditing", "exception", "forensic", "monitoring", "analytics"],
    type: "detective",
    category: "automated",
    owners: { primary: ["Internal Auditor", "Finance Director"], secondary: ["IT Director", "Data Analyst", "Procurement Director"] },
    frequency: "continuous",
    department: "audit",
    mitigatesRiskCategories: ["fraud", "financial-management"],
  },
];

window.ERM_TEMPLATES.publicSector.controls.compliance = [
  {
    id: "ctrl-records-management",
    titles: ["Records Management Program", "Public Records", "Records Retention", "FOIA Compliance", "E-Discovery", "Document Management", "Archival Program", "Records Destruction"],
    descriptions: [
      "Records management program ensuring proper creation, retention, and disposition of public records in compliance with state law.",
      "Public records request processing system meeting statutory response deadlines and transparency requirements.",
      "Records retention schedule defining retention periods for all record types based on legal, fiscal, and administrative requirements.",
      "E-discovery capability enabling efficient searching and production of electronic records for litigation and investigations.",
      "Secure records destruction program ensuring proper disposal of records that have met retention requirements.",
    ],
    keywords: ["records management", "public records", "retention", "FOIA", "e-discovery", "archival", "destruction", "transparency"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["City Clerk", "Records Manager", "IT Director"], secondary: ["Legal Counsel", "Department Records Liaisons"] },
    frequency: "continuous",
    department: "clerk",
    mitigatesRiskCategories: ["compliance", "legal-liability", "transparency"],
  },
  {
    id: "ctrl-ada-compliance",
    titles: ["ADA Compliance Program", "Accessibility Program", "Reasonable Accommodation", "ADA Self-Evaluation", "Accessible Facilities", "Web Accessibility", "ADA Transition Plan"],
    descriptions: [
      "ADA compliance program ensuring equal access to government programs, services, activities, and employment.",
      "ADA self-evaluation and transition plan identifying barriers and implementing remediation for public facilities and programs.",
      "Reasonable accommodation process for employees and program participants with disabilities.",
      "Web accessibility program ensuring digital content meets WCAG standards for individuals with disabilities.",
      "Complaint and grievance procedures for ADA-related concerns with timely investigation and resolution.",
    ],
    keywords: ["ADA", "accessibility", "accommodation", "transition plan", "WCAG", "disability", "barrier removal", "equal access"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["ADA Coordinator", "HR Director", "City Manager"], secondary: ["Facilities Manager", "IT Director", "Program Managers"] },
    frequency: "continuous",
    department: "administration",
    mitigatesRiskCategories: ["ada-compliance", "legal-liability", "civil-rights"],
  },
  {
    id: "ctrl-open-meetings",
    titles: ["Open Meetings Compliance", "Sunshine Law Compliance", "Meeting Notice", "Public Comment", "Meeting Minutes", "Executive Session Compliance", "Board Training"],
    descriptions: [
      "Open meetings compliance program ensuring all public body meetings comply with state open meeting law requirements.",
      "Meeting notice procedures providing timely public notice of meetings, agendas, and meeting materials.",
      "Public comment procedures enabling meaningful citizen participation in public meetings.",
      "Executive session compliance ensuring proper procedures for closed sessions including required findings and limited topics.",
      "Training program for elected officials and board members on open meeting requirements and best practices.",
    ],
    keywords: ["open meetings", "sunshine law", "notice", "public comment", "minutes", "executive session", "transparency", "board"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["City Clerk", "City Attorney", "City Manager"], secondary: ["Department Directors", "Board Staff Liaisons"] },
    frequency: "continuous",
    department: "clerk",
    mitigatesRiskCategories: ["compliance", "transparency", "governance"],
  },
  {
    id: "ctrl-civil-rights",
    titles: ["Civil Rights Compliance", "Title VI Program", "Title VII Compliance", "Fair Housing", "EEO Program", "Non-Discrimination Policy", "LEP Plan", "Affirmative Action"],
    descriptions: [
      "Civil rights compliance program ensuring non-discrimination in government programs, services, and employment.",
      "Title VI program preventing discrimination based on race, color, or national origin in federally-assisted programs.",
      "Language access plan providing meaningful access to services for individuals with limited English proficiency.",
      "Fair housing program affirmatively furthering fair housing through policy, planning, and enforcement.",
      "EEO program ensuring equal employment opportunity and addressing workplace discrimination and harassment.",
    ],
    keywords: ["civil rights", "Title VI", "Title VII", "fair housing", "EEO", "non-discrimination", "LEP", "affirmative action"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["Civil Rights Coordinator", "HR Director", "City Manager"], secondary: ["EEO Officer", "Planning Director", "Program Managers"] },
    frequency: "continuous",
    department: "administration",
    mitigatesRiskCategories: ["civil-rights", "compliance", "legal-liability"],
  },
];

window.ERM_TEMPLATES.publicSector.controls.workforce = [
  {
    id: "ctrl-hiring-practices",
    titles: ["Merit-Based Hiring", "Civil Service System", "Recruitment Program", "Background Checks", "Hiring Compliance", "Nepotism Prevention", "Veteran Preference"],
    descriptions: [
      "Merit-based hiring program ensuring fair, competitive selection based on qualifications and job-related criteria.",
      "Civil service system protecting employees from political influence and ensuring due process in personnel actions.",
      "Comprehensive background check program for all positions including criminal history, verification, and references.",
      "Nepotism and favoritism prevention policies with disclosure requirements and hiring restrictions.",
      "Veteran preference program in accordance with state and federal requirements for eligible veterans.",
    ],
    keywords: ["hiring", "civil service", "recruitment", "background check", "nepotism", "veteran preference", "merit"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["HR Director", "Civil Service Commission", "City Manager"], secondary: ["Hiring Managers", "Background Investigator", "Legal Counsel"] },
    frequency: "triggered",
    department: "hr",
    mitigatesRiskCategories: ["workforce", "compliance", "governance"],
  },
  {
    id: "ctrl-succession-planning",
    titles: ["Succession Planning", "Workforce Planning", "Knowledge Transfer", "Leadership Development", "Talent Management", "Critical Position Analysis", "Retirement Planning"],
    descriptions: [
      "Succession planning program identifying and developing talent for critical leadership and technical positions.",
      "Workforce planning analyzing demographics, skills gaps, and future needs to inform recruitment and development.",
      "Knowledge transfer program capturing institutional knowledge from retiring employees before departure.",
      "Leadership development program preparing high-potential employees for future management responsibilities.",
      "Critical position analysis identifying single points of failure and developing bench strength.",
    ],
    keywords: ["succession", "workforce planning", "knowledge transfer", "leadership development", "talent", "retirement", "critical positions"],
    type: "preventive",
    category: "manual",
    owners: { primary: ["HR Director", "City Manager"], secondary: ["Department Directors", "Training Coordinator", "Organizational Development"] },
    frequency: "annual",
    department: "hr",
    mitigatesRiskCategories: ["workforce", "institutional-knowledge", "leadership"],
  },
  {
    id: "ctrl-labor-relations",
    titles: ["Labor Relations Program", "Collective Bargaining", "Union Relations", "Grievance Processing", "Contract Administration", "Impasse Resolution", "Meet and Confer"],
    descriptions: [
      "Labor relations program managing collective bargaining, contract administration, and union relationships.",
      "Grievance processing system ensuring timely and fair resolution of employee and union grievances.",
      "Contract administration ensuring compliance with collective bargaining agreement terms and conditions.",
      "Impasse resolution procedures including mediation and arbitration when negotiations reach deadlock.",
      "Labor-management committees promoting collaborative problem-solving on workplace issues.",
    ],
    keywords: ["labor relations", "collective bargaining", "union", "grievance", "contract", "arbitration", "mediation"],
    type: "preventive",
    category: "policy",
    owners: { primary: ["HR Director", "City Manager", "Labor Relations Manager"], secondary: ["Department Directors", "City Attorney", "Union Representatives"] },
    frequency: "continuous",
    department: "hr",
    mitigatesRiskCategories: ["workforce", "labor-disruption", "legal-liability"],
  },
];

window.ERM_TEMPLATES.publicSector.controls.getAll = function () {
  var all = [];
  var categories = ["cyber", "financial", "publicSafety", "infrastructure", "fraud", "compliance", "workforce"];
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

window.ERM_TEMPLATES.publicSector.controls.findById = function (id) {
  var all = this.getAll();
  for (var i = 0; i < all.length; i++) if (all[i].id === id) return all[i];
  return null;
};

window.ERM_TEMPLATES.publicSector.controls.search = function (keyword) {
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

console.log("Public Sector Control Templates loaded");
