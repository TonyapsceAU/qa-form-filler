function collectFormData() {
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
                fieldType: fieldElement.tagName
            });
        });

    return formData;
}

function exportToExcel(){
    const formData = collectFormData();
    const exportRows = formData.map(fieldData => {
        const repeatInfo = getRepeatInfo(fieldData.fieldName);
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

    XLSX.writeFile(
        workbook,
        `QA_Export_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
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
