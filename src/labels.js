function getDisplayLabel(fieldElement){
    return [
        getGroupLabel(fieldElement),
        getSubGroupLabel(fieldElement),
        getFieldLabel(fieldElement)
    ].join(" - ");
}

function getGroupLabel(fieldElement){
    const groupElement  = fieldElement.closest(".webform-main-question");
    if (!groupElement ) {
        return "";
    }

    const labelCandidates  = Array
        .from(groupElement.querySelectorAll("*"))
        .map(element => element.innerText?.trim())
        .filter(Boolean);

    return labelCandidates .find(text => /^[0-9a-zA-Z(). ]+/.test(text) && !text.includes("\n")) || "";
}

function getSubGroupLabel(fieldElement){
    const rowElement = fieldElement.closest(".ant-row");
    if (!rowElement){
        return "";
    }

    const lines =
        rowElement.innerText
            .split("\n")
            .map(line => line.trim())
            .filter(Boolean);

    return (lines.find(line => !line.startsWith("[")) || "");
}

function getFieldLabel(fieldElement){
    // Radio Button
    if (fieldElement.type === "radio"){
        return (
            fieldElement.closest(".ant-radio-wrapper")
                ?.querySelector(".ant-radio-label")
                ?.innerText
                ?.trim()
            || fieldElement.value
            || ""
        );
    }

    const headerLabel  = getFieldLabelFromHeader(fieldElement);
    if (headerLabel){
        return headerLabel;
    }
    
    const nameLabel = getFieldLabelFromName(fieldElement);
    if (nameLabel){
        return nameLabel;
    }

    // APWMS Business Field
    if (fieldElement.id && fieldElement.id.startsWith(APWMS_FIELD_PREFIX)){
        return beautifyFieldId(fieldElement.id);
    }

    return "";
}

function getFieldLabelFromName(fieldElement){
    const name = fieldElement.name || fieldElement.id || "";
    const field =
        name.split(".")
            .pop()
            .replace(/^\d+_/, "");
    return (FIELD_LABEL_MAP[field]|| field);
}

function getFieldLabelFromHeader(fieldElement){
    const columnElement = fieldElement.closest(".ant-col");
    if (!columnElement){
        return "";
    }
    const rowElement = columnElement.closest(".ant-row");
    if (!rowElement){
        return "";
    }

    let headerRowElement = rowElement.previousElementSibling;
    while (headerRowElement){
        const headerLabels = 
            [...headerRowElement.querySelectorAll( ".ant-col strong" )]
            .map(element  => element .innerText.trim() )
            .filter(Boolean);

        if (headerLabels.length){
            const dataColumns = [...rowElement.querySelectorAll( ".ant-col" )];
            const dataIndex = dataColumns.indexOf(columnElement);
            if (dataIndex > 0){
                return (headerLabels[dataIndex - 1]|| "");
            }
        }
        headerRowElement = headerRowElement.previousElementSibling;
    }
    return "";
}

function beautifyFieldId(fieldId){
    return fieldId
        .replace(new RegExp(`^${APWMS_FIELD_PREFIX}`),"")
        .replace(new RegExp(`^${PRELIM_PART_PREFIX}`),"")
        .replaceAll("_"," ")
        .replace(/\b\w/g,character => character.toUpperCase());
}

function findNearbyLabel(fieldElement){
    let parentElement = fieldElement.parentElement;

    while (parentElement){
        const labelTexts =
            Array
                .from(parentElement.childNodes)
                .filter(
                    node => node.nodeType === Node.TEXT_NODE
                )
                .map(
                    node => node.textContent.trim()
                )
                .filter(
                    text => text.length > 0
                );

        if (labelTexts.length > 0) {
            return labelTexts[0];
        }

        parentElement = parentElement.parentElement;
    }

    return "";
}