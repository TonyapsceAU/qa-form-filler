# QA Form Filler

Chrome extension for scanning, highlighting, exporting, and importing web form data through Excel.

Designed to simplify QA testing and data entry for complex dynamic forms, including APWMS forms with conditional and dynamically rendered fields.

---

# Features

- Scan form fields
- Highlight form inputs with field indexes
- Clear highlight mode
- Export form data to Excel
- Import Excel data back into forms
- Support dynamic and hidden fields
- Multi-pass auto filling
- Support:
  - Text inputs
  - Textareas
  - Checkboxes
  - Radio buttons
  - ContentEditable fields
- Skip file upload fields safely
- Compatible with APWMS dynamic React forms

---

# Installation

1. Open Chrome.
2. Navigate to:

   ```
   chrome://extensions
   ```

3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the un-ziped extension folder.
6. The QA Form Filler extension should now appear in Chrome.

---

# Usage

## Scan Form

Click **Scan Form** to inspect all available form fields on the page.

---

## Highlight Mode

Click **Highlight Mode** to display indexed markers beside fields.

Example:

```text
[0] Title
[1] Project Name
[2] Focus Area
...
```

These indexes are used internally for Excel Export and Import.

---

## Clear Highlight

Click **Clear Highlight** to remove field markers and visual highlighting.

---

## Export Excel

Click **Export Excel** to generate a spreadsheet containing all detected fields.

Exported columns include:

```text
No
Section
Group
Field
Value
Field ID
Field Name
Type
```

---

## Import Excel

1. Export an Excel template.
2. Modify the Value column.
3. Click **Import Excel**.
4. Select the modified spreadsheet.

The extension will automatically:

- Fill visible fields
- Expand dynamic fields
- Fill newly revealed fields
- Repeat until all fields have been processed

---

# Excel Format

The exported workbook uses the following structure:

```text
No | Section | Group | Field | Value
```

Example:

```text
15 | Project Field | Primary | Subject Area | Information Technology
16 | Project Field | Primary | Field Area   | Computer Science
17 | Project Field | Primary | Code         | E1201
```

Only the **Value** column should normally be modified.

The **No** column is used internally to map Excel rows back to form fields.

---

# Known Limitations

### File Upload Fields

Due to browser security restrictions:

```html
<input type="file">
```

cannot be filled programmatically.

These fields are exported but skipped during import.

---

### Dynamic Forms

Forms that reveal additional fields based on previous selections may require multiple import passes.

The importer automatically performs extra passes to handle:

- Hidden fields
- Conditional sections
- Dynamically rendered components

---

### React / AntD Components

Some React-controlled inputs may rerender after values are populated.

Additional synchronization passes are performed to ensure values are retained after rerendering.

---

### Index-Based Mapping

The importer currently uses field indexes generated during export.

Significant structural changes to the form between export and import may affect field mapping.

---

# Changelog

## v1.0.0

Initial working release.

### Added

- Form scanning
- Highlight mode
- Clear highlight mode
- Excel export
- Excel import
- Dynamic field support
- Multi-pass auto fill
- Checkbox support
- Radio button support
- ContentEditable support
- APWMS compatibility

### Notes

This release successfully supports the complete workflow:

```text
Form
 ↓
Export Excel
 ↓
Edit Excel
 ↓
Import Excel
 ↓
Auto-fill Dynamic Form
```

The tool has been validated against APWMS forms containing hidden fields, conditional rendering, and React-based components.