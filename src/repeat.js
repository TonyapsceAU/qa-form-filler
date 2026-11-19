// 從匯出欄位資料或欄位 DOM 元素辨識重複群組、所屬區段與列序號。
// 一般重複欄位先依 name 中的群組和零起算序號判斷；
// webform-row-list 依各自的 data-field-name 計算列序號，其他重複欄位則
// 讀取「Remove row N」標籤，或依相同子群組的列位置計算。
// 無法辨識或找不到對應欄位時，回傳空群組與空序號。
function getKeywordRepeatInfo(fieldData){
    // console.log(fieldData);
    if(fieldData.questionNo==160){
        console.log("Found field with questionNo 160");
    }
    const fieldElement = fieldData?.fieldElement ||
        (fieldData?.nodeType === 1 ? fieldData : null);
    const fieldName = fieldData?.fieldName ||
        fieldElement?.name ||
        fieldElement?.closest("[data-field-name]")?.getAttribute("data-field-name") ||
        "";
    const indexedRepeatPath = getIndexedRepeatPathInfo(fieldName);
    const match = fieldName.match(/\.([a-zA-Z0-9_]+)\.(\d+)_/);
    const repeatSection = fieldElement ? (getGroupLabel(fieldElement) || "") : "";
    const repeatList = getRepeatListName(fieldElement);
    if (indexedRepeatPath){
        return {
            repeatGroup: indexedRepeatPath.repeatGroup,
            repeatSection: repeatSection || indexedRepeatPath.section,
            repeatList: repeatList || indexedRepeatPath.list,
            repeatIndex: indexedRepeatPath.repeatIndex
        };
    }
    if (match){
        if (DEBUG.REPEAT){
            console.warn("[REPEAT] Pattern Matched",fieldName);
        }
        return {
            repeatGroup: match[1],
            repeatSection,
            repeatList,
            repeatIndex: Number(match[2]) + 1
        };
    }

    const keywordField = fieldElement ||
        getIndexedFields().find(element => element.name === fieldName);
    if (!keywordField){
        return {repeatGroup: "",repeatSection: "",repeatList: "",repeatIndex: ""};
    }
    const keywordSection = getGroupLabel(keywordField) || "";
    const keywordGroup = getRepeatSubGroupLabel(keywordField);
    const keywordList = getRepeatListName(keywordField);

    let keywordRow = keywordField.closest('div[style*="align-items: stretch"]');
    const hasInlineRepeatControl = row => row && (
        row.querySelector('button[aria-label^="Remove row"], .anticon-close, button.ant-btn-dangerous') ||
        [...row.querySelectorAll("button")].some(button => button.textContent.trim() === "X")
    );
    if (!hasInlineRepeatControl(keywordRow)){
        let antRow = keywordField.closest(".ant-row");
        while (antRow && !hasInlineRepeatControl(antRow)){
            antRow = antRow.parentElement?.closest(".ant-row");
        }
        keywordRow = antRow;
    }
    if (!keywordRow){
        return {repeatGroup: "",repeatSection: "",repeatList: keywordList,repeatIndex: ""};
    }

    if (keywordList && keywordRow.classList.contains("webform-row-list-row")){
        const rowElements = [
            ...keywordField.closest(".webform-row-list")
                .querySelectorAll(".webform-row-list-row")
        ];
        const rowIndex = rowElements.indexOf(keywordRow);
        return {
            repeatGroup: keywordGroup,
            repeatSection: keywordSection,
            repeatList: keywordList,
            repeatIndex: rowIndex >= 0 ? rowIndex + 1 : ""
        };
    }

    const removeButton = keywordRow.querySelector('button[aria-label^="Remove row"]');
    if (removeButton){
        const match =removeButton.getAttribute("aria-label")?.match(/Remove row (\d+)/);
        if (match){
            return {
                repeatGroup: keywordGroup || "keywords",
                repeatSection: keywordSection,
                repeatList: keywordList,
                repeatIndex: Number(match[1])
            };
        }
    }

    const closeButton = keywordRow.querySelector(".anticon-close") ||
        [...keywordRow.querySelectorAll("button")].find(button =>
            button.classList.contains("ant-btn-dangerous") ||
            button.textContent.trim() === "X"
        );
    if (!closeButton){
        return {repeatGroup: "",repeatSection: "",repeatList: keywordList,repeatIndex: ""};
    }
    const isAntRow = keywordRow.matches(".ant-row");
    const repeatGroupLabels = isAntRow
        ? [...document.querySelectorAll(".ant-row")]
            .filter(row =>
                hasInlineRepeatControl(row) &&
                [...row.querySelectorAll("button")].some(button => button.closest(".ant-row") === row) &&
                getRepeatSubGroupLabel(row) === keywordGroup
            )
        : [...document.querySelectorAll('div[style*="align-items: stretch"]')]
            .filter(row =>
                hasInlineRepeatControl(row) &&
                getRepeatSubGroupLabel(row) === keywordGroup
            );
    if(DEBUG.REPEAT){console.log("Repeat ind",repeatGroupLabels.indexOf(keywordRow) + 1);}
    const repeatIndex = repeatGroupLabels.indexOf(keywordRow) + 1;
    return {
        repeatGroup: keywordGroup,
        repeatSection: keywordSection,
        repeatList: keywordList,
        repeatIndex: repeatIndex || ""
    };
}

