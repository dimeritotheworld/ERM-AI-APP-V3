/**
 * UI Layer Manager - Single Source of Truth for All UI Layers
 *
 * DESIGN CONTRACT ENFORCEMENT:
 * - Modal: Max 1, blocking, everything else pauses
 * - Popover: Max 1, closes on click outside or modal open
 * - Toast: Max 1, auto-dismiss
 * - Tooltip: Max 1 per cursor focus
 *
 * ABSOLUTE RULES:
 * - Modal supremacy: When modal opens, close all popovers, dismiss toasts
 * - No stacking same layer type
 * - ESC closes topmost layer only
 * - No surprise interruptions while modal is open
 *
 * Z-INDEX HIERARCHY (DO NOT CHANGE):
 * - Tooltip: 6000
 * - Toast: 7000
 * - Popover: 8000
 * - Modal: 9000
 */

const UILayerManager = (function() {
    'use strict';

    // ========================================
    // STATE
    // ========================================

    const state = {
        // Current active layers (max 1 of each)
        activeModal: null,      // { id, element, onClose }
        activePopover: null,    // { id, element, trigger, onClose }
        activeToast: null,      // { id, element, timeout }
        activeTooltip: null,    // { id, element }

        // Modal history for back navigation (max length = 1 for single modal rule)
        modalHistory: [],

        // Flags
        isModalOpen: false,
        isProcessingClose: false,

        // Queued items
        toastQueue: [],

        // Registered elements for cleanup
        registeredModals: new Map(),
        registeredPopovers: new Map()
    };

    // ========================================
    // CONSTANTS
    // ========================================

    const Z_INDEX = {
        TOOLTIP: 6000,
        TOAST: 7000,
        POPOVER: 8000,
        MODAL: 9000
    };

    const MODAL_SIZES = {
        SM: '480px',
        MD: '640px',
        LG: '880px'
    };

    const TOAST_DURATION = 4000; // 4 seconds default
    const ANIMATION_DURATION = 200; // Match CSS transition

    // ========================================
    // MODAL MANAGER
    // ========================================

    const ModalManager = {
        /**
         * Open a modal - ENFORCES SINGLE MODAL RULE
         * If a modal is already open, it will be closed first
         *
         * @param {Object} config
         * @param {string} config.id - Unique modal identifier
         * @param {HTMLElement|string} config.content - Modal content or HTML string
         * @param {string} config.size - 'sm' | 'md' | 'lg' (default: 'md')
         * @param {string} config.intent - 'default' | 'ai' | 'upgrade' | 'danger' | 'success'
         * @param {string} config.title - Modal header title
         * @param {boolean} config.showClose - Show close button (default: true)
         * @param {Function} config.onClose - Callback when modal closes
         * @param {Function} config.onOpen - Callback when modal opens
         * @returns {Object} Modal instance with close method
         */
        open(config) {
            const {
                id = `modal-${Date.now()}`,
                content,
                size = 'md',
                intent = 'default',
                title = '',
                showClose = true,
                onClose = null,
                onOpen = null
            } = config;

            // RULE: Close existing modal first (single modal rule)
            if (state.activeModal) {
                this.close(false); // Don't trigger onClose callback for replaced modal
            }

            // RULE: Modal supremacy - close all popovers and toasts
            PopoverManager.closeAll();
            ToastManager.dismissCurrent();

            // Create modal structure
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            modalOverlay.setAttribute('data-modal-id', id);
            modalOverlay.setAttribute('role', 'dialog');
            modalOverlay.setAttribute('aria-modal', 'true');
            if (title) {
                modalOverlay.setAttribute('aria-labelledby', `${id}-title`);
            }

            const modal = document.createElement('div');
            modal.className = `modal modal-${size}`;
            if (intent !== 'default') {
                modal.classList.add(`modal-${intent}`);
            }

            // Build modal HTML
            let modalHTML = '';

            // Header
            if (title || showClose) {
                modalHTML += `<div class="modal-header">`;
                if (title) {
                    modalHTML += `<h2 class="modal-title" id="${id}-title">${title}</h2>`;
                }
                if (showClose) {
                    modalHTML += `<button class="modal-close" aria-label="Close modal" data-close-modal>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                    </button>`;
                }
                modalHTML += `</div>`;
            }

            // Body
            modalHTML += `<div class="modal-body">`;
            if (typeof content === 'string') {
                modalHTML += content;
            }
            modalHTML += `</div>`;

            modal.innerHTML = modalHTML;

            // If content is an element, append it to body
            if (content instanceof HTMLElement) {
                modal.querySelector('.modal-body').appendChild(content);
            }

            modalOverlay.appendChild(modal);

            // Add to DOM
            document.body.appendChild(modalOverlay);
            document.body.classList.add('modal-open');

            // Store state
            state.activeModal = {
                id,
                element: modalOverlay,
                modalElement: modal,
                onClose
            };
            state.isModalOpen = true;

            // Event listeners
            this._attachEventListeners(modalOverlay, modal);

            // Trigger animation
            requestAnimationFrame(() => {
                modalOverlay.classList.add('active');
            });

            // Focus trap - focus first focusable element
            setTimeout(() => {
                const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (focusable) {
                    focusable.focus();
                }
            }, ANIMATION_DURATION);

            // Callback
            if (onOpen) {
                onOpen({ id, element: modal });
            }

            return {
                id,
                element: modal,
                close: () => this.close()
            };
        },

        /**
         * Close the current modal
         * @param {boolean} triggerCallback - Whether to trigger onClose callback
         */
        close(triggerCallback = true) {
            if (!state.activeModal || state.isProcessingClose) return;

            state.isProcessingClose = true;
            const { element, onClose } = state.activeModal;

            // Animate out
            element.classList.remove('active');

            setTimeout(() => {
                // Remove from DOM
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }

                // Clear state
                const closedModal = state.activeModal;
                state.activeModal = null;
                state.isModalOpen = false;
                state.isProcessingClose = false;

                // Remove body class
                document.body.classList.remove('modal-open');

                // Callback
                if (triggerCallback && onClose) {
                    onClose(closedModal);
                }
            }, ANIMATION_DURATION);
        },

        /**
         * Check if a modal is currently open
         */
        isOpen() {
            return state.isModalOpen;
        },

        /**
         * Get current modal ID
         */
        getCurrentId() {
            return state.activeModal ? state.activeModal.id : null;
        },

        /**
         * Attach event listeners to modal
         * @private
         */
        _attachEventListeners(overlay, modal) {
            // Close on overlay click (outside modal)
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.close();
                }
            });

            // Close button
            const closeBtn = modal.querySelector('[data-close-modal]');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }

            // Close on any element with data-dismiss="modal"
            modal.querySelectorAll('[data-dismiss="modal"]').forEach(btn => {
                btn.addEventListener('click', () => this.close());
            });
        }
    };

    // ========================================
    // POPOVER MANAGER
    // ========================================

    const PopoverManager = {
        /**
         * Open a popover - ENFORCES SINGLE POPOVER RULE
         *
         * @param {Object} config
         * @param {string} config.id - Unique popover identifier
         * @param {HTMLElement} config.trigger - Element that triggered the popover
         * @param {HTMLElement|string} config.content - Popover content
         * @param {string} config.position - 'top' | 'bottom' | 'left' | 'right' (default: 'bottom')
         * @param {Function} config.onClose - Callback when popover closes
         */
        open(config) {
            const {
                id = `popover-${Date.now()}`,
                trigger,
                content,
                position = 'bottom',
                onClose = null
            } = config;

            // RULE: Don't open popovers when modal is open
            if (state.isModalOpen) {
                console.warn('UILayerManager: Cannot open popover while modal is open');
                return null;
            }

            // RULE: Close existing popover first (single popover rule)
            if (state.activePopover) {
                this.close(false);
            }

            // Create popover element
            const popover = document.createElement('div');
            popover.className = `popover popover-${position}`;
            popover.setAttribute('data-popover-id', id);
            popover.style.zIndex = Z_INDEX.POPOVER;

            if (typeof content === 'string') {
                popover.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                popover.appendChild(content);
            }

            // Position popover relative to trigger
            document.body.appendChild(popover);
            this._positionPopover(popover, trigger, position);

            // Store state
            state.activePopover = {
                id,
                element: popover,
                trigger,
                onClose
            };

            // Animate in
            requestAnimationFrame(() => {
                popover.classList.add('active');
            });

            // Close on click outside
            setTimeout(() => {
                document.addEventListener('click', this._handleOutsideClick);
            }, 0);

            return {
                id,
                element: popover,
                close: () => this.close()
            };
        },

        /**
         * Close current popover
         */
        close(triggerCallback = true) {
            if (!state.activePopover) return;

            const { element, onClose } = state.activePopover;

            // Remove click listener
            document.removeEventListener('click', this._handleOutsideClick);

            // Animate out
            element.classList.remove('active');

            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }

                const closedPopover = state.activePopover;
                state.activePopover = null;

                if (triggerCallback && onClose) {
                    onClose(closedPopover);
                }
            }, ANIMATION_DURATION);
        },

        /**
         * Close all popovers (called when modal opens)
         */
        closeAll() {
            this.close(false);
        },

        /**
         * Handle click outside popover
         * @private
         */
        _handleOutsideClick: function(e) {
            if (!state.activePopover) return;

            const { element, trigger } = state.activePopover;

            if (!element.contains(e.target) && !trigger.contains(e.target)) {
                PopoverManager.close();
            }
        },

        /**
         * Position popover relative to trigger
         * @private
         */
        _positionPopover(popover, trigger, position) {
            const triggerRect = trigger.getBoundingClientRect();
            const popoverRect = popover.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top, left;

            switch (position) {
                case 'top':
                    top = triggerRect.top + scrollY - popoverRect.height - 8;
                    left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popoverRect.width / 2);
                    break;
                case 'bottom':
                    top = triggerRect.bottom + scrollY + 8;
                    left = triggerRect.left + scrollX + (triggerRect.width / 2) - (popoverRect.width / 2);
                    break;
                case 'left':
                    top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popoverRect.height / 2);
                    left = triggerRect.left + scrollX - popoverRect.width - 8;
                    break;
                case 'right':
                    top = triggerRect.top + scrollY + (triggerRect.height / 2) - (popoverRect.height / 2);
                    left = triggerRect.right + scrollX + 8;
                    break;
            }

            // Keep within viewport
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            if (left < 8) left = 8;
            if (left + popoverRect.width > viewportWidth - 8) {
                left = viewportWidth - popoverRect.width - 8;
            }
            if (top < 8) top = 8;
            if (top + popoverRect.height > viewportHeight + scrollY - 8) {
                top = viewportHeight + scrollY - popoverRect.height - 8;
            }

            popover.style.top = `${top}px`;
            popover.style.left = `${left}px`;
        }
    };

    // ========================================
    // TOAST MANAGER
    // ========================================

    const ToastManager = {
        /**
         * Show a toast notification - ENFORCES SINGLE TOAST RULE
         *
         * @param {Object} config
         * @param {string} config.message - Toast message
         * @param {string} config.type - 'info' | 'success' | 'warning' | 'error' (default: 'info')
         * @param {number} config.duration - Auto-dismiss duration in ms (default: 4000)
         * @param {boolean} config.dismissible - Can be manually dismissed (default: true)
         */
        show(config) {
            const {
                message,
                type = 'info',
                duration = TOAST_DURATION,
                dismissible = true
            } = config;

            // RULE: Don't show toasts when modal is open (queue instead)
            if (state.isModalOpen) {
                state.toastQueue.push(config);
                return null;
            }

            // RULE: Dismiss current toast first (single toast rule)
            if (state.activeToast) {
                this.dismissCurrent(false);
            }

            const id = `toast-${Date.now()}`;

            // Create toast element
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.setAttribute('data-toast-id', id);
            toast.setAttribute('role', 'alert');
            toast.style.zIndex = Z_INDEX.TOAST;

            toast.innerHTML = `
                <div class="toast-content">
                    <span class="toast-icon">${this._getIcon(type)}</span>
                    <span class="toast-message">${message}</span>
                    ${dismissible ? `<button class="toast-dismiss" aria-label="Dismiss">&times;</button>` : ''}
                </div>
            `;

            // Add to DOM
            let container = document.querySelector('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container';
                document.body.appendChild(container);
            }
            container.appendChild(toast);

            // Auto-dismiss timeout
            const timeout = setTimeout(() => {
                this.dismissCurrent();
            }, duration);

            // Store state
            state.activeToast = {
                id,
                element: toast,
                timeout
            };

            // Animate in
            requestAnimationFrame(() => {
                toast.classList.add('active');
            });

            // Dismiss button
            if (dismissible) {
                toast.querySelector('.toast-dismiss').addEventListener('click', () => {
                    this.dismissCurrent();
                });
            }

            return { id, element: toast };
        },

        /**
         * Dismiss current toast
         */
        dismissCurrent(processQueue = true) {
            if (!state.activeToast) return;

            const { element, timeout } = state.activeToast;

            // Clear timeout
            clearTimeout(timeout);

            // Animate out
            element.classList.remove('active');

            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }

                state.activeToast = null;

                // Process queue if modal is now closed
                if (processQueue && !state.isModalOpen && state.toastQueue.length > 0) {
                    const nextToast = state.toastQueue.shift();
                    this.show(nextToast);
                }
            }, ANIMATION_DURATION);
        },

        /**
         * Get icon for toast type
         * @private
         */
        _getIcon(type) {
            const icons = {
                info: '&#9432;',
                success: '&#10003;',
                warning: '&#9888;',
                error: '&#10007;'
            };
            return icons[type] || icons.info;
        }
    };

    // ========================================
    // TOOLTIP MANAGER
    // ========================================

    const TooltipManager = {
        /**
         * Show tooltip for element
         *
         * @param {HTMLElement} target - Element to show tooltip for
         * @param {string} text - Tooltip text
         * @param {string} position - 'top' | 'bottom' | 'left' | 'right' (default: 'top')
         */
        show(target, text, position = 'top') {
            // RULE: Only one tooltip at a time
            this.hide();

            const id = `tooltip-${Date.now()}`;

            const tooltip = document.createElement('div');
            tooltip.className = `tooltip tooltip-${position}`;
            tooltip.setAttribute('data-tooltip-id', id);
            tooltip.setAttribute('role', 'tooltip');
            tooltip.style.zIndex = Z_INDEX.TOOLTIP;
            tooltip.textContent = text;

            document.body.appendChild(tooltip);

            // Position tooltip
            const targetRect = target.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();
            const scrollY = window.scrollY;
            const scrollX = window.scrollX;

            let top, left;

            switch (position) {
                case 'top':
                    top = targetRect.top + scrollY - tooltipRect.height - 8;
                    left = targetRect.left + scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);
                    break;
                case 'bottom':
                    top = targetRect.bottom + scrollY + 8;
                    left = targetRect.left + scrollX + (targetRect.width / 2) - (tooltipRect.width / 2);
                    break;
                case 'left':
                    top = targetRect.top + scrollY + (targetRect.height / 2) - (tooltipRect.height / 2);
                    left = targetRect.left + scrollX - tooltipRect.width - 8;
                    break;
                case 'right':
                    top = targetRect.top + scrollY + (targetRect.height / 2) - (tooltipRect.height / 2);
                    left = targetRect.right + scrollX + 8;
                    break;
            }

            tooltip.style.top = `${top}px`;
            tooltip.style.left = `${left}px`;

            state.activeTooltip = { id, element: tooltip };

            requestAnimationFrame(() => {
                tooltip.classList.add('active');
            });
        },

        /**
         * Hide current tooltip
         */
        hide() {
            if (!state.activeTooltip) return;

            const { element } = state.activeTooltip;
            element.classList.remove('active');

            setTimeout(() => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
                state.activeTooltip = null;
            }, 150);
        }
    };

    // ========================================
    // GLOBAL KEYBOARD HANDLER
    // ========================================

    function handleEscapeKey(e) {
        if (e.key !== 'Escape') return;

        // RULE: ESC closes topmost layer only (in order of z-index)
        // Modal (9000) > Popover (8000) > Toast (7000)

        if (state.activeModal) {
            e.preventDefault();
            ModalManager.close();
            return;
        }

        if (state.activePopover) {
            e.preventDefault();
            PopoverManager.close();
            return;
        }

        // Don't close toasts with ESC - they auto-dismiss
    }

    // ========================================
    // INITIALIZATION
    // ========================================

    function init() {
        // Global ESC handler
        document.addEventListener('keydown', handleEscapeKey);

        // Setup tooltip triggers
        document.addEventListener('mouseenter', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                const text = target.getAttribute('data-tooltip');
                const position = target.getAttribute('data-tooltip-position') || 'top';
                TooltipManager.show(target, text, position);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                TooltipManager.hide();
            }
        }, true);

        console.log('UILayerManager initialized');
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ========================================
    // PUBLIC API
    // ========================================

    return {
        // Modal
        modal: ModalManager,
        openModal: (config) => ModalManager.open(config),
        closeModal: () => ModalManager.close(),
        isModalOpen: () => ModalManager.isOpen(),

        // Popover
        popover: PopoverManager,
        openPopover: (config) => PopoverManager.open(config),
        closePopover: () => PopoverManager.close(),

        // Toast
        toast: ToastManager,
        showToast: (config) => ToastManager.show(config),
        dismissToast: () => ToastManager.dismissCurrent(),

        // Tooltip
        tooltip: TooltipManager,
        showTooltip: (target, text, position) => TooltipManager.show(target, text, position),
        hideTooltip: () => TooltipManager.hide(),

        // Constants (read-only)
        Z_INDEX: Object.freeze({ ...Z_INDEX }),
        MODAL_SIZES: Object.freeze({ ...MODAL_SIZES }),

        // State inspection (for debugging)
        getState: () => ({
            isModalOpen: state.isModalOpen,
            hasPopover: !!state.activePopover,
            hasToast: !!state.activeToast,
            toastQueueLength: state.toastQueue.length
        })
    };
})();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UILayerManager;
}
