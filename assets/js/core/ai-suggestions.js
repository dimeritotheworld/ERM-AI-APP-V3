/**
 * Unified AI Suggestions Module
 * Single source of truth for AI-powered field suggestions across Risk Register and Controls
 *
 * This module provides:
 * - Unified applyToField() for all modules
 * - Standard suggestion flow with DeepSeek + fallback
 * - Consistent UI via showAISuggestionModal
 *
 * @version 1.0.0
 * ES5 Compatible
 */

(function() {
  'use strict';

  window.ERM = window.ERM || {};
  ERM.aiSuggestions = ERM.aiSuggestions || {};

  /* ========================================
     CONFIGURATION
     ======================================== */

  /**
   * Field type configurations
   * Maps field types to their handlers and settings
   */
  ERM.aiSuggestions.fieldTypes = {
    // Text fields (single value)
    text: {
      applyMethod: 'setValue',
      animate: true
    },
    // Select/dropdown fields
    select: {
      applyMethod: 'setValue',
      animate: true
    },
    // List fields (multiple items)
    list: {
      applyMethod: 'addToList',
      animate: true
    },
    // Date fields
    date: {
      applyMethod: 'setValue',
      animate: true,
      triggerChange: true
    },
    // Numeric fields (scores)
    numeric: {
      applyMethod: 'setValue',
      animate: true,
      triggerChange: true
    },
    // Category fields with hidden ID
    category: {
      applyMethod: 'setCategory',
      animate: true
    }
  };

  /* ========================================
     UNIFIED APPLY TO FIELD
     ======================================== */

  /**
   * Universal field value applicator
   * Works with any module (risk-register, controls, etc.)
   *
   * @param {string} fieldId - The field element ID
   * @param {*} value - The value to set
   * @param {Object} options - Optional settings
   * @param {string} options.type - Field type: 'text', 'select', 'list', 'date', 'numeric', 'category'
   * @param {string} options.hiddenFieldId - For category fields, the hidden ID field
   * @param {string} options.listType - For list fields, the list type name
   * @param {Function} options.addListItem - Function to add items to list
   * @param {Function} options.formatValue - Custom value formatter
   * @param {boolean} options.triggerChange - Whether to dispatch change event
   * @param {string} options.toastMessage - Custom success message
   * @param {Function} options.onApply - Callback after value is applied
   * @param {Function} options.scheduleDraftSave - Function to schedule draft save
   */
  ERM.aiSuggestions.applyToField = function(fieldId, value, options) {
    options = options || {};
    var type = options.type || 'text';
    var config = this.fieldTypes[type] || this.fieldTypes.text;

    // Format value if formatter provided
    if (options.formatValue) {
      value = options.formatValue(value);
    }

    // Handle category fields with hidden ID
    if (type === 'category') {
      return this._applyCategoryField(fieldId, value, options);
    }

    // Handle list fields
    if (type === 'list') {
      return this._applyListField(fieldId, value, options);
    }

    // Handle standard fields
    var el = document.getElementById(fieldId);
    if (!el) {
      console.warn('[AI Suggestions] Field not found:', fieldId);
      return false;
    }

    // Set the value
    el.value = value;

    // Add visual feedback
    if (config.animate) {
      el.classList.add('ai-filled');
      setTimeout(function() {
        el.classList.remove('ai-filled');
      }, 2000);
    }

    // Trigger change event if needed
    if (config.triggerChange || options.triggerChange) {
      var event = new Event('change', { bubbles: true });
      el.dispatchEvent(event);
    }

    // Show success toast
    if (typeof ERM.toast !== 'undefined') {
      var message = options.toastMessage || 'AI suggestion applied';
      ERM.toast.success(message);
    }

    // Schedule draft save if function provided
    if (options.scheduleDraftSave) {
      options.scheduleDraftSave();
    }

    // Call onApply callback
    if (options.onApply) {
      options.onApply(value);
    }

    return true;
  };

  /**
   * Apply value to category field (text display + hidden ID)
   * @private
   */
  ERM.aiSuggestions._applyCategoryField = function(fieldId, value, options) {
    var textEl = document.getElementById(fieldId);
    var idEl = options.hiddenFieldId ? document.getElementById(options.hiddenFieldId) : null;

    // Format label for display
    var label = value;
    if (options.formatValue) {
      label = options.formatValue(value);
    } else {
      // Default: capitalize first letter
      label = value.charAt(0).toUpperCase() + value.slice(1);
    }

    if (textEl) {
      textEl.value = label;
      textEl.classList.add('ai-filled');
      setTimeout(function() {
        textEl.classList.remove('ai-filled');
      }, 2000);
    }

    if (idEl) {
      idEl.value = value;
    }

    if (typeof ERM.toast !== 'undefined') {
      ERM.toast.success(options.toastMessage || 'Category applied');
    }

    if (options.scheduleDraftSave) {
      options.scheduleDraftSave();
    }

    if (options.onApply) {
      options.onApply(value);
    }

    return true;
  };

  /**
   * Add value to list field
   * @private
   */
  ERM.aiSuggestions._applyListField = function(fieldId, value, options) {
    if (!options.addListItem) {
      console.warn('[AI Suggestions] addListItem function required for list fields');
      return false;
    }

    // Value can be array (multi-select) or single item
    var items = Array.isArray(value) ? value : [value];
    var added = 0;

    for (var i = 0; i < items.length; i++) {
      options.addListItem(options.listType || fieldId, items[i]);
      added++;
    }

    if (added > 0 && typeof ERM.toast !== 'undefined') {
      var message = options.toastMessage || (added + ' item(s) added');
      ERM.toast.success(message);
    }

    if (options.scheduleDraftSave) {
      options.scheduleDraftSave();
    }

    if (options.onApply) {
      options.onApply(value);
    }

    return added > 0;
  };

  /* ========================================
     SUGGESTION FLOW
     ======================================== */

  /**
   * Show AI suggestions for a field
   * Unified flow: DeepSeek → fallback → showAISuggestionModal
   *
   * @param {Object} config - Suggestion configuration
   * @param {string} config.title - Modal title
   * @param {string} config.fieldName - Field display name
   * @param {string} config.fieldId - Field element ID
   * @param {string} config.fieldType - Field type for apply method
   * @param {string} config.deepSeekType - DeepSeek suggestion type
   * @param {Object} config.context - Context for DeepSeek
   * @param {Object} config.deepSeekModule - DeepSeek module reference (ERM.riskAI.deepSeek or ERM.controlsAI.deepSeek)
   * @param {Function} config.getFallbackSuggestions - Fallback function returning suggestions array
   * @param {boolean} config.multiSelect - Allow multi-select
   * @param {Object} config.applyOptions - Options passed to applyToField
   * @param {Function} config.onSuggestionUsed - Callback when suggestion is used
   * @param {Function} config.clearThinking - Function to clear thinking animation
   * @param {Function} config.transformSuggestions - Transform raw suggestions before display
   */
  ERM.aiSuggestions.showSuggestions = function(config) {
    var self = this;
    var deepSeek = config.deepSeekModule;

    // Clear any previous thinking state
    if (config.clearThinking) {
      config.clearThinking();
    }

    // Check if DeepSeek is available
    if (!deepSeek || typeof deepSeek.getSuggestions !== 'function') {
      this._showFallbackSuggestions(config);
      return;
    }

    // Call DeepSeek
    deepSeek.getSuggestions(config.deepSeekType, config.context, function(error, result) {
      // Clear thinking animation
      if (config.clearThinking) {
        config.clearThinking();
      }

      if (error || !result || !result.suggestions || result.suggestions.length === 0) {
        // Fallback to templates/static suggestions
        self._showFallbackSuggestions(config);
        return;
      }

      // Transform suggestions if needed
      var suggestions = result.suggestions;
      var recommended = result.recommended || 0;

      if (config.transformSuggestions) {
        var transformed = config.transformSuggestions(suggestions, recommended);
        suggestions = transformed.suggestions;
        recommended = transformed.recommended;
      }

      // Show the suggestions modal
      self._showSuggestionsModal(config, suggestions, recommended);
    });
  };

  /**
   * Show fallback suggestions when DeepSeek fails
   * @private
   */
  ERM.aiSuggestions._showFallbackSuggestions = function(config) {
    var suggestions = [];
    var recommended = 0;

    if (config.getFallbackSuggestions) {
      var fallback = config.getFallbackSuggestions();
      if (fallback) {
        suggestions = fallback.suggestions || fallback;
        recommended = fallback.recommended || 0;
      }
    }

    if (!suggestions || suggestions.length === 0) {
      // Show "no suggestions" modal
      ERM.components.modalManager.openSecondary({
        title: ERM.icons.sparkles + ' ' + (config.title || 'AI Suggestions'),
        content:
          '<div class="ai-suggestions-container">' +
          '<p class="ai-suggestions-intro">No AI suggestions available.</p>' +
          '<p class="text-muted">Please try again or enter manually.</p>' +
          '</div>',
        buttons: [{ label: 'Close', type: 'secondary', action: 'close' }]
      });
      return;
    }

    this._showSuggestionsModal(config, suggestions, recommended);
  };

  /**
   * Show the suggestions modal
   * @private
   */
  ERM.aiSuggestions._showSuggestionsModal = function(config, suggestions, recommendedIndex) {
    var self = this;

    // Build suggestions array with recommended flag (max 3 per spec)
    var modalSuggestions = [];
    var limit = Math.min(suggestions.length, 3);

    for (var i = 0; i < limit; i++) {
      var sug = suggestions[i];
      var item;

      if (typeof sug === 'string') {
        item = { text: sug };
      } else {
        item = {
          text: sug.text || sug.value || sug.name || sug.role || String(sug),
          description: sug.description || sug.reason || sug.desc || ''
        };
      }

      item.recommended = (i === recommendedIndex);
      modalSuggestions.push(item);
    }

    // Store values for index-based selection (useful for enums)
    var values = [];
    for (var j = 0; j < limit; j++) {
      var s = suggestions[j];
      values.push(typeof s === 'object' ? (s.value || s.id || s.text || s) : s);
    }

    // Show the modal
    ERM.components.showAISuggestionModal({
      title: config.title || 'AI Suggestions',
      fieldName: config.fieldName,
      suggestions: modalSuggestions,
      multiSelect: config.multiSelect || false,
      onSelect: function(selectedText, index) {
        var value = values[index] !== undefined ? values[index] : selectedText;

        // Apply the value
        self.applyToField(config.fieldId, value, config.applyOptions || {});

        // Call onSuggestionUsed callback
        if (config.onSuggestionUsed) {
          config.onSuggestionUsed();
        }
      },
      onMultiSelect: function(selectedTexts) {
        // For multi-select, collect all selected values
        var selectedValues = [];
        for (var k = 0; k < selectedTexts.length; k++) {
          // Find the index of each selected text
          for (var m = 0; m < modalSuggestions.length; m++) {
            if (modalSuggestions[m].text === selectedTexts[k]) {
              selectedValues.push(values[m] !== undefined ? values[m] : selectedTexts[k]);
              break;
            }
          }
        }

        // Apply all values (for list fields)
        self.applyToField(config.fieldId, selectedValues, config.applyOptions || {});

        // Call onSuggestionUsed callback
        if (config.onSuggestionUsed) {
          config.onSuggestionUsed();
        }
      }
    });
  };

  /* ========================================
     HELPER FUNCTIONS
     ======================================== */

  /**
   * Format category value for display
   * @param {string} value - Raw category value
   * @returns {string} Formatted display label
   */
  ERM.aiSuggestions.formatCategory = function(value) {
    if (!value) return '';

    // Common category mappings
    var categoryLabels = {
      // Risk categories
      'technology': 'Technology',
      'compliance': 'Compliance',
      'financial': 'Financial',
      'operational': 'Operational',
      'strategic': 'Strategic',
      'reputational': 'Reputational',
      'health-safety': 'Health & Safety',
      'environmental': 'Environmental',
      // Control categories
      'policy': 'Policy',
      'procedure': 'Procedure',
      'technical': 'Technical',
      'physical': 'Physical',
      'administrative': 'Administrative'
    };

    var lower = value.toLowerCase().replace(/\s+/g, '-');
    return categoryLabels[lower] || (value.charAt(0).toUpperCase() + value.slice(1));
  };

  /**
   * Format date for display
   * @param {string} dateStr - ISO date string
   * @returns {string} Human-readable date
   */
  ERM.aiSuggestions.formatDate = function(dateStr) {
    if (!dateStr) return '';

    try {
      var date = new Date(dateStr);
      var options = { year: 'numeric', month: 'short', day: 'numeric' };
      return date.toLocaleDateString('en-US', options);
    } catch (e) {
      return dateStr;
    }
  };

  /**
   * Calculate date from offset
   * @param {number} days - Days from today
   * @returns {string} ISO date string
   */
  ERM.aiSuggestions.getDateFromOffset = function(days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  };

  /**
   * Get standard date suggestions
   * @param {string} fieldType - 'review' or 'target'
   * @returns {Array} Date suggestion objects
   */
  ERM.aiSuggestions.getStandardDateSuggestions = function(fieldType) {
    var now = new Date();
    var suggestions = [];

    if (fieldType === 'review') {
      // Review dates: 30, 60, 90 days
      suggestions = [
        { value: this.getDateFromOffset(30), text: 'In 30 days', description: 'Monthly review' },
        { value: this.getDateFromOffset(60), text: 'In 60 days', description: 'Bi-monthly review' },
        { value: this.getDateFromOffset(90), text: 'In 90 days', description: 'Quarterly review' }
      ];
    } else if (fieldType === 'target') {
      // Target dates: 30, 90, 180 days
      suggestions = [
        { value: this.getDateFromOffset(30), text: 'In 30 days', description: 'Short-term target' },
        { value: this.getDateFromOffset(90), text: 'In 90 days', description: 'Medium-term target' },
        { value: this.getDateFromOffset(180), text: 'In 180 days', description: 'Long-term target' }
      ];
    }

    return suggestions;
  };

  /* ========================================
     UNIFIED BUTTON ANIMATION
     ======================================== */

  /**
   * Sparkles icon SVG for AI buttons
   */
  ERM.aiSuggestions.icons = {
    sparkles: '<svg class="ai-sparkle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z"/></svg>'
  };

  /**
   * Start button thinking animation
   * Unified animation for all AI suggestion buttons
   *
   * @param {HTMLElement|string} btn - Button element or selector
   * @param {string} message - Message to show (default: "Loading suggestions")
   * @returns {Object} State object with restore() method
   */
  ERM.aiSuggestions.startButtonThinking = function(btn, message) {
    // Get button element if selector passed
    if (typeof btn === 'string') {
      btn = document.querySelector(btn);
    }

    if (!btn) {
      return { restore: function() {} };
    }

    message = message || 'Loading suggestions';

    // Store original state
    var originalHtml = btn.innerHTML;
    var originalDisabled = btn.disabled;

    // Apply thinking state
    btn.classList.add('ai-thinking-btn');
    btn.innerHTML = '<span class="ai-thinking-content">' +
      this.icons.sparkles + ' ' + message +
      '</span>';
    btn.disabled = true;

    // Return state object with restore method
    return {
      btn: btn,
      originalHtml: originalHtml,
      originalDisabled: originalDisabled,
      restore: function() {
        if (this.btn) {
          this.btn.classList.remove('ai-thinking-btn');
          this.btn.innerHTML = this.originalHtml;
          this.btn.disabled = this.originalDisabled;
        }
      }
    };
  };

  /**
   * Stop button thinking animation
   * Restores button to original state
   *
   * @param {Object} state - State object returned by startButtonThinking
   */
  ERM.aiSuggestions.stopButtonThinking = function(state) {
    if (state && state.restore) {
      state.restore();
    }
  };

  /**
   * Start thinking animation for AI suggest button by field
   *
   * @param {string} fieldType - The field type (e.g., 'title', 'description')
   * @param {string} message - Optional custom message
   * @returns {Object} State object with restore() method
   */
  ERM.aiSuggestions.startFieldThinking = function(fieldType, message) {
    var btn = document.querySelector('.btn-ai-suggest[data-field="' + fieldType + '"]');
    return this.startButtonThinking(btn, message);
  };

  /* ========================================
     INITIALIZATION
     ======================================== */

  ERM.aiSuggestions.init = function() {
    console.log('[AI Suggestions] Unified AI suggestions module initialized');
  };

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ERM.aiSuggestions.init();
    });
  } else {
    ERM.aiSuggestions.init();
  }

})();
