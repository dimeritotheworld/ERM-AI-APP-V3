/**
 * Energy & Utilities Industry Configuration
 * ES5 Compatible
 */

if (!window.ERM_TEMPLATES) window.ERM_TEMPLATES = {};
if (!ERM_TEMPLATES.energy) ERM_TEMPLATES.energy = {};
if (!ERM_TEMPLATES.energy.risks) ERM_TEMPLATES.energy.risks = {};

ERM_TEMPLATES.energy.risks.config = {
  industryId: 'energy',
  industryName: 'Energy & Utilities',
  version: '1.0.0',

  subsectors: [
    { id: 'generation', name: 'Power Generation', description: 'Thermal, hydro, nuclear, renewable power plants' },
    { id: 'transmission', name: 'Transmission', description: 'High-voltage transmission networks' },
    { id: 'distribution', name: 'Distribution', description: 'Local distribution networks' },
    { id: 'renewable', name: 'Renewable Energy', description: 'Solar, wind, geothermal, biomass' },
    { id: 'gas-utility', name: 'Gas Utilities', description: 'Natural gas distribution' },
    { id: 'water', name: 'Water Utilities', description: 'Water supply and wastewater' },
    { id: 'integrated', name: 'Integrated Utilities', description: 'Multi-service utilities' }
  ],

  characteristics: {
    regulatoryEnvironment: 'VERY HIGH - FERC, NERC, State PUCs, EPA, NRC (nuclear), DOE',
    keyStakeholders: ['Customers', 'Regulators', 'Communities', 'Shareholders', 'Employees', 'Government'],
    outsourcingPatterns: ['Vegetation management', 'Meter reading', 'Call centers', 'Construction', 'IT services'],
    seasonalFactors: ['Peak demand seasons', 'Storm seasons', 'Planned outages', 'Heating/cooling seasons'],
    criticalDependencies: ['Fuel supply', 'Grid connectivity', 'SCADA systems', 'Weather', 'Workforce']
  },

  riskAppetite: {
    safety: 'VERY_LOW',
    reliability: 'VERY_LOW',
    environmental: 'LOW',
    regulatory: 'VERY_LOW',
    cyber: 'VERY_LOW',
    financial: 'MEDIUM',
    reputation: 'LOW'
  },

  treatmentTypes: [
    { id: 'avoid', name: 'Avoid', description: 'Eliminate the activity or exposure' },
    { id: 'mitigate', name: 'Mitigate', description: 'Reduce through controls and investment' },
    { id: 'transfer', name: 'Transfer', description: 'Insurance, contracts, hedging' },
    { id: 'accept', name: 'Accept', description: 'Accept with monitoring' }
  ],

  likelihoodScale: [
    { value: 1, label: 'Rare', description: 'May occur only in exceptional circumstances' },
    { value: 2, label: 'Unlikely', description: 'Could occur at some time' },
    { value: 3, label: 'Possible', description: 'Might occur at some time' },
    { value: 4, label: 'Likely', description: 'Will probably occur' },
    { value: 5, label: 'Almost Certain', description: 'Expected to occur' }
  ],

  impactScale: [
    { value: 1, label: 'Insignificant', description: 'Minor issue, <1,000 customers affected, <$100K' },
    { value: 2, label: 'Minor', description: 'Limited impact, 1,000-10,000 customers, $100K-$1M' },
    { value: 3, label: 'Moderate', description: 'Significant impact, 10,000-100,000 customers, $1M-$10M' },
    { value: 4, label: 'Major', description: 'Major outage, 100,000-1M customers, $10M-$100M' },
    { value: 5, label: 'Catastrophic', description: 'Widespread outage, >1M customers, >$100M, fatality' }
  ]
};
