async function importExcel(bufferArray){
    throw new Error("Deprecated: use fillImportedRows()");
}

async function fillAll(importRows,fileName){
    console.group("[NAVIGATION]");
    if(DEBUG.NAVIGATION){console.log("Step 1)Waiting for navigation");}
    await waitForMenuRender()
    if(DEBUG.NAVIGATION){console.log("Step 2)Navigation Info:",getNavigationInfo());}
    if(DEBUG.NAVIGATION){console.log("Step 3)scan form");}
    const pages = getAllPages(getNavigationInfo());
    console.log("Page Count:",pages.length);
    if(DEBUG.NAVIGATION){console.log("Step 4)fill all");}
    let keepOverlayOpen = false;
    if(pages.length != 0){
        await openPage(pages[0].title);
        await waitForPageRender();
        console.log("[IMPORT] Fill Imported Rows",importRows.length,fileName,importRows[0].importRows);
        console.group("[IMPORT] Start");
        const startTime = Date.now();
        showImportOverlay();
        await new Promise(resolve =>setTimeout(resolve,50));
        for(let pageIndex = 0; pageIndex < pages.length; pageIndex++){
            console.log("[NAVIGATION]","Filling Page With",importRows);
            try{
                await fillImportedRows(importRows[pageIndex].importRows,fileName);
            }catch(error){
                console.error("[IMPORT] Failed",error);
                throw error;
            }
            await clickNextPage();
            await confirmPageChange();
            await waitForPageRender();
        }        
        await new Promise(resolve =>setTimeout(resolve,50));
        console.log("[IMPORT] Complete",{
            rows:importRows.length,
            fields:getIndexedFields().length,
            repeatCounts:getCurrentRepeatCounts(),
            durationMs: Date.now() - startTime
        });
        alert(`Excel Import Complete (${importRows.length} import Rows)`);

        // //Validation Check
        // const report = validateImportStructure(importRows);
        // const totalIssues =
        //     report.nameMismatches.length +
        //     report.typeMismatches.length +
        //     report.missingFields.length +
        //     (report.rowCountMismatch? 1: 0);

        // console.log("[VALIDATION]",report);
        // if (totalIssues){
        //     console.warn("[VALIDATION]","Structure Mismatch");
        //     console.table(report.nameMismatches.slice(0,10));
        //     console.table(report.typeMismatches.slice(0,10));
        //     // const fileName = localStorage.getItem("LoadedFile") ||"Unknown.xlsx";
        //     showValidationError(fileName,report);
        //     keepOverlayOpen = true;
        // }
    }
    console.groupEnd();
    if (!keepOverlayOpen){
        hideImportOverlay();
    }
}

