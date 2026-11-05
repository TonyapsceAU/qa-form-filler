# QA Form Filler

Chrome extension for exporting APWMS forms, managing Excel-based test cases, support documents, and automatically filling forms.

![Main Screenshot](docs/screenshot-main.png)

## Features

### Form Automation

- Export form data to Excel
- Import form data from Excel
- Fill forms from imported Excel data
- Excel structure validation
- Import and fill workflows separated for better control

### Repeat Section Support

- Automatic repeat section expansion
- Automatic repeat section cleanup
- Keyword section support

### Test Case Management

- Save imported Excel files as test cases
- Persistent test case storage
- Load saved test cases
- Delete saved test cases
- Multi-file Excel import
- Reuse imported data without re-importing
- Manage multiple test cases directly from the extension popup

### Support File Management

- Import PDF and supporting documents
- Persistent support file storage
- Preview support files directly from the popup
- Delete saved support files
- Reconstruct files from storage
- Store binary file content in local storage
- Automatic APWMS document upload
- Excel-driven support file attachment
- Upload support files directly into APWMS file-upload fields

### User Experience

- Import progress indicator
- Import file tracking
- Loaded test case display
- Custom export file names
- Support file preview
- Popup console logging
- Improved import experience
- Optimized form filling workflow

---

## Installation

1. Download the release package.
2. Open Chrome Extensions.
3. Enable Developer Mode.
4. Click **Load unpacked**.
5. Select the extension folder.

---

## Usage

### Export

1. Open an APWMS form.
2. Click **Export Excel**.
3. Enter an export file name.
4. Save the generated Excel file.

![Export Screenshot](docs/screenshot-export.png)

---

### Import

1. Open an APWMS form.
2. Click **Import Files**.
3. Select one or more Excel files and/or support documents.
4. QA Form Filler will automatically identify:
   - Excel files as Test Cases
   - Other files as Support Files
5. Imported resources will be saved for future use.

---

### Support Files

Imported support files appear in the Support Files section and are stored locally for future automated upload workflows.

Supported workflows:

- Import PDF and supporting documents
- Store files locally in Chrome storage
- Reuse support files across multiple test cases
- Reference support files directly from Excel
- Automatically upload matching documents into APWMS file-upload fields during form filling

Example:

| Excel Value | Result |
|------------|---------|
| `CV.pdf` | Uploads `CV.pdf` from Support File storage |
| `Proposal.pdf` | Uploads `Proposal.pdf` from Support File storage |

---

### Manage Test Cases

After importing files, saved test cases can be managed directly from the popup.

Available actions:

- **Load** - Load a saved test case into memory
- **Delete** - Remove a saved test case from storage
- **Fill Form** - Populate the current APWMS form using the loaded test case

---

### Fill Form

1. Import or load a test case.
2. Import any required support documents.
3. Click **Fill Form**.
4. The extension will:
   - Synchronize repeat sections
   - Populate standard form fields
   - Automatically upload referenced support documents
   - Populate APWMS file-upload fields
5. Review the generated form and submit as needed.

![Import Screenshot](docs/screenshot-import.png)

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

### Version 1.7.0

#### Added

- Automatic APWMS document upload
- Excel-driven support file attachment
- Binary support file storage
- Support file reconstruction from stored binary data
- React upload bridge for APWMS file-upload controls
- Support file
#### Improved

- Test case management workflow
- Support file management workflow
- Import status reporting
- Upload debugging and diagnostics

#### Fixed

- Support file content loss during storage
- Empty file reconstruction issue
- APWMS upload integration issues
- React file-upload compatibility issues
- Support file retrieval and rebuild process