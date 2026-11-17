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
                inputType: fieldElement.type || "",
                fieldElement
            });
        });
    console.log("Fields Collected:",formData.length);
    console.groupEnd();
    return formData;
}

async function exportAllToExcel(){
    console.group("[EXPORT] Started");
    const menuButton = findMenuButton();
    if(menuButton){//menu button only apper outside
        if(DEBUG.EXPORT){console.log(menuButton);}
        await clickMenuButton();//navigate to main manue
    }
    const pages = getAllPages(getNavigationInfo());

    // go to first page
    console.log("[EXPORT]","Pages:",pages);
    await openPage(pages[0].title);
    await waitForPageRender();
    //export
    if(DEBUG.EXPORT){console.log(collectFormData().length);}
    const pageData = [];
    const workbook = XLSX.utils.book_new();
    for(let index = 0; index < pages.length; index++){
        const page = pages[index];
        const formData = collectFormData();
        pageData.push({
            part: String(index),
            title: page.title,
            formData: formData
        });
        // getSheetName(page,0);
        const worksheet = XLSX.utils.json_to_sheet(createExportRows(formData));
        console.log("[EXPORT]","Sheet Name:",index);
        XLSX.utils.book_append_sheet(workbook,worksheet,String(index));
        console.log("[EXPORT]",index,page.title,"Fields:",pageData.at(-1).formData.length);
        if(index < pages.length - 1){
            const nextPageOpened = await clickNextPage();
            if (!nextPageOpened){
                throw new Error(`Unable to continue from page "${page.title}" during export.`);
            }
            await confirmPageChange();
            await waitForPageRender();
        }
    }
    if (!workbook.Workbook) {
        workbook.Workbook = {};
    }
    if (!workbook.Workbook.Views) {
        workbook.Workbook.Views = [{}];
    }
    workbook.Workbook.Views[0] = {xSplit: 4,ySplit: 1};
    // console.log("Rows:",exportRows.length);
    
    console.log("[EXPORT] Saving Workbook");
    const defaultFileName = `QA_${new Date().toISOString().slice(0,10)}`;
    const inputFileName = prompt("Enter file name:",defaultFileName);
    if (!inputFileName){
        return;
    }
    const fileName = inputFileName.endsWith(".xlsx")? inputFileName: `${inputFileName}.xlsx`;
    XLSX.writeFile(workbook,fileName);
    console.log("[EXPORT] Complete");
    console.groupEnd();
}

function getSheetName(page, index){
    console.log(page.part);
    return (
        page.part ||
        `Page ${index + 1}`
    )
        .replace(/[\\/*?:[\]]/g,"")
        .substring(0,31);
}

function exportToExcel(){
    console.group("[EXPORT] Started");
    const formData = collectFormData();
    console.log("Fields Found:",formData.length);
    console.log("[EXPORT] Processing Repeat Sections");
    const exportRows = createExportRows(formData);
    const repeatSummary = {};
    exportRows.forEach(row => {
        const repeatGroup = row[EXPORT_COLUMNS.REPEAT_GROUP];
        if (!repeatGroup){
            return;
        }
        const repeatKey = JSON.stringify([
            row[EXPORT_COLUMNS.REPEAT_SECTION] || "",
            repeatGroup
        ]);
        repeatSummary[repeatKey] = Math.max(repeatSummary[repeatKey] || 0,
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
        { width: 20 },  // repeatSection
        { width: 7 },  // repeatIndex
        { width: 10 },   // Field
        { width: 30 },   // Value
        { width: 30 },   // Field ID
        { width: 10 },   // Field Name
        { width: 12 },   // Type
        { width: 14 }    // Input Type
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
    console.log("[EXPORT] Complete");
    console.groupEnd();
}

function createExportRows(formData){
    return formData.map(fieldData => {
        const repeatInfo = getKeywordRepeatInfo(fieldData);

        return {
            [EXPORT_COLUMNS.NO]:fieldData.questionNo,
            [EXPORT_COLUMNS.SECTION]:fieldData.section,
            [EXPORT_COLUMNS.GROUP]:fieldData.group,
            [EXPORT_COLUMNS.REPEAT_GROUP]:repeatInfo.repeatGroup || "",
            [EXPORT_COLUMNS.REPEAT_SECTION]:repeatInfo.repeatSection || "",
            [EXPORT_COLUMNS.REPEAT_INDEX]:repeatInfo.repeatIndex || "",
            [EXPORT_COLUMNS.FIELD]:fieldData.field,
            [EXPORT_COLUMNS.VALUE]:fieldData.value,
            [EXPORT_COLUMNS.FIELD_ID]:fieldData.fieldId,
            [EXPORT_COLUMNS.FIELD_NAME]:fieldData.fieldName,
            [EXPORT_COLUMNS.TYPE]:fieldData.fieldType,
            [EXPORT_COLUMNS.INPUT_TYPE]:fieldData.inputType
        };
    });
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
