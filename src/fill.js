async function importExcel(bufferArray){
    throw new Error("Deprecated: use fillImportedRows()");
}

async function fillAll(importRows,fileName){
    console.groupCollapsed("[NAVIGATION]");
    showProgressOverlay("Navigating to form...");
    try{
        // await new Promise(resolve => setTimeout(resolve,50));
        const menuButton = findMenuButton();
        if(menuButton){//menu button only apper outside
            if(DEBUG.EXPORT){console.log(menuButton);}
            updateOperationProgress(0,1,"Opening form navigation...");
            await clickMenuButton();//navigate to main manue
        }
        if(DEBUG.NAVIGATION){console.log("Step 1)Waiting for navigation");}
        await waitForMenuRender();
        if(DEBUG.NAVIGATION){console.log("Step 2)Navigation Info:",getNavigationInfo());}
        if(DEBUG.NAVIGATION){console.log("Step 3)scan form");}
        const pages = getAllPages(getNavigationInfo());
        console.log("Page Count:",pages.length);
        if(DEBUG.NAVIGATION){console.log("Step 4)fill all");}
        if(pages.length){
            updateOperationProgress(0,pages.length,`Navigating to ${pages[0].title}...`);
            const firstPageOpened = await openPage(pages[0].title);
            if (!firstPageOpened){
                throw new Error(`Unable to open page "${pages[0].title}" during import.`);
            }
            await waitForPageRender();

            console.log("[IMPORT] Fill Imported Rows",importRows.length,fileName,importRows[0].importRows);
            console.groupCollapsed("[IMPORT] Start");
            const startTime = Date.now();
            try{
                for(let pageIndex = 0; pageIndex < pages.length; pageIndex++){
                    console.log("[NAVIGATION]","Filling Page With",importRows);
                    updateOperationProgress(pageIndex,pages.length,`Filling page ${pageIndex + 1}/${pages.length}: ${pages[pageIndex].title}`);
                    await fillImportedRows(importRows[pageIndex].importRows,fileName);
                    updateOperationProgress(pageIndex + 1,pages.length,`Completed page ${pageIndex + 1}/${pages.length}: ${pages[pageIndex].title}`);
                    if(pageIndex < pages.length - 1){
                        updateOperationProgress(pageIndex + 1,pages.length,`Navigating to page ${pageIndex + 2}/${pages.length}: ${pages[pageIndex + 1].title}`);
                        const nextPageOpened = await clickNextPage();
                        if (!nextPageOpened){
                            throw new Error(`Unable to continue from page "${pages[pageIndex].title}" during import.`);
                        }
                        await confirmPageChange();
                        await waitForPageRender();
                    }
                }
            }catch(error){
                console.error("[IMPORT] Failed",error);
                throw error;
            }finally{
                console.groupEnd();
            }
            await new Promise(resolve =>setTimeout(resolve,50));
            console.log("[IMPORT] Complete",{
                rows:importRows.length,
                fields:getIndexedFields().length,
                repeatCounts:getCurrentRepeatCounts(),
                durationMs: Date.now() - startTime
            });
            alert(`Excel Import Complete (${importRows.length} import Rows)`);
        }
    }finally{
        console.groupEnd();
        hideImportOverlay();
    }
}

