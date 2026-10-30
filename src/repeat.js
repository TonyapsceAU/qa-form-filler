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

function getRepeatRequirements(importRows){
    // console.log(importRows);
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

function getCurrentRepeatCounts(){
    const repeatCounts = {};
    getIndexedFields()
        .forEach(fieldElement => {
            const repeatInfo = getRepeatInfo(fieldElement.name);

            if (!repeatInfo.repeatGroup){
            return;
            }

            repeatCounts[repeatInfo.repeatGroup] = 
            Math.max(repeatCounts[repeatInfo.repeatGroup] || 0,repeatInfo.repeatIndex);
        });

    return repeatCounts;
}

function findAddButton(repeatGroup){
    const fieldElement = document.querySelector(`[name*="${repeatGroup}.0_"]`);
    if (!fieldElement){
        return null;
    }

    const containerElement = fieldElement.closest("div[style*='margin-bottom']");
    if (!containerElement){
        return null;
    }

    return [...containerElement.querySelectorAll("button")]
        .find(buttonElement => buttonElement.textContent.trim() === "+");
}

function expandRepeatSections(importRows){
    const requiredRepeatCounts = getRepeatRequirements(importRows);
    const currentRepeatCounts = getCurrentRepeatCounts();

    Object.entries(requiredRepeatCounts).forEach(([repeatGroup, maxRepeatIndex]) => {
        const currentRepeatCount = currentRepeatCounts[repeatGroup] || 0;
        const missingRepeatCount = maxRepeatIndex - currentRepeatCount;

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