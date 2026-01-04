# Adding New Industries to Dimeri ERM

## Quick Answer: YES, Everything Will Work Fine! ✅

The AI template system is **industry-agnostic** and uses **auto-discovery**. When you add a new industry, the AI will automatically detect and use it without any code changes.

## How the Template System Works

### 1. **Auto-Discovery Pattern**

Both risk and control templates use a **namespace-based discovery** system:

```javascript
// Risk Templates
ERM_TEMPLATES.mining = { ... }
ERM_TEMPLATES.manufacturing = { ... }  // Auto-discovered!
ERM_TEMPLATES.healthcare = { ... }     // Auto-discovered!

// Control Templates
window.ERM.controlTemplates.mining = { ... }
window.ERM.controlTemplates.manufacturing = { ... }  // Auto-discovered!
```

The loaders scan the namespace and automatically find all registered industries.

### 2. **Dynamic Industry Access**

The AI code uses **dynamic property access**, not hardcoded paths:

```javascript
// ❌ WRONG - Hardcoded (we don't do this)
var risks = ERM_TEMPLATES.mining.risks;

// ✅ CORRECT - Dynamic (what we actually do)
var industry = ERM_TEMPLATES.loader.getIndustry();  // e.g., "manufacturing"
var risks = ERM_TEMPLATES[industry].risks;          // Works for ANY industry!
```

This means the AI will work with **any industry** you add to the namespace.

## Step-by-Step: Adding a New Industry

### Example: Adding "Manufacturing" Industry

#### **Step 1: Create Folder Structure**

```
assets/templates/manufacturing/
├── risks/
│   ├── manufacturing-config.js
│   ├── manufacturing-departments.js
│   ├── manufacturing-categories.js
│   ├── manufacturing-risks.js
│   ├── manufacturing-keywords.js
│   └── manufacturing-sentences.js
└── controls/
    ├── manufacturing-control-config.js
    ├── manufacturing-control-departments.js
    ├── manufacturing-control-categories.js
    ├── manufacturing-controls.js
    └── manufacturing-control-keywords.js
```

#### **Step 2: Create Risk Config** (`manufacturing-config.js`)

```javascript
/**
 * Manufacturing Industry Risk Templates - Configuration
 */
var ERM_TEMPLATES = ERM_TEMPLATES || {};
ERM_TEMPLATES.manufacturing = ERM_TEMPLATES.manufacturing || {};

ERM_TEMPLATES.manufacturing.config = {
  industryId: "manufacturing",
  name: "Manufacturing",
  version: "1.0.0",
  description: "Risk templates for manufacturing and production industries"
};
```

#### **Step 3: Create Departments** (`manufacturing-departments.js`)

```javascript
ERM_TEMPLATES.manufacturing.departments = {
  universal: [
    { id: "executive", name: "Executive Leadership", icon: "🏢" },
    { id: "finance", name: "Finance & Accounting", icon: "💰" },
    { id: "hr", name: "Human Resources", icon: "👥" },
    { id: "it", name: "Information Technology", icon: "💻" }
  ],
  industrySpecific: [
    { id: "production", name: "Production & Assembly", icon: "🏭" },
    { id: "quality", name: "Quality Assurance", icon: "✓" },
    { id: "supply-chain", name: "Supply Chain", icon: "🚚" },
    { id: "maintenance", name: "Maintenance", icon: "🔧" }
  ]
};
```

#### **Step 4: Create Categories** (`manufacturing-categories.js`)

```javascript
ERM_TEMPLATES.manufacturing.categories = {
  strategic: [
    { id: "market-competition", name: "Market Competition", icon: "📊" },
    { id: "innovation", name: "Innovation & R&D", icon: "💡" }
  ],
  operational: [
    { id: "production-disruption", name: "Production Disruption", icon: "⚠️" },
    { id: "quality-defects", name: "Quality Defects", icon: "❌" },
    { id: "supply-chain", name: "Supply Chain Issues", icon: "🔗" }
  ],
  // ... more categories
};
```

