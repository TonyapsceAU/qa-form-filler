# Changelog

All notable changes to this project will be documented in this file.
## v1.2.2

### Improvements

- Standardized import/export logging format
- Added structured logging for import, export, repeat section handling and field filling
- Improved warning and error message consistency
- Centralized debug configuration in constants.js
- Added configurable debug flags:
  - DEBUG_REPEAT
  - DEBUG_LABELS
  - DEBUG_HIGHLIGHT
  - DEBUG_KEYWORDS

### Maintenance

- Removed temporary debugging logs used during repeat section investigation
- Improved code readability and troubleshooting workflow

---

## v1.2.1

### Fixes

- Fixed repeat section expansion failing after form rerender
- Fixed keyword repeat section synchronization
- Fixed incomplete expansion when multiple additions were required
- Improved reliability of dynamic repeat section handling during import

### Improvements

- Improved import stability for forms containing repeat sections

### Features
- Optimized import pass calculation
- Improved popup UI layout

### UI
- Redesigned popup styling
- Grouped utility actions horizontally
- Added extension icon assets
- Improved visual consistency and readability

### Documentation
- Added release screenshots to README
- Added release checklist
- Expanded changelog history

### Refactoring
- Split content script into feature modules
- Centralized constants and simplified action handling
- Standardized naming conventions

---

## v1.2.0

### Features
- Added import progress overlay
- Added repeat section cleanup during import
- Added repeat section synchronization during import
- Added support for keyword repeat sections

### Improvements
- Improved repeat count detection
- Improved dynamic form import workflow
- Reduced manual form preparation before import

---

## v1.1.0

### Features
- Added import progress overlay

### Improvements
- Improved repeat section field label detection

### Refactoring
- Split content script into feature modules
- Centralized constants and simplified action handling
- Standardized naming conventions

---

## v1.0.2

### Fixes
- Fixed repeat section detection
- Fixed repeat section expansion

---

## v1.0.1

### Fixes
- Added support for Ant Design checkbox import

---

## v1.0.0

### Features
- Added Excel import support
- Added Excel export support
- Added dynamic field support

---

## Initial Development

### Prototype
- Initial QA Form Filler extension