function getIndexedFields(){
    return [...document.querySelectorAll('input, textarea, [contenteditable="true"]')];
    // .filter(fieldElement => isRealField(fieldElement))
    // .map((fieldElement,index) => ({
    //     index,
    //     fieldElement
    // }));
}

function extractElementData(fieldElement){
    const elementData  = {};

    for (const key in fieldElement){
        try{
            const value = fieldElement[key];
            if (value === null || value === undefined ){
                continue;
            }

            if (typeof value === "string" && value.trim() === ""){
                continue;
            }

            if (Array.isArray(value) && value.length === 0){
                continue;
            }

            if (
                typeof value === "string" ||
                typeof value === "number" ||
                typeof value === "boolean"
            ){
                elementData[key] = value;
            }
        }catch{
            //
        }
    }
    elementData.outerHTML = fieldElement.outerHTML;
    return elementData;
}