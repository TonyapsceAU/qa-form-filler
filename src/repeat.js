function getKeywordRepeatInfo(fieldElement){
    const keywordRow =
        fieldElement.closest(
            'div[style*="align-items: stretch"]'
        );

    if (!keywordRow){
        return {repeatGroup: "", repeatIndex: ""};
    }

    const removeButton =
        keywordRow.querySelector(
            'button[aria-label^="Remove row"]'
        );

    if (!removeButton){
        return {repeatGroup: "", repeatIndex: ""};
    }

    const match = removeButton.getAttribute("aria-label")?.match(/Remove row (\d+)/);
    if (!match){
        return {repeatGroup: "", repeatIndex: ""};
    }

    return {
        repeatGroup: "keywords",
        repeatIndex: Number(match[1])
    };
}

function getRepeatRequirements(importRows){
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
            Math.max(repeatCounts[repeatInfo.repeatGroup] || 0,repeatInfo.repeatIndex);
        });

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

function expandRepeatSections(importRows){
    const requiredRepeatCounts = getRepeatRequirements(importRows);
    const currentRepeatCounts = getCurrentRepeatCounts();
    Object.entries(requiredRepeatCounts).forEach(([repeatGroup, maxRepeatIndex]) => {
        const currentRepeatCount = currentRepeatCounts[repeatGroup] || 0;
        const missingRepeatCount = maxRepeatIndex - currentRepeatCount;
        console.log(repeatGroup,{currentRepeatCount,maxRepeatIndex,missingRepeatCount});
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
    const requiredRepeatCounts = getRepeatRequirements(importRows);
    const currentRepeatCounts = getCurrentRepeatCounts();

    for (const [repeatGroup, currentCount] of Object.entries(currentRepeatCounts)){
        if (!(repeatGroup in requiredRepeatCounts)){
            continue;
        }
        const requiredCount = requiredRepeatCounts[repeatGroup];
        const extraCount = currentCount - requiredCount;
        console.log(repeatGroup,{currentCount,requiredCount,extraCount});
        if (extraCount <= 0){
            continue;
        }
        let removedCount = 0;
        for (let index = 0; index < extraCount; index++){
            const removeButton = findRemoveButton(repeatGroup);
            if (!removeButton){
                break;
            }
            removeButton.click();
            removedCount++;
            await new Promise(resolve =>setTimeout(resolve, 50));
        }

        console.log(`Removed ${extraCount} from ${repeatGroup}`);
    }
}