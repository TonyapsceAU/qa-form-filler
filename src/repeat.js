function getKeywordRepeatInfo(fieldElement){
    const keywordRow = fieldElement.closest('div[style*="align-items: stretch"]');
    if (!keywordRow){
        return {repeatGroup: "",repeatIndex: ""};
    }
    const removeButton = keywordRow.querySelector('button[aria-label^="Remove row"]');
    if (removeButton){
        const match =removeButton.getAttribute("aria-label")?.match(/Remove row (\d+)/);
        if (match){
            return {repeatGroup: "keywords",repeatIndex: Number(match[1])};
        }
    }

    const closeButton = keywordRow.querySelector(".anticon-close");
    if (!closeButton){
        return {repeatGroup: "",repeatIndex: ""};
    }
    repeatGrouplable  = [...document.querySelectorAll('div[style*="align-items: stretch"]')]
        .filter(row => getSubGroupLabel(row) === getSubGroupLabel(fieldElement));
    if(DEBUG.REPEAT){console.log("Repeat ind",repeatGrouplable.indexOf(keywordRow) + 1);}
    return {
        repeatGroup: getSubGroupLabel(fieldElement) || "",
        repeatIndex: repeatGrouplable.indexOf(keywordRow) + 1
    };
}

function getRepeatInfo(fieldName){
    const match = (fieldName || "").match(/\.([a-zA-Z0-9_]+)\.(\d+)_/);

    if (!match){
        return {repeatGroup: "",repeatIndex: ""};
    }
    if (DEBUG.REPEAT){
        console.warn("[REPEAT] Pattern Not Matched",fieldName);
    }
    return {
        repeatGroup: match[1],
        repeatIndex: Number(match[2]) + 1
    };
}

function getRepeatRequirements(importRows){
    // console.group("[REPEAT] importRows",importRows);
    const repeatGroups = {};
    importRows.forEach(importRow => {
        const repeatGroup = importRow.repeatGroup;
        if (!repeatGroup){
            return;
        }
        const repeatIndex = Number(importRow.repeatIndex);
        repeatGroups[repeatGroup] = Math.max(repeatGroups[repeatGroup] || 0,repeatIndex);
    });
    console.log("[REPEAT] Requirements",repeatGroups)
    return repeatGroups;
}

function getCurrentRepeatCounts(){
    const repeatCounts = {};
    getIndexedFields()
        .forEach(fieldElement => {
            let repeatInfo = getRepeatInfo(fieldElement.name);
            if (!repeatInfo.repeatGroup){
                repeatInfo = getKeywordRepeatInfo(fieldElement);
            }
            if (!repeatInfo.repeatGroup){
                return;
            }
            repeatCounts[repeatInfo.repeatGroup] = 
            Math.max(repeatCounts[repeatInfo.repeatGroup] || 0, repeatInfo.repeatIndex);
        });
    // console.log("[REPEAT] Current Counts",repeatCounts);
    return repeatCounts;
}

function findRepeatField(repeatGroup){
    let fieldElement = document.querySelector(`[name*="${repeatGroup}.0_"]`);
    if (fieldElement){
        return fieldElement;
    }

    return getIndexedFields()
        .find(fieldElement => {
            const repeatInfo = getKeywordRepeatInfo(fieldElement);
            return (repeatInfo.repeatGroup === repeatGroup);
        });
}

function findAddButton(repeatGroup){
    // console.log("searching for expand button");
    let fieldElement = findRepeatField(repeatGroup);
    if (!fieldElement){
        fieldElement = getIndexedFields()
            .find(fieldElement => {
                const repeatInfo = getKeywordRepeatInfo(fieldElement);
                return (repeatInfo.repeatGroup === repeatGroup);
            });
        if (!fieldElement){
            return null;
        }
        return [...document.querySelectorAll("button")].find(buttonElement => {
            const label = buttonElement.getAttribute("aria-label") || "";
            const hasPlusIcon = buttonElement.querySelector("span[aria-label='plus']");
            return label.includes("Add") || hasPlusIcon;
        });
    }

    const containerElement = fieldElement.closest("div[style*='margin-bottom']") || fieldElement.closest(".ant-col")?.parentElement;
    if (!containerElement){
        // 擴大容錯：如果找不到 margin-bottom 容器，就找上一層的通用 row 容器
        const fallbackContainer = fieldElement.closest("div[style*='display: flex']") || fieldElement.parentElement;
        if (!fallbackContainer) return null;
        
        return [...fallbackContainer.querySelectorAll("button")].find(buttonElement => {
            const label = buttonElement.getAttribute("aria-label") || "";
            const hasPlusIcon = buttonElement.querySelector("span[aria-label='plus']");
            return (buttonElement.textContent.trim() === "+" || label.startsWith("Add row") || hasPlusIcon);
        });
    }

    return [...containerElement.querySelectorAll("button")].find(buttonElement => {
        const label = buttonElement.getAttribute("aria-label") || "";
        const hasPlusIcon = buttonElement.querySelector("span[aria-label='plus']");
        return (buttonElement.textContent.trim() === "+" || label.startsWith("Add row") || hasPlusIcon);
    });
}

