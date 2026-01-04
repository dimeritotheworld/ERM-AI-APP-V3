/**
 * Dimeri ERM - AI Session Manager
 *
 * PURPOSE: Manage AI chat sessions efficiently to reduce token costs while maintaining UX
 *
 * PROBLEMS THIS SOLVES:
 * 1. Chat history is cleared when switching between modules (dashboard → risk register)
 * 2. Every message sends ENTIRE data context (all risks + controls), costing many tokens
 * 3. No session persistence means users lose context when navigating
 * 4. FREE plan users have only 50 API calls - need to maximize value
 *
 * STRATEGY:
 * - Persist chat history in localStorage across module switches
 * - Only send data context on FIRST message of session
 * - Summarize old messages after 6 exchanges to reduce token usage
 * - Clear old sessions after 30 minutes of inactivity
 * - Provide smart context switching when user moves between modules
 *
 * @version 1.0.0
 */

(function() {
  'use strict';

  window.ERM = window.ERM || {};

  /**
   * AI Session Manager
   */
  ERM.aiSessionManager = {
    /**
     * Session configuration
     */
    config: {
      sessionTimeout: 30 * 60 * 1000,      // 30 minutes
      maxMessagesBeforeSummary: 12,        // 6 exchanges (user + AI)
      persistSession: true,                // Save to localStorage
      sendContextOnlyOnce: false,          // CHANGED: Always send full context (API is stateless)
      contextRefreshViews: true            // Send brief update when switching modules
    },

    /**
     * Get current session
     * @returns {object} Session object
     */
    getSession: function() {
      if (!this.config.persistSession) {
        return this.createNewSession();
      }

      var session = ERM.storage.get('erm_aiSession');
      if (!session) {
        return this.createNewSession();
      }

      // Check if session has expired
      var now = Date.now();
      var lastActivity = session.lastActivity || 0;
      if (now - lastActivity > this.config.sessionTimeout) {
        console.log('[AI Session] Session expired, creating new one');
        return this.createNewSession();
      }

      return session;
    },

    /**
     * Create new session
     * @returns {object} New session
     */
    createNewSession: function() {
      var session = {
        id: this.generateSessionId(),
        messages: [],
        createdAt: Date.now(),
        lastActivity: Date.now(),
        currentView: this.getCurrentView(),
        contextSent: false,          // Track if full context was sent
        messageCount: 0,
        summarizedAt: 0              // Last message index that was summarized
      };

      if (this.config.persistSession) {
        ERM.storage.set('erm_aiSession', session);
      }

      return session;
    },

    /**
     * Generate session ID
     * @returns {string} Session ID
     */
    generateSessionId: function() {
      return 'ai_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);
    },

    /**
     * Get current view/module
     * @returns {string} View name
     */
    getCurrentView: function() {
      var hash = window.location.hash.toLowerCase();
      if (hash.indexOf('dashboard') !== -1) return 'dashboard';
      if (hash.indexOf('risk-register') !== -1) return 'risk-register';
      if (hash.indexOf('controls') !== -1) return 'controls';
      return 'dashboard';
    },

    /**
     * Add message to session
     * @param {string} role - 'user' or 'assistant'
     * @param {string} content - Message content
     */
    addMessage: function(role, content) {
      var session = this.getSession();

      session.messages.push({
        role: role,
        content: content,
        timestamp: Date.now()
      });

      session.messageCount++;
      session.lastActivity = Date.now();

      // Check if we need to summarize old messages
      if (this.config.maxMessagesBeforeSummary > 0 &&
          session.messageCount >= this.config.maxMessagesBeforeSummary &&
          session.summarizedAt < session.messages.length - this.config.maxMessagesBeforeSummary) {
        this.summarizeOldMessages(session);
      }

      if (this.config.persistSession) {
        ERM.storage.set('erm_aiSession', session);
      }

      return session;
    },

    /**
     * Get messages for display
     * @returns {array} Messages array
     */
    getMessages: function() {
      var session = this.getSession();
      return session.messages || [];
    },

    /**
     * Clear session (new chat)
     */
    clearSession: function() {
      console.log('[AI Session] Clearing session');
      var newSession = this.createNewSession();

      if (this.config.persistSession) {
        ERM.storage.set('erm_aiSession', newSession);
      }

      return newSession;
    },

    /**
     * Mark that full context has been sent
     */
    markContextSent: function() {
      var session = this.getSession();
      session.contextSent = true;
      session.lastActivity = Date.now();

      // Store data snapshot to detect changes
      session.dataSnapshot = this.createDataSnapshot();

      if (this.config.persistSession) {
        ERM.storage.set('erm_aiSession', session);
      }
    },

    /**
     * Create snapshot of current data for change detection
     * @returns {object} Data snapshot
     */
    createDataSnapshot: function() {
      var risks = ERM.storage ? ERM.storage.get('risks') || [] : [];
      var controls = ERM.storage ? ERM.storage.get('controls') || [] : [];
      var registers = ERM.storage ? ERM.storage.get('erm_riskRegisters') || [] : [];

      return {
        riskCount: risks.length,
        controlCount: controls.length,
        registerCount: registers.length,
        riskIds: risks.map(function(r) { return r.id; }).sort().join(','),
        controlIds: controls.map(function(c) { return c.id; }).sort().join(','),
        timestamp: Date.now()
      };
    },

    /**
     * Check if data has changed since context was sent
     * @returns {boolean} True if data changed
     */
    hasDataChanged: function() {
      var session = this.getSession();

      if (!session.dataSnapshot) {
        return false; // No snapshot, assume no change
      }

      var currentSnapshot = this.createDataSnapshot();
      var oldSnapshot = session.dataSnapshot;

      // Check if counts changed
      if (currentSnapshot.riskCount !== oldSnapshot.riskCount) {
        console.log('[AI Session] Risk count changed:', oldSnapshot.riskCount, '→', currentSnapshot.riskCount);
        return true;
      }

      if (currentSnapshot.controlCount !== oldSnapshot.controlCount) {
        console.log('[AI Session] Control count changed:', oldSnapshot.controlCount, '→', currentSnapshot.controlCount);
        return true;
      }

      if (currentSnapshot.registerCount !== oldSnapshot.registerCount) {
        console.log('[AI Session] Register count changed:', oldSnapshot.registerCount, '→', currentSnapshot.registerCount);
        return true;
      }

      // Check if IDs changed (additions/deletions)
      if (currentSnapshot.riskIds !== oldSnapshot.riskIds) {
        console.log('[AI Session] Risk IDs changed');
        return true;
      }

      if (currentSnapshot.controlIds !== oldSnapshot.controlIds) {
        console.log('[AI Session] Control IDs changed');
        return true;
      }

      return false;
    },

    /**
     * Check if full context needs to be sent
     * @returns {boolean} True if should send full context
     */
    shouldSendFullContext: function() {
      if (!this.config.sendContextOnlyOnce) {
        return true; // Always send if not optimizing
      }

      var session = this.getSession();

      // If context never sent, send it
      if (!session.contextSent) {
        return true;
      }

      // If data has changed since last context sent, refresh it
      if (this.hasDataChanged()) {
        console.log('[AI Session] Data changed - refreshing context');
        return true;
      }

      return false;
    },

    /**
     * Handle view/module change
     * @param {string} newView - New view name
     * @returns {object} Context update info
     */
    onViewChange: function(newView) {
      var session = this.getSession();
      var oldView = session.currentView;

      if (oldView === newView) {
        return { viewChanged: false };
      }

      console.log('[AI Session] View changed from', oldView, 'to', newView);

      session.currentView = newView;
      session.lastActivity = Date.now();

      // Mark that context needs refresh for new view
      var needsContextUpdate = session.contextSent && this.config.contextRefreshViews;

      if (this.config.persistSession) {
        ERM.storage.set('erm_aiSession', session);
      }

      return {
        viewChanged: true,
        oldView: oldView,
        newView: newView,
        needsContextUpdate: needsContextUpdate
      };
    },

    /**
     * Get lightweight context update message
     * @param {string} view - Current view
     * @returns {string} Brief context update
     */
    getLightweightContextUpdate: function(view) {
      // Instead of sending ALL risk/control details again,
      // just send a brief summary
      var risks = ERM.storage ? ERM.storage.get('risks') || [] : [];
      var controls = ERM.storage ? ERM.storage.get('controls') || [] : [];

      var context = "USER SWITCHED TO: " + view.toUpperCase() + " MODULE\n\n";
      context += "UPDATED COUNTS:\n";
      context += "- Total Risks: " + risks.length + "\n";
      context += "- Total Controls: " + controls.length + "\n";

      // Add distribution only
      var critical = 0, high = 0, medium = 0, low = 0;
      for (var i = 0; i < risks.length; i++) {
        var score = risks[i].residualScore || risks[i].inherentScore || 0;
        if (score >= 20) critical++;
        else if (score >= 12) high++;
        else if (score >= 6) medium++;
        else low++;
      }
      context += "- Risk Distribution: " + critical + " Critical, " + high + " High, " + medium + " Medium, " + low + " Low\n";

      return context;
    },

    /**
     * Summarize old messages to save tokens
     * Keeps recent messages intact, summarizes older ones
     * @param {object} session - Session object
     */
    summarizeOldMessages: function(session) {
      var keepRecentCount = 6; // Keep last 3 exchanges (6 messages)
      var messages = session.messages;

      if (messages.length <= keepRecentCount) {
        return; // Not enough messages to summarize
      }

      var toSummarize = messages.length - keepRecentCount;
      var oldMessages = messages.slice(0, toSummarize);
      var recentMessages = messages.slice(toSummarize);

      // Create summary
      var summary = this.createMessagesSummary(oldMessages);

      // Replace old messages with summary
      session.messages = [
        {
          role: 'system',
          content: '[Previous conversation summary] ' + summary,
          timestamp: oldMessages[oldMessages.length - 1].timestamp,
          isSummary: true
        }
      ].concat(recentMessages);

      session.summarizedAt = session.messages.length;

      console.log('[AI Session] Summarized', toSummarize, 'old messages into summary');
    },

    /**
     * Create summary of messages
     * @param {array} messages - Messages to summarize
     * @returns {string} Summary text
     */
    createMessagesSummary: function(messages) {
      var topics = [];
      var userQuestions = 0;

      for (var i = 0; i < messages.length; i++) {
        var msg = messages[i];
        if (msg.role === 'user') {
          userQuestions++;
          // Extract key topics from user messages
          var content = msg.content.toLowerCase();
          if (content.indexOf('risk') !== -1) topics.push('risks');
          if (content.indexOf('control') !== -1) topics.push('controls');
          if (content.indexOf('score') !== -1 || content.indexOf('scoring') !== -1) topics.push('scoring');
          if (content.indexOf('root cause') !== -1) topics.push('root causes');
          if (content.indexOf('owner') !== -1 || content.indexOf('ownership') !== -1) topics.push('ownership');
        }
      }

      // Remove duplicates
      topics = topics.filter(function(item, pos, self) {
        return self.indexOf(item) === pos;
      });

      var summary = 'User asked ' + userQuestions + ' questions about: ' +
                    (topics.length > 0 ? topics.join(', ') : 'their risk data') + '.';

      return summary;
    },

    /**
     * Get conversation history for API (optimized)
     * Returns recent messages only to reduce token usage
     * @param {number} maxMessages - Max messages to return (default: 8)
     * @returns {array} Messages for API
     */
    getConversationHistory: function(maxMessages) {
      maxMessages = maxMessages || 8; // 4 exchanges by default

      var session = this.getSession();
      var messages = session.messages || [];

      if (messages.length <= maxMessages) {
        return messages;
      }

      // Return most recent messages
      return messages.slice(-maxMessages);
    },

    /**
     * Get session statistics
     * @returns {object} Session stats
     */
    getSessionStats: function() {
      var session = this.getSession();
      var now = Date.now();

      return {
        sessionId: session.id,
        messageCount: session.messageCount,
        currentView: session.currentView,
        ageMinutes: Math.floor((now - session.createdAt) / 60000),
        inactiveMinutes: Math.floor((now - session.lastActivity) / 60000),
        contextSent: session.contextSent,
        hasSummary: session.messages.some(function(m) { return m.isSummary; })
      };
    },

    /**
     * Reset context sent flag (force full context on next message)
     */
    resetContextFlag: function() {
      var session = this.getSession();
      session.contextSent = false;

      if (this.config.persistSession) {
        ERM.storage.set('erm_aiSession', session);
      }
    }
  };

  console.log('AI Session Manager loaded');
})();
