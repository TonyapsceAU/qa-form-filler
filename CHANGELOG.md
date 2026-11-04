# Changelog

All notable changes to this project will be documented in this file.

# Changelog

## v1.6.0 - Support File Management

### Added

#### Support File Management

- Added support for importing non-Excel files.
- Added support file storage using Chrome Storage.
- Added support file listing in popup.
- Added file reconstruction from stored buffers.
- Added foundation for future automatic file upload support.

#### Import Workflow

- Import button now supports:
  - Excel test cases
  - PDF files
  - Supporting documents
- Added support file counters in import summary.
- Added mixed file import workflow.

### Improved

#### Popup UI

- Added Support Files section.
- Improved import information display.
- Improved popup readability and layout.
- Improved visibility of imported resources.

#### Code Organization

- Extracted Import Info rendering logic.
- Extracted Scan Result rendering logic.
- Added shared active tab lookup helper.
- Moved popup inline styles into CSS classes.
- Improved popup code consistency and maintainability.

### Refactored

- Simplified popup rendering workflow.
- Reduced duplicated rendering code.
- Reduced duplicated tab lookup logic.
- Improved separation between UI rendering and event handling.

### Foundation Work

- Established Support File Repository architecture.
- Prepared infrastructure for future Excel-driven file uploads.
- Prepared infrastructure for automatic file attachment support.

---

## v1.5.0 - Multi Test Case Support

### Added

#### Test Case Management

- Added persistent test case storage using Chrome Storage.
- Added saved test case list in popup.
- Added Load button for loading saved test cases.
- Added Delete button for removing saved test cases.
- Added support for managing multiple saved test cases.
- Added loaded test case information display.

#### Multi File Import

- Added support for importing multiple Excel files simultaneously.
- Automatically creates and stores test cases from imported files.
- Refreshes test case list automatically after import.

#### Workflow Improvements

- Separated Excel import from form filling.
- Added dedicated Fill Form button.
- Added ability to reuse previously imported test cases without re-importing files.

### Improved

- Reduced repetitive Excel imports during QA testing.
- Improved test case reusability.
- Improved popup workflow and usability.
- Improved visibility of currently loaded test cases.

### Refactored

- Introduced storage layer abstraction (`storage.js`).
- Added test case storage APIs.
- Added active test case loading workflow.
- Refactored import process to support future test case management features.

### Fixed

- Improved popup state management after imports.
- Improved handling of imported test case information.
- Improved test case persistence across popup sessions.

---

# v1.4.0 - Test Case Storage Foundation

## Features

### Import / Fill Separation

- Split the previous Import workflow into two independent actions:
  - Import Excel
  - Fill Form
- Imported Excel files are now loaded into memory before form filling.
- Added a dedicated Fill Form button.

### Test Case Storage

- Added persistent test case storage using Chrome Storage.
- Imported Excel files are now automatically saved as test cases.
- Added storage APIs for saving and retrieving test cases.
- Established the foundation for future multiple test case management.

### Import Information

- Added loaded file display in popup.
- Added row count display for imported Excel data.
- Improved visibility of currently loaded test cases.

## Improvements

- Improved architecture by separating file processing from form filling.
- Simplified future implementation of:
  - Multiple test cases
  - Saved test case management
  - Folder import
  - Test case libraries

## Refactoring

- Added storage.js module.
- Added STORAGE_KEYS configuration constants.
- Deprecated direct Excel-to-form workflow.
- Refactored import flow to support future storage-based operations.

## Known Issues

- Test case selection UI is under development.
- Stored test cases are currently accessible through storage APIs only.
- Folder import and multi-file import are planned for future releases.

---

## v1.3.1 - Import Workflow Refactoring

### Improvements

- Split Excel import and form filling into separate actions.
- Added dedicated `Fill Form` button.
- Added in-memory storage for imported Excel data.
- Added loaded file information display in popup.
- Added validation to prevent filling before a file is loaded.

### Refactoring

- Decoupled Excel loading from form filling workflow.
- Introduced `FILL_FORM` action for future test case management features.
- Prepared application architecture for multiple test case support.

### Known Issues

- Excel parsing in popup currently requires SheetJS (`xlsx.full.min.js`) to be loaded in popup context.

---

# v1.3.0 - Import Validation & Usability Improvements

## New Features

### Custom Export File Names

- Added support for custom Excel file names during export.
- Users can now specify a file name before saving exported data.

### Import File Tracking

- Added display of the most recently imported Excel file.
- Last imported file name is retained to assist with troubleshooting and validation.

### Excel Structure Validation

- Added structure validation during Excel import.
- Detects mismatches between the imported Excel template and the current APWMS form structure.
- Added field mapping mismatch reporting to help identify compatibility issues after APWMS form updates.

---

## v1.2.2

### Improvements

- Standardized import/export logging format
- Added structured logging for import, export, repeat section handling and field filling
- Improved warning and error message consistency
- Centralized debug configuration in constants.js
- Added configurable debug flags:
  - DEBUG.REPEAT
  - DEBUG.LABELS
  - DEBUG.HIGHLIGHT
  - DEBUG.KEYWORDS

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