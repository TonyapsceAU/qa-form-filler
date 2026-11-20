function scanForm(){
    const fieldInfos = [];
    document
        .querySelectorAll('input[type="text"]')
        .forEach(fieldElement => {
            console.log(fieldElement);
            fieldInfos.push(createFieldInfo(fieldElement,fieldInfos.length + 1));
        });
    return fieldInfos;
}

function createFieldInfo(fieldElement, fieldId){
    return {
        fieldId,
        tagName: fieldElement.tagName,
        attributes: getAttributes(fieldElement),
        computed: {
            hidden: isHidden(fieldElement),
            value: getFieldValue(fieldElement)
        },
        parentHtml:fieldElement.parentElement?.outerHTML.substring(0, 500)
    };
}

function getAttributes(fieldElement){
    const attributes = {};
    for (const attribute of fieldElement.attributes){
        attributes[attribute.name] = attribute.value;
    }
    return attributes;
}

function isHidden(fieldElement){
    const style = window.getComputedStyle(fieldElement);
    return (
        fieldElement.type === "hidden" ||
        style.display === "none" ||
        style.visibility === "hidden"
    );
}

function getFieldValue(fieldElement){
    if (fieldElement.type === "radio"){
        return fieldElement.checked;
    }

    if (fieldElement.type === "checkbox"){
        return fieldElement.checked;
    }

    if (fieldElement.getAttribute("contenteditable") === "true"){
        return fieldElement.innerText.trim();
    }
    if (fieldElement.type === "file"){
        const selectedFiles = [...(fieldElement.files || [])]
            .map(file => file.name)
            .join("\n");
        if (selectedFiles){
            return selectedFiles;
        }

        const uploadContainer = fieldElement.closest(".single-file-upload-container");
        return [...(uploadContainer?.querySelectorAll(
            ".single-file-upload-file-name, .ant-upload-list-item-name"
        ) || [])]
            .map(fileNameElement =>
                fileNameElement.getAttribute("title")?.trim() ||
                fileNameElement.textContent?.trim()
            )
            .filter(Boolean)
            .join("\n");
    }
    if (fieldElement.tagName === "SELECT"){
        const selectedValues = [...fieldElement.selectedOptions]
            .map(option => option.value);
        return fieldElement.multiple
            ? selectedValues.join("\n")
            : (selectedValues[0] ?? "");
    }
    if (fieldElement.closest(".ant-select")){
        const selectedItems = [...fieldElement.closest(".ant-select")
            .querySelectorAll(".ant-select-selection-item")]
            .map(item => item.getAttribute("title") || item.textContent?.trim())
            .filter(Boolean);
        if (selectedItems.length){
            return selectedItems.join("\n");
        }
        return fieldElement.value?.trim();
    }
    return fieldElement.value || "";
}