#### **Step 5: Create Risks** (`manufacturing-risks.js`)

```javascript
ERM_TEMPLATES.manufacturing.risks = [
  {
    id: "production-line-failure",
    titles: [
      "Production Line Breakdown",
      "Manufacturing Equipment Failure",
      "Assembly Line Disruption"
    ],
    descriptions: [
      "Critical production equipment failure leading to line stoppage and output loss",
      "Assembly line breakdown causing production delays and customer delivery issues"
    ],
    keywords: ["equipment", "breakdown", "production", "failure", "downtime"],
    category: "operational",
    department: "production"
  },
  // ... more risks
];
```

#### **Step 6: Create Control Templates** (same pattern)

```javascript
// In manufacturing-controls.js
window.ERM = window.ERM || {};
window.ERM.controlTemplates = window.ERM.controlTemplates || {};
window.ERM.controlTemplates.manufacturing = {
  config: { ... },
  departments: { ... },
  categories: { ... },
  controls: [ ... ],
  keywordMappings: { ... }
};
```

#### **Step 7: Update index.html**

Add the new industry scripts in the correct section:

```html
<!-- Manufacturing Risk Templates -->
<script src="assets/templates/manufacturing/risks/manufacturing-config.js"></script>
<script src="assets/templates/manufacturing/risks/manufacturing-departments.js"></script>
<script src="assets/templates/manufacturing/risks/manufacturing-categories.js"></script>
<script src="assets/templates/manufacturing/risks/manufacturing-risks.js"></script>
<script src="assets/templates/manufacturing/risks/manufacturing-keywords.js"></script>
<script src="assets/templates/manufacturing/risks/manufacturing-sentences.js"></script>

<!-- Manufacturing Control Templates -->
<script src="assets/templates/manufacturing/controls/manufacturing-control-config.js"></script>
<script src="assets/templates/manufacturing/controls/manufacturing-control-departments.js"></script>
<script src="assets/templates/manufacturing/controls/manufacturing-control-categories.js"></script>
<script src="assets/templates/manufacturing/controls/manufacturing-controls.js"></script>
<script src="assets/templates/manufacturing/controls/manufacturing-control-keywords.js"></script>
```

#### **Step 8: That's It! ✅**

The AI will automatically:
- ✅ Discover the new "manufacturing" industry
- ✅ Load all templates when user selects "Manufacturing"
- ✅ Provide AI suggestions based on manufacturing risks/controls
- ✅ Match keywords specific to manufacturing
- ✅ Generate risk descriptions for manufacturing scenarios

**NO CODE CHANGES NEEDED** in any JS files!

## How Auto-Discovery Works

### Risk Template Discovery

```javascript
// In template-loader.js
getIndustry: function() {
  // Gets current industry from localStorage or defaults to "mining"
  return localStorage.getItem("ERM_industry") || "mining";
}

getTemplates: function() {
  var industry = this.getIndustry();  // e.g., "manufacturing"
  if (!industry || !ERM_TEMPLATES[industry]) {
    return null;
  }
  return ERM_TEMPLATES[industry];  // Returns manufacturing templates!
}
```

### Control Template Discovery

```javascript
// In control-loader.js
discoverIndustries: function() {
  this.availableIndustries = [];

  // Scans ALL properties in window.ERM.controlTemplates
  for (var key in window.ERM.controlTemplates) {
    if (key === "loader") continue;  // Skip loader itself

    var industry = window.ERM.controlTemplates[key];

    // Verify structure
    if (industry.config && industry.controls) {
      this.availableIndustries.push({
        id: key,  // "manufacturing", "mining", etc.
        name: industry.config.industryName
      });
    }
  }

  return this.availableIndustries;  // Auto-discovered!
}
```

## AI Code Examples

### How Risk AI Accesses Templates

