/**
 * Dashboard Module (Palantir-style) - ES5
 * Clean rewrite: muted visuals, no charts, heatmap intent -> register filter,
 * control coverage indicator, category hover insights.
 */

if (!window.ERM) window.ERM = {};

ERM.dashboard = {
 selectedRegister: null,
 _riskListenerAttached: false,
 _categorySentenceCache: {},
 _selectedRiskId: null,
 _selectedRiskView: null,
 _selectedCell: null,
 _selectedCellData: null,

 init: function() {
  console.log('[Dashboard] Initializing comprehensive risk analytics...');
  // Repair bidirectional links before rendering
  this.repairBidirectionalLinks();
  this.render();
  if (!this._riskListenerAttached) {
   this._riskListenerAttached = true;
   var self = this;
   document.addEventListener('erm:risks-updated', function() {
    self.render();
   });
   document.addEventListener('erm:controls-updated', function() {
    self.render();
   });
  }
 },

 /**
  * Repair bidirectional links between controls and risks
  * Ensures control.linkedRisks and risk.linkedControls are in sync
  */
 repairBidirectionalLinks: function() {
  var controls = ERM.storage.get("controls") || [];
  var risks = ERM.storage.get("risks") || [];
  var controlsUpdated = false;
  var risksUpdated = false;

  // First pass: For each risk with linkedControls, ensure control.linkedRisks includes the risk
  for (var r = 0; r < risks.length; r++) {
   var risk = risks[r];
   if (risk.linkedControls && risk.linkedControls.length > 0) {
    for (var lc = 0; lc < risk.linkedControls.length; lc++) {
     var ctrlId = risk.linkedControls[lc];
     for (var c = 0; c < controls.length; c++) {
      if (controls[c].id === ctrlId) {
       if (!controls[c].linkedRisks) {
        controls[c].linkedRisks = [];
       }
       if (controls[c].linkedRisks.indexOf(risk.id) === -1) {
        controls[c].linkedRisks.push(risk.id);
        controlsUpdated = true;
       }
       break;
      }
     }
    }
   }
  }

  // Second pass: For each control with linkedRisks, ensure risk.linkedControls includes the control
  for (var c2 = 0; c2 < controls.length; c2++) {
   var ctrl = controls[c2];
   if (ctrl.linkedRisks && ctrl.linkedRisks.length > 0) {
    for (var lr = 0; lr < ctrl.linkedRisks.length; lr++) {
     var riskId = ctrl.linkedRisks[lr];
     for (var r2 = 0; r2 < risks.length; r2++) {
      if (risks[r2].id === riskId) {
       if (!risks[r2].linkedControls) {
        risks[r2].linkedControls = [];
       }
       if (risks[r2].linkedControls.indexOf(ctrl.id) === -1) {
        risks[r2].linkedControls.push(ctrl.id);
        risksUpdated = true;
       }
       break;
      }
     }
    }
   }
  }

  if (controlsUpdated) {
   ERM.storage.set("controls", controls);
   console.log("[Dashboard] Repaired control.linkedRisks arrays");
  }
  if (risksUpdated) {
   ERM.storage.set("risks", risks);
   console.log("[Dashboard] Repaired risk.linkedControls arrays");
  }
 },

 destroy: function() {
  // Clean up tooltip when leaving dashboard
  if (this._riskDotTooltip) {
   this._riskDotTooltip.remove();
   this._riskDotTooltip = null;
  }
  // Reset selection state
  this._selectedRiskId = null;
  this._selectedRiskView = null;
  this._selectedCategory = null;
  this._selectedControlType = null;
  this._selectedCell = null;
  this._selectedCellData = null;
 },

 // ============ DATA ============
 getRegisterMap: function() {
  var registers = ERM.storage.get('registers') || [];
  var map = {};
  for (var i = 0; i < registers.length; i++) {
   map[registers[i].id] = registers[i].name || 'Default Register';
  }
  return map;
 },

 getRiskRegisters: function() {
  var risks = ERM.storage.get('risks') || [];
  var registerMap = this.getRegisterMap();
  var registers = {};
  for (var i = 0; i < risks.length; i++) {
   var risk = risks[i];
   var regName = risk.riskRegister || registerMap[risk.registerId] || 'Default Register';
   if (!registers[regName]) registers[regName] = { name: regName, risks: [] };
   registers[regName].risks.push(risk);
  }
  var arr = [];
  for (var k in registers) if (registers.hasOwnProperty(k)) arr.push(registers[k]);
  return arr;
 },

 getSelectedRisks: function() {
  var risks = ERM.storage.get('risks') || [];
  var registerMap = this.getRegisterMap();
  var result = [];
  for (var i = 0; i < risks.length; i++) {
   var regName = risks[i].riskRegister || registerMap[risks[i].registerId] || 'Default Register';
   risks[i]._registerName = regName;
   if (!this.selectedRegister || regName === this.selectedRegister) {
    result.push(risks[i]);
   }
  }
  return result;
 },

 onRegisterChange: function(registerName) {
  this.selectedRegister = registerName === 'all' ? null : registerName;
  this.render();
 },

 computeRiskStats: function() {
  var risks = this.getSelectedRisks();
  var controls = ERM.storage.get('controls') || [];

  // Get current quarter start date
  var now = new Date();
  var quarterMonth = Math.floor(now.getMonth() / 3) * 3;
  var quarterStart = new Date(now.getFullYear(), quarterMonth, 1);

  var stats = {
   risks: risks,
   highNoOwner: 0,
   highNoControls: 0,
   noReduction: 0,
   risksWithoutControls: 0,
   criticalReviewed: 0,
   criticalTotal: 0,
   highestInherent: null,
   highestResidual: null
  };

  for (var i = 0; i < risks.length; i++) {
   var r = risks[i];
   var scores = this.computeRiskScores(r);
   var inherent = scores.inherentScore || 0;
   var residual = scores.residualScore || 0;

   // Check if high risks have owners
   if (inherent >= 10 && (!r.owner || r.owner === '')) stats.highNoOwner++;

   // Check if risk has linked controls
   var hasLinkedControls = false;
   for (var c = 0; c < controls.length; c++) {
    var ctrl = controls[c];
    if (ctrl.linkedRisks && ctrl.linkedRisks.indexOf(r.id) !== -1) {
     hasLinkedControls = true;
     break;
    }
   }

   // Only count as "no reduction" if has controls but residual >= inherent
   if (hasLinkedControls && inherent > 0 && residual >= inherent - 0.01) {
    stats.noReduction++;
   }

   // Track risks without any controls
   if (inherent > 0 && !hasLinkedControls) {
    stats.risksWithoutControls++;
    // Track HIGH risks without controls (red alert)
    if (inherent >= 10) {
     stats.highNoControls++;
    }
   }

   // Check critical risks reviewed THIS quarter
   if (inherent >= 15) {
    stats.criticalTotal++;
    var reviewDate = r.reviewedAt || r.updatedAt;
    if (reviewDate) {
     var reviewedDate = new Date(reviewDate);
     if (reviewedDate >= quarterStart) {
      stats.criticalReviewed++;
     }
    }
   }

   if (!stats.highestInherent || inherent > stats.highestInherent.score) stats.highestInherent = { title: r.title || 'Untitled', score: inherent };
   if (!stats.highestResidual || residual > stats.highestResidual.score) stats.highestResidual = { title: r.title || 'Untitled', score: residual };
  }
  return stats;
 },

 // ============ RENDER ============
 render: function() {
  var container = document.getElementById('dashboard-content');
  if (!container) return;
  var stats = this.computeRiskStats();
  var mainHtml = this.buildRegisterSelector() +
   this.buildSituationOverview(stats) +
   this.buildKPICardsV2(stats) +
   this.buildAttentionPanel(stats) +
   this.buildSection1HeatMaps() +
   this.buildRiskConcentrationChart() +
   this.buildControlCoverage(stats) +
   this.buildTopRisksTable() +
   this.buildRecentActivity();
  var panelOpen = this._selectedRiskId || this._selectedCategory || this._selectedControlType || this._selectedCell;
  var panelHtml = this._selectedControlType ? this.buildControlDetailPanel() : (this._selectedCategory ? this.buildCategoryDetailPanel() : (this._selectedCell ? this.buildCellDetailPanel() : this.buildRiskDetailPanel()));
  var html = '<div class="dashboard-shell ' + (panelOpen ? 'panel-open' : '') + '">' +
   '<div class="dashboard-main">' + mainHtml + '</div>' +
   panelHtml +
   '</div>';
  container.innerHTML = html;
  this.bindEvents();
 },

 // ============ UI BLOCKS ============
 buildRegisterSelector: function() {
  var registers = this.getRiskRegisters();
  var selectedLabel = this.selectedRegister || 'All Risk Registers';

  var filterIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>';
  var chevronIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
  var checkIcon = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

  var html = '<div class="dashboard-filters">' +
   '<div class="filter-header">' +
   '<div class="filter-icon">' + filterIcon + '</div>' +
   '<div class="filter-info">' +
   '<span class="filter-title">Risk Register View</span>' +
   '<span class="filter-subtitle">Filter dashboard by register</span>' +
   '</div>' +
   '</div>' +
   '<div class="filter-selector">' +
   '<div class="custom-dropdown" id="register-dropdown">' +
   '<button type="button" class="dropdown-trigger" id="dropdown-trigger">' +
   '<span class="dropdown-value">' + ERM.utils.escapeHtml(selectedLabel) + '</span>' +
   '<span class="dropdown-arrow">' + chevronIcon + '</span>' +
   '</button>' +
   '<div class="dropdown-menu" id="dropdown-menu">' +
   '<div class="dropdown-option' + (!this.selectedRegister ? ' selected' : '') + '" data-value="all">' +
   '<span class="option-label">All Risk Registers</span>' +
   '<span class="option-check">' + checkIcon + '</span>' +
   '</div>';
  for (var i = 0; i < registers.length; i++) {
   var reg = registers[i];
   var isSelected = this.selectedRegister === reg.name;
   html += '<div class="dropdown-option' + (isSelected ? ' selected' : '') + '" data-value="' + ERM.utils.escapeHtml(reg.name) + '">' +
    '<span class="option-label">' + ERM.utils.escapeHtml(reg.name) + '</span>' +
    '<span class="option-check">' + checkIcon + '</span>' +
    '</div>';
  }
  html += '</div></div></div></div>';
  return html;
 },

 buildSituationOverview: function(stats) {
  var items = [];

  // High risks ownership check
  if (stats.highNoOwner > 0) {
   items.push({ tone: 'red', text: stats.highNoOwner + ' high risks have no owner' });
  } else if (stats.risks.length > 0) {
   items.push({ tone: 'green', text: 'All high risks have owners' });
  }

  // High risks without controls check (RED)
  if (stats.highNoControls > 0) {
   items.push({ tone: 'red', text: stats.highNoControls + ' high risks have no controls' });
  } else if (stats.noReduction > 0) {
   // Controls effectiveness check (only for risks WITH linked controls)
   items.push({ tone: 'amber', text: stats.noReduction + ' controlled risks show no reduction' });
  } else if (stats.risksWithoutControls > 0) {
   items.push({ tone: 'amber', text: stats.risksWithoutControls + ' risks have no linked controls' });
  } else if (stats.risks.length > 0) {
   items.push({ tone: 'green', text: 'All controls reducing risk effectively' });
  }

  // Critical risks quarterly review check
  if (stats.criticalTotal > 0 && stats.criticalReviewed < stats.criticalTotal) {
   items.push({ tone: 'amber', text: (stats.criticalTotal - stats.criticalReviewed) + ' critical risks not reviewed this quarter' });
  } else if (stats.criticalTotal > 0) {
   items.push({ tone: 'green', text: 'All critical risks reviewed this quarter' });
  }

  items = items.slice(0, 3);
  var html = '<div class="situation-overview">';
  for (var i = 0; i < items.length; i++) {
   html += '<span class="situation-pill tone-' + items[i].tone + '"><span class="pill-dot"></span>' + this.escapeHtml(items[i].text) + '</span>';
  }
  html += '</div>';
  return html;
 },

 buildKPICardsV2: function(stats) {
  var risks = this.getSelectedRisks();
  var totalRisks = risks.length;
  var criticalCount = 0, highCount = 0, totalInherent = 0, totalResidual = 0;
  for (var i = 0; i < risks.length; i++) {
   var risk = risks[i];
   var inh = parseFloat(risk.inherentScore || risk.inherentRisk) || 0;
   var res = parseFloat(risk.residualScore || risk.residualRisk) || 0;
   totalInherent += inh; totalResidual += res;
   if (inh >= 15) criticalCount++; else if (inh >= 10) highCount++;
  }
  var avgInherent = totalRisks > 0 ? (totalInherent / totalRisks).toFixed(1) : '0';
  var avgResidual = totalRisks > 0 ? (totalResidual / totalRisks).toFixed(1) : '0';
  return '<div class="kpi-cards">' +
   '<div class="kpi-card"><div class="kpi-icon">' + ERM.icons.fileText + '</div><div class="kpi-content"><div class="kpi-value">' + totalRisks + '</div><div class="kpi-label">Total Risks</div></div></div>' +
   '<div class="kpi-card kpi-card-critical"><div class="kpi-icon">' + ERM.icons.alertTriangle + '</div><div class="kpi-content"><div class="kpi-value">' + criticalCount + '</div><div class="kpi-label">Critical Risks</div></div></div>' +
   '<div class="kpi-card kpi-card-danger"><div class="kpi-icon">' + ERM.icons.alertCircle + '</div><div class="kpi-content"><div class="kpi-value">' + highCount + '</div><div class="kpi-label">High Risks</div></div></div>' +
   '<div class="kpi-card kpi-card-warning"><div class="kpi-icon">' + ERM.icons.barChart + '</div><div class="kpi-content"><div class="kpi-value">' + avgInherent + '</div><div class="kpi-label">Avg Inherent Risk</div></div></div>' +
   '<div class="kpi-card kpi-card-success"><div class="kpi-icon">' + ERM.icons.shield + '</div><div class="kpi-content"><div class="kpi-value">' + avgResidual + '</div><div class="kpi-label">Avg Residual Risk</div></div></div>' +
   '</div>';
 },

 buildAttentionPanel: function(stats) {
  var signals = [];

  // Each signal has text and a tooltip explanation
  if (stats.highNoOwner > 0) {
    signals.push({
      text: stats.highNoOwner + ' high risks missing owners',
      tooltip: 'High/Critical risks without an assigned risk owner. Assign owners for accountability.'
    });
  }
  if (stats.highNoControls > 0) {
    signals.push({
      text: stats.highNoControls + ' high risks have no controls',
      tooltip: 'High/Critical risks with no linked controls. These remain at full inherent risk level.'
    });
  }
  if (stats.risksWithoutControls > 0 && stats.risksWithoutControls > stats.highNoControls) {
    signals.push({
      text: (stats.risksWithoutControls - stats.highNoControls) + ' other risks have no linked controls',
      tooltip: 'Medium/Low risks without controls. Link controls to reduce residual risk scores.'
    });
  }
  if (stats.noReduction > 0) {
    signals.push({
      text: stats.noReduction + ' controlled risks show no reduction',
      tooltip: 'Risks with controls but residual equals inherent. Review control effectiveness.'
    });
  }
  if (stats.criticalTotal > 0 && stats.criticalReviewed < stats.criticalTotal) {
    signals.push({
      text: (stats.criticalTotal - stats.criticalReviewed) + ' critical risks not reviewed this quarter',
      tooltip: 'Critical risks overdue for review. Update review dates to ensure they are current.'
    });
  }
  if (signals.length === 0) {
    signals.push({
      text: 'No weak signals detected',
      tooltip: 'Your risk management is in good shape!'
    });
  }

  var infoIcon = 'i';

  var html = '<div class="attention-panel">' +
    '<div class="attention-header">' +
    '<div class="attention-title">What needs attention</div>' +
    '<span class="attention-title-info">' + infoIcon +
    '<span class="tooltip-text">Suggested gaps in your risk management that need action.</span>' +
    '</span>' +
    '</div>' +
    '<ul class="attention-list">';
  for (var i = 0; i < signals.length; i++) {
    html += '<li class="attention-item">' +
      '<span class="attention-text">' + this.escapeHtml(signals[i].text) + '</span>' +
      '<span class="attention-info-icon">' + infoIcon +
      '<span class="tooltip-text">' + this.escapeHtml(signals[i].tooltip) + '</span>' +
      '</span>' +
      '</li>';
  }
  html += '</ul></div>';
  return html;
 },

 // ============ HEATMAP ============
 buildSection1HeatMaps: function() {
  return '<div class="dashboard-section">' +
   '<h2 class="section-title">Risk Heat Maps</h2>' +
   '<div class="heatmaps-row">' +
   this.buildHeatMapCard('inherent', 'Inherent Risk Heat Map', 'Before Controls') +
   this.buildHeatMapCard('residual', 'Residual Risk Heat Map', 'After Controls') +
   '</div>' + this.buildHeatMapLegend() + '</div>';
 },

 buildHeatMapLegend: function() {
  return '<div class="heatmap-legend">' +
   '<span class="legend-item risk-low" title="1-4: Acceptable risk level. Monitor periodically.">Low (1-4)</span>' +
   '<span class="legend-item risk-medium" title="5-9: Consider controls. Regular monitoring required.">Medium (5-9)</span>' +
   '<span class="legend-item risk-high" title="10-14: Action required. Implement controls promptly.">High (10-14)</span>' +
   '<span class="legend-item risk-critical" title="15-25: Immediate action needed. Escalate to leadership.">Critical (15-25)</span>' +
   '</div>';
 },

 buildHeatMapCard: function(type, title, subtitle) {
  var risks = this.getSelectedRisks();
  var registerMap = this.getRegisterMap();
  var grid = [], riskData = [];
  for (var i = 0; i < 5; i++) { grid[i] = []; riskData[i] = []; for (var j = 0; j < 5; j++) { grid[i][j] = 0; riskData[i][j] = []; } }

  for (var k = 0; k < risks.length; k++) {
   var risk = risks[k];
   var coords = this.getRiskPosition(risk, type);
   var likelihood = coords.likelihood;
   var impact = coords.impact;
   var row = 5 - likelihood;
   var col = impact - 1;
   if (row >= 0 && row < 5 && col >= 0 && col < 5) {
    grid[row][col]++;
    var scores = this.computeRiskScores(risk);
    riskData[row][col].push({
     id: risk.id,
     title: risk.title || 'Untitled Risk',
     category: risk.category,
     inherentScore: scores.inherentScore || 0,
     residualScore: scores.residualScore || 0,
     riskRegister: risk._registerName || risk.riskRegister || registerMap[risk.registerId] || 'Default Register',
     linkedControls: (risk.linkedControls && risk.linkedControls.length) ? risk.linkedControls.length : 0,
     inherentLevel: this.getRiskLevelFromScore(scores.inherentScore || 0),
     residualLevel: this.getRiskLevelFromScore(scores.residualScore || 0)
    });
   }
  }

  var isActiveView = (this._selectedRiskView === type) || (!this._selectedRiskView && type === 'inherent');
  var activeClass = (this._selectedRiskId && isActiveView) ? ' heatmap-active' : '';
  var html = '<div class="heatmap-card heatmap-' + type + activeClass + '" data-heatmap-type="' + type + '"><div class="heatmap-card-header"><h3 class="heatmap-card-title">' + title + '</h3><span class="heatmap-card-subtitle">' + subtitle + '</span></div><div class="heatmap-wrapper"><div class="heatmap-grid-container"><div class="heatmap-y-label">LIKELIHOOD</div><div class="heatmap-main">';
  var likelihoodLabels = ['5', '4', '3', '2', '1'];
  var impactLabels = ['1', '2', '3', '4', '5'];
  for (var row = 0; row < 5; row++) {
   html += '<div class="heatmap-row"><div class="heatmap-row-label">' + likelihoodLabels[row] + '</div>';
   for (var col = 0; col < 5; col++) {
    var count = grid[row][col];
    var riskScore = (5 - row) * (col + 1);
    var colorClass = this.getHeatmapColorClass(riskScore);
    var dataAttr = 'data-type="' + type + '" data-row="' + row + '" data-col="' + col + '" data-count="' + count + '"';
    html += '<div class="heatmap-cell ' + colorClass + '" ' + dataAttr + '>';
    if (count > 0) {
     var dotsHtml = '<div class="risk-dots">';
     var maxDots = Math.min(count, 9);
     for (var d = 0; d < maxDots; d++) {
   var riskInfo = riskData[row][col][d];
   var riskIdLabel = riskInfo.id ? '#' + this.escapeHtml(riskInfo.id) : 'Risk';
   var inherentVal = riskInfo.inherentScore.toFixed ? riskInfo.inherentScore.toFixed(1) : riskInfo.inherentScore;
   var residualVal = riskInfo.residualScore.toFixed ? riskInfo.residualScore.toFixed(1) : riskInfo.residualScore;
   var dotLabel = this.escapeHtml(riskInfo.title || 'Risk') + ' (' + this.escapeHtml(riskInfo.category || 'Uncategorized') + ')';
   var isSelected = (this._selectedRiskId && String(riskInfo.id) === String(this._selectedRiskId));
   var selectedClass = isSelected ? ' risk-dot-selected' : '';
   var isCategoryHighlight = (this._selectedCategory && (riskInfo.category || 'uncategorized') === this._selectedCategory);
   var categoryClass = isCategoryHighlight ? ' risk-dot-category-highlight' : '';
   var dimClass = (this._selectedCategory && !isCategoryHighlight) ? ' risk-dot-dimmed' : '';
   dotsHtml += '<span class="risk-dot' + selectedClass + categoryClass + dimClass + '" data-risk-id="' + this.escapeHtml(riskInfo.id || '') + '" data-risk-title="' + this.escapeHtml(riskInfo.title) + '" data-risk-category="' + this.escapeHtml(riskInfo.category || 'Uncategorized') + '" data-inherent-level="' + this.escapeHtml(riskInfo.inherentLevel) + '" data-residual-level="' + this.escapeHtml(riskInfo.residualLevel) + '" data-controls="' + this.escapeHtml(riskInfo.linkedControls) + '" data-heatmap="' + type + '" aria-label="' + dotLabel + '"></span>';
     }
     if (count > 9) dotsHtml += '<span class="risk-dot-more">+' + (count - 9) + '</span>';
     dotsHtml += '</div><span class="cell-count">' + count + '</span>';
     html += dotsHtml;
    }
    html += '</div>'; // cell
   }
   html += '</div>'; // row
  }
  html += '<div class="heatmap-x-row"><div class="heatmap-spacer"></div>';
  for (var x = 0; x < 5; x++) html += '<div class="heatmap-x-label">' + impactLabels[x] + '</div>';
  html += '</div><div class="heatmap-x-axis-title">IMPACT</div></div></div></div></div>';
  return html;
 },

 getHeatmapColorClass: function(score) {
  if (score >= 15) return 'risk-critical'; if (score >= 10) return 'risk-high'; if (score >= 5) return 'risk-medium'; return 'risk-low';
 },

 // ============ RISK CONCENTRATION CHART ============
 buildRiskConcentrationChart: function() {
  var risks = this.getSelectedRisks();
  var categories = {};
  var topCat = null;
  for (var i = 0; i < risks.length; i++) {
   var r = risks[i];
   var cat = r.category || 'uncategorized';
   if (!categories[cat]) categories[cat] = { risks: [], total: 0 };
   var scores = this.computeRiskScores(r);
   categories[cat].risks.push(r);
   categories[cat].total += scores.inherentScore || 0;
  }
  var catsArray = [];
  for (var key in categories) {
   if (!categories.hasOwnProperty(key)) continue;
   catsArray.push({ id: key, total: categories[key].total, risks: categories[key].risks });
  }
  catsArray.sort(function(a, b) { return b.total - a.total; });
  topCat = catsArray.length > 0 ? catsArray[0] : null;

  var microText = 'Risk evenly distributed across categories.';
  if (topCat && topCat.risks.length > 0) {
   microText = this.formatCategory(topCat.id) + ' carries the highest inherent exposure.';
  }

  var html = '<div class="dashboard-section"><div class="section-header"><h2 class="section-title">Risk Concentration by Category</h2><div class="section-subtitle">' + this.escapeHtml(microText) + '</div></div>';
  if (catsArray.length === 0) {
   html += '<div class="empty-state compact"><div class="empty-state-icon">i</div><h4 class="empty-state-title">No categories yet</h4><p class="empty-state-desc">Add risks to see category concentration</p></div>';
   html += '</div>';
   return html;
  }

  var maxTotal = catsArray[0].total || 1;
  html += '<div class="risk-concentration-chart">';
  for (var j = 0; j < catsArray.length; j++) {
   var catItem = catsArray[j];
   var pct = Math.max(4, Math.round((catItem.total / maxTotal) * 100));
   var summary = this.buildCategorySummary(catItem.id, catItem.risks);
   var tooltip = this.buildCategoryTooltip(catItem.id, summary, catItem);
   var isSelectedCat = (this._selectedCategory === catItem.id);
   var selectedCatClass = isSelectedCat ? ' category-bar-selected' : '';
   html += '<div class="category-bar-row' + selectedCatClass + '" data-category="' + this.escapeHtml(catItem.id) + '" data-count="' + catItem.risks.length + '">' +
    '<div class="category-bar-label">' + this.formatCategory(catItem.id) + '</div>' +
    '<div class="category-bar-track">' +
    '<div class="category-bar" data-tooltip="' + this.escapeHtml(tooltip) + '" style="width:' + pct + '%"></div>' +
    '</div>' +
    '<div class="category-bar-value">' + catItem.risks.length + ' risks</div>' +
    '</div>';
  }
  html += '</div></div>';
  return html;
 },

 buildCategorySummary: function(cat, risks) {
  var total = risks.length, maxInh = 0, maxRes = 0, reductions = 0, worsened = 0;
  for (var i = 0; i < risks.length; i++) {
   var r = risks[i];
   var sc = this.computeRiskScores(r);
   var inh = sc.inherentScore || 0;
   var res = sc.residualScore || 0;
   if (inh > maxInh) maxInh = inh;
   if (res > maxRes) maxRes = res;
   if (res < inh) reductions++; else if (res > inh) worsened++;
  }
  var scenario = 'no-change';
  if (worsened > 0 && reductions === 0) scenario = 'worsened';
  else if (worsened > 0 && reductions > 0) scenario = 'mixed';
  else if (reductions === total) scenario = 'improved';
  var cacheKey = scenario + '|' + total + '|' + maxInh + '|' + maxRes;
  var cached = this._categorySentenceCache[cat];
  var sentence = cached && cached.key === cacheKey ? cached.sentence : this.pickScenarioSentence(scenario);
  this._categorySentenceCache[cat] = { key: cacheKey, sentence: sentence };
  var tooltip = this.formatCategory(cat) + '\nTotal risks: ' + total + '\nHighest inherent: ' + maxInh + '\nHighest residual: ' + maxRes;
  return { sentence: sentence, tooltip: tooltip, maxInherent: maxInh, maxResidual: maxRes, total: total, scenario: scenario };
 },

 buildCategoryTooltip: function(catId, summary, catItem) {
  var exposureLine = summary.sentence || '';
  var title = this.formatCategory(catId);
  var highestInh = summary.maxInherent || 0;
  var highestRes = summary.maxResidual || 0;
  var html = '<div class="tooltip-title">' + this.escapeHtml(title) + '</div>' +
   '<div class="tooltip-row"><strong>Total risks:</strong> ' + (summary.total || 0) + '</div>' +
   '<div class="tooltip-row"><strong>Highest inherent:</strong> ' + highestInh + '</div>' +
   '<div class="tooltip-row"><strong>Highest residual:</strong> ' + highestRes + '</div>' +
   '<div class="tooltip-row exposure-line">' + this.escapeHtml(exposureLine) + '</div>' +
   '<div class="tooltip-hint">Click to view risks in this category</div>';
  return html;
 },

 pickScenarioSentence: function(scenario) {
  var pools = {
   'worsened': [
    'Residual exposure exceeds inherent assessment.',
    'Risk severity increased after controls.',
    'Residual risk appears elevated relative to initial assessment.',
    'Risk posture worsened following mitigation.',
    'Exposure increased despite control presence.',
    'Controls may be ineffective or risk context changed.',
    'Risk escalation observed post-assessment.',
    'Post-control assessment indicates higher exposure.'
   ],
   'mixed': [
    'Risk reduction varies across this category.',
    'Controls show uneven effectiveness within this category.',
    'Some risks reduced, while others remain elevated.',
    'Risk posture varies significantly across items.',
    'Mitigation effectiveness is inconsistent.',
    'Residual exposure differs across risks in this category.',
    'Controls reduced some risks but not all.',
    'Category shows mixed risk outcomes.'
   ],
   'improved': [
    'Controls reduced exposure, though residual remains.',
    'Risk severity decreased, oversight still needed.',
    'Mitigation lowered risk to manageable levels.',
    'Controls partially reduced exposure in this category.',
    'Risk posture improved but remains above low tolerance.',
    'High exposure moderated through control activity.',
    'Residual risk reflects partial effectiveness.',
    'Controls reduced severity; further mitigation may help.'
   ],
   'no-change': [
    'Controls have not materially altered risk exposure.',
    'Residual risk remains unchanged after mitigation.',
    'Risk severity shows no meaningful reduction.',
    'Controls did not impact overall exposure.',
    'Risk posture remains consistent before and after controls.',
    'Mitigation has not reduced this risk.',
    'No observable reduction in risk severity.',
    'Exposure remains stable despite controls.'
   ]
  };
  var pool = pools[scenario] || pools['no-change'];
  // Stable selection per session/category: hash scenario string
  var hash = 0;
  var key = scenario || 'no-change';
  for (var i = 0; i < key.length; i++) {
   hash = ((hash << 5) - hash) + key.charCodeAt(i);
   hash |= 0;
  }
  var idx = Math.abs(hash) % pool.length;
  return pool[idx];
 },

 // ============ CONTROL VIEW ============
 buildControlCoverage: function(stats) {
  var risks = this.getSelectedRisks();
  var noControls = 0, directiveOnly = 0, detectiveOnly = 0, preventive = 0;
  var allCtrls = (ERM.controls && ERM.controls.getAll) ? ERM.controls.getAll() : [];
  for (var i = 0; i < risks.length; i++) {
   var ids = risks[i].linkedControls || [];
   if (!ids.length) { noControls++; continue; }
   var hasPrev = false, hasDet = false, hasDir = false;
   for (var j = 0; j < ids.length; j++) {
    var c = null;
    for (var k = 0; k < allCtrls.length; k++) { if (allCtrls[k].id === ids[j]) { c = allCtrls[k]; break; } }
    if (c && c.type) {
     var t = c.type.toLowerCase();
     if (t === 'preventive') hasPrev = true;
     else if (t === 'detective') hasDet = true;
     else if (t === 'directive') hasDir = true;
    }
   }
   if (hasPrev) preventive++;
   else if (hasDet) detectiveOnly++;
   else if (hasDir) directiveOnly++;
   else noControls++;
  }
  var selectedType = this._selectedControlType;
  return '<div class="dashboard-section"><h2 class="section-title">Control View</h2><div class="control-cards">' +
   '<div class="control-card' + (selectedType === 'none' ? ' control-card-selected' : '') + '" data-control-type="none" data-tooltip="These risks may indicate unmitigated exposure and could warrant control design."><div class="control-card-value">' + noControls + '</div><div class="control-card-label">No Controls Linked</div></div>' +
   '<div class="control-card' + (selectedType === 'directive' ? ' control-card-selected' : '') + '" data-control-type="directive" data-tooltip="These risks rely on directive controls, with mitigation dependent on consistent compliance."><div class="control-card-value">' + directiveOnly + '</div><div class="control-card-label">Directive Controls Only</div></div>' +
   '<div class="control-card' + (selectedType === 'detective' ? ' control-card-selected' : '') + '" data-control-type="detective" data-tooltip="These risks are supported by detective controls, enabling detection but limited prevention."><div class="control-card-value">' + detectiveOnly + '</div><div class="control-card-label">Detective Controls Only</div></div>' +
   '<div class="control-card' + (selectedType === 'preventive' ? ' control-card-selected' : '') + '" data-control-type="preventive" data-tooltip="These risks have preventive controls, typically supporting likelihood reduction."><div class="control-card-value">' + preventive + '</div><div class="control-card-label">Preventive Controls Present</div></div>' +
   '</div></div>';
 },

 // ============ TOP RISKS / ACTIVITY ============
 buildTopRisksTable: function() {
  var risks = this.getSelectedRisks();
  var allCtrls = (ERM.controls && ERM.controls.getAll) ? ERM.controls.getAll() : [];
  var self = this;

  // Sort by: Residual Score (desc), then Impact (desc), then Likelihood (desc)
  risks.sort(function(a, b) {
   var scoresA = self.computeRiskScores(a);
   var scoresB = self.computeRiskScores(b);
   if (scoresB.residualScore !== scoresA.residualScore) {
    return scoresB.residualScore - scoresA.residualScore;
   }
   if (scoresB.residualImpact !== scoresA.residualImpact) {
    return scoresB.residualImpact - scoresA.residualImpact;
   }
   return scoresB.residualLikelihood - scoresA.residualLikelihood;
  });

  risks = risks.slice(0, 10);

  // Check if any critical/high risks exist
  var hasCriticalOrHigh = false;
  for (var c = 0; c < risks.length; c++) {
   var checkScore = this.computeRiskScores(risks[c]).residualScore;
   if (checkScore >= 15) { hasCriticalOrHigh = true; break; }
  }

  var html = '<div class="dashboard-section"><h2 class="section-title">Top Risks</h2>';

  if (risks.length === 0) {
   html += '<div class="empty-state compact"><div class="empty-state-icon">i</div><h4 class="empty-state-title">No risks yet</h4><p class="empty-state-desc">Add risks to see them here</p></div>';
   html += '</div>';
   return html;
  }

  html += '<div class="top-risks-table-wrapper"><table class="top-risks-table">' +
   '<thead><tr>' +
   '<th class="col-title">Risk</th>' +
   '<th class="col-category">Category</th>' +
   '<th class="col-score">Score</th>' +
   '<th class="col-level">Level</th>' +
   '<th class="col-controls">Control</th>' +
   '<th class="col-owner">Owner</th>' +
   '</tr></thead><tbody>';

  for (var i = 0; i < risks.length; i++) {
   var r = risks[i];
   var scores = this.computeRiskScores(r);
   var residualScore = scores.residualScore;

   // Exposure level with badge class (consistent with heatmap: 1-4 Low, 5-9 Medium, 10-14 High, 15-25 Critical)
   var exposureLevel = 'Low';
   var badgeClass = 'risk-badge-low';
   if (residualScore >= 15) { exposureLevel = 'Critical'; badgeClass = 'risk-badge-critical'; }
   else if (residualScore >= 10) { exposureLevel = 'High'; badgeClass = 'risk-badge-high'; }
   else if (residualScore >= 5) { exposureLevel = 'Medium'; badgeClass = 'risk-badge-medium'; }

   // Score color class
   var scoreClass = '';
   if (residualScore >= 15) scoreClass = 'score-critical';
   else if (residualScore >= 10) scoreClass = 'score-high';
   else if (residualScore >= 5) scoreClass = 'score-medium';

   // Controls status
   var controlStatus = 'None';
   var ids = r.linkedControls || [];
   if (ids.length > 0) {
    var hasPrev = false, hasDet = false, hasDir = false;
    for (var j = 0; j < ids.length; j++) {
     var ctrl = null;
     for (var k = 0; k < allCtrls.length; k++) {
      if (allCtrls[k].id === ids[j]) { ctrl = allCtrls[k]; break; }
     }
     if (ctrl && ctrl.type) {
      var t = ctrl.type.toLowerCase();
      if (t === 'preventive') hasPrev = true;
      else if (t === 'detective') hasDet = true;
      else if (t === 'directive') hasDir = true;
     }
    }
    if (hasPrev) controlStatus = 'Preventive';
    else if (hasDet) controlStatus = 'Detective';
    else if (hasDir) controlStatus = 'Directive';
   }

   // Owner
   var owner = r.owner || 'Unassigned';

   // Category
   var category = this.formatCategory(r.category);

   html += '<tr class="top-risks-row" data-risk-id="' + this.escapeHtml(r.id) + '">' +
    '<td class="col-title"><span class="risk-title-text" title="' + this.escapeHtml(r.title || 'Untitled') + '">' + this.escapeHtml(r.title || 'Untitled') + '</span></td>' +
    '<td class="col-category">' + this.escapeHtml(category) + '</td>' +
    '<td class="col-score ' + scoreClass + '">' + Math.round(residualScore) + '</td>' +
    '<td class="col-level"><span class="risk-badge ' + badgeClass + '">' + exposureLevel + '</span></td>' +
    '<td class="col-controls">' + controlStatus + '</td>' +
    '<td class="col-owner">' + this.escapeHtml(owner) + '</td>' +
    '</tr>';
  }

  html += '</tbody></table></div>';

  // Note if no critical/high risks
  if (!hasCriticalOrHigh && risks.length > 0) {
   html += '<div class="top-risks-note">No Critical or High residual risks identified.</div>';
  }

  html += '</div>';
  return html;
 },

 buildRecentActivity: function() {
  var html = '<div class="dashboard-section">' +
   '<div class="section-header-row">' +
   '<h2 class="section-title">Recent Activity</h2>' +
   '<button class="view-all-btn" id="activity-view-all">View all</button>' +
   '</div>';

  var activities = this.getRecentActivities(5);

  if (!activities || activities.length === 0) {
   html += '<div class="activity-empty-state">' +
    '<div class="activity-empty-icon">' + (ERM.icons && ERM.icons.clock ? ERM.icons.clock : '⏱') + '</div>' +
    '<div class="activity-empty-text">No recent activity</div>' +
    '<div class="activity-empty-hint">Actions will appear here as you work</div>' +
    '</div>';
  } else {
   html += '<div class="activity-list-compact">';
   for (var i = 0; i < activities.length; i++) {
    var act = activities[i];
    var sentence = this.formatActivitySentence(act);
    var timeAgo = this.getTimeAgo(act.timestamp);

    html += '<div class="activity-row">' +
     '<div class="activity-dot ' + act.actionClass + '"></div>' +
     '<div class="activity-text">' + sentence + '</div>' +
     '<div class="activity-time-ago">' + timeAgo + '</div>' +
     '</div>';
   }
   html += '</div>';
  }
  html += '</div>';
  return html;
 },

 getRecentActivities: function(limit) {
  // Get activities from storage
  var activities = ERM.storage.get('activities') || [];
  // Sort by timestamp desc
  activities.sort(function(a, b) {
   return (b.timestamp || 0) - (a.timestamp || 0);
  });
  return activities.slice(0, limit);
 },

 formatActivitySentence: function(act) {
  var user = '<span class="activity-user-name">' + this.escapeHtml(act.user || 'User') + '</span>';
  var entityName = '<span class="activity-entity-name">' + this.escapeHtml(act.entityName || 'item') + '</span>';
  var action = (act.action || '').toLowerCase();
  var entityType = (act.entityType || '').toLowerCase();

  // Determine action class
  act.actionClass = 'dot-neutral';
  if (action.indexOf('create') !== -1 || action.indexOf('add') !== -1) {
   act.actionClass = 'dot-create';
  } else if (action.indexOf('update') !== -1 || action.indexOf('edit') !== -1) {
   act.actionClass = 'dot-update';
  } else if (action.indexOf('delete') !== -1 || action.indexOf('remove') !== -1) {
   act.actionClass = 'dot-delete';
  } else if (action.indexOf('invite') !== -1) {
   act.actionClass = 'dot-invite';
  } else if (action.indexOf('accept') !== -1 || action.indexOf('join') !== -1) {
   act.actionClass = 'dot-accept';
  } else if (action.indexOf('link') !== -1) {
   act.actionClass = 'dot-link';
  }

  // Risk Register actions
  if (entityType === 'register' || entityType === 'risk register') {
   if (action.indexOf('create') !== -1) return user + ' created ' + entityName + ' register';
   if (action.indexOf('edit') !== -1 || action.indexOf('update') !== -1) return user + ' edited ' + entityName + ' register';
   if (action.indexOf('delete') !== -1) return user + ' deleted ' + entityName + ' register';
  }

  // Risk actions
  if (entityType === 'risk') {
   if (action.indexOf('create') !== -1) return user + ' added risk ' + entityName;
   if (action.indexOf('edit') !== -1 || action.indexOf('update') !== -1) return user + ' updated risk ' + entityName;
   if (action.indexOf('delete') !== -1) return user + ' removed risk ' + entityName;
  }

  // Control actions
  if (entityType === 'control') {
   if (action.indexOf('create') !== -1) return user + ' created control ' + entityName;
   if (action.indexOf('edit') !== -1 || action.indexOf('update') !== -1) return user + ' updated control ' + entityName;
   if (action.indexOf('delete') !== -1) return user + ' removed control ' + entityName;
   if (action.indexOf('link') !== -1) return user + ' linked control ' + entityName;
  }

  // Report actions
  if (entityType === 'report') {
   if (action.indexOf('create') !== -1 || action.indexOf('generate') !== -1) return user + ' generated report ' + entityName;
   if (action.indexOf('export') !== -1) return user + ' exported report ' + entityName;
  }

  // User/Workspace actions
  if (entityType === 'user' || entityType === 'workspace') {
   if (action.indexOf('invite') !== -1) return user + ' invited ' + entityName + ' to workspace';
   if (action.indexOf('accept') !== -1 || action.indexOf('join') !== -1) return entityName + ' joined the workspace';
   if (action.indexOf('remove') !== -1) return user + ' removed ' + entityName + ' from workspace';
  }

  // User invited to register
  if (action.indexOf('invite') !== -1 && entityType === 'register access') {
   return user + ' invited ' + entityName + ' to register';
  }

  // Default fallback
  return user + ' ' + this.escapeHtml(action) + ' ' + entityName;
 },

 getTimeAgo: function(timestamp) {
  if (!timestamp) return '';
  var now = Date.now();
  var diff = now - timestamp;
  var seconds = Math.floor(diff / 1000);
  var minutes = Math.floor(seconds / 60);
  var hours = Math.floor(minutes / 60);
  var days = Math.floor(hours / 24);

  if (days > 0) return days + 'd ago';
  if (hours > 0) return hours + 'h ago';
  if (minutes > 0) return minutes + 'm ago';
  return 'Just now';
 },

 // ============ EVENTS ============
 bindEvents: function() {
  var self = this;

  // Custom dropdown events
  var dropdownTrigger = document.getElementById('dropdown-trigger');
  var dropdownMenu = document.getElementById('dropdown-menu');
  var dropdown = document.getElementById('register-dropdown');

  if (dropdownTrigger && dropdownMenu) {
   // Toggle dropdown on trigger click
   dropdownTrigger.addEventListener('click', function(e) {
    e.stopPropagation();
    var isOpen = dropdown.classList.toggle('open');

    // Position menu using fixed positioning to escape overflow:hidden containers
    if (isOpen) {
     var rect = dropdownTrigger.getBoundingClientRect();
     dropdownMenu.style.position = 'fixed';
     dropdownMenu.style.top = (rect.bottom + 4) + 'px';
     dropdownMenu.style.left = rect.left + 'px';
     dropdownMenu.style.width = '180px';
     dropdownMenu.style.maxWidth = '180px';
     dropdownMenu.style.zIndex = '9999';
    }
   });

   // Handle option selection
   var options = dropdownMenu.querySelectorAll('.dropdown-option');
   for (var o = 0; o < options.length; o++) {
    options[o].addEventListener('click', function(e) {
     e.stopPropagation();
     var value = this.getAttribute('data-value');
     dropdown.classList.remove('open');
     self.onRegisterChange(value);
    });
   }

   // Close dropdown when clicking outside (guarded)
   if (!self._dropdownClickBound) {
    self._dropdownClickBound = true;
    document.addEventListener('click', function(e) {
     var dd = document.getElementById('register-dropdown');
     if (dd && !dd.contains(e.target)) {
      dd.classList.remove('open');
     }
    });

    // Close on escape key
    document.addEventListener('keydown', function(e) {
     var dd = document.getElementById('register-dropdown');
     if (e.key === 'Escape' && dd && dd.classList.contains('open')) {
      dd.classList.remove('open');
     }
    });
   }
  }

  var heatmapCells = document.querySelectorAll('.heatmap-cell');
  for (var i = 0; i < heatmapCells.length; i++) {
   heatmapCells[i].addEventListener('click', function(e) { self.onHeatmapCellClick(e, this); });
  }
  var dots = document.querySelectorAll('.risk-dot');
  for (var j = 0; j < dots.length; j++) {
   dots[j].addEventListener('click', function(e) { e.stopPropagation(); self.onRiskDotSelect(this); });
   dots[j].addEventListener('mouseenter', function(e) { self.showRiskDotTooltip(this, e); self.highlightPairedDots(this.getAttribute('data-risk-id'), true); });
   dots[j].addEventListener('mousemove', function(e) { self.positionRiskDotTooltip(e); });
   dots[j].addEventListener('mouseleave', function() { self.hideRiskDotTooltip(); self.highlightPairedDots(this.getAttribute('data-risk-id'), false); });
  }

    var barRows = document.querySelectorAll('.category-bar-row');
    for (var b = 0; b < barRows.length; b++) {
      barRows[b].addEventListener('click', function() { self.onCategoryBarClick(this); });
      barRows[b].addEventListener('mouseenter', function(e) { self.showCategoryTooltip(this, e); });
      barRows[b].addEventListener('mousemove', function(e) { self.positionRiskDotTooltip(e); });
      barRows[b].addEventListener('mouseleave', function() { self.hideRiskDotTooltip(); });
    }

    // Control card click events
    var controlCards = document.querySelectorAll('.control-card');
    for (var cc = 0; cc < controlCards.length; cc++) {
      controlCards[cc].addEventListener('click', function() { self.onControlCardClick(this); });
    }

    var closeBtn = document.getElementById('panel-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', function() {
      self._selectedRiskId = null;
      self._selectedRiskView = null;
      self._selectedCategory = null;
      self._selectedControlType = null;
      self._selectedCell = null;
      self._selectedCellData = null;
      self.render();
    });

    // Add document-level handler to hide tooltip when mouse leaves any tooltip trigger
    if (!this._tooltipCleanupBound) {
      this._tooltipCleanupBound = true;
      document.addEventListener('mouseover', function(e) {
        var target = e.target;
        // Check if mouse is over a tooltip trigger element
        var isOnDot = target.classList && target.classList.contains('risk-dot');
        var isOnBar = target.classList && (target.classList.contains('category-bar-row') || target.classList.contains('category-bar'));
        var parentBar = target.closest && target.closest('.category-bar-row');

        // If not on any tooltip trigger and tooltip is visible, hide it
        if (!isOnDot && !isOnBar && !parentBar && self._riskDotTooltip && self._riskDotTooltip.style.display !== 'none') {
          self.hideRiskDotTooltip();
        }
      });
    }

    // Category panel: risk item clicks
    var riskItems = document.querySelectorAll('.category-risk-item');
    for (var r = 0; r < riskItems.length; r++) {
      riskItems[r].addEventListener('click', function() {
        var riskId = this.getAttribute('data-risk-id');
        if (riskId) {
          self._selectedCategory = null;
          self._selectedControlType = null;
          self._selectedRiskId = riskId;
          self._selectedRiskView = 'inherent';
          self.render();
        }
      });
    }

    // Top risks table row clicks
    var topRiskRows = document.querySelectorAll('.top-risks-row');
    for (var tr = 0; tr < topRiskRows.length; tr++) {
      topRiskRows[tr].addEventListener('click', function() {
        var riskId = this.getAttribute('data-risk-id');
        if (riskId) {
          self._selectedCategory = null;
          self._selectedControlType = null;
          self._selectedRiskId = riskId;
          self._selectedRiskView = 'residual';
          self.render();
        }
      });
    }

    // View All activity button
    var viewAllBtn = document.getElementById('activity-view-all');
    if (viewAllBtn) {
      viewAllBtn.addEventListener('click', function() {
        ERM.navigation.switchView('activity-log');
      });
    }
  },

 onHeatmapCellClick: function(e, cell) {
  var type = cell.getAttribute('data-type');
  var row = parseInt(cell.getAttribute('data-row'));
  var col = parseInt(cell.getAttribute('data-col'));
  var count = parseInt(cell.getAttribute('data-count'));
  if (count === 0) return;
  var likelihood = 5 - row;
  var impact = col + 1;

  // Show panel with all risks in this cell instead of navigating away
  var cellKey = type + '-' + likelihood + '-' + impact;
  if (this._selectedCell === cellKey) {
    // Toggle off if clicking same cell
    this._selectedCell = null;
    this._selectedCellData = null;
  } else {
    this._selectedCell = cellKey;
    this._selectedCellData = { type: type, likelihood: likelihood, impact: impact };
  }
  // Clear other selections
  this._selectedRiskId = null;
  this._selectedRiskView = null;
  this._selectedCategory = null;
  this._selectedControlType = null;
  this.render();
 },

  onRiskDotSelect: function(el) {
    var riskId = el.getAttribute('data-risk-id');
    if (!riskId) return;
    // Clear other selections
    this._selectedCell = null;
    this._selectedCellData = null;
    this._selectedCategory = null;
    this._selectedControlType = null;
    // Set risk selection
    this._selectedRiskId = riskId;
    this._selectedRiskView = el.getAttribute('data-heatmap') || 'inherent';
    this.render();
  },

 showRiskDotTooltip: function(el, evt) {
  var title = el.getAttribute("data-risk-title") || "Untitled Risk";
  var category = el.getAttribute("data-risk-category") || "Uncategorized";
  var inherentLevel = el.getAttribute("data-inherent-level") || "";
  var residualLevel = el.getAttribute("data-residual-level") || "";
  var controls = el.getAttribute("data-controls") || "0";
  if (!this._riskDotTooltip) {
   var tip = document.createElement("div");
   tip.className = "heatmap-tooltip";
   document.body.appendChild(tip);
   this._riskDotTooltip = tip;
  }
  var tooltip = this._riskDotTooltip;
  tooltip.innerHTML = '<div class="heatmap-tooltip-title">' + this.escapeHtml(title) + '</div>' +
   '<div class="heatmap-tooltip-meta"><strong>Category:</strong> ' + this.escapeHtml(category) + '</div>' +
   '<div class="heatmap-tooltip-meta"><strong>Exposure:</strong> ' + this.escapeHtml(inherentLevel) + ' &rarr; ' + this.escapeHtml(residualLevel || inherentLevel) + '</div>' +
   '<div class="heatmap-tooltip-meta"><strong>Controls linked:</strong> ' + this.escapeHtml(controls) + '</div>' +
   '<div class="heatmap-tooltip-meta tooltip-hint">&rarr; Click to view risk details</div>';
  tooltip.style.display = "block";
  this.positionRiskDotTooltip(evt);
 },

 positionRiskDotTooltip: function(evt) {
  var tooltip = this._riskDotTooltip; if (!tooltip) return;
  var padding = 12; var x = evt.clientX + 14; var y = evt.clientY + 14; var rect = tooltip.getBoundingClientRect();
  if (x + rect.width + padding > window.innerWidth) x = window.innerWidth - rect.width - padding;
  if (y + rect.height + padding > window.innerHeight) y = window.innerHeight - rect.height - padding;
  tooltip.style.left = x + 'px'; tooltip.style.top = y + 'px';
 },

  hideRiskDotTooltip: function() { if (this._riskDotTooltip) this._riskDotTooltip.style.display = 'none'; },
  highlightPairedDots: function(riskId, add) {
    if (!riskId) return;
    var dots = document.querySelectorAll('.risk-dot[data-risk-id="' + this.escapeHtml(riskId) + '"]');
    for (var i = 0; i < dots.length; i++) {
      if (add) dots[i].classList.add('paired-glow');
      else dots[i].classList.remove('paired-glow');
    }
  },
  computeControlBreakdown: function(risk) {
    var result = { preventive: 0, detective: 0, corrective: 0, implemented: 0, notTested: 0 };
    var ids = (risk && risk.linkedControls) || [];
    if (!ids.length || !ERM.controls || !ERM.controls.getAll) return result;
    var all = ERM.controls.getAll();
    for (var i = 0; i < ids.length; i++) {
      for (var j = 0; j < all.length; j++) {
        if (all[j].id === ids[i]) {
          var type = (all[j].type || '').toLowerCase();
          if (type === 'preventive') result.preventive++;
          else if (type === 'detective') result.detective++;
          else if (type === 'corrective') result.corrective++;
          var status = (all[j].status || '').toLowerCase();
          if (status === 'implemented') result.implemented++;
          else result.notTested++;
          break;
        }
      }
    }
    return result;
  },
 buildRiskDetailPanel: function() {
  if (!this._selectedRiskId) {
   return "<div class=\"dashboard-panel\"></div>";
  }
  var risks = ERM.storage.get("risks") || [];
  var risk = null;
  for (var i = 0; i < risks.length; i++) {
   if (String(risks[i].id) === String(this._selectedRiskId)) { risk = risks[i]; break; }
  }
  if (!risk) return "<div class=\"dashboard-panel\"></div>";
  var scores = this.computeRiskScores(risk);
  var activeView = this._selectedRiskView === "residual" ? "residual" : "inherent";
  var owner = risk.owner || "Unassigned";
  var status = risk.status || "Open";
  var cat = this.formatCategory(risk.category);
  // Look up register name from registerId
  var registerMap = this.getRegisterMap();
  var register = risk.riskRegister || registerMap[risk.registerId] || "Default Register";
  var controls = (risk.linkedControls && risk.linkedControls.length) ? risk.linkedControls.length : 0;
  var ctrlBreakdown = this.computeControlBreakdown(risk);
  // Determine border color based on score
  var score = activeView === "residual" ? scores.residualScore : scores.inherentScore;
  var borderClass = score >= 15 ? 'panel-border-critical' : (score >= 10 ? 'panel-border-high' : (score >= 5 ? 'panel-border-medium' : 'panel-border-low'));
  return '<div class="dashboard-panel ' + borderClass + '">' +
  '<div class="panel-header">' +
  '<div class="panel-title">Risk details — ' + (activeView === "residual" ? "Residual view" : "Inherent view") + '</div>' +
  '<button class="panel-close" id="panel-close-btn" aria-label="Close panel">×</button>' +
  '</div>' +
  '<div class="panel-body">' +
  '<div class="panel-risk-title">' + this.escapeHtml(risk.title || "Untitled risk") + '</div>' +
  '<div class="panel-meta-row"><span class="panel-chip chip-register">' + this.escapeHtml(register) + '</span><span class="panel-chip">' + this.escapeHtml(cat) + '</span></div>' +
  '<div class="panel-scores">' +
    '<div class="score-card ' + (activeView === "inherent" ? "active" : "") + '"><div class="score-label">Inherent</div><div class="score-value">' + scores.inherentScore.toFixed(1) + '</div><div class="score-sub">L ' + scores.inherentLikelihood + ' x I ' + scores.inherentImpact + '</div></div>' +
    '<div class="score-card ' + (activeView === "residual" ? "active" : "") + '"><div class="score-label">Residual</div><div class="score-value">' + scores.residualScore.toFixed(1) + '</div><div class="score-sub">L ' + scores.residualLikelihood + ' x I ' + scores.residualImpact + '</div></div>' +
  '</div>' +
  '<div class="panel-info-grid">' +
    '<div><div class="info-label">Risk Owner</div><div class="info-value">' + this.escapeHtml(owner) + '</div></div>' +
    '<div><div class="info-label">Status</div><div class="info-value">' + this.escapeHtml(status) + '</div></div>' +
    '<div><div class="info-label">Controls linked</div><div class="info-value">' + controls + '</div></div>' +
  '</div>' +
  '<div class="panel-info-grid">' +
    '<div><div class="info-label">Control types</div><div class="info-value">Preventive ' + ctrlBreakdown.preventive + ' · Detective ' + ctrlBreakdown.detective + ' · Corrective ' + ctrlBreakdown.corrective + '</div></div>' +
    '<div><div class="info-label">Control status</div><div class="info-value">Implemented ' + ctrlBreakdown.implemented + ' · Not tested ' + ctrlBreakdown.notTested + '</div></div>' +
  '</div>' +
  (risk.description ? '<div class="panel-block"><div class="info-label">Description</div><div class="info-value">' + this.escapeHtml(risk.description) + '</div></div>' : '') +
  '</div></div>';
 },

 onCategoryBarClick: function(el) {
  var category = el.getAttribute('data-category');
  if (!category) return;
  // Toggle selection if clicking same category
  if (this._selectedCategory === category) {
   this._selectedCategory = null;
  } else {
   this._selectedCategory = category;
  }
  // Clear risk and control selection when selecting category
  this._selectedRiskId = null;
  this._selectedRiskView = null;
  this._selectedControlType = null;
  this.render();
 },

 onControlCardClick: function(el) {
  var controlType = el.getAttribute('data-control-type');
  if (!controlType) return;
  // Toggle selection if clicking same control type
  if (this._selectedControlType === controlType) {
   this._selectedControlType = null;
  } else {
   this._selectedControlType = controlType;
  }
  // Clear risk and category selection when selecting control type
  this._selectedRiskId = null;
  this._selectedRiskView = null;
  this._selectedCategory = null;
  this.render();
 },

 buildCategoryDetailPanel: function() {
  if (!this._selectedCategory) return '<div class="dashboard-panel"></div>';
  var category = this._selectedCategory;
  var risks = this.getSelectedRisks();
  var categoryRisks = [];
  for (var i = 0; i < risks.length; i++) {
   if ((risks[i].category || 'uncategorized') === category) {
    categoryRisks.push(risks[i]);
   }
  }
  // Sort by inherent score desc
  var self = this;
  categoryRisks.sort(function(a, b) {
   var scoreA = self.computeRiskScores(a).inherentScore;
   var scoreB = self.computeRiskScores(b).inherentScore;
   return scoreB - scoreA;
  });
  // Calculate stats
  var criticalCount = 0, highCount = 0, mediumCount = 0;
  var totalInherent = 0, totalResidual = 0;
  for (var j = 0; j < categoryRisks.length; j++) {
   var scores = this.computeRiskScores(categoryRisks[j]);
   totalInherent += scores.inherentScore;
   totalResidual += scores.residualScore;
   if (scores.inherentScore >= 15) criticalCount++;
   else if (scores.inherentScore >= 10) highCount++;
   else if (scores.inherentScore >= 5) mediumCount++;
  }
  var avgInherent = categoryRisks.length > 0 ? (totalInherent / categoryRisks.length).toFixed(1) : '0';
  var avgResidual = categoryRisks.length > 0 ? (totalResidual / categoryRisks.length).toFixed(1) : '0';
  var html = '<div class="dashboard-panel">' +
   '<div class="panel-header">' +
   '<div class="panel-title">Category Overview</div>' +
   '<button class="panel-close" id="panel-close-btn" aria-label="Close panel">×</button>' +
   '</div>' +
   '<div class="panel-body">' +
   '<div class="panel-risk-title">' + this.escapeHtml(this.formatCategory(category)) + '</div>' +
   '<div class="panel-meta-row">' +
   '<span class="panel-chip">' + categoryRisks.length + ' risks</span>' +
   (criticalCount > 0 ? '<span class="panel-chip chip-critical">' + criticalCount + ' critical</span>' : '') +
   (highCount > 0 ? '<span class="panel-chip chip-high">' + highCount + ' high</span>' : '') +
   '</div>' +
   '<div class="panel-scores">' +
   '<div class="score-card"><div class="score-label">Avg Inherent</div><div class="score-value">' + avgInherent + '</div></div>' +
   '<div class="score-card"><div class="score-label">Avg Residual</div><div class="score-value">' + avgResidual + '</div></div>' +
   '</div>' +
   '<div class="category-risk-list">';
  // Risk list
  for (var k = 0; k < categoryRisks.length; k++) {
   var r = categoryRisks[k];
   var rScores = this.computeRiskScores(r);
   var levelClass = this.getRiskLevelClass(rScores.inherentScore);
   html += '<div class="category-risk-item" data-risk-id="' + this.escapeHtml(r.id) + '">' +
    '<div class="category-risk-indicator ' + levelClass + '"></div>' +
    '<div class="category-risk-content">' +
    '<div class="category-risk-title">' + this.escapeHtml(r.title || 'Untitled') + '</div>' +
    '<div class="category-risk-scores">Inherent: ' + rScores.inherentScore.toFixed(1) + ' → Residual: ' + rScores.residualScore.toFixed(1) + '</div>' +
    '</div>' +
    '</div>';
  }
  html += '</div></div></div>';
  return html;
 },

 buildCellDetailPanel: function() {
  if (!this._selectedCell || !this._selectedCellData) return '<div class="dashboard-panel"></div>';
  var cellData = this._selectedCellData;
  var risks = this.getSelectedRisks();
  var cellRisks = [];
  var self = this;

  // Find all risks that match this cell's coordinates
  for (var i = 0; i < risks.length; i++) {
    var r = risks[i];
    var scores = this.computeRiskScores(r);
    var likelihood, impact;
    if (cellData.type === 'residual') {
      likelihood = scores.residualLikelihood;
      impact = scores.residualImpact;
    } else {
      likelihood = scores.inherentLikelihood;
      impact = scores.inherentImpact;
    }
    if (likelihood === cellData.likelihood && impact === cellData.impact) {
      cellRisks.push(r);
    }
  }

  // Sort by score desc
  cellRisks.sort(function(a, b) {
    var scoreA = self.computeRiskScores(a);
    var scoreB = self.computeRiskScores(b);
    var valA = cellData.type === 'residual' ? scoreA.residualScore : scoreA.inherentScore;
    var valB = cellData.type === 'residual' ? scoreB.residualScore : scoreB.inherentScore;
    return valB - valA;
  });

  // Calculate stats
  var criticalCount = 0, highCount = 0, mediumCount = 0;
  var score = cellData.likelihood * cellData.impact;
  if (score >= 15) criticalCount = cellRisks.length;
  else if (score >= 10) highCount = cellRisks.length;
  else if (score >= 5) mediumCount = cellRisks.length;

  var typeLabel = cellData.type === 'residual' ? 'Residual' : 'Inherent';
  var cellLabel = 'L' + cellData.likelihood + ' × I' + cellData.impact + ' = ' + score;

  var html = '<div class="dashboard-panel">' +
   '<div class="panel-header">' +
   '<div class="panel-title">Risks in Cell</div>' +
   '<button class="panel-close" id="panel-close-btn" aria-label="Close panel">×</button>' +
   '</div>' +
   '<div class="panel-body">' +
   '<div class="panel-risk-title">' + typeLabel + ' Heatmap</div>' +
   '<div class="panel-meta-row">' +
   '<span class="panel-chip">' + cellRisks.length + ' risk' + (cellRisks.length !== 1 ? 's' : '') + '</span>' +
   '<span class="panel-chip">' + cellLabel + '</span>' +
   (criticalCount > 0 ? '<span class="panel-chip chip-critical">Critical</span>' : '') +
   (highCount > 0 ? '<span class="panel-chip chip-high">High</span>' : '') +
   (mediumCount > 0 ? '<span class="panel-chip chip-medium">Medium</span>' : '') +
   '</div>' +
   '<div class="category-risk-list">';

  // Risk list
  for (var k = 0; k < cellRisks.length; k++) {
    var risk = cellRisks[k];
    var rScores = this.computeRiskScores(risk);
    var levelClass = this.getRiskLevelClass(score);
    html += '<div class="category-risk-item" data-risk-id="' + this.escapeHtml(risk.id) + '">' +
      '<div class="category-risk-indicator ' + levelClass + '"></div>' +
      '<div class="category-risk-content">' +
      '<div class="category-risk-title">' + this.escapeHtml(risk.title || 'Untitled') + '</div>' +
      '<div class="category-risk-scores">' + this.escapeHtml(this.formatCategory(risk.category)) + ' · ' + this.escapeHtml(risk.owner || 'Unassigned') + '</div>' +
      '</div>' +
      '</div>';
  }

  html += '</div></div></div>';
  return html;
 },

 getRiskLevelClass: function(score) {
  if (score >= 15) return 'level-critical';
  if (score >= 10) return 'level-high';
  if (score >= 5) return 'level-medium';
  return 'level-low';
 },

 buildControlDetailPanel: function() {
  if (!this._selectedControlType) return '<div class="dashboard-panel"></div>';
  var controlType = this._selectedControlType;
  var risks = this.getSelectedRisks();
  var allCtrls = (ERM.controls && ERM.controls.getAll) ? ERM.controls.getAll() : [];
  var matchingRisks = [];

  // Determine title and tooltip based on control type
  var titles = {
   'none': 'No Controls Linked',
   'directive': 'Directive Controls Only',
   'detective': 'Detective Controls Only',
   'preventive': 'Preventive Controls Present'
  };
  var tooltips = {
   'none': 'These risks may indicate unmitigated exposure and could warrant control design.',
   'directive': 'These risks rely on directive controls, with mitigation dependent on consistent compliance.',
   'detective': 'These risks are supported by detective controls, enabling detection but limited prevention.',
   'preventive': 'These risks have preventive controls, typically supporting likelihood reduction.'
  };

  // Filter risks based on control type
  for (var i = 0; i < risks.length; i++) {
   var risk = risks[i];
   var ids = risk.linkedControls || [];
   if (controlType === 'none') {
    if (!ids.length) matchingRisks.push(risk);
    continue;
   }
   var hasPrev = false, hasDet = false, hasDir = false;
   for (var j = 0; j < ids.length; j++) {
    var c = null;
    for (var k = 0; k < allCtrls.length; k++) {
     if (allCtrls[k].id === ids[j]) { c = allCtrls[k]; break; }
    }
    if (c && c.type) {
     var t = c.type.toLowerCase();
     if (t === 'preventive') hasPrev = true;
     else if (t === 'detective') hasDet = true;
     else if (t === 'directive') hasDir = true;
    }
   }
   if (controlType === 'preventive' && hasPrev) matchingRisks.push(risk);
   else if (controlType === 'detective' && hasDet && !hasPrev) matchingRisks.push(risk);
   else if (controlType === 'directive' && hasDir && !hasDet && !hasPrev) matchingRisks.push(risk);
  }

  // Sort by inherent score desc
  var self = this;
  matchingRisks.sort(function(a, b) {
   var scoreA = self.computeRiskScores(a).inherentScore;
   var scoreB = self.computeRiskScores(b).inherentScore;
   return scoreB - scoreA;
  });

  // Calculate stats (consistent thresholds: 15-25 Critical, 10-14 High)
  var criticalCount = 0, highCount = 0;
  for (var m = 0; m < matchingRisks.length; m++) {
   var scores = this.computeRiskScores(matchingRisks[m]);
   if (scores.inherentScore >= 15) criticalCount++;
   else if (scores.inherentScore >= 10) highCount++;
  }

  var html = '<div class="dashboard-panel">' +
   '<div class="panel-header">' +
   '<div class="panel-title">Control View</div>' +
   '<button class="panel-close" id="panel-close-btn" aria-label="Close panel">×</button>' +
   '</div>' +
   '<div class="panel-body">' +
   '<div class="panel-risk-title">' + this.escapeHtml(titles[controlType] || controlType) + '</div>' +
   '<div class="panel-meta-row">' +
   '<span class="panel-chip">' + matchingRisks.length + ' risks</span>' +
   (criticalCount > 0 ? '<span class="panel-chip chip-critical">' + criticalCount + ' critical</span>' : '') +
   (highCount > 0 ? '<span class="panel-chip chip-high">' + highCount + ' high</span>' : '') +
   '</div>' +
   '<div class="control-panel-desc">' + this.escapeHtml(tooltips[controlType] || '') + '</div>' +
   '<div class="category-risk-list">';

  // Risk list
  for (var n = 0; n < matchingRisks.length; n++) {
   var r = matchingRisks[n];
   var rScores = this.computeRiskScores(r);
   var levelClass = this.getRiskLevelClass(rScores.inherentScore);
   var controlCount = (r.linkedControls && r.linkedControls.length) ? r.linkedControls.length : 0;
   html += '<div class="category-risk-item" data-risk-id="' + this.escapeHtml(r.id) + '">' +
    '<div class="category-risk-indicator ' + levelClass + '"></div>' +
    '<div class="category-risk-content">' +
    '<div class="category-risk-title">' + this.escapeHtml(r.title || 'Untitled') + '</div>' +
    '<div class="category-risk-scores">Inherent: ' + rScores.inherentScore.toFixed(1) + ' → Residual: ' + rScores.residualScore.toFixed(1) + (controlCount > 0 ? ' · ' + controlCount + ' controls' : '') + '</div>' +
    '</div>' +
    '</div>';
  }

  html += '</div></div></div>';
  return html;
 },

 showCategoryTooltip: function(el, evt) {
  var tooltipText = el.querySelector('.category-bar').getAttribute('data-tooltip') || '';
  if (!this._riskDotTooltip) {
   var tip = document.createElement('div');
   tip.className = 'heatmap-tooltip';
   document.body.appendChild(tip);
   this._riskDotTooltip = tip;
  }
  this._riskDotTooltip.innerHTML = tooltipText;
  this._riskDotTooltip.style.display = 'block';
  this.positionRiskDotTooltip(evt);
 },

 // ============ UTIL ============
 escapeHtml: function(str) {
  if (!str && str !== 0) return '';
  return String(str).replace(/[&<>"']/g, function(m) { return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[m]); });
 },
 clamp: function(value, min, max) {
  return Math.max(min, Math.min(max, value));
 },
 computeRiskScores: function(risk) {
  var inherentLikelihood = parseFloat(risk.inherentLikelihood || risk.likelihood) || 3;
  var inherentImpact = parseFloat(risk.inherentImpact || risk.impact) || 3;
  var residualLikelihood = parseFloat(risk.residualLikelihood);
  var residualImpact = parseFloat(risk.residualImpact);
  var residualScore = parseFloat(risk.residualScore) || parseFloat(risk.residualRisk) || 0;

  if (!residualLikelihood) residualLikelihood = inherentLikelihood;
  if (!residualImpact) residualImpact = inherentImpact;
  if (residualScore && residualLikelihood) {
   residualImpact = this.clamp(Math.round(residualScore / residualLikelihood), 1, 5);
  }
  if (!residualScore) residualScore = residualLikelihood * residualImpact;

  return {
   inherentLikelihood: this.clamp(inherentLikelihood, 1, 5),
   inherentImpact: this.clamp(inherentImpact, 1, 5),
   residualLikelihood: this.clamp(residualLikelihood, 1, 5),
   residualImpact: this.clamp(residualImpact, 1, 5),
   inherentScore: (parseFloat(risk.inherentScore) || (inherentLikelihood * inherentImpact)),
   residualScore: residualScore
  };
 },
 getRiskPosition: function(risk, type) {
  var scores = this.computeRiskScores(risk);
  if (type === 'residual') {
   return { likelihood: scores.residualLikelihood, impact: scores.residualImpact };
  }
  return { likelihood: scores.inherentLikelihood, impact: scores.inherentImpact };
 },
 formatCategory: function(cat) {
  if (!cat) return 'Uncategorized';
  return cat.replace(/-/g, ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
 },
 getRiskLevelFromScore: function(score) {
  if (score >= 15) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5) return 'Medium';
  return 'Low';
 },

 getRiskLevelDescription: function(score) {
  if (score >= 15) return 'Immediate action needed. Escalate to leadership.';
  if (score >= 10) return 'Action required. Implement controls promptly.';
  if (score >= 5) return 'Consider controls. Regular monitoring required.';
  return 'Acceptable risk level. Monitor periodically.';
 }
};

// ========================================
// DASHBOARD RENDERERS - Shared functions for Reports embedding
// Reports must use these to ensure consistent styling
// ========================================
ERM.dashboard.renderers = {
  /**
   * Helper: Get register name from register ID
   * Dashboard uses names for filtering, embed uses IDs
   */
  getRegisterNameFromId: function(registerId) {
    if (!registerId || registerId === 'all') return null;
    // Try both storage keys for compatibility - 'registers' is the primary key
    var registers = ERM.storage.get('registers') || ERM.storage.get('riskRegisters') || [];
    for (var i = 0; i < registers.length; i++) {
      if (registers[i].id === registerId) {
        return registers[i].name;
      }
    }
    return null;
  },

  /**
   * Render heatmap into a container
   * @param {HTMLElement} containerEl - Container to render into
   * @param {Object} options - Options: { registerId, layout, type }
   */
  renderHeatmap: function(containerEl, options) {
    options = options || {};
    var registerId = options.registerId || 'all';
    var layout = options.layout || 'side-by-side';
    var type = options.type || 'both'; // 'inherent', 'residual', or 'both'

    // Get risks filtered by register
    var allRisks = ERM.storage.get('risks') || [];
    var risks = registerId === 'all' ? allRisks : allRisks.filter(function(r) {
      return r.registerId === registerId;
    });

    // Get register NAME from ID (selectedRegister uses names, not IDs)
    var registerName = this.getRegisterNameFromId(registerId);

    // Store original selected register, temporarily set for rendering
    var originalRegister = ERM.dashboard.selectedRegister;
    ERM.dashboard.selectedRegister = registerName;

    // Build heatmap HTML - wrap in heatmaps-row for side-by-side layout
    var html = '<div class="dashboard-section heatmaps-section heatmaps-embedded">';
    html += '<div class="heatmaps-row">';
    if (type === 'both' || type === 'inherent') {
      html += ERM.dashboard.buildHeatMapCard('inherent', 'Inherent Risk', 'Before Controls');
    }
    if (type === 'both' || type === 'residual') {
      html += ERM.dashboard.buildHeatMapCard('residual', 'Residual Risk', 'After Controls');
    }
    html += '</div>';
    html += ERM.dashboard.buildHeatMapLegend();
    html += '</div>';

    // Restore original register
    ERM.dashboard.selectedRegister = originalRegister;

    // Set container content - preserve existing classes (especially editor-v2-embed-content)
    containerEl.innerHTML = html;
    containerEl.classList.add('dashboard-embed-container');
    containerEl.classList.add(layout === 'stacked' ? 'layout-stacked' : 'layout-side-by-side');
    containerEl.classList.remove(layout === 'stacked' ? 'layout-side-by-side' : 'layout-stacked');

    // Bind cell click events for interaction
    ERM.dashboard.bindHeatmapEvents(containerEl);

    return {
      risksCount: risks.length,
      registerId: registerId
    };
  },

  /**
   * Render top risks table into a container
   * @param {HTMLElement} containerEl - Container to render into
   * @param {Object} options - Options: { registerId, limit }
   */
  renderTopRisks: function(containerEl, options) {
    options = options || {};
    var registerId = options.registerId || 'all';
    var limit = options.limit || 10;

    // Get risks filtered by register
    var allRisks = ERM.storage.get('risks') || [];
    var risks = registerId === 'all' ? allRisks : allRisks.filter(function(r) {
      return r.registerId === registerId;
    });

    // Get register NAME from ID
    var registerName = this.getRegisterNameFromId(registerId);

    // Store original and render
    var originalRegister = ERM.dashboard.selectedRegister;
    ERM.dashboard.selectedRegister = registerName;

    var html = '<div class="dashboard-section top-risks-embedded">';
    html += ERM.dashboard.buildTopRisksTable();
    html += '</div>';

    ERM.dashboard.selectedRegister = originalRegister;

    containerEl.innerHTML = html;
    containerEl.classList.add('dashboard-embed-container');

    // Bind row click events
    var rows = containerEl.querySelectorAll('.top-risk-row');
    for (var i = 0; i < rows.length; i++) {
      rows[i].addEventListener('click', function() {
        var riskId = this.getAttribute('data-risk-id');
        if (riskId && ERM.riskRegister && ERM.riskRegister.openRiskDetail) {
          ERM.riskRegister.openRiskDetail(riskId);
        }
      });
    }

    return {
      risksCount: risks.length,
      registerId: registerId
    };
  },

  /**
   * Render risk concentration chart into a container
   * @param {HTMLElement} containerEl - Container to render into
   * @param {Object} options - Options: { registerId }
   */
  renderRiskConcentration: function(containerEl, options) {
    options = options || {};
    var registerId = options.registerId || 'all';

    var registerName = this.getRegisterNameFromId(registerId);
    var originalRegister = ERM.dashboard.selectedRegister;
    ERM.dashboard.selectedRegister = registerName;

    var html = ERM.dashboard.buildRiskConcentrationChart();

    ERM.dashboard.selectedRegister = originalRegister;

    containerEl.innerHTML = html;
    containerEl.classList.add('dashboard-embed-container');

    return { registerId: registerId };
  },

  /**
   * Render control coverage into a container
   * @param {HTMLElement} containerEl - Container to render into
   * @param {Object} options - Options: { registerId }
   */
  renderControlCoverage: function(containerEl, options) {
    options = options || {};
    var registerId = options.registerId || 'all';

    var registerName = this.getRegisterNameFromId(registerId);
    var originalRegister = ERM.dashboard.selectedRegister;
    ERM.dashboard.selectedRegister = registerName;

    var html = ERM.dashboard.buildControlCoverage();

    ERM.dashboard.selectedRegister = originalRegister;

    containerEl.innerHTML = html;
    containerEl.classList.add('dashboard-embed-container');

    return { registerId: registerId };
  },

  /**
   * Render KPI cards into a container
   * @param {HTMLElement} containerEl - Container to render into
   * @param {Object} options - Options: { registerId }
   */
  renderKPICards: function(containerEl, options) {
    options = options || {};
    var registerId = options.registerId || 'all';

    var registerName = this.getRegisterNameFromId(registerId);
    var originalRegister = ERM.dashboard.selectedRegister;
    ERM.dashboard.selectedRegister = registerName;

    var html = ERM.dashboard.buildKPICardsV2 ? ERM.dashboard.buildKPICardsV2() : '';

    ERM.dashboard.selectedRegister = originalRegister;

    containerEl.innerHTML = html;
    containerEl.classList.add('dashboard-embed-container');
    containerEl.classList.add('kpi-embedded');

    return { registerId: registerId };
  },

  /**
   * Get available render types
   */
  getTypes: function() {
    return [
      { id: 'heatmap', label: 'Risk Heat Maps', description: 'Inherent and Residual risk heatmaps' },
      { id: 'topRisks', label: 'Top Risks Table', description: 'Highest priority risks' },
      { id: 'riskConcentration', label: 'Risk Concentration', description: 'Risks by category' },
      { id: 'controlCoverage', label: 'Control Coverage', description: 'Control effectiveness overview' },
      { id: 'kpiCards', label: 'KPI Summary Cards', description: 'Key metrics overview' }
    ];
  },

  /**
   * Get data summary for AI context
   * @param {string} contentType - The type of content
   * @param {string} registerId - Register filter
   */
  getDataSummary: function(contentType, registerId) {
    var allRisks = ERM.storage.get('risks') || [];
    var allControls = ERM.storage.get('controls') || [];

    var risks = registerId === 'all' ? allRisks : allRisks.filter(function(r) {
      return r.registerId === registerId;
    });

    var controls = registerId === 'all' ? allControls : allControls.filter(function(c) {
      // Filter controls by linked risks in this register
      if (!c.linkedRisks || c.linkedRisks.length === 0) return false;
      for (var i = 0; i < c.linkedRisks.length; i++) {
        for (var j = 0; j < risks.length; j++) {
          if (risks[j].id === c.linkedRisks[i]) return true;
        }
      }
      return false;
    });

    // Calculate summary stats
    var criticalCount = 0, highCount = 0, mediumCount = 0, lowCount = 0;
    var categories = {};
    for (var i = 0; i < risks.length; i++) {
      var r = risks[i];
      var scores = ERM.dashboard.computeRiskScores(r);
      var score = scores.inherentScore || 0;
      if (score >= 15) criticalCount++;
      else if (score >= 10) highCount++;
      else if (score >= 5) mediumCount++;
      else lowCount++;

      var cat = r.category || 'uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    }

    return {
      contentType: contentType,
      registerId: registerId,
      totalRisks: risks.length,
      totalControls: controls.length,
      risksByLevel: {
        critical: criticalCount,
        high: highCount,
        medium: mediumCount,
        low: lowCount
      },
      risksByCategory: categories,
      timestamp: new Date().toISOString()
    };
  }
};

// Helper: Bind heatmap cell events
ERM.dashboard.bindHeatmapEvents = function(container) {
  var cells = container.querySelectorAll('.heatmap-cell');
  var self = this;
  for (var i = 0; i < cells.length; i++) {
    cells[i].addEventListener('click', function(e) {
      var type = this.getAttribute('data-type');
      var row = parseInt(this.getAttribute('data-row'), 10);
      var col = parseInt(this.getAttribute('data-col'), 10);
      if (self.handleCellClick) {
        self.handleCellClick(type, row, col, this);
      }
    });
  }
};















