console.log("QA Form Filler Loaded");
chrome.runtime.onMessage.addListener(
    (request,sender,sendResponse) => {
        if (request.action === "scanForm"){
            sendResponse(scanForm());
            // downloadReport();
        }
        if (request.action === "highlight"){
            // console.log("el");
            highlightMode();
            sendResponse({success: true});
        }
        if (request.action === "exportScan"){
            // downloadReport();
            exportToExcel();
            sendResponse({success: true});
        }
        if (request.action === "importExcel"){
            importExcel(request.buffer);
            sendResponse({success: true});
        }
        if (request.action === "Clearhighlight"){
            clearHighlightMode();
            sendResponse({success: true});
        }
    }
);

function scanForm(){
    const fields = [];
    document
        // .querySelectorAll('input, textarea, select, [contenteditable="true"]')
        .querySelectorAll('input[type="text"]')
        .forEach(el => {
            console.log(el);
            fields.push(createFieldInfo(el,fields.length + 1));
        });
    return fields;
}


// info
function createFieldInfo(el, fieldId){
    return {
        fieldId,
        tag: el.tagName,
        attributes: getAttributes(el),
        computed: {
            hidden: isHidden(el),
            value: getFieldValue(el)
        },
        parentHtml:el.parentElement?.outerHTML.substring(0, 500)
    };
}

function getAttributes(el){
    const attrs = {};
    for (const attr of el.attributes){
        attrs[attr.name] = attr.value;
    }
    return attrs;
}

function isHidden(el){
    const style = window.getComputedStyle(el);
    return (
        el.type === "hidden" ||
        style.display === "none" ||
        style.visibility === "hidden"
    );
}

function shouldSkipElement(el){
    const name = el.name || "";
    const id = el.id || "";
    return (
        el.closest(".ql-toolbar") ||
        el.closest(".note-toolbar")
        // || name.startsWith("code_") ||
        // name === "hiddenTextarea" ||
        // id.startsWith("rc_select_")
    );
}

function getFieldValue(el){
    if (el.type === "radio"){
        return el.checked;
    }

    if (el.type === "checkbox"){
        return el.checked;
    }

    if (el.getAttribute("contenteditable") === "true"){
        return el.innerText.trim();
    }

    return el.value || "";
}

function highlightMode(){ 
    clearHighlightMode();
    const typeColors = {
        "INPUT(text)": "#00aa00",
        "INPUT(radio)": "#888800",
        "INPUT(search)": "#00cccc",
        "TEXTAREA": "#0066ff",
        "SELECT": "#ff8800",
        "RICHTEXT": "#cc00cc",
        "INPUT(email)": "#ff00aa"
    };
    // console.log("el");
    // document.querySelectorAll('input, textarea, [contenteditable="true"]')
    getIndexedFields()
        .forEach((el,index) => {
            console.log(`element:${index}`,"QuestionLabel:",getDisplayLabel(el),"valuse:",el.value);
            // console.log(`element:${index}`);

            const color = typeColors[`${el.tagName}${el.type ? `(${el.type})` : ''}`] || "#cccccc";
            el.style.outline = `3px solid ${color}`;
            el.style.backgroundColor = `${color}22`;

            const Label = getDisplayLabel(el);

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
            el.parentNode?.insertBefore(marker,el);
            marker.textContent = `[${index}] ${el.tagName}, ${Label}`;
            el.setAttribute(
                "placeholder",
                `[${index + 1}]`
            );
            // if (el.parentElement) {el.parentElement.style.outline = "3px solid red";}
        });
}

function clearHighlightMode(){
    // Remove markers
    document
        .querySelectorAll(".qa-highlight-marker")
        .forEach(marker => marker.remove());

    // Remove styles
    document
        .querySelectorAll(
            'input, textarea, select, [contenteditable="true"]'
        )
        .forEach(el => {
            el.style.outline = "";
            el.style.backgroundColor = "";
        });
}

function findNearbyLabel(el){
    let parent = el.parentElement;

    while (parent){
        const texts =
            Array
                .from(parent.childNodes)
                .filter(
                    node =>
                        node.nodeType ===
                        Node.TEXT_NODE
                )
                .map(
                    node =>
                        node.textContent.trim()
                )
                .filter(
                    text =>
                        text.length > 0
                );

        if (texts.length > 0) {
            return texts[0];
        }

        parent = parent.parentElement;
    }

    return "";
}


function extractElementData(el){
    const result = {};

    for (const key in el){
        try{
            const value = el[key];
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
                result[key] = value;
            }
        }catch{
            //
        }
    }

    result.outerHTML = el.outerHTML;
    return result;
}