async function fillPage(importRows,fileName){
    console.log("[IMPORT] Fill Imported Rows",importRows.length,fileName);
    console.groupCollapsed("[IMPORT] Start");
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
        if(DEBUG.ValidationCheck){
            const report = validateImportStructure(importRows[0].importRows);
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
    // Synchronization
    console.groupCollapsed("[REPEAT] Synchronization");

    // Synchronization - Expantion
    if(DEBUG.REPEAT){console.log("[REPEAT] Before",getCurrentRepeatCounts());}
    await expandRepeatSections(importRows);
    await new Promise(resolve =>setTimeout(resolve,2000));
    if(DEBUG.REPEAT){console.log("[REPEAT] After Expansion",getCurrentRepeatCounts());}
    // return;

    // Synchronization - Removeal
    await removeExtraRepeatSections(importRows);
    await new Promise(resolve =>setTimeout(resolve,1000));
    if(DEBUG.REPEAT){console.log("[REPEAT] After Csleanup",getCurrentRepeatCounts());}
    console.groupEnd();
    // return ;
    
    updateImportProgress(0,importRows.length,"Preparing Field Import...");
    await fillAllVisibleFields(importRows);
    console.log("[FILL] Initial Pass Complete",{
        fields: getIndexedFields().length,repeatCounts:getCurrentRepeatCounts()
    });

    if(MultiPass){
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
}

async function fillAllVisibleFields(importRows){
    console.groupCollapsed("[FILL]");
    console.log("Repeat Counts:",getCurrentRepeatCounts());
    const repeatFieldPositions = getImportedRepeatFieldPositions(importRows);
    for(let rowIndex = 0; rowIndex < importRows.length; rowIndex++){
        try{
            const fieldElements = getIndexedFields();
            const importRow = importRows[rowIndex];
            // console.log("[FILL] Row",importRow);
            const fieldIndex = Number(importRow[EXPORT_COLUMNS.NO]);
            if (Number.isNaN(fieldIndex)){
                continue;
            }
            const fieldElement = findImportedFieldElement(
                importRow,
                fieldElements,
                repeatFieldPositions.get(importRow)
            ) || fieldElements[fieldIndex];
            if (!fieldElement){
                console.warn("[FILL] Hidden Field",{rowIndex,fieldIndex});
                break;
            }

            if (!isEditableField(fieldElement)){
                continue;
            }

            const value = importRow[EXPORT_COLUMNS.VALUE] ?? "";
            console.log("[FILL] Filling Field",{rowIndex,fieldIndex,value,fieldElement});
            // File upload cannot be imported
            if (fieldElement.type === "file"){
                // continue;
                console.groupCollapsed("[FILE UPLOAD]");
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

            if (fieldElement.tagName === "SELECT" && fieldElement.multiple){
                const selectedValues = String(value).trim()
                    ? String(value).split("\n")
                    : [];
                [...fieldElement.options].forEach(option => {
                    option.selected = selectedValues.includes(option.value);
                });
                fieldElement.dispatchEvent(new Event("input",{ bubbles:true }));
                fieldElement.dispatchEvent(new Event("change",{ bubbles:true }));
                continue;
            }

            const isSearchableAntSelect =
                fieldElement.classList.contains("ant-select-selection-search-input") &&
                fieldElement.getAttribute("role") === "combobox";

            // Readonly Ant Select 處理邏輯（支援虛擬列表自動滾動尋找）
            const isReadonlyAntSelect = isSearchableAntSelect && fieldElement.readOnly;

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
            if (isSearchableAntSelect){
                await fillSearchableAntSelect(fieldElement,value);
                continue;
            }

            // Content Editable
            if (fieldElement.getAttribute("contenteditable") === "true"){
                if (fieldElement.matches(".ql-editor")){
                    setQuillEditorValue(fieldElement,value);
                }else{
                    fieldElement.innerText = value;
                }
            }else if (fieldElement.tagName === "TEXTAREA"){           // Textarea
                // fieldElement.value = value;
                setNativeValue(fieldElement,value);
            }else{                                          // Normal Input
                // fieldElement.value = value;
                setNativeValue(fieldElement,value);
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

async function fillSearchableAntSelect(fieldElement,value){
    const select = fieldElement.closest(".ant-select");
    const selector = select?.querySelector(".ant-select-selector");
    const targetValue = String(value).trim();
    if (!select || !selector || !targetValue){
        return;
    }

    selector.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));
    fieldElement.focus();
    if (!fieldElement.readOnly){
        setNativeValue(fieldElement,targetValue);
        fieldElement.dispatchEvent(new Event("input",{bubbles:true}));
    }

    const getDropdown = () => {
        const listId = fieldElement.getAttribute("aria-controls");
        const controlledDropdown = listId
            ? document.getElementById(listId)?.closest(".ant-select-dropdown")
            : null;
        return controlledDropdown ||
            [...document.querySelectorAll(".ant-select-dropdown")]
                .find(dropdown =>
                    !dropdown.classList.contains("ant-select-dropdown-hidden") &&
                    dropdown.getAttribute("aria-hidden") !== "true"
                );
    };

    const normalizedTarget = targetValue.toLocaleLowerCase();
    let dropdown;
    let option;
    for (let attempt = 0; attempt < 20; attempt++){
        dropdown = getDropdown();
        const options = [...(dropdown?.querySelectorAll(".ant-select-item-option") || [])];
        option = options.find(candidate =>
            candidate.textContent.trim().toLocaleLowerCase() === normalizedTarget
        ) || options.find(candidate =>
            candidate.textContent.trim().toLocaleLowerCase().includes(normalizedTarget)
        );
        if (option){
            break;
        }
        await new Promise(resolve => setTimeout(resolve,100));
    }

    if (!option){
        console.warn("[SELECT] Option Not Found:",targetValue);
        return;
    }

    option.scrollIntoView?.({block:"nearest"});
    option.dispatchEvent(new MouseEvent("mousedown",{bubbles:true}));
    option.dispatchEvent(new MouseEvent("mouseup",{bubbles:true}));
    option.dispatchEvent(new MouseEvent("click",{bubbles:true}));

    const isCommitted = () => {
        return [...select.querySelectorAll(".ant-select-selection-item")]
            .some(item =>
                (item.getAttribute("title") || item.textContent).trim().toLocaleLowerCase() ===
                normalizedTarget
            );
    };

    for (let attempt = 0; attempt < 10 && !isCommitted(); attempt++){
        await new Promise(resolve => setTimeout(resolve,100));
    }
    if (!isCommitted()){
        fieldElement.dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}));
        fieldElement.dispatchEvent(new KeyboardEvent("keyup",{key:"Enter",bubbles:true}));
        for (let attempt = 0; attempt < 10 && !isCommitted(); attempt++){
            await new Promise(resolve => setTimeout(resolve,100));
        }
    }
    if (!isCommitted()){
        console.warn("[SELECT] Option did not commit:",targetValue);
        return;
    }

    fieldElement.blur();
    await new Promise(resolve => setTimeout(resolve,150));
}

function getImportedRepeatFieldPositions(importRows){
    const groupedRows = new Map();
    importRows.forEach(importRow => {
        const key = getImportedRepeatFieldKey(importRow);
        if (!key){
            return;
        }
        if (!groupedRows.has(key)){
            groupedRows.set(key,[]);
        }
        groupedRows.get(key).push(importRow);
    });

    const positions = new Map();
    groupedRows.forEach(rows => {
        rows.sort((a,b) =>
            Number(a[EXPORT_COLUMNS.NO]) - Number(b[EXPORT_COLUMNS.NO])
        );
        rows.forEach((importRow,index) => positions.set(importRow,index));
    });
    return positions;
}

function getImportedRepeatFieldKey(importRow){
    const repeatList = importRow[EXPORT_COLUMNS.REPEAT_LIST];
    const repeatIndex = Number(importRow[EXPORT_COLUMNS.REPEAT_INDEX]);
    if (!repeatList || !Number.isFinite(repeatIndex) || repeatIndex <= 0){
        return "";
    }
    return JSON.stringify([
        normalizeRepeatLabel(repeatList),
        repeatIndex
    ]);
}

function findImportedFieldElement(importRow,fieldElements,repeatFieldPosition){
    const repeatList = importRow[EXPORT_COLUMNS.REPEAT_LIST];
    const repeatIndex = Number(importRow[EXPORT_COLUMNS.REPEAT_INDEX]);
    if (!repeatList || !Number.isFinite(repeatIndex) || repeatIndex <= 0){
        return null;
    }

    // if (Number.isInteger(repeatFieldPosition)){
    //     console.log("[FILL] Searching Repeat Field",{repeatList,repeatIndex,repeatFieldPosition});
    //     const rowField = findRepeatListFieldElement(
    //         repeatList,
    //         repeatIndex,
    //         repeatFieldPosition
    //     );
    //     if (rowField){
    //         return rowField;
    //     }
    // }

    let candidates = fieldElements.filter(fieldElement => {
        const repeatInfo = getKeywordRepeatInfo(fieldElement);
        return normalizeRepeatLabel(repeatInfo.repeatList) === normalizeRepeatLabel(repeatList) &&
            Number(repeatInfo.repeatIndex) === repeatIndex;
    });
    if (!candidates.length){
        return null;
    }

    const fieldId = importRow[EXPORT_COLUMNS.FIELD_ID];
    if (fieldId){
        const matchingId = candidates.filter(fieldElement => fieldElement.id === fieldId);
        if (matchingId.length === 1){
            return matchingId[0];
        }
    }

    const fieldName = importRow[EXPORT_COLUMNS.FIELD_NAME];
    if (fieldName){
        const matchingName = candidates.filter(fieldElement => fieldElement.name === fieldName);
        if (matchingName.length === 1){
            return matchingName[0];
        }
    }

    const fieldLabel = normalizeRepeatLabel(importRow[EXPORT_COLUMNS.FIELD]);
    if (fieldLabel){
        const matchingLabel = candidates.filter(fieldElement =>
            normalizeRepeatLabel(getFieldLabel(fieldElement)) === fieldLabel
        );
        if (matchingLabel.length === 1){
            return matchingLabel[0];
        }
        if (matchingLabel.length > 1){
            candidates = matchingLabel;
        }
    }

    if (Number.isInteger(repeatFieldPosition) && candidates[repeatFieldPosition]){
        return candidates[repeatFieldPosition];
    }

    const fieldIndex = Number(importRow[EXPORT_COLUMNS.NO]);
    return candidates.find(fieldElement => fieldElements[fieldIndex] === fieldElement) ||
        (candidates.length === 1 ? candidates[0] : null);
}

function findRepeatListFieldElement(repeatListName,repeatIndex,fieldPosition){
    const repeatList = [...document.querySelectorAll(".webform-row-list")]
        .find(listElement => {
            const fieldContainer = listElement.closest("[data-field-name]");
            return normalizeRepeatLabel(
                fieldContainer?.getAttribute("data-field-name")
            ) === normalizeRepeatLabel(repeatListName);
        });
    const row = repeatList?.querySelectorAll(".webform-row-list-row")[repeatIndex - 1];
    return row?.querySelectorAll('input, textarea, select, [contenteditable="true"]')[fieldPosition] || null;
}

function setQuillEditorValue(fieldElement,value){
    const text = String(value);
    fieldElement.focus();
    const range = document.createRange();
    range.selectNodeContents(fieldElement);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    const command = text ? "insertText" : "delete";
    if (!document.execCommand(command,false,text)){
        fieldElement.innerText = text;
    }
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

function setNativeValue(fieldElement,value){
    const prototype = fieldElement.tagName === "TEXTAREA"? HTMLTextAreaElement.prototype: HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype,"value")
        .set.call(fieldElement,value);
}