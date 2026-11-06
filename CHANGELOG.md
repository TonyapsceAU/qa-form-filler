# Changelog

All notable changes to this project will be documented in this file.

# Changelog

## v1.9.4 - Navigation Engine Refactoring

### Improved

#### Navigation Engine

- Improved navigation discovery workflow.
- Improved support for multiple APWMS navigation structures.
- Improved page discovery architecture.
- Improved separation between navigation detection and page extraction.
- Improved navigation debugging and diagnostics.

#### Compatibility

- Improved handling of different APWMS form layouts.
- Reduced dependence on a single navigation implementation.
- Improved resilience against navigation structure variations.

---

### Refactored

#### Navigation Architecture

- Added `getNavigationInfo()`.
- Refactored `waitForNavigation()` to focus on navigation readiness detection.
- Moved page filtering logic into `getAllPages()`.
- Separated navigation detection from page discovery responsibilities.
- Simplified future support for additional navigation structures.

#### Code Organization

- Improved navigation module maintainability.
- Reduced coupling between navigation-related functions.
- Improved extensibility for future page navigation features.

---

### Foundation Work

- Prepared infrastructure for Export All Pages.
- Prepared infrastructure for page-aware Excel exports.
- Prepared infrastructure for workbook-per-form exports.
- Prepared infrastructure for future multi-page form automation.

---

## v1.9.3 - Next Page Navigation

### Added

#### Navigation Engine

- Added Next Page navigation support.
- Added automatic Next button discovery.
- Added automatic page transition handling.
- Added page render synchronization workflow.
- Added navigation logging for page transitions.

#### Navigation APIs

- Added `findNextButton()`.
- Added `clickNextPage()`.

---

### Improved

#### Navigation Engine

- Extended Navigation Engine capabilities beyond menu-based navigation.
- Improved support for sequential page traversal.
- Improved preparation for multi-page workflows.
- Improved navigation reliability during form automation.

#### Form Filling

- Prepared infrastructure for automatic page progression.
- Improved foundation for future multi-page form filling.
- Improved groundwork for automatic page sequencing.

---

### Refactored

#### Navigation Workflow

- Separated page opening and page progression workflows.
- Improved navigation code organization.
- Improved maintainability of navigation-related features.

---

### Foundation Work

- Prepared support for Export All Pages.
- Prepared support for Fill All Pages.
- Prepared support for automatic page sequencing.
- Expanded Multi-Page Form Automation infrastructure.

---

## v1.9.2 - Multi-Structure Navigation Support

### Added

#### Navigation Compatibility

- Added support for multiple APWMS navigation structures.
- Added navigation structure detection.
- Added support for navigation discovery across different form layouts.
- Added support for page discovery using alternative navigation implementations.

#### Navigation Diagnostics

- Added additional navigation logging.
- Added navigation structure detection logs.
- Improved troubleshooting information during page discovery.

---

### Improved

#### Navigation Engine

- Improved navigation discovery reliability.
- Improved page detection across APWMS forms.
- Improved compatibility with different navigation layouts.
- Reduced dependence on a single navigation container structure.
- Improved resilience against APWMS UI implementation differences.

#### Form Filling

- Improved navigation initialization during form filling.
- Improved preparation for future page-aware filling workflows.
- Improved groundwork for automatic page switching.

---

### Refactored

#### Navigation Architecture

- Refactored navigation discovery workflow.
- Simplified support for additional navigation structures.
- Improved extensibility of navigation-related functions.
- Improved separation between navigation discovery and page processing.

---

### Foundation Work

- Expanded Navigation Engine compatibility coverage.
- Prepared support for automatic page sequencing.
- Prepared support for Next-page navigation workflows.
- Prepared support for future multi-page export and import functionality.

---

### Improved

#### Form Filling

- Added Navigation initialization during form filling.
- Improved architecture for future multi-page form support.
- Improved separation between navigation and form-filling logic.

#### Compatibility

- Added support for multiple APWMS navigation structures.
- Improved resilience against APWMS UI variations.
- Reduced dependence on a single navigation implementation.

---

### Refactored

#### Navigation Architecture

- Centralized navigation logic.
- Added reusable navigation functions.
- Improved extensibility for future page automation features.

---

### Foundation Work

- Established infrastructure for multi-page form automation.
- Prepared support for page-aware exports.
- Prepared support for page-aware imports.
- Prepared support for automatic page switching.
- Prepared support for full-form automation across multiple pages.

---

## v1.9.1 - User Manual & Documentation

### Added

#### User Manual

- Added USER_MANUAL.md.
- Added installation guide.
- Added data sheet creation guide.
- Added support document workflow guide.
- Added file import guide.
- Added form filling guide.
- Added troubleshooting and developer tools guide.
- Added recommended usage workflow.

---

### Improved

#### Documentation

- Improved project documentation structure.
- Added documentation link to README.
- Improved onboarding experience for new users.
- Improved explanations for Support File workflows.
- Improved guidance for document upload features.

---

### Documentation Coverage

The User Manual now covers:

- Installation
- Creating Data Sheets
- Document Upload Fields
- Importing Files
- Support File Management
- Filling Forms
- Scan Form
- Highlight Mode
- Troubleshooting

---

## v1.9.0 - Multi-Page Form Automation Foundation

### Added

#### Navigation Engine

- Added Form Navigation detection.
- Added Navigation discovery workflow.
- Added support for locating form navigation containers.
- Added support for retrieving available form pages.
- Added page metadata extraction:
  - Part Name
  - Page Title
  - Navigation Button