function getRepeatGroupKey(repeatGroup, repeatSection = "", repeatList = ""){
    if (repeatList){
        return JSON.stringify([normalizeRepeatLabel(repeatList)]);
    }
    return repeatSection
        ? JSON.stringify([
            normalizeRepeatLabel(repeatSection),
            normalizeRepeatLabel(repeatGroup)
        ])
        : repeatGroup;
}

function getRepeatListName(fieldElement){
    const repeatList = fieldElement?.closest(".webform-row-list");
    const fieldContainer = repeatList?.closest("[data-field-name]");
    return fieldContainer?.getAttribute("data-field-name") || "";
}

function getIndexedRepeatPathInfo(fieldName){
    const match = String(fieldName || "").match(
        /^(.+)\.([a-zA-Z0-9_]+)\.(\d+)\.([a-zA-Z0-9_]+)(?:\.|$)/
    );
    if (!match){
        return null;
    }
    return {
        section: match[1],
        repeatGroup: match[2],
        list: `${match[1]}.${match[2]}`,
        repeatIndex: Number(match[3]) + 1
    };
}

function normalizeRepeatLabel(label){
    return String(label || "")
        .replace(/\s+\d+\s*\/\s*\d+\s*$/, "")
        .replace(/\s+/g, " ")
        .trim()
        .toLocaleLowerCase();
}

function getRepeatSubGroupLabel(fieldElement){
    return getSubGroupLabel(fieldElement)
        .replace(/\s+\d+\s*\/\s*\d+\s*$/, "")
        .replace(/\s+/g, " ")
        .trim();
}

function findRepeatControl(fieldElement, controlType){
    const containers = [
        fieldElement.closest(".webform-row-list-row"),
        fieldElement.closest("div[style*='margin-bottom']"),
        fieldElement.closest(".ant-col")?.parentElement,
        fieldElement.closest(".ant-row"),
        fieldElement.closest("div[style*='display: flex']")
    ].filter((container, index, all) =>
        container && all.indexOf(container) === index
    );

    for (const container of containers){
        const button = [...container.querySelectorAll("button")].find(buttonElement => {
            return isRepeatControlButton(buttonElement, controlType);
        });
        if (button){
            return button;
        }
    }

    const fieldContainer = fieldElement.closest("[data-field-name]");
    const fieldName = fieldContainer?.getAttribute("data-field-name") || "";
    if (getIndexedRepeatPathInfo(fieldName)){
        let container = fieldContainer.parentElement;
        while (container){
            const controlRow = [...container.querySelectorAll(".ant-row")]
                .find(row => {
                    const buttons = [...row.querySelectorAll("button")];
                    return buttons.some(button => isRepeatControlButton(button, "add")) &&
                        buttons.some(button => isRepeatControlButton(button, "remove"));
                });
            if (controlRow){
                return [...controlRow.querySelectorAll("button")]
                    .find(button => isRepeatControlButton(button, controlType)) || null;
            }
            container = container.parentElement;
        }
    }

    return null;
}

