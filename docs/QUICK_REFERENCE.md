# Quick Reference Guide - Dimeri ERM

## File Structure at a Glance

```
assets/
├── css/
│   ├── core/          # Global, components, layout, theme
│   ├── modules/       # Per-module styles
│   └── features/      # Cross-module feature styles
│
├── js/
│   ├── core/          # global.js, components.js, layout.js
│   ├── modules/       # Dashboard, risk-register/, controls/, reports/, activity/
│   └── features/      # AI assistant, matchers
│
└── templates/
    ├── shared/        # Loaders (industry-agnostic)
    └── {industry}/    # mining/, manufacturing/, etc.
        ├── risks/     # 6 files
        └── controls/  # 5 files
```

## Adding New Industry (3 Steps)

1. **Create folders:**
   ```
   templates/{industry}/risks/
   templates/{industry}/controls/
   ```

2. **Create 11 template files** (copy from mining/ and modify)

3. **Add to index.html:**
   ```html
   <!-- {Industry} Risk Templates -->
   <script src="assets/templates/{industry}/risks/*.js"></script>

   <!-- {Industry} Control Templates -->
   <script src="assets/templates/{industry}/controls/*.js"></script>
   ```

**Done!** AI auto-discovers it. No code changes needed.

## Key Namespaces

```javascript
// Global
window.ERM = {
  state: {},
  storage: {},
  utils: {},
  toast: {},
  components: {},
  navigation: {},
  layout: {}
}

// Risk Templates
ERM_TEMPLATES = {
  loader: {},      // Industry-agnostic loader
  mining: {},      // Mining industry
  {industry}: {}   // Auto-discovered!
}

// Control Templates
window.ERM.controlTemplates = {
  loader: {},      // Industry-agnostic loader
  mining: {},      // Mining industry
  {industry}: {}   // Auto-discovered!
}

// Modules
ERM.dashboard = {}
ERM.riskRegister = {}
ERM.controls = {}
ERM.reports = {}
ERM.help = {}
ERM.settings = {}
ERM.activityLog = {}
```

## Common File Locations

| What | Where |
|------|-------|
| Global utilities | `assets/js/core/global.js` |
| Modals, toasts | `assets/js/core/components.js` |
| Navigation | `assets/js/core/layout.js` |
| Risk register | `assets/js/modules/risk-register/` |
| Controls | `assets/js/modules/controls/` |
| Reports | `assets/js/modules/reports/reports.js` |
| AI assistant | `assets/js/features/ai-assistant.js` |
| Risk templates | `assets/templates/{industry}/risks/` |
| Control templates | `assets/templates/{industry}/controls/` |

## Script Loading Order

1. External libs (Chart.js, Quill)
2. **Core** (global → components → layout)
3. **Features** (AI assistant, matchers)
4. **Modules** (dashboard, risk-register, controls, reports, activity)
5. **Templates** (shared → industry-specific)

## CSS Loading Order

1. **Core** (global → components → layout → theme-dark)
2. **Modules** (dashboard, risk-register, controls, reports, etc.)
3. **Features** (AI assistant)

## Industry Template Structure

### Required Risk Files (6)
```
{industry}-config.js        # Industry metadata
{industry}-departments.js   # Departments list
{industry}-categories.js    # Risk categories
{industry}-risks.js         # Risk templates array
{industry}-keywords.js      # Keyword mappings
{industry}-sentences.js     # Sentence builder
```

### Required Control Files (5)
```
{industry}-control-config.js        # Industry metadata
{industry}-control-departments.js   # Departments list
{industry}-control-categories.js    # Control categories
{industry}-controls.js              # Control templates array
{industry}-control-keywords.js      # Keyword mappings
```

## Auto-Discovery Check

```javascript
// Check discovered industries
console.log(ERM_TEMPLATES.loader.getAvailableIndustries());
console.log(ERM.controlTemplates.loader.getAvailableIndustries());
```

## Switching Industries

```javascript
// Set industry (stored in localStorage)
ERM_TEMPLATES.loader.setIndustry("manufacturing");

// Get current industry
var industry = ERM_TEMPLATES.loader.getIndustry();

// All AI calls now use manufacturing templates!
```

## Development Workflow

1. **Adding feature**: Create in `assets/js/modules/{feature}/`
2. **Adding styles**: Create in `assets/css/modules/{feature}.css`
3. **Adding industry**: Create in `assets/templates/{industry}/`
4. **Update index.html**: Add `<script>` and `<link>` tags
5. **Test**: Refresh browser, check console

## Useful Console Commands

```javascript
// Check current industry
ERM_TEMPLATES.loader.getIndustry()

// List all risks
ERM_TEMPLATES.loader.getRisks()

// List all controls
ERM.controlTemplates.loader.getAllControls()

// Check storage
ERM.storage.get('risks')
ERM.storage.get('reports')

// Check state
ERM.state.user
ERM.state.currentView
```

## File Naming Conventions

- **CSS**: `kebab-case.css` (e.g., `risk-register-core.css`)
- **JS**: `kebab-case.js` (e.g., `risk-register-core.js`)
- **Templates**: `{industry}-{type}.js` (e.g., `mining-risks.js`)
- **Folders**: `lowercase` (e.g., `risk-register/`)

## Module Communication

```javascript
// Toast notifications
ERM.toast.success("Message")
ERM.toast.error("Message")
ERM.toast.info("Message")

// Modal dialogs
ERM.components.showModal({
  title: "...",
  content: "...",
  size: "md|lg|xl",
  buttons: [...]
})
ERM.components.closeModal()

// Navigation
ERM.navigation.switchView("dashboard")

// Storage
ERM.storage.set("key", data)
ERM.storage.get("key")

// Activity logging
ERM.activityLogger.log("risk_created", {details})
```

## Documentation

- **[FILE_STRUCTURE.md](FILE_STRUCTURE.md)** - Detailed file organization
- **[ADDING_NEW_INDUSTRIES.md](ADDING_NEW_INDUSTRIES.md)** - Complete industry guide
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - This file
