console.log("QA Form Filler Loaded");
const ACTIONS = {
    SCAN_FORM: "scanForm",
    HIGHLIGHT_FORM: "highlightForm",
    EXPORT_EXCEL: "exportExcel",
    IMPORT_EXCEL: "importExcel",
    CLEAR_HIGHLIGHT: "clearHighlight"
};
chrome.runtime.onMessage.addListener(
    (request,sender,sendResponse) => {
        if (request.action === ACTIONS.SCAN_FORM){
            sendResponse(scanForm());
        }
        if (request.action === ACTIONS.HIGHLIGHT_FORM){
            enableHighlightMode();
            sendResponse({success: true});
        }
        if (request.action === ACTIONS.EXPORT_EXCEL){
            exportToExcel();
            sendResponse({success: true});
        }
        if (request.action === ACTIONS.IMPORT_EXCEL){
            importExcel(request.buffer);
            sendResponse({success: true});
        }
        if (request.action === ACTIONS.CLEAR_HIGHLIGHT){
            disableHighlightMode();
            sendResponse({success: true});
        }
    }
);

function scanForm(){
    const fieldInfos = [];
    document
        .querySelectorAll('input[type="text"]')
        .forEach(fieldElement => {
            console.log(fieldElement);
            fieldInfos.push(createFieldInfo(fieldElement,fieldInfos.length + 1));
        });
    return fieldInfos;
}

function createFieldInfo(fieldElement, fieldId){
    return {
        fieldId,
        tagName: fieldElement.tagName,
        attributes: getAttributes(fieldElement),
        computed: {
            hidden: isHidden(fieldElement),
            value: getFieldValue(fieldElement)
        },
        parentHtml:fieldElement.parentElement?.outerHTML.substring(0, 500)
    };
}

function getAttributes(fieldElement){
    const attributes = {};
    for (const attribute of fieldElement.attributes){
        attributes[attribute.name] = attribute.value;
    }
    return attributes;
}

function isHidden(fieldElement){
    const style = window.getComputedStyle(fieldElement);
    return (
        fieldElement.type === "hidden" ||
        style.display === "none" ||
        style.visibility === "hidden"
    );
}


function getFieldValue(fieldElement){
    if (fieldElement.type === "radio"){
        return fieldElement.checked;
    }

    if (fieldElement.type === "checkbox"){
        return fieldElement.checked;
    }

    if (fieldElement.getAttribute("contenteditable") === "true"){
        return fieldElement.innerText.trim();
    }

    return fieldElement.value || "";
}

function enableHighlightMode(){ 
    disableHighlightMode();
    const TYPE_COLORS = {
        "INPUT(text)": "#00aa00",
        "INPUT(radio)": "#888800",
        "INPUT(search)": "#00cccc",
        "TEXTAREA": "#0066ff",
        "SELECT": "#ff8800",
        "RICHTEXT": "#cc00cc",
        "INPUT(email)": "#ff00aa"
    };
    
    getIndexedFields()
        .forEach((fieldElement,index) => {
            console.log(`element:${index}`,"QuestionLabel:",getDisplayLabel(fieldElement),"value:",fieldElement.value);
            const elementType = `${fieldElement.tagName}${fieldElement.type ? `(${fieldElement.type})` : ''}`;
            const color = TYPE_COLORS[elementType] || "#cccccc";
            fieldElement.style.outline = `3px solid ${color}`;
            fieldElement.style.backgroundColor = `${color}22`;

            const label = getDisplayLabel(fieldElement);

            const marker = document.createElement("span");
            marker.textContent = `[${index + 1}]`;
            marker.style.background = color;
            marker.style.color = "white";
            marker.style.fontSize = "10px";
            marker.style.padding = "2px 4px";
            marker.style.marginRight = "4px";
            marker.style.borderRadius = "3px";
            marker.style.fontWeight = "bold";
            marker.className = "qa-highlight-marker";
            fieldElement.parentNode?.insertBefore(marker,fieldElement);
            marker.textContent = `[${index}] ${fieldElement.tagName}, ${label}`;
            fieldElement.setAttribute(
                "placeholder",
                `[${index + 1}]`
            );
        });
}

