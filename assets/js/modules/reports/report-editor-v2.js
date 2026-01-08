/**
 * Report Editor V2 - Notion-Style Editor
 * Clean, minimal, inline-focused editing experience
 * ES5 Compatible
 */

(function() {
  'use strict';

  // Ensure ERM namespace exists
  if (!window.ERM) window.ERM = {};
  if (!ERM.reports) ERM.reports = {};

  /**
   * Editor State
   */
  var state = {
    currentReport: null,
    isDirty: false,
    lastSaved: null,
    activeBlock: null,
    slashMenuVisible: false,
    slashMenuPosition: null,
    slashMenuFilter: '',
    slashTargetBlock: null, // Block that triggered slash menu (preserved when input steals focus)
    insertAfterBlock: null, // Block to insert new block AFTER (for + button)
    slashMenuMode: 'convert', // 'convert' = change current block, 'insert' = insert new block after
    selectionPillsVisible: false,
    currentSelection: null,
    currentRange: null,
    aiDropdownVisible: false,
    turnIntoVisible: false,
    inlineCommentVisible: false,
    embedPickerVisible: false,
    embedPickerType: null,
    firstTimeUser: false,
    draggedBlock: null,
    hoveredBlock: null,
    floatingHandleVisible: false,
    // Undo/Redo
    undoStack: [],
    redoStack: [],
    isUndoing: false, // Flag to prevent saving state during undo/redo
    saveStateTimeout: null, // For debouncing text input
    // Block-level multi-selection (like Notion)
    selectedBlocks: [], // Array of block IDs that are selected
    blockSelectionMode: false, // True when in block selection mode (vs text selection)
    blockSelectionAnchor: null, // Starting block ID for shift-click range selection
    isBlockDragging: false, // True during block gutter drag
    blockDragStartY: null // Y position where block drag started
  };

  // ========================================
  // SELECTION LOCK SYSTEM
  // Persists selection through focus changes during AI workflow
  // ========================================
  var selectionLock = {
    isLocked: false,
    blockId: null,
    blockElement: null,
    startOffset: 0,
    endOffset: 0,
    text: '',
    highlightSpans: [] // Array of highlight spans for cleanup
  };

  /**
   * Capture and lock the current selection
   * Creates visual highlight that persists even when focus changes
   */
  function captureSelectionLock() {
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    var range = selection.getRangeAt(0);
    var selectedText = range.toString().trim();
    if (!selectedText) return false;

    // Find containing block
    var node = range.commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentNode;
    var block = node.closest ? node.closest('.editor-v2-block') : null;

    // Store lock info
    selectionLock.isLocked = true;
    selectionLock.blockId = block ? block.getAttribute('data-block-id') : null;
    selectionLock.blockElement = block;
    selectionLock.startOffset = range.startOffset;
    selectionLock.endOffset = range.endOffset;
    selectionLock.text = selectedText;
    selectionLock.originalRange = range.cloneRange();

    // Apply visual highlight
    applySelectionLockHighlight(range);

    console.log('[SelectionLock] Captured:', selectedText.substring(0, 50) + '...');
    return true;
  }

  /**
   * Apply visual highlight spans to the locked selection
   * This persists even when browser selection is lost
   */
  function applySelectionLockHighlight(range) {
    // Clear any existing highlights first
    clearSelectionLockHighlight();

    try {
      var startContainer = range.startContainer;
      var endContainer = range.endContainer;
      var startOffset = range.startOffset;
      var endOffset = range.endOffset;

      // Helper to check if node is text
      function isTextNode(n) { return n && n.nodeType === 3; }

      // Simple case: single text node
      if (startContainer === endContainer && isTextNode(startContainer)) {
        var text = startContainer.nodeValue;
        var parent = startContainer.parentNode;

        // Skip if already inside a lock highlight
        if (parent.classList && parent.classList.contains('selection-lock')) return;

        var beforeText = text.substring(0, startOffset);
        var selectedText = text.substring(startOffset, endOffset);
        var afterText = text.substring(endOffset);

        var frag = document.createDocumentFragment();
        if (beforeText) frag.appendChild(document.createTextNode(beforeText));

        var highlightSpan = document.createElement('span');
        highlightSpan.className = 'selection-lock';
        highlightSpan.setAttribute('data-selection-lock', 'true');
        highlightSpan.textContent = selectedText;
        frag.appendChild(highlightSpan);
        selectionLock.highlightSpans.push(highlightSpan);

        if (afterText) frag.appendChild(document.createTextNode(afterText));

        parent.replaceChild(frag, startContainer);
        return;
      }

      // Complex case: multiple nodes - use tree walker
      var commonAncestor = range.commonAncestorContainer;
      if (commonAncestor.nodeType === 3) commonAncestor = commonAncestor.parentNode;

      // Collect text nodes in range
      var textNodes = [];
      var walker = document.createTreeWalker(commonAncestor, NodeFilter.SHOW_TEXT, null, false);
      var node, foundStart = false;
      while ((node = walker.nextNode())) {
        if (node === startContainer) foundStart = true;
        if (foundStart) textNodes.push(node);
        if (node === endContainer) break;
      }

      // Wrap each text node portion
      for (var i = 0; i < textNodes.length; i++) {
        var textNode = textNodes[i];
        var parent = textNode.parentNode;
        if (!parent) continue;
        if (parent.classList && parent.classList.contains('selection-lock')) continue;
        if (parent.closest && parent.closest('.block-controls')) continue;

        var nodeText = textNode.nodeValue || '';
        var hlStart = 0;
        var hlEnd = nodeText.length;

        if (textNode === startContainer) hlStart = startOffset;
        if (textNode === endContainer) hlEnd = endOffset;
        if (hlEnd <= hlStart) continue;

        var before = nodeText.substring(0, hlStart);
        var selected = nodeText.substring(hlStart, hlEnd);
        var after = nodeText.substring(hlEnd);

        var frag = document.createDocumentFragment();
        if (before) frag.appendChild(document.createTextNode(before));

        var span = document.createElement('span');
        span.className = 'selection-lock';
        span.setAttribute('data-selection-lock', 'true');
        span.textContent = selected;
        frag.appendChild(span);
        selectionLock.highlightSpans.push(span);

        if (after) frag.appendChild(document.createTextNode(after));

        parent.replaceChild(frag, textNode);
      }
    } catch (e) {
      console.log('[SelectionLock] Highlight error:', e.message);
    }
  }

  /**
   * Clear selection lock highlight spans
   * Restores original text structure
   */
  function clearSelectionLockHighlight() {
    var highlights = document.querySelectorAll('.selection-lock[data-selection-lock]');
    var parentsToNormalize = [];

    for (var i = 0; i < highlights.length; i++) {
      var highlight = highlights[i];
      var parent = highlight.parentNode;
      if (!parent) continue;

      if (parentsToNormalize.indexOf(parent) === -1) {
        parentsToNormalize.push(parent);
      }

      // Move children out and remove span
      while (highlight.firstChild) {
        parent.insertBefore(highlight.firstChild, highlight);
      }
      parent.removeChild(highlight);
    }

    // Normalize to merge adjacent text nodes
    for (var j = 0; j < parentsToNormalize.length; j++) {
      if (parentsToNormalize[j] && parentsToNormalize[j].normalize) {
        parentsToNormalize[j].normalize();
      }
    }

    selectionLock.highlightSpans = [];
  }

  /**
   * Clear the selection lock entirely
   */
  function clearSelectionLock() {
    if (!selectionLock.isLocked) return;

    clearSelectionLockHighlight();

    selectionLock.isLocked = false;
    selectionLock.blockId = null;
    selectionLock.blockElement = null;
    selectionLock.startOffset = 0;
    selectionLock.endOffset = 0;
    selectionLock.text = '';
    selectionLock.originalRange = null;

    console.log('[SelectionLock] Cleared');
  }

  /**
   * Get the locked selection text
   */
  function getSelectionLockText() {
    return selectionLock.text;
  }

  /**
   * Check if selection is locked
   */
  function isSelectionLocked() {
    return selectionLock.isLocked;
  }

  /**
   * Get locked selection info
   */
  function getSelectionLock() {
    return selectionLock;
  }

  // Expose selection lock API on ERM.reportEditorV2
  // Will be attached after the module is fully defined

  // ========================================
  // PAGE LAYOUT CONSTANTS & AUTO-PAGINATION
  // ========================================
  // A4 dimensions in mm (source of truth - matches Puppeteer exactly)
  var PAGE_CONSTANTS = {
    A4_WIDTH_MM: 210,
    A4_HEIGHT_MM: 297,
    MARGIN_MM: 20,
    CONTENT_HEIGHT_MM: 257,  // 297 - 20 - 20
    CONTENT_WIDTH_MM: 170,   // 210 - 20 - 20
    // Convert mm to pixels (assuming 96 DPI, 1mm = 3.7795px)
    MM_TO_PX: 3.7795,
    // Computed pixel values
    get CONTENT_HEIGHT_PX() { return this.CONTENT_HEIGHT_MM * this.MM_TO_PX; }, // ~970px
    get CONTENT_WIDTH_PX() { return this.CONTENT_WIDTH_MM * this.MM_TO_PX; },   // ~642px
    get PAGE_HEIGHT_PX() { return this.A4_HEIGHT_MM * this.MM_TO_PX; },         // ~1122px
    get MARGIN_PX() { return this.MARGIN_MM * this.MM_TO_PX; },                 // ~75.6px
    // Safety buffer - don't get too close to bottom (in px)
    BOTTOM_SAFETY_BUFFER: 20,
    // Minimum lines after heading (prevents orphan headings)
    MIN_LINES_AFTER_HEADING: 2,
    LINE_HEIGHT_PX: 24  // Approximate line height in px
  };

  /**
   * Get the current page container for a block
   * Returns the .preview-page or .editor-v2-content that contains the block
   */
  function getPageContainer(block) {
    if (!block) return null;
    // Check if we're in preview mode (has .preview-page containers)
    var previewPage = block.closest('.preview-page');
    if (previewPage) return previewPage;
    // Otherwise return the main editor content area
    return block.closest('.editor-v2-content');
  }

  /**
   * Measure the height of a block in pixels
   */
  function measureBlockHeight(block) {
    if (!block) return 0;
    var rect = block.getBoundingClientRect();
    return rect.height;
  }

  /**
   * Get the Y position of a block relative to its page container
   */
  function getBlockYPosition(block) {
    if (!block) return 0;
    var container = getPageContainer(block);
    if (!container) return 0;

    var blockRect = block.getBoundingClientRect();
    var containerRect = container.getBoundingClientRect();

    // Position relative to container top, accounting for margin
    return blockRect.top - containerRect.top;
  }

  /**
   * Calculate remaining space on current page AFTER a given block
   */
  function getRemainingPageSpace(block) {
    var yPos = getBlockYPosition(block);
    var blockHeight = measureBlockHeight(block);
    var usedHeight = yPos + blockHeight;

    // Available content height minus what's already used
    var remaining = PAGE_CONSTANTS.CONTENT_HEIGHT_PX - usedHeight - PAGE_CONSTANTS.BOTTOM_SAFETY_BUFFER;
    return Math.max(0, remaining);
  }

  /**
   * Check if a block overflows the page (its bottom edge exceeds the printable area)
   * @param {HTMLElement} block - The block to check
   * @returns {boolean} True if block bottom exceeds page content area
   */
  function doesBlockOverflowPage(block) {
    var yPos = getBlockYPosition(block);
    var blockHeight = measureBlockHeight(block);
    var blockBottom = yPos + blockHeight;

    // Check if block bottom exceeds the printable content area
    var maxContentHeight = PAGE_CONSTANTS.CONTENT_HEIGHT_PX - PAGE_CONSTANTS.BOTTOM_SAFETY_BUFFER;
    return blockBottom > maxContentHeight;
  }

  /**
   * Check if adding content would overflow the page
   * @param {HTMLElement} block - The reference block
   * @param {number} additionalHeight - Extra height being added (e.g., new paragraph)
   * @returns {boolean} True if content would overflow
   */
  function wouldOverflowPage(block, additionalHeight) {
    var remaining = getRemainingPageSpace(block);
    return additionalHeight > remaining;
  }

  /**
   * Check if a heading would be orphaned (no content after it on same page)
   * @param {HTMLElement} headingBlock - The heading block
   * @returns {boolean} True if heading would be orphaned
   */
  function wouldOrphanHeading(headingBlock) {
    var blockType = headingBlock.getAttribute('data-block-type');
    if (!blockType || !blockType.startsWith('heading')) return false;

    var remaining = getRemainingPageSpace(headingBlock);
    var minRequired = PAGE_CONSTANTS.MIN_LINES_AFTER_HEADING * PAGE_CONSTANTS.LINE_HEIGHT_PX;

    return remaining < minRequired;
  }

  /**
   * Insert a page break before a block (silently, no UI)
   * @param {HTMLElement} block - Block to insert page break before
   */
  function insertPageBreakBefore(block) {
    if (!block) return;

    var pageBreakId = 'block_' + Date.now() + '_autopb';
    var pageBreakHtml = '<div class="editor-v2-block" data-block-id="' + pageBreakId + '" data-block-type="pagebreak" data-auto-inserted="true">' +
      '<div class="block-controls">' +
      '<button class="block-add" data-block-id="' + pageBreakId + '" title="Add block">+</button>' +
      '<button class="block-drag" data-block-id="' + pageBreakId + '" title="Drag">⋮⋮</button>' +
      '</div>' +
      '<div class="block-element editor-v2-pagebreak">' +
      '<div class="pagebreak-line"></div>' +
      '<span class="pagebreak-label">Page Break</span>' +
      '<div class="pagebreak-line"></div>' +
      '</div>' +
      '</div>';

    block.insertAdjacentHTML('beforebegin', pageBreakHtml);

    // Subtle animation to show content flowed
    block.style.transition = 'opacity 0.15s ease';
    block.style.opacity = '0.5';
    setTimeout(function() {
      block.style.opacity = '1';
    }, 150);

    console.log('[AutoPagination] Page break inserted before block:', block.getAttribute('data-block-id'));
  }

  /**
   * Auto-paginate: DISABLED to prevent infinite loops
   * The page container system handles pagination differently
   */
  function autoPaginate(block) {
    // Guard against recursive calls
    if (pageAwareness.isProcessingOverflow) {
      return;
    }

    if (!block) return;

    // Find the page containing this block
    var page = block.closest('.editor-v2-page');
    if (!page) return;

    // Skip cover pages
    if (page.querySelector('.editor-v2-cover-block, [data-block-type="cover"]')) {
      return;
    }

    // Check for overflow and handle it
    handlePageOverflow(page);
  }

  /**
   * Slash Command Definitions
   */
  // Professional SVG icons for slash commands
  var icons = {
    heatmap: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    risks: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    chart: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
    kpi: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    register: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    controls: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    ai: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    draft: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    h1: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 10l3-2v10"/></svg>',
    h2: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M21 18h-4c0-4 4-3 4-6 0-1.5-2-2.5-4-1"/></svg>',
    h3: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17.5 10.5c1.5-1 3.5 0 3.5 1.5a2 2 0 0 1-2 2"/><path d="M17 17.5c2 1.5 4 .5 4-1.5a2 2 0 0 0-2-2"/></svg>',
    bullet: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>',
    number: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/><path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/></svg>',
    divider: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/></svg>',
    pagebreak: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19h16"/><path d="M4 5h16"/><path d="M4 12h2"/><path d="M10 12h2"/><path d="M16 12h2"/><path d="M22 12h2"/></svg>',
    quote: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3z"/></svg>',
    callout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    text: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="17" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="17" y1="18" x2="3" y2="18"/></svg>'
  };

  var slashCommands = [
    // Content - Embeds
    { id: 'heatmap', label: 'Heatmap', icon: icons.heatmap, shortcut: '/heatmap', category: 'content', description: 'Risk heatmap visualization', hasOptions: true },
    { id: 'risks', label: 'Top Risks', icon: icons.risks, shortcut: '/risks', category: 'content', description: 'Top risks table', hasOptions: true },
    { id: 'chart', label: 'Category Chart', icon: icons.chart, shortcut: '/chart', category: 'content', description: 'Risk by category chart', hasOptions: true },
    { id: 'kpi', label: 'KPI Cards', icon: icons.kpi, shortcut: '/kpi', category: 'content', description: 'Key metrics cards', hasOptions: true },
    { id: 'register', label: 'Risk Register', icon: icons.register, shortcut: '/register', category: 'content', description: 'Full risk register table', hasOptions: true },
    { id: 'controls', label: 'Controls', icon: icons.controls, shortcut: '/controls', category: 'content', description: 'Control library table', hasOptions: true },

    // AI
    { id: 'ai', label: 'Ask AI', icon: icons.ai, shortcut: '/ai', category: 'ai', description: 'Ask AI to write content' },
    { id: 'draft', label: 'Draft Section', icon: icons.draft, shortcut: '/draft', category: 'ai', description: 'AI drafts a section for you' },

    // Basic formatting
    { id: 'text', label: 'Text', icon: icons.text, shortcut: '/text', category: 'basic', description: 'Plain text paragraph' },
    { id: 'h1', label: 'Heading 1', icon: icons.h1, shortcut: '/h1', category: 'basic', description: 'Large section heading' },
    { id: 'h2', label: 'Heading 2', icon: icons.h2, shortcut: '/h2', category: 'basic', description: 'Medium section heading' },
    { id: 'h3', label: 'Heading 3', icon: icons.h3, shortcut: '/h3', category: 'basic', description: 'Small section heading' },
    { id: 'bullet', label: 'Bullet List', icon: icons.bullet, shortcut: '/bullet', category: 'basic', description: 'Bulleted list' },
    { id: 'number', label: 'Numbered List', icon: icons.number, shortcut: '/number', category: 'basic', description: 'Numbered list' },
    { id: 'divider', label: 'Divider', icon: icons.divider, shortcut: '/divider', category: 'basic', description: 'Horizontal divider' },
    { id: 'pagebreak', label: 'Page Break', icon: icons.pagebreak, shortcut: '/page', category: 'basic', description: 'Start new page in PDF export' },
    { id: 'quote', label: 'Quote', icon: icons.quote, shortcut: '/quote', category: 'basic', description: 'Quote block' },
    { id: 'callout', label: 'Callout', icon: icons.callout, shortcut: '/callout', category: 'basic', description: 'Highlighted callout box' }
  ];

  /**
   * AI Actions for selected text - with professional SVG icons
   */
  var aiIcons = {
    simplify: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>',
    expand: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
    rewrite: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>',
    formal: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    summarize: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>',
    bullets: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="4" cy="6" r="1" fill="currentColor"/><circle cx="4" cy="12" r="1" fill="currentColor"/><circle cx="4" cy="18" r="1" fill="currentColor"/></svg>',
    custom: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  };

  var aiActions = [
    { id: 'simplify', label: 'Simplify', icon: aiIcons.simplify, description: 'Make it simpler and clearer' },
    { id: 'expand', label: 'Expand', icon: aiIcons.expand, description: 'Add more detail' },
    { id: 'rewrite', label: 'Rewrite', icon: aiIcons.rewrite, description: 'Rewrite differently' },
    { id: 'formal', label: 'Make Formal', icon: aiIcons.formal, description: 'Professional tone' },
    { id: 'summarize', label: 'Summarize', icon: aiIcons.summarize, description: 'Shorten to key points' },
    { id: 'bullets', label: 'To Bullets', icon: aiIcons.bullets, description: 'Convert to bullet points' },
    { id: 'custom', label: 'Custom Prompt...', icon: aiIcons.custom, description: 'Ask AI anything' }
  ];

  // ========================================
  // BLOCK SELECTION SYSTEM (Notion-style)
  // ========================================

  /**
   * Select a single block (clears previous selection)
   */
  function selectBlock(blockId, addToSelection) {
    console.log('[BlockSelect] selectBlock called with blockId:', blockId, 'addToSelection:', addToSelection);
    if (!blockId) return;

    var block = document.querySelector('[data-block-id="' + blockId + '"]');
    console.log('[BlockSelect] Found block element:', !!block);
    if (!block) return;

    if (addToSelection) {
      // Add to existing selection (Cmd/Ctrl+Click)
      if (state.selectedBlocks.indexOf(blockId) === -1) {
        state.selectedBlocks.push(blockId);
        block.classList.add('block-selected');
      } else {
        // Toggle off if already selected
        var idx = state.selectedBlocks.indexOf(blockId);
        state.selectedBlocks.splice(idx, 1);
        block.classList.remove('block-selected');
      }
    } else {
      // Clear previous selection and select just this one
      clearBlockSelection();
      state.selectedBlocks = [blockId];
      block.classList.add('block-selected');
    }

    state.blockSelectionMode = state.selectedBlocks.length > 0;
    state.blockSelectionAnchor = blockId;
    state.activeBlock = block; // Set active block for AI operations

    // Clear any text selection when entering block selection mode
    if (state.blockSelectionMode) {
      window.getSelection().removeAllRanges();
    }

    console.log('[BlockSelect] Selected blocks:', state.selectedBlocks);
    console.log('[BlockSelect] blockSelectionMode:', state.blockSelectionMode);
    console.log('[BlockSelect] Calling updateBlockSelectionUI...');
    updateBlockSelectionUI();
  }

  /**
   * Select a range of blocks (Shift+Click)
   */
  function selectBlockRange(toBlockId) {
    if (!state.blockSelectionAnchor || !toBlockId) return;

    var editorContent = document.querySelector('.editor-v2-content');
    if (!editorContent) return;

    var allBlocks = Array.prototype.slice.call(editorContent.querySelectorAll('.editor-v2-block'));
    var anchorIndex = -1;
    var toIndex = -1;

    for (var i = 0; i < allBlocks.length; i++) {
      var id = allBlocks[i].getAttribute('data-block-id');
      if (id === state.blockSelectionAnchor) anchorIndex = i;
      if (id === toBlockId) toIndex = i;
    }

    if (anchorIndex === -1 || toIndex === -1) return;

    // Determine range
    var startIdx = Math.min(anchorIndex, toIndex);
    var endIdx = Math.max(anchorIndex, toIndex);

    // Clear current selection
    clearBlockSelection();

    // Select all blocks in range
    for (var j = startIdx; j <= endIdx; j++) {
      var blockId = allBlocks[j].getAttribute('data-block-id');
      state.selectedBlocks.push(blockId);
      allBlocks[j].classList.add('block-selected');
    }

    state.blockSelectionMode = true;
    state.activeBlock = allBlocks[startIdx]; // Set first block as active for AI operations
    window.getSelection().removeAllRanges();

    console.log('[BlockSelect] Range selected:', state.selectedBlocks.length, 'blocks');
    updateBlockSelectionUI();
  }

  /**
   * Clear all block selections
   */
  function clearBlockSelection() {
    var selectedBlocks = document.querySelectorAll('.block-selected');
    for (var i = 0; i < selectedBlocks.length; i++) {
      selectedBlocks[i].classList.remove('block-selected');
    }
    state.selectedBlocks = [];
    state.blockSelectionMode = false;
    updateBlockSelectionUI();
  }

  /**
   * Get all selected block elements
   */
  function getSelectedBlockElements() {
    var elements = [];
    for (var i = 0; i < state.selectedBlocks.length; i++) {
      var block = document.querySelector('[data-block-id="' + state.selectedBlocks[i] + '"]');
      if (block) elements.push(block);
    }
    return elements;
  }

  /**
   * Get text content from selected blocks
   */
  function getSelectedBlocksText() {
    var texts = [];
    var elements = getSelectedBlockElements();
    for (var i = 0; i < elements.length; i++) {
      var content = elements[i].querySelector('.block-element, .block-content, h1, h2, h3, li, p');
      if (content) {
        texts.push(content.textContent || '');
      }
    }
    return texts.join('\n\n');
  }

  /**
   * Update UI based on block selection state
   */
  function updateBlockSelectionUI() {
    console.log('[BlockSelect] updateBlockSelectionUI called, selectedBlocks:', state.selectedBlocks.length);
    if (state.selectedBlocks.length > 0) {
      // Update AI module state with selected blocks text
      if (ERM.reportEditorAI) {
        var text = getSelectedBlocksText();
        console.log('[BlockSelect] Setting AI state - text length:', text.length);
        ERM.reportEditorAI.setState('selection', text);
        ERM.reportEditorAI.setState('selectedBlocks', state.selectedBlocks.slice());
      }
      // Show floating toolbar for block selection
      console.log('[BlockSelect] Calling showBlockSelectionToolbar...');
      showBlockSelectionToolbar();
    } else {
      // Hide toolbar when no blocks selected
      console.log('[BlockSelect] No blocks selected, hiding toolbar');
      hideFloatingToolbar();
    }
  }

  /**
   * Show floating toolbar for block selection (positioned over selected blocks)
   */
  function showBlockSelectionToolbar() {
    console.log('[BlockSelect] showBlockSelectionToolbar called');
    var elements = getSelectedBlockElements();
    console.log('[BlockSelect] Selected elements count:', elements.length);
    if (elements.length === 0) return;

    var toolbar = document.getElementById('report-floating-toolbar');
    console.log('[BlockSelect] Existing toolbar:', !!toolbar);
    if (!toolbar) {
      console.log('[BlockSelect] Creating new toolbar');
      toolbar = createFloatingToolbar();
      document.body.appendChild(toolbar);
    }

    // Calculate bounding box of all selected blocks
    var firstRect = elements[0].getBoundingClientRect();
    var lastRect = elements[elements.length - 1].getBoundingClientRect();

    var boundingRect = {
      top: firstRect.top,
      bottom: lastRect.bottom,
      left: Math.min(firstRect.left, lastRect.left),
      right: Math.max(firstRect.right, lastRect.right)
    };
    boundingRect.width = boundingRect.right - boundingRect.left;

    // Position toolbar above the selection
    var toolbarWidth = 400;
    var left = boundingRect.left + (boundingRect.width / 2) - (toolbarWidth / 2);
    var top = boundingRect.top - 50;

    // Ensure toolbar stays in viewport
    if (left < 10) left = 10;
    if (left + toolbarWidth > window.innerWidth - 10) {
      left = window.innerWidth - toolbarWidth - 10;
    }

    // Flip below if too close to top
    if (top < 10) {
      top = boundingRect.bottom + 10;
      toolbar.classList.add('toolbar-below');
    } else {
      toolbar.classList.remove('toolbar-below');
    }

    toolbar.style.left = left + 'px';
    toolbar.style.top = top + 'px';
    toolbar.classList.add('visible');
    state.selectionPillsVisible = true;

    console.log('[V2] Showing block selection toolbar for', elements.length, 'blocks');
  }

  /**
   * Delete all selected blocks
   */
  function deleteSelectedBlocks() {
    if (state.selectedBlocks.length === 0) return;

    saveState(); // Save for undo

    var elements = getSelectedBlockElements();
    var nextBlock = null;

    // Find the block after the last selected one
    if (elements.length > 0) {
      nextBlock = elements[elements.length - 1].nextElementSibling;
      if (!nextBlock || !nextBlock.classList.contains('editor-v2-block')) {
        nextBlock = elements[0].previousElementSibling;
      }
    }

    // Remove all selected blocks
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].parentNode) {
        elements[i].parentNode.removeChild(elements[i]);
      }
    }

    clearBlockSelection();

    // Focus next block
    if (nextBlock && nextBlock.classList.contains('editor-v2-block')) {
      state.activeBlock = nextBlock;
      var editable = nextBlock.querySelector('[contenteditable="true"]');
      if (editable) editable.focus();
    }

    markDirty();
    ERM.toast.success(elements.length + ' block(s) deleted');
  }

  /**
   * Initialize block selection event handlers
   */
  function initBlockSelection(editorContent) {
    console.log('[BlockSelect] initBlockSelection called');

    // Click on block select button (checkbox icon) to select block
    editorContent.addEventListener('mousedown', function(e) {
      var selectBtn = e.target.closest('.block-select');
      if (selectBtn) {
        console.log('[BlockSelect] Checkbox clicked');
        e.preventDefault();
        e.stopPropagation();

        var blockId = selectBtn.getAttribute('data-block-id');
        console.log('[BlockSelect] Block ID:', blockId);

        if (e.shiftKey && state.blockSelectionAnchor) {
          // Shift+Click: range selection
          console.log('[BlockSelect] Shift+Click range selection');
          selectBlockRange(blockId);
        } else if (e.ctrlKey || e.metaKey) {
          // Ctrl/Cmd+Click: add to selection
          console.log('[BlockSelect] Ctrl+Click add to selection');
          selectBlock(blockId, true);
        } else {
          // Regular click: select single block
          console.log('[BlockSelect] Regular click single select');
          selectBlock(blockId, false);
        }
        return;
      }

      // Click on drag handle also selects block
      var dragHandle = e.target.closest('.block-drag');
      if (dragHandle) {
        var blockId = dragHandle.getAttribute('data-block-id');
        if (!state.selectedBlocks.length || state.selectedBlocks.indexOf(blockId) === -1) {
          if (e.shiftKey && state.blockSelectionAnchor) {
            selectBlockRange(blockId);
          } else {
            selectBlock(blockId, e.ctrlKey || e.metaKey);
          }
        }
        return;
      }

      // Click elsewhere in editor clears block selection (if not clicking in selected block)
      if (state.blockSelectionMode) {
        var clickedBlock = e.target.closest('.editor-v2-block');
        if (clickedBlock) {
          var clickedId = clickedBlock.getAttribute('data-block-id');
          if (state.selectedBlocks.indexOf(clickedId) === -1) {
            clearBlockSelection();
          }
        } else {
          clearBlockSelection();
        }
      }
    });

    // Keyboard shortcuts for block selection
    document.addEventListener('keydown', function(e) {
      // Check both blockSelectionMode flag and actual selected blocks
      var hasBlockSelection = state.blockSelectionMode || state.selectedBlocks.length > 0;
      console.log('[BlockSelect] Keydown:', e.key, 'hasBlockSelection:', hasBlockSelection, 'selectedBlocks:', state.selectedBlocks.length);
      if (!hasBlockSelection) return;

      // Delete/Backspace deletes selected blocks
      if (e.key === 'Delete' || e.key === 'Backspace') {
        console.log('[BlockSelect] Delete/Backspace pressed, selectedBlocks:', state.selectedBlocks.length);
        if (state.selectedBlocks.length > 0) {
          e.preventDefault();
          console.log('[BlockSelect] Calling deleteSelectedBlocks...');
          deleteSelectedBlocks();
          return;
        }
      }

      // Escape clears selection
      if (e.key === 'Escape') {
        clearBlockSelection();
        return;
      }

      // Ctrl/Cmd+A selects all blocks when in block selection mode
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        var editorContent = document.querySelector('.editor-v2-content');
        if (editorContent) {
          var allBlocks = editorContent.querySelectorAll('.editor-v2-block');
          clearBlockSelection();
          for (var i = 0; i < allBlocks.length; i++) {
            var blockId = allBlocks[i].getAttribute('data-block-id');
            state.selectedBlocks.push(blockId);
            allBlocks[i].classList.add('block-selected');
          }
          state.blockSelectionMode = true;
          state.activeBlock = allBlocks[0]; // Set first block as active
          window.getSelection().removeAllRanges();
          updateBlockSelectionUI();
        }
        return;
      }
    });
  }

  // Expose block selection functions
  ERM.reportEditorV2 = ERM.reportEditorV2 || {};
  ERM.reportEditorV2.selectBlock = selectBlock;
  ERM.reportEditorV2.selectBlockRange = selectBlockRange;
  ERM.reportEditorV2.clearBlockSelection = clearBlockSelection;
  ERM.reportEditorV2.getSelectedBlocks = function() { return state.selectedBlocks; };
  ERM.reportEditorV2.getSelectedBlocksText = getSelectedBlocksText;
  ERM.reportEditorV2.deleteSelectedBlocks = deleteSelectedBlocks;

  /**
   * Initialize Editor
   */
  function init(containerId, report) {
    var container = document.getElementById(containerId);
    if (!container) {
      console.error('Editor container not found:', containerId);
      return;
    }

    state.currentReport = report || createNewReport();
    // Ensure format is set to v2
    if (!state.currentReport.format) {
      state.currentReport.format = 'v2';
    }
    state.firstTimeUser = !ERM.storage.get('editorV2Seen');

    renderEditor(container);
    bindEvents(container);

    // Update numbered list start values after initial render
    updateNumberedListStarts();

    // Load embed content for any saved embeds (heatmaps, KPI cards, etc.)
    loadAllEmbeds();

    // Save initial state for undo
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(function() {
      saveState();
      console.log('[V2] Initial state saved');
      // Check for page overflow on initial load
      updatePageAwareness();
    }, 100);

    // Mark as seen
    ERM.storage.set('editorV2Seen', true);

    // Trigger floating AI visibility update for report editor context
    if (ERM.floatingAI && typeof ERM.floatingAI.onViewChange === 'function') {
      setTimeout(function() {
        ERM.floatingAI.onViewChange();
      }, 200);
    }

    console.log('Report Editor V2 initialized');
  }

  /**
   * Create new empty report
   */
  function createNewReport() {
    return {
      id: 'report_' + Date.now(),
      title: 'Untitled Report',
      format: 'v2',
      content: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: ERM.state.user ? ERM.state.user.name : 'Unknown'
    };
  }

  /**
   * Render Editor
   */
  function renderEditor(container) {
    var report = state.currentReport;

    // Check if this is an empty/new report (single empty paragraph)
    var isNewReport = !report.content || report.content.length === 0 ||
      (report.content.length === 1 && (!report.content[0].content || report.content[0].content.trim() === ''));

    // Show slash hint for new reports OR if hint was never dismissed
    var slashHintDismissed = ERM.storage ? ERM.storage.get('slashHintDismissed') : false;
    // Always show hint for new reports, otherwise check if dismissed
    var showSlashHint = isNewReport || !slashHintDismissed;
    var slashHintHtml = !showSlashHint ? '' :
      '    <div class="editor-v2-hint" id="editor-hint">' +
      '      <span class="hint-icon">💡</span>' +
      '      <span class="hint-text">Type <kbd>/</kbd> for commands • Select text for <kbd>✨ AI</kbd> actions • Use <kbd>@</kbd> to mention team members</span>' +
      '      <button class="hint-dismiss" id="hint-dismiss" title="Dismiss">' +
      '        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '      </button>' +
      '    </div>';

    var html =
      '<div class="editor-v2">' +
      '  <div class="editor-v2-page-indicator" id="page-indicator">Page 1</div>' +
      '  <div class="editor-v2-header">' +
      '    <div class="editor-v2-header-left">' +
      '      <button class="editor-v2-back" id="editor-back" title="Back to reports">' +
      '        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>' +
      '      </button>' +
      '      <div class="editor-v2-title-wrap">' +
      '        <input type="text" class="editor-v2-title" id="editor-title" value="' + escapeHtml(report.title) + '" placeholder="Untitled Report">' +
      '      </div>' +
      '    </div>' +
      '    <div class="editor-v2-header-right">' +
      '      <span class="editor-v2-status" id="editor-status">Saved</span>' +
      '      <button class="editor-v2-btn editor-v2-btn-primary" id="editor-save">' +
      '        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>' +
      '        Save' +
      '      </button>' +
      '      <button class="editor-v2-btn-icon" id="editor-more" title="More options">' +
      '        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>' +
      '      </button>' +
      '      <div class="editor-more-dropdown" id="editor-more-dropdown">' +
      '        <button class="editor-more-item" id="more-export-pdf">' +
      '          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>' +
      '          Export PDF' +
      '        </button>' +
      '        <button class="editor-more-item" id="more-duplicate">' +
      '          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
      '          Duplicate' +
      '        </button>' +
      '        <div class="editor-more-divider"></div>' +
      '        <button class="editor-more-item editor-more-item-danger" id="more-delete">' +
      '          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>' +
      '          Delete Report' +
      '        </button>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
           slashHintHtml +
      '  <div class="editor-v2-body" id="editor-body">' +
      '    <div class="editor-v2-content" id="editor-content">' +
             renderContent(report.content) +
      '    </div>' +
           renderBottomHelpers(isNewReport) +
      '  </div>' +
      '</div>' +

      // Slash command menu (hidden by default) - no search, just scrollable list
      '<div class="slash-menu" id="slash-menu">' +
      '  <div class="slash-menu-content" id="slash-menu-content">' +
      '  </div>' +
      '</div>' +

      // NOTE: Selection toolbar is provided by report-editor.js
      // The toolbar has been restyled to be lightweight and includes Turn Into dropdown

      // Turn into dropdown (hidden by default) - used by existing toolbar
      '<div class="turn-into-dropdown" id="turn-into-dropdown">' +
      '  <div class="turn-into-dropdown-header">Turn into</div>' +
      '  <div class="turn-into-dropdown-items" id="turn-into-items"></div>' +
      '</div>' +

      // AI dropdown (hidden by default)
      '<div class="ai-dropdown" id="ai-dropdown">' +
      '  <div class="ai-dropdown-header">AI Actions</div>' +
      '  <div class="ai-dropdown-items" id="ai-dropdown-items"></div>' +
      '</div>' +

      // AI inline response (hidden by default) - Notion-style panel
      // STRUCTURE: Header (fixed) -> Content (scrolls) -> Actions (fixed at bottom)
      // Actions are OUTSIDE content div so they NEVER scroll
      '<div class="ai-inline-response" id="ai-inline-response">' +
      '  <div class="ai-inline-header">' +
      '    <div class="ai-inline-title">' +
      '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>' +
      '      <span>AI Suggestion</span>' +
      '    </div>' +
      '    <button class="ai-inline-close" id="ai-dismiss" title="Cancel">' +
      '      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '    </button>' +
      '  </div>' +
      '  <div class="ai-inline-content" id="ai-inline-content">' +
      '    <div class="ai-inline-text-wrap"></div>' +
      '  </div>' +
      '  <div class="ai-inline-actions">' +
      '    <button class="ai-inline-btn ai-inline-insert" id="ai-insert">Insert below</button>' +
      '    <button class="ai-inline-btn ai-inline-replace" id="ai-replace">Replace</button>' +
      '    <button class="ai-inline-btn ai-inline-retry" id="ai-retry">Try again</button>' +
      '  </div>' +
      '</div>' +

      // Inline comment (hidden by default)
      '<div class="inline-comment" id="inline-comment">' +
      '  <div class="inline-comment-thread" id="inline-comment-thread"></div>' +
      '  <div class="inline-comment-input-wrap">' +
      '    <textarea class="inline-comment-input" id="inline-comment-input" placeholder="Add a comment... Use @ to mention"></textarea>' +
      '    <button class="inline-comment-send" id="inline-comment-send">' +
      '      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
      '    </button>' +
      '  </div>' +
      '</div>' +

      // Mention dropdown (hidden by default)
      '<div class="mention-dropdown" id="mention-dropdown">' +
      '  <div class="mention-dropdown-header">Team Members</div>' +
      '  <div class="mention-dropdown-items" id="mention-dropdown-items"></div>' +
      '</div>' +

      // Embed picker (hidden by default)
      '<div class="embed-picker" id="embed-picker">' +
      '  <div class="embed-picker-header">' +
      '    <span class="embed-picker-icon" id="embed-picker-icon">🔥</span>' +
      '    <span class="embed-picker-title" id="embed-picker-title">Insert Heatmap</span>' +
      '  </div>' +
      '  <div class="embed-picker-body">' +
      '    <div class="embed-picker-section">' +
      '      <label class="embed-picker-label">Select Register</label>' +
      '      <div class="embed-picker-options" id="embed-register-options"></div>' +
      '    </div>' +
      '    <div class="embed-picker-section embed-picker-layout-section" id="embed-layout-section">' +
      '      <label class="embed-picker-label">Layout</label>' +
      '      <div class="embed-picker-options" id="embed-layout-options">' +
      '        <label class="embed-picker-option">' +
      '          <input type="radio" name="embed-layout" value="side-by-side" checked> Side by side' +
      '        </label>' +
      '        <label class="embed-picker-option">' +
      '          <input type="radio" name="embed-layout" value="stacked"> Stacked' +
      '        </label>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '  <div class="embed-picker-footer">' +
      '    <button class="embed-picker-btn embed-picker-cancel" id="embed-cancel">Cancel</button>' +
      '    <button class="embed-picker-btn embed-picker-insert" id="embed-insert">Insert</button>' +
      '  </div>' +
      '</div>' +

      // NOTE: Floating AI button removed - using global ERM.floatingAI instead
      // NOTE: Block controls (+ and drag) are now inline within each block
      // See renderBlockControls() - controls appear on hover via CSS

      // First-time tooltip
      (state.firstTimeUser ?
      '<div class="editor-tooltip" id="editor-tooltip">' +
      '  <div class="editor-tooltip-content">' +
      '    <span class="editor-tooltip-icon">💡</span>' +
      '    <div class="editor-tooltip-text">' +
      '      <strong>Tip:</strong> Type <kbd>/</kbd> anywhere to insert content, ask AI, or add comments' +
      '    </div>' +
      '    <button class="editor-tooltip-dismiss" id="tooltip-dismiss">Got it</button>' +
      '  </div>' +
      '</div>' : '');

    container.innerHTML = html;

    // Render slash menu items
    renderSlashMenu('');
    renderAIDropdown();
  }

  /**
   * Render content blocks
   */
  function renderContent(content) {
    if (!content || content.length === 0) {
      return renderEmptyState();
    }

    // Check if this is effectively empty (just one empty paragraph - common for new reports)
    if (content.length === 1) {
      var firstBlock = content[0];
      if (firstBlock.type === 'paragraph' && (!firstBlock.content || firstBlock.content.trim() === '')) {
        // Show the popup for new/empty reports, but still render the content
        setTimeout(function() {
          showHelperPopup();
        }, 500);
      }
    }

    // Organize blocks into pages, splitting at pagebreak blocks
    var pages = [];
    var currentPageBlocks = [];
    var pageNumber = 1;

    for (var i = 0; i < content.length; i++) {
      var block = content[i];

      // Ensure each block has a unique ID before rendering
      if (!block.id || block.id.indexOf('block_') !== 0 || block.id.match(/^block_\d+$/)) {
        block.id = 'block_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 5);
      }

      // Check if this is a page break
      if (block.type === 'pagebreak') {
        // End current page and start new one
        if (currentPageBlocks.length > 0) {
          pages.push({ blocks: currentPageBlocks, pageNumber: pageNumber });
          pageNumber++;
        }
        currentPageBlocks = [];
        // Don't add the pagebreak block itself - it's just a marker
        continue;
      }

      currentPageBlocks.push(block);
    }

    // Add the last page if it has content
    if (currentPageBlocks.length > 0) {
      pages.push({ blocks: currentPageBlocks, pageNumber: pageNumber });
    }

    // If no pages (all were pagebreaks), create empty first page
    if (pages.length === 0) {
      return renderEmptyState();
    }

    // Render each page
    var html = '';
    for (var p = 0; p < pages.length; p++) {
      var page = pages[p];
      var pageId = 'page_' + p;

      html += '<div class="editor-v2-page" data-page-number="' + page.pageNumber + '" id="' + pageId + '">';

      // Add page fill indicator (visual bar showing how full the page is)
      html += '<div class="page-fill-indicator"><div class="page-fill-indicator-bar" style="height: 0%;"></div></div>';

      // Add overflow zone (subtle gradient at page bottom)
      html += '<div class="page-overflow-zone"></div>';

      // Render blocks in this page
      for (var b = 0; b < page.blocks.length; b++) {
        html += renderBlock(page.blocks[b], b);
      }

      html += '</div>';
    }

    return html;
  }

  /**
   * Render empty state - wrapped in a page container
   */
  function renderEmptyState() {
    // Use unique ID for empty state block to prevent collisions
    var blockId = 'block_' + Date.now() + '_init_' + Math.random().toString(36).substr(2, 5);
    var controls = renderBlockControls(blockId);

    // Show subtle popup notification after render
    setTimeout(function() {
      showHelperPopup();
    }, 500);

    return (
      '<div class="editor-v2-page" data-page-number="1" id="page_0">' +
      '  <div class="editor-v2-empty">' +
      '    <div class="editor-v2-block" data-block-id="' + blockId + '" data-block-type="paragraph">' +
      controls +
      '      <div class="block-element editor-v2-paragraph"><div class="block-content" contenteditable="true" data-placeholder="Start writing or type / to insert content..."></div></div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  /**
   * Show subtle popup notification pointing to helpers
   */
  function showHelperPopup() {
    // Check if already dismissed
    var helpersHidden = state.currentReport && state.currentReport.helpersHidden;
    if (helpersHidden) return;

    // Don't show if already visible
    if (document.getElementById('helper-popup')) return;

    // UX Rule: Only one teaching surface at a time
    // Temporarily hide the floating AI button to avoid visual clutter
    var floatingAiContainer = document.querySelector('.floating-ai-container');
    if (floatingAiContainer) {
      floatingAiContainer.style.opacity = '0';
      floatingAiContainer.style.pointerEvents = 'none';
      floatingAiContainer.style.transition = 'opacity 0.2s ease';
    }

    // Create popup
    var popup = document.createElement('div');
    popup.id = 'helper-popup';
    popup.className = 'helper-popup';
    popup.innerHTML =
      '<div class="helper-popup-content">' +
      '  <span class="helper-popup-icon">✨</span>' +
      '  <span class="helper-popup-text">Quick-start options are available below</span>' +
      '  <button class="helper-popup-dismiss" id="helper-popup-dismiss">×</button>' +
      '</div>';

    document.body.appendChild(popup);

    // Auto-hide after 5 seconds
    setTimeout(function() {
      hideHelperPopup();
    }, 5000);

    // Dismiss on click
    var dismissBtn = document.getElementById('helper-popup-dismiss');
    if (dismissBtn) {
      dismissBtn.addEventListener('click', function() {
        hideHelperPopup();
      });
    }

    // Click popup text to scroll to helpers
    var popupContent = popup.querySelector('.helper-popup-content');
    if (popupContent) {
      popupContent.addEventListener('click', function(e) {
        if (e.target.id !== 'helper-popup-dismiss') {
          var helpers = document.getElementById('editor-bottom-helpers');
          if (helpers) {
            helpers.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          hideHelperPopup();
        }
      });
    }
  }

  /**
   * Hide helper popup
   */
  function hideHelperPopup() {
    var popup = document.getElementById('helper-popup');
    if (popup) {
      popup.classList.add('hiding');
      setTimeout(function() {
        if (popup.parentNode) popup.remove();
      }, 300);
    }

    // Restore the floating AI button
    var floatingAiContainer = document.querySelector('.floating-ai-container');
    if (floatingAiContainer) {
      floatingAiContainer.style.opacity = '';
      floatingAiContainer.style.pointerEvents = '';
    }
  }

  /**
   * ===========================================
   * PAGE OVERFLOW SYSTEM (Word-like behavior)
   * Automatic content flow to next page when full
   * ===========================================
   */

  // Page overflow state
  // Professional margins: 25mm top/bottom (94px each), 25mm left (94px), 20mm right (75px)
  // A4 height at 96dpi: 297mm = 1123px
  // Content height: 1123 - 94 - 94 = 935px
  var pageAwareness = {
    A4_HEIGHT: 1123, // A4 height in pixels at 96dpi
    A4_CONTENT_HEIGHT: 935, // A4 height minus padding (94px top + 94px bottom)
    // Minimum block heights for smart page breaks (from checklist)
    MIN_HEADING_HEIGHT: 48,
    MIN_PARAGRAPH_HEIGHT: 32,
    MIN_LIST_ITEM_HEIGHT: 28,
    MIN_TABLE_HEIGHT: 96, // Header + 1 row minimum
    OVERFLOW_BUFFER: 30, // Small buffer to prevent oscillation
    BOUNDARY_WARNING_ZONE: 0.90, // Show warning when 90% full
    dismissedPages: {}, // Track dismissed hints per page
    lastCheckTime: 0,
    debounceTimeout: null,
    isProcessingOverflow: false, // Prevent recursive overflow handling
    lastOverflowTime: 0, // Timestamp of last overflow operation
    overflowCooldown: 30 // Minimum ms between overflow operations
  };

  /**
   * Update page awareness - check all pages for content overflow
   */
  function updatePageAwareness() {
    if (pageAwareness.isProcessingOverflow) return;

    var pages = document.querySelectorAll('.editor-v2-page');
    if (!pages.length) return;

    for (var i = 0; i < pages.length; i++) {
      var page = pages[i];

      // Skip cover pages
      if (page.classList.contains('editor-v2-cover-page') ||
          page.querySelector('.editor-v2-cover-block, [data-block-type="cover"]')) {
        continue;
      }

      // Ensure page has fill indicator
      if (!page.querySelector('.page-fill-indicator')) {
        var fillIndicator = document.createElement('div');
        fillIndicator.className = 'page-fill-indicator';
        fillIndicator.innerHTML = '<div class="page-fill-indicator-bar" style="height: 0%;"></div>';
        page.insertBefore(fillIndicator, page.firstChild);
      }

      // Check for overflow on this page
      handlePageOverflow(page);

      // Update visual fill indicator
      updatePageFillIndicator(page);
    }
  }

  /**
   * Handle automatic page overflow - move blocks to next page when content exceeds limit
   * Uses hysteresis to prevent oscillation (content moving back and forth)
   * @param {HTMLElement} page - The page to check
   * @returns {boolean} True if content was moved
   */
  function handlePageOverflow(page) {
    if (!page) return false;

    // Skip pages that contain a cover block - cover pages have their own layout
    if (page.querySelector('.editor-v2-cover-block, [data-block-type="cover"]')) {
      return false;
    }

    // Check cooldown to prevent rapid oscillation
    var now = Date.now();
    if (now - pageAwareness.lastOverflowTime < pageAwareness.overflowCooldown) {
      return false;
    }

    // Get ONLY direct child blocks of this page (not nested blocks or indicator elements)
    var allChildren = page.children;
    var blocks = [];
    for (var c = 0; c < allChildren.length; c++) {
      var child = allChildren[c];
      if (child.classList.contains('editor-v2-block')) {
        blocks.push(child);
      }
    }

    if (!blocks.length) return false;

    var maxHeight = pageAwareness.A4_CONTENT_HEIGHT;
    var cumulativeHeight = 0;
    var overflowStartIndex = -1;

    // Find the first block that causes overflow
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var blockHeight = block.offsetHeight + 4; // Include margin
      cumulativeHeight += blockHeight;

      if (cumulativeHeight > maxHeight) {
        overflowStartIndex = i;
        break;
      }
    }

    // No overflow - page content fits
    if (overflowStartIndex === -1) {
      // Check if there's not enough space for another block (smart prevention)
      var remainingSpace = maxHeight - cumulativeHeight;
      if (remainingSpace < pageAwareness.MIN_PARAGRAPH_HEIGHT && blocks.length > 0) {
        // Very little space left - next block will likely overflow
        // But don't force a break yet, let the next insertion trigger it
      }
      return false;
    }

    // ORPHAN HEADING PREVENTION: If the block before overflow is a heading,
    // move the heading to the next page too (headings must have content below)
    if (overflowStartIndex > 0) {
      var prevBlock = blocks[overflowStartIndex - 1];
      var prevType = prevBlock.getAttribute('data-block-type');
      if (prevType === 'heading1' || prevType === 'heading2' || prevType === 'heading3') {
        // Check if there's enough content above to justify moving the heading
        var heightWithoutHeading = cumulativeHeight - prevBlock.offsetHeight - 4;
        if (heightWithoutHeading > pageAwareness.MIN_PARAGRAPH_HEIGHT * 2) {
          // Move the heading with the content
          overflowStartIndex = overflowStartIndex - 1;
        }
      }
    }

    // Prevent recursive processing
    pageAwareness.isProcessingOverflow = true;
    pageAwareness.lastOverflowTime = now;

    try {
      // Collect blocks to move (from overflow point to end of page)
      var blocksToMove = [];
      for (var j = overflowStartIndex; j < blocks.length; j++) {
        blocksToMove.push(blocks[j]);
      }

      console.log('[PageOverflow] Overflow detected! Moving', blocksToMove.length, 'blocks to next page. Content height:', cumulativeHeight, '> Max:', maxHeight);

      // Find or create the next page
      var nextPage = getOrCreateNextPage(page);

      if (nextPage && blocksToMove.length > 0) {
        // Save cursor position if editing in any block being moved
        var cursorInfo = saveCursorPosition(blocksToMove);

        // Move blocks to the beginning of the next page (AFTER any indicator elements)
        // Find first block in next page to insert before
        var nextChildren = nextPage.children;
        var firstBlockInNext = null;
        for (var n = 0; n < nextChildren.length; n++) {
          if (nextChildren[n].classList.contains('editor-v2-block')) {
            firstBlockInNext = nextChildren[n];
            break;
          }
        }

        for (var k = 0; k < blocksToMove.length; k++) {
          var blockToMove = blocksToMove[k];
          if (firstBlockInNext) {
            nextPage.insertBefore(blockToMove, firstBlockInNext);
          } else {
            nextPage.appendChild(blockToMove);
          }
        }

        // Restore cursor if we moved the active block
        if (cursorInfo) {
          restoreCursorPosition(cursorInfo);
        }

        // Update page numbers
        updatePageNumbers();

        markDirty();
        return true;
      }
    } finally {
      pageAwareness.isProcessingOverflow = false;
    }

    return false;
  }

  /**
   * Get the next page or create one if it doesn't exist
   * @param {HTMLElement} currentPage - The current page
   * @returns {HTMLElement} The next page element
   */
  function getOrCreateNextPage(currentPage) {
    var nextPage = currentPage.nextElementSibling;

    // Check if next sibling is actually a page
    if (nextPage && nextPage.classList.contains('editor-v2-page')) {
      return nextPage;
    }

    // Create a new page
    var allPages = document.querySelectorAll('.editor-v2-page');
    var newPageNumber = allPages.length + 1;
    var newPageId = 'page_' + allPages.length;

    console.log('[PageOverflow] Creating new page:', newPageId);

    var newPageHtml =
      '<div class="editor-v2-page" data-page-number="' + newPageNumber + '" id="' + newPageId + '">' +
      '  <div class="page-fill-indicator"><div class="page-fill-indicator-bar" style="height: 0%;"></div></div>' +
      '  <div class="page-overflow-zone"></div>' +
      '</div>';

    currentPage.insertAdjacentHTML('afterend', newPageHtml);

    return document.getElementById(newPageId);
  }

  /**
   * Save cursor position before moving blocks
   * @param {Array} blocksToMove - Blocks being moved
   * @returns {Object|null} Cursor info or null
   */
  function saveCursorPosition(blocksToMove) {
    var selection = window.getSelection();
    if (!selection.rangeCount) return null;

    var range = selection.getRangeAt(0);
    var activeElement = document.activeElement;

    // Check if cursor is in any of the blocks being moved
    for (var i = 0; i < blocksToMove.length; i++) {
      if (blocksToMove[i].contains(activeElement) || blocksToMove[i].contains(range.startContainer)) {
        return {
          block: blocksToMove[i],
          startContainer: range.startContainer,
          startOffset: range.startOffset,
          endContainer: range.endContainer,
          endOffset: range.endOffset,
          activeElement: activeElement
        };
      }
    }

    return null;
  }

  /**
   * Restore cursor position after moving blocks
   * @param {Object} cursorInfo - Saved cursor info
   */
  function restoreCursorPosition(cursorInfo) {
    if (!cursorInfo) return;

    setTimeout(function() {
      try {
        if (cursorInfo.activeElement && cursorInfo.activeElement.focus) {
          cursorInfo.activeElement.focus();
        }

        var selection = window.getSelection();
        var range = document.createRange();

        range.setStart(cursorInfo.startContainer, cursorInfo.startOffset);
        range.setEnd(cursorInfo.endContainer, cursorInfo.endOffset);

        selection.removeAllRanges();
        selection.addRange(range);
      } catch (e) {
        console.log('[PageOverflow] Could not restore cursor:', e);
      }
    }, 10);
  }

  /**
   * Update the visual fill indicator for a page
   */
  function updatePageFillIndicator(page) {
    if (!page) return;

    var pageId = page.id;
    var contentHeight = getPageContentHeight(page);
    var maxHeight = pageAwareness.A4_CONTENT_HEIGHT;
    var fillPercent = Math.min((contentHeight / maxHeight) * 100, 100);

    // Update fill indicator bar
    var fillBar = page.querySelector('.page-fill-indicator-bar');
    if (fillBar) {
      fillBar.style.height = fillPercent + '%';

      // Update color class based on fill level
      fillBar.classList.remove('fill-normal', 'fill-warning', 'fill-full');
      if (fillPercent >= 95) {
        fillBar.classList.add('fill-full');
      } else if (fillPercent >= 85) {
        fillBar.classList.add('fill-warning');
      } else {
        fillBar.classList.add('fill-normal');
      }
    }

    // Toggle near-boundary class for overflow zone visibility
    if (fillPercent >= pageAwareness.BOUNDARY_WARNING_ZONE * 100) {
      page.classList.add('near-boundary');
    } else {
      page.classList.remove('near-boundary');
    }
  }

  /**
   * Get the actual content height within a page
   * Only counts direct child blocks, not nested elements
   */
  function getPageContentHeight(page) {
    // Get ONLY direct child blocks
    var allChildren = page.children;
    var totalHeight = 0;

    for (var i = 0; i < allChildren.length; i++) {
      var child = allChildren[i];
      if (child.classList.contains('editor-v2-block')) {
        totalHeight += child.offsetHeight + 4; // 4px margin
      }
    }

    return totalHeight;
  }

  /**
   * Show a brief toast notification
   */
  function showToast(message) {
    var toast = document.createElement('div');
    toast.className = 'editor-toast';
    toast.textContent = message;
    toast.style.cssText = 'position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); ' +
      'background: #1f2937; color: white; padding: 10px 20px; border-radius: 6px; ' +
      'font-size: 13px; z-index: 10001; opacity: 0; transition: opacity 0.2s ease;';

    document.body.appendChild(toast);

    setTimeout(function() { toast.style.opacity = '1'; }, 50);
    setTimeout(function() {
      toast.style.opacity = '0';
      setTimeout(function() { toast.remove(); }, 200);
    }, 2000);
  }

  /**
   * Debounced page awareness update
   * Called on content changes - handles overflow during typing
   */
  function schedulePageAwarenessUpdate(newBlock) {
    if (pageAwareness.debounceTimeout) {
      clearTimeout(pageAwareness.debounceTimeout);
    }
    pageAwareness.debounceTimeout = setTimeout(function() {
      var blockToCheck = newBlock || state.activeBlock;
      if (blockToCheck) {
        autoPaginate(blockToCheck);
      }
      updatePageAwareness();
    }, 150);
  }

  /**
   * Explicitly trigger underflow check
   * Called after block deletion or when user explicitly requests it
   */
  function schedulePageUnderflowCheck() {
    setTimeout(function() {
      handlePageUnderflow();
    }, 500); // Delay to let overflow settle first
  }

  /**
   * Handle reverse flow - pull content from next page when current page has room
   */
  function handlePageUnderflow() {
    if (pageAwareness.isProcessingOverflow) return;

    var pages = document.querySelectorAll('.editor-v2-page');
    if (pages.length < 2) return;

    var now = Date.now();

    try {
      var contentMoved = false;

      // Check each page (except the last) to see if it can accept content from next page
      for (var i = 0; i < pages.length - 1; i++) {
        var currentPage = pages[i];
        var nextPage = pages[i + 1];

        // Skip if either page is a cover page
        if (currentPage.querySelector('.editor-v2-cover-block, [data-block-type="cover"]') ||
            nextPage.querySelector('.editor-v2-cover-block, [data-block-type="cover"]')) {
          continue;
        }

        var currentHeight = getPageContentHeight(currentPage);
        var maxHeight = pageAwareness.A4_CONTENT_HEIGHT;
        // Use larger buffer for underflow to prevent oscillation
        // Content must fit with OVERFLOW_BUFFER extra space to prevent immediate re-overflow
        var safeMaxHeight = maxHeight - pageAwareness.OVERFLOW_BUFFER;
        var availableSpace = safeMaxHeight - currentHeight;

        // If there's meaningful space available (block must fit with buffer)
        if (availableSpace > 0) {
          // Get direct child blocks from next page
          var nextChildren = nextPage.children;
          var nextPageBlocks = [];
          for (var nc = 0; nc < nextChildren.length; nc++) {
            if (nextChildren[nc].classList.contains('editor-v2-block')) {
              nextPageBlocks.push(nextChildren[nc]);
            }
          }

          if (nextPageBlocks.length > 0) {
            var firstBlock = nextPageBlocks[0];
            var firstBlockHeight = firstBlock.offsetHeight + 4;

            // If the first block from next page fits in available space (with buffer)
            if (firstBlockHeight <= availableSpace) {
              console.log('[PageUnderflow] Moving block from page', i + 2, 'to page', i + 1);

              // Move the block to the end of current page
              currentPage.appendChild(firstBlock);
              contentMoved = true;
              pageAwareness.lastOverflowTime = now;

              // Check if next page is now empty of blocks
              var remainingChildren = nextPage.children;
              var hasBlocks = false;
              for (var rc = 0; rc < remainingChildren.length; rc++) {
                if (remainingChildren[rc].classList.contains('editor-v2-block')) {
                  hasBlocks = true;
                  break;
                }
              }

              if (!hasBlocks && pages.length > 1) {
                console.log('[PageUnderflow] Removing empty page', i + 2);
                nextPage.remove();
                updatePageNumbers();
              }

              break; // Process one move at a time, then re-check
            }
          }
        }
      }

      // If we moved content, schedule another check (with longer delay)
      if (contentMoved) {
        markDirty();
        setTimeout(function() {
          pageAwareness.isProcessingOverflow = false;
          handlePageUnderflow();
        }, 200); // Longer delay to prevent rapid oscillation
        return;
      }

      // Clean up empty pages at the end (except page 1)
      cleanupEmptyPages();

    } finally {
      pageAwareness.isProcessingOverflow = false;
    }
  }

  /**
   * Remove empty pages (except the first page)
   */
  function cleanupEmptyPages() {
    var pages = document.querySelectorAll('.editor-v2-page');

    // Work backwards to safely remove pages
    for (var i = pages.length - 1; i > 0; i--) {
      var page = pages[i];

      // Never remove cover pages
      if (page.querySelector('.editor-v2-cover-block, [data-block-type="cover"]')) {
        continue;
      }

      // Use direct child selection to avoid counting nested elements
      var allChildren = page.children;
      var hasBlocks = false;
      for (var c = 0; c < allChildren.length; c++) {
        if (allChildren[c].classList.contains('editor-v2-block')) {
          hasBlocks = true;
          break;
        }
      }

      if (!hasBlocks) {
        console.log('[PageOverflow] Removing empty page', i + 1);
        page.remove();
      }
    }

    updatePageNumbers();
  }

  /**
   * ===========================================
   * END PAGE OVERFLOW SYSTEM
   * ===========================================
   */

  /**
   * Render bottom helpers for new/empty reports
   * These help users set up professional report structure quickly
   * They disappear once meaningful content exists
   */
  function renderBottomHelpers(isNewReport) {
    // Check if helpers were permanently hidden for this report
    var helpersHidden = state.currentReport && state.currentReport.helpersHidden;
    if (helpersHidden) return '';

    // Check if there's already a cover page
    var hasCoverPage = false;
    if (state.currentReport && state.currentReport.content) {
      for (var i = 0; i < state.currentReport.content.length; i++) {
        if (state.currentReport.content[i].type === 'cover') {
          hasCoverPage = true;
          break;
        }
      }
    }

    // Check if report has meaningful content (2+ non-empty blocks)
    var nonEmptyBlocks = 0;
    if (state.currentReport && state.currentReport.content) {
      for (var j = 0; j < state.currentReport.content.length; j++) {
        var block = state.currentReport.content[j];
        if (block.type === 'cover' || block.type === 'divider' ||
            (block.content && block.content.trim() !== '')) {
          nonEmptyBlocks++;
        }
      }
    }

    // Hide helpers if cover page exists OR 2+ non-empty blocks
    if (hasCoverPage || nonEmptyBlocks >= 2) return '';

    // Notion-style centered helper cards
    return (
      '<div class="editor-bottom-helpers" id="editor-bottom-helpers">' +
      '  <div class="helpers-inner">' +
      '    <div class="helpers-header">' +
      '      <span class="helpers-icon">✨</span>' +
      '      <span class="helpers-title">Get started with your report</span>' +
      '    </div>' +
      '    <div class="helpers-grid">' +
      '      <button class="helper-card helper-card-primary" id="helper-cover-page">' +
      '        <div class="helper-card-icon">' +
      '          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><path d="M9 9v12"/></svg>' +
      '        </div>' +
      '        <div class="helper-card-content">' +
      '          <div class="helper-card-title">Cover page</div>' +
      '          <div class="helper-card-desc">Add title, metadata & branding</div>' +
      '        </div>' +
      '      </button>' +
      '      <button class="helper-card" id="helper-section">' +
      '        <div class="helper-card-icon">' +
      '          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h8"/><path d="M4 18V6"/><path d="M12 18V6"/><path d="M17 12h3"/></svg>' +
      '        </div>' +
      '        <div class="helper-card-content">' +
      '          <div class="helper-card-title">Section heading</div>' +
      '          <div class="helper-card-desc">Start a new section</div>' +
      '        </div>' +
      '      </button>' +
      '      <button class="helper-card" id="helper-key-points">' +
      '        <div class="helper-card-icon">' +
      '          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="1.5" fill="currentColor"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="5" cy="18" r="1.5" fill="currentColor"/></svg>' +
      '        </div>' +
      '        <div class="helper-card-content">' +
      '          <div class="helper-card-title">Key points</div>' +
      '          <div class="helper-card-desc">Add bullet list scaffold</div>' +
      '        </div>' +
      '      </button>' +
      '    </div>' +
      '    <div class="helpers-footer">' +
      '      <span class="helpers-hint">Use <kbd>/</kbd> to insert charts, tables & AI content</span>' +
      '      <button class="helper-dismiss" id="helper-hide">Dismiss</button>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  /**
   * Check and update helper visibility based on content
   */
  function updateHelperVisibility() {
    var helpersEl = document.getElementById('editor-bottom-helpers');
    if (!helpersEl) return;

    // Check if there's a cover page
    var coverBlocks = document.querySelectorAll('[data-block-type="cover"]');
    if (coverBlocks.length > 0) {
      helpersEl.style.display = 'none';
      return;
    }

    // Count non-empty blocks
    var blocks = document.querySelectorAll('.editor-v2-content .editor-v2-block');
    var nonEmptyCount = 0;
    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var type = block.getAttribute('data-block-type');
      if (type === 'cover' || type === 'divider') {
        nonEmptyCount++;
        continue;
      }
      var editable = block.querySelector('[contenteditable="true"]');
      if (editable && editable.textContent.trim() !== '') {
        nonEmptyCount++;
      }
    }

    // Hide if 2+ meaningful blocks
    if (nonEmptyCount >= 2) {
      helpersEl.style.display = 'none';
    }
  }

  /**
   * Hide helpers permanently for this report
   */
  function hideHelpersPermanently() {
    var helpersEl = document.getElementById('editor-bottom-helpers');
    if (helpersEl) {
      helpersEl.classList.add('hiding');
      setTimeout(function() {
        helpersEl.remove();
      }, 200);
    }
    // Mark as hidden in report state
    if (state.currentReport) {
      state.currentReport.helpersHidden = true;
      markDirty();
    }
  }

  /**
   * Bind helper button events (both bottom and inline helpers)
   */
  function bindHelperButtons() {
    // Bottom helpers - Create cover page
    var coverBtn = document.getElementById('helper-cover-page');
    if (coverBtn) {
      coverBtn.addEventListener('click', function() {
        insertCoverPage();
        hideHelpersPermanently();
      });
    }

    // Bottom helpers - Insert section
    var sectionBtn = document.getElementById('helper-section');
    if (sectionBtn) {
      sectionBtn.addEventListener('click', function() {
        insertSectionHeading();
        updateHelperVisibility();
      });
    }

    // Bottom helpers - Add key points
    var keyPointsBtn = document.getElementById('helper-key-points');
    if (keyPointsBtn) {
      keyPointsBtn.addEventListener('click', function() {
        insertKeyPoints();
        updateHelperVisibility();
      });
    }

    // Bottom helpers - Hide
    var hideBtn = document.getElementById('helper-hide');
    if (hideBtn) {
      hideBtn.addEventListener('click', function() {
        hideHelpersPermanently();
      });
    }

    // INLINE helpers (inside page for empty reports)
    // Inline - Create cover page
    var inlineCoverBtn = document.getElementById('inline-helper-cover-page');
    if (inlineCoverBtn) {
      inlineCoverBtn.addEventListener('click', function() {
        insertCoverPage();
        hideInlineHelpers();
      });
    }

    // Inline - Insert section
    var inlineSectionBtn = document.getElementById('inline-helper-section');
    if (inlineSectionBtn) {
      inlineSectionBtn.addEventListener('click', function() {
        insertSectionHeading();
        hideInlineHelpers();
      });
    }

    // Inline - Add key points
    var inlineKeyPointsBtn = document.getElementById('inline-helper-key-points');
    if (inlineKeyPointsBtn) {
      inlineKeyPointsBtn.addEventListener('click', function() {
        insertKeyPoints();
        hideInlineHelpers();
      });
    }

    // Inline - Hide
    var inlineHideBtn = document.getElementById('inline-helper-hide');
    if (inlineHideBtn) {
      inlineHideBtn.addEventListener('click', function() {
        hideInlineHelpers();
      });
    }
  }

  /**
   * Hide inline helpers (with animation)
   */
  function hideInlineHelpers() {
    var inlineHelpersEl = document.getElementById('editor-inline-helpers');
    if (inlineHelpersEl) {
      inlineHelpersEl.classList.add('hiding');
      setTimeout(function() {
        inlineHelpersEl.remove();
      }, 200);
    }
    // Also hide bottom helpers if present
    var bottomHelpersEl = document.getElementById('editor-bottom-helpers');
    if (bottomHelpersEl) {
      bottomHelpersEl.classList.add('hiding');
      setTimeout(function() {
        bottomHelpersEl.remove();
      }, 200);
    }
    // Mark as hidden in report state
    if (state.currentReport) {
      state.currentReport.helpersHidden = true;
      markDirty();
    }
  }

  /**
   * Insert cover page at the top of the document
   * Cover page is wrapped in its own .editor-v2-page container to keep it isolated
   * from the page overflow system
   */
  function insertCoverPage() {
    var editorContent = document.getElementById('editor-content');
    if (!editorContent) return;

    var blockId = 'block_cover_' + Date.now();
    var coverBlock = {
      id: blockId,
      type: 'cover',
      coverTitle: '',
      coverSubtitle: '',
      coverImage: '',
      organization: '',
      reportingPeriod: '',
      reportDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      preparedBy: ERM.state && ERM.state.user ? ERM.state.user.name : '',
      classification: ''
    };

    var coverHtml = renderCoverPage(coverBlock, blockId);

    // Wrap cover in its own page container (isolated from overflow system)
    var pageId = 'page_cover_' + Date.now();
    var html = '<div class="editor-v2-page editor-v2-cover-page" data-page-number="cover" id="' + pageId + '">' +
      coverHtml +
      '</div>';

    // Insert at the beginning (before first page)
    editorContent.insertAdjacentHTML('afterbegin', html);

    // Focus the title input
    var titleInput = editorContent.querySelector('.cover-title-input');
    if (titleInput) {
      titleInput.focus();
    }

    // Bind cover page events
    bindCoverPageEvents(blockId);

    // Update page numbers (cover page is page 0, others start at 1)
    updatePageNumbers();

    markDirty();
    syncContentFromDOM();
  }

  /**
   * Insert section heading
   */
  function insertSectionHeading() {
    var editorContent = document.getElementById('editor-content');
    if (!editorContent) return;

    // Find last block or insert at end
    var lastBlock = editorContent.querySelector('.editor-v2-block:last-child');

    var blockId = 'block_' + Date.now() + '_section';
    var newBlock = {
      id: blockId,
      type: 'heading2',
      content: ''
    };

    var html = renderBlock(newBlock, 0);

    if (lastBlock) {
      lastBlock.insertAdjacentHTML('afterend', html);
    } else {
      editorContent.innerHTML = html;
    }

    // Focus the new heading
    var newEl = document.querySelector('[data-block-id="' + blockId + '"]');
    if (newEl) {
      var editable = newEl.querySelector('[contenteditable="true"]');
      if (editable) {
        editable.focus();
      }
      // Check for page overflow after block insertion
      setTimeout(function() {
        schedulePageAwarenessUpdate(newEl);
      }, 10);
    }

    markDirty();
  }

  /**
   * Insert key points (bullet list)
   */
  function insertKeyPoints() {
    var editorContent = document.getElementById('editor-content');
    if (!editorContent) return;

    // Find last block
    var lastBlock = editorContent.querySelector('.editor-v2-block:last-child');

    // Create 3 bullet points
    var html = '';
    for (var i = 0; i < 3; i++) {
      var blockId = 'block_' + Date.now() + '_bullet_' + i;
      var newBlock = {
        id: blockId,
        type: 'bullet',
        content: ''
      };
      html += renderBlock(newBlock, i);
    }

    if (lastBlock) {
      lastBlock.insertAdjacentHTML('afterend', html);
    } else {
      editorContent.innerHTML = html;
    }

    // Focus the first bullet
    var firstBullet = editorContent.querySelector('.editor-v2-block[data-block-type="bullet"] li[contenteditable="true"]');
    if (firstBullet) {
      firstBullet.focus();
    }

    markDirty();
    updateNumberedListStarts();

    // Check for page overflow after inserting bullets
    var lastBullet = editorContent.querySelector('.editor-v2-block[data-block-type="bullet"]:last-of-type');
    if (lastBullet) {
      setTimeout(function() {
        schedulePageAwarenessUpdate(lastBullet);
      }, 10);
    }
  }

  /**
   * Insert chart placeholder
   */
  function insertChartPlaceholder() {
    var editorContent = document.getElementById('editor-content');
    if (!editorContent) return;

    var lastBlock = editorContent.querySelector('.editor-v2-block:last-child');

    var blockId = 'block_chart_' + Date.now();
    var chartBlock = {
      id: blockId,
      type: 'chart-placeholder',
      chartType: 'bar',
      caption: ''
    };

    var html = renderChartPlaceholder(chartBlock, blockId);

    if (lastBlock) {
      lastBlock.insertAdjacentHTML('afterend', html);
    } else {
      editorContent.innerHTML = html;
    }

    markDirty();

    // Check for page overflow after inserting chart placeholder
    var newEl = document.querySelector('[data-block-id="' + blockId + '"]');
    if (newEl) {
      setTimeout(function() {
        schedulePageAwarenessUpdate(newEl);
      }, 10);
    }
  }

  /**
   * Bind cover page specific events
   */
  function bindCoverPageEvents(blockId) {
    var coverBlock = document.querySelector('[data-block-id="' + blockId + '"]');
    if (!coverBlock) return;

    // Input/select change handlers for cover metadata
    var inputs = coverBlock.querySelectorAll('input[data-field], select[data-field]');
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener('input', function() {
        markDirty();
      });
      inputs[i].addEventListener('change', function() {
        markDirty();
      });
    }

    // Logo upload placeholder click
    var imagePlaceholder = coverBlock.querySelector('.cover-logo-placeholder');
    if (imagePlaceholder) {
      imagePlaceholder.addEventListener('click', function() {
        showCoverImageUpload(blockId);
      });
    }

    // Logo remove button
    var removeBtn = coverBlock.querySelector('.cover-logo-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', function() {
        removeCoverImage(blockId);
      });
    }

    // Double-click on existing logo to replace it
    var logoImg = coverBlock.querySelector('.cover-logo');
    if (logoImg) {
      logoImg.style.cursor = 'pointer';
      logoImg.title = 'Double-click to replace logo';
      logoImg.addEventListener('dblclick', function() {
        showCoverImageUpload(blockId);
      });
    }
  }

  /**
   * Show cover image upload modal
   */
  function showCoverImageUpload(blockId) {
    // Create file input
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';

    fileInput.addEventListener('change', function(e) {
      var file = e.target.files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function(event) {
          setCoverImage(blockId, event.target.result);
        };
        reader.readAsDataURL(file);
      }
      fileInput.remove();
    });

    document.body.appendChild(fileInput);
    fileInput.click();
  }

  /**
   * Set cover image (logo)
   */
  function setCoverImage(blockId, imageUrl) {
    var coverBlock = document.querySelector('[data-block-id="' + blockId + '"]');
    if (!coverBlock) return;

    var placeholder = coverBlock.querySelector('.cover-logo-placeholder');
    if (placeholder) {
      var imageHtml =
        '<div class="cover-logo-container">' +
        '  <img src="' + imageUrl + '" alt="Logo" class="cover-logo">' +
        '  <button class="cover-logo-remove" title="Remove logo">' +
        '    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '  </button>' +
        '</div>';

      placeholder.outerHTML = imageHtml;

      // Rebind remove button
      var removeBtn = coverBlock.querySelector('.cover-logo-remove');
      if (removeBtn) {
        removeBtn.addEventListener('click', function() {
          removeCoverImage(blockId);
        });
      }

      // Add double-click on logo to replace it
      var logoImg = coverBlock.querySelector('.cover-logo');
      if (logoImg) {
        logoImg.style.cursor = 'pointer';
        logoImg.title = 'Double-click to replace logo';
        logoImg.addEventListener('dblclick', function() {
          showCoverImageUpload(blockId);
        });
      }
    }

    markDirty();
  }

  /**
   * Remove cover image (logo)
   */
  function removeCoverImage(blockId) {
    var coverBlock = document.querySelector('[data-block-id="' + blockId + '"]');
    if (!coverBlock) return;

    var imageContainer = coverBlock.querySelector('.cover-logo-container');
    if (imageContainer) {
      var placeholderHtml =
        '<div class="cover-logo-placeholder" id="cover-image-upload-' + blockId + '">' +
        '  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
        '    <rect x="3" y="3" width="18" height="18" rx="2"/>' +
        '    <circle cx="8.5" cy="8.5" r="1.5"/>' +
        '    <path d="M21 15l-5-5L5 21"/>' +
        '  </svg>' +
        '  <span>Add Logo</span>' +
        '</div>';

      imageContainer.outerHTML = placeholderHtml;

      // Rebind placeholder click
      var placeholder = coverBlock.querySelector('.cover-logo-placeholder');
      if (placeholder) {
        placeholder.addEventListener('click', function() {
          showCoverImageUpload(blockId);
        });
      }
    }

    markDirty();
  }

  /**
   * Parse pasted content (HTML or plain text) into block structures
   * BLOCK MODEL: Normalizes external content to our block schema
   * - Extracts structure: headings, paragraphs, lists, tables
   * - Each list item = its own block (Option A - true Notion model)
   * - Ignores fonts, colors, margins, inline styles
   */
  function parsePastedContentToBlocks(html, plainText) {
    var blocks = [];

    // Helper to process inline content (preserve bold, italic only)
    function processInline(text) {
      if (!text) return '';
      // Basic HTML entity escaping for plain text
      var s = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return s;
    }

    // Helper to extract inline formatting from HTML element
    function extractInlineContent(el) {
      if (!el) return '';
      // Clone to avoid modifying original
      var clone = el.cloneNode(true);

      // Remove all child elements except formatting
      var toRemove = clone.querySelectorAll(':not(strong):not(b):not(em):not(i):not(br)');
      // Actually we need to keep text nodes, so just strip attributes
      var allEls = clone.querySelectorAll('*');
      for (var i = 0; i < allEls.length; i++) {
        var child = allEls[i];
        var tagName = child.tagName.toLowerCase();
        // Convert b to strong, i to em
        if (tagName === 'b') {
          var strong = document.createElement('strong');
          strong.innerHTML = child.innerHTML;
          child.parentNode.replaceChild(strong, child);
        } else if (tagName === 'i') {
          var em = document.createElement('em');
          em.innerHTML = child.innerHTML;
          child.parentNode.replaceChild(em, child);
        } else if (tagName !== 'strong' && tagName !== 'em' && tagName !== 'br') {
          // Unwrap non-formatting elements
          while (child.firstChild) {
            child.parentNode.insertBefore(child.firstChild, child);
          }
          child.parentNode.removeChild(child);
        }
        // Remove all attributes
        if (child.attributes) {
          while (child.attributes.length > 0) {
            child.removeAttribute(child.attributes[0].name);
          }
        }
      }
      return clone.innerHTML.trim();
    }

    // Try to parse HTML first
    if (html && html.trim()) {
      var temp = document.createElement('div');
      temp.innerHTML = html;

      // Remove script, style, meta elements
      var junk = temp.querySelectorAll('script, style, meta, link, xml');
      for (var j = 0; j < junk.length; j++) {
        junk[j].remove();
      }

      // Process top-level block elements
      var processElement = function(el) {
        var tagName = el.tagName ? el.tagName.toLowerCase() : '';

        switch (tagName) {
          case 'h1':
            blocks.push({ type: 'heading1', content: extractInlineContent(el) });
            break;
          case 'h2':
            blocks.push({ type: 'heading2', content: extractInlineContent(el) });
            break;
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            blocks.push({ type: 'heading3', content: extractInlineContent(el) });
            break;
          case 'p':
          case 'div':
            var content = extractInlineContent(el);
            if (content.trim()) {
              blocks.push({ type: 'paragraph', content: content });
            }
            break;
          case 'ul':
            // BLOCK MODEL: Each list item = its own block
            var bulletItems = el.querySelectorAll(':scope > li');
            for (var bi = 0; bi < bulletItems.length; bi++) {
              blocks.push({ type: 'bullet', content: extractInlineContent(bulletItems[bi]) });
            }
            break;
          case 'ol':
            // BLOCK MODEL: Each list item = its own block
            var numItems = el.querySelectorAll(':scope > li');
            for (var ni = 0; ni < numItems.length; ni++) {
              blocks.push({ type: 'number', content: extractInlineContent(numItems[ni]) });
            }
            break;
          case 'table':
            // Extract table structure
            var rows = [];
            var trs = el.querySelectorAll('tr');
            for (var tr = 0; tr < trs.length; tr++) {
              var cells = trs[tr].querySelectorAll('th, td');
              var rowCells = [];
              for (var td = 0; td < cells.length; td++) {
                rowCells.push({ content: extractInlineContent(cells[td]) });
              }
              if (rowCells.length > 0) {
                rows.push({ cells: rowCells });
              }
            }
            if (rows.length > 0) {
              blocks.push({ type: 'table', rows: rows });
            }
            break;
          case 'blockquote':
            blocks.push({ type: 'quote', content: extractInlineContent(el) });
            break;
          case 'hr':
            blocks.push({ type: 'divider', content: '' });
            break;
          default:
            // Check for text content
            if (el.textContent && el.textContent.trim()) {
              // Might be a wrapper div with block children
              var children = el.children;
              if (children.length > 0) {
                for (var c = 0; c < children.length; c++) {
                  processElement(children[c]);
                }
              } else {
                blocks.push({ type: 'paragraph', content: extractInlineContent(el) });
              }
            }
        }
      };

      // Process direct children of temp container
      var topLevel = temp.children;
      for (var t = 0; t < topLevel.length; t++) {
        processElement(topLevel[t]);
      }

      // If we got blocks from HTML, return them
      if (blocks.length > 0) {
        return blocks;
      }
    }

    // Fallback to plain text parsing
    if (plainText && plainText.trim()) {
      var lines = plainText.split(/\r?\n/);
      var currentParagraph = [];

      for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();

        // Empty line - flush paragraph
        if (trimmed === '') {
          if (currentParagraph.length > 0) {
            blocks.push({ type: 'paragraph', content: processInline(currentParagraph.join(' ')) });
            currentParagraph = [];
          }
          continue;
        }

        // Bullet list item
        if (/^[-*•]\s/.test(trimmed)) {
          if (currentParagraph.length > 0) {
            blocks.push({ type: 'paragraph', content: processInline(currentParagraph.join(' ')) });
            currentParagraph = [];
          }
          blocks.push({ type: 'bullet', content: processInline(trimmed.replace(/^[-*•]\s*/, '')) });
          continue;
        }

        // Numbered list item
        if (/^\d+[.)]\s/.test(trimmed)) {
          if (currentParagraph.length > 0) {
            blocks.push({ type: 'paragraph', content: processInline(currentParagraph.join(' ')) });
            currentParagraph = [];
          }
          blocks.push({ type: 'number', content: processInline(trimmed.replace(/^\d+[.)]\s*/, '')) });
          continue;
        }

        // Markdown headings
        if (/^###\s/.test(trimmed)) {
          if (currentParagraph.length > 0) {
            blocks.push({ type: 'paragraph', content: processInline(currentParagraph.join(' ')) });
            currentParagraph = [];
          }
          blocks.push({ type: 'heading3', content: processInline(trimmed.replace(/^###\s*/, '')) });
          continue;
        }
        if (/^##\s/.test(trimmed)) {
          if (currentParagraph.length > 0) {
            blocks.push({ type: 'paragraph', content: processInline(currentParagraph.join(' ')) });
            currentParagraph = [];
          }
          blocks.push({ type: 'heading2', content: processInline(trimmed.replace(/^##\s*/, '')) });
          continue;
        }
        if (/^#\s/.test(trimmed)) {
          if (currentParagraph.length > 0) {
            blocks.push({ type: 'paragraph', content: processInline(currentParagraph.join(' ')) });
            currentParagraph = [];
          }
          blocks.push({ type: 'heading1', content: processInline(trimmed.replace(/^#\s*/, '')) });
          continue;
        }

        // Regular text - accumulate into paragraph
        currentParagraph.push(trimmed);
      }

      // Flush any remaining paragraph
      if (currentParagraph.length > 0) {
        blocks.push({ type: 'paragraph', content: processInline(currentParagraph.join(' ')) });
      }
    }

    return blocks;
  }

  /**
   * Render block controls (drag handle + plus button)
   * Notion-style: Controls are inline with each block, positioned to the left
   * They appear on block hover and stay visible while hovering controls or block
   */
  function renderBlockControls(blockId) {
    return (
      '<div class="block-controls" data-block-id="' + blockId + '">' +
      '  <button class="block-control block-select" data-block-id="' + blockId + '" title="Select block (Shift+Click for range)" tabindex="-1">' +
      '    <svg class="checkbox-empty" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/></svg>' +
      '    <svg class="checkbox-checked" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="white" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="3" fill="#3b82f6"/><path d="M7 12l3 3 7-7" fill="none"/></svg>' +
      '  </button>' +
      '  <button class="block-control block-add" data-block-id="' + blockId + '" title="Add block below" tabindex="-1">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>' +
      '  </button>' +
      '  <button class="block-control block-drag" data-block-id="' + blockId + '" draggable="true" title="Drag to move" tabindex="-1">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>' +
      '  </button>' +
      '</div>'
    );
  }

  /**
   * Render a single block
   * IMPORTANT: Block ID should always be unique - never use index-based fallback in production
   */
  function renderBlock(block, index) {
    // Block must have a unique ID - generate one if missing
    var blockId = block.id;
    if (!blockId || blockId.indexOf('block_') !== 0) {
      blockId = 'block_' + Date.now() + '_' + index + '_' + Math.random().toString(36).substr(2, 5);
    }
    var blockType = block.type || 'paragraph';
    var controls = renderBlockControls(blockId);
    var blockContent = '';

    // Use sanitizeHtml to preserve formatting (bold, italic) while preventing XSS
    var content = sanitizeHtml(block.content || '');

    switch (blockType) {
      case 'heading1':
        blockContent = '<h1 class="block-element editor-v2-h1" contenteditable="true" data-placeholder="Heading 1">' + content + '</h1>';
        break;

      case 'heading2':
        blockContent = '<h2 class="block-element editor-v2-h2" contenteditable="true" data-placeholder="Heading 2">' + content + '</h2>';
        break;

      case 'heading3':
        blockContent = '<h3 class="block-element editor-v2-h3" contenteditable="true" data-placeholder="Heading 3">' + content + '</h3>';
        break;

      case 'paragraph':
        blockContent = '<div class="block-element editor-v2-paragraph"><div class="block-content" contenteditable="true" data-placeholder="Type / for commands...">' + content + '</div></div>';
        break;

      case 'bullet':
        // BLOCK MODEL: Each list item = its own block (Option A - true Notion model)
        // This is the canonical format - one item per block
        blockContent = '<ul class="block-element editor-v2-list editor-v2-bullet-list"><li contenteditable="true" data-placeholder="List item">' + content + '</li></ul>';
        break;

      case 'number':
        // BLOCK MODEL: Each list item = its own block (Option A - true Notion model)
        // This is the canonical format - one item per block
        blockContent = '<ol class="block-element editor-v2-list editor-v2-number-list"><li contenteditable="true" data-placeholder="List item">' + content + '</li></ol>';
        break;

      case 'bullet_list':
        // DEPRECATED: Container format with multiple items
        // Kept for backwards compatibility with old saved data
        // New insertions should use individual 'bullet' blocks
        var bulletItems = block.items || [];
        if (bulletItems.length === 0 && content) {
          bulletItems = [{ content: content }];
        }
        var bulletListHtml = '<ul class="block-element editor-v2-list editor-v2-bullet-list" contenteditable="true">';
        for (var i = 0; i < bulletItems.length; i++) {
          var itemContent = sanitizeHtml(bulletItems[i].content || '');
          bulletListHtml += '<li data-placeholder="List item">' + itemContent + '</li>';
        }
        bulletListHtml += '</ul>';
        blockContent = bulletListHtml;
        break;

      case 'numbered_list':
        // DEPRECATED: Container format with multiple items
        // Kept for backwards compatibility with old saved data
        // New insertions should use individual 'number' blocks
        var numberItems = block.items || [];
        if (numberItems.length === 0 && content) {
          numberItems = [{ content: content }];
        }
        var numberListHtml = '<ol class="block-element editor-v2-list editor-v2-number-list" contenteditable="true">';
        for (var i = 0; i < numberItems.length; i++) {
          var itemContent = sanitizeHtml(numberItems[i].content || '');
          numberListHtml += '<li data-placeholder="List item">' + itemContent + '</li>';
        }
        numberListHtml += '</ol>';
        blockContent = numberListHtml;
        break;

      case 'table':
        // Proper table block with rows and cells stored in block.rows array
        var tableRows = block.rows || [];
        var tableHtml = '<div class="block-element editor-v2-table-wrapper"><table class="editor-v2-table" contenteditable="false">';
        for (var r = 0; r < tableRows.length; r++) {
          var row = tableRows[r];
          var cells = row.cells || [];
          var isHeader = r === 0; // First row is header
          var cellTag = isHeader ? 'th' : 'td';
          tableHtml += '<tr>';
          for (var c = 0; c < cells.length; c++) {
            var cellContent = sanitizeHtml(cells[c].content || '');
            tableHtml += '<' + cellTag + ' contenteditable="true">' + cellContent + '</' + cellTag + '>';
          }
          tableHtml += '</tr>';
        }
        tableHtml += '</table></div>';
        blockContent = tableHtml;
        break;

      case 'divider':
        blockContent = '<div class="block-element editor-v2-divider-wrapper"><hr class="editor-v2-divider"></div>';
        break;

      case 'pagebreak':
        blockContent = '<div class="block-element editor-v2-pagebreak" title="Starts a new page in preview and PDF export"><div class="pagebreak-line"></div><span class="pagebreak-label">Page Break</span><div class="pagebreak-line"></div></div>';
        break;

      case 'quote':
        blockContent = '<blockquote class="block-element editor-v2-quote" contenteditable="true" data-placeholder="Quote">' + content + '</blockquote>';
        break;

      case 'callout':
        blockContent = '<div class="block-element editor-v2-callout"><span class="callout-icon">💡</span><div class="callout-content" contenteditable="true" data-placeholder="Callout text...">' + content + '</div></div>';
        break;

      case 'html':
        // Raw HTML block (for tables, etc.) - content is already sanitized HTML
        // Use the original block.content, not the sanitized version, to preserve table structure
        var rawHtml = block.content || '';
        blockContent = '<div class="block-element editor-v2-html-block">' + rawHtml + '</div>';
        break;

      case 'cover':
        return renderCoverPage(block, blockId);

      case 'chart-placeholder':
        return renderChartPlaceholder(block, blockId);

      case 'embed':
        return renderEmbed(block, blockId);

      default:
        blockContent = '<div class="block-element editor-v2-paragraph"><div class="block-content" contenteditable="true" data-placeholder="Type / for commands...">' + content + '</div></div>';
    }

    return '<div class="editor-v2-block" data-block-id="' + blockId + '" data-block-type="' + blockType + '">' + controls + blockContent + '</div>';
  }

  /**
   * Render embedded content (heatmap, chart, table, etc.)
   * Uses dashboard renderers for consistent styling with dashboard
   */
  function renderEmbed(block, blockId) {
    var embedType = block.embedType || 'heatmap';
    var registerId = block.registerId || 'all';
    var layout = block.layout || 'side-by-side';
    var controls = renderBlockControls(blockId);

    // Build register dropdown options (dashboard-style custom dropdown)
    // Try 'registers' first (primary key), then 'riskRegisters' for compatibility
    var registers = ERM.storage ? (ERM.storage.get('registers') || ERM.storage.get('riskRegisters') || []) : [];
    var selectedLabel = 'All Registers';

    // Find selected register name
    if (registerId !== 'all') {
      for (var r = 0; r < registers.length; r++) {
        if (registers[r].id === registerId) {
          selectedLabel = registers[r].name || 'Unnamed';
          break;
        }
      }
    }

    // Build dropdown options HTML
    var checkIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';
    var dropdownOptions = '<div class="embed-dropdown-option' + (registerId === 'all' ? ' selected' : '') + '" data-value="all">' +
      '<span class="embed-option-label">All Registers</span>' +
      '<span class="embed-option-check">' + checkIcon + '</span>' +
      '</div>';

    for (var i = 0; i < registers.length; i++) {
      var reg = registers[i];
      var isSelected = (registerId === reg.id);
      dropdownOptions += '<div class="embed-dropdown-option' + (isSelected ? ' selected' : '') + '" data-value="' + escapeHtml(reg.id) + '">' +
        '<span class="embed-option-label">' + escapeHtml(reg.name || 'Unnamed') + '</span>' +
        '<span class="embed-option-check">' + checkIcon + '</span>' +
        '</div>';
    }

    // Minimal SVG icons for toolbar (Notion-style)
    var chevronIcon = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    var refreshIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>';
    var aiIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5L12 2Z"/></svg>';
    var deleteIcon = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>';

    // Notion-style minimal embed - no loud headers, just clean content with hover toolbar
    return (
      '<div class="editor-v2-block editor-v2-embed" data-block-id="' + blockId + '" data-block-type="embed" data-embed-type="' + embedType + '" data-register-id="' + registerId + '" data-layout="' + layout + '">' +
      controls +
      '  <div class="block-element">' +
      '    <div class="embed-hover-toolbar">' +
      '      <div class="embed-register-dropdown" data-block-id="' + blockId + '">' +
      '        <button type="button" class="embed-dropdown-trigger">' +
      '          <span class="embed-dropdown-value">' + escapeHtml(selectedLabel) + '</span>' +
      '          <span class="embed-dropdown-arrow">' + chevronIcon + '</span>' +
      '        </button>' +
      '        <div class="embed-dropdown-menu">' +
      dropdownOptions +
      '        </div>' +
      '      </div>' +
      '      <button type="button" class="embed-toolbar-btn embed-btn-refresh" data-action="refresh" title="Refresh">' + refreshIcon + '</button>' +
      '      <button type="button" class="embed-toolbar-btn embed-btn-ai" data-action="ai" title="AI Insights">' + aiIcon + '</button>' +
      '      <button type="button" class="embed-toolbar-btn embed-btn-delete" data-action="delete" title="Delete">' + deleteIcon + '</button>' +
      '      <div class="embed-delete-confirm" style="display: none;">' +
      '        <span>Delete?</span>' +
      '        <button type="button" class="embed-confirm-yes" data-action="confirm-delete">Yes</button>' +
      '        <button type="button" class="embed-confirm-no" data-action="cancel-delete">No</button>' +
      '      </div>' +
      '    </div>' +
      '    <div class="editor-v2-embed-content" id="embed-content-' + blockId + '">' +
      '      <div class="editor-v2-embed-loading"></div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  /**
   * Render cover page block
   * Professional report cover with title, subtitle, image placeholder, and metadata
   */
  function renderCoverPage(block, blockId) {
    var controls = renderBlockControls(blockId);
    var title = block.coverTitle || '';
    var subtitle = block.coverSubtitle || '';
    var imageUrl = block.coverImage || '';
    var organization = block.organization || '';
    var reportingPeriod = block.reportingPeriod || '';
    var reportDate = block.reportDate || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    var preparedBy = block.preparedBy || (ERM.state && ERM.state.user ? ERM.state.user.name : '');
    var classification = block.classification || '';

    // Logo/image in top-left corner (smaller, professional)
    var imageHtml = imageUrl ?
      '<div class="cover-logo-container">' +
      '  <img src="' + escapeHtml(imageUrl) + '" alt="Logo" class="cover-logo">' +
      '  <button class="cover-logo-remove" title="Remove logo">' +
      '    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '  </button>' +
      '</div>' :
      '<div class="cover-logo-placeholder" id="cover-image-upload-' + blockId + '">' +
      '  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '    <rect x="3" y="3" width="18" height="18" rx="2"/>' +
      '    <circle cx="8.5" cy="8.5" r="1.5"/>' +
      '    <path d="M21 15l-5-5L5 21"/>' +
      '  </svg>' +
      '  <span>Add Logo</span>' +
      '</div>';

    // Classification badge (top-right)
    var classificationBadge = classification ?
      '<div class="cover-classification-badge cover-classification-' + classification.toLowerCase() + '">' + escapeHtml(classification) + '</div>' :
      '';

    return (
      '<div class="editor-v2-block editor-v2-cover-block" data-block-id="' + blockId + '" data-block-type="cover">' +
      controls +
      '  <div class="block-element cover-page">' +
      '    <div class="cover-header">' +
      imageHtml +
      classificationBadge +
      '    </div>' +
      '    <div class="cover-main">' +
      '      <div class="cover-title-section">' +
      '        <input type="text" class="cover-title-input" value="' + escapeHtml(title) + '" placeholder="Report Title" data-field="coverTitle">' +
      '        <input type="text" class="cover-subtitle-input" value="' + escapeHtml(subtitle) + '" placeholder="Subtitle or description" data-field="coverSubtitle">' +
      '      </div>' +
      '      <div class="cover-divider"></div>' +
      '      <div class="cover-metadata">' +
      '        <div class="cover-meta-item">' +
      '          <span class="cover-meta-label">Organization</span>' +
      '          <input type="text" class="cover-meta-value" value="' + escapeHtml(organization) + '" placeholder="Organization name" data-field="organization">' +
      '        </div>' +
      '        <div class="cover-meta-item">' +
      '          <span class="cover-meta-label">Reporting Period</span>' +
      '          <input type="text" class="cover-meta-value" value="' + escapeHtml(reportingPeriod) + '" placeholder="e.g., Q4 2024" data-field="reportingPeriod">' +
      '        </div>' +
      '        <div class="cover-meta-item">' +
      '          <span class="cover-meta-label">Report Date</span>' +
      '          <input type="text" class="cover-meta-value" value="' + escapeHtml(reportDate) + '" placeholder="Report date" data-field="reportDate">' +
      '        </div>' +
      '        <div class="cover-meta-item">' +
      '          <span class="cover-meta-label">Prepared By</span>' +
      '          <input type="text" class="cover-meta-value" value="' + escapeHtml(preparedBy) + '" placeholder="Author name" data-field="preparedBy">' +
      '        </div>' +
      '      </div>' +
      '    </div>' +
      '    <div class="cover-footer">' +
      '      <div class="cover-classification-select">' +
      '        <label>Classification</label>' +
      '        <select class="cover-meta-select" data-field="classification">' +
      '          <option value="">Select</option>' +
      '          <option value="Internal"' + (classification === 'Internal' ? ' selected' : '') + '>Internal</option>' +
      '          <option value="Confidential"' + (classification === 'Confidential' ? ' selected' : '') + '>Confidential</option>' +
      '          <option value="Board"' + (classification === 'Board' ? ' selected' : '') + '>Board</option>' +
      '          <option value="Audit"' + (classification === 'Audit' ? ' selected' : '') + '>Audit</option>' +
      '          <option value="Public"' + (classification === 'Public' ? ' selected' : '') + '>Public</option>' +
      '        </select>' +
      '      </div>' +
      '    </div>' +
      '  </div>' +
      '</div>'
    );
  }

  /**
   * Render chart placeholder block
   * Visual placeholder that shows where a chart will appear
   */
  function renderChartPlaceholder(block, blockId) {
    var controls = renderBlockControls(blockId);
    var chartType = block.chartType || 'bar';
    var caption = block.caption || '';

    return (
      '<div class="editor-v2-block editor-v2-chart-placeholder" data-block-id="' + blockId + '" data-block-type="chart-placeholder" data-chart-type="' + chartType + '">' +
      controls +
      '  <div class="block-element chart-placeholder">' +
      '    <div class="chart-placeholder-icon">' +
      '      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">' +
      '        <line x1="18" y1="20" x2="18" y2="10"/>' +
      '        <line x1="12" y1="20" x2="12" y2="4"/>' +
      '        <line x1="6" y1="20" x2="6" y2="14"/>' +
      '        <line x1="3" y1="20" x2="21" y2="20"/>' +
      '      </svg>' +
      '    </div>' +
      '    <div class="chart-placeholder-text">Chart will appear here</div>' +
      '    <input type="text" class="chart-caption-input" value="' + escapeHtml(caption) + '" placeholder="Add caption (optional)" data-field="caption">' +
      '    <div class="chart-placeholder-hint">Connect data in the Reports module to populate this chart</div>' +
      '  </div>' +
      '</div>'
    );
  }

  /**
   * Render slash menu items
   */
  function renderSlashMenu(filter) {
    var menuContent = document.getElementById('slash-menu-content');
    if (!menuContent) return;

    var filtered = slashCommands;
    if (filter) {
      var lowerFilter = filter.toLowerCase();
      filtered = slashCommands.filter(function(cmd) {
        return cmd.label.toLowerCase().indexOf(lowerFilter) !== -1 ||
               cmd.shortcut.toLowerCase().indexOf(lowerFilter) !== -1 ||
               cmd.description.toLowerCase().indexOf(lowerFilter) !== -1;
      });
    }

    // Group by category
    var categories = {
      content: { label: 'CONTENT', items: [] },
      ai: { label: 'AI', items: [] },
      basic: { label: 'BASIC BLOCKS', items: [] }
    };

    for (var i = 0; i < filtered.length; i++) {
      var cmd = filtered[i];
      if (categories[cmd.category]) {
        categories[cmd.category].items.push(cmd);
      }
    }

    var html = '';
    var categoryOrder = ['content', 'ai', 'basic'];

    for (var c = 0; c < categoryOrder.length; c++) {
      var cat = categories[categoryOrder[c]];
      if (cat.items.length > 0) {
        html += '<div class="slash-menu-category">' + cat.label + '</div>';
        for (var j = 0; j < cat.items.length; j++) {
          var item = cat.items[j];
          html +=
            '<div class="slash-menu-item" data-command-id="' + item.id + '">' +
            '  <span class="slash-menu-icon">' + item.icon + '</span>' +
            '  <div class="slash-menu-item-content">' +
            '    <span class="slash-menu-label">' + item.label + '</span>' +
            '    <span class="slash-menu-desc">' + item.description + '</span>' +
            '  </div>' +
            '  <span class="slash-menu-shortcut">' + item.shortcut + '</span>' +
            '</div>';
        }
      }
    }

    if (html === '') {
      html = '<div class="slash-menu-empty">No commands found</div>';
    }

    menuContent.innerHTML = html;
  }

  /**
   * Render AI dropdown items
   */
  function renderAIDropdown() {
    var container = document.getElementById('ai-dropdown-items');
    if (!container) return;

    var html = '';
    for (var i = 0; i < aiActions.length; i++) {
      var action = aiActions[i];
      html +=
        '<div class="ai-dropdown-item" data-action-id="' + action.id + '">' +
        '  <span class="ai-dropdown-icon">' + action.icon + '</span>' +
        '  <div class="ai-dropdown-item-content">' +
        '    <span class="ai-dropdown-label">' + action.label + '</span>' +
        '    <span class="ai-dropdown-desc">' + action.description + '</span>' +
        '  </div>' +
        '</div>';
    }
    container.innerHTML = html;
  }

  /**
   * Bind all events
   */
  function bindEvents(container) {
    var editorContent = document.getElementById('editor-content');
    var editorBody = document.getElementById('editor-body');
    var slashMenu = document.getElementById('slash-menu');
    // slashInput removed - no search in slash menu

    // Page indicator scroll tracking
    var pageIndicator = document.getElementById('page-indicator');
    if (editorBody && pageIndicator) {
      var A4_HEIGHT = 1123; // A4 height in pixels at 96dpi
      editorBody.addEventListener('scroll', function() {
        var scrollTop = editorBody.scrollTop;
        var currentPage = Math.floor(scrollTop / A4_HEIGHT) + 1;
        pageIndicator.textContent = 'Page ' + currentPage;
      });
    }

    // Title change
    var titleInput = document.getElementById('editor-title');
    if (titleInput) {
      titleInput.addEventListener('input', function() {
        state.currentReport.title = this.value;
        markDirty();
      });
    }

    // Save button
    var saveBtn = document.getElementById('editor-save');
    if (saveBtn) {
      saveBtn.addEventListener('click', saveReport);
    }

    // Back button
    var backBtn = document.getElementById('editor-back');
    if (backBtn) {
      backBtn.addEventListener('click', function() {
        if (state.isDirty) {
          showUnsavedChangesModal();
        } else {
          closeEditor();
        }
      });
    }

    // Tooltip dismiss
    var tooltipDismiss = document.getElementById('tooltip-dismiss');
    if (tooltipDismiss) {
      tooltipDismiss.addEventListener('click', function() {
        var tooltip = document.getElementById('editor-tooltip');
        if (tooltip) tooltip.remove();
      });
    }

    // Slash hint dismiss
    var hintDismiss = document.getElementById('hint-dismiss');
    if (hintDismiss) {
      hintDismiss.addEventListener('click', function() {
        var hint = document.getElementById('editor-hint');
        if (hint) {
          hint.classList.add('hiding');
          setTimeout(function() {
            hint.remove();
          }, 200);
        }
        // Remember dismissal
        if (ERM.storage) {
          ERM.storage.set('slashHintDismissed', true);
        }
      });
    }

    // NOTE: Old floating AI button removed - using global ERM.floatingAI instead

    // More options button (hamburger menu)
    var moreBtn = document.getElementById('editor-more');
    var moreDropdown = document.getElementById('editor-more-dropdown');
    if (moreBtn && moreDropdown) {
      moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var isVisible = moreDropdown.classList.contains('visible');
        if (isVisible) {
          moreDropdown.classList.remove('visible');
        } else {
          moreDropdown.classList.add('visible');
        }
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', function(e) {
        if (!moreDropdown.contains(e.target) && e.target !== moreBtn) {
          moreDropdown.classList.remove('visible');
        }
      });

      // Export PDF
      var exportPdfBtn = document.getElementById('more-export-pdf');
      if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
          moreDropdown.classList.remove('visible');
          exportToPDF();
        });
      }

      // Duplicate report
      var duplicateBtn = document.getElementById('more-duplicate');
      if (duplicateBtn) {
        duplicateBtn.addEventListener('click', function() {
          moreDropdown.classList.remove('visible');
          duplicateReport();
        });
      }

      // Delete report
      var deleteBtn = document.getElementById('more-delete');
      if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
          moreDropdown.classList.remove('visible');
          confirmDeleteReport();
        });
      }
    }

    // Bottom helper buttons
    bindHelperButtons();

    // Content area events
    if (editorContent) {
      // Keydown for slash commands
      editorContent.addEventListener('keydown', handleKeydown);

      // Input for content changes
      editorContent.addEventListener('input', handleInput);

      // Paste event - BLOCK MODEL: Normalize pasted content to blocks
      // Same pipeline as AI insertion - extract structure, create proper blocks
      editorContent.addEventListener('paste', function(e) {
        e.preventDefault();

        var clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        var plainText = clipboardData.getData('text/plain') || '';
        var htmlText = clipboardData.getData('text/html') || '';

        // Find current block for insertion point
        var selection = window.getSelection();
        var currentBlock = null;
        if (selection && selection.rangeCount > 0) {
          var range = selection.getRangeAt(0);
          var node = range.commonAncestorContainer;
          if (node.nodeType === 3) node = node.parentNode;
          currentBlock = node.closest('.editor-v2-block');
        }

        if (!currentBlock) {
          currentBlock = state.activeBlock;
        }

        if (!currentBlock) {
          console.log('[V2 Editor] Paste: No target block found');
          return;
        }

        // Parse pasted content into blocks
        var blocks = parsePastedContentToBlocks(htmlText, plainText);

        if (blocks.length === 0) {
          console.log('[V2 Editor] Paste: No blocks parsed from content');
          return;
        }

        console.log('[V2 Editor] Paste: Parsed', blocks.length, 'blocks from clipboard');

        // Handle simple single-paragraph paste inline
        if (blocks.length === 1 && blocks[0].type === 'paragraph') {
          // Simple paste - insert inline at cursor position
          var contentEl = currentBlock.querySelector('[contenteditable="true"]');
          if (contentEl && selection.rangeCount > 0) {
            var range = selection.getRangeAt(0);
            range.deleteContents();

            var tempSpan = document.createElement('span');
            tempSpan.innerHTML = blocks[0].content;

            var frag = document.createDocumentFragment();
            while (tempSpan.firstChild) {
              frag.appendChild(tempSpan.firstChild);
            }

            range.insertNode(frag);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } else {
          // Multi-block paste - insert as new blocks after current block
          var lastBlock = currentBlock;
          for (var i = 0; i < blocks.length; i++) {
            var blockData = blocks[i];

            // Use insertBlockAfter for atomic types
            if (blockData.type === 'paragraph' || blockData.type === 'heading1' ||
                blockData.type === 'heading2' || blockData.type === 'heading3' ||
                blockData.type === 'bullet' || blockData.type === 'number' ||
                blockData.type === 'quote' || blockData.type === 'divider') {
              lastBlock = insertBlockAfter(lastBlock, blockData.type, blockData.content || '');
            } else if (blockData.type === 'table' && blockData.rows) {
              // Use insertStructuredBlock for tables
              lastBlock = insertStructuredBlock(lastBlock, blockData);
            }
          }

          // Focus the last inserted block
          if (lastBlock) {
            setTimeout(function() {
              var editable = lastBlock.querySelector('[contenteditable="true"]');
              if (editable) {
                editable.focus();
                var range = document.createRange();
                var sel = window.getSelection();
                if (editable.lastChild) {
                  range.setStartAfter(editable.lastChild);
                  range.collapse(true);
                  sel.removeAllRanges();
                  sel.addRange(range);
                }
              }
            }, 50);
          }
        }

        // Trigger updates - pass lastBlock for auto-pagination
        var pastedBlock = lastBlock;
        setTimeout(function() {
          markDirty(true);
          schedulePageAwarenessUpdate(pastedBlock);
          console.log('[V2 Editor] Paste: Blocks inserted successfully');
        }, 100);
      });

      // Mouseup for text selection
      editorContent.addEventListener('mouseup', handleMouseup);

      // Initialize block selection system (Notion-style multi-select)
      initBlockSelection(editorContent);

      // Focus tracking - update activeBlock when focus moves between blocks
      editorContent.addEventListener('focusin', function(e) {
        var block = e.target.closest('.editor-v2-block');
        if (block) {
          state.activeBlock = block;
        }
      });

      // Click tracking - also update activeBlock on click (for cursor placement without focus change)
      editorContent.addEventListener('mousedown', function(e) {
        var block = e.target.closest('.editor-v2-block');
        if (block) {
          state.activeBlock = block;
        }
      });

      // Block controls - plus button opens slash menu (Notion-style)
      editorContent.addEventListener('click', function(e) {
        var addBtn = e.target.closest('.block-add');
        if (addBtn) {
          e.preventDefault();
          e.stopPropagation();
          var blockId = addBtn.getAttribute('data-block-id');
          var block = document.querySelector('[data-block-id="' + blockId + '"]');
          if (block) {
            // Store the block we want to insert AFTER
            state.activeBlock = block;
            state.slashTargetBlock = block;
            state.insertAfterBlock = block; // Track which block to insert after

            // Show slash menu positioned at the + button
            showSlashMenuAtElement(addBtn);
          }
          return;
        }

        // Click on divider wrapper to place cursor
        var dividerWrapper = e.target.closest('.editor-v2-divider-wrapper');
        if (dividerWrapper) {
          var block = dividerWrapper.closest('.editor-v2-block');
          if (block) {
            var newBlock = insertBlockAfter(block, 'paragraph');
            if (newBlock) {
              state.activeBlock = newBlock;
            }
          }
          return;
        }

        // Click in empty area below all blocks - create new block at end
        if (e.target === editorContent || e.target.classList.contains('editor-v2-empty')) {
          var lastBlock = editorContent.querySelector('.editor-v2-block:last-child');
          if (lastBlock) {
            var newBlock = insertBlockAfter(lastBlock, 'paragraph');
            if (newBlock) {
              state.activeBlock = newBlock;
            }
          }
        }

        // Handle embed toolbar button clicks
        var toolbarBtn = e.target.closest('.embed-toolbar-btn');
        if (toolbarBtn) {
          e.preventDefault();
          e.stopPropagation();
          var action = toolbarBtn.getAttribute('data-action');
          var embedBlock = toolbarBtn.closest('.editor-v2-embed');
          console.log('[V2 Editor] Embed toolbar click - action:', action, 'block:', embedBlock ? 'found' : 'not found');
          if (embedBlock && action) {
            handleEmbedToolbarAction(embedBlock, action);
          }
          return;
        }

        // Handle embed delete confirmation buttons
        var confirmBtn = e.target.closest('.embed-confirm-yes, .embed-confirm-no');
        if (confirmBtn) {
          e.preventDefault();
          e.stopPropagation();
          var action = confirmBtn.getAttribute('data-action');
          var embedBlock = confirmBtn.closest('.editor-v2-embed');
          console.log('[V2 Editor] Embed confirm click - action:', action);
          if (embedBlock && action) {
            handleEmbedToolbarAction(embedBlock, action);
          }
          return;
        }

        // Handle embed register dropdown trigger (open/close menu)
        var dropdownTrigger = e.target.closest('.embed-dropdown-trigger');
        if (dropdownTrigger) {
          e.preventDefault();
          e.stopPropagation();
          var dropdown = dropdownTrigger.closest('.embed-register-dropdown');
          if (dropdown) {
            // Close any other open dropdowns first
            var allDropdowns = document.querySelectorAll('.embed-register-dropdown.open');
            for (var d = 0; d < allDropdowns.length; d++) {
              if (allDropdowns[d] !== dropdown) {
                allDropdowns[d].classList.remove('open');
              }
            }
            // Toggle this dropdown
            dropdown.classList.toggle('open');
          }
          return;
        }

        // Handle embed register dropdown option selection
        var dropdownOption = e.target.closest('.embed-dropdown-option');
        if (dropdownOption) {
          e.preventDefault();
          e.stopPropagation();
          var dropdown = dropdownOption.closest('.embed-register-dropdown');
          if (dropdown) {
            var blockId = dropdown.getAttribute('data-block-id');
            var newRegisterId = dropdownOption.getAttribute('data-value');
            var embedBlock = document.querySelector('[data-block-id="' + blockId + '"]');

            if (embedBlock) {
              // Update selected state in dropdown
              var allOptions = dropdown.querySelectorAll('.embed-dropdown-option');
              for (var o = 0; o < allOptions.length; o++) {
                allOptions[o].classList.remove('selected');
              }
              dropdownOption.classList.add('selected');

              // Update trigger text to show selected register name
              var triggerValue = dropdown.querySelector('.embed-dropdown-value');
              var optionLabel = dropdownOption.querySelector('.embed-option-label');
              if (triggerValue && optionLabel) {
                var newLabel = optionLabel.textContent;
                triggerValue.textContent = newLabel;
              }

              // Close dropdown
              dropdown.classList.remove('open');

              // Update block data attribute for persistence
              embedBlock.setAttribute('data-register-id', newRegisterId);

              // Reload content with new filter
              var embedType = embedBlock.getAttribute('data-embed-type');
              var layout = embedBlock.getAttribute('data-layout');
              loadEmbedContent(blockId, embedType, newRegisterId, layout);
              markDirty(true);
            }
          }
          return;
        }

        // Click below/after an embed block - create new paragraph for typing
        var embedBlock = e.target.closest('.editor-v2-embed');
        if (embedBlock) {
          var clickY = e.clientY;
          var embedRect = embedBlock.getBoundingClientRect();
          // If click is in the bottom 30px of the embed, create new block after
          if (clickY > embedRect.bottom - 30) {
            var nextBlock = embedBlock.nextElementSibling;
            if (!nextBlock || nextBlock.getAttribute('data-block-type') !== 'paragraph') {
              var newBlock = insertBlockAfter(embedBlock, 'paragraph');
              if (newBlock) {
                state.activeBlock = newBlock;
                var contentEl = newBlock.querySelector('[contenteditable="true"]');
                if (contentEl) {
                  contentEl.focus();
                }
              }
            }
          }
        }
      });

      // Close embed dropdowns when clicking outside
      document.addEventListener('click', function(e) {
        if (!e.target.closest('.embed-register-dropdown')) {
          var openDropdowns = document.querySelectorAll('.embed-register-dropdown.open');
          for (var d = 0; d < openDropdowns.length; d++) {
            openDropdowns[d].classList.remove('open');
          }
        }
      });

      // Drag and drop for blocks
      editorContent.addEventListener('dragstart', function(e) {
        var dragHandle = e.target.closest('.block-drag');
        if (dragHandle) {
          var blockId = dragHandle.getAttribute('data-block-id');
          var block = document.querySelector('[data-block-id="' + blockId + '"]');
          if (block) {
            e.dataTransfer.setData('text/plain', blockId);
            e.dataTransfer.effectAllowed = 'move';
            block.classList.add('dragging');
            state.draggedBlock = block;
          }
        }
      });

      editorContent.addEventListener('dragend', function(e) {
        if (state.draggedBlock) {
          state.draggedBlock.classList.remove('dragging');
          state.draggedBlock = null;
        }
        // Remove all drop indicators
        var indicators = editorContent.querySelectorAll('.drop-indicator');
        for (var i = 0; i < indicators.length; i++) {
          indicators[i].classList.remove('drop-indicator');
        }
      });

      editorContent.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        var targetBlock = e.target.closest('.editor-v2-block');
        if (targetBlock && state.draggedBlock && targetBlock !== state.draggedBlock) {
          // Remove existing indicators
          var indicators = editorContent.querySelectorAll('.drop-indicator');
          for (var i = 0; i < indicators.length; i++) {
            indicators[i].classList.remove('drop-indicator');
          }
          // Add indicator to target
          var rect = targetBlock.getBoundingClientRect();
          var midY = rect.top + rect.height / 2;
          if (e.clientY < midY) {
            targetBlock.classList.add('drop-indicator', 'drop-above');
          } else {
            targetBlock.classList.add('drop-indicator', 'drop-below');
          }
        }
      });

      editorContent.addEventListener('drop', function(e) {
        e.preventDefault();
        var blockId = e.dataTransfer.getData('text/plain');
        var targetBlock = e.target.closest('.editor-v2-block');

        if (blockId && targetBlock && state.draggedBlock) {
          var rect = targetBlock.getBoundingClientRect();
          var midY = rect.top + rect.height / 2;
          var insertBefore = e.clientY < midY;

          // Move in DOM
          if (insertBefore) {
            targetBlock.parentNode.insertBefore(state.draggedBlock, targetBlock);
          } else {
            targetBlock.parentNode.insertBefore(state.draggedBlock, targetBlock.nextSibling);
          }

          // Update content array
          updateContentFromDOM();
          markDirty();
        }

        // Cleanup
        if (state.draggedBlock) {
          state.draggedBlock.classList.remove('dragging');
          state.draggedBlock = null;
        }
        var indicators = editorContent.querySelectorAll('.drop-indicator');
        for (var i = 0; i < indicators.length; i++) {
          indicators[i].classList.remove('drop-indicator', 'drop-above', 'drop-below');
        }
      });
    }

    // Slash menu item clicks
    if (slashMenu) {
      slashMenu.addEventListener('click', function(e) {
        var item = e.target.closest('.slash-menu-item');
        if (item) {
          var commandId = item.getAttribute('data-command-id');
          executeSlashCommand(commandId);
        }
      });
    }

    // Slash menu keyboard navigation (no search input)
    if (slashMenu) {
      slashMenu.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
          hideSlashMenu();
        } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          navigateSlashMenu(e.key === 'ArrowDown' ? 1 : -1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          var selectedItem = slashMenu.querySelector('.slash-menu-item.selected');
          if (selectedItem) {
            var commandId = selectedItem.getAttribute('data-command-id');
            executeSlashCommand(commandId);
          }
        }
      });
    }

    // NOTE: Selection toolbar buttons are handled by report-editor.js
    // V2 only handles the Turn Into dropdown items (the dropdown element is rendered in V2)

    // Turn Into dropdown items
    var turnIntoDropdown = document.getElementById('turn-into-dropdown');
    if (turnIntoDropdown) {
      turnIntoDropdown.addEventListener('click', function(e) {
        var item = e.target.closest('.turn-into-item');
        if (item) {
          var type = item.getAttribute('data-type');
          executeTurnInto(type);
        }
      });
    }

    // AI dropdown items
    var aiDropdown = document.getElementById('ai-dropdown');
    if (aiDropdown) {
      aiDropdown.addEventListener('click', function(e) {
        var item = e.target.closest('.ai-dropdown-item');
        if (item) {
          var actionId = item.getAttribute('data-action-id');
          executeAIAction(actionId);
        }
      });
    }

    // AI inline response buttons - Notion-style (Insert, Replace, Try again, Cancel)
    var aiInlineResponseEl = document.getElementById('ai-inline-response');
    if (aiInlineResponseEl) {
      // Prevent mousedown from clearing selection
      aiInlineResponseEl.addEventListener('mousedown', function(e) {
        e.preventDefault();
      });
    }

    var aiInsert = document.getElementById('ai-insert');
    if (aiInsert) {
      aiInsert.addEventListener('click', function() {
        applyAIActionResult('insert');
      });
    }

    var aiReplace = document.getElementById('ai-replace');
    if (aiReplace) {
      aiReplace.addEventListener('click', function() {
        applyAIActionResult('replace');
      });
    }

    var aiRetry = document.getElementById('ai-retry');
    if (aiRetry) {
      aiRetry.addEventListener('click', retryAIAction);
    }

    var aiDismiss = document.getElementById('ai-dismiss');
    if (aiDismiss) {
      aiDismiss.addEventListener('click', hideAIResponse);
    }

    // Comment send
    var commentSend = document.getElementById('inline-comment-send');
    if (commentSend) {
      commentSend.addEventListener('click', sendComment);
    }

    // Comment input for @mentions
    var commentInput = document.getElementById('inline-comment-input');
    if (commentInput) {
      commentInput.addEventListener('input', handleCommentInput);
      commentInput.addEventListener('keydown', function(e) {
        if (state.mentionDropdownVisible) {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault();
            navigateMentionDropdown(e.key === 'ArrowDown' ? 1 : -1);
          } else if (e.key === 'Enter') {
            e.preventDefault();
            selectCurrentMention();
          } else if (e.key === 'Escape') {
            e.preventDefault();
            hideMentionDropdown();
          }
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendComment();
        }
      });
    }

    // Mention dropdown item clicks
    var mentionDropdown = document.getElementById('mention-dropdown');
    if (mentionDropdown) {
      mentionDropdown.addEventListener('click', function(e) {
        var item = e.target.closest('.mention-item');
        if (item) {
          var name = item.getAttribute('data-member-name');
          insertMention(name);
        }
      });
    }

    // Embed picker
    var embedCancel = document.getElementById('embed-cancel');
    if (embedCancel) {
      embedCancel.addEventListener('click', hideEmbedPicker);
    }

    var embedInsert = document.getElementById('embed-insert');
    if (embedInsert) {
      embedInsert.addEventListener('click', insertEmbed);
    }

    // Click outside to close menus
    document.addEventListener('click', function(e) {
      // Close slash menu if clicking outside
      // Get fresh reference to avoid stale closure and check visibility first
      var currentSlashMenu = document.getElementById('slash-menu');
      if (state.slashMenuVisible && currentSlashMenu && !currentSlashMenu.contains(e.target)) {
        hideSlashMenu();
      }

      // Close selection toolbar if clicking outside editor content
      var selectionToolbar = document.getElementById('selection-toolbar');
      var turnIntoDropdown = document.getElementById('turn-into-dropdown');
      var aiDropdown = document.getElementById('ai-dropdown');
      var askAiPanel = document.getElementById('ask-ai-panel');
      var aiActionsDropdown = document.getElementById('ai-actions-dropdown');
      var floatingToolbar = document.getElementById('report-floating-toolbar');
      var aiInlineResponse = document.getElementById('ai-inline-response');
      var editorContent = document.querySelector('.editor-v2-content');

      // Check if click is outside all toolbars and dropdowns
      var isOutsideToolbar = !selectionToolbar || !selectionToolbar.contains(e.target);
      var isOutsideFloatingToolbar = !floatingToolbar || !floatingToolbar.contains(e.target);
      var isOutsideTurnInto = !turnIntoDropdown || !turnIntoDropdown.contains(e.target);
      var isOutsideAIDropdown = !aiDropdown || !aiDropdown.contains(e.target);
      var isOutsideAskAiPanel = !askAiPanel || !askAiPanel.contains(e.target);
      var isOutsideAIActionsDropdown = !aiActionsDropdown || !aiActionsDropdown.contains(e.target);
      var isOutsideAIInlineResponse = !aiInlineResponse || !aiInlineResponse.contains(e.target);
      var isOutsideContent = !editorContent || !editorContent.contains(e.target);

      // Hide Turn Into dropdown if clicking outside
      if (isOutsideTurnInto && state.turnIntoVisible) {
        hideTurnIntoDropdown();
      }

      // Hide AI dropdown if clicking outside (don't remove highlight - user might click back)
      if (isOutsideAIDropdown && state.aiDropdownVisible) {
        hideAIDropdown(false);
      }

      // Hide selection toolbar if clicking outside content and all AI-related panels
      // Don't hide if clicking inside Ask AI panel, AI Actions dropdown, or AI inline response
      if (isOutsideContent && isOutsideToolbar && isOutsideFloatingToolbar &&
          isOutsideTurnInto && isOutsideAIDropdown && isOutsideAskAiPanel &&
          isOutsideAIActionsDropdown && isOutsideAIInlineResponse) {
        hideSelectionPills();
        // Only remove AI highlight when clicking completely outside AND no AI panels are visible
        // This ensures the highlight persists while AI is generating or showing results
        var aiPanelVisible = (askAiPanel && askAiPanel.classList.contains('visible')) ||
                             (aiInlineResponse && aiInlineResponse.classList.contains('visible'));
        if (!aiPanelVisible && ERM.reportEditorAI && ERM.reportEditorAI.unhighlightSelection) {
          ERM.reportEditorAI.unhighlightSelection();
        }
      }

      var embedPicker = document.getElementById('embed-picker');
      if (embedPicker && !embedPicker.contains(e.target)) {
        // Don't hide if clicking inside embed picker
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveReport();
      }

      // Ctrl/Cmd + Z to undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y to redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      // Escape to close all menus and panels
      if (e.key === 'Escape') {
        hideSlashMenu();
        hideSelectionPills();
        hideTurnIntoDropdown();
        hideAIDropdown();
        hideAIResponse();
        hideInlineComment();
        hideEmbedPicker();
        hideMentionDropdown();
        // Close Ask AI panel and other AI panels
        if (ERM.reportEditorAI && ERM.reportEditorAI.closeAllPanels) {
          ERM.reportEditorAI.closeAllPanels();
        }
      }
    });

    // NOTE: Floating block handle has been replaced by inline block controls
    // Each block now has its own .block-controls element that appears on hover
    // The hover behavior is handled by CSS (:hover on .editor-v2-block)
  }

  /**
   * Handle keydown in editor
   */
  function handleKeydown(e) {
    // Skip if in block selection mode - let the block selection keydown handler handle it
    if (state.blockSelectionMode && state.selectedBlocks.length > 0) {
      // Only intercept Delete/Backspace/Escape - these are handled by block selection
      if (e.key === 'Delete' || e.key === 'Backspace' || e.key === 'Escape') {
        return; // Let the document-level block selection handler process this
      }
    }

    // Handle typing when multi-block selection exists
    // This ensures proper block cleanup when user types to replace a cross-block selection
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      var selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        if (!range.collapsed) {
          // Check if selection spans multiple blocks
          var startBlock = range.startContainer.nodeType === 3
            ? range.startContainer.parentNode.closest('.editor-v2-block')
            : range.startContainer.closest ? range.startContainer.closest('.editor-v2-block') : null;
          var endBlock = range.endContainer.nodeType === 3
            ? range.endContainer.parentNode.closest('.editor-v2-block')
            : range.endContainer.closest ? range.endContainer.closest('.editor-v2-block') : null;

          if (startBlock && endBlock && startBlock !== endBlock) {
            // Selection spans multiple blocks - handle it
            e.preventDefault();

            // Delete the selected content first
            range.deleteContents();

            // Merge blocks and cleanup
            var endContentEl = endBlock.querySelector('[contenteditable="true"]');
            var endContent = endContentEl ? endContentEl.innerHTML : '';

            var startContentEl = startBlock.querySelector('[contenteditable="true"]');
            if (startContentEl) {
              // Insert the typed character at cursor position, then append remaining end content
              startContentEl.innerHTML = startContentEl.innerHTML + e.key + endContent;

              // Remove intermediate and end blocks
              var blocksToRemove = [];
              var currentBlock = startBlock.nextElementSibling;
              while (currentBlock) {
                if (currentBlock.classList.contains('editor-v2-block')) {
                  blocksToRemove.push(currentBlock);
                }
                if (currentBlock === endBlock) break;
                currentBlock = currentBlock.nextElementSibling;
              }
              for (var bi = 0; bi < blocksToRemove.length; bi++) {
                blocksToRemove[bi].remove();
              }

              // Focus start block
              startContentEl.focus();
              // Place cursor after the typed character
              try {
                var newRange = document.createRange();
                var textNodes = [];
                var walker = document.createTreeWalker(startContentEl, NodeFilter.SHOW_TEXT, null, false);
                var node;
                while ((node = walker.nextNode())) textNodes.push(node);
                if (textNodes.length > 0) {
                  // Find where the typed character was inserted (after original content)
                  var insertPos = startContentEl.innerHTML.indexOf(e.key);
                  if (insertPos !== -1) {
                    // Simple approach: put cursor at end of start block's original content + 1
                    newRange.setStart(textNodes[textNodes.length - 1], 1);
                    newRange.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(newRange);
                  }
                }
              } catch (err) {
                console.log('Multi-block type cursor positioning error:', err);
              }
            }

            syncContentFromDOM();
            markDirty(true);
            return;
          }
        }
      }
    }

    // Detect / at start of line or after space
    if (e.key === '/') {
      var selection = window.getSelection();
      if (selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);
        var textBefore = range.startContainer.textContent.substring(0, range.startOffset);

        // Show slash menu if at start or after whitespace
        if (textBefore === '' || /\s$/.test(textBefore)) {
          e.preventDefault();
          showSlashMenu();
        }
      }
    }

    // Enter key handling - SIMPLE like Notion/Word
    // Shift+Enter = soft line break (let browser handle it)
    if (e.key === 'Enter' && !e.shiftKey) {
      // Don't handle if slash menu is open
      if (state.slashMenuVisible) {
        return; // Let slash menu handle Enter
      }

      // Find the closest block from the active element (where cursor is)
      var activeEl = document.activeElement;
      var block = activeEl ? activeEl.closest('.editor-v2-block') : null;

      // Also try e.target if activeElement doesn't give us a block
      if (!block) {
        block = e.target.closest('.editor-v2-block');
      }

      if (!block) {
        console.log('Enter: No block found');
        return;
      }

      var blockType = block.getAttribute('data-block-type');

      // Skip dividers and embeds - just create new paragraph after
      if (blockType === 'divider' || blockType === 'embed') {
        e.preventDefault();
        insertBlockAfter(block, 'paragraph', '');
        return;
      }

      // SPECIAL: Handle bullet_list and numbered_list blocks (multi-item lists from AI)
      if (blockType === 'bullet_list' || blockType === 'numbered_list') {
        var listItem = activeEl.closest('li');
        if (listItem) {
          e.preventDefault();
          var listEl = block.querySelector('ul, ol');
          var text = (listItem.textContent || '').replace(/\u200B/g, '');

          // If empty list item, exit to paragraph after list
          if (text.trim() === '') {
            // Check if this is the last item
            var allItems = listEl ? listEl.querySelectorAll('li') : [];
            if (allItems.length <= 1) {
              // Convert entire block to paragraph
              convertBlock(block, 'paragraph');
            } else {
              // Remove this empty item and create paragraph after block
              listItem.remove();
              insertBlockAfter(block, 'paragraph', '');
              syncContentFromDOM();
              markDirty(true);
            }
            return;
          }

          // Split content at cursor and create new list item
          var selection = window.getSelection();
          var range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

          var htmlBefore = '';
          var htmlAfter = '';

          if (range) {
            try {
              var beforeRange = document.createRange();
              beforeRange.selectNodeContents(listItem);
              beforeRange.setEnd(range.startContainer, range.startOffset);

              var afterRange = document.createRange();
              afterRange.selectNodeContents(listItem);
              afterRange.setStart(range.endContainer, range.endOffset);

              var tempDiv = document.createElement('div');
              tempDiv.appendChild(beforeRange.cloneContents());
              htmlBefore = tempDiv.innerHTML;

              tempDiv.innerHTML = '';
              tempDiv.appendChild(afterRange.cloneContents());
              htmlAfter = tempDiv.innerHTML;
            } catch (err) {
              htmlBefore = listItem.innerHTML || '';
              htmlAfter = '';
            }
          } else {
            htmlBefore = listItem.innerHTML || '';
            htmlAfter = '';
          }

          // Update current item with content before cursor
          listItem.innerHTML = htmlBefore;

          // Create new list item with content after cursor
          var newItem = document.createElement('li');
          newItem.setAttribute('contenteditable', 'true');
          newItem.setAttribute('data-placeholder', 'List item');
          newItem.innerHTML = htmlAfter;

          // Insert after current item
          if (listItem.nextSibling) {
            listEl.insertBefore(newItem, listItem.nextSibling);
          } else {
            listEl.appendChild(newItem);
          }

          // Focus new item
          focusElementAtStart(newItem);
          syncContentFromDOM();
          markDirty(true);
          // Check for page overflow after adding new list item
          setTimeout(function() {
            schedulePageAwarenessUpdate();
          }, 10);
          return;
        }
      }

      // SPECIAL: Handle table blocks - Tab between cells, Enter creates new row or exits
      if (blockType === 'table') {
        e.preventDefault();
        // For tables, Enter just moves to the next row (or creates paragraph after)
        var cell = activeEl.closest('th, td');
        if (cell) {
          var row = cell.closest('tr');
          var nextRow = row ? row.nextElementSibling : null;
          if (nextRow) {
            // Move to first cell of next row
            var firstCell = nextRow.querySelector('th, td');
            if (firstCell) {
              focusElementAtStart(firstCell);
            }
          } else {
            // Last row - create paragraph after table
            insertBlockAfter(block, 'paragraph', '');
          }
        }
        return;
      }

      // MUST preventDefault BEFORE any DOM manipulation
      e.preventDefault();

      // The contenteditable element is what we're typing in
      // For paragraphs: .block-content[contenteditable]
      // For headings: h1/h2/h3[contenteditable]
      // For lists: li[contenteditable]
      var contentEl = activeEl;
      if (!contentEl || contentEl.getAttribute('contenteditable') !== 'true') {
        contentEl = block.querySelector('[contenteditable="true"]');
      }

      if (!contentEl) {
        // No editable content found, just create new paragraph
        insertBlockAfter(block, 'paragraph', '');
        return;
      }

      // Get selection and range for cursor position BEFORE any DOM changes
      var selection = window.getSelection();
      var range = selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

      // Get full text content for determining list continuation
      var fullText = contentEl.textContent || '';

      // We need to split the HTML content, not just text
      // Use Range to extract content before and after cursor
      var htmlBefore = '';
      var htmlAfter = '';

      if (range) {
        try {
          // Create range for content BEFORE cursor
          var beforeRange = document.createRange();
          beforeRange.selectNodeContents(contentEl);
          beforeRange.setEnd(range.startContainer, range.startOffset);

          // Create range for content AFTER cursor
          var afterRange = document.createRange();
          afterRange.selectNodeContents(contentEl);
          afterRange.setStart(range.endContainer, range.endOffset);

          // Extract HTML fragments
          var beforeFragment = beforeRange.cloneContents();
          var afterFragment = afterRange.cloneContents();

          // Convert fragments to HTML strings
          var tempDiv = document.createElement('div');
          tempDiv.appendChild(beforeFragment);
          htmlBefore = tempDiv.innerHTML;

          tempDiv.innerHTML = '';
          tempDiv.appendChild(afterFragment);
          htmlAfter = tempDiv.innerHTML;
        } catch (err) {
          console.log('Enter: Error splitting HTML content', err);
          // Fallback to full content in current block
          htmlBefore = contentEl.innerHTML || '';
          htmlAfter = '';
        }
      } else {
        // No range, keep all content in current block
        htmlBefore = contentEl.innerHTML || '';
        htmlAfter = '';
      }

      // Calculate text position for list continuation check
      var textBefore = '';
      try {
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(contentEl);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        textBefore = preCaretRange.toString();
      } catch (err) {
        textBefore = fullText;
      }

      // Determine new block type - headings create paragraphs, lists continue as lists
      var newBlockType = 'paragraph';
      // Handle both single-item (bullet/number) and multi-item (bullet_list/numbered_list) formats
      if (blockType === 'bullet' || blockType === 'bullet_list' || blockType === 'number' || blockType === 'numbered_list') {
        // Continue list if current line has content, otherwise exit list
        if (textBefore.trim() !== '') {
          // Use single-item format for new blocks
          newBlockType = (blockType === 'bullet' || blockType === 'bullet_list') ? 'bullet' : 'number';
        }
      }

      // Update current block's content with HTML BEFORE cursor
      contentEl.innerHTML = htmlBefore;

      // Create new block with HTML AFTER cursor - this handles focus
      var newBlock = insertBlockAfter(block, newBlockType, htmlAfter);

      // Sync state after DOM changes
      syncContentFromDOM();
    }

    // Backspace - Notion-like behavior
    if (e.key === 'Backspace') {
      var activeEl = document.activeElement;
      var block = activeEl ? activeEl.closest('.editor-v2-block') : null;

      if (!block) {
        block = e.target.closest('.editor-v2-block');
      }

      if (!block) return; // Let browser handle if no block

      var contentEl = activeEl;
      if (!contentEl || contentEl.getAttribute('contenteditable') !== 'true') {
        contentEl = block.querySelector('[contenteditable="true"]');
      }

      if (!contentEl) {
        // Special case: pagebreak blocks have no contenteditable
        var blockType = block.getAttribute('data-block-type');
        if (blockType === 'pagebreak' || blockType === 'divider') {
          e.preventDefault();
          var prevBlock = block.previousElementSibling;
          var nextBlock = block.nextElementSibling;

          // Delete the pagebreak/divider block
          block.remove();

          // Focus appropriate block
          if (prevBlock && prevBlock.classList.contains('editor-v2-block')) {
            focusBlockAtEnd(prevBlock);
          } else if (nextBlock && nextBlock.classList.contains('editor-v2-block')) {
            focusBlockAtStart(nextBlock);
          }

          syncContentFromDOM();
          markDirty(true);
          return;
        }
        return;
      }

      // Get text content (strip zero-width spaces)
      var text = (contentEl.textContent || '').replace(/\u200B/g, '');
      var blockType = block.getAttribute('data-block-type');
      console.log('[Backspace] Block type:', blockType, 'Text:', text.substring(0, 30));

      // Check if cursor is at start of the contenteditable element
      var selection = window.getSelection();
      var isAtStart = false;

      if (selection && selection.rangeCount > 0) {
        var range = selection.getRangeAt(0);

        // Handle multi-block selection (selection spans content across blocks)
        if (!range.collapsed) {
          // Check if selection spans multiple blocks
          var startBlock = range.startContainer.nodeType === 3
            ? range.startContainer.parentNode.closest('.editor-v2-block')
            : range.startContainer.closest('.editor-v2-block');
          var endBlock = range.endContainer.nodeType === 3
            ? range.endContainer.parentNode.closest('.editor-v2-block')
            : range.endContainer.closest('.editor-v2-block');

          if (startBlock && endBlock && startBlock !== endBlock) {
            // Selection spans multiple blocks - handle deletion specially
            e.preventDefault();

            // Delete the selected content
            range.deleteContents();

            // Merge the blocks if needed
            // Get remaining content from end block
            var endContentEl = endBlock.querySelector('[contenteditable="true"]');
            var endContent = endContentEl ? endContentEl.innerHTML : '';

            // Append to start block's content
            var startContentEl = startBlock.querySelector('[contenteditable="true"]');
            if (startContentEl && endContent) {
              startContentEl.innerHTML = startContentEl.innerHTML + endContent;
            }

            // Remove all blocks between start and end (inclusive of end)
            var blocksToRemove = [];
            var currentBlock = startBlock.nextElementSibling;
            while (currentBlock && currentBlock !== endBlock) {
              if (currentBlock.classList.contains('editor-v2-block')) {
                blocksToRemove.push(currentBlock);
              }
              currentBlock = currentBlock.nextElementSibling;
            }
            // Add end block to remove list
            if (endBlock && endBlock !== startBlock) {
              blocksToRemove.push(endBlock);
            }

            // Remove the blocks
            for (var bi = 0; bi < blocksToRemove.length; bi++) {
              blocksToRemove[bi].remove();
            }

            // Focus start block and place cursor at the merge point
            if (startContentEl) {
              startContentEl.focus();
            }

            syncContentFromDOM();
            markDirty(true);
            return;
          }
          // Single block selection - let browser handle it normally
          return;
        }

        // Calculate cursor position for collapsed cursor
        try {
          var preCaretRange = range.cloneRange();
          preCaretRange.selectNodeContents(contentEl);
          preCaretRange.setEnd(range.startContainer, range.startOffset);
          var cursorPos = preCaretRange.toString().replace(/\u200B/g, '').length;
          isAtStart = cursorPos === 0;
        } catch (err) {
          isAtStart = range.startOffset === 0;
        }
      }

      // SPECIAL: Handle bullet_list and numbered_list blocks (multi-item lists from AI)
      if (blockType === 'bullet_list' || blockType === 'numbered_list') {
        console.log('[Backspace] Multi-item list detected:', blockType);
        // Find list item from selection anchor (more reliable when contenteditable is on ul/ol)
        var listItem = activeEl.closest('li');
        if (!listItem && selection && selection.anchorNode) {
          var anchorNode = selection.anchorNode;
          if (anchorNode.nodeType === 3) anchorNode = anchorNode.parentNode;
          listItem = anchorNode.closest ? anchorNode.closest('li') : null;
        }
        // Get text specifically from the current list item, not the block
        var listItemText = listItem ? (listItem.textContent || '').replace(/\u200B/g, '') : text;

        // Calculate isAtStart relative to the list item, not the whole ul/ol
        var isAtListItemStart = false;
        if (listItem && selection && selection.rangeCount > 0) {
          var liRange = selection.getRangeAt(0);
          try {
            var preCaretRangeLi = liRange.cloneRange();
            preCaretRangeLi.selectNodeContents(listItem);
            preCaretRangeLi.setEnd(liRange.startContainer, liRange.startOffset);
            var cursorPosLi = preCaretRangeLi.toString().replace(/\u200B/g, '').length;
            isAtListItemStart = cursorPosLi === 0;
          } catch (err) {
            isAtListItemStart = liRange.startOffset === 0;
          }
        }
        console.log('[Backspace] isAtListItemStart:', isAtListItemStart, 'listItemText:', listItemText.substring(0, 20));

        if (listItem && isAtListItemStart && listItemText.trim() === '') {
          // Empty list item at start - remove it or delete block
          e.preventDefault();
          var listEl = block.querySelector('ul, ol');
          var allItems = listEl ? listEl.querySelectorAll('li') : [];

          if (allItems.length <= 1) {
            // Last item in list AND it's empty - DELETE the entire block (not just convert)
            var prevBlock = block.previousElementSibling;
            var allBlocks = document.querySelectorAll('.editor-v2-content .editor-v2-block');

            if (allBlocks.length <= 1) {
              // Keep at least one block - convert to empty paragraph instead
              convertBlockWithCursorAtStart(block, 'paragraph');
            } else if (prevBlock && prevBlock.classList.contains('editor-v2-block')) {
              // Delete block and focus previous
              block.remove();
              focusBlockAtEnd(prevBlock);
              updateNumberedListStarts();
              syncContentFromDOM();
              markDirty(true);
            }
          } else {
            // Multiple items - remove this item and focus previous/next
            var prevItem = listItem.previousElementSibling;
            var nextItem = listItem.nextElementSibling;
            listItem.remove();

            if (prevItem) {
              focusElementAtEnd(prevItem);
            } else if (nextItem) {
              focusElementAtStart(nextItem);
            }
            syncContentFromDOM();
            markDirty(true);
          }
          return;
        } else if (listItem && isAtListItemStart && listItemText.trim() !== '') {
          // At start of non-empty item
          var prevItem = listItem.previousElementSibling;
          if (prevItem) {
            // Has previous item - merge with it
            e.preventDefault();
            var prevText = prevItem.innerHTML || '';
            var currentText = listItem.innerHTML || '';
            var mergePoint = (prevItem.textContent || '').length;
            prevItem.innerHTML = prevText + currentText;
            listItem.remove();
            focusElementAtPosition(prevItem, mergePoint);
            syncContentFromDOM();
            markDirty(true);
            return;
          }

          // No previous item - this is the first item in the list
          // Notion/Word behavior: Convert first item to paragraph, keep rest as list
          e.preventDefault();

          // Check if previous block is a pagebreak/divider - delete it instead
          var prevBlock = block.previousElementSibling;
          if (prevBlock && prevBlock.classList.contains('editor-v2-block')) {
            var prevBlockType = prevBlock.getAttribute('data-block-type');
            if (prevBlockType === 'pagebreak' || prevBlockType === 'divider') {
              prevBlock.remove();
              syncContentFromDOM();
              markDirty(true);
              return;
            }
          }

          // Get the content from first list item
          var firstItemContent = listItem.innerHTML;
          var listEl = block.querySelector('ul, ol');
          var allItems = listEl ? listEl.querySelectorAll('li') : [];

          if (allItems.length <= 1) {
            // Only one item - convert entire block to paragraph (cursor at start for merge flow)
            convertBlockWithCursorAtStart(block, 'paragraph');
          } else {
            // Multiple items - extract first item as paragraph, keep rest as list
            // Create new paragraph block before the list
            var paragraphId = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
            var paragraphHtml = '<div class="editor-v2-block" data-block-id="' + paragraphId + '" data-block-type="paragraph">' +
              '<div class="block-controls"><button class="block-add" data-block-id="' + paragraphId + '" title="Add block">+</button><button class="block-drag" data-block-id="' + paragraphId + '" title="Drag">⋮⋮</button></div>' +
              '<div class="block-element editor-v2-paragraph"><div class="block-content" contenteditable="true">' + firstItemContent + '</div></div></div>';

            block.insertAdjacentHTML('beforebegin', paragraphHtml);

            // Remove first item from list
            listItem.remove();

            // Focus the new paragraph
            var newParagraph = document.querySelector('[data-block-id="' + paragraphId + '"]');
            if (newParagraph) {
              var newContentEl = newParagraph.querySelector('[contenteditable="true"]');
              if (newContentEl) {
                newContentEl.focus();
                // Place cursor at start
                var range = document.createRange();
                range.selectNodeContents(newContentEl);
                range.collapse(true);
                var sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
              }
            }

            syncContentFromDOM();
            markDirty(true);
          }
          return;
        }
        // Otherwise let browser handle normal backspace within list item
        return;
      }

      // SPECIAL: Handle table blocks - don't merge cells on backspace
      if (blockType === 'table') {
        var cell = activeEl.closest('th, td');
        if (cell && isAtStart) {
          // At start of cell - move to previous cell instead of merging
          e.preventDefault();
          var prevCell = cell.previousElementSibling;
          if (prevCell) {
            focusElementAtEnd(prevCell);
          } else {
            // First cell in row - try previous row's last cell
            var row = cell.closest('tr');
            var prevRow = row ? row.previousElementSibling : null;
            if (prevRow) {
              var lastCell = prevRow.querySelector('th:last-child, td:last-child');
              if (lastCell) {
                focusElementAtEnd(lastCell);
              }
            }
          }
          return;
        }
        // Let browser handle normal backspace within cell
        return;
      }

      // RULE A: Handle single-item list blocks (bullet/number type)
      // These are blocks with a single <li> inside (created via slash commands)
      if (blockType === 'bullet' || blockType === 'number') {
        console.log('[Backspace] Single-item list detected, isAtStart:', isAtStart, 'text:', text);
        if (isAtStart) {
          e.preventDefault();

          // Check if previous block is a pagebreak/divider - delete it instead
          var prevBlock = block.previousElementSibling;
          if (prevBlock && prevBlock.classList.contains('editor-v2-block')) {
            var prevBlockType = prevBlock.getAttribute('data-block-type');
            if (prevBlockType === 'pagebreak' || prevBlockType === 'divider') {
              prevBlock.remove();
              syncContentFromDOM();
              markDirty(true);
              return;
            }
          }

          // If list is EMPTY: delete block and focus previous (like empty paragraph)
          if (text.trim() === '') {
            console.log('[Backspace] Empty single-item list - deleting block');
            var allBlocks = document.querySelectorAll('.editor-v2-content .editor-v2-block');
            if (allBlocks.length <= 1) {
              // Keep at least one block - convert to paragraph instead
              convertBlockWithCursorAtStart(block, 'paragraph');
              return;
            }
            if (prevBlock && prevBlock.classList.contains('editor-v2-block')) {
              block.remove();
              focusBlockAtEnd(prevBlock);
              updateNumberedListStarts();
              syncContentFromDOM();
              markDirty(true);
            }
            return;
          }

          // If list has CONTENT: convert to paragraph, cursor at START for merge flow
          console.log('[Backspace] Converting single-item list to paragraph (cursor at start)');
          convertBlockWithCursorAtStart(block, 'paragraph');
          return;
        }
      }

      // RULE A2: Empty non-list block - delete it and focus previous
      if (text.trim() === '' && isAtStart) {
        var prevBlock = block.previousElementSibling;

        // Don't delete if it's the only block
        var allBlocks = document.querySelectorAll('.editor-v2-content .editor-v2-block');
        if (allBlocks.length <= 1) {
          return; // Keep at least one block
        }

        if (prevBlock && prevBlock.classList.contains('editor-v2-block')) {
          e.preventDefault();

          var prevBlockType = prevBlock.getAttribute('data-block-type');

          // If previous block is pagebreak/divider, delete IT instead
          if (prevBlockType === 'pagebreak' || prevBlockType === 'divider') {
            prevBlock.remove();
            syncContentFromDOM();
            markDirty(true);
            return;
          }

          // Delete current empty block
          block.remove();

          // Focus previous block at end
          focusBlockAtEnd(prevBlock);

          // Update numbered list start values after deletion
          updateNumberedListStarts();

          // Sync state
          syncContentFromDOM();
          markDirty(true); // Immediate save for block deletion
          return;
        }
      }

      // RULE B: At start of non-empty block - merge with previous
      if (isAtStart && text.trim() !== '') {
        var prevBlock = block.previousElementSibling;

        if (prevBlock && prevBlock.classList.contains('editor-v2-block')) {
          var prevType = prevBlock.getAttribute('data-block-type');

          // Delete pagebreaks and dividers when backspacing into them
          if (prevType === 'pagebreak' || prevType === 'divider') {
            e.preventDefault();
            prevBlock.remove();
            syncContentFromDOM();
            markDirty(true);
            return;
          }

          // Don't merge with embeds
          if (prevType === 'embed') {
            return; // Let browser handle
          }

          e.preventDefault();

          // Get previous block's editable element
          var prevContentEl = prevBlock.querySelector('[contenteditable="true"]');
          if (!prevContentEl) return;

          // Get previous block's text length (for cursor positioning)
          var prevText = prevContentEl.textContent || '';
          var mergePoint = prevText.length;

          // Get HTML content from both blocks to preserve formatting
          var prevHtml = prevContentEl.innerHTML || '';
          var currentHtml = contentEl.innerHTML || '';

          // Append current block's HTML to previous block (preserves formatting)
          prevContentEl.innerHTML = prevHtml + currentHtml;

          // Delete current block
          block.remove();

          // Focus previous block at merge point
          focusBlockAtPosition(prevBlock, mergePoint);

          // Update numbered list start values after merge
          updateNumberedListStarts();

          // Sync state
          syncContentFromDOM();
          markDirty(true); // Immediate save for block merge
          return;
        }
      }

      // RULE C: At start of heading/quote/callout - convert to paragraph first (cursor at start for merge flow)
      if (isAtStart && blockType !== 'paragraph') {
        e.preventDefault();
        convertBlockWithCursorAtStart(block, 'paragraph');
        return;
      }

      // Otherwise let browser handle normal backspace
    }

    // Arrow key navigation between blocks
    // ArrowUp/ArrowLeft at start → focus previous block at end
    // ArrowDown/ArrowRight at end → focus next block at start
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      var activeEl = document.activeElement;
      var block = activeEl ? activeEl.closest('.editor-v2-block') : null;

      if (!block) {
        block = e.target.closest('.editor-v2-block');
      }

      if (!block) return; // Let browser handle if no block

      var contentEl = activeEl;
      if (!contentEl || contentEl.getAttribute('contenteditable') !== 'true') {
        contentEl = block.querySelector('[contenteditable="true"]');
      }

      if (!contentEl) return; // Let browser handle

      var blockType = block.getAttribute('data-block-type');

      // Don't interfere with table navigation
      if (blockType === 'table') return;

      // Get selection to determine cursor position
      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      var range = selection.getRangeAt(0);
      if (!range.collapsed) return; // Let browser handle non-collapsed selections

      // Calculate cursor position within the contenteditable
      var isAtStart = false;
      var isAtEnd = false;

      try {
        // Check if at start
        var preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(contentEl);
        preCaretRange.setEnd(range.startContainer, range.startOffset);
        var textBefore = preCaretRange.toString().replace(/\u200B/g, '');
        isAtStart = textBefore.length === 0;

        // Check if at end
        var postCaretRange = range.cloneRange();
        postCaretRange.selectNodeContents(contentEl);
        postCaretRange.setStart(range.endContainer, range.endOffset);
        var textAfter = postCaretRange.toString().replace(/\u200B/g, '');
        isAtEnd = textAfter.length === 0;
      } catch (err) {
        // Fallback: use simple offset check
        isAtStart = range.startOffset === 0;
        var textContent = contentEl.textContent || '';
        isAtEnd = range.endOffset >= textContent.length;
      }

      // ArrowUp or ArrowLeft at start of block → focus previous block at end
      if ((e.key === 'ArrowUp' || e.key === 'ArrowLeft') && isAtStart) {
        var prevBlock = block.previousElementSibling;
        while (prevBlock && !prevBlock.classList.contains('editor-v2-block')) {
          prevBlock = prevBlock.previousElementSibling;
        }

        if (prevBlock) {
          var prevType = prevBlock.getAttribute('data-block-type');

          // Skip pagebreaks and dividers - go to block before them
          if (prevType === 'pagebreak' || prevType === 'divider') {
            var skipBlock = prevBlock.previousElementSibling;
            while (skipBlock && !skipBlock.classList.contains('editor-v2-block')) {
              skipBlock = skipBlock.previousElementSibling;
            }
            if (skipBlock) {
              prevBlock = skipBlock;
              prevType = prevBlock.getAttribute('data-block-type');
            }
          }

          // Don't navigate into embeds
          if (prevType === 'embed') return;

          e.preventDefault();
          focusBlockAtEnd(prevBlock);
          return;
        }
      }

      // ArrowDown or ArrowRight at end of block → focus next block at start
      if ((e.key === 'ArrowDown' || e.key === 'ArrowRight') && isAtEnd) {
        var nextBlock = block.nextElementSibling;
        while (nextBlock && !nextBlock.classList.contains('editor-v2-block')) {
          nextBlock = nextBlock.nextElementSibling;
        }

        if (nextBlock) {
          var nextType = nextBlock.getAttribute('data-block-type');

          // Skip pagebreaks and dividers - go to block after them
          if (nextType === 'pagebreak' || nextType === 'divider') {
            var skipBlock = nextBlock.nextElementSibling;
            while (skipBlock && !skipBlock.classList.contains('editor-v2-block')) {
              skipBlock = skipBlock.nextElementSibling;
            }
            if (skipBlock) {
              nextBlock = skipBlock;
              nextType = nextBlock.getAttribute('data-block-type');
            }
          }

          // Don't navigate into embeds
          if (nextType === 'embed') return;

          e.preventDefault();
          focusBlockAtStart(nextBlock);
          return;
        }
      }

      // Otherwise let browser handle normal arrow navigation within block
    }
  }

  /**
   * Focus any element (li, td, th, etc.) and place cursor at end
   */
  function focusElementAtEnd(el) {
    if (!el) return;

    setTimeout(function() {
      // Find the contenteditable parent if el itself isn't editable
      var editableEl = el;
      if (el.getAttribute('contenteditable') !== 'true') {
        editableEl = el.closest('[contenteditable="true"]') || el;
      }
      editableEl.focus();

      try {
        var range = document.createRange();
        var sel = window.getSelection();

        if (el.lastChild) {
          if (el.lastChild.nodeType === Node.TEXT_NODE) {
            range.setStart(el.lastChild, el.lastChild.length);
          } else {
            range.setStartAfter(el.lastChild);
          }
        } else {
          range.setStart(el, 0);
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        console.log('focusElementAtEnd error:', err);
      }
    }, 0);
  }

  /**
   * Focus any element and place cursor at start
   */
  function focusElementAtStart(el) {
    if (!el) return;

    setTimeout(function() {
      // Find the contenteditable parent if el itself isn't editable
      var editableEl = el;
      if (el.getAttribute('contenteditable') !== 'true') {
        editableEl = el.closest('[contenteditable="true"]') || el;
      }
      editableEl.focus();

      try {
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(el, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        console.log('focusElementAtStart error:', err);
      }
    }, 0);
  }

  /**
   * Focus any element and place cursor at specific character position
   */
  function focusElementAtPosition(el, position) {
    if (!el) return;

    setTimeout(function() {
      // Find the contenteditable parent if el itself isn't editable
      var editableEl = el;
      if (el.getAttribute('contenteditable') !== 'true') {
        editableEl = el.closest('[contenteditable="true"]') || el;
      }
      editableEl.focus();

      try {
        var range = document.createRange();
        var sel = window.getSelection();

        // Find the text node and offset
        var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
        var node;
        var charCount = 0;

        while ((node = walker.nextNode())) {
          var nodeLength = node.textContent.length;
          if (charCount + nodeLength >= position) {
            range.setStart(node, position - charCount);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
          charCount += nodeLength;
        }

        // Position not found, place at end
        if (el.lastChild) {
          if (el.lastChild.nodeType === Node.TEXT_NODE) {
            range.setStart(el.lastChild, el.lastChild.length);
          } else {
            range.setStartAfter(el.lastChild);
          }
        } else {
          range.setStart(el, 0);
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        console.log('focusElementAtPosition error:', err);
      }
    }, 0);
  }

  /**
   * Focus a block and place cursor at start
   * For multi-item lists, focuses the FIRST list item
   */
  function focusBlockAtStart(block) {
    if (!block) return;

    setTimeout(function() {
      var blockType = block.getAttribute('data-block-type');
      var contentEl;

      // For multi-item lists, focus the first list item
      if (blockType === 'bullet_list' || blockType === 'numbered_list') {
        contentEl = block.querySelector('li[contenteditable="true"]');
      }

      // Fallback to first contenteditable
      if (!contentEl) {
        contentEl = block.querySelector('[contenteditable="true"]');
      }

      if (!contentEl) return;

      contentEl.focus();

      // Place cursor at start
      try {
        var range = document.createRange();
        var sel = window.getSelection();
        range.setStart(contentEl, 0);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        console.log('focusBlockAtStart error:', err);
      }
    }, 0);
  }

  /**
   * Focus a block and place cursor at end
   * For multi-item lists, focuses the LAST list item
   */
  function focusBlockAtEnd(block) {
    if (!block) return;

    setTimeout(function() {
      var blockType = block.getAttribute('data-block-type');
      var contentEl;

      // For multi-item lists, focus the last list item
      if (blockType === 'bullet_list' || blockType === 'numbered_list') {
        var listItems = block.querySelectorAll('li[contenteditable="true"]');
        contentEl = listItems.length > 0 ? listItems[listItems.length - 1] : null;
      }

      // Fallback to first contenteditable
      if (!contentEl) {
        contentEl = block.querySelector('[contenteditable="true"]');
      }

      if (!contentEl) return;

      contentEl.focus();

      // Place cursor at end
      try {
        var range = document.createRange();
        var sel = window.getSelection();

        if (contentEl.lastChild) {
          if (contentEl.lastChild.nodeType === Node.TEXT_NODE) {
            range.setStart(contentEl.lastChild, contentEl.lastChild.length);
          } else {
            range.setStartAfter(contentEl.lastChild);
          }
        } else {
          range.setStart(contentEl, 0);
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        console.log('focusBlockAtEnd error:', err);
      }
    }, 0);
  }

  /**
   * Focus a block and place cursor at specific position
   */
  function focusBlockAtPosition(block, position) {
    if (!block) return;

    setTimeout(function() {
      var contentEl = block.querySelector('[contenteditable="true"]');
      if (!contentEl) return;

      contentEl.focus();

      // Place cursor at position
      try {
        var range = document.createRange();
        var sel = window.getSelection();

        // Find the text node and offset
        var walker = document.createTreeWalker(contentEl, NodeFilter.SHOW_TEXT, null, false);
        var node;
        var charCount = 0;

        while ((node = walker.nextNode())) {
          var nodeLength = node.textContent.length;
          if (charCount + nodeLength >= position) {
            range.setStart(node, position - charCount);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            return;
          }
          charCount += nodeLength;
        }

        // Fallback - place at end
        if (contentEl.lastChild) {
          if (contentEl.lastChild.nodeType === Node.TEXT_NODE) {
            range.setStart(contentEl.lastChild, contentEl.lastChild.length);
          } else {
            range.setStartAfter(contentEl.lastChild);
          }
        } else {
          range.setStart(contentEl, 0);
        }
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (err) {
        console.log('focusBlockAtPosition error:', err);
      }
    }, 0);
  }

  /**
   * Handle input in editor
   * IMPORTANT: Markdown shortcuts only convert the SPECIFIC block being edited
   */
  function handleInput(e) {
    markDirty();

    // Schedule page awareness update (debounced)
    schedulePageAwarenessUpdate();

    // Auto-detect markdown-style formatting
    var target = e.target;
    if (target.getAttribute('contenteditable') === 'true') {
      var text = target.textContent;
      var block = target.closest('.editor-v2-block');

      // Skip if no block found or if this block is already being converted
      if (!block || block.hasAttribute('data-converting')) return;

      // Get the specific block ID for tracking
      var blockId = block.getAttribute('data-block-id');

      // Check for heading patterns - convert ONLY this block
      if (/^# /.test(text)) {
        block.setAttribute('data-converting', 'true');
        target.textContent = text.substring(2);
        convertBlock(block, 'heading1');
      } else if (/^## /.test(text)) {
        block.setAttribute('data-converting', 'true');
        target.textContent = text.substring(3);
        convertBlock(block, 'heading2');
      } else if (/^### /.test(text)) {
        block.setAttribute('data-converting', 'true');
        target.textContent = text.substring(4);
        convertBlock(block, 'heading3');
      } else if (/^- /.test(text) || /^\* /.test(text)) {
        block.setAttribute('data-converting', 'true');
        target.textContent = text.substring(2);
        convertBlock(block, 'bullet');
      } else if (/^1\. /.test(text)) {
        block.setAttribute('data-converting', 'true');
        target.textContent = text.substring(3);
        convertBlock(block, 'number');
      } else if (/^> /.test(text)) {
        block.setAttribute('data-converting', 'true');
        target.textContent = text.substring(2);
        convertBlock(block, 'quote');
      } else if (/^---$/.test(text) || /^\*\*\*$/.test(text)) {
        block.setAttribute('data-converting', 'true');
        convertBlock(block, 'divider');
        // Insert paragraph after THIS specific divider using the new activeBlock
        setTimeout(function() {
          if (state.activeBlock && state.activeBlock.getAttribute('data-block-type') === 'divider') {
            insertBlockAfter(state.activeBlock, 'paragraph');
          }
        }, 10);
      }
    }
  }

  /**
   * Handle mouseup for text selection
   * CRITICAL: This must NOT interfere with block selection mode
   */
  function handleMouseup(e) {
    // CRITICAL: If we're in block selection mode, do NOT show text toolbar
    // Block selection takes precedence over text selection
    if (state.blockSelectionMode) {
      console.log('[V2] Mouseup ignored - in block selection mode');
      return;
    }

    // If user is dragging blocks, ignore text selection
    if (state.isBlockDragging) {
      console.log('[V2] Mouseup ignored - block drag in progress');
      return;
    }

    // CRITICAL: Don't process mouseup if it originated from AI panels
    // This prevents the selection from being cleared when clicking inside Ask AI panel
    var askAiPanel = document.getElementById('ask-ai-panel');
    var aiResponsePanel = document.getElementById('ai-inline-response');
    var aiActionsDropdown = document.getElementById('ai-actions-dropdown');
    var floatingToolbar = document.getElementById('report-floating-toolbar');

    if (askAiPanel && askAiPanel.contains(e.target)) {
      console.log('[V2] Mouseup inside Ask AI panel - preserving selection');
      return;
    }
    if (aiResponsePanel && aiResponsePanel.contains(e.target)) {
      console.log('[V2] Mouseup inside AI response panel - preserving selection');
      return;
    }
    if (aiActionsDropdown && aiActionsDropdown.contains(e.target)) {
      console.log('[V2] Mouseup inside AI actions dropdown - preserving selection');
      return;
    }
    // Also ignore clicks on the floating toolbar itself
    if (floatingToolbar && floatingToolbar.contains(e.target)) {
      console.log('[V2] Mouseup inside floating toolbar - preserving selection');
      return;
    }

    // Check if click was on a block select button (block selection trigger)
    var selectBtn = e.target.closest('.block-select');
    if (selectBtn) {
      console.log('[V2] Mouseup on block select - not showing text toolbar');
      return;
    }

    setTimeout(function() {
      // Double-check we're not in block selection mode after timeout
      if (state.blockSelectionMode) {
        console.log('[V2] Block selection mode activated during timeout - hiding toolbar');
        hideSelectionPills();
        return;
      }

      var selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        hideSelectionPills();
        return;
      }

      var selectedText = selection.toString().trim();

      if (selectedText.length > 0) {
        // Clear any block selection when text is selected
        if (state.selectedBlocks.length > 0) {
          clearBlockSelection();
        }

        state.currentSelection = selectedText;
        state.currentRange = selection.getRangeAt(0).cloneRange();

        // Update AI module state for Ask AI panel
        if (ERM.reportEditorAI) {
          ERM.reportEditorAI.setState('selection', selectedText);
          ERM.reportEditorAI.setState('selectionRange', state.currentRange);
          ERM.reportEditorAI.setState('activeBlock', state.activeBlock);
        }

        console.log('[V2] Text selected:', selectedText.substring(0, 50) + '...');
        showSelectionPills(selection);
      } else {
        // Only hide if AI panels are not visible
        var askAiPanelVisible = askAiPanel && askAiPanel.classList.contains('visible');
        var aiResponseVisible = aiResponsePanel && aiResponsePanel.classList.contains('visible');

        if (!askAiPanelVisible && !aiResponseVisible) {
          hideSelectionPills();
        }
      }
    }, 10);
  }

  // NOTE: positionFloatingHandle and hideFloatingHandle removed
  // Block controls are now inline within each block (Notion-style)
  // Hover behavior is handled by CSS :hover on .editor-v2-block

  /**
   * Show slash command menu
   */
  function showSlashMenu() {
    // Hide old toolbar if it exists (prevent conflicts)
    if (ERM.reportEditorAI && ERM.reportEditorAI.hideFloatingToolbar) {
      ERM.reportEditorAI.hideFloatingToolbar();
    }

    // CRITICAL: Capture the target block BEFORE the slash menu input steals focus
    // This ensures slash commands affect the correct block
    state.slashTargetBlock = state.activeBlock;

    var selection = window.getSelection();
    if (selection.rangeCount === 0) return;

    var range = selection.getRangeAt(0);
    var rect = range.getBoundingClientRect();

    // If getBoundingClientRect returns 0 for left (collapsed cursor at line start), use a marker span
    if (rect.width === 0 && rect.left === 0) {
      // Clone range to not disturb the original
      var tempRange = range.cloneRange();

      // Insert a temporary marker to get position
      var marker = document.createElement('span');
      marker.style.display = 'inline';
      marker.textContent = '\u200B'; // Zero-width space

      try {
        tempRange.insertNode(marker);
        rect = marker.getBoundingClientRect();

        // Remove marker
        if (marker.parentNode) {
          marker.parentNode.removeChild(marker);
        }

        // Normalize to clean up any empty text nodes
        if (range.startContainer && range.startContainer.parentNode) {
          range.startContainer.parentNode.normalize();
        }
      } catch (e) {
        console.log('Marker insertion failed:', e);
      }
    }

    // Fallback: if still 0, use the active block position
    if ((rect.left === 0 || !rect.left) && state.activeBlock) {
      // state.activeBlock is a DOM element, not an ID string
      var activeBlockEl = state.activeBlock.querySelector('.block-content') || state.activeBlock.querySelector('[contenteditable="true"]');
      if (activeBlockEl) {
        var blockRect = activeBlockEl.getBoundingClientRect();
        rect = {
          left: blockRect.left,
          top: blockRect.top,
          bottom: blockRect.top + 24, // Approximate line height
          right: blockRect.left + 1,
          width: 1,
          height: 24
        };
      }
    }

    var menu = document.getElementById('slash-menu');
    // Reset any constrained max-height from previous use
    menu.style.maxHeight = '';

    // Get actual menu dimensions (use CSS max-height as estimate before visible)
    // Menu uses 320px max-height (compact Notion-style)
    var viewportHeight = window.innerHeight;
    var menuMaxHeight = 320; // Match CSS max-height
    var menuWidth = 280; // Match CSS width

    // Calculate available space above and below cursor
    var cursorTop = rect.top;
    var cursorBottom = rect.bottom;
    var spaceBelow = viewportHeight - cursorBottom - 16; // 16px margin
    var spaceAbove = cursorTop - 16; // 16px margin

    // Determine if menu should open upward
    var opensUp = false;
    var top;

    if (spaceBelow >= menuMaxHeight) {
      // Enough space below - open downward (default)
      top = cursorBottom + 8;
      opensUp = false;
    } else if (spaceAbove >= menuMaxHeight) {
      // Not enough below, but enough above - open upward
      top = cursorTop - menuMaxHeight - 8;
      opensUp = true;
    } else {
      // Constrained - use whichever has more space
      if (spaceAbove > spaceBelow) {
        // Open upward, constrain to available space
        var constrainedHeight = Math.max(spaceAbove, 200);
        top = Math.max(16, cursorTop - constrainedHeight - 8);
        menu.style.maxHeight = constrainedHeight + 'px';
        opensUp = true;
      } else {
        // Open downward, constrain to available space
        var constrainedHeight = Math.max(spaceBelow, 200);
        top = cursorBottom + 8;
        menu.style.maxHeight = constrainedHeight + 'px';
        opensUp = false;
      }
    }

    // Ensure left position stays within viewport
    var left = Math.max(16, rect.left);
    if (left + menuWidth > window.innerWidth - 16) {
      left = window.innerWidth - menuWidth - 16;
    }

    // Apply positioning (fixed position - no scroll offset needed)
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';

    // Add/remove opens-up class for correct animation direction
    if (opensUp) {
      menu.classList.add('opens-up');
    } else {
      menu.classList.remove('opens-up');
    }

    menu.classList.add('visible');

    state.slashMenuVisible = true;
    state.slashMenuFilter = '';
    state.slashMenuMode = 'convert'; // Typing / converts current block

    renderSlashMenu('');
  }

  /**
   * Show slash menu positioned at a specific element (for + button)
   * This creates a NEW block after the target block instead of converting it
   */
  function showSlashMenuAtElement(element) {
    // Hide old toolbar if it exists
    if (ERM.reportEditorAI && ERM.reportEditorAI.hideFloatingToolbar) {
      ERM.reportEditorAI.hideFloatingToolbar();
    }

    var rect = element.getBoundingClientRect();
    var menu = document.getElementById('slash-menu');

    // Reset any constrained max-height from previous use
    menu.style.maxHeight = '';

    // Get actual menu dimensions (compact Notion-style)
    var viewportHeight = window.innerHeight;
    var menuMaxHeight = 320; // Match CSS max-height
    var menuWidth = 280; // Match CSS width

    // Calculate available space
    var spaceBelow = viewportHeight - rect.bottom - 16;
    var spaceAbove = rect.top - 16;

    // Determine if menu should open upward
    var opensUp = false;
    var top;

    if (spaceBelow >= menuMaxHeight) {
      // Enough space below
      top = rect.bottom + 8;
      opensUp = false;
    } else if (spaceAbove >= menuMaxHeight) {
      // Open upward
      top = rect.top - menuMaxHeight - 8;
      opensUp = true;
    } else {
      // Constrained - use whichever has more space
      if (spaceAbove > spaceBelow) {
        var constrainedHeight = Math.max(spaceAbove, 200);
        top = Math.max(16, rect.top - constrainedHeight - 8);
        menu.style.maxHeight = constrainedHeight + 'px';
        opensUp = true;
      } else {
        var constrainedHeight = Math.max(spaceBelow, 200);
        top = rect.bottom + 8;
        menu.style.maxHeight = constrainedHeight + 'px';
        opensUp = false;
      }
    }

    // Position to the right of the element, or left if needed
    var left = rect.right + 8;
    if (left + menuWidth > window.innerWidth - 16) {
      left = rect.left - menuWidth - 8;
    }
    if (left < 16) {
      left = 16;
    }

    // Apply positioning
    menu.style.top = top + 'px';
    menu.style.left = left + 'px';

    // Add/remove opens-up class for correct animation direction
    if (opensUp) {
      menu.classList.add('opens-up');
    } else {
      menu.classList.remove('opens-up');
    }

    menu.classList.add('visible');

    state.slashMenuVisible = true;
    state.slashMenuFilter = '';
    state.slashMenuMode = 'insert'; // + button inserts NEW block

    renderSlashMenu('');
  }

  /**
   * Hide slash command menu
   */
  function hideSlashMenu() {
    var menu = document.getElementById('slash-menu');
    menu.classList.remove('visible');
    menu.classList.remove('opens-up');
    // Reset constrained max-height
    menu.style.maxHeight = '';
    state.slashMenuVisible = false;
    state.slashMenuFilter = '';
    // Clear slash target after command executes (don't clear immediately - let executeSlashCommand use it first)
    setTimeout(function() {
      state.slashTargetBlock = null;
      state.insertAfterBlock = null;
      state.slashMenuMode = 'convert';
    }, 100);
  }

  /**
   * Navigate slash menu with arrow keys
   */
  function navigateSlashMenu(direction) {
    var menu = document.getElementById('slash-menu-content');
    var items = menu.querySelectorAll('.slash-menu-item');
    var current = menu.querySelector('.slash-menu-item.selected');

    var index = -1;
    if (current) {
      for (var i = 0; i < items.length; i++) {
        if (items[i] === current) {
          index = i;
          break;
        }
      }
      current.classList.remove('selected');
    }

    index += direction;
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;

    if (items[index]) {
      items[index].classList.add('selected');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * Execute slash command
   */
  function executeSlashCommand(commandId) {
    // Capture mode and blocks BEFORE hiding menu (which clears them after timeout)
    var mode = state.slashMenuMode;
    var insertAfterBlock = state.insertAfterBlock;
    var targetBlock = state.slashTargetBlock || state.activeBlock;

    hideSlashMenu();

    var command = slashCommands.find(function(cmd) { return cmd.id === commandId; });
    if (!command) return;

    // Commands with options show picker
    if (command.hasOptions) {
      showEmbedPicker(commandId);
      return;
    }

    // AI commands - use the shared Ask AI panel with context awareness
    if (commandId === 'ai') {
      if (ERM.reportEditorAI && ERM.reportEditorAI.openAskAIForBlock) {
        // Get the context block (the block the + button belongs to)
        var contextBlock = insertAfterBlock || state.activeBlock;
        if (contextBlock) {
          var blockId = contextBlock.getAttribute('data-block-id');
          var blockType = contextBlock.getAttribute('data-block-type');

          // Determine AI mode based on block type
          var aiMode = (blockType === 'embed') ? 'chart' : 'block';

          console.log('[V2 Editor] Ask AI from + button - block:', blockId, 'type:', blockType, 'mode:', aiMode);
          ERM.reportEditorAI.openAskAIForBlock(blockId, aiMode);
        } else {
          // No context block - open in generic mode
          console.log('[V2 Editor] Ask AI from + button - no context block');
          ERM.reportEditorAI.setState('currentReport', state.currentReport);
          ERM.reportEditorAI.showAskAIPanel();
        }
      } else {
        showAIPrompt(); // Fallback to V2 modal
      }
      return;
    }

    if (commandId === 'draft') {
      draftWithAI();
      return;
    }

    // Map command IDs to block types
    var blockTypeMap = {
      'text': 'paragraph',
      'h1': 'heading1',
      'h2': 'heading2',
      'h3': 'heading3',
      'bullet': 'bullet',
      'number': 'number',
      'divider': 'divider',
      'pagebreak': 'pagebreak',
      'quote': 'quote',
      'callout': 'callout'
    };

    var blockType = blockTypeMap[commandId];
    if (!blockType) return;

    // MODE: 'insert' = Create NEW block after target (from + button)
    // MODE: 'convert' = Convert existing block (from / keyboard)
    if (mode === 'insert' && insertAfterBlock) {
      // Special handling for page break - creates a new page container
      if (blockType === 'pagebreak') {
        insertPageBreak(insertAfterBlock);
        return;
      }

      // Insert a new block of the selected type AFTER the target block
      var newBlock = insertBlockAfter(insertAfterBlock, blockType, '');

      // For divider, also insert a paragraph after it
      if (blockType === 'divider' && newBlock) {
        insertBlockAfter(newBlock, 'paragraph', '');
      }
    } else if (targetBlock) {
      // Convert the existing block to the new type
      switch (commandId) {
        case 'text':
          convertBlock(targetBlock, 'paragraph');
          break;
        case 'h1':
          convertBlock(targetBlock, 'heading1');
          break;
        case 'h2':
          convertBlock(targetBlock, 'heading2');
          break;
        case 'h3':
          convertBlock(targetBlock, 'heading3');
          break;
        case 'bullet':
          convertBlock(targetBlock, 'bullet');
          break;
        case 'number':
          convertBlock(targetBlock, 'number');
          break;
        case 'divider':
          convertBlock(targetBlock, 'divider');
          insertBlockAfter(targetBlock, 'paragraph');
          break;
        case 'pagebreak':
          // Page break creates a new page container
          insertPageBreak(targetBlock);
          break;
        case 'quote':
          convertBlock(targetBlock, 'quote');
          break;
        case 'callout':
          convertBlock(targetBlock, 'callout');
          break;
      }
    }
  }

  /**
   * Show selection pills - handled by report-editor.js
   * V2 just stores selection state for Turn Into functionality
   */
  function showSelectionPills(selection) {
    // Use the new floating toolbar instead
    showFloatingToolbar(selection);
  }

  /**
   * Hide selection toolbar
   * @param {boolean} keepHighlight - If true, keep the selection highlight visible
   */
  function hideSelectionPills(keepHighlight) {
    console.log('[V2] hideSelectionPills called, keepHighlight:', keepHighlight);
    hideFloatingToolbar(keepHighlight);
    // Also hide turn-into dropdown when selection is cleared
    hideTurnIntoDropdown();
    state.selectionPillsVisible = false;
  }

  /**
   * Turn Into block types - for transforming existing blocks
   */
  var turnIntoTypes = [
    { id: 'paragraph', label: 'Text', icon: icons.text },
    { id: 'heading1', label: 'Heading 1', icon: icons.h1 },
    { id: 'heading2', label: 'Heading 2', icon: icons.h2 },
    { id: 'heading3', label: 'Heading 3', icon: icons.h3 },
    { id: 'bullet', label: 'Bulleted list', icon: icons.bullet },
    { id: 'number', label: 'Numbered list', icon: icons.number },
    { id: 'quote', label: 'Quote', icon: icons.quote },
    { id: 'callout', label: 'Callout', icon: icons.callout },
    { id: 'divider', label: 'Divider', icon: icons.divider },
    { id: 'pagebreak', label: 'Page Break', icon: icons.pagebreak }
  ];

  /**
   * Show Turn Into dropdown
   */
  function showTurnIntoDropdown(anchorEl) {
    // Accept anchor element as parameter (from existing toolbar) or fallback to old ID
    var trigger = anchorEl || document.getElementById('turn-into-trigger');
    var dropdown = document.getElementById('turn-into-dropdown');
    if (!trigger || !dropdown) return;

    var triggerRect = trigger.getBoundingClientRect();

    // Get current block type
    var currentBlockType = 'paragraph';
    if (state.activeBlock) {
      currentBlockType = state.activeBlock.getAttribute('data-block-type') || 'paragraph';
    }

    // Render items
    var itemsContainer = document.getElementById('turn-into-items');
    var html = '';
    for (var i = 0; i < turnIntoTypes.length; i++) {
      var type = turnIntoTypes[i];
      // Map multi-item list types to their single-item equivalents for display
      var normalizedCurrentType = currentBlockType;
      if (currentBlockType === 'bullet_list') normalizedCurrentType = 'bullet';
      if (currentBlockType === 'numbered_list') normalizedCurrentType = 'number';
      var isCurrent = type.id === normalizedCurrentType;
      html +=
        '<div class="turn-into-item' + (isCurrent ? ' current' : '') + '" data-type="' + type.id + '">' +
        '  <span class="turn-into-icon">' + type.icon + '</span>' +
        '  <span class="turn-into-label">' + type.label + '</span>' +
        '</div>';
    }
    itemsContainer.innerHTML = html;

    // Position dropdown below trigger
    var viewportHeight = window.innerHeight;
    var dropdownHeight = 280; // Approximate height
    var top = triggerRect.bottom + 4;

    // Flip up if not enough space below
    if (top + dropdownHeight > viewportHeight - 16) {
      top = triggerRect.top - dropdownHeight - 4;
    }

    dropdown.style.top = top + 'px';
    dropdown.style.left = triggerRect.left + 'px';
    dropdown.classList.add('visible');

    state.turnIntoVisible = true;
  }

  /**
   * Hide Turn Into dropdown
   */
  function hideTurnIntoDropdown() {
    var dropdown = document.getElementById('turn-into-dropdown');
    if (dropdown) {
      dropdown.classList.remove('visible');
    }
    state.turnIntoVisible = false;
  }

  /**
   * Execute Turn Into transformation
   * Supports single block and multi-block selection conversion
   *
   * Multi-block rules:
   * - Convert to heading: Apply to ALL selected blocks (each becomes a heading)
   * - Convert to list: ALL selected blocks become list items (preserve order)
   * - Convert to paragraph: ALL selected blocks become paragraphs
   * - Convert to quote/callout: ALL selected blocks converted individually
   * - Convert to divider/pagebreak: Replace first selected block only
   */
  function executeTurnInto(newType) {
    hideTurnIntoDropdown();
    hideSelectionPills();

    // Map turn-into types to block types
    var typeMap = {
      'paragraph': 'paragraph',
      'heading1': 'heading1',
      'heading2': 'heading2',
      'heading3': 'heading3',
      'bullet': 'bullet',
      'number': 'number',
      'quote': 'quote',
      'callout': 'callout',
      'divider': 'divider',
      'pagebreak': 'pagebreak'
    };

    var blockType = typeMap[newType] || 'paragraph';

    // Get blocks to convert - either from selection or active block
    var blocksToConvert = getSelectedBlocks();

    if (blocksToConvert.length === 0 && state.activeBlock) {
      blocksToConvert = [state.activeBlock];
    }

    if (blocksToConvert.length === 0) return;

    // Special handling for divider/pagebreak - only convert first block
    if (blockType === 'divider' || blockType === 'pagebreak') {
      var firstBlock = blocksToConvert[0];
      var currentType = firstBlock.getAttribute('data-block-type');

      // If converting FROM divider/pagebreak TO something else, create empty paragraph
      if (currentType === 'divider' || currentType === 'pagebreak') {
        convertDividerToBlock(firstBlock, 'paragraph');
      } else {
        // Converting TO divider/pagebreak - warn if content will be lost
        var editable = firstBlock.querySelector('[contenteditable="true"]');
        var hasContent = editable && editable.textContent.trim().length > 0;

        if (hasContent) {
          // Move content to new paragraph after, then convert to divider
          var content = editable.innerHTML;
          convertBlock(firstBlock, blockType);
          // Insert paragraph with the content after the divider
          var dividerBlock = document.querySelector('[data-block-id="' + firstBlock.getAttribute('data-block-id') + '"]') || state.activeBlock;
          if (dividerBlock) {
            insertBlockAfter(dividerBlock, 'paragraph', content);
          }
        } else {
          convertBlock(firstBlock, blockType);
        }
      }
      markDirty();
      return;
    }

    // Convert all selected blocks
    // Process in reverse order to maintain DOM positions during conversion
    console.log('[executeTurnInto] Converting', blocksToConvert.length, 'blocks to', blockType);
    for (var i = blocksToConvert.length - 1; i >= 0; i--) {
      var block = blocksToConvert[i];
      var currentType = block.getAttribute('data-block-type');

      // Skip dividers/pagebreaks when doing multi-block conversion to other types
      if (currentType === 'divider' || currentType === 'pagebreak') {
        // Convert divider/pagebreak to target type (becomes empty block)
        convertDividerToBlock(block, blockType);
      } else {
        convertBlock(block, blockType);
      }
    }

    // Clear block selection after conversion
    if (state.selectedBlocks && state.selectedBlocks.length > 0) {
      clearBlockSelection();
    }

    // Update numbered list starts after all conversions
    updateNumberedListStarts();
    markDirty();
  }

  /**
   * Get all blocks within the current selection
   * PRIORITY: Check checkbox-based block selection (state.selectedBlocks) FIRST
   * Then fallback to text selection range
   * Returns array of block elements in document order
   */
  function getSelectedBlocks() {
    // PRIORITY 1: Check for checkbox-based block selection (multi-select via checkboxes)
    if (state.selectedBlocks && state.selectedBlocks.length > 0) {
      console.log('[getSelectedBlocks] Using checkbox selection:', state.selectedBlocks.length, 'blocks');
      var blocks = [];
      for (var i = 0; i < state.selectedBlocks.length; i++) {
        var block = document.querySelector('[data-block-id="' + state.selectedBlocks[i] + '"]');
        if (block) blocks.push(block);
      }
      return blocks;
    }

    // PRIORITY 2: Check for text selection range
    var selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return [];

    var range = selection.getRangeAt(0);

    // If selection is collapsed, return empty (use activeBlock instead)
    if (range.collapsed) return [];

    // Find start and end blocks
    var startNode = range.startContainer;
    var endNode = range.endContainer;

    if (startNode.nodeType === 3) startNode = startNode.parentNode;
    if (endNode.nodeType === 3) endNode = endNode.parentNode;

    var startBlock = startNode.closest ? startNode.closest('.editor-v2-block') : null;
    var endBlock = endNode.closest ? endNode.closest('.editor-v2-block') : null;

    if (!startBlock) return [];
    if (!endBlock) endBlock = startBlock;

    // If same block, return just that one
    if (startBlock === endBlock) return [startBlock];

    // Collect all blocks between start and end (inclusive)
    var blocks = [];
    var allBlocks = document.querySelectorAll('.editor-v2-content .editor-v2-block');
    var inRange = false;

    for (var i = 0; i < allBlocks.length; i++) {
      var block = allBlocks[i];

      if (block === startBlock) {
        inRange = true;
      }

      if (inRange) {
        blocks.push(block);
      }

      if (block === endBlock) {
        break;
      }
    }

    return blocks;
  }

  /**
   * Convert a divider or pagebreak block to another block type
   * Since dividers have no content, creates empty block of target type
   */
  function convertDividerToBlock(block, newType) {
    var newBlockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);

    var newBlockData = {
      id: newBlockId,
      type: newType,
      content: ''
    };

    var html = renderBlock(newBlockData, 0);
    block.outerHTML = html;

    // Focus the new block
    var newEl = document.querySelector('[data-block-id="' + newBlockId + '"]');
    if (newEl) {
      state.activeBlock = newEl;
      var newEditable = newEl.querySelector('[contenteditable="true"]');
      if (newEditable) {
        newEditable.focus();
        var range = document.createRange();
        range.selectNodeContents(newEditable);
        range.collapse(true);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  }

  /**
   * Apply text formatting command
   */
  function applyFormatting(command) {
    document.execCommand(command, false, null);
    updateFormattingButtonStates();
    markDirty();
  }

  /**
   * Show AI dropdown from toolbar - with adaptive positioning
   */
  function showAIDropdownFromToolbar() {
    var aiBtn = document.getElementById('toolbar-ai');
    var dropdown = document.getElementById('ai-dropdown');
    if (!aiBtn || !dropdown) return;

    var btnRect = aiBtn.getBoundingClientRect();

    // Get dropdown dimensions
    var viewportHeight = window.innerHeight;
    var dropdownHeight = 400; // Approximate max height (adjust based on actual content)
    var dropdownWidth = 320; // Match CSS width

    // Calculate available space above and below
    var spaceBelow = viewportHeight - btnRect.bottom - 16; // 16px margin
    var spaceAbove = btnRect.top - 16; // 16px margin

    var top;
    var opensUp = false;

    // Determine if dropdown should open upward
    if (spaceBelow >= dropdownHeight) {
      // Enough space below - open downward (default)
      top = btnRect.bottom + 4;
      opensUp = false;
    } else if (spaceAbove >= dropdownHeight) {
      // Not enough below, but enough above - open upward
      top = btnRect.top - dropdownHeight - 4;
      opensUp = true;
    } else {
      // Constrained - use whichever has more space
      if (spaceAbove > spaceBelow) {
        // Open upward, constrain to available space
        var constrainedHeight = Math.max(spaceAbove, 200);
        top = Math.max(16, btnRect.top - constrainedHeight - 4);
        dropdown.style.maxHeight = constrainedHeight + 'px';
        opensUp = true;
      } else {
        // Open downward, constrain to available space
        var constrainedHeight = Math.max(spaceBelow, 200);
        top = btnRect.bottom + 4;
        dropdown.style.maxHeight = constrainedHeight + 'px';
        opensUp = false;
      }
    }

    // Ensure left position stays within viewport
    var left = btnRect.left;
    if (left + dropdownWidth > window.innerWidth - 16) {
      left = window.innerWidth - dropdownWidth - 16;
    }

    // Position dropdown
    dropdown.style.top = top + 'px';
    dropdown.style.left = left + 'px';

    // Add/remove opens-up class for animation direction
    if (opensUp) {
      dropdown.classList.add('opens-up');
    } else {
      dropdown.classList.remove('opens-up');
    }

    dropdown.classList.add('visible');

    state.aiDropdownVisible = true;

    // Highlight the selected text so it stays visible while AI dropdown is open
    if (ERM.reportEditorAI && ERM.reportEditorAI.highlightSelection) {
      ERM.reportEditorAI.highlightSelection();
    }
  }

  /**
   * Show AI dropdown - DISABLED: Using old purple toolbar from report-editor.js
   */
  function showAIDropdown() {
    // No-op: AI dropdown is handled by report-editor.js
    return;
  }

  /**
   * Hide AI dropdown
   * @param {boolean} keepHighlight - If true, don't remove the selection highlight (used when executing an action)
   */
  function hideAIDropdown(keepHighlight) {
    var dropdown = document.getElementById('ai-dropdown');
    if (dropdown) {
      dropdown.classList.remove('visible');
      dropdown.classList.remove('opens-up');
      // Reset any constrained max-height
      dropdown.style.maxHeight = '';
    }
    state.aiDropdownVisible = false;

    // Check if AI inline response panel is visible - if so, keep highlight
    var aiResponsePanel = document.getElementById('ai-inline-response');
    var aiResponseVisible = aiResponsePanel && aiResponsePanel.classList.contains('visible');

    // Check if Ask AI panel is visible
    var askAiPanel = document.getElementById('ask-ai-panel');
    var askAiVisible = askAiPanel && askAiPanel.classList.contains('visible');

    // Remove selection highlight when closing dropdown ONLY if:
    // - keepHighlight is false
    // - AI response panel is NOT visible
    // - Ask AI panel is NOT visible
    if (!keepHighlight && !aiResponseVisible && !askAiVisible && ERM.reportEditorAI && ERM.reportEditorAI.unhighlightSelection) {
      ERM.reportEditorAI.unhighlightSelection();
    }
  }

  /**
   * Execute AI action - uses ERM.aiService.executeAction for proper actions
   */
  /**
   * Helper to set content in AI inline panel
   * Actions are now OUTSIDE contentDiv, so we just update text-wrap
   */
  function setAIInlineContent(contentDiv, html) {
    var textWrap = contentDiv.querySelector('.ai-inline-text-wrap');
    if (textWrap) {
      textWrap.innerHTML = html;
    } else {
      // Fallback: create text-wrap
      contentDiv.innerHTML = '<div class="ai-inline-text-wrap">' + html + '</div>';
    }
  }

  function executeAIAction(actionId) {
    hideAIDropdown(true); // Keep highlight while action is being processed
    hideSelectionPills(true); // Keep highlight while action is being processed

    if (actionId === 'custom') {
      showAIPrompt();
      return;
    }

    var selectedText = state.currentSelection;
    if (!selectedText) return;

    // Ensure selection is highlighted and stays visible during AI processing
    if (ERM.reportEditorAI && ERM.reportEditorAI.highlightSelection) {
      ERM.reportEditorAI.highlightSelection();
    }

    // Add pulsing animation class to highlights during AI processing
    var highlights = document.querySelectorAll('.ai-selection-highlight[data-ai-highlight]');
    for (var h = 0; h < highlights.length; h++) {
      highlights[h].classList.add('ai-processing');
    }

    // Show loading
    var responseDiv = document.getElementById('ai-inline-response');
    var contentDiv = document.getElementById('ai-inline-content');

    setAIInlineContent(contentDiv, '<div class="ai-loading"><span class="ai-loading-spinner"></span> AI is thinking...</div>');

    // Position the response panel intelligently relative to selection
    positionAIResponsePanel(responseDiv);
    responseDiv.classList.add('visible');

    // Map action IDs to aiService action names
    var actionMap = {
      simplify: 'transform-plain',
      expand: 'expand',
      rewrite: 'rewrite',
      formal: 'transform-formal',
      summarize: 'shorten',
      bullets: 'transform-concise'
    };

    var serviceAction = actionMap[actionId] || 'rewrite';

    // Use ERM.aiService.executeAction if available
    if (ERM.aiService && ERM.aiService.executeAction) {
      var context = {
        reportName: state.currentReport ? state.currentReport.title : '',
        section: 'Report Section'
      };

      ERM.aiService.executeAction(serviceAction, selectedText, context, function(result) {
        // Remove pulsing animation from highlights regardless of success/error
        var highlightsToUpdate = document.querySelectorAll('.ai-selection-highlight.ai-processing');
        for (var hi = 0; hi < highlightsToUpdate.length; hi++) {
          highlightsToUpdate[hi].classList.remove('ai-processing');
        }

        if (result.error) {
          setAIInlineContent(contentDiv, '<div class="ai-error">Error: ' + escapeHtml(result.error) + '</div>');
        } else {
          showAIResponse(result.text);
        }
      });
    } else {
      // Fallback to generic prompt
      var prompts = {
        simplify: 'Simplify this text to make it clearer and easier to understand: ',
        expand: 'Expand on this text with more detail and explanation: ',
        rewrite: 'Rewrite this text in a different way while keeping the same meaning: ',
        formal: 'Rewrite this text in a more formal, professional tone: ',
        summarize: 'Summarize the key points of this text: ',
        bullets: 'Convert this text into clear bullet points: '
      };

      var prompt = prompts[actionId] + '"' + selectedText + '"';
      state.lastAIPrompt = prompt;

      callAI(prompt, function(response) {
        showAIResponse(response);
      });
    }
  }

  /**
   * Show AI prompt input - custom modal
   */
  function showAIPrompt() {
    // Create custom modal instead of browser prompt
    var modalHtml =
      '<div class="ai-prompt-modal" id="ai-prompt-modal">' +
      '  <div class="ai-prompt-overlay"></div>' +
      '  <div class="ai-prompt-content">' +
      '    <div class="ai-prompt-header">' +
      '      <span class="ai-prompt-icon">' + icons.ai + '</span>' +
      '      <h3>Ask AI</h3>' +
      '    </div>' +
      '    <div class="ai-prompt-body">' +
      '      <textarea class="ai-prompt-input" id="ai-prompt-input" placeholder="What would you like AI to help with?" rows="3"></textarea>' +
      '    </div>' +
      '    <div class="ai-prompt-footer">' +
      '      <button class="ai-prompt-btn ai-prompt-cancel" id="ai-prompt-cancel">Cancel</button>' +
      '      <button class="ai-prompt-btn ai-prompt-submit" id="ai-prompt-submit">' +
      '        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
      '        Generate' +
      '      </button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    // Add modal to document
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHtml;
    var modal = tempDiv.firstChild;
    document.body.appendChild(modal);

    // Focus input
    var input = document.getElementById('ai-prompt-input');
    setTimeout(function() { input.focus(); }, 100);

    // Bind events
    var closeModal = function() {
      modal.classList.add('closing');
      setTimeout(function() { modal.remove(); }, 200);
    };

    document.getElementById('ai-prompt-cancel').addEventListener('click', closeModal);
    modal.querySelector('.ai-prompt-overlay').addEventListener('click', closeModal);

    document.getElementById('ai-prompt-submit').addEventListener('click', function() {
      var customPrompt = input.value.trim();
      if (customPrompt) {
        closeModal();
        var context = state.currentSelection ? 'Context: "' + state.currentSelection + '"\n\n' : '';
        callAI(context + customPrompt, function(response) {
          showAIResponse(response);
        });
      }
    });

    // Enter to submit
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('ai-prompt-submit').click();
      }
      if (e.key === 'Escape') {
        closeModal();
      }
    });

    // Show animation
    setTimeout(function() { modal.classList.add('visible'); }, 10);
  }

  /**
   * Draft section with AI - custom modal
   */
  function draftWithAI() {
    var sectionTypes = [
      { id: 'executive', label: 'Executive Summary' },
      { id: 'intro', label: 'Introduction' },
      { id: 'risk-overview', label: 'Risk Overview' },
      { id: 'key-findings', label: 'Key Findings' },
      { id: 'recommendations', label: 'Recommendations' },
      { id: 'conclusion', label: 'Conclusion' },
      { id: 'custom', label: 'Custom Section...' }
    ];

    var optionsHtml = '';
    for (var i = 0; i < sectionTypes.length; i++) {
      var s = sectionTypes[i];
      optionsHtml += '<button class="draft-section-btn" data-section="' + s.id + '">' + s.label + '</button>';
    }

    var modalHtml =
      '<div class="ai-prompt-modal" id="ai-draft-modal">' +
      '  <div class="ai-prompt-overlay"></div>' +
      '  <div class="ai-prompt-content">' +
      '    <div class="ai-prompt-header">' +
      '      <span class="ai-prompt-icon">' + icons.draft + '</span>' +
      '      <h3>Draft Section with AI</h3>' +
      '    </div>' +
      '    <div class="ai-prompt-body">' +
      '      <p class="draft-section-label">Choose a section type:</p>' +
      '      <div class="draft-section-grid">' + optionsHtml + '</div>' +
      '      <div class="draft-custom-input" id="draft-custom-wrap" style="display:none;">' +
      '        <input type="text" class="ai-prompt-input" id="draft-custom-input" placeholder="Enter section title...">' +
      '      </div>' +
      '    </div>' +
      '    <div class="ai-prompt-footer">' +
      '      <button class="ai-prompt-btn ai-prompt-cancel" id="draft-cancel">Cancel</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    // Add modal to document
    var tempDiv = document.createElement('div');
    tempDiv.innerHTML = modalHtml;
    var modal = tempDiv.firstChild;
    document.body.appendChild(modal);

    // Bind events
    var closeModal = function() {
      modal.classList.add('closing');
      setTimeout(function() { modal.remove(); }, 200);
    };

    document.getElementById('draft-cancel').addEventListener('click', closeModal);
    modal.querySelector('.ai-prompt-overlay').addEventListener('click', closeModal);

    // Section button clicks
    var buttons = modal.querySelectorAll('.draft-section-btn');
    for (var j = 0; j < buttons.length; j++) {
      buttons[j].addEventListener('click', function(e) {
        var sectionId = e.target.getAttribute('data-section');
        if (sectionId === 'custom') {
          document.getElementById('draft-custom-wrap').style.display = 'block';
          document.getElementById('draft-custom-input').focus();
        } else {
          closeModal();
          var sectionLabel = e.target.textContent;
          var aiPrompt = 'Write a professional ' + sectionLabel + ' section for a risk management report. Keep it concise but informative.';
          callAI(aiPrompt, function(response) {
            insertAIContent(response);
          });
        }
      });
    }

    // Custom input enter
    var customInput = document.getElementById('draft-custom-input');
    if (customInput) {
      customInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          var topic = customInput.value.trim();
          if (topic) {
            closeModal();
            var aiPrompt = 'Write a professional ' + topic + ' section for a risk management report. Keep it concise but informative.';
            callAI(aiPrompt, function(response) {
              insertAIContent(response);
            });
          }
        }
        if (e.key === 'Escape') {
          closeModal();
        }
      });
    }

    // Show animation
    setTimeout(function() { modal.classList.add('visible'); }, 10);
  }

  /**
   * Position AI response panel relative to selection/toolbar
   * Simple approach: position below the floating toolbar or selection
   */
  function positionAIResponsePanel(responseDiv) {
    var panelWidth = 380;
    var margin = 16;
    var gap = 8;

    // VIEWPORT-AWARE POSITIONING
    var viewportHeight = window.innerHeight;
    var viewportWidth = window.innerWidth;

    // Cap panel height at 70% of viewport
    var maxPanelHeight = Math.floor(viewportHeight * 0.70);
    var estimatedPanelHeight = Math.min(380, maxPanelHeight);

    var left, top;

    // Try to position relative to the floating toolbar first (most reliable)
    var toolbar = document.getElementById('report-floating-toolbar');
    if (toolbar && toolbar.classList.contains('visible')) {
      var toolbarRect = toolbar.getBoundingClientRect();
      left = toolbarRect.left;

      // Check if there's enough space below
      var spaceBelow = viewportHeight - toolbarRect.bottom - margin;
      var spaceAbove = toolbarRect.top - margin;

      if (spaceBelow >= estimatedPanelHeight) {
        top = toolbarRect.bottom + gap;
      } else if (spaceAbove >= estimatedPanelHeight) {
        top = toolbarRect.top - estimatedPanelHeight - gap;
      } else {
        // Use whatever space is larger
        top = spaceBelow >= spaceAbove ? toolbarRect.bottom + gap : Math.max(margin, toolbarRect.top - estimatedPanelHeight - gap);
      }
    }
    // Fallback: use currentRange
    else if (state.currentRange) {
      var rangeRect = state.currentRange.getBoundingClientRect();
      if (rangeRect.width > 0 || rangeRect.height > 0) {
        left = rangeRect.left;

        var spaceBelow = viewportHeight - rangeRect.bottom - margin;
        var spaceAbove = rangeRect.top - margin;

        if (spaceBelow >= estimatedPanelHeight) {
          top = rangeRect.bottom + gap;
        } else if (spaceAbove >= estimatedPanelHeight) {
          top = rangeRect.top - estimatedPanelHeight - gap;
        } else {
          top = spaceBelow >= spaceAbove ? rangeRect.bottom + gap : Math.max(margin, rangeRect.top - estimatedPanelHeight - gap);
        }
      }
    }

    // Final fallback: center horizontally, position in upper third
    if (left === undefined || top === undefined) {
      left = (viewportWidth - panelWidth) / 2;
      top = viewportHeight * 0.15;
    }

    // Ensure panel stays in viewport
    var actualPanelWidth = Math.min(panelWidth, viewportWidth - margin * 2);

    // Horizontal bounds
    if (left < margin) left = margin;
    if (left + actualPanelWidth > viewportWidth - margin) {
      left = viewportWidth - actualPanelWidth - margin;
    }

    // Vertical bounds
    if (top < margin) top = margin;

    // Calculate maximum height that can fit from this top position
    var availableHeight = viewportHeight - top - margin;
    var finalMaxHeight = Math.min(maxPanelHeight, availableHeight);

    // If panel would be too short, try repositioning higher
    if (finalMaxHeight < 250 && top > margin) {
      var idealTop = viewportHeight - maxPanelHeight - margin;
      if (idealTop >= margin) {
        top = idealTop;
        finalMaxHeight = maxPanelHeight;
      } else {
        top = margin;
        finalMaxHeight = viewportHeight - margin * 2;
      }
    }

    // Apply position (using fixed positioning)
    responseDiv.style.position = 'fixed';
    responseDiv.style.left = left + 'px';
    responseDiv.style.top = top + 'px';
    responseDiv.style.width = actualPanelWidth + 'px';
    responseDiv.style.maxHeight = finalMaxHeight + 'px';
    responseDiv.style.transform = '';

    // LOCK PAGE SCROLL - Single scroll context
    document.body.classList.add('ai-action-panel-open');
  }

  /**
   * Call AI API - connects to ERM.aiService
   */
  function callAI(promptText, callback) {
    // Show loading
    var responseDiv = document.getElementById('ai-inline-response');
    var contentDiv = document.getElementById('ai-inline-content');

    setAIInlineContent(contentDiv, '<div class="ai-loading"><span class="ai-loading-spinner"></span> AI is thinking...</div>');

    // Position the response div intelligently relative to selection
    positionAIResponsePanel(responseDiv);

    responseDiv.classList.add('visible');

    // Store prompt for retry
    state.lastAIPrompt = promptText;

    // Use ERM.aiService if available (actual DeepSeek integration)
    if (ERM.aiService && ERM.aiService.generateText) {
      ERM.aiService.generateText(promptText, {
        maxTokens: 1024,
        temperature: 0.7
      }, function(result) {
        if (result.error) {
          setAIInlineContent(contentDiv, '<div class="ai-error">Error: ' + escapeHtml(result.error) + '</div>');
        } else {
          callback(result.text);
        }
      });
    } else if (ERM.ai && ERM.ai.query) {
      // Fallback to mock ERM.ai if available
      ERM.ai.query(promptText, function(error, response) {
        if (error) {
          setAIInlineContent(contentDiv, '<div class="ai-error">Error: ' + error.message + '</div>');
        } else {
          callback(response);
        }
      });
    } else {
      // Fallback mock response for testing
      setTimeout(function() {
        callback('This is a sample AI response. The actual AI integration will provide real responses based on your prompt.');
      }, 1000);
    }
  }

  /**
   * Parse Markdown to HTML (comprehensive parser for AI-generated content)
   * Handles all formats specified in ai-service.js formatting rules
   */
  function parseMarkdownToHTML(markdown) {
    if (!markdown) return '';

    var lines = markdown.split('\n');
    var html = [];
    var i = 0;
    var inList = false;
    var listType = null;

    while (i < lines.length) {
      var line = lines[i];
      var trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        if (inList) {
          // Close list on blank line
          html.push(listType === 'ul' ? '</ul>' : '</ol>');
          inList = false;
          listType = null;
        }
        i++;
        continue;
      }

      // Headings (##, ###, ####)
      if (/^####\s+(.+)/.test(trimmed)) {
        if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        html.push('<h4>' + processInline(RegExp.$1) + '</h4>');
      } else if (/^###\s+(.+)/.test(trimmed)) {
        if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        html.push('<h3>' + processInline(RegExp.$1) + '</h3>');
      } else if (/^##\s+(.+)/.test(trimmed)) {
        if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        html.push('<h2>' + processInline(RegExp.$1) + '</h2>');
      }
      // Bullet lists (- or *)
      else if (/^[-*]\s+(.+)/.test(trimmed)) {
        var content = RegExp.$1;
        if (!inList || listType !== 'ul') {
          if (inList) html.push('</ol>');
          html.push('<ul>');
          inList = true;
          listType = 'ul';
        }
        html.push('<li>' + processInline(content) + '</li>');
      }
      // Numbered lists (1. 2. 3.)
      else if (/^(\d+)\.\s+(.+)/.test(trimmed)) {
        var content = RegExp.$2;
        if (!inList || listType !== 'ol') {
          if (inList) html.push('</ul>');
          html.push('<ol>');
          inList = true;
          listType = 'ol';
        }
        html.push('<li>' + processInline(content) + '</li>');
      }
      // Tables (| cell | cell |)
      else if (/^\|(.+)\|$/.test(trimmed)) {
        if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        var cells = trimmed.split('|').slice(1, -1).map(function(c) { return c.trim(); });
        // Check if separator row (|---|---|)
        var isSeparator = cells.every(function(c) { return /^-+$/.test(c); });
        if (isSeparator) {
          // Skip separator, already in table
        } else {
          // Check if first table row
          if (html.length === 0 || html[html.length - 1].indexOf('<table') === -1) {
            html.push('<table>');
          }
          // Determine if header (check if next line is separator)
          var isHeader = i + 1 < lines.length && /^\|[-|]+\|$/.test(lines[i + 1].trim());
          var tag = isHeader ? 'th' : 'td';
          html.push('<tr>' + cells.map(function(cell) {
            return '<' + tag + '>' + processInline(cell) + '</' + tag + '>';
          }).join('') + '</tr>');
        }
      }
      // Dividers (---)
      else if (/^---+$/.test(trimmed)) {
        if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        html.push('<hr>');
      }
      // Regular paragraphs
      else {
        if (inList) { html.push(listType === 'ul' ? '</ul>' : '</ol>'); inList = false; }
        html.push('<p>' + processInline(trimmed) + '</p>');
      }

      i++;
    }

    // Close any open lists
    if (inList) {
      html.push(listType === 'ul' ? '</ul>' : '</ol>');
    }

    // Close any open tables
    var joined = html.join('\n');
    if (joined.indexOf('<table>') !== -1 && joined.indexOf('</table>') === -1) {
      html.push('</table>');
    }

    return html.join('\n');
  }

  /**
   * Process inline Markdown (bold, italic, etc.)
   */
  function processInline(text) {
    // Escape HTML to prevent XSS
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    // Bold (**text**)
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic (*text*)
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Code (`code`)
    text = text.replace(/`(.+?)`/g, '<code>$1</code>');

    return text;
  }

  /**
   * Show AI response inline (with Markdown formatting)
   */
  function showAIResponse(response) {
    var contentDiv = document.getElementById('ai-inline-content');
    // Parse Markdown to HTML for preview
    var htmlContent = parseMarkdownToHTML(response);

    // Find or create the text wrapper (actions are now outside contentDiv)
    var textWrap = contentDiv.querySelector('.ai-inline-text-wrap');
    if (textWrap) {
      textWrap.innerHTML = '<div class="ai-response-text">' + htmlContent + '</div>';
    } else {
      // Fallback: create text-wrap
      contentDiv.innerHTML = '<div class="ai-inline-text-wrap"><div class="ai-response-text">' + htmlContent + '</div></div>';
    }

    state.pendingAIResponse = response;
    state.pendingAIResponseHTML = htmlContent;

    // Remove pulsing animation from highlights (AI is done thinking)
    var highlights = document.querySelectorAll('.ai-selection-highlight.ai-processing');
    for (var h = 0; h < highlights.length; h++) {
      highlights[h].classList.remove('ai-processing');
    }
  }

  /**
   * Apply AI Action result - handles Insert and Replace modes
   * Uses the same pipeline as Ask AI panel for consistency
   * @param {string} mode - 'insert' or 'replace'
   */
  function applyAIActionResult(mode) {
    if (!state.pendingAIResponse || !state.activeBlock) {
      console.log('[AI Action] Cannot apply - missing pendingAIResponse or activeBlock');
      hideAIResponse();
      return;
    }

    // Use the shared AI module's applyAIResult for consistency
    if (ERM.reportEditorAI && ERM.reportEditorAI.applyAIResult) {
      // Set up the pending result in the AI module's state
      ERM.reportEditorAI.setState('pendingAIResult', {
        text: state.pendingAIResponse,
        originalText: state.currentSelection
      });
      ERM.reportEditorAI.setState('activeBlock', state.activeBlock);

      // Apply using the shared method
      ERM.reportEditorAI.applyAIResult(mode);
    } else {
      // Fallback: Parse and insert blocks directly
      var formattedHTML = parseMarkdownToHTML(state.pendingAIResponse);
      var parsedBlocks = parseAIResponseToBlocks(formattedHTML);

      if (mode === 'replace') {
        // Remove highlighted selection first
        var highlights = document.querySelectorAll('.ai-selection-highlight[data-ai-highlight]');
        for (var h = 0; h < highlights.length; h++) {
          if (highlights[h].parentNode) {
            highlights[h].parentNode.removeChild(highlights[h]);
          }
        }
      }

      // Insert blocks after active block
      var lastBlock = state.activeBlock;
      for (var i = 0; i < parsedBlocks.length; i++) {
        lastBlock = insertBlockAfter(lastBlock, parsedBlocks[i].type, parsedBlocks[i].content || '');
      }

      markDirty();
    }

    hideAIResponse();
    ERM.toast.success(mode === 'replace' ? 'Text replaced' : 'Content inserted');
  }

  /**
   * Parse AI response HTML into block structures (fallback)
   */
  function parseAIResponseToBlocks(html) {
    var blocks = [];
    var temp = document.createElement('div');
    temp.innerHTML = html;

    var children = temp.children;
    for (var i = 0; i < children.length; i++) {
      var el = children[i];
      var tagName = el.tagName.toLowerCase();

      switch (tagName) {
        case 'p':
          blocks.push({ type: 'paragraph', content: el.innerHTML });
          break;
        case 'h1':
          blocks.push({ type: 'heading1', content: el.innerHTML });
          break;
        case 'h2':
          blocks.push({ type: 'heading2', content: el.innerHTML });
          break;
        case 'h3':
        case 'h4':
          blocks.push({ type: 'heading3', content: el.innerHTML });
          break;
        case 'ul':
          var bullets = el.querySelectorAll(':scope > li');
          for (var b = 0; b < bullets.length; b++) {
            blocks.push({ type: 'bullet', content: bullets[b].innerHTML });
          }
          break;
        case 'ol':
          var numbers = el.querySelectorAll(':scope > li');
          for (var n = 0; n < numbers.length; n++) {
            blocks.push({ type: 'number', content: numbers[n].innerHTML });
          }
          break;
        case 'blockquote':
          blocks.push({ type: 'quote', content: el.innerHTML });
          break;
        default:
          if (el.textContent.trim()) {
            blocks.push({ type: 'paragraph', content: el.innerHTML || el.textContent });
          }
      }
    }

    return blocks;
  }

  /**
   * Retry AI action
   */
  function retryAIAction() {
    // Re-run the last action
    if (state.lastAIPrompt) {
      callAI(state.lastAIPrompt, function(response) {
        showAIResponse(response);
      });
    }
  }

  /**
   * Hide AI response and clean up selection highlight
   */
  function hideAIResponse() {
    var responseDiv = document.getElementById('ai-inline-response');
    if (responseDiv) {
      responseDiv.classList.remove('visible');
    }
    state.pendingAIResponse = null;
    state.pendingAIResponseHTML = null;

    // UNLOCK PAGE SCROLL
    document.body.classList.remove('ai-action-panel-open');

    // Remove selection highlight when AI interaction is complete
    if (ERM.reportEditorAI && ERM.reportEditorAI.unhighlightSelection) {
      ERM.reportEditorAI.unhighlightSelection();
    }
  }

  /**
   * Insert AI content as new block
   */
  function insertAIContent(content) {
    var block = state.activeBlock;
    if (block) {
      var blockId = 'block_' + Date.now();
      var newBlock = {
        id: blockId,
        type: 'paragraph',
        content: content
      };
      var html = renderBlock(newBlock, 0);
      block.insertAdjacentHTML('afterend', html);

      // Get the newly inserted block and check for page overflow
      var newEl = document.querySelector('[data-block-id="' + blockId + '"]');
      markDirty();

      // Check for page overflow after AI content insertion
      setTimeout(function() {
        schedulePageAwarenessUpdate(newEl);
      }, 10);
    }
    hideAIResponse();
  }

  /**
   * Show inline comment
   */
  function showInlineComment() {
    hideSelectionPills();

    var commentDiv = document.getElementById('inline-comment');

    if (state.currentRange) {
      var rect = state.currentRange.getBoundingClientRect();
      commentDiv.style.top = (rect.bottom + window.scrollY + 8) + 'px';
      commentDiv.style.left = rect.left + 'px';
    }

    commentDiv.classList.add('visible');
    document.getElementById('inline-comment-input').focus();

    state.inlineCommentVisible = true;
  }

  /**
   * Hide inline comment
   */
  function hideInlineComment() {
    var commentDiv = document.getElementById('inline-comment');
    commentDiv.classList.remove('visible');
    state.inlineCommentVisible = false;
  }

  /**
   * Send comment
   */
  function sendComment() {
    var input = document.getElementById('inline-comment-input');
    var text = input.value.trim();

    if (!text) return;

    var comment = {
      id: 'comment_' + Date.now(),
      text: text,
      author: ERM.state.user ? ERM.state.user.name : 'Anonymous',
      authorId: ERM.state.user ? ERM.state.user.id : null,
      createdAt: new Date().toISOString(),
      selectedText: state.currentSelection,
      blockId: state.activeBlock ? state.activeBlock.getAttribute('data-block-id') : null
    };

    // Extract mentions
    var mentions = text.match(/@(\w+)/g);
    if (mentions) {
      comment.mentions = mentions.map(function(m) { return m.substring(1); });
      // TODO: Send notifications
    }

    // Add to comments
    if (!state.currentReport.comments) {
      state.currentReport.comments = [];
    }
    state.currentReport.comments.push(comment);

    // Clear input
    input.value = '';

    // Add visual indicator
    if (state.activeBlock) {
      state.activeBlock.classList.add('has-comment');
    }

    hideInlineComment();
    markDirty();

    if (ERM.toast) {
      ERM.toast.success('Comment added');
    }
  }

  /**
   * Show embed picker
   */
  function showEmbedPicker(embedType) {
    state.embedPickerType = embedType;

    var picker = document.getElementById('embed-picker');
    var iconEl = document.getElementById('embed-picker-icon');
    var titleEl = document.getElementById('embed-picker-title');
    var layoutSection = document.getElementById('embed-layout-section');

    // Set title and icon based on type
    var embedInfo = {
      heatmap: { icon: '🔥', title: 'Insert Heatmap' },
      risks: { icon: '📊', title: 'Insert Top Risks' },
      chart: { icon: '📈', title: 'Insert Category Chart' },
      kpi: { icon: '🎯', title: 'Insert KPI Cards' },
      register: { icon: '📋', title: 'Insert Risk Register' },
      controls: { icon: '🛡️', title: 'Insert Controls' }
    };

    var info = embedInfo[embedType] || { icon: '📄', title: 'Insert Content' };
    iconEl.textContent = info.icon;
    titleEl.textContent = info.title;

    // Show/hide layout section (only for heatmap)
    layoutSection.style.display = embedType === 'heatmap' ? 'block' : 'none';

    // Populate registers
    populateRegisterOptions();

    // Position and show
    picker.classList.add('visible');
    state.embedPickerVisible = true;
  }

  /**
   * Hide embed picker
   */
  function hideEmbedPicker() {
    var picker = document.getElementById('embed-picker');
    picker.classList.remove('visible');
    state.embedPickerVisible = false;
    state.embedPickerType = null;
  }

  /**
   * Populate register options
   */
  function populateRegisterOptions() {
    var container = document.getElementById('embed-register-options');

    // Get registers from ERM - try 'registers' first (primary key), then 'riskRegisters' for compatibility
    var registers = ERM.storage.get('registers') || ERM.storage.get('riskRegisters') || [];

    var html = '<label class="embed-picker-option"><input type="radio" name="embed-register" value="all" checked> All Registers</label>';

    for (var i = 0; i < registers.length; i++) {
      var reg = registers[i];
      html += '<label class="embed-picker-option"><input type="radio" name="embed-register" value="' + reg.id + '"> ' + escapeHtml(reg.name) + '</label>';
    }

    container.innerHTML = html;
  }

  /**
   * Insert embed
   */
  function insertEmbed() {
    var embedType = state.embedPickerType;
    var registerId = document.querySelector('input[name="embed-register"]:checked').value;
    var layout = 'side-by-side';

    var layoutInput = document.querySelector('input[name="embed-layout"]:checked');
    if (layoutInput) {
      layout = layoutInput.value;
    }

    var block = {
      id: 'block_' + Date.now(),
      type: 'embed',
      embedType: embedType,
      registerId: registerId,
      layout: layout
    };

    var html = renderEmbed(block, block.id);

    if (state.activeBlock) {
      // Insert after the active block (which is already inside a page)
      state.activeBlock.insertAdjacentHTML('afterend', html);
    } else {
      // No active block - find the last block on the last page and insert after it
      var pages = document.querySelectorAll('.editor-v2-page');
      var lastPage = pages[pages.length - 1];
      if (lastPage) {
        var lastBlock = lastPage.querySelector('.editor-v2-block:last-of-type');
        if (lastBlock) {
          lastBlock.insertAdjacentHTML('afterend', html);
        } else {
          // Page exists but has no blocks - insert at beginning of page
          lastPage.insertAdjacentHTML('afterbegin', html);
        }
      } else {
        // Fallback - should not happen but just in case
        document.getElementById('editor-content').insertAdjacentHTML('beforeend', html);
      }
    }

    // Get reference to the new block element
    var newBlockEl = document.querySelector('[data-block-id="' + block.id + '"]');

    // Load actual content
    loadEmbedContent(block.id, embedType, registerId, layout);

    hideEmbedPicker();
    markDirty();
    // Note: Page awareness is triggered in loadEmbedContent after content is loaded
    // This ensures we check overflow with the actual content height, not the loading placeholder
  }

  /**
   * Load embed content using dashboard renderers for consistency
   */
  function loadEmbedContent(blockId, embedType, registerId, layout) {
    var container = document.getElementById('embed-content-' + blockId);
    if (!container) return;

    // Use dashboard renderers for consistent styling
    var renderers = ERM.dashboard && ERM.dashboard.renderers;
    var options = { registerId: registerId || 'all', layout: layout || 'side-by-side' };

    switch (embedType) {
      case 'heatmap':
        if (renderers && renderers.renderHeatmap) {
          renderers.renderHeatmap(container, options);
        } else if (ERM.reports && ERM.reports.renderHeatmap) {
          container.innerHTML = ERM.reports.renderHeatmap(registerId, layout);
        } else {
          container.innerHTML = '<div class="embed-placeholder">Heatmap for register: ' + registerId + '</div>';
        }
        break;

      case 'risks':
        if (renderers && renderers.renderTopRisks) {
          renderers.renderTopRisks(container, options);
        } else if (ERM.reports && ERM.reports.renderTopRisks) {
          container.innerHTML = ERM.reports.renderTopRisks(registerId);
        } else {
          container.innerHTML = '<div class="embed-placeholder">Top Risks for register: ' + registerId + '</div>';
        }
        break;

      case 'chart':
        if (renderers && renderers.renderRiskConcentration) {
          renderers.renderRiskConcentration(container, options);
        } else if (ERM.reports && ERM.reports.renderCategoryChart) {
          container.innerHTML = ERM.reports.renderCategoryChart(registerId);
        } else {
          container.innerHTML = '<div class="embed-placeholder">Category Chart for register: ' + registerId + '</div>';
        }
        break;

      case 'kpi':
        if (renderers && renderers.renderKPICards) {
          renderers.renderKPICards(container, options);
        } else if (ERM.reports && ERM.reports.renderKPICards) {
          container.innerHTML = ERM.reports.renderKPICards(registerId);
        } else {
          container.innerHTML = '<div class="embed-placeholder">KPI Cards for register: ' + registerId + '</div>';
        }
        break;

      case 'controls':
        if (renderers && renderers.renderControlCoverage) {
          renderers.renderControlCoverage(container, options);
        } else if (ERM.reports && ERM.reports.renderControls) {
          container.innerHTML = ERM.reports.renderControls(registerId);
        } else {
          container.innerHTML = '<div class="embed-placeholder">Controls for register: ' + registerId + '</div>';
        }
        break;

      case 'register':
        if (ERM.reports && ERM.reports.renderRiskRegister) {
          container.innerHTML = ERM.reports.renderRiskRegister(registerId);
        } else {
          container.innerHTML = '<div class="embed-placeholder">Risk Register: ' + registerId + '</div>';
        }
        break;
    }

    // Trigger page awareness after content loads
    // This ensures proper page flow when embed content changes height
    var blockEl = document.querySelector('[data-block-id="' + blockId + '"]');
    if (blockEl) {
      setTimeout(function() {
        schedulePageAwarenessUpdate(blockEl);
      }, 200);
    }
  }

  /**
   * Load all embed content after editor is rendered
   * Called after initial render to populate saved embeds
   */
  function loadAllEmbeds() {
    var embedBlocks = document.querySelectorAll('.editor-v2-block[data-block-type="embed"]');
    console.log('[V2 Editor] Loading', embedBlocks.length, 'embed blocks');

    embedBlocks.forEach(function(block) {
      var blockId = block.getAttribute('data-block-id');
      var embedType = block.getAttribute('data-embed-type');
      var registerId = block.getAttribute('data-register-id');
      var layout = block.getAttribute('data-layout');

      if (blockId && embedType) {
        console.log('[V2 Editor] Loading embed:', blockId, embedType, registerId);
        loadEmbedContent(blockId, embedType, registerId, layout);
      }
    });
  }

  /**
   * Handle embed toolbar actions (refresh, ai, delete)
   */
  function handleEmbedToolbarAction(embedBlock, action) {
    var blockId = embedBlock.getAttribute('data-block-id');
    console.log('[V2 Editor] handleEmbedToolbarAction called - action:', action, 'blockId:', blockId);

    switch (action) {
      case 'refresh':
        // Re-load the embed content with current settings
        var embedType = embedBlock.getAttribute('data-embed-type');
        var registerId = embedBlock.getAttribute('data-register-id') || 'all';
        var layout = embedBlock.getAttribute('data-layout') || 'side-by-side';

        // Show loading indicator
        var contentEl = document.getElementById('embed-content-' + blockId);
        if (contentEl) {
          contentEl.classList.add('embed-loading');
        }

        // Reload content
        setTimeout(function() {
          loadEmbedContent(blockId, embedType, registerId, layout);
          if (contentEl) {
            contentEl.classList.remove('embed-loading');
          }
          if (ERM.toast) {
            ERM.toast.success('Content refreshed');
          }
        }, 300);
        break;

      case 'ai':
        // Open Ask AI panel with chart context (content-aware mode)
        console.log('[Embed AI] Opening Ask AI panel for embed block:', blockId);

        // Use the new openAskAIForBlock entry point
        if (ERM.reportEditorAI && ERM.reportEditorAI.openAskAIForBlock) {
          ERM.reportEditorAI.openAskAIForBlock(blockId, 'chart');
        } else {
          console.warn('[Embed AI] ERM.reportEditorAI.openAskAIForBlock not available');
          if (ERM.toast) {
            ERM.toast.info('AI Assistant not available');
          }
        }
        break;

      case 'delete':
        // Show inline delete confirmation
        var confirmEl = embedBlock.querySelector('.embed-delete-confirm');
        var deleteBtn = embedBlock.querySelector('.embed-btn-delete');
        if (confirmEl) {
          confirmEl.style.display = 'flex';
        }
        if (deleteBtn) {
          deleteBtn.style.display = 'none';
        }
        break;

      case 'confirm-delete':
        // Actually delete the block
        saveState(); // Save for undo
        embedBlock.remove();
        markDirty(true);
        if (ERM.toast) {
          ERM.toast.success('Block deleted');
        }
        break;

      case 'cancel-delete':
        // Hide confirmation, show delete button again
        var confirmEl = embedBlock.querySelector('.embed-delete-confirm');
        var deleteBtn = embedBlock.querySelector('.embed-btn-delete');
        if (confirmEl) {
          confirmEl.style.display = 'none';
        }
        if (deleteBtn) {
          deleteBtn.style.display = '';
        }
        break;
    }
  }

  /**
   * Helper to strip leading list markers from content
   * Prevents "1. 1." or "• •" duplication when converting between list and paragraph
   */
  function stripLeadingListMarkers(html) {
    if (!html) return html;
    // Get text-only version for pattern matching
    var textOnly = html.replace(/<[^>]*>/g, '').trim();

    // Strip numbered markers: "1. ", "2) ", "1)", etc.
    if (/^\d+[.)]\s*/.test(textOnly)) {
      // Remove from HTML (handle potential leading tags)
      html = html.replace(/^(\s*(?:<[^>]*>)*)(\d+[.)]\s*)/, '$1');
    }
    // Strip bullet markers: "- ", "* ", "• ", "· "
    else if (/^[-*•·]\s*/.test(textOnly)) {
      html = html.replace(/^(\s*(?:<[^>]*>)*)([-*•·]\s*)/, '$1');
    }
    return html;
  }

  /**
   * Convert block to different type
   * IMPORTANT: This function converts ONLY the specific block element passed to it
   */
  function convertBlock(block, newType) {
    // Validate block is a DOM element
    if (!block || !block.nodeType) {
      console.error('convertBlock: Invalid block element');
      return;
    }

    var currentType = block.getAttribute('data-block-type') || 'paragraph';
    console.log('[convertBlock] Converting from', currentType, 'to', newType);

    // Handle divider/pagebreak specially - they have no content
    if (currentType === 'divider' || currentType === 'pagebreak') {
      // Converting FROM divider/pagebreak - just create empty block of target type
      convertDividerToBlock(block, newType);
      return;
    }

    // Get content from the editable element inside the block, not the whole block
    var editable = block.querySelector('[contenteditable="true"]');
    var content = '';

    // Handle all list types specially to properly extract content
    if (currentType === 'bullet_list' || currentType === 'numbered_list') {
      // Multi-item list: <ul/ol contenteditable><li>item1</li><li>item2</li></ul/ol>
      var listItems = block.querySelectorAll('li');
      console.log('[convertBlock] Multi-item list with', listItems.length, 'items');
      if (newType === 'bullet' || newType === 'number') {
        // Converting multi-item list to single-item list - use first item only
        content = listItems.length > 0 ? listItems[0].innerHTML : '';
      } else if (newType === 'paragraph' || newType === 'heading1' || newType === 'heading2' || newType === 'heading3') {
        // Converting to text-based block - join all items with line breaks
        var itemContents = [];
        for (var li = 0; li < listItems.length; li++) {
          itemContents.push(listItems[li].innerHTML);
        }
        content = itemContents.join('<br>');
      } else {
        content = editable ? editable.innerHTML : (block.textContent || '');
      }
    } else if (currentType === 'bullet' || currentType === 'number') {
      // Single-item list: <ul/ol><li contenteditable>content</li></ul/ol>
      // The editable element IS the <li>, so editable.innerHTML gives us the content
      var listItem = block.querySelector('li');
      if (listItem) {
        content = listItem.innerHTML;
        console.log('[convertBlock] Single-item list content:', content);
      } else {
        content = editable ? editable.innerHTML : (block.textContent || '');
      }
    } else {
      // Regular block types (paragraph, heading, quote, etc.)
      content = editable ? editable.innerHTML : (block.textContent || '');
    }

    console.log('[convertBlock] Extracted content:', content);

    // Strip leading list markers from content to prevent duplication (e.g., "1. 1.")
    // This handles both converting FROM lists (markers embedded in text) and TO lists
    content = stripLeadingListMarkers(content);

    // Additional stripping when converting TO a list type (for cases where markers are deeper in HTML)
    if (newType === 'bullet' || newType === 'number') {
      // Get text content for pattern matching (strip HTML tags temporarily)
      var textOnly = content.replace(/<[^>]*>/g, '').trim();

      // Check if content starts with a list marker
      if (/^\d+[.)]\s/.test(textOnly)) {
        // Strip leading numbered markers: "1. ", "2) ", etc.
        content = content.replace(/^(\s*)(\d+[.)]\s*)/, '$1');
        console.log('[convertBlock] Stripped numbered prefix, new content:', content);
      } else if (/^[-*•]\s/.test(textOnly)) {
        // Strip leading bullet markers: "- ", "* ", "• "
        content = content.replace(/^(\s*)([-*•]\s*)/, '$1');
        console.log('[convertBlock] Stripped bullet prefix, new content:', content);
      }
    }

    // ALWAYS generate a new unique ID to prevent any ID collision issues
    // This ensures the converted block is completely unique
    var newBlockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    var newBlockData = {
      id: newBlockId,
      type: newType,
      content: content
    };

    // Render the new block HTML
    var html = renderBlock(newBlockData, 0);

    // Replace ONLY this specific block element
    block.outerHTML = html;

    // Focus the new block using the NEW unique ID
    var newEl = document.querySelector('[data-block-id="' + newBlockId + '"]');
    if (newEl) {
      // Update active block reference
      state.activeBlock = newEl;

      // Also update slashTargetBlock if it was pointing to the old block
      if (state.slashTargetBlock === block) {
        state.slashTargetBlock = newEl;
      }

      var newEditable = newEl.querySelector('[contenteditable="true"]') || newEl;
      if (newEditable.getAttribute('contenteditable') === 'true') {
        newEditable.focus();
        // Move cursor to end
        var range = document.createRange();
        range.selectNodeContents(newEditable);
        range.collapse(false);
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }

      // Remove converting flag from the new element
      newEl.removeAttribute('data-converting');
    }

    // Update numbered list start values after conversion
    // This handles cases where a numbered list item is converted or added
    updateNumberedListStarts();

    markDirty(true); // Immediate save for block conversion
  }

  /**
   * Convert block with cursor positioned at START (for Backspace merge flow)
   * Used when converting list→paragraph via Backspace to allow immediate merge with prev block
   */
  function convertBlockWithCursorAtStart(block, newType) {
    // Validate block is a DOM element
    if (!block || !block.nodeType) {
      console.error('convertBlockWithCursorAtStart: Invalid block element');
      return;
    }

    var currentType = block.getAttribute('data-block-type') || 'paragraph';
    console.log('[convertBlockWithCursorAtStart] Converting from', currentType, 'to', newType);

    // Get content from the editable element
    var editable = block.querySelector('[contenteditable="true"]');
    var content = '';

    // Handle list types specially
    if (currentType === 'bullet_list' || currentType === 'numbered_list') {
      var listItems = block.querySelectorAll('li');
      var itemContents = [];
      for (var li = 0; li < listItems.length; li++) {
        itemContents.push(listItems[li].innerHTML);
      }
      content = itemContents.join('<br>');
    } else if (currentType === 'bullet' || currentType === 'number') {
      var listItem = block.querySelector('li');
      content = listItem ? listItem.innerHTML : (editable ? editable.innerHTML : '');
    } else {
      content = editable ? editable.innerHTML : (block.textContent || '');
    }

    // Strip any leading list markers from content (prevents "1. 1." duplication)
    // This handles cases where user typed markers manually or they got embedded somehow
    content = stripLeadingListMarkers(content);

    // Generate new unique ID
    var newBlockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    var newBlockData = {
      id: newBlockId,
      type: newType,
      content: content
    };

    // Render the new block HTML
    var html = renderBlock(newBlockData, 0);

    // Replace the block
    block.outerHTML = html;

    // Focus the new block with cursor at START
    var newEl = document.querySelector('[data-block-id="' + newBlockId + '"]');
    if (newEl) {
      state.activeBlock = newEl;
      if (state.slashTargetBlock === block) {
        state.slashTargetBlock = newEl;
      }

      var newEditable = newEl.querySelector('[contenteditable="true"]') || newEl;
      if (newEditable.getAttribute('contenteditable') === 'true') {
        newEditable.focus();
        // Move cursor to START (not end) for Backspace merge flow
        var range = document.createRange();
        range.selectNodeContents(newEditable);
        range.collapse(true); // true = collapse to start
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }

    updateNumberedListStarts();
    syncContentFromDOM();
    markDirty(true);
  }

  /**
   * Update numbered list start values for consecutive numbered list blocks
   * This ensures proper numbering (1, 2, 3...) across separate blocks
   *
   * Notion Rule 2: List continuation
   * - Numbers are derived from order within the list group, not stored
   * - Consecutive list blocks of the same type share a logical group
   * - When a non-list block breaks the sequence, numbering resets
   */
  function updateNumberedListStarts() {
    var blocks = document.querySelectorAll('.editor-v2-content .editor-v2-block');
    var listGroupCounter = 0;
    var currentListType = null;
    var currentGroupId = null;

    for (var i = 0; i < blocks.length; i++) {
      var block = blocks[i];
      var blockType = block.getAttribute('data-block-type');

      // Handle both single-item (number) and multi-item (numbered_list) formats
      if (blockType === 'number' || blockType === 'numbered_list') {
        // Check if this continues the previous numbered list or starts a new one
        if (currentListType !== 'number') {
          // Starting a new numbered list group
          listGroupCounter = 0;
          currentGroupId = 'listgroup_' + Date.now() + '_' + i;
          currentListType = 'number';
        }

        listGroupCounter++;

        // Store listGroupId on the block for reference
        block.setAttribute('data-list-group-id', currentGroupId);

        var ol = block.querySelector('ol.editor-v2-number-list');
        if (ol) {
          ol.setAttribute('start', listGroupCounter);
        }
      } else if (blockType === 'bullet' || blockType === 'bullet_list') {
        // Bullet lists don't need numbering but track group for consistency
        if (currentListType !== 'bullet') {
          currentGroupId = 'listgroup_' + Date.now() + '_' + i;
          currentListType = 'bullet';
        }
        block.setAttribute('data-list-group-id', currentGroupId);
        listGroupCounter = 0; // Reset counter
      } else {
        // Non-list block breaks the sequence
        currentListType = null;
        currentGroupId = null;
        listGroupCounter = 0;
      }
    }
  }

  /**
   * Insert block after another
   * @param {HTMLElement} afterBlock - Block to insert after
   * @param {string} blockType - Type of new block
   * @param {string} [initialContent] - Optional initial content for the block
   * @returns {HTMLElement|null} The new block element
   */
  function insertBlockAfter(afterBlock, blockType, initialContent) {
    // Generate unique ID with timestamp and random suffix
    var blockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    // initialContent may contain HTML - sanitize it for safety
    // For renderBlock, we pass the HTML content directly
    var newBlock = {
      id: blockId,
      type: blockType,
      content: initialContent || ''
    };

    var html = renderBlock(newBlock, 0);
    afterBlock.insertAdjacentHTML('afterend', html);

    // Get the new block element
    var newEl = document.querySelector('[data-block-id="' + blockId + '"]');
    if (newEl) {
      // Update active block reference
      state.activeBlock = newEl;

      // Use setTimeout to ensure DOM is fully ready before focusing
      // This is critical for preventing cursor jump issues
      setTimeout(function() {
        // Find the editable element
        var editable = newEl.querySelector('.block-content[contenteditable="true"]') ||
                       newEl.querySelector('.callout-content[contenteditable="true"]') ||
                       newEl.querySelector('li[contenteditable="true"]') ||
                       newEl.querySelector('[contenteditable="true"]');

        if (editable) {
          // Content was already set via renderBlock - don't overwrite it
          // Just ensure there's a text node for cursor placement if empty
          if (!editable.firstChild) {
            editable.appendChild(document.createTextNode(''));
          }

          // Focus the editable element
          editable.focus();

          // Place cursor at start of the new block
          try {
            var range = document.createRange();
            var sel = window.getSelection();

            if (editable.firstChild) {
              range.setStart(editable.firstChild, 0);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch (err) {
            console.log('insertBlockAfter: Error setting cursor', err);
          }
        }

        // Update numbered list start values after inserting
        if (blockType === 'number') {
          updateNumberedListStarts();
        }
      }, 0);
    }

    markDirty(true); // Immediate save for block insertion

    // CRITICAL: Check for page overflow after inserting new block
    // This ensures Word-like behavior where content flows to next page
    setTimeout(function() {
      schedulePageAwarenessUpdate(newEl);
    }, 10);

    return newEl;
  }

  /**
   * Insert a structured block after another block
   * Handles complex block types like tables, bullet_list, numbered_list
   * @param {HTMLElement} afterBlock - Block to insert after
   * @param {Object} blockData - Block data object with type, content, items, rows, etc.
   * @returns {HTMLElement|null} The new block element
   */
  function insertStructuredBlock(afterBlock, blockData) {
    // Generate unique ID
    var blockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    // Create block object for renderBlock
    var newBlock = {
      id: blockId,
      type: blockData.type,
      content: blockData.content || ''
    };

    // Copy additional properties for structured types
    if (blockData.items) {
      newBlock.items = blockData.items;
    }
    if (blockData.rows) {
      newBlock.rows = blockData.rows;
    }

    // Render the block
    var html = renderBlock(newBlock, 0);
    afterBlock.insertAdjacentHTML('afterend', html);

    // Get the new block element
    var newEl = document.querySelector('[data-block-id="' + blockId + '"]');
    if (newEl) {
      state.activeBlock = newEl;

      // Focus on first editable element after a brief delay
      setTimeout(function() {
        var editable = newEl.querySelector('[contenteditable="true"]');
        if (editable) {
          editable.focus();
          try {
            var range = document.createRange();
            var sel = window.getSelection();
            if (editable.firstChild) {
              range.setStart(editable.firstChild, 0);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch (err) {
            console.log('insertStructuredBlock: Error setting cursor', err);
          }
        }

        // Update numbered list starts if needed
        if (blockData.type === 'numbered_list' || blockData.type === 'number') {
          updateNumberedListStarts();
        }
      }, 0);
    }

    markDirty(true);

    // Check for page overflow after inserting structured block
    setTimeout(function() {
      schedulePageAwarenessUpdate(newEl);
    }, 10);

    return newEl;
  }

  /**
   * Insert a page break - creates a new page container
   * This is the proper way to create a page break in the paged editor
   * @param {HTMLElement} fromBlock - The block where the page break was requested
   * @returns {HTMLElement|null} The first block in the new page
   */
  function insertPageBreak(fromBlock) {
    if (!fromBlock) return null;

    // Find the current page container
    var currentPage = fromBlock.closest('.editor-v2-page');
    if (!currentPage) {
      console.error('[insertPageBreak] Block not in a page container');
      return null;
    }

    // First, insert the visual pagebreak block after fromBlock (at the end of current page)
    var pagebreakId = 'block_' + Date.now() + '_pb';
    var pagebreakControls = renderBlockControls(pagebreakId);
    var pagebreakHtml =
      '<div class="editor-v2-block" data-block-id="' + pagebreakId + '" data-block-type="pagebreak">' +
      pagebreakControls +
      '  <div class="block-element editor-v2-pagebreak" title="Starts a new page in preview and PDF export">' +
      '    <div class="pagebreak-line"></div>' +
      '    <span class="pagebreak-label">Page Break</span>' +
      '    <div class="pagebreak-line"></div>' +
      '  </div>' +
      '</div>';
    fromBlock.insertAdjacentHTML('afterend', pagebreakHtml);
    var pagebreakBlock = document.querySelector('[data-block-id="' + pagebreakId + '"]');

    // Calculate new page number
    var allPages = document.querySelectorAll('.editor-v2-page');
    var newPageNumber = allPages.length + 1;
    var newPageId = 'page_' + (allPages.length);

    // Collect blocks to move (all siblings after the pagebreak)
    var blocksToMove = [];
    if (pagebreakBlock) {
      var sibling = pagebreakBlock.nextElementSibling;
      while (sibling) {
        blocksToMove.push(sibling);
        sibling = sibling.nextElementSibling;
      }
    }

    // Create new page container
    var newBlockId = 'block_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    var controls = renderBlockControls(newBlockId);

    var newPageHtml =
      '<div class="editor-v2-page" data-page-number="' + newPageNumber + '" id="' + newPageId + '">' +
      '</div>';

    // Insert new page after current page
    currentPage.insertAdjacentHTML('afterend', newPageHtml);

    // Move blocks to the new page
    var newPage = document.getElementById(newPageId);
    if (newPage) {
      // If there are blocks to move, move them
      if (blocksToMove.length > 0) {
        blocksToMove.forEach(function(block) {
          newPage.appendChild(block);
        });
      } else {
        // No blocks to move - create an empty paragraph
        var emptyParaHtml =
          '<div class="editor-v2-block" data-block-id="' + newBlockId + '" data-block-type="paragraph">' +
          controls +
          '  <div class="block-element editor-v2-paragraph"><div class="block-content" contenteditable="true" data-placeholder="Start writing..."></div></div>' +
          '</div>';
        newPage.innerHTML = emptyParaHtml;
      }

      // Focus the first block in the new page
      var firstBlock = newPage.querySelector('.editor-v2-block');
      if (firstBlock) {
        state.activeBlock = firstBlock;

        setTimeout(function() {
          var editable = firstBlock.querySelector('[contenteditable="true"]');
          if (editable) {
            editable.focus();
            try {
              var range = document.createRange();
              var sel = window.getSelection();
              if (editable.firstChild) {
                range.setStart(editable.firstChild, 0);
              } else {
                editable.appendChild(document.createTextNode(''));
                range.setStart(editable.firstChild, 0);
              }
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            } catch (err) {
              console.log('[insertPageBreak] Error setting cursor', err);
            }
          }
        }, 10);

        // Scroll to the new page
        newPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Update page numbers
      updatePageNumbers();

      markDirty(true);
      return firstBlock;
    }

    return null;
  }

  /**
   * Update page numbers displayed on each page
   */
  function updatePageNumbers() {
    var pages = document.querySelectorAll('.editor-v2-page');
    pages.forEach(function(page, index) {
      page.setAttribute('data-page-number', index + 1);
    });
  }

  /**
   * Update content array from current DOM order
   * Preserves HTML formatting (bold, italic, etc.)
   * Handles page containers - adds pagebreak markers between pages
   */
  function updateContentFromDOM() {
    var pages = document.querySelectorAll('.editor-v2-content .editor-v2-page');
    var content = [];

    pages.forEach(function(page) {
      // Get all blocks in this page
      var blocks = page.querySelectorAll('.editor-v2-block');

      blocks.forEach(function(block) {
        var blockData = {
          id: block.getAttribute('data-block-id'),
          type: block.getAttribute('data-block-type')
        };

        if (blockData.type === 'embed') {
          blockData.embedType = block.getAttribute('data-embed-type');
          blockData.registerId = block.getAttribute('data-register-id');
          blockData.layout = block.getAttribute('data-layout');
        } else if (blockData.type === 'divider') {
          blockData.content = '';
        } else if (blockData.type === 'cover') {
          // Cover page - collect all metadata fields
          var titleInput = block.querySelector('.cover-title-input');
          var subtitleInput = block.querySelector('.cover-subtitle-input');
          var coverLogo = block.querySelector('.cover-logo');
          blockData.coverTitle = titleInput ? titleInput.value : '';
          blockData.coverSubtitle = subtitleInput ? subtitleInput.value : '';
          blockData.coverImage = coverLogo ? coverLogo.src : '';
          // Collect metadata fields (new: .cover-meta-value for inline inputs)
          var metaInputs = block.querySelectorAll('.cover-meta-value, .cover-meta-select');
          for (var j = 0; j < metaInputs.length; j++) {
            var field = metaInputs[j].getAttribute('data-field');
            if (field) {
              blockData[field] = metaInputs[j].value || '';
            }
          }
        } else if (blockData.type === 'chart-placeholder') {
          blockData.chartType = block.getAttribute('data-chart-type') || 'bar';
          var captionInput = block.querySelector('.chart-caption-input');
          blockData.caption = captionInput ? captionInput.value : '';
        } else if (blockData.type === 'html') {
          // HTML block (tables from AI) - get raw HTML from wrapper
          var htmlBlockEl = block.querySelector('.editor-v2-html-block');
          blockData.content = htmlBlockEl ? htmlBlockEl.innerHTML : '';
        } else if (blockData.type === 'bullet_list' || blockData.type === 'numbered_list') {
          // Proper list blocks - extract items array from DOM
          var listItems = block.querySelectorAll('li[contenteditable="true"]');
          blockData.items = [];
          for (var li = 0; li < listItems.length; li++) {
            blockData.items.push({
              content: listItems[li].innerHTML
            });
          }
        } else if (blockData.type === 'table') {
          // Proper table block - extract rows and cells from DOM
          var tableRows = block.querySelectorAll('tr');
          blockData.rows = [];
          for (var tr = 0; tr < tableRows.length; tr++) {
            var cells = tableRows[tr].querySelectorAll('th, td');
            var rowData = { cells: [] };
            for (var td = 0; td < cells.length; td++) {
              rowData.cells.push({
                content: cells[td].innerHTML
              });
            }
            blockData.rows.push(rowData);
          }
        } else {
          var editable = block.querySelector('[contenteditable="true"]');
          // Preserve HTML for formatting
          blockData.content = editable ? editable.innerHTML : '';
          blockData.plainText = editable ? editable.textContent : '';
        }

        content.push(blockData);
      });
    });

    state.currentReport.content = content;
  }

  /**
   * Sync content from DOM to state (alias for updateContentFromDOM)
   */
  function syncContentFromDOM() {
    updateContentFromDOM();
  }

  /**
   * Change block type (paragraph, heading1, heading2, heading3)
   */
  function changeBlockType(newType) {
    if (!state.activeBlock) return;

    var block = state.activeBlock;
    var currentType = block.getAttribute('data-block-type');
    if (currentType === newType) return;

    // Get current content
    var editable = block.querySelector('[contenteditable="true"]');
    var content = editable ? editable.innerHTML : '';
    var blockId = block.getAttribute('data-block-id');

    // Create new block data
    var newBlock = {
      id: blockId,
      type: newType,
      content: editable ? editable.textContent : ''
    };

    // Generate new HTML
    var newHtml = renderBlock(newBlock, 0);

    // Replace in DOM
    var temp = document.createElement('div');
    temp.innerHTML = newHtml;
    var newEl = temp.firstElementChild;

    block.parentNode.replaceChild(newEl, block);

    // Restore rich content and focus
    var newEditable = newEl.querySelector('[contenteditable="true"]');
    if (newEditable) {
      newEditable.innerHTML = content;
      newEditable.focus();
      // Place cursor at end
      var range = document.createRange();
      range.selectNodeContents(newEditable);
      range.collapse(false);
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }

    state.activeBlock = newEl;
    markDirty();
    hideSelectionPills();
  }

  /**
   * Mark document as dirty (unsaved changes)
   * @param {boolean} immediate - If true, save state immediately (for structural changes)
   */
  function markDirty(immediate) {
    state.isDirty = true;
    updateStatus('Unsaved changes');

    // Save state for undo
    // Debounce for text input, immediate for structural changes
    if (immediate) {
      // Clear any pending debounced save
      if (state.saveStateTimeout) {
        clearTimeout(state.saveStateTimeout);
        state.saveStateTimeout = null;
      }
      // Save immediately for structural changes (block operations, formatting, etc.)
      updateContentFromDOM();
      saveState();
    } else {
      // Debounce text input to avoid saving on every keystroke
      if (state.saveStateTimeout) {
        clearTimeout(state.saveStateTimeout);
      }
      state.saveStateTimeout = setTimeout(function() {
        updateContentFromDOM();
        saveState();
        state.saveStateTimeout = null;
      }, 300); // Save after 300ms of inactivity for responsive undo
    }
  }

  /**
   * Update status indicator
   */
  function updateStatus(text) {
    var statusEl = document.getElementById('editor-status');
    if (statusEl) {
      statusEl.textContent = text;
      statusEl.className = 'editor-v2-status' + (text === 'Saved' ? ' saved' : ' unsaved');
    }
  }

  /**
   * Save report
   */
  function saveReport() {
    // Get title from input
    var titleInput = document.getElementById('editor-title');
    if (titleInput) {
      state.currentReport.title = titleInput.value || 'Untitled Report';
    }

    // Collect content from blocks - preserve HTML for formatting
    // Query only from editor content area to avoid picking up blocks from other places
    var editorContent = document.getElementById('editor-content');
    var blocks = editorContent ? editorContent.querySelectorAll('.editor-v2-block') : document.querySelectorAll('.editor-v2-content .editor-v2-block');
    var content = [];

    blocks.forEach(function(block) {
      var blockData = {
        id: block.getAttribute('data-block-id'),
        type: block.getAttribute('data-block-type')
      };

      if (blockData.type === 'embed') {
        blockData.embedType = block.getAttribute('data-embed-type');
        blockData.registerId = block.getAttribute('data-register-id');
        blockData.layout = block.getAttribute('data-layout');
      } else if (blockData.type === 'divider') {
        blockData.content = '';
      } else if (blockData.type === 'cover') {
        // Cover page - collect all metadata fields
        var coverTitleInput = block.querySelector('.cover-title-input');
        var coverSubtitleInput = block.querySelector('.cover-subtitle-input');
        var coverLogoEl = block.querySelector('.cover-logo');
        blockData.coverTitle = coverTitleInput ? coverTitleInput.value : '';
        blockData.coverSubtitle = coverSubtitleInput ? coverSubtitleInput.value : '';
        blockData.coverImage = coverLogoEl ? coverLogoEl.src : '';
        // Collect metadata fields (new: .cover-meta-value for inline inputs)
        var coverMetaInputs = block.querySelectorAll('.cover-meta-value, .cover-meta-select');
        for (var k = 0; k < coverMetaInputs.length; k++) {
          var metaField = coverMetaInputs[k].getAttribute('data-field');
          if (metaField) {
            blockData[metaField] = coverMetaInputs[k].value || '';
          }
        }
      } else if (blockData.type === 'chart-placeholder') {
        blockData.chartType = block.getAttribute('data-chart-type') || 'bar';
        var chartCaptionInput = block.querySelector('.chart-caption-input');
        blockData.caption = chartCaptionInput ? chartCaptionInput.value : '';
      } else if (blockData.type === 'html') {
        // HTML block (tables from AI) - get raw HTML from wrapper
        var saveHtmlBlockEl = block.querySelector('.editor-v2-html-block');
        blockData.content = saveHtmlBlockEl ? saveHtmlBlockEl.innerHTML : '';
      } else if (blockData.type === 'table') {
        // Proper table block - extract rows and cells from DOM
        var saveTableRows = block.querySelectorAll('tr');
        blockData.rows = [];
        for (var tr = 0; tr < saveTableRows.length; tr++) {
          var saveCells = saveTableRows[tr].querySelectorAll('th, td');
          var saveRowData = { cells: [] };
          for (var td = 0; td < saveCells.length; td++) {
            saveRowData.cells.push({
              content: saveCells[td].innerHTML
            });
          }
          blockData.rows.push(saveRowData);
        }
      } else {
        var editable = block.querySelector('[contenteditable="true"]') || block;
        // Use innerHTML to preserve formatting (bold, italic, etc.)
        blockData.content = editable.innerHTML || '';
        // Also store plain text for search/display
        blockData.plainText = editable.textContent || '';
      }

      content.push(blockData);
    });

    state.currentReport.content = content;
    state.currentReport.updatedAt = new Date().toISOString();

    // Save to reports storage (V2 format)
    var reports = ERM.storage.get('reports') || [];
    var existingIndex = -1;

    for (var i = 0; i < reports.length; i++) {
      if (reports[i].id === state.currentReport.id) {
        existingIndex = i;
        break;
      }
    }

    if (existingIndex >= 0) {
      reports[existingIndex] = state.currentReport;
    } else {
      reports.push(state.currentReport);
    }

    ERM.storage.set('reports', reports);

    // Also save to recentReports for the reports list view
    var recentReports = ERM.storage.get('recentReports') || [];
    var recentIndex = -1;

    for (var j = 0; j < recentReports.length; j++) {
      if (recentReports[j].id === state.currentReport.id) {
        recentIndex = j;
        break;
      }
    }

    var recentEntry = {
      id: state.currentReport.id,
      name: state.currentReport.title,
      title: state.currentReport.title,
      type: 'custom',
      format: 'v2',
      createdAt: state.currentReport.createdAt,
      updatedAt: state.currentReport.updatedAt,
      author: state.currentReport.author,
      status: 'draft',
      content: state.currentReport.content  // Include content so it persists when reopening
    };

    if (recentIndex >= 0) {
      recentReports[recentIndex] = recentEntry;
    } else {
      recentReports.unshift(recentEntry);
    }

    ERM.storage.set('recentReports', recentReports);

    console.log('[ReportEditorV2] Saved report:', state.currentReport.id, state.currentReport.title);
    console.log('[ReportEditorV2] Content blocks:', content.length);
    console.log('[ReportEditorV2] Total reports in storage:', recentReports.length);

    state.isDirty = false;
    state.lastSaved = new Date();
    updateStatus('Saved');

    if (ERM.toast) {
      ERM.toast.success('Report saved');
    }
  }

  /**
   * Get comprehensive PDF styles (single source of truth for all exports)
   *
   * A4 PRINT CONSTANTS (NON-NEGOTIABLE - PDF is source of truth):
   * - A4 Width:  210mm
   * - A4 Height: 297mm
   * - Margins:   20mm all sides
   * - Usable content width:  210mm - 20mm - 20mm = 170mm
   * - Usable content height: 297mm - 20mm - 20mm = 257mm
   *
   * These values MUST match Puppeteer's pdf() options exactly.
   */
  function getPDFStyles() {
    // A4 Print Constants - MUST match editor CSS exactly
    // Professional margins: 25mm top/bottom, 25mm left, 20mm right
    var A4_WIDTH = '210mm';
    var A4_HEIGHT = '297mm';
    var MARGIN_TOP = '25mm';
    var MARGIN_BOTTOM = '25mm';
    var MARGIN_LEFT = '25mm';
    var MARGIN_RIGHT = '20mm';
    var CONTENT_HEIGHT = '247mm'; // 297mm - 25mm - 25mm

    return (
      // ===========================================
      // FONT IMPORT - Must be first in CSS
      // ===========================================
      '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");' +

      // ===========================================
      // @PAGE RULES - A4 with professional margins (MUST match editor)
      // ===========================================
      '@page { size: A4; margin: ' + MARGIN_TOP + ' ' + MARGIN_RIGHT + ' ' + MARGIN_BOTTOM + ' ' + MARGIN_LEFT + '; }' +
      '@page :first { margin-top: 0; }' +

      // ===========================================
      // PRINT MEDIA OVERRIDES
      // ===========================================
      '@media print {' +
      '  html, body { height: auto !important; overflow: visible !important; }' +
      '  body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }' +
      '  .pdf-page { display: block !important; margin: 0 !important; padding: 0 !important; }' +
      '  .pdf-cover-page { display: block !important; page-break-after: always !important; break-after: page !important; height: ' + A4_HEIGHT + ' !important; overflow: hidden !important; padding: ' + MARGIN_TOP + ' ' + MARGIN_RIGHT + ' ' + MARGIN_BOTTOM + ' ' + MARGIN_LEFT + ' !important; }' +
      '  .pdf-page-break { display: block !important; page-break-after: always !important; break-after: page !important; height: 0 !important; margin: 0 !important; padding: 0 !important; visibility: hidden !important; clear: both !important; }' +
      '}' +

      // ===========================================
      // BASE DOCUMENT
      // ===========================================
      'html, body { margin: 0; padding: 0; font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; line-height: 1.6; background: white; }' +

      // ===========================================
      // PDF PAGE CONTAINER - Each page from editor
      // ===========================================
      '.pdf-page { display: block; background: white; }' +
      '.pdf-page-content { padding: 0; }' +

      // ===========================================
      // PDF PAGE BREAK - Forces new page in PDF
      // ===========================================
      '.pdf-page-break { display: block; page-break-after: always !important; break-after: page !important; height: 0; margin: 0; padding: 0; visibility: hidden; clear: both; }' +

      // ===========================================
      // COVER PAGE
      // ===========================================
      '.pdf-cover-page { width: ' + A4_WIDTH + '; height: ' + A4_HEIGHT + '; padding: ' + MARGIN_TOP + ' ' + MARGIN_RIGHT + ' ' + MARGIN_BOTTOM + ' ' + MARGIN_LEFT + '; box-sizing: border-box; display: flex; flex-direction: column; page-break-after: always; break-after: page; background: white; position: relative; }' +
      '.pdf-cover-header { display: flex; justify-content: space-between; align-items: flex-start; flex-shrink: 0; margin-bottom: 40mm; }' +
      '.pdf-cover-logo { max-width: 120px; max-height: 60px; object-fit: contain; }' +
      '.pdf-cover-classification { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 12px; border-radius: 4px; background: #f3f4f6; color: #6b7280; }' +
      '.pdf-classification-internal { background: #dbeafe; color: #1d4ed8; }' +
      '.pdf-classification-confidential { background: #fee2e2; color: #dc2626; }' +
      '.pdf-classification-board { background: #fef3c7; color: #d97706; }' +
      '.pdf-classification-audit { background: #f3e8ff; color: #7c3aed; }' +
      '.pdf-classification-public { background: #dcfce7; color: #16a34a; }' +
      '.pdf-cover-main { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }' +
      '.pdf-cover-title { font-size: 42px; font-weight: 700; color: #111827; margin: 0 0 12px 0; letter-spacing: -0.5px; line-height: 1.2; }' +
      '.pdf-cover-subtitle { font-size: 18px; color: #6b7280; margin: 0 0 24px 0; }' +
      '.pdf-cover-divider { width: 60px; height: 3px; background: #c41e3a; border-radius: 2px; margin: 0 auto 40px auto; }' +
      '.pdf-cover-meta { display: grid; grid-template-columns: 1fr 1fr; grid-template-rows: auto auto; gap: 20px 60px; text-align: left; }' +
      '.pdf-cover-meta-item { }' +
      '.pdf-cover-meta-label { display: block; font-size: 10px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }' +
      '.pdf-cover-meta-value { font-size: 14px; font-weight: 500; color: #374151; }' +

      // ===========================================
      // HEADINGS
      // ===========================================
      'h1 { font-size: 21px; font-weight: 600; color: #1e293b; margin: 24px 0 8px 0; line-height: 1.3; page-break-after: avoid; break-after: avoid; page-break-inside: avoid; break-inside: avoid; }' +
      'h2 { font-size: 19px; font-weight: 600; color: #1e293b; margin: 20px 0 6px 0; line-height: 1.35; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; page-break-after: avoid; break-after: avoid; page-break-inside: avoid; break-inside: avoid; }' +
      'h3 { font-size: 16px; font-weight: 600; color: #1e293b; margin: 16px 0 4px 0; line-height: 1.4; page-break-after: avoid; break-after: avoid; page-break-inside: avoid; break-inside: avoid; }' +
      'h1 + p, h2 + p, h3 + p { page-break-before: avoid; break-before: avoid; }' +

      // ===========================================
      // PARAGRAPHS & INLINE FORMATTING
      // ===========================================
      'p { font-size: 15px; margin: 0 0 12px 0; line-height: 1.6; color: #1e293b; orphans: 2; widows: 2; }' +
      'strong, b { font-weight: 600; color: #1e293b; }' +
      'em, i { font-style: italic; }' +
      'u { text-decoration: underline; }' +
      'code { font-family: "Courier New", monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 3px; font-size: 0.9em; }' +

      // ===========================================
      // LISTS
      // ===========================================
      'ul, ol { font-size: 15px; margin: 4px 0 12px 0; padding-left: 20px; line-height: 1.6; color: #1e293b; }' +
      'ul { list-style-type: disc !important; }' +
      'ol { list-style-type: decimal !important; }' +
      'li { margin: 2px 0; padding: 2px 0; line-height: 1.6; color: #1e293b; page-break-inside: avoid; break-inside: avoid; display: list-item !important; font-size: 15px; }' +
      'li p { margin: 0; display: inline; }' +
      'li strong, li b { font-weight: 600; }' +
      'li em, li i { font-style: italic; }' +
      'ul ul { margin: 4px 0; list-style-type: circle; }' +
      'ol ol { margin: 4px 0; }' +
      'ul ul ul { list-style-type: square; }' +

      // ===========================================
      // BLOCKQUOTES & CALLOUTS
      // ===========================================
      'blockquote { font-size: 15px; line-height: 1.6; border-left: 3px solid #e5e7eb; padding-left: 16px; margin: 8px 0 12px 0; color: #6b7280; font-style: italic; page-break-inside: avoid; break-inside: avoid; }' +
      '.pdf-callout { font-size: 15px; line-height: 1.6; background: #fef3c7; border-radius: 8px; padding: 16px; margin: 8px 0 12px 0; color: #92400e; page-break-inside: avoid; break-inside: avoid; }' +

      // ===========================================
      // DIVIDERS
      // ===========================================
      'hr { border: none; border-top: 1px solid #e5e7eb; margin: 28px 0; }' +

      // ===========================================
      // TABLES - Professional pagination rules
      // ===========================================
      '.pdf-table-wrapper { margin: 16px 0; overflow-x: visible; }' +
      // Tables can span pages but rows stay together
      '.pdf-table-wrapper table, table, table.ai-table, .editor-v2-table { display: table !important; width: 100%; border-collapse: collapse !important; border-spacing: 0 !important; margin: 0; font-size: 14px; page-break-inside: auto; break-inside: auto; table-layout: auto; }' +
      // CRITICAL: thead repeats on each page when table spans multiple pages
      'thead { display: table-header-group !important; }' +
      'tbody { display: table-row-group !important; }' +
      // Never split a row across pages
      'tr { display: table-row !important; page-break-inside: avoid; break-inside: avoid; margin: 0 !important; padding: 0 !important; border: none !important; }' +
      'th, td { display: table-cell !important; border: 1px solid #e5e7eb !important; padding: 10px 12px; text-align: left; vertical-align: top; margin: 0 !important; font-size: 14px; line-height: 1.5; box-sizing: border-box; }' +
      'th { background: #f9fafb; font-weight: 600; color: #374151; }' +
      'td { color: #374151; background: white; }' +
      'tbody tr:nth-child(even) td { background: #f9fafb; }' +

      // ===========================================
      // EMBEDS - Container (Clean, no chrome)
      // ===========================================
      '.pdf-embed { margin: 16px 0; padding: 0; background: transparent; border: none; border-radius: 0; page-break-inside: avoid; break-inside: avoid; }' +

      // ===========================================
      // EMBED - Section Titles (Headers) - MUST SHOW
      // ===========================================
      '.pdf-embed .section-title, .pdf-embed h2.section-title { display: block !important; font-size: 13px !important; font-weight: 600 !important; color: #111827 !important; margin: 0 0 10px 0 !important; padding: 0 !important; border: none !important; }' +
      '.pdf-embed .section-header { display: block !important; margin-bottom: 8px !important; }' +
      '.pdf-embed .section-subtitle { display: none !important; }' +
      '.pdf-embed .section-header-row { display: none !important; }' +
      '.pdf-embed .dashboard-section { margin: 0 !important; padding: 0 !important; background: transparent !important; border: none !important; }' +
      // Hide ONLY heatmap section title (they have card headers)
      '.pdf-embed .heatmaps-section > .section-title { display: none !important; }' +

      // ===========================================
      // EMBED - Top Risks Table (Notion-style)
      // ===========================================
      '.pdf-embed .top-risks-table-wrapper { background: transparent !important; border: none !important; overflow: visible !important; }' +
      '.pdf-embed .top-risks-table { width: 100% !important; border-collapse: collapse !important; font-size: 10px !important; border: none !important; table-layout: fixed !important; }' +
      '.pdf-embed .top-risks-table thead { background: transparent !important; }' +
      '.pdf-embed .top-risks-table th { padding: 6px 4px !important; font-size: 9px !important; font-weight: 500 !important; color: #9ca3af !important; text-transform: none !important; border: none !important; border-bottom: 1px solid #e5e7eb !important; background: transparent !important; }' +
      '.pdf-embed .top-risks-table td { padding: 6px 4px !important; font-size: 10px !important; color: #374151 !important; border: none !important; border-bottom: 1px solid #f3f4f6 !important; vertical-align: top !important; }' +
      '.pdf-embed .top-risks-table tbody tr:last-child td { border-bottom: none !important; }' +
      // Column widths
      '.pdf-embed .top-risks-table th:nth-child(1), .pdf-embed .top-risks-table td:nth-child(1) { width: auto !important; min-width: 100px !important; }' +
      '.pdf-embed .top-risks-table th:nth-child(2), .pdf-embed .top-risks-table td:nth-child(2) { width: 80px !important; }' +
      '.pdf-embed .top-risks-table th:nth-child(3), .pdf-embed .top-risks-table td:nth-child(3) { width: 40px !important; text-align: center !important; }' +
      '.pdf-embed .top-risks-table th:nth-child(4), .pdf-embed .top-risks-table td:nth-child(4) { width: 60px !important; }' +
      '.pdf-embed .top-risks-table th:nth-child(5), .pdf-embed .top-risks-table td:nth-child(5) { width: 70px !important; }' +
      '.pdf-embed .top-risks-table th:nth-child(6), .pdf-embed .top-risks-table td:nth-child(6) { width: 80px !important; white-space: normal !important; word-wrap: break-word !important; }' +
      // Risk title wrapping
      '.pdf-embed .risk-title-text { font-weight: 500 !important; color: #111827 !important; font-size: 10px !important; white-space: normal !important; word-wrap: break-word !important; line-height: 1.3 !important; }' +

      // ===========================================
      // EMBED - Risk Badges (Status Pills)
      // ===========================================
      '.pdf-embed .risk-badge { display: inline-flex !important; padding: 2px 6px !important; border-radius: 999px !important; font-size: 9px !important; font-weight: 600 !important; white-space: nowrap !important; }' +
      '.pdf-embed .risk-badge-low { background: #ecfdf3 !important; color: #027a48 !important; }' +
      '.pdf-embed .risk-badge-medium { background: #fffaeb !important; color: #b54708 !important; }' +
      '.pdf-embed .risk-badge-high { background: #fff7ed !important; color: #c2410c !important; }' +
      '.pdf-embed .risk-badge-critical { background: #fef2f2 !important; color: #b91c1c !important; }' +

      // ===========================================
      // EMBED - Heatmaps (Side by side, centered)
      // ===========================================
      '.pdf-embed .heatmaps-section { display: block !important; }' +
      '.pdf-embed .heatmaps-row { display: flex !important; flex-direction: row !important; gap: 20px !important; flex-wrap: nowrap !important; justify-content: center !important; align-items: flex-start !important; padding: 4px 0 !important; }' +
      '.pdf-embed .heatmap-card { flex: 0 0 auto !important; background: transparent !important; border: none !important; padding: 0 !important; box-shadow: none !important; }' +
      '.pdf-embed .heatmap-card-header { padding: 0 0 2px 0 !important; margin-bottom: 2px !important; border-bottom: none !important; }' +
      '.pdf-embed .heatmap-card-title { font-size: 10px !important; font-weight: 600 !important; color: #374151 !important; }' +
      '.pdf-embed .heatmap-card-subtitle { display: none !important; }' +
      // Heatmap grid layout
      '.pdf-embed .heatmap-wrapper { width: auto !important; }' +
      '.pdf-embed .heatmap-grid-container { gap: 1px !important; }' +
      '.pdf-embed .heatmap-main { gap: 1px !important; }' +
      '.pdf-embed .heatmap-row { display: flex !important; gap: 1px !important; align-items: center !important; }' +
      '.pdf-embed .heatmap-row-label { width: 10px !important; font-size: 7px !important; color: #6b7280 !important; text-align: right !important; padding-right: 2px !important; }' +
      // Heatmap cells - compact
      '.pdf-embed .heatmap-cell { width: 24px !important; height: 24px !important; min-width: 24px !important; min-height: 24px !important; max-width: 24px !important; max-height: 24px !important; border-radius: 3px !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-direction: column !important; }' +
      '.pdf-embed .heatmap-x-row { display: flex !important; gap: 1px !important; padding-left: 12px !important; }' +
      '.pdf-embed .heatmap-x-label { width: 24px !important; font-size: 7px !important; text-align: center !important; color: #6b7280 !important; }' +
      '.pdf-embed .heatmap-y-label { font-size: 6px !important; color: #9ca3af !important; letter-spacing: 0.3px !important; }' +
      '.pdf-embed .heatmap-x-axis-title { font-size: 6px !important; color: #9ca3af !important; margin-top: 2px !important; letter-spacing: 0.3px !important; }' +
      '.pdf-embed .heatmap-spacer { width: 10px !important; }' +
      // Cell colors - EXACT MATCH to dashboard
      '.pdf-embed .risk-low { background: #bef264 !important; }' +
      '.pdf-embed .risk-medium { background: #fde047 !important; }' +
      '.pdf-embed .risk-high { background: #fb923c !important; }' +
      '.pdf-embed .risk-critical { background: #f87171 !important; }' +
      // Risk dots inside cells
      '.pdf-embed .risk-dots { display: flex !important; flex-wrap: wrap !important; gap: 1px !important; padding: 1px !important; justify-content: center !important; align-items: center !important; max-width: 22px !important; }' +
      '.pdf-embed .risk-dot { width: 3px !important; height: 3px !important; border-radius: 50% !important; background: rgba(0,0,0,0.5) !important; }' +
      '.pdf-embed .risk-dot-more { font-size: 6px !important; color: rgba(0,0,0,0.6) !important; }' +
      '.pdf-embed .cell-count { font-size: 6px !important; color: rgba(0,0,0,0.5) !important; margin-top: 1px !important; }' +
      // Legend - SMALL, centered, matching cell colors
      '.pdf-embed .heatmap-legend { display: flex !important; justify-content: center !important; margin-top: 6px !important; gap: 8px !important; flex-wrap: wrap !important; }' +
      '.pdf-embed .legend-item { display: inline-flex !important; align-items: center !important; font-size: 8px !important; font-weight: 500 !important; padding: 2px 5px !important; border-radius: 3px !important; }' +
      '.pdf-embed .legend-item.risk-low { background: #bef264 !important; color: #3f6212 !important; }' +
      '.pdf-embed .legend-item.risk-medium { background: #fde047 !important; color: #713f12 !important; }' +
      '.pdf-embed .legend-item.risk-high { background: #fb923c !important; color: #7c2d12 !important; }' +
      '.pdf-embed .legend-item.risk-critical { background: #f87171 !important; color: #7f1d1d !important; }' +

      // ===========================================
      // EMBED - KPI Cards (Inline stats)
      // ===========================================
      '.pdf-embed .kpi-cards { display: flex !important; gap: 0 !important; flex-wrap: wrap !important; padding: 6px 0 !important; }' +
      '.pdf-embed .kpi-card { flex: 1 1 auto !important; min-width: 60px !important; max-width: 100px !important; background: transparent !important; padding: 4px 10px 4px 0 !important; border: none !important; border-right: 1px solid #e5e7eb !important; }' +
      '.pdf-embed .kpi-card:last-child { border-right: none !important; padding-right: 0 !important; }' +
      '.pdf-embed .kpi-icon { display: none !important; }' +
      '.pdf-embed .kpi-value { font-size: 16px !important; font-weight: 600 !important; color: #111827 !important; line-height: 1.2 !important; }' +
      '.pdf-embed .kpi-label { font-size: 9px !important; font-weight: 500 !important; color: #9ca3af !important; margin-top: 1px !important; }' +
      '.pdf-embed .kpi-subtle { display: none !important; }' +

      // ===========================================
      // EMBED - Risk Concentration Chart (with title)
      // ===========================================
      '.pdf-embed .risk-concentration-chart { display: flex !important; flex-direction: column !important; gap: 4px !important; padding: 6px 0 !important; }' +
      '.pdf-embed .category-bar-row { display: grid !important; grid-template-columns: 100px 1fr 45px !important; align-items: center !important; gap: 8px !important; padding: 3px 0 !important; background: transparent !important; border: none !important; }' +
      '.pdf-embed .category-bar-label { font-size: 10px !important; font-weight: 500 !important; color: #374151 !important; overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }' +
      '.pdf-embed .category-bar-track { width: 100% !important; height: 6px !important; background: #f3f4f6 !important; border-radius: 3px !important; overflow: hidden !important; }' +
      '.pdf-embed .category-bar { height: 100% !important; background: #94a3b8 !important; border-radius: 3px !important; }' +
      '.pdf-embed .category-bar-value { font-size: 9px !important; font-weight: 500 !important; color: #6b7280 !important; text-align: right !important; }' +

      // ===========================================
      // EMBED - Control Coverage (with title)
      // ===========================================
      '.pdf-embed .control-cards { display: flex !important; gap: 0 !important; flex-wrap: wrap !important; padding: 6px 0 !important; }' +
      '.pdf-embed .control-card { background: transparent !important; border: none !important; border-right: 1px solid #e5e7eb !important; padding: 4px 10px 4px 0 !important; margin-right: 10px !important; min-width: 60px !important; }' +
      '.pdf-embed .control-card:last-child { border-right: none !important; padding-right: 0 !important; margin-right: 0 !important; }' +
      '.pdf-embed .control-card-value { font-size: 14px !important; font-weight: 600 !important; color: #111827 !important; line-height: 1.2 !important; margin-bottom: 1px !important; }' +
      '.pdf-embed .control-card-label { font-size: 8px !important; font-weight: 500 !important; color: #9ca3af !important; line-height: 1.2 !important; }' +
      '.pdf-embed .control-card::after { display: none !important; }' +
      '.pdf-embed .control-card[data-tooltip]::before { display: none !important; }' +

      // ===========================================
      // CHART PLACEHOLDERS
      // ===========================================
      '.pdf-chart-placeholder { margin: 24px 0; padding: 40px; background: #f9fafb; border: 2px dashed #e5e7eb; border-radius: 12px; text-align: center; page-break-inside: avoid; break-inside: avoid; }' +
      '.pdf-chart-icon { margin-bottom: 12px; }' +
      '.pdf-chart-text { font-size: 14px; color: #9ca3af; font-weight: 500; }' +
      '.pdf-chart-caption { font-size: 13px; color: #6b7280; margin-top: 8px; font-style: italic; }'
    );
  }

  /**
   * Generate PDF HTML from editor pages
   * CRITICAL: Uses the editor's actual page structure (.editor-v2-page containers)
   * This ensures PDF page breaks match exactly what user sees in the editor
   */
  function generatePDFHtml() {
    var finalHtml = '';
    var coverHtml = '';

    // Get editor pages - these ARE the source of truth for page breaks
    var editorPages = document.querySelectorAll('.editor-v2-page');
    console.log('[PDF Export] Found', editorPages.length, 'editor pages');

    // Process each editor page
    for (var pageIndex = 0; pageIndex < editorPages.length; pageIndex++) {
      var editorPage = editorPages[pageIndex];
      var pageContent = '';

      // Get blocks in this page (direct children only)
      var blocks = editorPage.querySelectorAll(':scope > .editor-v2-block');
      console.log('[PDF Export] Page', pageIndex + 1, 'has', blocks.length, 'blocks');

      for (var b = 0; b < blocks.length; b++) {
        var block = blocks[b];
        var type = block.getAttribute('data-block-type');
        var contentEl = block.querySelector('[contenteditable="true"]') || block;
        var content = contentEl.innerHTML || contentEl.textContent || '';

        switch (type) {
          case 'heading1':
            pageContent += '<h1>' + content + '</h1>';
            break;
          case 'heading2':
            pageContent += '<h2>' + content + '</h2>';
            break;
          case 'heading3':
            pageContent += '<h3>' + content + '</h3>';
            break;
          case 'paragraph':
            if (content.trim()) {
              pageContent += '<p>' + content + '</p>';
            }
            break;
          case 'bullet':
            pageContent += '<ul><li>' + content + '</li></ul>';
            break;
          case 'number':
            pageContent += '<ol><li>' + content + '</li></ol>';
            break;
          case 'bullet_list':
            pageContent += '<ul>';
            var bulletListItems = block.querySelectorAll('li');
            for (var bli = 0; bli < bulletListItems.length; bli++) {
              pageContent += '<li>' + (bulletListItems[bli].innerHTML || '') + '</li>';
            }
            pageContent += '</ul>';
            break;
          case 'numbered_list':
            pageContent += '<ol>';
            var numberListItems = block.querySelectorAll('li');
            for (var nli = 0; nli < numberListItems.length; nli++) {
              pageContent += '<li>' + (numberListItems[nli].innerHTML || '') + '</li>';
            }
            pageContent += '</ol>';
            break;
          case 'table':
            var tableEl = block.querySelector('.editor-v2-table');
            if (tableEl) {
              pageContent += '<div class="pdf-table-wrapper">' + tableEl.outerHTML + '</div>';
            }
            break;
          case 'quote':
            pageContent += '<blockquote>' + content + '</blockquote>';
            break;
          case 'callout':
            pageContent += '<div class="pdf-callout">' + content + '</div>';
            break;
          case 'divider':
            pageContent += '<hr>';
            break;
          case 'pagebreak':
            // Skip - page breaks are handled by page container structure
            break;
          case 'cover':
            // Cover page - exact A4 with 20mm padding
            var coverTitle = block.querySelector('.cover-title-input');
            var coverSubtitle = block.querySelector('.cover-subtitle-input');
            var coverLogo = block.querySelector('.cover-logo');
            var coverMetaInputs = block.querySelectorAll('.cover-meta-value');
            var coverClassSelect = block.querySelector('.cover-meta-select[data-field="classification"]');

            coverHtml += '<div class="pdf-cover-page">';

            // Header: logo left, classification right
            coverHtml += '<div class="pdf-cover-header">';
            if (coverLogo && coverLogo.src) {
              coverHtml += '<img src="' + coverLogo.src + '" class="pdf-cover-logo" alt="Logo">';
            } else {
              coverHtml += '<div></div>';
            }
            if (coverClassSelect && coverClassSelect.value) {
              coverHtml += '<div class="pdf-cover-classification pdf-classification-' + coverClassSelect.value.toLowerCase() + '">' + escapeHtml(coverClassSelect.value) + '</div>';
            }
            coverHtml += '</div>';

            // Main: title, divider, subtitle centered
            coverHtml += '<div class="pdf-cover-main">';
            if (coverTitle && coverTitle.value) {
              coverHtml += '<h1 class="pdf-cover-title">' + escapeHtml(coverTitle.value) + '</h1>';
            }
            if (coverSubtitle && coverSubtitle.value) {
              coverHtml += '<p class="pdf-cover-subtitle">' + escapeHtml(coverSubtitle.value) + '</p>';
            }
            coverHtml += '<div class="pdf-cover-divider"></div>';

            // Metadata grid
            coverHtml += '<div class="pdf-cover-meta">';
            for (var m = 0; m < coverMetaInputs.length; m++) {
              var metaInput = coverMetaInputs[m];
              var metaField = metaInput.getAttribute('data-field');
              var metaValue = metaInput.value;
              if (metaValue) {
                var metaLabel = metaField.replace(/([A-Z])/g, ' $1').replace(/^./, function(str) { return str.toUpperCase(); });
                coverHtml += '<div class="pdf-cover-meta-item">';
                coverHtml += '<span class="pdf-cover-meta-label">' + metaLabel + '</span>';
                coverHtml += '<span class="pdf-cover-meta-value">' + escapeHtml(metaValue) + '</span>';
                coverHtml += '</div>';
              }
            }
            coverHtml += '</div>';
            coverHtml += '</div>';
            coverHtml += '</div>';
            break;
          case 'embed':
            var embedContent = block.querySelector('.editor-v2-embed-content');
            if (embedContent) {
              pageContent += '<div class="pdf-embed">' + embedContent.innerHTML + '</div>';
            }
            break;
          case 'chart-placeholder':
            var chartCaption = block.querySelector('.chart-caption-input');
            pageContent += '<div class="pdf-chart-placeholder">';
            pageContent += '<div class="pdf-chart-icon"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="3" y1="20" x2="21" y2="20"/></svg></div>';
            pageContent += '<div class="pdf-chart-text">Chart Placeholder</div>';
            if (chartCaption && chartCaption.value) {
              pageContent += '<div class="pdf-chart-caption">' + escapeHtml(chartCaption.value) + '</div>';
            }
            pageContent += '</div>';
            break;
          case 'html':
            var htmlBlockEl = block.querySelector('.editor-v2-html-block');
            if (htmlBlockEl) {
              pageContent += '<div class="pdf-table-wrapper">' + htmlBlockEl.innerHTML + '</div>';
            }
            break;
        }
      }

      // Add this page's content (skip empty pages)
      if (pageContent.trim()) {
        // Wrap in page container for PDF
        finalHtml += '<div class="pdf-page">';
        finalHtml += '<div class="pdf-page-content">' + pageContent + '</div>';
        finalHtml += '</div>';

        // Add page break after each page except the last
        if (pageIndex < editorPages.length - 1) {
          finalHtml += '<div class="pdf-page-break"></div>';
        }
      }
    }

    // If we have a cover page, prepend it
    if (coverHtml) {
      finalHtml = coverHtml + '<div class="pdf-page-break"></div>' + finalHtml;
    }

    console.log('[PDF Export] Generated HTML with', editorPages.length, 'pages');
    return finalHtml;
  }

  // Keep old function name as alias for compatibility
  function generatePreviewHtml() {
    return generatePDFHtml();
  }

  /**
   * Export to PDF directly from editor (with fancy animated modal like hamburger menu)
   */
  function exportToPDF() {
    console.log('[ReportEditorV2] exportToPDF() called - showing animated modal');

    // Sync content from DOM to state
    syncContentFromDOM();

    // Show the same fancy export progress modal as hamburger menu
    var progressContent = '';
    progressContent += '<div class="export-progress-container">';
    progressContent += '  <div class="export-progress-content" id="export-progress-content">';
    progressContent += '    <div class="export-icon-wrapper" id="export-icon-wrapper">';
    progressContent += '      <div class="export-icon-circle" id="export-icon-circle">';
    // Document icon (initial)
    progressContent += '        <svg id="export-stage-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32">';
    progressContent += '          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>';
    progressContent += '          <polyline points="14 2 14 8 20 8"/>';
    progressContent += '          <line x1="16" y1="13" x2="8" y2="13"/>';
    progressContent += '          <line x1="16" y1="17" x2="8" y2="17"/>';
    progressContent += '        </svg>';
    progressContent += '      </div>';
    progressContent += '    </div>';
    progressContent += '    <h3 class="export-progress-title" id="export-progress-title">Generating Report...</h3>';
    progressContent += '    <div class="export-progress-bar-container">';
    progressContent += '      <div class="export-progress-bar">';
    progressContent += '        <div class="export-progress-fill" id="pdf-export-progress-fill"></div>';
    progressContent += '      </div>';
    progressContent += '    </div>';
    progressContent += '    <p class="export-progress-status" id="pdf-export-status">Preparing document...</p>';
    progressContent += '  </div>';
    progressContent += '</div>';

    console.log('[ReportEditorV2] Calling ERM.components.showModal...');

    if (!ERM.components || !ERM.components.showModal) {
      console.error('[ReportEditorV2] ERM.components.showModal not available!');
      // Fallback: just do the export without animation
      performV2PDFExport();
      return;
    }

    ERM.components.showModal({
      title: 'Exporting PDF',
      content: progressContent,
      size: 'small',
      buttons: [],
      closeOnBackdrop: false,
      showCloseButton: false
    });

    console.log('[ReportEditorV2] Modal shown, starting animation AND PDF generation');

    // Start animation AND PDF generation in parallel
    animateV2ExportProgress();
    performV2PDFExport();
  }

  /**
   * Animate export progress for V2 reports
   */
  function animateV2ExportProgress() {
    console.log('[ReportEditorV2] animateV2ExportProgress() called');

    var progressFill = document.getElementById('pdf-export-progress-fill');
    var statusText = document.getElementById('pdf-export-status');
    var iconCircle = document.getElementById('export-icon-circle');
    var iconWrapper = document.getElementById('export-icon-wrapper');
    var titleEl = document.getElementById('export-progress-title');

    console.log('[ReportEditorV2] Modal elements found:', {
      progressFill: !!progressFill,
      statusText: !!statusText,
      iconCircle: !!iconCircle
    });

    // Icons for each stage
    var icons = {
      document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      format: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>',
      download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="32" height="32"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
      success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="32" height="32"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
    };

    var stages = [
      { progress: 30, text: 'Preparing document...', icon: 'document' },
      { progress: 60, text: 'Formatting content...', icon: 'format' },
      { progress: 90, text: 'Preparing download...', icon: 'download' },
      { progress: 100, text: 'Finalizing...', icon: 'download' }
    ];

    var stageIndex = 0;

    function updateIcon(iconKey) {
      if (iconCircle && icons[iconKey]) {
        iconCircle.innerHTML = icons[iconKey];
        // Add a subtle pulse animation on icon change
        iconCircle.style.transform = 'scale(1.1)';
        setTimeout(function() {
          iconCircle.style.transform = 'scale(1)';
        }, 150);
      }
    }

    function nextStage() {
      if (stageIndex < stages.length) {
        var stage = stages[stageIndex];
        if (progressFill) progressFill.style.width = stage.progress + '%';
        if (statusText) statusText.textContent = stage.text;
        updateIcon(stage.icon);
        stageIndex++;

        if (stageIndex < stages.length) {
          setTimeout(nextStage, 600);
        } else {
          // Show completion state
          setTimeout(function() {
            // Transform to success state
            updateIcon('success');
            if (iconCircle) iconCircle.classList.add('success');
            if (iconWrapper) iconWrapper.classList.add('success');
            if (titleEl) {
              titleEl.textContent = 'Report Ready!';
              titleEl.classList.add('success');
            }
            if (statusText) statusText.textContent = 'Your PDF is ready for download';

            // Modal will be closed by performV2PDFExport after successful download
          }, 400);
        }
      }
    }

    // Start animation after a short delay
    setTimeout(nextStage, 300);
  }

  /**
   * Perform the actual V2 PDF export (uses server-side Puppeteer)
   */
  function performV2PDFExport() {
    // Generate preview HTML from current editor state
    var previewHtml = generatePreviewHtml();
    var reportTitle = state.currentReport.title || 'Untitled Report';

    // Use unified PDF styles - same as preview and all other exports
    var pdfStyles = getPDFStyles();

    // Build complete HTML document
    var fullHTML =
      '<!DOCTYPE html>' +
      '<html><head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
      '<title>' + escapeHtml(reportTitle) + '</title>' +
      '<style>' + pdfStyles + '</style>' +
      '</head><body>' +
      previewHtml +
      '</body></html>';

    // Generate filename
    var filename = reportTitle.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
    filename += '_' + new Date().toISOString().split('T')[0];

    console.log('[ReportEditorV2] Sending to server for Puppeteer rendering...');
    console.log('[ReportEditorV2] HTML size:', (fullHTML.length / 1024).toFixed(2), 'KB');

    // Send to server for Puppeteer rendering
    fetch('/api/reports/export-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: fullHTML,
        title: filename,
        options: {
          format: 'A4',
          printBackground: true,
          preferCSSPageSize: true
        }
      })
    })
    .then(function(response) {
      console.log('[ReportEditorV2] Response status:', response.status);
      console.log('[ReportEditorV2] Response headers:', response.headers.get('content-type'));

      if (!response.ok) {
        // Try to read as text first to see error
        return response.text().then(function(text) {
          console.error('[ReportEditorV2] Server error response:', text.substring(0, 500));
          try {
            var err = JSON.parse(text);
            throw new Error(err.message || 'Export failed');
          } catch(e) {
            throw new Error('Export failed: ' + response.status);
          }
        });
      }

      // Verify it's actually a PDF
      var contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('pdf')) {
        console.warn('[ReportEditorV2] WARNING: Response is not PDF! Content-Type:', contentType);
      }

      return response.blob();
    })
    .then(function(blob) {
      console.log('[ReportEditorV2] PDF received, size:', (blob.size / 1024).toFixed(2), 'KB');
      console.log('[ReportEditorV2] Blob type:', blob.type);
      console.log('[ReportEditorV2] Blob size bytes:', blob.size);

      // Verify blob is not empty
      if (blob.size === 0) {
        throw new Error('PDF blob is empty!');
      }

      // Verify PDF signature - return a promise chain
      return blob.arrayBuffer().then(function(arrayBuffer) {
        var header = new Uint8Array(arrayBuffer.slice(0, 5));
        var headerStr = String.fromCharCode.apply(null, header);
        console.log('[ReportEditorV2] PDF header check:', headerStr);

        if (headerStr !== '%PDF-') {
          // Not a PDF - log what we got
          var textDecoder = new TextDecoder();
          var preview = textDecoder.decode(new Uint8Array(arrayBuffer.slice(0, 200)));
          console.error('[ReportEditorV2] NOT A VALID PDF! First 200 chars:', preview);
          throw new Error('Server returned invalid PDF. Check server logs.');
        }

        // Valid PDF - create blob with correct type
        var pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        return pdfBlob;
      });
    })
    .then(function(pdfBlob) {
      var url = window.URL.createObjectURL(pdfBlob);
      console.log('[ReportEditorV2] Created object URL:', url);

      var a = document.createElement('a');
      a.href = url;
      a.download = filename + '.pdf';
      document.body.appendChild(a);

      console.log('[ReportEditorV2] Triggering download for:', filename + '.pdf');
      console.log('[ReportEditorV2] Download link href:', a.href);
      console.log('[ReportEditorV2] Download attribute:', a.download);

      // Try multiple download methods for better browser compatibility
      var downloadSuccess = false;

      // Method 1: Direct click
      try {
        console.log('[ReportEditorV2] Attempting method 1: direct click');
        a.click();
        downloadSuccess = true;
        console.log('[ReportEditorV2] Method 1 succeeded');
      } catch (e) {
        console.error('[ReportEditorV2] Method 1 failed:', e);

        // Method 2: Dispatch click event
        try {
          console.log('[ReportEditorV2] Attempting method 2: dispatchEvent');
          var clickEvent = document.createEvent('MouseEvents');
          clickEvent.initEvent('click', true, true);
          a.dispatchEvent(clickEvent);
          downloadSuccess = true;
          console.log('[ReportEditorV2] Method 2 succeeded');
        } catch (e2) {
          console.error('[ReportEditorV2] Method 2 failed:', e2);

          // Method 3: Window.open fallback
          try {
            console.log('[ReportEditorV2] Attempting method 3: window.open');
            window.open(url, '_blank');
            downloadSuccess = true;
            console.log('[ReportEditorV2] Method 3 succeeded - PDF opened in new tab');
          } catch (e3) {
            console.error('[ReportEditorV2] Method 3 failed:', e3);
          }
        }
      }

      if (!downloadSuccess) {
        console.error('[ReportEditorV2] All download methods failed!');
        if (ERM.toast) {
          ERM.toast.show({ type: 'error', message: 'Download failed. Check browser console.' });
        }
      }

      // Clean up after download starts (60s delay - don't revoke too early)
      setTimeout(function() {
        console.log('[ReportEditorV2] Cleaning up object URL');
        try {
          window.URL.revokeObjectURL(url);
          if (a.parentNode) {
            document.body.removeChild(a);
          }
        } catch(e) {
          console.log('[ReportEditorV2] Cleanup error (non-critical):', e);
        }
      }, 60000);

      // Close modal after brief delay to show success state
      setTimeout(function() {
        if (ERM.components && ERM.components.closeModal) {
          console.log('[ReportEditorV2] Closing export modal');
          ERM.components.closeModal();
        }
      }, 1500);

      if (ERM.toast) {
        ERM.toast.show({ type: 'success', message: 'PDF downloaded successfully!' });
      }

      // Log activity
      if (ERM.activityLogger) {
        ERM.activityLogger.log('report', 'exported', 'report', reportTitle, {
          reportId: state.currentReport.id,
          format: 'PDF',
          version: 'v2-puppeteer'
        });
      }
    })
    .catch(function(error) {
      console.error('[ReportEditorV2] PDF export error:', error);

      // Close modal on error
      if (ERM.components && ERM.components.closeModal) {
        ERM.components.closeModal();
      }

      if (ERM.toast) {
        ERM.toast.show({
          type: 'error',
          message: 'Failed to export PDF: ' + error.message
        });
      }
    });
  }

  /**
   * Duplicate the current report
   */
  function duplicateReport() {
    // Sync content from DOM
    syncContentFromDOM();

    // Create a copy with new ID
    var newReport = {
      id: 'report_' + Date.now(),
      title: state.currentReport.title + ' (Copy)',
      format: 'v2',
      content: JSON.parse(JSON.stringify(state.currentReport.content)), // Deep clone
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: ERM.state.user ? ERM.state.user.name : 'Unknown'
    };

    // Save to storage
    var reports = ERM.storage.get('reports') || [];
    reports.push(newReport);
    ERM.storage.set('reports', reports);

    // Also add to recentReports
    var recentReports = ERM.storage.get('recentReports') || [];
    recentReports.unshift({
      id: newReport.id,
      name: newReport.title,
      title: newReport.title,
      type: 'custom',
      format: 'v2',
      createdAt: newReport.createdAt,
      updatedAt: newReport.updatedAt,
      author: newReport.author,
      status: 'draft',
      content: newReport.content
    });
    ERM.storage.set('recentReports', recentReports);

    if (ERM.toast) {
      ERM.toast.success('Report duplicated');
    }

    // Open the duplicated report
    state.currentReport = newReport;
    var titleInput = document.getElementById('editor-title');
    if (titleInput) {
      titleInput.value = newReport.title;
    }
    markDirty();
  }

  /**
   * Show delete confirmation dialog
   */
  function confirmDeleteReport() {
    // Create confirmation modal
    var modal = document.createElement('div');
    modal.id = 'delete-confirm-modal';
    modal.className = 'editor-modal-overlay';
    modal.innerHTML =
      '<div class="editor-modal">' +
      '  <div class="editor-modal-header">' +
      '    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">' +
      '      <circle cx="12" cy="12" r="10"/>' +
      '      <line x1="12" y1="8" x2="12" y2="12"/>' +
      '      <line x1="12" y1="16" x2="12.01" y2="16"/>' +
      '    </svg>' +
      '    <h3>Delete Report?</h3>' +
      '  </div>' +
      '  <div class="editor-modal-body">' +
      '    <p>Are you sure you want to delete "<strong>' + escapeHtml(state.currentReport.title) + '</strong>"? This action cannot be undone.</p>' +
      '  </div>' +
      '  <div class="editor-modal-footer">' +
      '    <button class="editor-modal-btn editor-modal-btn-secondary" id="delete-cancel">Cancel</button>' +
      '    <button class="editor-modal-btn editor-modal-btn-danger" id="delete-confirm">Delete</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(modal);

    // Animate in
    setTimeout(function() {
      modal.classList.add('visible');
    }, 10);

    // Cancel button
    document.getElementById('delete-cancel').addEventListener('click', function() {
      modal.classList.remove('visible');
      setTimeout(function() {
        modal.remove();
      }, 200);
    });

    // Delete button
    document.getElementById('delete-confirm').addEventListener('click', function() {
      deleteReport();
      modal.classList.remove('visible');
      setTimeout(function() {
        modal.remove();
      }, 200);
    });

    // Click outside to close
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.classList.remove('visible');
        setTimeout(function() {
          modal.remove();
        }, 200);
      }
    });
  }

  /**
   * Delete the current report
   */
  function deleteReport() {
    var reportId = state.currentReport.id;

    // Remove from reports storage
    var reports = ERM.storage.get('reports') || [];
    reports = reports.filter(function(r) { return r.id !== reportId; });
    ERM.storage.set('reports', reports);

    // Remove from recentReports
    var recentReports = ERM.storage.get('recentReports') || [];
    recentReports = recentReports.filter(function(r) { return r.id !== reportId; });
    ERM.storage.set('recentReports', recentReports);

    if (ERM.toast) {
      ERM.toast.success('Report deleted');
    }

    // Close editor and go back to reports list
    closeEditor();
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Sanitize HTML - allow safe formatting and structure tags
   * Allows formatting, lists, tables, headings, and AI-generated content
   * Blocks: script, iframe, event handlers, javascript: URLs
   */
  function sanitizeHtml(html) {
    if (!html) return '';

    // If it looks like plain text (no tags), return as-is
    if (html.indexOf('<') === -1) return html;

    // Create a temporary element to parse the HTML
    var temp = document.createElement('div');
    temp.innerHTML = html;

    // Walk through and clean nodes
    function cleanNode(node) {
      var children = Array.prototype.slice.call(node.childNodes);
      for (var i = 0; i < children.length; i++) {
        var child = children[i];
        if (child.nodeType === Node.ELEMENT_NODE) {
          var tagName = child.tagName.toLowerCase();
          // Allow safe formatting and structure tags (including AI-generated content)
          var allowedTags = [
            // Basic formatting
            'b', 'i', 'u', 'strong', 'em', 'span', 'br',
            // AI content wrapper and divs
            'div', 'p',
            // Lists
            'ul', 'ol', 'li',
            // Tables (AI can generate tables)
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            // Headings
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            // Other safe tags
            'blockquote', 'hr', 'a'
          ];
          if (allowedTags.indexOf(tagName) === -1) {
            // Replace with text content
            var textNode = document.createTextNode(child.textContent);
            node.replaceChild(textNode, child);
          } else {
            // Remove dangerous attributes but keep safe ones
            var attrs = Array.prototype.slice.call(child.attributes);
            var safeAttrs = ['class', 'style', 'href', 'title'];
            for (var j = 0; j < attrs.length; j++) {
              var attrName = attrs[j].name.toLowerCase();
              // Block event handlers and javascript: URLs
              if (attrName.indexOf('on') === 0) {
                child.removeAttribute(attrs[j].name);
              } else if (attrName === 'href') {
                var href = attrs[j].value.toLowerCase().trim();
                if (href.indexOf('javascript:') === 0) {
                  child.removeAttribute('href');
                }
              } else if (safeAttrs.indexOf(attrName) === -1) {
                child.removeAttribute(attrs[j].name);
              }
            }
            // Recursively clean children
            cleanNode(child);
          }
        }
      }
    }

    cleanNode(temp);
    return temp.innerHTML;
  }

  // ========================================
  // @MENTION DROPDOWN FUNCTIONS
  // ========================================

  /**
   * Get team members for @mention dropdown
   */
  function getTeamMembers() {
    // Get workspace members
    var workspaceMembers = ERM.storage.get('workspaceMembers') || [];

    // Add current user if exists
    var currentUser = ERM.state && ERM.state.user ? ERM.state.user : null;
    var members = [];

    if (currentUser) {
      members.push({
        id: currentUser.id || 'user_1',
        name: currentUser.name || 'You',
        email: currentUser.email || '',
        color: '#3b82f6'
      });
    }

    // Add workspace members
    for (var i = 0; i < workspaceMembers.length; i++) {
      var member = workspaceMembers[i];
      // Avoid duplicates
      var isDuplicate = false;
      for (var j = 0; j < members.length; j++) {
        if (members[j].id === member.id) {
          isDuplicate = true;
          break;
        }
      }
      if (!isDuplicate) {
        members.push(member);
      }
    }

    // If no members, add some defaults for demo
    if (members.length === 0) {
      members = [
        { id: 'user_1', name: 'John Doe', email: 'john@example.com', color: '#3b82f6' },
        { id: 'user_2', name: 'Jane Smith', email: 'jane@example.com', color: '#10b981' },
        { id: 'user_3', name: 'Mike Johnson', email: 'mike@example.com', color: '#f59e0b' }
      ];
    }

    return members;
  }

  /**
   * Get initials from name
   */
  function getInitials(name) {
    if (!name) return 'U';
    var parts = name.trim().split(' ').filter(function(p) { return p.length > 0; });
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  /**
   * Close editor and return to reports
   */
  function closeEditor() {
    if (ERM.reports && ERM.reports.closeEditorV2) {
      ERM.reports.closeEditorV2();
    } else if (ERM.reports && ERM.reports.showList) {
      ERM.reports.showList();
    } else {
      window.location.hash = '#/reports';
    }
  }

  /**
   * Show unsaved changes modal
   */
  function showUnsavedChangesModal() {
    var modal = document.createElement('div');
    modal.id = 'unsaved-changes-modal';
    modal.className = 'unsaved-modal';
    modal.innerHTML =
      '<div class="unsaved-modal-backdrop"></div>' +
      '<div class="unsaved-modal-content">' +
      '  <div class="unsaved-modal-icon">' +
      '    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5">' +
      '      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
      '      <line x1="12" y1="9" x2="12" y2="13"/>' +
      '      <line x1="12" y1="17" x2="12.01" y2="17"/>' +
      '    </svg>' +
      '  </div>' +
      '  <h3 class="unsaved-modal-title">Unsaved Changes</h3>' +
      '  <p class="unsaved-modal-text">You have unsaved changes. What would you like to do?</p>' +
      '  <div class="unsaved-modal-actions">' +
      '    <button class="unsaved-btn unsaved-btn-discard" id="unsaved-discard">Discard Changes</button>' +
      '    <button class="unsaved-btn unsaved-btn-cancel" id="unsaved-cancel">Keep Editing</button>' +
      '    <button class="unsaved-btn unsaved-btn-save" id="unsaved-save">Save & Exit</button>' +
      '  </div>' +
      '</div>';

    document.body.appendChild(modal);

    // Animate in
    setTimeout(function() {
      modal.classList.add('visible');
    }, 10);

    // Bind events
    modal.querySelector('.unsaved-modal-backdrop').addEventListener('click', function() {
      closeUnsavedModal();
    });

    modal.querySelector('#unsaved-cancel').addEventListener('click', function() {
      closeUnsavedModal();
    });

    modal.querySelector('#unsaved-discard').addEventListener('click', function() {
      closeUnsavedModal();
      state.isDirty = false;
      closeEditor();
    });

    modal.querySelector('#unsaved-save').addEventListener('click', function() {
      saveReport();
      closeUnsavedModal();
      closeEditor();
    });
  }

  /**
   * Close unsaved changes modal
   */
  function closeUnsavedModal() {
    var modal = document.getElementById('unsaved-changes-modal');
    if (modal) {
      modal.classList.remove('visible');
      setTimeout(function() {
        modal.remove();
      }, 200);
    }
  }

  /**
   * Show mention dropdown
   */
  function showMentionDropdown(filter) {
    filter = (filter || '').toLowerCase();
    var members = getTeamMembers();

    // Filter members
    var filteredMembers = members.filter(function(m) {
      return m.name.toLowerCase().indexOf(filter) !== -1 ||
             (m.email && m.email.toLowerCase().indexOf(filter) !== -1);
    });

    var dropdown = document.getElementById('mention-dropdown');
    var items = document.getElementById('mention-dropdown-items');

    if (filteredMembers.length === 0) {
      items.innerHTML = '<div class="mention-empty">No team members found</div>';
    } else {
      var html = '';
      for (var i = 0; i < filteredMembers.length; i++) {
        var m = filteredMembers[i];
        var initials = getInitials(m.name);
        html += '<div class="mention-item" data-member-id="' + m.id + '" data-member-name="' + escapeHtml(m.name) + '">';
        html += '  <div class="mention-avatar" style="background-color: ' + (m.color || '#6366f1') + '">' + initials + '</div>';
        html += '  <div class="mention-info">';
        html += '    <div class="mention-name">' + escapeHtml(m.name) + '</div>';
        if (m.email) {
          html += '    <div class="mention-email">' + escapeHtml(m.email) + '</div>';
        }
        html += '  </div>';
        html += '</div>';
      }
      items.innerHTML = html;
    }

    // Position dropdown below comment input
    var commentInput = document.getElementById('inline-comment-input');
    if (commentInput) {
      var rect = commentInput.getBoundingClientRect();
      dropdown.style.top = (rect.bottom + 4) + 'px';
      dropdown.style.left = rect.left + 'px';
      dropdown.style.width = rect.width + 'px';
    }

    dropdown.classList.add('visible');
    state.mentionDropdownVisible = true;
  }

  /**
   * Hide mention dropdown
   */
  function hideMentionDropdown() {
    var dropdown = document.getElementById('mention-dropdown');
    dropdown.classList.remove('visible');
    state.mentionDropdownVisible = false;
    state.mentionFilter = '';
  }

  /**
   * Insert mention into comment
   */
  function insertMention(memberName) {
    var input = document.getElementById('inline-comment-input');
    if (!input) return;

    var text = input.value;
    var cursorPos = input.selectionStart;

    // Find the @ that triggered this
    var beforeCursor = text.substring(0, cursorPos);
    var atIndex = beforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      // Replace @filter with @name
      var before = text.substring(0, atIndex);
      var after = text.substring(cursorPos);
      input.value = before + '@' + memberName + ' ' + after;

      // Move cursor after the mention
      var newPos = atIndex + memberName.length + 2;
      input.setSelectionRange(newPos, newPos);
    }

    hideMentionDropdown();
    input.focus();
  }

  /**
   * Handle comment input for @mentions
   */
  function handleCommentInput(e) {
    var input = e.target;
    var text = input.value;
    var cursorPos = input.selectionStart;

    // Check if typing after @
    var beforeCursor = text.substring(0, cursorPos);
    var atIndex = beforeCursor.lastIndexOf('@');

    if (atIndex !== -1) {
      // Check if there's a space between @ and cursor
      var afterAt = beforeCursor.substring(atIndex + 1);
      if (afterAt.indexOf(' ') === -1 && afterAt.indexOf('\n') === -1) {
        // Show dropdown with filter
        state.mentionFilter = afterAt;
        showMentionDropdown(afterAt);
        return;
      }
    }

    hideMentionDropdown();
  }

  /**
   * Navigate mention dropdown with arrow keys
   */
  function navigateMentionDropdown(direction) {
    var items = document.querySelectorAll('#mention-dropdown-items .mention-item');
    var current = document.querySelector('#mention-dropdown-items .mention-item.selected');

    var index = -1;
    if (current) {
      for (var i = 0; i < items.length; i++) {
        if (items[i] === current) {
          index = i;
          break;
        }
      }
      current.classList.remove('selected');
    }

    index += direction;
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;

    if (items[index]) {
      items[index].classList.add('selected');
      items[index].scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * Select current mention item
   */
  function selectCurrentMention() {
    var selected = document.querySelector('#mention-dropdown-items .mention-item.selected');
    if (selected) {
      var name = selected.getAttribute('data-member-name');
      insertMention(name);
    } else {
      var first = document.querySelector('#mention-dropdown-items .mention-item');
      if (first) {
        var name = first.getAttribute('data-member-name');
        insertMention(name);
      }
    }
  }

  // ========================================
  // FLOATING TOOLBAR IMPLEMENTATION
  // ========================================

  /**
   * Show floating toolbar above selection
   * CRITICAL: Never show during block selection mode
   */
  function showFloatingToolbar(selection) {
    console.log('[V2] showFloatingToolbar called with selection:', selection);

    // CRITICAL: Never show toolbar during block selection mode
    if (state.blockSelectionMode) {
      console.log('[V2] showFloatingToolbar: BLOCKED - in block selection mode');
      return;
    }

    // Don't show during block dragging
    if (state.isBlockDragging) {
      console.log('[V2] showFloatingToolbar: BLOCKED - block drag in progress');
      return;
    }

    if (!selection || selection.rangeCount === 0) {
      console.log('[V2] showFloatingToolbar: No valid selection');
      return;
    }

    var toolbar = document.getElementById('report-floating-toolbar');

    if (!toolbar) {
      console.log('[V2] Creating floating toolbar');
      toolbar = createFloatingToolbar();
      document.body.appendChild(toolbar);
    }

    // Position toolbar above selection (using fixed positioning)
    var range = selection.getRangeAt(0);
    var rect = range.getBoundingClientRect();
    console.log('[V2] Selection rect:', rect);

    var toolbarWidth = 400;
    var left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    var top = rect.top - 50;

    // Ensure toolbar stays in viewport
    if (left < 10) left = 10;
    if (left + toolbarWidth > window.innerWidth - 10) {
      left = window.innerWidth - toolbarWidth - 10;
    }

    // Flip below if too close to top
    if (top < 10) {
      top = rect.bottom + 10;
      toolbar.classList.add('toolbar-below');
    } else {
      toolbar.classList.remove('toolbar-below');
    }

    toolbar.style.left = left + 'px';
    toolbar.style.top = top + 'px';
    toolbar.classList.add('visible');
    state.selectionPillsVisible = true;

    // Store the range for later use
    state.currentRange = range;

    console.log('[V2] Showing floating toolbar at', left, top);
  }

  /**
   * Hide floating toolbar
   * @param {boolean} keepHighlight - If true, preserve selection highlight
   */
  function hideFloatingToolbar(keepHighlight) {
    var toolbar = document.getElementById('report-floating-toolbar');
    if (toolbar) {
      toolbar.classList.remove('visible');
    }

    // Also hide all related dropdowns
    hideMoreDropdown();
    hideAIActionsDropdown(keepHighlight);
    hideCommentComposer();
  }

  /**
   * Reposition toolbar (for scroll events)
   */
  function repositionToolbar() {
    if (!state.currentRange) return;

    var toolbar = document.getElementById('report-floating-toolbar');
    if (!toolbar) return;

    var rect = state.currentRange.getBoundingClientRect();
    var toolbarWidth = 400;
    var left = rect.left + (rect.width / 2) - (toolbarWidth / 2);
    var top = rect.top - 50;

    if (left < 10) left = 10;
    if (left + toolbarWidth > window.innerWidth - 10) {
      left = window.innerWidth - toolbarWidth - 10;
    }

    if (top < 10) {
      top = rect.bottom + 10;
    }

    toolbar.style.left = left + 'px';
    toolbar.style.top = top + 'px';
  }

  /**
   * Create floating toolbar HTML
   */
  function createFloatingToolbar() {
    var toolbar = document.createElement('div');
    toolbar.id = 'report-floating-toolbar';
    toolbar.className = 'report-floating-toolbar';

    // Enhanced toolbar with Bold, Underline, Strikethrough + existing buttons
    toolbar.innerHTML =
      '<button class="toolbar-btn" id="toolbar-bold" title="Bold (Ctrl+B)">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">' +
      '<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/>' +
      '</svg>' +
      '</button>' +
      '<button class="toolbar-btn" id="toolbar-underline" title="Underline (Ctrl+U)">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/>' +
      '</svg>' +
      '</button>' +
      '<button class="toolbar-btn" id="toolbar-strikethrough" title="Strikethrough">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '<path d="M17.5 5h-11M17.5 19h-11M4 12h16"/>' +
      '</svg>' +
      '</button>' +
      '<div class="toolbar-divider"></div>' +
      '<button class="toolbar-btn toolbar-btn-primary" id="toolbar-ask-ai" title="Ask AI">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z"/></svg>' +
      '<span>Ask AI</span>' +
      '</button>' +
      '<div class="toolbar-divider"></div>' +
      '<button class="toolbar-btn" id="toolbar-magic-write" title="AI Actions">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>' +
      '</button>' +
      '<div class="toolbar-divider"></div>' +
      '<button class="toolbar-btn" id="toolbar-turninto" title="Turn Into">' +
      '<span>Turn into</span>' +
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>' +
      '</button>' +
      '<div class="toolbar-divider"></div>' +
      '<button class="toolbar-btn" id="toolbar-comment" title="Add Comment">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '</button>' +
      '<button class="toolbar-btn" id="toolbar-more" title="More Options">' +
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>' +
      '</button>';

    // Bind toolbar button events
    var boldBtn = toolbar.querySelector('#toolbar-bold');
    var underlineBtn = toolbar.querySelector('#toolbar-underline');
    var strikethroughBtn = toolbar.querySelector('#toolbar-strikethrough');
    var askAiBtn = toolbar.querySelector('#toolbar-ask-ai');
    var magicWriteBtn = toolbar.querySelector('#toolbar-magic-write');
    var turnIntoBtn = toolbar.querySelector('#toolbar-turninto');
    var commentBtn = toolbar.querySelector('#toolbar-comment');
    var moreBtn = toolbar.querySelector('#toolbar-more');

    // CRITICAL: Prevent mousedown from clearing the text selection
    // Without this, clicking toolbar buttons loses the selection before we can capture it
    toolbar.addEventListener('mousedown', function(e) {
      e.preventDefault();
    });

    boldBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      document.execCommand('bold', false, null);
      markDirty(true); // Immediate save for formatting
    });

    underlineBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      document.execCommand('underline', false, null);
      markDirty(true); // Immediate save for formatting
    });

    strikethroughBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      document.execCommand('strikeThrough', false, null);
      markDirty(true); // Immediate save for formatting
    });

    askAiBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[V2] Ask AI clicked');

      // Check AI call limit before proceeding
      if (ERM.aiCounter) {
        var canCall = ERM.aiCounter.canMakeCall();
        if (!canCall.allowed) {
          // Show limit modal
          ERM.aiCounter.showLimitModal();
          return;
        }
      }

      hideAIActionsDropdown();
      hideMoreDropdown();
      hideCommentComposer();

      // Check if we're in BLOCK SELECTION mode (checkbox multi-select)
      if (state.blockSelectionMode && state.selectedBlocks.length > 0) {
        console.log('[V2] Ask AI: Block selection mode with', state.selectedBlocks.length, 'blocks');
        // Pass block selection to AI module
        var blockText = getSelectedBlocksText();
        ERM.reportEditorAI.setState('selection', blockText);
        ERM.reportEditorAI.setState('selectedBlocks', state.selectedBlocks.slice()); // Copy array
        ERM.reportEditorAI.setState('selectionRange', null); // No text range in block mode
        ERM.reportEditorAI.setState('activeBlock', state.activeBlock);
      }
      // Otherwise use text selection
      else if (state.currentRange) {
        // CAPTURE SELECTION LOCK before focus changes
        // This creates persistent highlight that survives focus loss
        captureSelectionLock();

        var selectedText = state.currentRange.toString();
        ERM.reportEditorAI.setState('selection', selectedText);
        ERM.reportEditorAI.setState('selectionRange', state.currentRange.cloneRange());
        ERM.reportEditorAI.setState('selectedBlocks', []); // Clear block selection

        // Also apply the old highlight system for compatibility
        ERM.reportEditorAI.highlightSelection();
      }

      // Use shared Ask AI panel
      if (ERM.reportEditorAI && ERM.reportEditorAI.showAskAIPanel) {
        ERM.reportEditorAI.showAskAIPanel();
      } else {
        // Fallback to custom modal
        showAIPrompt();
      }
    });

    magicWriteBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[V2] Magic Write clicked');
      hideMoreDropdown();
      hideCommentComposer();

      // Check if we're in BLOCK SELECTION mode (checkbox multi-select)
      if (state.blockSelectionMode && state.selectedBlocks.length > 0) {
        console.log('[V2] Magic Write: Block selection mode with', state.selectedBlocks.length, 'blocks');
        var blockText = getSelectedBlocksText();
        ERM.reportEditorAI.setState('selection', blockText);
        ERM.reportEditorAI.setState('selectedBlocks', state.selectedBlocks.slice());
        ERM.reportEditorAI.setState('selectionRange', null);
        ERM.reportEditorAI.setState('activeBlock', state.activeBlock);
      }
      // Otherwise use text selection
      else if (state.currentRange) {
        // CAPTURE SELECTION LOCK before focus changes
        captureSelectionLock();

        var selectedText = state.currentRange.toString();
        ERM.reportEditorAI.setState('selection', selectedText);
        ERM.reportEditorAI.setState('selectionRange', state.currentRange.cloneRange());
        ERM.reportEditorAI.setState('selectedBlocks', []);

        // Also apply the old highlight system for compatibility
        ERM.reportEditorAI.highlightSelection();
      }

      toggleAIActionsDropdown(magicWriteBtn);
    });

    turnIntoBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[V2] Turn Into clicked');
      showTurnIntoDropdown(turnIntoBtn);
    });

    commentBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[V2] Comment clicked');
      hideAIActionsDropdown();
      hideMoreDropdown();
      toggleCommentComposer();
    });

    moreBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[V2] More clicked');
      hideAIActionsDropdown();
      hideCommentComposer();
      toggleMoreDropdown(moreBtn);
    });

    return toolbar;
  }

  // ========================================
  // MORE OPTIONS DROPDOWN
  // ========================================

  function toggleMoreDropdown(anchorEl) {
    var dropdown = document.getElementById('more-options-dropdown');

    if (dropdown && dropdown.classList.contains('visible')) {
      hideMoreDropdown();
      return;
    }

    showMoreDropdown(anchorEl);
  }

  function showMoreDropdown(anchorEl) {
    console.log('[V2] showMoreDropdown called');

    hideAIActionsDropdown();

    var dropdown = document.getElementById('more-options-dropdown');

    if (!dropdown) {
      console.log('[V2] Creating More dropdown');
      dropdown = createMoreDropdown();
      document.body.appendChild(dropdown);
    }

    // Position relative to anchor (using fixed positioning)
    var rect = anchorEl.getBoundingClientRect();
    var dropdownWidth = 180;
    var dropdownHeight = 160;
    var gap = 8;
    var left = rect.left;

    // Check if dropdown would go below viewport
    var spaceBelow = window.innerHeight - rect.bottom - gap;
    var spaceAbove = rect.top - gap;
    var openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    var top;
    if (openAbove) {
      top = rect.top - dropdownHeight - gap;
      dropdown.classList.add('dropdown-above');
      dropdown.classList.remove('dropdown-below');
    } else {
      top = rect.bottom + gap;
      dropdown.classList.add('dropdown-below');
      dropdown.classList.remove('dropdown-above');
    }

    // Ensure dropdown stays in viewport horizontally
    if (left + dropdownWidth > window.innerWidth - 10) {
      left = window.innerWidth - dropdownWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }

    dropdown.style.left = left + 'px';
    dropdown.style.top = top + 'px';
    dropdown.classList.add('visible');
  }

  function hideMoreDropdown() {
    var dropdown = document.getElementById('more-options-dropdown');
    if (dropdown) {
      dropdown.classList.remove('visible');
    }
  }

  function createMoreDropdown() {
    var dropdown = document.createElement('div');
    dropdown.id = 'more-options-dropdown';
    dropdown.className = 'more-options-dropdown';

    dropdown.innerHTML =
      '<div class="more-dropdown-item" data-action="copy">' +
      '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>' +
      '    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>' +
      '  </svg>' +
      '  <span>Copy</span>' +
      '</div>' +
      '<div class="more-dropdown-item" data-action="cut">' +
      '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '    <circle cx="6" cy="6" r="3"/>' +
      '    <circle cx="6" cy="18" r="3"/>' +
      '    <line x1="20" y1="4" x2="8.12" y2="15.88"/>' +
      '    <line x1="14.47" y1="14.48" x2="20" y2="20"/>' +
      '    <line x1="8.12" y1="8.12" x2="12" y2="12"/>' +
      '  </svg>' +
      '  <span>Cut</span>' +
      '</div>' +
      '<div class="more-dropdown-divider"></div>' +
      '<div class="more-dropdown-item" data-action="duplicate">' +
      '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '    <rect x="3" y="3" width="14" height="14" rx="2" ry="2"/>' +
      '    <path d="M7 21h12a2 2 0 0 0 2-2V7"/>' +
      '  </svg>' +
      '  <span>Duplicate</span>' +
      '</div>' +
      '<div class="more-dropdown-item more-dropdown-item-danger" data-action="delete">' +
      '  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '    <polyline points="3 6 5 6 21 6"/>' +
      '    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>' +
      '  </svg>' +
      '  <span>Delete</span>' +
      '</div>';

    // Bind click events for dropdown items
    dropdown.querySelectorAll('.more-dropdown-item').forEach(function(item) {
      item.addEventListener('click', function(e) {
        e.stopPropagation();
        var action = this.getAttribute('data-action');
        handleMoreAction(action);
        hideMoreDropdown();
        hideFloatingToolbar();
      });
    });

    return dropdown;
  }

  function handleMoreAction(action) {
    var selection = state.currentSelection;

    switch (action) {
      case 'copy':
        if (selection) {
          navigator.clipboard.writeText(selection).then(function() {
            if (window.ERM && ERM.toast) {
              ERM.toast.success('Copied to clipboard');
            }
          }).catch(function() {
            document.execCommand('copy');
            if (window.ERM && ERM.toast) {
              ERM.toast.success('Copied to clipboard');
            }
          });
        }
        break;

      case 'cut':
        if (selection && state.currentRange) {
          navigator.clipboard.writeText(selection).then(function() {
            var range = state.currentRange;
            range.deleteContents();
            if (window.ERM && ERM.toast) {
              ERM.toast.success('Cut to clipboard');
            }
            markDirty();
          }).catch(function() {
            document.execCommand('cut');
            if (window.ERM && ERM.toast) {
              ERM.toast.success('Cut to clipboard');
            }
            markDirty();
          });
        }
        break;

      case 'duplicate':
        duplicateActiveBlock();
        break;

      case 'delete':
        deleteSelection();
        break;
    }
  }

  function duplicateActiveBlock() {
    if (state.activeBlock) {
      var clone = state.activeBlock.cloneNode(true);
      state.activeBlock.parentNode.insertBefore(clone, state.activeBlock.nextSibling);
      if (window.ERM && ERM.toast) {
        ERM.toast.success('Block duplicated');
      }
      markDirty();
    }
  }

  function deleteSelection() {
    if (state.activeBlock && state.currentRange) {
      state.currentRange.deleteContents();
      if (window.ERM && ERM.toast) {
        ERM.toast.success('Selection deleted');
      }
      markDirty();
    }
  }

  // ========================================
  // AI ACTIONS DROPDOWN
  // ========================================

  function toggleAIActionsDropdown(anchorEl) {
    console.log('[V2] toggleAIActionsDropdown called');
    var dropdown = document.getElementById('ai-actions-dropdown');

    if (dropdown && dropdown.classList.contains('visible')) {
      console.log('[V2] Hiding AI dropdown');
      hideAIActionsDropdown();
      return;
    }

    console.log('[V2] Showing AI dropdown');
    showAIActionsDropdown(anchorEl);
  }

  function showAIActionsDropdown(anchorEl) {
    console.log('[V2] showAIActionsDropdown called with anchor:', anchorEl);

    hideMoreDropdown();

    var dropdown = document.getElementById('ai-actions-dropdown');

    if (!dropdown) {
      console.log('[V2] Creating AI dropdown');
      dropdown = createAIActionsDropdown();
      document.body.appendChild(dropdown);
    }

    // Position relative to anchor (using fixed positioning)
    var rect = anchorEl.getBoundingClientRect();
    var left = rect.left;
    var dropdownWidth = 220;
    var dropdownHeight = 280;
    var gap = 8;

    // Check if dropdown would go below viewport
    var spaceBelow = window.innerHeight - rect.bottom - gap;
    var spaceAbove = rect.top - gap;
    var openAbove = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    var top;
    if (openAbove) {
      top = rect.top - dropdownHeight - gap;
      dropdown.classList.add('dropdown-above');
      dropdown.classList.remove('dropdown-below');
    } else {
      top = rect.bottom + gap;
      dropdown.classList.add('dropdown-below');
      dropdown.classList.remove('dropdown-above');
    }

    // Ensure dropdown stays in viewport horizontally
    if (left + dropdownWidth > window.innerWidth - 10) {
      left = window.innerWidth - dropdownWidth - 10;
    }
    if (left < 10) {
      left = 10;
    }

    dropdown.style.left = left + 'px';
    dropdown.style.top = top + 'px';
    dropdown.classList.add('visible');
    console.log('[V2] AI dropdown shown at', left, top, openAbove ? '(above)' : '(below)');
  }

  function hideAIActionsDropdown(keepHighlight) {
    var dropdown = document.getElementById('ai-actions-dropdown');
    if (dropdown) {
      dropdown.classList.remove('visible');
    }
    // Also hide transform submenu
    var submenu = document.getElementById('transform-submenu');
    if (submenu) {
      submenu.classList.remove('visible');
    }

    // Check if AI inline response panel is visible - if so, keep highlight
    var aiResponsePanel = document.getElementById('ai-inline-response');
    var aiResponseVisible = aiResponsePanel && aiResponsePanel.classList.contains('visible');

    // Check if Ask AI panel is visible
    var askAiPanel = document.getElementById('ask-ai-panel');
    var askAiVisible = askAiPanel && askAiPanel.classList.contains('visible');

    // Remove selection highlight when closing dropdown ONLY if:
    // - keepHighlight is false
    // - AI response panel is NOT visible
    // - Ask AI panel is NOT visible
    if (!keepHighlight && !aiResponseVisible && !askAiVisible && ERM.reportEditorAI && ERM.reportEditorAI.unhighlightSelection) {
      ERM.reportEditorAI.unhighlightSelection();
    }
  }

  function createAIActionsDropdown() {
    var dropdown = document.createElement('div');
    dropdown.id = 'ai-actions-dropdown';
    dropdown.className = 'ai-actions-dropdown';

    dropdown.innerHTML =
      '<div class="ai-dropdown-section">' +
      '  <div class="ai-dropdown-item has-submenu" id="ai-action-transform">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>' +
      '    </svg>' +
      '    <span>Transform text</span>' +
      '    <svg class="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <polyline points="9 18 15 12 9 6"/>' +
      '    </svg>' +
      '  </div>' +
      '  <div class="ai-dropdown-item" data-action="rewrite">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>' +
      '      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>' +
      '    </svg>' +
      '    <span>Rewrite</span>' +
      '  </div>' +
      '  <div class="ai-dropdown-item" data-action="expand">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <polyline points="15 3 21 3 21 9"/>' +
      '      <polyline points="9 21 3 21 3 15"/>' +
      '      <line x1="21" y1="3" x2="14" y2="10"/>' +
      '      <line x1="3" y1="21" x2="10" y2="14"/>' +
      '    </svg>' +
      '    <span>Expand</span>' +
      '  </div>' +
      '  <div class="ai-dropdown-item" data-action="shorten">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <polyline points="4 14 10 14 10 20"/>' +
      '      <polyline points="20 10 14 10 14 4"/>' +
      '      <line x1="14" y1="10" x2="21" y2="3"/>' +
      '      <line x1="3" y1="21" x2="10" y2="14"/>' +
      '    </svg>' +
      '    <span>Shorten</span>' +
      '  </div>' +
      '  <div class="ai-dropdown-item" data-action="fix-spelling">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <polyline points="20 6 9 17 4 12"/>' +
      '    </svg>' +
      '    <span>Fix spelling</span>' +
      '  </div>' +
      '  <div class="ai-dropdown-item" data-action="continue">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <line x1="5" y1="12" x2="19" y2="12"/>' +
      '      <polyline points="12 5 19 12 12 19"/>' +
      '    </svg>' +
      '    <span>Continue writing</span>' +
      '  </div>' +
      '</div>';

    // Create transform submenu
    var submenu = document.createElement('div');
    submenu.id = 'transform-submenu';
    submenu.className = 'ai-transform-submenu';
    submenu.innerHTML =
      '<div class="ai-dropdown-item" data-action="transform-formal">' +
      '  <span>More formal</span>' +
      '</div>' +
      '<div class="ai-dropdown-item" data-action="transform-concise">' +
      '  <span>More concise</span>' +
      '</div>' +
      '<div class="ai-dropdown-item" data-action="transform-board">' +
      '  <span>Board-level tone</span>' +
      '</div>' +
      '<div class="ai-dropdown-item" data-action="transform-audit">' +
      '  <span>Audit Committee tone</span>' +
      '</div>' +
      '<div class="ai-dropdown-item" data-action="transform-management">' +
      '  <span>Management tone</span>' +
      '</div>' +
      '<div class="ai-dropdown-item" data-action="transform-plain">' +
      '  <span>Plain language</span>' +
      '</div>';

    document.body.appendChild(submenu);

    // CRITICAL: Prevent mousedown from clearing the text selection
    dropdown.addEventListener('mousedown', function(e) {
      e.preventDefault();
    });
    submenu.addEventListener('mousedown', function(e) {
      e.preventDefault();
    });

    // Bind events
    var transformItem = dropdown.querySelector('#ai-action-transform');
    transformItem.addEventListener('mouseenter', function() {
      var rect = this.getBoundingClientRect();
      submenu.style.left = (rect.right + 4) + 'px';
      submenu.style.top = rect.top + 'px';
      submenu.classList.add('visible');
    });

    dropdown.addEventListener('mouseleave', function(e) {
      if (!submenu.contains(e.relatedTarget)) {
        submenu.classList.remove('visible');
      }
    });

    submenu.addEventListener('mouseleave', function(e) {
      if (!dropdown.contains(e.relatedTarget)) {
        submenu.classList.remove('visible');
      }
    });

    // Bind action clicks
    var actionItems = dropdown.querySelectorAll('.ai-dropdown-item[data-action]');
    for (var i = 0; i < actionItems.length; i++) {
      actionItems[i].addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent document click handler from firing
        var action = this.getAttribute('data-action');
        executeAIActionV2(action);
        hideFloatingToolbar(true); // Keep highlight while action is processing
      });
    }

    var submenuItems = submenu.querySelectorAll('.ai-dropdown-item[data-action]');
    for (var j = 0; j < submenuItems.length; j++) {
      submenuItems[j].addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent document click handler from firing
        var action = this.getAttribute('data-action');
        executeAIActionV2(action);
        hideFloatingToolbar(true); // Keep highlight while action is processing
      });
    }

    return dropdown;
  }

  /**
   * Execute AI action on selected text
   */
  function executeAIActionV2(action) {
    if (!state.currentSelection) {
      if (window.ERM && ERM.toast) {
        ERM.toast.error('Please select some text first');
      }
      return;
    }

    console.log('[V2] Executing AI action:', action, 'on text:', state.currentSelection);

    // Map action to AI prompt
    var actionLabels = {
      'rewrite': 'Rewriting',
      'expand': 'Expanding',
      'shorten': 'Shortening',
      'fix-spelling': 'Fixing spelling',
      'continue': 'Continuing',
      'transform-formal': 'Making formal',
      'transform-concise': 'Making concise',
      'transform-board': 'Adapting for Board',
      'transform-audit': 'Adapting for Audit',
      'transform-management': 'Adapting for Management',
      'transform-plain': 'Simplifying'
    };

    var loadingText = actionLabels[action] || 'Processing';

    // Use existing AI action handler if available
    if (action.indexOf('transform-') === 0) {
      var transformType = action.replace('transform-', '');
      executeAIAction('transform-' + transformType);
    } else {
      executeAIAction(action);
    }
  }

  // ========================================
  // COMMENT COMPOSER
  // ========================================

  function toggleCommentComposer() {
    var composer = document.getElementById('comment-composer');
    if (composer && composer.classList.contains('visible')) {
      hideCommentComposer();
    } else {
      showCommentComposer();
    }
  }

  function showCommentComposer() {
    if (!state.currentSelection || !state.activeBlock) {
      if (window.ERM && ERM.toast) {
        ERM.toast.error('Please select text to comment on');
      }
      return;
    }

    var composer = document.getElementById('comment-composer');

    if (!composer) {
      composer = createCommentComposer();
      document.body.appendChild(composer);
    }

    // Store selection context
    var blockId = state.activeBlock.getAttribute('data-block-id') || state.activeBlock.id || 'editor-block';
    composer.setAttribute('data-block-id', blockId);
    composer.setAttribute('data-selection-text', state.currentSelection);

    // Position relative to the toolbar
    var toolbar = document.getElementById('report-floating-toolbar');
    if (toolbar) {
      var toolbarRect = toolbar.getBoundingClientRect();
      var composerWidth = 280;
      var composerHeight = 200;
      var gap = 8;

      var left = toolbarRect.left;
      var top = toolbarRect.bottom + gap;

      // Check if composer would go below viewport
      var spaceBelow = window.innerHeight - toolbarRect.bottom - gap;
      var spaceAbove = toolbarRect.top - gap;
      var openAbove = spaceBelow < composerHeight && spaceAbove > spaceBelow;

      if (openAbove) {
        top = toolbarRect.top - composerHeight - gap;
        composer.classList.add('dropdown-above');
        composer.classList.remove('dropdown-below');
      } else {
        composer.classList.add('dropdown-below');
        composer.classList.remove('dropdown-above');
      }

      // Ensure composer stays in viewport horizontally
      if (left + composerWidth > window.innerWidth - 10) {
        left = window.innerWidth - composerWidth - 10;
      }
      if (left < 10) {
        left = 10;
      }

      composer.style.left = left + 'px';
      composer.style.top = top + 'px';
    }

    composer.classList.add('visible');
    composer.querySelector('textarea').focus();
  }

  function hideCommentComposer() {
    var composer = document.getElementById('comment-composer');
    if (composer) {
      composer.classList.remove('visible');
      composer.querySelector('textarea').value = '';
    }
  }

  function createCommentComposer() {
    var composer = document.createElement('div');
    composer.id = 'comment-composer';
    composer.className = 'comment-composer';

    composer.innerHTML =
      '<div class="comment-composer-header">' +
      '  <span>Add Comment</span>' +
      '  <button class="comment-composer-close" id="comment-composer-close">' +
      '    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
      '      <line x1="18" y1="6" x2="6" y2="18"/>' +
      '      <line x1="6" y1="6" x2="18" y2="18"/>' +
      '    </svg>' +
      '  </button>' +
      '</div>' +
      '<div class="comment-selection-preview"></div>' +
      '<textarea placeholder="Leave a comment..." rows="3"></textarea>' +
      '<div class="comment-composer-actions">' +
      '  <button class="btn btn-ghost btn-sm" id="comment-cancel">Cancel</button>' +
      '  <button class="btn btn-primary btn-sm" id="comment-post">Post</button>' +
      '</div>';

    // Bind events
    composer.querySelector('#comment-composer-close').addEventListener('click', function() {
      hideCommentComposer();
    });

    composer.querySelector('#comment-cancel').addEventListener('click', function() {
      hideCommentComposer();
    });

    composer.querySelector('#comment-post').addEventListener('click', function() {
      postComment(composer);
    });

    return composer;
  }

  function postComment(composer) {
    var text = composer.querySelector('textarea').value.trim();
    if (!text) {
      if (window.ERM && ERM.toast) {
        ERM.toast.error('Please enter a comment');
      }
      return;
    }

    var blockId = composer.getAttribute('data-block-id');
    var selectionText = composer.getAttribute('data-selection-text');

    var comment = {
      id: 'comment_' + Date.now(),
      blockId: blockId,
      selectionText: selectionText,
      text: text,
      author: (window.ERM && ERM.state && ERM.state.user) ? ERM.state.user.name : 'User',
      createdAt: new Date().toISOString(),
      status: 'open',
      replies: []
    };

    // Store in state (you may want to add a comments array to state)
    if (!state.comments) {
      state.comments = [];
    }
    state.comments.push(comment);

    hideCommentComposer();
    hideFloatingToolbar();

    if (window.ERM && ERM.toast) {
      ERM.toast.success('Comment added');
    }

    markDirty();

    console.log('[V2] Comment posted:', comment);
  }

  // ========================================
  // UNDO/REDO FUNCTIONALITY
  // ========================================

  /**
   * Capture current document state for undo/redo
   */
  function saveState() {
    // Don't save state during undo/redo operations
    if (state.isUndoing) {
      return;
    }

    // Capture current state
    var snapshot = {
      blocks: JSON.parse(JSON.stringify(state.currentReport.content)),
      timestamp: Date.now()
    };

    // Add to undo stack
    state.undoStack.push(snapshot);

    // Limit stack size to prevent memory issues
    if (state.undoStack.length > 50) {
      state.undoStack.shift();
    }

    // Clear redo stack when new change is made
    state.redoStack = [];

    console.log('[V2] State saved, undo stack size:', state.undoStack.length);
  }

  /**
   * Undo last change
   */
  function undo() {
    // Flush any pending debounced state save before undoing
    if (state.saveStateTimeout) {
      clearTimeout(state.saveStateTimeout);
      state.saveStateTimeout = null;
      // Save the pending state now
      updateContentFromDOM();
      saveState();
    }

    if (state.undoStack.length === 0) {
      console.log('[V2] Nothing to undo');
      if (window.ERM && ERM.toast) {
        ERM.toast.info('Nothing to undo');
      }
      return;
    }

    // Set flag to prevent saveState during restore
    state.isUndoing = true;

    // Save current state to redo stack first
    updateContentFromDOM();
    var currentSnapshot = {
      blocks: JSON.parse(JSON.stringify(state.currentReport.content)),
      timestamp: Date.now()
    };
    state.redoStack.push(currentSnapshot);

    // Get previous state
    var previousSnapshot = state.undoStack.pop();

    // Restore previous state
    state.currentReport.content = JSON.parse(JSON.stringify(previousSnapshot.blocks));

    // Re-render document
    renderDocument();

    state.isUndoing = false;

    // Mark as dirty (but not for undo stack)
    state.isDirty = true;
    updateStatus('Unsaved changes');

    console.log('[V2] Undo performed, undo stack size:', state.undoStack.length);

    if (window.ERM && ERM.toast) {
      ERM.toast.success('Undo');
    }
  }

  /**
   * Redo last undone change
   */
  function redo() {
    // Flush any pending debounced state save before redoing
    if (state.saveStateTimeout) {
      clearTimeout(state.saveStateTimeout);
      state.saveStateTimeout = null;
    }

    if (state.redoStack.length === 0) {
      console.log('[V2] Nothing to redo');
      if (window.ERM && ERM.toast) {
        ERM.toast.info('Nothing to redo');
      }
      return;
    }

    // Set flag to prevent saveState during restore
    state.isUndoing = true;

    // Save current state to undo stack
    updateContentFromDOM();
    var currentSnapshot = {
      blocks: JSON.parse(JSON.stringify(state.currentReport.content)),
      timestamp: Date.now()
    };
    state.undoStack.push(currentSnapshot);

    // Get next state
    var nextSnapshot = state.redoStack.pop();

    // Restore next state
    state.currentReport.content = JSON.parse(JSON.stringify(nextSnapshot.blocks));

    // Re-render document
    renderDocument();

    state.isUndoing = false;

    // Mark as dirty (but not for undo stack)
    state.isDirty = true;
    updateStatus('Unsaved changes');

    console.log('[V2] Redo performed, redo stack size:', state.redoStack.length);

    if (window.ERM && ERM.toast) {
      ERM.toast.success('Redo');
    }
  }

  // Export
  ERM.reportEditorV2 = {
    init: init,
    save: saveReport,
    getState: function() { return state; },
    getActiveBlock: function() { return state.activeBlock; },
    showTurnIntoDropdown: showTurnIntoDropdown,
    hideTurnIntoDropdown: hideTurnIntoDropdown,
    exportToPDF: exportToPDF,
    insertBlockAfter: insertBlockAfter,
    insertStructuredBlock: insertStructuredBlock,
    markDirty: markDirty,
    saveState: saveState,
    undo: undo,
    redo: redo,
    updatePageAwareness: updatePageAwareness,
    schedulePageAwarenessUpdate: schedulePageAwarenessUpdate,
    autoPaginate: autoPaginate,
    // Selection lock API
    selectionLock: {
      capture: captureSelectionLock,
      clear: clearSelectionLock,
      getText: getSelectionLockText,
      isLocked: isSelectionLocked,
      get: getSelectionLock,
      applyHighlight: function() {
        if (selectionLock.originalRange) {
          applySelectionLockHighlight(selectionLock.originalRange);
        }
      }
    },
    /**
     * Replace locked selection or entire block content
     * Used by AI Replace action - respects selection lock if it exists
     * @param {HTMLElement} targetBlock - Block element to replace content in
     * @param {string} newText - New text/HTML content to insert
     */
    replaceSelectionOrBlock: function(targetBlock, newText) {
      // Save state for undo before making changes
      saveState();

      // Check if we have a locked selection
      if (selectionLock.isLocked && selectionLock.blockElement) {
        // Replace only the locked selection
        var lockHighlights = document.querySelectorAll('.selection-lock[data-selection-lock]');
        if (lockHighlights.length > 0) {
          var firstHighlight = lockHighlights[0];
          var parent = firstHighlight.parentNode;

          // Insert new content before first highlight
          var wrapper = document.createElement('span');
          wrapper.innerHTML = newText;
          parent.insertBefore(wrapper, firstHighlight);

          // Remove all highlight spans
          for (var h = 0; h < lockHighlights.length; h++) {
            if (lockHighlights[h].parentNode) {
              lockHighlights[h].parentNode.removeChild(lockHighlights[h]);
            }
          }

          // Normalize parent
          if (parent.normalize) parent.normalize();
        }

        // Clear selection lock
        clearSelectionLock();
      } else {
        // Replace entire block content
        var contentEl = targetBlock ? targetBlock.querySelector('.block-content, [contenteditable="true"]') : null;
        if (contentEl) {
          contentEl.innerHTML = newText;
        }
      }

      // Mark dirty and save
      markDirty(true);
    }
  };

  console.log('Report Editor V2 loaded');

})();