function isRepeatControlButton(buttonElement, controlType){
    const label = buttonElement.getAttribute("aria-label") || "";
    const text = buttonElement.textContent.trim();
    const hasPlus = Boolean(buttonElement.querySelector(
        "span[aria-label='plus'], .anticon-plus"
    ));
    const hasRemove = Boolean(buttonElement.querySelector(
        "span[aria-label='close'], .anticon-close"
    ));
    if (controlType === "add"){
        return text === "+" || label.startsWith("Add row") || hasPlus;
    }
    return !hasPlus && (
        text === "X" ||
        label.includes("Remove") ||
        hasRemove ||
        buttonElement.classList.contains("ant-btn-dangerous")
    );
}

function getRepeatRequirements(importRows){
    const repeatGroups = {};
    importRows.forEach(importRow => {
        const repeatGroup = importRow.repeatGroup;
        if (!repeatGroup){
            return;
        }
        const repeatSection = importRow.repeatSection || "";
        const repeatList = importRow.repeatList || "";
        const repeatKey = getRepeatGroupKey(repeatGroup, repeatSection, repeatList);
        const repeatIndex = Number(importRow.repeatIndex);
        if (!Number.isFinite(repeatIndex) || repeatIndex <= 0){
            return;
        }
        const existing = repeatGroups[repeatKey];
        repeatGroups[repeatKey] = {
            repeatGroup,
            repeatSection,
            repeatList,
            fieldIndex: existing?.fieldIndex ??
                getRepeatFieldIndex(importRow[EXPORT_COLUMNS.NO]),
            repeatIndex: Math.max(existing?.repeatIndex || 0, repeatIndex)
        };
    });
    console.log("[REPEAT] Requirements",repeatGroups)
    return repeatGroups;
}

function getCurrentRepeatCounts(){
    const repeatCounts = {};
    getIndexedFields()
        .forEach(fieldElement => {
            const repeatInfo = getKeywordRepeatInfo(fieldElement);
            if (!repeatInfo.repeatGroup){
                return;
            }
            const repeatKey = getRepeatGroupKey(
                repeatInfo.repeatGroup,
                repeatInfo.repeatSection,
                repeatInfo.repeatList
            );
            repeatCounts[repeatKey] = Math.max(
                repeatCounts[repeatKey] || 0,
                repeatInfo.repeatIndex
            );
        });
    // console.log("[REPEAT] Current Counts",repeatCounts);
    return repeatCounts;
}

function getRepeatFieldIndex(value){
    const fieldIndex = Number(value);
    return Number.isInteger(fieldIndex) && fieldIndex >= 0
        ? fieldIndex
        : null;
}

