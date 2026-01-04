/**
 * Oil & Gas Industry Configuration
 * ES5 Compatible
 */

if (!window.ERM_TEMPLATES) window.ERM_TEMPLATES = {};
if (!ERM_TEMPLATES.oilGas) ERM_TEMPLATES.oilGas = {};
if (!ERM_TEMPLATES.oilGas.risks) ERM_TEMPLATES.oilGas.risks = {};

ERM_TEMPLATES.oilGas.risks.config = {
  industryId: 'oil-gas',
  industryName: 'Oil & Gas',
  version: '1.0.0',

  subsectors: [
    { id: 'upstream', name: 'Upstream (E&P)', description: 'Exploration, drilling, production' },
    { id: 'midstream', name: 'Midstream', description: 'Pipelines, storage, transportation' },
    { id: 'downstream', name: 'Downstream', description: 'Refining, marketing, distribution' },
    { id: 'oilfield-services', name: 'Oilfield Services', description: 'Drilling contractors, service companies' },
    { id: 'lng', name: 'LNG', description: 'Liquefied natural gas operations' },
    { id: 'offshore', name: 'Offshore Operations', description: 'Platforms, FPSOs, subsea' }
  ],

  characteristics: {
    regulatoryEnvironment: 'VERY HIGH - EPA, OSHA, PHMSA, BSEE, State regulators, International standards',
    keyStakeholders: ['Employees', 'Contractors', 'Communities', 'Regulators', 'Joint Venture Partners', 'Investors'],
    outsourcingPatterns: ['Drilling services', 'Well services', 'Maintenance', 'Logistics', 'Catering'],
    seasonalFactors: ['Weather windows', 'Turnaround seasons', 'Demand cycles', 'Hurricane season'],
    criticalDependencies: ['Equipment availability', 'Skilled workforce', 'Transportation', 'Utilities', 'Permits']
  },

  riskAppetite: {
    safety: 'VERY_LOW',
    environmental: 'VERY_LOW',
    operational: 'LOW',
    regulatory: 'VERY_LOW',
    financial: 'MEDIUM',
    reputation: 'LOW',
    technology: 'MEDIUM'
  },

  treatmentTypes: [
    { id: 'avoid', name: 'Avoid', description: 'Eliminate the hazard or activity' },
    { id: 'mitigate', name: 'Mitigate', description: 'Reduce through engineering and administrative controls' },
    { id: 'transfer', name: 'Transfer', description: 'Insurance, contracts, JV arrangements' },
    { id: 'accept', name: 'Accept', description: 'Accept with monitoring' }
  ],

  likelihoodScale: [
    { value: 1, label: 'Rare', description: 'May occur only in exceptional circumstances (<1%)' },
    { value: 2, label: 'Unlikely', description: 'Could occur at some time (1-10%)' },
    { value: 3, label: 'Possible', description: 'Might occur at some time (10-50%)' },
    { value: 4, label: 'Likely', description: 'Will probably occur (50-90%)' },
    { value: 5, label: 'Almost Certain', description: 'Expected to occur (>90%)' }
  ],

  impactScale: [
    { value: 1, label: 'Insignificant', description: 'First aid, minor spill, <$100K' },
    { value: 2, label: 'Minor', description: 'Medical treatment, contained spill, $100K-$1M' },
    { value: 3, label: 'Moderate', description: 'Lost time injury, reportable release, $1M-$10M' },
    { value: 4, label: 'Major', description: 'Permanent disability, major spill, $10M-$100M' },
    { value: 5, label: 'Catastrophic', description: 'Fatality, environmental disaster, >$100M' }
  ],

  thirdPartyCategories: [
    { id: 'drilling', name: 'Drilling Contractors', typical: ['Rig contractors', 'Directional drilling', 'Mud logging'] },
    { id: 'well-services', name: 'Well Services', typical: ['Completions', 'Workovers', 'Stimulation'] },
    { id: 'logistics', name: 'Logistics', typical: ['Marine vessels', 'Helicopters', 'Trucking'] },
    { id: 'maintenance', name: 'Maintenance', typical: ['Turnarounds', 'Inspection', 'Repairs'] },
    { id: 'engineering', name: 'Engineering', typical: ['FEED', 'Detailed design', 'Project management'] }
  ]
};