function generateScanReport(){
    const elements =
        document.querySelectorAll(
            'input, textarea, select, [contenteditable="true"]'
        );

    let output = "";
    elements.forEach((el, index) => {
        output +=
`==================================================
Field ${index + 1}
==================================================`;

        const data =
            extractElementData(el);
        for (const [key, value] of Object.entries(data)){
            output += `${key}:${value}`;
        }
        output += "\n";
    });
    return output;
}

function downloadReport(){
    const report = generateScanReport();
    const blob = new Blob([report],{ type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scan-report.txt";
    a.click();
    URL.revokeObjectURL(url);
}

function getDisplayLabel(el){
    return [
        findGroupLabel(el),
        findSubGroupLabel(el),
        findFieldLabel(el)
    ]
        // .filter(Boolean)
        // .filter(
        //     (value,index,array) =>
        //         array.indexOf(value) === index
        // )
        .join(" - ");
}

function findGroupLabel(el){
    const group  = el.closest(".webform-main-question");
    if (!group ) {
        return "";
    }

    const candidates =
        Array
            .from(group .querySelectorAll("*"))
            .map(x => x.innerText?.trim())
            .filter(Boolean);

    return candidates.find(
        text =>
            /^[0-9a-zA-Z(). ]+/.test(text) &&
            !text.includes("\n")
    ) || "";
}

function findSubGroupLabel(el){
    const row = el.closest(".ant-row");
    if (!row){
        return "";
    }

    const lines =
        row.innerText
            .split("\n")
            .map(
                x => x.trim()
            )
            .filter(Boolean);

    return lines.find(
        line =>
            !line.startsWith("[")
    ) || "";
}

function findFieldLabel(el){
    // Radio Button
    if (el.type === "radio"){
        return (
            el.closest(".ant-radio-wrapper")
                ?.querySelector(".ant-radio-label")
                ?.innerText
                ?.trim()
            || el.value
            || ""
        );
    }

    // APWMS Business Field
    if (el.id && el.id.startsWith("nsfcJrcApplicationInput")){
        return beautifyFieldId(el.id);
    }

    const fieldCol = el.closest(".ant-col");
    if (!fieldCol){
        return "";
    }

    const row =fieldCol.closest(".ant-row");

    if (!row){
        return "";
    }

    let headerRow =row.previousElementSibling;

    while (headerRow){
        const headers =[...headerRow.querySelectorAll(".ant-col")]
            .map(x => x.innerText?.trim())
            .filter(Boolean);

        if (headers.length){
            const dataCols =[...row.querySelectorAll(".ant-col")];
            const dataIndex = dataCols.indexOf(fieldCol);

            // 第一欄係 PI / Co-I
            if (dataIndex > 0){
                return (
                    headers[
                        dataIndex - 1
                    ]
                    ?.replace(
                        /^\*/,
                        ""
                    )
                    ?.trim()
                    || ""
                );
            }
        }

        headerRow = headerRow.previousElementSibling;
    }
    return "";
}

function beautifyFieldId(id){
    return id
        .replace(/^nsfcJrcApplicationInput_/,"")
        .replace(/^prelim_part1_/,"")
        .replaceAll("_"," ")
        .replace(/\b\w/g,x => x.toUpperCase());
}

function exportToExcel()
{
    const results = collectFormData();
    // console.log(
    //     collectFormData()
    //         .map(x => ({
    //             index: x.questionNo,
    //             label: x.Field
    //         }))
    // );
    const rows = results.map(item => ({
        No: item.questionNo,
        Section: item.Section,
        Group: item.Row,
        Field: item.Field,
        Value: item.value,
        "Field ID": item.id,
        "Field Name": item.name,
        Type: item.tag
    }));

    const ws =
        XLSX.utils.json_to_sheet(rows);

    // Initial column widths
    ws["!cols"] = [
        { width: 8 },    // No
        { width: 10 },   // Section
        { width: 10 },   // Group
        { width: 10 },   // Field
        { width: 30 },   // Value
        { width: 30 },   // Field ID
        { width: 10 },   // Field Name
        { width: 12 }    // Type
    ];

    const wb =
        XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        wb,
        ws,
        "QA Export"
    );

    if (!wb.Workbook) {
        wb.Workbook = {};
    }

    if (!wb.Workbook.Views) {
        wb.Workbook.Views = [{}];
    }

    wb.Workbook.Views[0] = {
        xSplit: 4,
        ySplit: 1
    };

    XLSX.writeFile(
        wb,
        `QA_Export_${
            new Date()
                .toISOString()
                .slice(0, 10)
        }.xlsx`
    );
}

function collectFormData() {
    const results = [];
    getIndexedFields()
    // document.querySelectorAll('input, textarea, [contenteditable="true"]')
        .forEach((el,index) => {
            results.push({
                questionNo: index,
                Section: findGroupLabel(el),
                Row: findSubGroupLabel(el),
                Field: findFieldLabel(el),
                value: getFieldValue(el),
                id: el.id || "",
                name: el.name || "",
                tag: el.tagName
            });
        });

    return results;
}

async function importExcel(bufferArray){
    showImportOverlay();
    // await new Promise(resolve =>requestAnimationFrame(resolve));
    await new Promise(resolve =>setTimeout(resolve,50));
    try{
        const buffer = new Uint8Array(bufferArray).buffer;
        const wb = XLSX.read(buffer);
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);
        // console.log(
        //     getIndexedFields()
        //         .map((el,index) => ({
        //             index,
        //             label: getDisplayLabel(el)
        //         }))
        // );
        const initialFieldCount = getIndexedFields().length;
        const passes = Math.max(0,rows.length - initialFieldCount);
        console.log("Import:",{rows: rows.length,fields: initialFieldCount,passes});
        for(let pass=0;pass<passes+2;pass++){//Expansion Passes + Stabilization + Sync 
            console.log("Import pass ",pass+1)
            fillAllVisibleFields(rows);
            console.log(
                pass
                // getIndexedFields().length,
                // document.activeElement
            );
        }
        await new Promise(resolve =>setTimeout(resolve,50));
        alert(`Excel Import Complete (${rows.length} rows)`);
        // console.log(getIndexedFields().map((el,index) => ({index,label: getDisplayLabel(el)})),rows);
    }finally{
        hideImportOverlay();
    }

}

