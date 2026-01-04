/**
 * Dimeri ERM - Report Data Service
 * Fetches and filters data from various ERM modules for report generation
 * ES5 Compatible
 */

(function () {
  'use strict';

  window.ERM = window.ERM || {};
  ERM.ReportDataService = ERM.ReportDataService || {};

  // ========================================
  // DATA FETCHING METHODS
  // ========================================

  /**
   * Fetch all data based on selected sources and filters
   * @param {Object} config - Configuration object with dataSources and filters
   */
  ERM.ReportDataService.fetchData = function (config) {
    // Support both old signature (dataSources, filters) and new (config object)
    var dataSources, filters;
    if (Array.isArray(config)) {
      // Old signature: fetchData(dataSources, filters)
      dataSources = config;
      filters = arguments[1] || {};
    } else {
      // New signature: fetchData(config)
      dataSources = config.dataSources || [];
      filters = config.filters || {};
    }

    var result = {
      risks: [],
      controls: [],
      kris: [],
      incidents: [],
      metadata: {
        fetchedAt: new Date().toISOString(),
        filters: filters,
        sources: dataSources
      }
    };

    // Fetch risks if selected
    if (dataSources.indexOf('risk_register') !== -1) {
      result.risks = this.fetchRisks(filters);
    }

    // Fetch controls if selected
    if (dataSources.indexOf('controls') !== -1) {
      result.controls = this.fetchControls(filters);
    }

    // Fetch KRIs if selected
    if (dataSources.indexOf('kri_dashboard') !== -1) {
      result.kris = this.fetchKRIs(filters);
    }

    // Fetch incidents if selected
    if (dataSources.indexOf('incidents') !== -1) {
      result.incidents = this.fetchIncidents(filters);
    }

    // Generate summary statistics
    result.summary = this.generateSummary(result);

    return result;
  };

  // ========================================
  // RISK REGISTER DATA
  // ========================================

  ERM.ReportDataService.fetchRisks = function (filters) {
    var risks = [];

    // Get risks from storage
    if (ERM.storage && typeof ERM.storage.get === 'function') {
      risks = ERM.storage.get('risks') || [];
    }

    // Apply filters
    risks = this.applyFilters(risks, filters, 'risk');

    return risks;
  };

  // ========================================
  // CONTROLS DATA
  // ========================================

  ERM.ReportDataService.fetchControls = function (filters) {
    var controls = [];

    // Get controls from storage
    if (ERM.storage && typeof ERM.storage.get === 'function') {
      controls = ERM.storage.get('controls') || [];
    }

    // Apply filters
    controls = this.applyFilters(controls, filters, 'control');

    return controls;
  };

  // ========================================
  // KRI DASHBOARD DATA
  // ========================================

  ERM.ReportDataService.fetchKRIs = function (filters) {
    var kris = [];

    // Get KRIs from storage
    if (ERM.storage && typeof ERM.storage.get === 'function') {
      kris = ERM.storage.get('kris') || [];
    }

    // Apply filters
    kris = this.applyFilters(kris, filters, 'kri');

    return kris;
  };

  // ========================================
  // INCIDENTS DATA
  // ========================================

  ERM.ReportDataService.fetchIncidents = function (filters) {
    var incidents = [];

    // Get incidents from storage
    if (ERM.storage && typeof ERM.storage.get === 'function') {
      incidents = ERM.storage.get('incidents') || [];
    }

    // Apply filters
    incidents = this.applyFilters(incidents, filters, 'incident');

    return incidents;
  };

  // ========================================
  // FILTER APPLICATION
  // ========================================

  ERM.ReportDataService.applyFilters = function (data, filters, dataType) {
    var self = this;
    var filtered = data.slice(); // Clone array

    if (!filters) return filtered;

    // Filter by period
    if (filters.period && filters.period !== 'all') {
      filtered = filtered.filter(function (item) {
        return self.matchesPeriod(item, filters.period);
      });
    }

    // Filter by department
    if (filters.departments && filters.departments.indexOf('all') === -1 && filters.departments.length > 0) {
      filtered = filtered.filter(function (item) {
        var itemDept = item.department || item.owner || '';
        return filters.departments.indexOf(itemDept) !== -1;
      });
    }

    // Filter by category
    if (filters.categories && filters.categories.indexOf('all') === -1 && filters.categories.length > 0) {
      filtered = filtered.filter(function (item) {
        var itemCat = item.category || item.type || '';
        return filters.categories.indexOf(itemCat) !== -1;
      });
    }

    // Filter by rating (for risks)
    if (dataType === 'risk' && filters.ratings && filters.ratings.indexOf('all') === -1 && filters.ratings.length > 0) {
      filtered = filtered.filter(function (item) {
        var rating = item.inherentRisk || item.residualRisk || item.rating || '';
        return filters.ratings.indexOf(rating) !== -1;
      });
    }

    return filtered;
  };

  // ========================================
  // PERIOD MATCHING
  // ========================================

  ERM.ReportDataService.matchesPeriod = function (item, period) {
    var itemDate = item.createdAt || item.dateOccurred || item.lastUpdated || item.date;
    if (!itemDate) return true; // Include if no date

    var date = new Date(itemDate);
    var now = new Date();
    var startOfYear = new Date(now.getFullYear(), 0, 1);
    var startOfQuarter, endOfQuarter;

    switch (period) {
      case 'current':
        // Current quarter
        var currentQuarter = Math.floor(now.getMonth() / 3);
        startOfQuarter = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endOfQuarter = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
        return date >= startOfQuarter && date <= endOfQuarter;

      case 'q1':
        startOfQuarter = new Date(now.getFullYear(), 0, 1);
        endOfQuarter = new Date(now.getFullYear(), 2, 31);
        return date >= startOfQuarter && date <= endOfQuarter;

      case 'q2':
        startOfQuarter = new Date(now.getFullYear(), 3, 1);
        endOfQuarter = new Date(now.getFullYear(), 5, 30);
        return date >= startOfQuarter && date <= endOfQuarter;

      case 'q3':
        startOfQuarter = new Date(now.getFullYear(), 6, 1);
        endOfQuarter = new Date(now.getFullYear(), 8, 30);
        return date >= startOfQuarter && date <= endOfQuarter;

      case 'q4':
        startOfQuarter = new Date(now.getFullYear(), 9, 1);
        endOfQuarter = new Date(now.getFullYear(), 11, 31);
        return date >= startOfQuarter && date <= endOfQuarter;

      case 'ytd':
        return date >= startOfYear && date <= now;

      case 'last_12_months':
        var lastYear = new Date(now);
        lastYear.setFullYear(lastYear.getFullYear() - 1);
        return date >= lastYear && date <= now;

      default:
        return true;
    }
  };

  // ========================================
  // GENERATE SUMMARY STATISTICS
  // ========================================

  ERM.ReportDataService.generateSummary = function (data) {
    var summary = {
      totalRisks: data.risks.length,
      totalControls: data.controls.length,
      totalKRIs: data.kris.length,
      totalIncidents: data.incidents.length,
      risksByLevel: { critical: 0, high: 0, medium: 0, low: 0 },
      controlsByEffectiveness: { effective: 0, partiallyEffective: 0, ineffective: 0, notTested: 0 },
      krisBreached: 0,
      incidentsBySeverity: { critical: 0, high: 0, medium: 0, low: 0 }
    };

    // Count risks by level
    data.risks.forEach(function (risk) {
      var level = (risk.inherentRisk || risk.rating || 'medium').toLowerCase();
      if (summary.risksByLevel.hasOwnProperty(level)) {
        summary.risksByLevel[level]++;
      }
    });

    // Count controls by effectiveness
    data.controls.forEach(function (control) {
      var eff = control.effectiveness || 'notTested';
      if (summary.controlsByEffectiveness.hasOwnProperty(eff)) {
        summary.controlsByEffectiveness[eff]++;
      }
    });

    // Count breached KRIs
    data.kris.forEach(function (kri) {
      if (kri.status === 'breached' || kri.isBreached) {
        summary.krisBreached++;
      }
    });

    // Count incidents by severity
    data.incidents.forEach(function (incident) {
      var sev = (incident.severity || 'medium').toLowerCase();
      if (summary.incidentsBySeverity.hasOwnProperty(sev)) {
        summary.incidentsBySeverity[sev]++;
      }
    });

    // Calculate percentages
    if (summary.totalControls > 0) {
      summary.controlEffectivenessRate = Math.round(
        (summary.controlsByEffectiveness.effective / summary.totalControls) * 100
      );
    } else {
      summary.controlEffectivenessRate = 0;
    }

    if (summary.totalKRIs > 0) {
      summary.kriComplianceRate = Math.round(
        ((summary.totalKRIs - summary.krisBreached) / summary.totalKRIs) * 100
      );
    } else {
      summary.kriComplianceRate = 100;
    }

    return summary;
  };

  // ========================================
  // GET AVAILABLE FILTER OPTIONS
  // ========================================

  ERM.ReportDataService.getFilterOptions = function () {
    var options = {
      periods: [
        { value: 'current', label: 'Current Quarter' },
        { value: 'q1', label: 'Q1' },
        { value: 'q2', label: 'Q2' },
        { value: 'q3', label: 'Q3' },
        { value: 'q4', label: 'Q4' },
        { value: 'ytd', label: 'Year to Date' },
        { value: 'last_12_months', label: 'Last 12 Months' },
        { value: 'all', label: 'All Time' }
      ],
      departments: [{ value: 'all', label: 'All Departments' }],
      categories: [{ value: 'all', label: 'All Categories' }],
      ratings: [
        { value: 'all', label: 'All Ratings' },
        { value: 'critical', label: 'Critical' },
        { value: 'high', label: 'High' },
        { value: 'medium', label: 'Medium' },
        { value: 'low', label: 'Low' }
      ]
    };

    // Get unique departments from risks and controls
    var depts = {};
    var risks = (ERM.storage && ERM.storage.get('risks')) || [];
    var controls = (ERM.storage && ERM.storage.get('controls')) || [];

    risks.forEach(function (r) {
      if (r.department) depts[r.department] = true;
      if (r.owner) depts[r.owner] = true;
    });

    controls.forEach(function (c) {
      if (c.department) depts[c.department] = true;
      if (c.owner) depts[c.owner] = true;
    });

    Object.keys(depts).forEach(function (dept) {
      options.departments.push({ value: dept, label: dept });
    });

    // Get unique categories
    var cats = {};
    risks.forEach(function (r) {
      if (r.category) cats[r.category] = true;
    });

    Object.keys(cats).forEach(function (cat) {
      options.categories.push({ value: cat, label: cat });
    });

    return options;
  };

  // ========================================
  // FORMAT DATA FOR DISPLAY
  // ========================================

  ERM.ReportDataService.formatRiskForReport = function (risk) {
    return {
      reference: risk.reference || risk.id || 'N/A',
      title: risk.title || risk.name || 'Untitled Risk',
      description: risk.description || '',
      category: risk.category || 'Uncategorized',
      owner: risk.owner || 'Unassigned',
      inherentRisk: risk.inherentRisk || risk.rating || 'medium',
      residualRisk: risk.residualRisk || risk.inherentRisk || 'medium',
      status: risk.status || 'active',
      likelihood: risk.likelihood || 3,
      impact: risk.impact || 3,
      mitigationPlan: risk.mitigationPlan || risk.mitigation || ''
    };
  };

  ERM.ReportDataService.formatControlForReport = function (control) {
    return {
      reference: control.reference || control.id || 'N/A',
      title: control.title || control.name || 'Untitled Control',
      description: control.description || '',
      type: control.type || 'preventive',
      owner: control.owner || 'Unassigned',
      effectiveness: control.effectiveness || 'notTested',
      frequency: control.frequency || 'ongoing',
      lastTested: control.lastTested || control.testDate || null,
      linkedRisks: control.linkedRisks || control.risks || []
    };
  };

  ERM.ReportDataService.formatKRIForReport = function (kri) {
    return {
      reference: kri.reference || kri.id || 'N/A',
      name: kri.name || kri.title || 'Untitled KRI',
      description: kri.description || '',
      currentValue: kri.currentValue || kri.value || 0,
      threshold: kri.threshold || 0,
      target: kri.target || 0,
      status: kri.status || 'normal',
      trend: kri.trend || 'stable',
      owner: kri.owner || 'Unassigned'
    };
  };

  ERM.ReportDataService.formatIncidentForReport = function (incident) {
    return {
      reference: incident.reference || incident.id || 'N/A',
      title: incident.title || incident.name || 'Untitled Incident',
      description: incident.description || '',
      dateOccurred: incident.dateOccurred || incident.date || null,
      severity: incident.severity || 'medium',
      status: incident.status || 'open',
      rootCause: incident.rootCause || '',
      impactDescription: incident.impactDescription || incident.impact || '',
      lessonsLearned: incident.lessonsLearned || ''
    };
  };

  // ========================================
  // GET FORMATTED DATA FOR SECTIONS
  // ========================================

  ERM.ReportDataService.getFormattedDataForSection = function (sectionId, data) {
    var self = this;

    switch (sectionId) {
      case 'executive_summary':
        return {
          summary: data.summary,
          highlights: self.generateHighlights(data)
        };

      case 'risk_overview':
      case 'risk_register':
        return {
          risks: data.risks.map(function (r) { return self.formatRiskForReport(r); }),
          summary: data.summary
        };

      case 'risk_heatmap':
        return {
          risks: data.risks,
          matrix: self.generateRiskMatrix(data.risks)
        };

      case 'top_risks':
        var sortedRisks = data.risks.slice().sort(function (a, b) {
          var levels = { critical: 4, high: 3, medium: 2, low: 1 };
          var aLevel = levels[a.inherentRisk || 'medium'] || 2;
          var bLevel = levels[b.inherentRisk || 'medium'] || 2;
          return bLevel - aLevel;
        });
        return {
          topRisks: sortedRisks.slice(0, 10).map(function (r) { return self.formatRiskForReport(r); })
        };

      case 'control_summary':
      case 'control_register':
        return {
          controls: data.controls.map(function (c) { return self.formatControlForReport(c); }),
          summary: data.summary
        };

      case 'control_gaps':
        var gaps = data.controls.filter(function (c) {
          return c.effectiveness === 'ineffective' || c.effectiveness === 'partiallyEffective';
        });
        return {
          gaps: gaps.map(function (c) { return self.formatControlForReport(c); })
        };

      case 'kri_summary':
      case 'kri_dashboard':
        return {
          kris: data.kris.map(function (k) { return self.formatKRIForReport(k); }),
          summary: data.summary
        };

      case 'kri_trends':
        return {
          kris: data.kris.map(function (k) { return self.formatKRIForReport(k); }),
          trends: self.generateKRITrends(data.kris)
        };

      case 'incident_summary':
      case 'incident_register':
        return {
          incidents: data.incidents.map(function (i) { return self.formatIncidentForReport(i); }),
          summary: data.summary
        };

      case 'incident_analysis':
        return {
          incidents: data.incidents.map(function (i) { return self.formatIncidentForReport(i); }),
          analysis: self.generateIncidentAnalysis(data.incidents)
        };

      case 'recommendations':
        return {
          recommendations: self.generateRecommendations(data)
        };

      case 'appendix':
        return {
          data: data
        };

      default:
        return data;
    }
  };

  // ========================================
  // GENERATE HIGHLIGHTS
  // ========================================

  ERM.ReportDataService.generateHighlights = function (data) {
    var highlights = [];

    // Risk highlights
    if (data.summary.risksByLevel.critical > 0) {
      highlights.push({
        type: 'critical',
        icon: '🔴',
        text: data.summary.risksByLevel.critical + ' critical risk(s) require immediate attention'
      });
    }

    if (data.summary.risksByLevel.high > 3) {
      highlights.push({
        type: 'warning',
        icon: '🟠',
        text: data.summary.risksByLevel.high + ' high-level risks identified'
      });
    }

    // Control highlights
    if (data.summary.controlEffectivenessRate < 70) {
      highlights.push({
        type: 'warning',
        icon: '⚠️',
        text: 'Control effectiveness at ' + data.summary.controlEffectivenessRate + '% - below target'
      });
    } else if (data.summary.controlEffectivenessRate >= 90) {
      highlights.push({
        type: 'success',
        icon: '✅',
        text: 'Control effectiveness at ' + data.summary.controlEffectivenessRate + '% - exceeds target'
      });
    }

    // KRI highlights
    if (data.summary.krisBreached > 0) {
      highlights.push({
        type: 'warning',
        icon: '📊',
        text: data.summary.krisBreached + ' KRI(s) have breached threshold'
      });
    }

    // Incident highlights
    if (data.summary.incidentsBySeverity.critical > 0) {
      highlights.push({
        type: 'critical',
        icon: '🚨',
        text: data.summary.incidentsBySeverity.critical + ' critical incident(s) recorded'
      });
    }

    return highlights;
  };

  // ========================================
  // GENERATE RISK MATRIX
  // ========================================

  ERM.ReportDataService.generateRiskMatrix = function (risks) {
    // 5x5 matrix: likelihood (rows) x impact (columns)
    var matrix = [];
    for (var i = 0; i < 5; i++) {
      matrix[i] = [];
      for (var j = 0; j < 5; j++) {
        matrix[i][j] = [];
      }
    }

    risks.forEach(function (risk) {
      var likelihood = Math.min(5, Math.max(1, risk.likelihood || 3)) - 1;
      var impact = Math.min(5, Math.max(1, risk.impact || 3)) - 1;
      matrix[likelihood][impact].push(risk);
    });

    return matrix;
  };

  // ========================================
  // GENERATE KRI TRENDS
  // ========================================

  ERM.ReportDataService.generateKRITrends = function (kris) {
    var trends = {
      improving: [],
      stable: [],
      deteriorating: []
    };

    kris.forEach(function (kri) {
      var trend = kri.trend || 'stable';
      if (trend === 'improving' || trend === 'down') {
        trends.improving.push(kri);
      } else if (trend === 'deteriorating' || trend === 'up') {
        trends.deteriorating.push(kri);
      } else {
        trends.stable.push(kri);
      }
    });

    return trends;
  };

  // ========================================
  // GENERATE INCIDENT ANALYSIS
  // ========================================

  ERM.ReportDataService.generateIncidentAnalysis = function (incidents) {
    var analysis = {
      byCategory: {},
      byMonth: {},
      rootCauses: {}
    };

    incidents.forEach(function (incident) {
      // By category
      var cat = incident.category || 'Other';
      analysis.byCategory[cat] = (analysis.byCategory[cat] || 0) + 1;

      // By month
      if (incident.dateOccurred) {
        var date = new Date(incident.dateOccurred);
        var monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
        analysis.byMonth[monthKey] = (analysis.byMonth[monthKey] || 0) + 1;
      }

      // Root causes
      if (incident.rootCause) {
        analysis.rootCauses[incident.rootCause] = (analysis.rootCauses[incident.rootCause] || 0) + 1;
      }
    });

    return analysis;
  };

  // ========================================
  // GENERATE RECOMMENDATIONS
  // ========================================

  ERM.ReportDataService.generateRecommendations = function (data) {
    var recommendations = [];

    // Critical risk recommendations
    if (data.summary.risksByLevel.critical > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Risk Management',
        text: 'Implement immediate mitigation plans for ' + data.summary.risksByLevel.critical + ' critical risk(s)',
        action: 'Review and update risk treatment plans within 7 days'
      });
    }

    // Control effectiveness recommendations
    if (data.summary.controlEffectivenessRate < 80) {
      recommendations.push({
        priority: 'medium',
        category: 'Control Environment',
        text: 'Strengthen control effectiveness (currently at ' + data.summary.controlEffectivenessRate + '%)',
        action: 'Conduct control remediation assessment and develop improvement plan'
      });
    }

    // KRI recommendations
    if (data.summary.krisBreached > 0) {
      recommendations.push({
        priority: 'medium',
        category: 'Key Risk Indicators',
        text: 'Address ' + data.summary.krisBreached + ' breached KRI threshold(s)',
        action: 'Investigate root causes and implement corrective measures'
      });
    }

    // General recommendations based on data patterns
    var ineffectiveControls = data.controls.filter(function (c) {
      return c.effectiveness === 'ineffective';
    }).length;

    if (ineffectiveControls > 0) {
      recommendations.push({
        priority: 'high',
        category: 'Control Gaps',
        text: ineffectiveControls + ' control(s) rated as ineffective require immediate remediation',
        action: 'Develop remediation timeline and assign accountability'
      });
    }

    return recommendations;
  };

})();
