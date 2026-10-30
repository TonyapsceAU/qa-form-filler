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
            console.error("Import Error:",importRow,error);
        }
    }
}
