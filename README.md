# QA Form Filler

Chrome extension for exporting APWMS forms, managing Excel-based test cases, supporting documents, and automatically filling forms.

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
- View imported support files
- Reconstruct files from storage
- Foundation for automatic file uploads

### User Experience

- Import progress indicator
- Import file tracking
- Loaded test case display
- Custom export file names

## Installation

1. Download the release package.
2. Open Chrome Extensions.
3. Enable Developer Mode.
4. Click **Load unpacked**.
5. Select the extension folder.

## Usage

### Export

1. Open an APWMS form.
2. Click **Export Excel**.
3. Enter an export file name.
4. Save the generated Excel file.

![Export Screenshot](docs/screenshot-export.png)

### Import

1. Open an APWMS form.
2. Click **Import Files**.
3. Select one or more files.
4. QA Form Filler will automatically identify:
   - Excel files as Test Cases
   - Other files as Support Files
5. Imported resources will be saved for future use.

### Support Files

Imported support files appear in the Support Files section and are stored locally for future automated upload workflows.

### Manage Test Cases

After importing files, saved test cases can be managed directly from the popup.

Available actions:

- **Load** - Load a saved test case into memory.
- **Delete** - Remove a saved test case from storage.
- **Fill Form** - Populate the current APWMS form using the loaded test case.

### Fill Form

1. Import or load a test case.
2. Click **Fill Form**.
3. The extension will populate the APWMS form using the loaded data.
4. Repeat sections are automatically synchronized before filling.

![Import Screenshot](docs/screenshot-import.png)


## Changelog

See [CHANGELOG.md](CHANGELOG.md).