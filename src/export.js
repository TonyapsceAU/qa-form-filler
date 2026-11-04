function collectFormData() {
    console.group("[EXPORT] Collect Form Data");
    const formData = [];
    getIndexedFields()
        .forEach((fieldElement,index) => {
            formData.push({
                questionNo: index,
                section: getGroupLabel(fieldElement),
                group: getSubGroupLabel(fieldElement),
                field: getFieldLabel(fieldElement),
                value: getFieldValue(fieldElement),
                fieldId: fieldElement.id || "",
                fieldName: fieldElement.name || "",
                fieldType: fieldElement.tagName,
                fieldElement
            });
        });
    console.log("Fields Collected:",formData.length);
    console.groupEnd();
    return formData;
}

function exportToExcel(){
    console.group("[EXPORT] Started");
    const formData = collectFormData();
    console.log("Fields Found:",formData.length);
    console.log("[EXPORT] Processing Repeat Sections");
    const exportRows = formData.map(fieldData => {
        let repeatInfo = getRepeatInfo(fieldData.fieldName);
        if (!repeatInfo.repeatGroup){
            repeatInfo = getKeywordRepeatInfo(fieldData.fieldElement);
        }
        return {
            [EXPORT_COLUMNS.NO]:fieldData.questionNo,
            [EXPORT_COLUMNS.SECTION]:fieldData.section,
            [EXPORT_COLUMNS.GROUP]:fieldData.group,
            [EXPORT_COLUMNS.REPEAT_GROUP]:repeatInfo.repeatGroup || "",
            [EXPORT_COLUMNS.REPEAT_INDEX]:repeatInfo.repeatIndex || "",
            [EXPORT_COLUMNS.FIELD]:fieldData.field,
            [EXPORT_COLUMNS.VALUE]:fieldData.value,
            [EXPORT_COLUMNS.FIELD_ID]:fieldData.fieldId,
            [EXPORT_COLUMNS.FIELD_NAME]:fieldData.fieldName,
            [EXPORT_COLUMNS.TYPE]:fieldData.fieldType
        };
    });
    const repeatSummary = {};
    exportRows.forEach(row => {
        const repeatGroup = row[EXPORT_COLUMNS.REPEAT_GROUP];
        if (!repeatGroup){
            return;
        }
        repeatSummary[repeatGroup] = Math.max(repeatSummary[repeatGroup] || 0,
            Number(row[EXPORT_COLUMNS.REPEAT_INDEX]));
    });
    console.log("Repeat Groups:",repeatSummary);
    console.log("[EXPORT] Generating Worksheet");
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    // Initial column widths
    worksheet["!cols"] = [
        { width: 8 },    // No
        { width: 10 },   // section
        { width: 10 },   // Group
        { width: 10 },  // repeatGroup
        { width: 7 },  // repeatIndex
        { width: 10 },   // Field
        { width: 30 },   // Value
        { width: 30 },   // Field ID
        { width: 10 },   // Field Name
        { width: 12 }    // Type
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, EXPORT_SHEET_NAME);

    if (!workbook.Workbook) {
        workbook.Workbook = {};
    }

    if (!workbook.Workbook.Views) {
        workbook.Workbook.Views = [{}];
    }

    workbook.Workbook.Views[0] = {xSplit: 4,ySplit: 1};
    console.log("Rows:",exportRows.length);
    
    console.log("[EXPORT] Saving Workbook");
    const defaultFileName = `QA_${new Date().toISOString().slice(0,10)}`;
    const inputFileName = prompt("Enter file name:",defaultFileName);
    if (!inputFileName){
        return;
    }
    const fileName = inputFileName.endsWith(".xlsx")? inputFileName: `${inputFileName}.xlsx`;
    XLSX.writeFile(workbook,fileName);
    // const excelBuffer = XLSX.write(workbook,{bookType: "xlsx",type: "array"});
    // const blob = new Blob(
    //     [excelBuffer],
    //     {type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
    // );
    // const url = URL.createObjectURL(blob);
    // chrome.downloads.download({url,filename: fileName,saveAs: true});
    console.log("[EXPORT] Complete");
    console.groupEnd();
}

//unused
function generateScanReport(){
    const fieldElements =
        document.querySelectorAll(
            'input, textarea, select, [contenteditable="true"]'
        );

    let reportText = "";
    fieldElements.forEach((fieldElement, index) => {
        reportText +=
`==================================================
Field ${index + 1}
==================================================`;
        const elementData = extractElementData(fieldElement);
        for (const [key, value] of Object.entries(elementData)){
            reportText += `${key}:${value}`;
        }
        reportText += "\n";
    });
    return reportText;
}

// unused
function downloadReport(){
    const reportText = generateScanReport();
    const blob = new Blob([reportText],{ type: "text/plain" });
    const objectUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = objectUrl;
    downloadLink.download = "scan-report.txt";
    downloadLink.click();
    URL.revokeObjectURL(objectUrl);
}