- Added page opening by page title.
- Added Navigation logging.

#### Navigation APIs

- Added `waitForNavigation()`.
- Added `getAllPages()`.
- Added `openPage(title)`.
- Added `menuNavigation()`.

---

### Improved

#### Form Filling

- Added Navigation initialization before form filling.
- Prepared Fill Form workflow for future multi-page form support.
- Improved separation between navigation and field-filling logic.
- Improved architecture for future page-aware imports.

#### Logging

- Added `[NAVIGATION]` logging category.
- Improved navigation diagnostics.
- Improved debugging visibility for page discovery and page opening actions.

---

### Refactored

#### Navigation Architecture

- Centralized navigation discovery logic.
- Extracted navigation waiting logic into reusable functions.
- Simplified future implementation of:
  - Export All Pages
  - Fill All Pages
  - Page-aware Excel Imports
  - Automatic Page Switching

---

### Foundation Work

- Established Multi-Page Form Automation architecture.
- Established Navigation Engine for APWMS forms.
- Prepared infrastructure for page-aware Excel exports.
- Prepared infrastructure for automatic cross-page form filling.
- Prepared infrastructure for page sequencing and navigation workflows.

---

## v1.8.0 - Workflow & User Experience Improvements

### Added

#### Support File Management

- Added Support File Preview functionality.
- Support files can now be opened directly in a browser tab without downloading.
- Added quick preview access from the Support Files list.
- Added popup console logging for Support File operations:
  - Import
  - Preview
  - Delete
  - Retrieval

#### Popup Logging

- Added popup-side logging for Test Case operations.
- Added popup-side logging for Support File operations.
- Added storage operation logging to improve troubleshooting and diagnostics.
- Standardized popup log message format.

---

### Improved

#### User Experience

- Improved Support File workflow by replacing the **Load** button with **Preview**.
- Reduced unnecessary user actions during support file management.
- Simplified document verification before form filling.
- Improved overall popup usability and workflow consistency.

#### Import Workflow

- Removed Excel-only file picker restrictions.
- Import dialog now supports selecting all file types directly.
- Reduced user interaction required when importing support documents.
- Improved mixed file import experience for Excel and support files.

#### Form Filling

- Optimized file upload handling during form filling.
- Improved support file lookup performance.
- Improved support file reconstruction workflow.
- Improved upload reliability for APWMS file upload fields.
- Reduced unnecessary processing during file upload operations.

---

### Refactored

#### Support File Workflow

- Simplified Support File management workflow.
- Removed obsolete manual support file loading workflow.
- Refactored support file actions around:
  - Preview
  - Reuse
  - Automatic Upload

#### Logging

- Centralized popup logging structure.
- Improved readability of popup console messages.
- Improved troubleshooting support for future feature development.

---

### Fixed

#### Import Experience

- Fixed file picker defaulting to Excel-only file filters.
- Fixed additional user steps required to locate support documents.

#### File Upload

- Improved support file handling during automatic uploads.
- Improved reliability of support file processing during form filling.
- Fixed several edge cases discovered while testing automatic document uploads.

---

## v1.7.1 - Preview Document

### Improved

#### Support File Management

- Replaced Support File "Load" button with "Preview".
- Support files can now be opened directly in a browser tab.
- Simplified support file workflow now that automatic document upload is supported.

---

## v1.7.0 - Automatic Document Upload

### Added

#### Automatic Document Upload

- Added automatic APWMS file upload support.
- Added Excel-driven document attachment workflow.
- Added support for populating APWMS file upload fields using imported support files.
- Added React upload bridge for APWMS file upload components.
- Added support for reconstructing and uploading stored support files.
- Added automatic document upload during form filling.

#### Support File Storage

- Added binary file buffer persistence.
- Added support for restoring original file content from storage.
- Added file reconstruction using stored binary data.
- Added support for reusing uploaded support documents across test cases.

---

### Improved

#### Form Filling

- Extended Fill Form workflow to support file upload fields.
- Improved compatibility with APWMS React-based upload controls.
- Improved support file lookup during form filling.
- Improved automatic attachment handling within imported test cases.

#### Support File Management

- Improved support file persistence reliability.
- Improved support file reconstruction process.
- Improved file import workflow for non-Excel documents.
- Improved upload debugging and diagnostic logging.

---

### Fixed

#### File Upload

- Fixed support files being reconstructed as empty files.
- Fixed binary file content not being saved to Chrome Storage.
- Fixed uploaded files losing content during storage and retrieval.
- Fixed support file reconstruction creating files with `size = 0`.
- Fixed APWMS upload failures caused by missing file content.
- Fixed support file retrieval from local storage.

#### APWMS Compatibility

- Fixed integration with APWMS React file upload controls.
- Fixed file upload workflow for React-managed inputs.
- Fixed automatic attachment submission to APWMS upload endpoints.

---

### Technical Changes

- Added Page Bridge architecture for React upload handling.
- Added Content Script ↔ Page Context communication for file uploads.
- Added support for passing binary file data across execution contexts.
- Refactored upload workflow to support APWMS React upload components.
- Refactored support file storage to preserve complete file contents.

---

## v1.6.1 

### Added

#### Support File Management

- Added support for importing non-Excel files.
- Added support file storage using Chrome Storage.
- Added support file listing in popup.
- Added support file deletion.
- Added file reconstruction from stored buffers.
- Added foundation for future automatic file upload support.

---

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