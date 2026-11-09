async function importExcel(bufferArray){
    throw new Error("Deprecated: use fillImportedRows()");
}

async function fillForm(importRows,fileName){
    await menuNavigation();
    await fillImportedRows(importRows,fileName);
    await clickNextPage();
}

async function fillImportedRows(importRows,fileName){
    console.group("[IMPORT] Start");
    const startTime = Date.now();
    let keepOverlayOpen = false;
    showImportOverlay();
    await new Promise(resolve =>setTimeout(resolve,50));
    try{
        // Synchronization
        console.group("[REPEAT] Synchronization");
        // Synchronization - Expantion
        console.log("[REPEAT] Before",getCurrentRepeatCounts());
        updateImportProgress(0,1,"Expanding Repeat Sections...");
        expandRepeatSections(importRows);
        await new Promise(resolve =>setTimeout(resolve,2000));
        console.log("[REPEAT] After Expansion",getCurrentRepeatCounts());

        // Synchronization - Removeal
        updateImportProgress(0,1,"Removing Repeat Sections...");
        await removeExtraRepeatSections(importRows);
        await new Promise(resolve =>setTimeout(resolve,1000));
        console.log("[REPEAT] After Cleanup",getCurrentRepeatCounts());
        console.groupEnd();

        updateImportProgress(0,importRows.length,"Preparing Field Import...");
        await fillAllVisibleFields(importRows);
        console.log("[FILL] Initial Pass Complete",{
            fields: getIndexedFields().length,repeatCounts:getCurrentRepeatCounts()
        });


        const initialFieldCount = getIndexedFields().length;
        const maxfillPasses = Math.max(0,importRows.length - initialFieldCount);
        console.log("[FILL] Planning",{importRows: importRows.length,fields: initialFieldCount,maxfillPasses});
        let passIndex=0;
        while(passIndex<(Math.max(0,importRows.length - getIndexedFields().length))){//Expansion Passes + Stabilization + Sync 
            await fillAllVisibleFields(importRows);
            passIndex++
            console.log(`[FILL] Pass ${passIndex}`,{
                fields:getIndexedFields().length,
                remaining:Math.max(0,importRows.length - getIndexedFields().length)
            });
        }
        // await fillAllVisibleFields(importRows);
        // await fillAllVisibleFields(importRows);
        await new Promise(resolve =>setTimeout(resolve,50));
        console.log("[IMPORT] Complete",{
            rows:importRows.length,
            fields:getIndexedFields().length,
            repeatCounts:getCurrentRepeatCounts(),
            durationMs: Date.now() - startTime
        });
        alert(`Excel Import Complete (${importRows.length} import Rows)`);

        //Validation Check
        let mismatches = validateImportStructure(importRows);
        console.log("[VALIDATION]",{mismatchCount:mismatches.length});
        if (mismatches.length){
            console.warn("[VALIDATION] Structure Mismatch");
            console.table(mismatches.slice(0,10));
            const fileName = localStorage.getItem("LoadedFile") || "Unknown.xlsx";
            showValidationError(fileName,mismatches.length);
            keepOverlayOpen = true;
        }
    }catch(error){
        console.error("[IMPORT] Failed",error);
        throw error;
    }finally{
        console.groupEnd();
        if (!keepOverlayOpen){
            hideImportOverlay();
        }
    }
}

async function fillAllVisibleFields(importRows){
    console.groupCollapsed("[FILL]");
    console.log("Repeat Counts:",getCurrentRepeatCounts());
    for(let rowIndex = 0; rowIndex < importRows.length; rowIndex++){
        try{
            const fieldElements = getIndexedFields();
            const importRow = importRows[rowIndex];
            const fieldIndex = Number(importRow[EXPORT_COLUMNS.NO]);
            if (Number.isNaN(fieldIndex)){
                continue;
            }

            const fieldElement = fieldElements[fieldIndex];
            if (!fieldElement){
                console.warn("[FILL] Hidden Field",{rowIndex,fieldIndex});
                break;
            }

            if (!isEditableField(fieldElement)){
                continue;
            }

            const value = importRow[EXPORT_COLUMNS.VALUE] ?? "";
            // File upload cannot be imported
            if (fieldElement.type === "file"){
                console.group("[FILE UPLOAD]");
                const fileName = String(value).trim();
                console.log("Excel Value:",fileName);
                const file = await getSupportFile(fileName);
                if (!file){
                    console.warn("Support file not found:",fileName);
                    continue;
                }
                console.log("Retrieved File:",file);
                // console.log("Input:",fieldElement);
                console.dir(fieldElement);
                console.log(
                    "fieldElement name:",
                    fieldElement.constructor.name
                );
                try{
                    await uploadFile(fieldElement,file);
                    console.log("Uploaded.");
                }catch(error){
                    console.error("Upload failed:",error);
                }
                console.log("files length",fieldElement.files.length);
                console.log(fieldElement.files[0]);        
                console.groupEnd();
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

            if ((rowIndex % 10 === 0) ||(rowIndex === importRows.length - 1)){
                updateImportProgress(rowIndex + 1,importRows.length,"Filling Form Fields...");
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }catch(error){
            const importRow = importRows[rowIndex];
            console.error("[FILL] Row Failed",{rowIndex,field: importRow?.[EXPORT_COLUMNS.FIELD],error});
        }
    }
    console.log("[FILL] Complete",{
        rows: importRows.length,
        fields: getIndexedFields().length,
        repeatCounts: getCurrentRepeatCounts()
    });
    console.groupEnd();
}

function isEditableField(fieldElement){
    if (!fieldElement){
        return false;
    }

    if (fieldElement.disabled){
        return false;
    }

    if (fieldElement.readOnly){
        return false;
    }

    if (fieldElement.classList.contains("ant-input-disabled")){
        return false;
    }

    return true;
}