function findRepeatField(repeatGroup, repeatSection = "", repeatList = "", fieldIndex = null){
    const matchesRepeatIdentity = fieldElement => {
        const repeatInfo = getKeywordRepeatInfo(fieldElement);
        if (repeatList){
            return normalizeRepeatLabel(repeatInfo.repeatList) === normalizeRepeatLabel(repeatList);
        }
        return normalizeRepeatLabel(repeatInfo.repeatGroup) === normalizeRepeatLabel(repeatGroup) &&
            (!repeatSection ||
                normalizeRepeatLabel(repeatInfo.repeatSection) === normalizeRepeatLabel(repeatSection));
    };
    const fields = getIndexedFields();

    if (repeatList){
        const matchingListField = fields.find(fieldElement =>
            matchesRepeatIdentity(fieldElement) &&
            Boolean(findRepeatControl(fieldElement, "add"))
        );
        if (matchingListField){
            return matchingListField;
        }
    }

    const indexedField = Number.isInteger(fieldIndex)
        ? fields[fieldIndex]
        : null;
    if (indexedField &&
        matchesRepeatIdentity(indexedField) &&
        findRepeatControl(indexedField, "add")){
        return indexedField;
    }

    const matchingFields = fields.filter(matchesRepeatIdentity);
    return matchingFields.find(fieldElement =>
        Boolean(findRepeatControl(fieldElement, "add"))
    ) || matchingFields[0] || null;
}

function findAddButton(repeatGroup, repeatSection = "", repeatList = "", fieldIndex = null){
    const fieldElement = findRepeatField(repeatGroup, repeatSection, repeatList, fieldIndex);
    if (!fieldElement){
        console.warn("[WARN] Cannot match repeat field",repeatGroup,repeatSection);
        return null;
    }
    const addButton = findRepeatControl(fieldElement, "add");
    if (!addButton){
        console.warn("[WARN] Matched repeat field but cannot find add control",{
            repeatGroup,
            repeatSection,
            repeatList,
            fieldName: fieldElement.name || "",
            fieldId: fieldElement.id || "",
            row: fieldElement.closest(".webform-row-list-row") || fieldElement.closest(".ant-row")
        });
    }
    return addButton;
}

async function expandRepeatSections(importRows){
    console.groupCollapsed("[REPEAT] Expansion");
    const requiredRepeatCounts = getRepeatRequirements(importRows);
    let pendingRequirements = Object.entries(requiredRepeatCounts);
    while (pendingRequirements.length){
        let expandedThisPass = false;
        const deferredRequirements = [];

        for (const [repeatKey, requirement] of pendingRequirements){
            const {repeatGroup, repeatSection, repeatList, fieldIndex, repeatIndex} = requirement;
            let currentRepeatCount = getCurrentRepeatCount(repeatKey,requirement);
            if (currentRepeatCount >= repeatIndex){
                continue;
            }

            const initialCount = currentRepeatCount;
            while (currentRepeatCount < repeatIndex){
                const addButton = findAddButton(
                    repeatGroup,
                    repeatSection,
                    repeatList,
                    fieldIndex
                );
                if (!addButton){
                    break;
                }

                addButton.click();
                const nextCount = await waitForRepeatCountIncrease(
                    repeatKey,
                    currentRepeatCount,
                    requirement
                );
                if (nextCount === null){
                    console.warn("[WARN] Repeat count did not increase after clicking add",{
                        repeatGroup,
                        repeatSection,
                        repeatList,
                        current:currentRepeatCount,
                        target:repeatIndex
                    });
                    break;
                }
                currentRepeatCount = nextCount;
                expandedThisPass = true;
            }

            if (currentRepeatCount < repeatIndex){
                deferredRequirements.push([repeatKey,requirement]);
                console.warn("[WARN] Repeat group remains below required count",{
                    repeatGroup,
                    repeatSection,
                    repeatList,
                    current:currentRepeatCount,
                    target:repeatIndex
                });
            }else{
                console.log(`Expanded ${repeatGroup} by ${currentRepeatCount - initialCount}`);
            }
        }

        if (!expandedThisPass){
            break;
        }
        pendingRequirements = deferredRequirements;
    }
    console.log("[REPEAT] Expansion Complete",getCurrentRepeatCounts());
    console.groupEnd();
}

