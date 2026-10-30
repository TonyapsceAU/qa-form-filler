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

    return fieldElement.value || "";
}