function disableHighlightMode(){
    // Remove markers
    document
        .querySelectorAll(".qa-highlight-marker")
        .forEach(marker => marker.remove());

    // Remove styles
    document
        .querySelectorAll(
            'input, textarea, select, [contenteditable="true"]'
        )
        .forEach(fieldElement => {
            fieldElement.style.outline = "";
            fieldElement.style.backgroundColor = "";
        });
}

function findNearbyLabel(fieldElement){
    let parentElement = fieldElement.parentElement;

    while (parentElement){
        const labelTexts =
            Array
                .from(parentElement.childNodes)
                .filter(
                    node => node.nodeType === Node.TEXT_NODE
                )
                .map(
                    node => node.textContent.trim()
                )
                .filter(
                    text => text.length > 0
                );

        if (labelTexts.length > 0) {
            return texts[0];
        }

        parentElement = parentElement.parentElement;
    }

    return "";
}

function extractElementData(fieldElement){
    const elementData  = {};

    for (const key in fieldElement){
        try{
            const value = fieldElement[key];
            if (value === null || value === undefined ){
                continue;
            }

            if (typeof value === "string" && value.trim() === ""){
                continue;
            }

            if (Array.isArray(value) && value.length === 0){
                continue;
            }

            if (
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean"
            ){
                elementData[key] = value;
            }
        }catch{
            //
        }
    }
    elementData.outerHTML = fieldElement.outerHTML;
    return elementData;
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

function getDisplayLabel(fieldElement){
    return [
        getGroupLabel(fieldElement),
        getSubGroupLabel(fieldElement),
        getFieldLabel(fieldElement)
    ].join(" - ");
}

function getGroupLabel(fieldElement){
    const groupElement  = fieldElement.closest(".webform-main-question");
    if (!groupElement ) {
        return "";
    }

    const labelCandidates  = Array
        .from(groupElement.querySelectorAll("*"))
        .map(element => element.innerText?.trim())
        .filter(Boolean);

    return labelCandidates .find(text => /^[0-9a-zA-Z(). ]+/.test(text) && !text.includes("\n")) || "";
}

function getSubGroupLabel(fieldElement){
    const rowElement = fieldElement.closest(".ant-row");
    if (!rowElement){
        return "";
    }

    const lines =
        rowElement.innerText
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

    return (lines.find(line => !line.startsWith("[")) || "");
}

const APWMS_FIELD_PREFIX = "nsfcJrcApplicationInput";
function getFieldLabel(fieldElement){
    // Radio Button
    if (fieldElement.type === "radio"){
        return (
            fieldElement.closest(".ant-radio-wrapper")
                ?.querySelector(".ant-radio-label")
                ?.innerText
                ?.trim()
            || fieldElement.value
            || ""
        );
    }

    const headerLabel  = getFieldLabelFromHeader(fieldElement);
    if (headerLabel){
        return headerLabel;
    }
    
    const nameLabel = getFieldLabelFromName(fieldElement);
    if (nameLabel){
        return nameLabel;
    }

    // APWMS Business Field
    if (fieldElement.id && fieldElement.id.startsWith(APWMS_FIELD_PREFIX)){
        return beautifyFieldId(fieldElement.id);
    }

    return "";
}

function getFieldLabelFromName(fieldElement){
    const name = fieldElement.name || fieldElement.id || "";
    const field =
        name.split(".")
            .pop()
            .replace(/^\d+_/, "");
    const FIELD_LABEL_MAP = {
        orcid: "ORCID iD",
        surname: "Surname (with title)",
        other_name: "Other Name",
        chinese_name: "Chinese Name (with title)",
        post: "Post",
        org: "Unit / Department / University"
    };

    return (FIELD_LABEL_MAP[field]|| field);
}

function getFieldLabelFromHeader(fieldElement){
    const columnElement = fieldElement.closest(".ant-col");
    if (!columnElement){
        return "";
    }
    const rowElement = columnElement.closest(".ant-row");
    if (!rowElement){
        return "";
    }

    let headerRowElement = rowElement.previousElementSibling;
    while (headerRowElement){
        const headerLabels = 
            [...headerRowElement.querySelectorAll( ".ant-col strong" )]
            .map( x => x.innerText.trim() )
            .filter(Boolean);

        if (headerLabels.length){
            const dataColumns = [...rowElement.querySelectorAll( ".ant-col" )];
            const dataIndex = dataColumns.indexOf(columnElement);
            if (dataIndex > 0){
                return (headerLabels[dataIndex - 1]|| "");
            }
        }
        headerRowElement = headerRowElement.previousElementSibling;
    }
    return "";
}

const PRELIM_PART_PREFIX = "prelim_part1_";
function beautifyFieldId(fieldId){
    return fieldId
        .replace(new RegExp(`^${APWMS_FIELD_PREFIX}`),"")
        .replace(new RegExp(`^${PRELIM_PART_PREFIX}`),"")
        .replaceAll("_"," ")
        .replace(/\b\w/g,character => character.toUpperCase());
}

const EXPORT_COLUMNS = {
    NO: "No",
    SECTION: "Section",
    GROUP: "Group",
    REPEAT_GROUP: "RepeatGroup",
    REPEAT_INDEX: "RepeatIndex",
    FIELD: "Field",
    VALUE: "Value",
    FIELD_ID: "Field ID",
    FIELD_NAME: "Field Name",
    TYPE: "Type"
};
function exportToExcel(){
    const formData = collectFormData();
    const exportRows = formData.map(item => {
        const repeatInfo = getRepeatInfo(item.name);
        return {
            [EXPORT_COLUMNS.NO]:item.questionNo,
            [EXPORT_COLUMNS.SECTION]:item.section,
            [EXPORT_COLUMNS.GROUP]:item.group,
            [EXPORT_COLUMNS.REPEAT_GROUP]:repeatInfo.repeatGroup || "",
            [EXPORT_COLUMNS.REPEAT_INDEX]:repeatInfo.repeatIndex || "",
            [EXPORT_COLUMNS.FIELD]:item.field,
            [EXPORT_COLUMNS.VALUE]:item.value,
            [EXPORT_COLUMNS.FIELD_ID]:item.fieldId,
            [EXPORT_COLUMNS.FIELD_NAME]:item.fieldName,
            [EXPORT_COLUMNS.TYPE]:item.fieldType
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "QA Export");

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

async function importExcel(bufferArray){
    showImportOverlay();
    await new Promise(resolve =>setTimeout(resolve,50));
    try{
        const buffer = new Uint8Array(bufferArray).buffer;
        const workbook = XLSX.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const importRows = XLSX.utils.sheet_to_json(worksheet);
        expandRepeatSections(importRows);
        fillAllVisibleFields(importRows);
        const initialFieldCount = getIndexedFields().length;
        const fillPasses = Math.max(0,importRows.length - initialFieldCount);
        console.log("Import:",{importRows: importRows.length,fields: initialFieldCount,fillPasses});
        for(let passIndex=0;passIndex<fillPasses+2;passIndex++){//Expansion Passes + Stabilization + Sync 
            console.log("Import pass ",passIndex+1)
            fillAllVisibleFields(importRows);
        }
        await new Promise(resolve =>setTimeout(resolve,50));
        alert(`Excel Import Complete (${importRows.length} import Rows)`);
    }finally{
        hideImportOverlay();
    }

}

function fillAllVisibleFields(importRows){
    const fieldElements = getIndexedFields();

    for(const importRow of importRows){
        try{
            const fieldIndex = Number(importRow[EXPORT_COLUMNS.NO]);
            if (Number.isNaN(fieldIndex)){
                continue;
            }

            const fieldElement = fieldElements[fieldIndex];
            if (!fieldElement){
                console.log("Hidden field encountered at ",fieldIndex);
                break;
            }

            const value = importRow[EXPORT_COLUMNS.VALUE] ?? "";
            // File upload cannot be imported
            if (fieldElement.type === "file"){
                continue;
            }

            // Checkbox
            if (fieldElement.type === "checkbox"){
                const shouldCheck = ((value === true) || (value === "true") || (value === "TRUE"));
                if (shouldCheck !== fieldElement.checked){
                    (fieldElement.closest(".ant-checkbox") || fieldElement ).click();
                }
                continue;
            }

            // Radio
            if (fieldElement.type === "radio"){
                const shouldCheck = ((value === true) || (value === "true") || (value === "TRUE"));
                if (shouldCheck && !fieldElement.checked){
                    fieldElement.click();
                }
                continue;
            }

            // Content Editable
            if (fieldElement.getAttribute("contenteditable") === "true"){
                fieldElement.innerText = value;
            }else if (fieldElement.tagName === "TEXTAREA"){           // Textarea
                fieldElement.value = value;
            }else{                                          // Normal Input
                fieldElement.value = value;
            }

            fieldElement.dispatchEvent(new Event("input",{ bubbles:true }));
            fieldElement.dispatchEvent(new Event("change",{ bubbles:true }));
            fieldElement.dispatchEvent(new Event("blur",{ bubbles:true }));
        }catch(error){
            console.error("Import Error:",row,error);
        }
    }
}

function getIndexedFields(){
    return [...document.querySelectorAll('input, textarea, [contenteditable="true"]')];
    // .filter(fieldElement => isRealField(fieldElement))
    // .map((fieldElement,index) => ({
    //     index,
    //     fieldElement
    // }));
}

const IMPORT_OVERLAY_ID = "qa-import-overlay";
function showImportOverlay(){
    if (document.getElementById(IMPORT_OVERLAY_ID)){
        return;
    }

    const overlayElement = document.createElement("div");
    overlayElement.id = IMPORT_OVERLAY_ID;
    overlayElement.innerHTML = `
        <div style="
            background:white;
            padding:20px 40px;
            border-radius:8px;
            font-size:16px;
            font-weight:bold;
            box-shadow:0 4px 12px rgba(0,0,0,.3);
        ">
            Importing Excel...
        </div>
    `;

    overlayElement.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.35);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:2147483647;
    `;

    document.body.appendChild(overlayElement);
}

function hideImportOverlay(){
    document
        .getElementById(IMPORT_OVERLAY_ID)
        ?.remove();
}

function getRepeatInfo(fieldName){
    const match = (fieldName || "").match(/\.([a-zA-Z0-9_]+)\.(\d+)_/);

    if (!match){
        return {repeatGroup: "",repeatIndex: ""};
    }

    return {
        repeatGroup: match[1],
        repeatIndex: Number(match[2]) + 1
    };
}

function getRepeatRequirements(importRows){
    // console.log(importRows);
    const repeatGroups = {};
    importRows.forEach(importRow => {
        const repeatGroup = importRow.repeatGroup;
        if (!repeatGroup){
            return;
        }
        const repeatIndex = Number(importRow.repeatIndex);
        repeatGroups[repeatGroup] = Math.max(repeatGroups[repeatGroup] || 0,repeatIndex);
    });
    console.log("Repeat Groups : ",repeatGroups)
    return repeatGroups;
}

function getCurrentRepeatCounts(){
    const repeatCounts = {};
    getIndexedFields()
        .forEach(fieldElement => {
            const repeatInfo = getRepeatInfo(fieldElement.name);

            if (!repeatInfo.repeatGroup){
            return;
            }

            repeatCounts[repeatInfo.repeatGroup] = 
            Math.max(repeatCounts[repeatInfo.repeatGroup] || 0,repeatInfo.repeatIndex);
        });

    return repeatCounts;
}

function findAddButton(repeatGroup){
    const fieldElement = document.querySelector(`[name*="${repeatGroup}.0_"]`);
    if (!fieldElement){
        return null;
    }

    const containerElement = fieldElement.closest("div[style*='margin-bottom']");
    if (!containerElement){
        return null;
    }

    return [...containerElement.querySelectorAll("button")]
        .find(buttonElement => buttonElement.textContent.trim() === "+");
}

function expandRepeatSections(importRows){
    const requiredRepeatCounts = getRepeatRequirements(importRows);
    const currentRepeatCounts = getCurrentRepeatCounts();

    Object.entries(requiredRepeatCounts).forEach(([repeatGroup, maxRepeatIndex]) => {
        const currentRepeatCount = currentRepeatCounts[repeatGroup] || 0;
        const missingRepeatCount = maxRepeatIndex - currentRepeatCount;

        if (missingRepeatCount <= 0){
            return;
        }

        const addButton = findAddButton(repeatGroup);

        if (!addButton){
            console.warn("Cannot find add button:",repeatGroup);
            return;
        }

        for (let repeatIndex = 0;repeatIndex < missingRepeatCount;repeatIndex++){
            addButton.click();
        }

        console.log(`Expanded ${repeatGroup} by ${missingRepeatCount}`);
    }
    );
}