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
    console.log("[REPEAT] Current Counts",repeatCounts);
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
    const fieldElement = findRepeatField(repeatGroup);
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
            return label.includes("Add");
        });
    }

    const containerElement = fieldElement.closest("div[style*='margin-bottom']");
    if (!containerElement){
        return null;
    }

    return [...containerElement.querySelectorAll("button")].find(buttonElement => {
        const label = buttonElement.getAttribute("aria-label") || "";
        return (buttonElement.textContent.trim() === "+"||label.startsWith("Add row"));
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

function findRemoveButton(repeatGroup){
    const fieldElement = findRepeatField(repeatGroup);
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
                return label.includes("Remove");
            })
            .at(-1);
    }

    const containerElement = fieldElement.closest("div[style*='margin-bottom']");
    if (!containerElement){
        return null;
    }

    return [...containerElement.querySelectorAll("button")]
    .find(buttonElement => {
        const label = buttonElement.getAttribute("aria-label") || "";
        return (buttonElement.textContent.trim() === "X"||label.includes("Remove"));
    });
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