```javascript
// From risk-register-ai-ui.js

// Get risks for current industry (ANY industry!)
function getRisksForIndustry() {
  var industry = ERM_TEMPLATES.loader.getIndustry();  // Dynamic

  if (!ERM_TEMPLATES[industry] || !ERM_TEMPLATES[industry].risks) {
    return [];
  }

  return ERM_TEMPLATES[industry].risks;  // Works for mining, manufacturing, etc.!
}

// Get categories for current industry
function getCategoriesForDepartment(deptId) {
  var industry = ERM_TEMPLATES.loader.getIndustry();

  if (ERM_TEMPLATES[industry] && ERM_TEMPLATES[industry].categories) {
    return ERM_TEMPLATES[industry].categories[deptId];
  }

  return [];
}
```

### How Control AI Accesses Templates

```javascript
// From controls-ai-ui.js

// Match user input to controls (ANY industry!)
function findControlsForRisk(riskKeywords) {
  var industry = ERM.controlTemplates.loader.getIndustry();
  var controls = ERM.controlTemplates[industry].controls;

  // Score and return matching controls
  return scoreControls(controls, riskKeywords);
}
```

## Industry Switching

Users can switch industries via Settings:

```javascript
// When user selects a new industry
ERM_TEMPLATES.loader.setIndustry("manufacturing");

// All subsequent AI calls automatically use manufacturing templates!
var risks = ERM_TEMPLATES.loader.getRisks();  // Manufacturing risks
var controls = ERM.controlTemplates.loader.getControls();  // Manufacturing controls
```

## Template Structure Requirements

For auto-discovery to work, each industry MUST have this structure:

### Risk Templates
```javascript
ERM_TEMPLATES.{industry_id} = {
  config: {
    industryId: "...",
    name: "...",
    version: "..."
  },
  departments: {
    universal: [...],
    industrySpecific: [...]
  },
  categories: {
    strategic: [...],
    operational: [...],
    // ... other categories
  },
  risks: [
    {
      id: "...",
      titles: [...],
      descriptions: [...],
      keywords: [...],
      category: "...",
      department: "..."
    }
  ]
};
```

### Control Templates
```javascript
window.ERM.controlTemplates.{industry_id} = {
  config: {
    industryId: "...",
    industryName: "...",
    version: "..."
  },
  departments: [...],
  categories: [...],
  controls: [
    {
      id: "...",
      titles: [...],
      descriptions: [...],
      keywords: [...],
      type: "...",
      category: "..."
    }
  ],
  keywordMappings: {...}
};
```

## Checklist for New Industry

- [ ] Create folder: `assets/templates/{industry}/risks/`
- [ ] Create folder: `assets/templates/{industry}/controls/`
- [ ] Create 6 risk template files (config, departments, categories, risks, keywords, sentences)
- [ ] Create 5 control template files (config, departments, categories, controls, keywords)
- [ ] Add `<script>` tags to index.html for all 11 files
- [ ] Verify namespace: `ERM_TEMPLATES.{industry}` exists
- [ ] Verify namespace: `window.ERM.controlTemplates.{industry}` exists
- [ ] Test auto-discovery: Check console for "Discovered X industries"
- [ ] Test AI suggestions: Switch to new industry and create a risk

## File Paths Are Industry-Agnostic

The current file structure supports unlimited industries:

```
assets/templates/
├── shared/              # Shared loaders (industry-agnostic)
│   ├── template-loader.js
│   ├── control-loader.js
│   └── sentence-builder.js
│
├── mining/              # Mining industry
│   ├── risks/
│   └── controls/
│
├── manufacturing/       # ✅ Add this
│   ├── risks/
│   └── controls/
│
├── healthcare/          # ✅ Add this
│   ├── risks/
│   └── controls/
│
└── construction/        # ✅ Add this
    ├── risks/
    └── controls/
```

## Summary

✅ **Yes, the AI paths are industry-agnostic!**

When you add a new industry:
1. Create the folder structure
2. Add the template files
3. Include scripts in index.html
4. **That's it!** The AI automatically discovers and uses it.

**No code changes needed** in:
- ❌ risk-register-ai.js
- ❌ controls-ai.js
- ❌ template-loader.js
- ❌ control-loader.js

The system is designed to scale to **unlimited industries** with zero code modifications! 🎉
