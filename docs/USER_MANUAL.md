# QA Form Filler User Manual

## 1. Installation

### Install QA Form Filler

1. Download the release ZIP package from [QA Form Filler Releases](https://github.com/TonyapsceAU/qa-form-filler/releases).
2. Extract the ZIP file.
3. Open [Chrome Extensions](chrome://extensions/).
4. Enable **Developer mode**.
5. Click **Load unpacked**.
6. Select the extracted QA Form Filler folder.
7. Pin QA Form Filler to the browser toolbar for easier access.
![Installation_extention Screenshot](docs\USER_MANUAL_img\Installation_extention.png)
![Installation_Pin_Icon Screenshot](docs\USER_MANUAL_img\Installation_Pin_Icon.png)
---

## 2. Create a Data Sheet

### Prepare Form Data

1. Open the target APWMS form.
2. Fill sample values into all required fields.

> Document upload fields cannot be exported automatically and must be entered manually later.

3. Click **Export Excel**.
4. Save the exported Excel file, excel would be save to download.
![Export_button Screenshot](docs\USER_MANUAL_img\Export_button.png)
![export Screenshot](docs\screenshot-export.png)

### Documents

For document upload:

1. Locate the corresponding document field in the exported Excel file.
2. Input the document file name.

> File names must match the uploaded Support File exactly, including the file extension.

Example:
![document_upload Screenshot](docs\USER_MANUAL_img\document_upload.png)

---

## 3. Import Files

### Import Test Cases

1. Click **Import Files**.
2. Select one or more files.
3. QA Form Filler will automatically identify:
   - Excel files as Test Cases
   - Other files as Support Files
![Import_Files Screenshot](docs\USER_MANUAL_img\Import_Files.png)

### Storage Limit

Support Files are stored locally in the browser.

Current storage limit:

```
10 MB
```

If storage becomes full:

- Delete unused Support Files.
- Re-import required files.

### Updating Test Cases

If the Excel file has changed:

1. Delete the existing Test Case.
2. Import the updated Excel file again.

### Support Files

Support Files can only be automatically uploaded when:

1. The file name is entered in the Excel Data Sheet.
2. The file has been imported into QA Form Filler.

Example:
![Support_Doc Screenshot](docs\USER_MANUAL_img\Support_Doc.png)

### Preview Support Files

Imported Support Files can be previewed directly from the popup by clicking:

```
Preview
```

---

## 4. Fill Form

### Run Automatic Form Filling

1. Open the target APWMS form.
2. Click **Load** on the desired Test Case.
3. Click **Fill Form**.

QA Form Filler will automatically:

- Synchronize repeat sections
- Fill imported form values
- Upload referenced support documents
- Populate supported file upload fields

> Manual page switching is not required.

![Fill_form Screenshot](docs\USER_MANUAL_img\Fill_form.png)
---

## 5. Troubleshooting & Developer Tools

### Scan Form

Displays detected form fields and their labels.

Useful for:

- Verifying form detection
- Debugging label matching

### Highlight

Displays field indexes directly on the form.

Useful for:

- Identifying Excel-to-form mappings
- Verifying field locations
- Troubleshooting incorrect field matching

![HighLigh Screenshot](docs\USER_MANUAL_img\HighLigh.png)

### Clear Highlight

Removes all highlight markers from the form.

---

## Common Issues

### Support File Not Uploaded

Verify:

- File name in Excel matches exactly
- Support File was imported successfully
- File extension is included

Example:

✅

```
CV.pdf
```

❌

```
CV
```

### Storage Full

If import fails with a storage-related warning:

1. Delete unused Support Files.
2. Re-import the required file.

### Test Case Not Updated

If form data does not match the latest Excel file:

1. Delete the saved Test Case.
2. Import the updated Excel file again.

---

## Recommended Workflow

1. Export a Data Sheet.
2. Fill the Excel file.
3. Enter Support File names into document fields.
4. Import the Excel file.
5. Import Support Files.
6. Load the Test Case.
7. Click Fill Form.
8. Review results.