async function expandRepeatSections(importRows){
    console.group("[REPEAT] Expansion");
    const requiredRepeatCounts = getRepeatRequirements(importRows);
    const currentRepeatCounts = getCurrentRepeatCounts();
    Object.entries(requiredRepeatCounts).forEach(async ([repeatGroup, maxRepeatIndex]) => {
        const currentRepeatCount = currentRepeatCounts[repeatGroup] || 0;
        const missingRepeatCount = maxRepeatIndex - currentRepeatCount;
        console.log(repeatGroup,{current:currentRepeatCount,target:maxRepeatIndex,expandCount:missingRepeatCount});
        if (missingRepeatCount <= 0){
            return;
        }

        for (let repeatIndex = 0;repeatIndex < missingRepeatCount;repeatIndex++){
            let addButton = findAddButton(repeatGroup);
            if (!addButton){
                console.warn("[WARN] Cannot find add button",repeatGroup);
                return;
            }
            // console.log("Before expand",repeatGroup,getCurrentRepeatCounts());
            addButton.click();
            await new Promise(resolve => setTimeout(resolve,100));
            // console.log("After expand",repeatGroup,getCurrentRepeatCounts());
        }

        console.log(`Expanded ${repeatGroup} by ${missingRepeatCount}`);
    });
    console.log("[REPEAT] Expansion Complete",getCurrentRepeatCounts());
    console.groupEnd();
}

function findRemoveButton(repeatGroup) {
    // 1. 取得該 repeatGroup 的所有欄位陣列
    const allFields = getIndexedFields().filter(fieldEl => {
        const repeatInfo = getKeywordRepeatInfo(fieldEl);
        return repeatInfo && repeatInfo.repeatGroup === repeatGroup;
    });

    // 確保主欄位也被納入
    const primaryField = findRepeatField(repeatGroup);
    if (primaryField && !allFields.includes(primaryField)) {
        allFields.push(primaryField);
    }

    // 2. 從最底部開始往前迴圈檢查（用 .slice().reverse() 避免直接改動原陣列順序）
    for (const fieldElement of allFields.slice().reverse()) {
        // console.log("findRemoveButton", repeatGroup, fieldElement);
        if (!fieldElement) continue;
        
        const containerElement = fieldElement.closest("div[style*='margin-bottom']") || fieldElement.closest(".ant-col")?.parentElement;
        
        let targetButton = null;

        if (!containerElement) {
            const fallbackContainer = fieldElement.closest("div[style*='display: flex']") || fieldElement.parentElement;
            if (!fallbackContainer) continue;
            
            targetButton = [...fallbackContainer.querySelectorAll("button")].find(buttonElement => {
                const label = buttonElement.getAttribute("aria-label") || "";
                const hasCloseIcon = Boolean(buttonElement.querySelector("span[aria-label='close'], .anticon-close"));
                const isDangerous = buttonElement.classList.contains("ant-btn-dangerous");
                const hasPlus = Boolean(buttonElement.querySelector("span[aria-label='plus'], .anticon-plus"));
                
                return !hasPlus && (buttonElement.textContent.trim() === "X" || label.includes("Remove") || hasCloseIcon || isDangerous);
            });
        } else {
            targetButton = [...containerElement.querySelectorAll("button")].find(buttonElement => {
                const label = buttonElement.getAttribute("aria-label") || "";
                const hasCloseIcon = Boolean(buttonElement.querySelector("span[aria-label='close'], .anticon-close"));
                const isDangerous = buttonElement.classList.contains("ant-btn-dangerous");
                const hasPlus = Boolean(buttonElement.querySelector("span[aria-label='plus'], .anticon-plus"));
                
                return !hasPlus && (buttonElement.textContent.trim() === "X" || label.includes("Remove") || hasCloseIcon || isDangerous);
            });
        }

        // 3. 檢查找到的按鈕：如果存在且「沒有被 disabled」，就直接回傳它！
        if (targetButton) {
            if (!targetButton.disabled) {
                return targetButton;
            } else {
                console.log("Remove button is disabled for this row, checking previous row...");
            }
        }
    }

    // 4. 如果上面都沒找到，走全域備用尋找
    return [...document.querySelectorAll("button")]
        .filter(buttonElement => {
            if (buttonElement.disabled) return false;
            const label = buttonElement.getAttribute("aria-label") || "";
            const hasCloseIcon = Boolean(buttonElement.querySelector("span[aria-label='close'], .anticon-close"));
            const isDangerous = buttonElement.classList.contains("ant-btn-dangerous");
            const hasPlus = Boolean(buttonElement.querySelector("span[aria-label='plus'], .anticon-plus"));
            
            return !hasPlus && (label.includes("Remove") || hasCloseIcon || isDangerous);
        })
        .at(-1) || null;
}