function getCurrentRepeatCount(repeatKey,requirement){
    const {repeatGroup, repeatSection, repeatList, fieldIndex} = requirement;
    if (repeatList){
        return getIndexedFields().reduce((count,fieldElement) => {
            const repeatInfo = getKeywordRepeatInfo(fieldElement);
            return normalizeRepeatLabel(repeatInfo.repeatList) === normalizeRepeatLabel(repeatList)
                ? Math.max(count,Number(repeatInfo.repeatIndex) || 0)
                : count;
        },0);
    }

    const currentRepeatCounts = getCurrentRepeatCounts();
    const indexedField = findRepeatField(
        repeatGroup,
        repeatSection,
        repeatList
    ) || (Number.isInteger(fieldIndex) ? getIndexedFields()[fieldIndex] : null);
    const indexedRepeatInfo = indexedField
        ? getKeywordRepeatInfo(indexedField)
        : null;
    const indexedRepeatKey = indexedRepeatInfo?.repeatGroup
        ? getRepeatGroupKey(
            indexedRepeatInfo.repeatGroup,
            indexedRepeatInfo.repeatSection,
            indexedRepeatInfo.repeatList
        )
        : repeatKey;
    return currentRepeatCounts[indexedRepeatKey] ??
        currentRepeatCounts[repeatKey] ??
        (!repeatSection ? currentRepeatCounts[repeatGroup] : undefined) ??
        indexedRepeatInfo?.repeatIndex ??
        0;
}

async function waitForRepeatCountIncrease(repeatKey,currentCount,requirement,timeoutMs = 3000){
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs){
        await new Promise(resolve => setTimeout(resolve,100));
        const updatedCount = getCurrentRepeatCount(repeatKey,requirement);
        if (updatedCount > currentCount){
            return updatedCount;
        }
    }
    return null;
}

function findRemoveButton(repeatGroup, repeatSection = "", repeatList = "") {
    // 1. 取得該 repeatGroup 的所有欄位陣列
    const allFields = getIndexedFields().filter(fieldEl => {
        const repeatInfo = getKeywordRepeatInfo(fieldEl);
        if (repeatList){
            return normalizeRepeatLabel(repeatInfo.repeatList) === normalizeRepeatLabel(repeatList);
        }
        return repeatInfo &&
            normalizeRepeatLabel(repeatInfo.repeatGroup) === normalizeRepeatLabel(repeatGroup) &&
            (!repeatSection ||
                normalizeRepeatLabel(repeatInfo.repeatSection) === normalizeRepeatLabel(repeatSection));
    });

    // 確保主欄位也被納入
    const primaryField = findRepeatField(repeatGroup, repeatSection, repeatList);
    if (primaryField && !allFields.includes(primaryField)) {
        allFields.push(primaryField);
    }

    // 2. 從最底部開始往前迴圈檢查（用 .slice().reverse() 避免直接改動原陣列順序）
    for (const fieldElement of allFields.slice().reverse()) {
        // console.log("findRemoveButton", repeatGroup, fieldElement);
        if (!fieldElement) continue;
        
        const targetButton = findRepeatControl(fieldElement, "remove");

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
    if (repeatSection || repeatList){
        return null;
    }
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
    console.groupCollapsed("[REPEAT] Cleanup");
    const requiredRepeatCounts = getRepeatRequirements(importRows);
    const currentRepeatCounts = getCurrentRepeatCounts();
    console.log("[REPEAT] Current Counts",currentRepeatCounts);
    for (const [repeatKey, requirement] of Object.entries(requiredRepeatCounts)){
        const {repeatGroup, repeatSection, repeatList, repeatIndex: requiredCount} = requirement;
        const currentCount = repeatList
            ? getCurrentRepeatCount(repeatKey,requirement)
            : currentRepeatCounts[repeatKey] || 0;
        const extraCount = currentCount - requiredCount;
        console.log(repeatGroup,repeatSection,{
            current:currentCount,
            required:requiredCount,
            removeCount:extraCount
        });
        if (extraCount <= 0){
            continue;
        }
        let removedCount = 0;
        for (let index = 0; index < extraCount; index++){
            const removeButton = findRemoveButton(repeatGroup, repeatSection, repeatList);
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