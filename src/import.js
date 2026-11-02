async function importExcel(bufferArray){
    const startTime = Date.now();
    console.group("[IMPORT] Start");
    showImportOverlay();
    await new Promise(resolve =>setTimeout(resolve,50));
    try{
        // Load datas
        const buffer = new Uint8Array(bufferArray).buffer;
        const workbook = XLSX.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const importRows = XLSX.utils.sheet_to_json(worksheet);
        console.log("Workbook Loaded",{rows: importRows.length});

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
        // for(let passIndex=0;passIndex<maxfillPasses+2;passIndex++){//Expansion Passes + Stabilization + Sync 
            await fillAllVisibleFields(importRows);
            passIndex++
            // console.log((Math.max(0,importRows.length - getIndexedFields().length)+3));
            console.log(`[FILL] Pass ${passIndex}`,{
                fields:getIndexedFields().length,
                remaining:Math.max(0,importRows.length - getIndexedFields().length)
            });
        }
        await fillAllVisibleFields(importRows);
        await fillAllVisibleFields(importRows);
        await new Promise(resolve =>setTimeout(resolve,50));
        console.log("[IMPORT] Complete",{
            rows:importRows.length,
            fields:getIndexedFields().length,
            repeatCounts:getCurrentRepeatCounts(),
            durationMs: Date.now() - startTime
        });
        alert(`Excel Import Complete (${importRows.length} import Rows)`);
    }catch(error){
        console.error("[IMPORT] Failed",error);
        throw error;
    }finally{
        console.groupEnd();
        hideImportOverlay();
    }
}

async function fillAllVisibleFields(importRows){
    console.log(
        "fillAllVisibleFields",
        getCurrentRepeatCounts()
    );
    for(let rowIndex = 0; rowIndex < importRows.length; rowIndex++){
        try{
            const fieldElements = getIndexedFields();
            const beforeCounts =
                JSON.stringify(
                    getCurrentRepeatCounts()
                );
            const importRow = importRows[rowIndex];
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

            if ((rowIndex % 10 === 0) ||(rowIndex === importRows.length - 1)){
                updateImportProgress(rowIndex + 1,importRows.length,"Filling Form Fields...");
                await new Promise(resolve => setTimeout(resolve, 0));
            }
            const afterCounts =
                JSON.stringify(
                    getCurrentRepeatCounts()
                );

            if (beforeCounts !== afterCounts){
                console.log(
                    rowIndex,
                    importRows[rowIndex]
                );
                console.log(
                        getCurrentRepeatCounts()
                    );
                console.warn(
                    "Repeat count changed!",
                    {
                        rowIndex,
                        row: importRows[rowIndex],
                        beforeCounts,
                        afterCounts
                    }
                );
            }

        }catch(error){
            console.error("Import Error:",importRow,error);
        }
    }
}
