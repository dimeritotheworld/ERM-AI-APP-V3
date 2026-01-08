# Risk Register Module

## Overview

The Risk Register module handles all risk management functionality including creating registers, managing risks, AI suggestions, PDF exports, and more.

## File Structure

```
risk-register/
├── README.md                    # This file
├── risk-register-core.js        # Core state, initialization, utilities
├── risk-register-list.js        # Risk list view, filtering, sorting
├── risk-register-detail.js      # Risk detail view, single risk display
├── risk-register-modals.js      # All modal dialogs (7700+ lines)
├── risk-register-ai-ui.js       # AI suggestion UI components (4800+ lines)
├── risk-register-ai-parser.js   # AI response parsing utilities
└── risk-register-ai-starter.js  # AI starter risks for new registers
```

## Large Files Navigation

The two largest files have **Table of Contents** at the top for easy navigation.
Use `Ctrl+F` to jump to any section.

---

### risk-register-modals.js (~7700 lines)

| Section | Lines | Description |
|---------|-------|-------------|
| 1. Register CRUD | ~30-540 | Create, import, upgrade modals |
| 2. Register Naming & AI Starter | ~540-1460 | Name register, AI starter risks |
| 3. Register Management | ~1460-1660 | Rename, delete, modify registers |
| 4. PDF Export | ~1660-4100 | PDF config, preview, generation |
| 5. Risk Drafts | ~4100-4400 | Draft save/load functionality |
| 6. Risk Form Modal | ~4400-5800 | Main risk add/edit form |
| 7. Attachments | ~5800-6200 | File attachment handling |
| 8. Control Linking | ~6200-6550 | Link controls to risks |
| 9. AI Control Suggestions | ~6550-7200 | AI-generated control suggestions |
| 10. AI Risk Scoring | ~7200-7400 | AI scoring suggestions |
| 11. Bulk Operations | ~7400-7600 | Bulk edit/delete |
| 12. Global Event Listeners | ~7600-7680 | Event handlers |

**Key Functions:**
- `showRiskModal()` - Main risk form (Section 6)
- `showPDFConfigModal()` - PDF export config (Section 4)
- `showAIControlSuggestions()` - AI controls (Section 9)
- `showCreateModal()` - New register (Section 1)

---

### risk-register-ai-ui.js (~4800 lines)

| Section | Lines | Description |
|---------|-------|-------------|
| 1. Core Utilities | ~140-450 | Industry detection, applyToField, helpers |
| 2. Field Suggestion Handler | ~450-600 | Routes AI suggest button clicks |
| 3. Title Suggestions | ~600-900 | Risk title AI suggestions |
| 4. Category Suggestions | ~900-1400 | Category with deep search |
| 5. Description Suggestions | ~1400-1800 | Description generation |
| 6. Root Causes Suggestions | ~1800-2200 | Root causes list |
| 7. Consequences Suggestions | ~2200-2600 | Consequences list |
| 8. Action Plan Suggestions | ~2600-3000 | Action plan items |
| 9. Owner Suggestions | ~3000-3300 | Risk/action owner |
| 10. Treatment Suggestions | ~3300-3600 | Treatment decision |
| 11. Status Suggestions | ~3600-3900 | Risk status |
| 12. Date Suggestions | ~3900-4200 | Review/target dates |
| 13. Score Suggestions | ~4200-4600 | Inherent/residual scores |
| 14. Natural Language Generation | ~4600-4800 | Full risk from description |

**Key Functions:**
- `handleFieldSuggest(field)` - Entry point for all AI suggestions (Section 2)
- `applyToField(fieldId, value)` - Apply value to form field (Section 1)
- `showNaturalLanguageInput()` - "Describe with AI" feature (Section 14)

---

## How AI Suggestions Work

1. User clicks AI sparkle button next to a field
2. `handleFieldSuggest(field)` routes to the correct suggestion function
3. DeepSeek API is called with risk context
4. Suggestions displayed in modal via `showAISuggestionModal()`
5. User clicks "Use" → `applyToField()` sets the value
6. Modal closes, value saved, draft auto-saved

## Dependencies

- `ERM.components` - Modal system (`showModal`, `showSecondaryModal`)
- `ERM.aiService` - DeepSeek API wrapper
- `ERM.storage` - LocalStorage wrapper
- `ERM.toast` - Toast notifications
- `ERM.aiSuggestions` - Unified AI suggestion utilities (core/ai-suggestions.js)

## Future Refactoring Notes

If these files need to be split in the future, here's the recommended approach:

**risk-register-modals.js → 3 files:**
1. `risk-modal-register.js` - Sections 1-3 (Register CRUD)
2. `risk-modal-export.js` - Section 4 (PDF Export)
3. `risk-modal-form.js` - Sections 5-12 (Risk form & related)

**risk-register-ai-ui.js → 3 files:**
1. `risk-ai-core.js` - Sections 1-2 (Utilities & handler)
2. `risk-ai-fields.js` - Sections 3-5, 9-13 (Single-value fields)
3. `risk-ai-lists.js` - Sections 6-8 (List-type fields)

This would give ~2000-2500 lines per file, which is maintainable.