async function fillPage(importRows,fileName){
    console.log("[IMPORT] Fill Imported Rows",importRows.length,fileName);
    console.group("[IMPORT] Start");
    const startTime = Date.now();
    let keepOverlayOpen = false;
    showImportOverlay();
    await new Promise(resolve =>setTimeout(resolve,50));
    try{
        await fillImportedRows(importRows[0].importRows,fileName);
                
        await new Promise(resolve =>setTimeout(resolve,50));
        console.log("[IMPORT] Complete",{
            rows:importRows.length,
            fields:getIndexedFields().length,
            repeatCounts:getCurrentRepeatCounts(),
            durationMs: Date.now() - startTime
        });
        alert(`Excel Import Complete (${importRows.length} import Rows)`);

        //Validation Check
        const report = validateImportStructure(importRows);
        const totalIssues =
            report.nameMismatches.length +
            report.typeMismatches.length +
            report.missingFields.length +
            (report.rowCountMismatch? 1: 0);

        console.log("[VALIDATION]",report);
        if (totalIssues){
            console.warn("[VALIDATION]","Structure Mismatch");
            console.table(report.nameMismatches.slice(0,10));
            console.table(report.typeMismatches.slice(0,10));
            // const fileName = localStorage.getItem("LoadedFile") ||"Unknown.xlsx";
            showValidationError(fileName,report);
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

async function fillImportedRows(importRows,fileName){
    // console.group("[FILL] Imported Rows type",importRows);
    // Synchronization
    console.group("[REPEAT] Synchronization");
    // Synchronization - Expantion
    // console.log("[REPEAT] Before",getCurrentRepeatCounts());
    updateImportProgress(0,1,"Expanding Repeat Sections...");
    expandRepeatSections(importRows);
    await new Promise(resolve =>setTimeout(resolve,2000));
    // console.log("[REPEAT] After Expansion",getCurrentRepeatCounts());

    // Synchronization - Removeal
    updateImportProgress(0,1,"Removing Repeat Sections...");
    await removeExtraRepeatSections(importRows);
    await new Promise(resolve =>setTimeout(resolve,1000));
    // console.log("[REPEAT] After Csleanup",getCurrentRepeatCounts());
    console.groupEnd();
    return ;
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
}

async function fillAllVisibleFields(importRows){
    console.groupCollapsed("[FILL]");
    console.log("Repeat Counts:",getCurrentRepeatCounts());
    for(let rowIndex = 0; rowIndex < importRows.length; rowIndex++){
        try{
            const fieldElements = getIndexedFields();
            const importRow = importRows[rowIndex];
            // console.log("[FILL] Row",importRow);
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
                    console.groupEnd();
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

            // if (fieldElement.closest(".ant-select")){
            //     fieldElement.focus();
            //     fieldElement.value = value;
            //     fieldElement.dispatchEvent(new InputEvent("input",{bubbles:true}));
            //     await new Promise(resolve => setTimeout(resolve,500));
            //     const option =[...document.querySelectorAll(".ant-select-item-option")]
            //         .find(option =>option.textContent.trim() ===String(value).trim());
            //     if (option){
            //         option.click();
            //     }else{
            //         console.warn("[SELECT]","Option Not Found:",value);
            //     }
            //     continue;
            // }

            // Readonly Ant Select 處理邏輯（支援虛擬列表自動滾動尋找）
            const isReadonlyAntSelect = 
                fieldElement.classList.contains("ant-select-selection-search-input") &&
                fieldElement.getAttribute("role") === "combobox" &&
                fieldElement.readOnly;

            if (isReadonlyAntSelect) {
                const selectContainer = fieldElement.closest(".ant-select");
                const selectSelector = selectContainer?.querySelector(".ant-select-selector");

                if (selectSelector) {
                    // 1. 展開下拉選單
                    selectSelector.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
                    
                    // 2. 等待選項渲染
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    const targetValue = String(value).trim();
                    
                    // 3. 尋找虛擬滾動容器（rc-virtual-list-holder）
                    const listId = fieldElement.getAttribute("aria-controls");
                    const dropdown = listId 
                        ? document.getElementById(listId)?.closest(".ant-select-dropdown") 
                        : document.querySelector(".ant-select-dropdown");
                        
                    const virtualHolder = dropdown?.querySelector(".rc-virtual-list-holder");
                    
                    let targetOption = null;
                    let allOptionTexts = new Set();

                    // 4. 滾動尋找機制（若畫面上一開始找不到，就逐步往下滾動載入虛擬列表）
                    for (let scrollAttempt = 0; scrollAttempt < 10; scrollAttempt++) {
                        const options = [...(dropdown || document).querySelectorAll(".ant-select-item-option")];
                        
                        // 收集目前的選項文字以便除錯
                        options.forEach(opt => allOptionTexts.add(opt.textContent.trim()));
                        
                        targetOption = options.find(opt => opt.textContent.trim() === targetValue);
                        if (targetOption) break;

                        if (virtualHolder) {
                            // 每次往下滾動固定高度（例如 150px），讓虛擬列表渲染下一批項目
                            virtualHolder.scrollTop += 150;
                            await new Promise(resolve => setTimeout(resolve, 100)); // 等待新節點掛載
                        } else {
                            break; // 如果不是虛擬列表就跳出
                        }
                    }

                    if (targetOption) {
                        // 5. 確保目標選項滾動到可視區並發送完整滑鼠事件
                        targetOption.scrollIntoView({ block: 'nearest' });
                        targetOption.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
                        targetOption.dispatchEvent(new MouseEvent("mouseup", { bubbles: true }));
                        targetOption.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                        
                        // 6. 收合選單
                        await new Promise(resolve => setTimeout(resolve, 150));
                        fieldElement.blur();
                        selectSelector.blur();
                        document.body.click();
                        await new Promise(resolve => setTimeout(resolve, 150));
                    } else {
                        console.warn("[SELECT] Option Not Found after scrolling:", targetValue, "Checked options:", [...allOptionTexts]);
                    }
                }
                continue;
            }

            // Searchable Select
            if (fieldElement.id?.startsWith("rc_select_")){
                console.log("[SELECT]",fieldElement.id,value);
                const select = fieldElement.closest(".ant-select")|| 
                    document.querySelector(`#${fieldElement.id}`)?.closest(".ant-select");
                if (!select){
                console.warn("[SELECT]","Select Not Found");
                continue;
                }
                const selector =select.querySelector(".ant-select-selector");
                selector?.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));
                await new Promise(resolve =>setTimeout(resolve,500));
                const option =[...document.querySelectorAll(".ant-select-item-option")]
                    .find(option =>option.textContent.trim().includes(String(value).trim()));
                console.log("[SELECT]",value,option);
                if (option){
                    option.click();
                }else{
                    console.warn("[SELECT]","Option Not Found:",value);
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

            if (fieldElement.closest(".ant-picker")){
                fieldElement.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));
            }else{
                fieldElement.dispatchEvent(new Event("blur",{ bubbles:true }));
            }


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

    // if (fieldElement.readOnly){
    //     return false;
    // }

    if (fieldElement.classList.contains("ant-input-disabled")){
        return false;
    }

    return true;
}