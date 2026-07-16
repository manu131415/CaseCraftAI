# Multilingual Support Guide - CaseCraftAI Frontend

## Overview
Your frontend now supports three languages:
- **English (en)** - Default
- **Hindi (hi)** - हिन्दी
- **Gujarati (gu)** - ગુજરાતી

Language preference is saved in localStorage and persists across sessions.

---

## Architecture

### 1. **Language Provider** (`app/providers/LanguageProvider.tsx`)
- React Context that manages language state
- Provides `useLanguage()` hook for accessing translations
- Automatically loads language from localStorage on mount
- Updates HTML `lang` attribute for proper font rendering

### 2. **Translation Files** (`public/locales/`)
```
public/locales/
├── en/
│   ├── common.json      # Navigation, buttons, UI elements
│   ├── dashboard.json   # Dashboard-specific text
│   └── complaints.json  # Complaint form text
├── hi/
│   ├── common.json
│   ├── dashboard.json
│   └── complaints.json
└── gu/
    ├── common.json
    ├── dashboard.json
    └── complaints.json
```

### 3. **Language Switcher** (`components/layout/LanguageSwitcher.tsx`)
- Dropdown component for language selection
- Currently in Navbar
- Updates language globally on selection

### 4. **Indian Language Fonts** (`app/layout.tsx`)
- **Noto Devanagari** - For Hindi text rendering
- **Noto Sans Gujarati** - For Gujarati text rendering
- Fonts automatically applied based on `html[lang]` attribute

---

## How to Use

### In Any Component
```typescript
'use client';

import { useLanguage } from '@/app/providers/LanguageProvider';

export default function MyComponent() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <div>
      <h1>{t('nav.operationsCenter', 'common')}</h1>
      <p>{t('title', 'dashboard')}</p>
      <button onClick={() => setLanguage('hi')}>
        हिन्दी
      </button>
    </div>
  );
}
```

### Translation Function Signature
```typescript
t(key: string, namespace?: string): string

// Examples:
t('nav.operationsCenter', 'common')  // Returns translated text
t('title', 'dashboard')               // Returns dashboard title
t('registerComplaint', 'complaints')  // Returns complaint action
```

**Parameters:**
- `key` - Dot-notation path to translation (e.g., `'common.save'`)
- `namespace` - JSON file to use: `'common'`, `'dashboard'`, or `'complaints'` (default: `'common'`)

---

## Adding New Translations

### Step 1: Update Translation Files
Add your new text to all three language files:

**`public/locales/en/common.json`**
```json
{
  "mySection": {
    "myText": "Hello World"
  }
}
```

**`public/locales/hi/common.json`**
```json
{
  "mySection": {
    "myText": "नमस्ते दुनिया"
  }
}
```

**`public/locales/gu/common.json`**
```json
{
  "mySection": {
    "myText": "હેલો વર્લ્ડ"
  }
}
```

### Step 2: Use in Components
```typescript
const { t } = useLanguage();
<p>{t('mySection.myText', 'common')}</p>
```

---

## Updating Existing Translations

1. Open the relevant namespace file in `public/locales/`
2. Find the key you want to update
3. Update text for all three languages (en, hi, gu)
4. Changes are immediately reflected (no rebuild needed for dev mode)

---

## Adding a New Language

To add a new language (e.g., Marathi):

1. Create new directory: `public/locales/ma/`
2. Copy all JSON files from English: `common.json`, `dashboard.json`, `complaints.json`
3. Translate all content
4. Update `next-i18next.config.js`:
   ```javascript
   locales: ['en', 'hi', 'gu', 'ma'],
   ```
5. Update `LanguageProvider.tsx` to import new translations
6. Update `LanguageSwitcher.tsx` to show new language option:
   ```typescript
   const languages = [
     { code: 'en', name: 'English', flag: '🇬🇧' },
     { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
     { code: 'gu', name: 'ગુજરાતી', flag: '🇮🇳' },
     { code: 'ma', name: 'मराठी', flag: '🇮🇳' },
   ];
   ```

---

## Font Configuration

Indian language fonts are automatically applied based on the `html[lang]` attribute:

```css
html[lang="hi"] {
  font-family: var(--font-devanagari), sans-serif;
}

html[lang="gu"] {
  font-family: var(--font-gujarati), sans-serif;
}
```

No additional setup needed!

---

## Current Translation Coverage

### Namespaces:
1. **common.json** - Navigation, buttons, status messages
2. **dashboard.json** - Dashboard page text
3. **complaints.json** - Complaint registration page text

### Components Updated:
- ✅ `Navbar` - Uses translations for nav labels, search placeholder
- ✅ `Home/Landing Page` - All hero section text translated
- ⚠️ Other components - Need individual updates (see below)

---

## Next Steps: Update Components

To make the entire app multilingual, update these components to use the `useLanguage()` hook:

1. **Dashboard Components**
   - `components/dashboard/ActivityFeed.tsx`
   - `components/dashboard/DashboardCard.tsx`
   - `components/dashboard/RecentComplaint.tsx`

2. **Complaint Components**
   - `components/complaint/ComplaintWizard.tsx`
   - `components/complaint/Stepper.tsx`
   - `components/complaint/steps/ComplainantDetails.tsx`
   - `components/complaint/steps/Complaint.tsx`
   - `components/complaint/upload/*`

3. **Layout Components**
   - `components/layout/Sidebar.tsx`

### Template for Updating Components:
```typescript
'use client';

import { useLanguage } from '@/app/providers/LanguageProvider';

export default function MyComponent() {
  const { t } = useLanguage();

  return (
    <div>
      <h2>{t('key.path', 'namespace')}</h2>
      {/* Replace hardcoded strings with t() calls */}
    </div>
  );
}
```

---

## Testing Translations

1. Run dev server: `npm run dev`
2. Open app in browser
3. Click language switcher in navbar
4. Verify all visible text changes
5. Refresh page - language selection should persist

---

## Troubleshooting

### Translations not updating?
- Ensure component is marked as `'use client'`
- Check namespace name matches JSON file name
- Verify key path exists in translation file

### Indian text not displaying correctly?
- Check that `html[lang]` attribute is set correctly
- Verify fonts are loaded: Check DevTools → Fonts
- Clear browser cache

### New language not showing?
- Update both `LanguageProvider.tsx` AND `LanguageSwitcher.tsx`
- Restart dev server

---

## Files Reference

- **Config**: `next-i18next.config.js`
- **Provider**: `app/providers/LanguageProvider.tsx`
- **Switcher**: `components/layout/LanguageSwitcher.tsx`
- **Translations**: `public/locales/{lang}/{namespace}.json`
- **Fonts CSS**: `app/globals.css`
- **Keys Helper**: `lib/translationKeys.ts`

---

## Performance Notes

- Translations are loaded at build time (static)
- No runtime fetching needed
- Language switching is instant (no page reload required)
- Minimal bundle size impact (~20KB for all translations)

---

## Future Enhancements

- Add language-specific formatting (dates, numbers, currency)
- Add RTL support if needed
- Integrate with translation management service (Crowdin, Lokalise)
- Add pluralization rules
- Add dynamic server-side rendering for SEO per language