function fillAllVisibleFields(rows)
{
    const fields = getIndexedFields();

    // rows.forEach(row => {
    for(const row of rows){
        try{
            const idx =
                Number(
                    row["No"]
                );
            // console.log(
            //     "filling",
            //     idx,
            //     getDisplayLabel(el)
            // );
            if (
                Number.isNaN(idx)
            )
            {
                // return;
                continue;
            }

            const el = fields[idx];

            if (!el){
                console.log(
                    "Hidden field encountered at ",
                    idx
                );
                break;
                // return;
            }

            const value =
                row["Value"] ?? "";

            // File upload cannot be imported
            if (
                el.type === "file"
            )
            {
                // return;
                continue;
            }

            // Checkbox
            if (
                el.type === "checkbox"
            )
            {
                el.checked =
                    value === true ||
                    value === "true" ||
                    value === "TRUE";

                el.dispatchEvent(
                    new Event(
                        "change",
                        { bubbles:true }
                    )
                );

                // return;
                continue;
            }

            // Radio
            if (
                el.type === "radio"
            )
            {
                const checked =
                    value === true ||
                    value === "true" ||
                    value === "TRUE";

                if (
                    checked &&
                    !el.checked
                )
                {
                    el.click();
                }

                // return;
                continue;
            }

            // Content Editable
            if (
                el.getAttribute(
                    "contenteditable"
                ) === "true"
            )
            {
                el.innerText =
                    value;
            }

            // Textarea
            else if (
                el.tagName ===
                "TEXTAREA"
            )
            {
                el.value =
                    value;
            }

            // Normal Input
            else
            {
                el.value =
                    value;
            }

            el.dispatchEvent(
                new Event(
                    "input",
                    { bubbles:true }
                )
            );

            el.dispatchEvent(
                new Event(
                    "change",
                    { bubbles:true }
                )
            );

            el.dispatchEvent(
                new Event(
                    "blur",
                    { bubbles:true }
                )
            );
        }
        catch(error)
        {
            console.error(
                "Import Error:",
                row,
                error
            );
        }
    }
}

function getIndexedFields()
{
    return [
        ...document.querySelectorAll(
            'input, textarea, [contenteditable="true"]'
        )
    ];
    // .filter(el => isRealField(el))
    // .map((el,index) => ({
    //     index,
    //     el
    // }));
}

function showImportOverlay()
{
    if (
        document.getElementById(
            "qa-import-overlay"
        )
    ) {
        return;
    }

    const overlay =
        document.createElement("div");

    overlay.id =
        "qa-import-overlay";

    overlay.innerHTML = `
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

    overlay.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.35);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:2147483647;
    `;

    document.body.appendChild(
        overlay
    );
}

function hideImportOverlay()
{
    document
        .getElementById(
            "qa-import-overlay"
        )
        ?.remove();
}