function findRemoveButton2(repeatGroup){
    // let fieldElement = findRepeatField(repeatGroup);
    
    const allFields = getIndexedFields().filter(fieldEl => {
        const repeatInfo = getKeywordRepeatInfo(fieldEl);
        return repeatInfo && repeatInfo.repeatGroup === repeatGroup;
    });
    allfieldElement = allFields;// allFields process this to become a array of fieldElements;
    for(fieldElement in allfieldElement.reverse()){
        console.log("findRemoveButton",repeatGroup,fieldElement);
        if (!fieldElement){
            fieldElement = getIndexedFields().find(fieldElement => {
                const repeatInfo = getKeywordRepeatInfo(fieldElement);
                return (repeatInfo.repeatGroup === repeatGroup);
            });
            if (!fieldElement){
                return null;
            }

            return [...document.querySelectorAll("button")]
                .filter(buttonElement => {
                    const label = buttonElement.getAttribute("aria-label") || "";
                    const hasCloseIcon = buttonElement.querySelector("span[aria-label='close']");
                    const isDangerous = buttonElement.classList.contains("ant-btn-dangerous");
                    return label.includes("Remove") || hasCloseIcon || isDangerous;
                })
                .at(-1);
        }
        
        const containerElement = fieldElement.closest("div[style*='margin-bottom']") || fieldElement.closest(".ant-col")?.parentElement;
        // console.log("containerElement",containerElement);
        if (!containerElement){
            const fallbackContainer = fieldElement.closest("div[style*='display: flex']") || fieldElement.parentElement;
            if (!fallbackContainer) return null;
            
            return [...fallbackContainer.querySelectorAll("button")].find(buttonElement => {
                const label = buttonElement.getAttribute("aria-label") || "";
                const hasCloseIcon = buttonElement.querySelector("span[aria-label='close']");
                const isDangerous = buttonElement.classList.contains("ant-btn-dangerous");
                return (buttonElement.textContent.trim() === "X" || label.includes("Remove") || hasCloseIcon || isDangerous);
            });
        }

        return [...containerElement.querySelectorAll("button")].find(buttonElement => {
            const label = buttonElement.getAttribute("aria-label") || "";
            const hasCloseIcon = buttonElement.querySelector("span[aria-label='close']");
            const isDangerous = buttonElement.classList.contains("ant-btn-dangerous");
            return (buttonElement.textContent.trim() === "X" || label.includes("Remove") || hasCloseIcon || isDangerous);
        });
    }
}

async function removeExtraRepeatSections(importRows){
    console.group("[REPEAT] Cleanup");
    const requiredRepeatCounts = getRepeatRequirements(importRows);
    const currentRepeatCounts = getCurrentRepeatCounts();

    for (const [repeatGroup, currentCount] of Object.entries(currentRepeatCounts)){
        if (!(repeatGroup in requiredRepeatCounts)){
            continue;
        }
        const requiredCount = requiredRepeatCounts[repeatGroup];
        const extraCount = currentCount - requiredCount;
        console.log(repeatGroup,{current:currentCount,required:requiredCount,removeCount:extraCount});
        if (extraCount <= 0){
            continue;
        }
        let removedCount = 0;
        for (let index = 0; index < extraCount; index++){
            const removeButton = findRemoveButton(repeatGroup);
            // console.log(removeButton)
            if (!removeButton){
                console.warn("[WARN] Cannot find remove button",repeatGroup);
                break;
            }
            removeButton.click();
            removedCount++;
            // console.log("remove extra");
            await new Promise(resolve =>setTimeout(resolve, 50));
        }

        console.log(`Removed ${extraCount} from ${repeatGroup}`);
    }
    console.log("[REPEAT] Cleanup Complete",getCurrentRepeatCounts());
    console.groupEnd();
}