function enableHighlightMode(){ 
    console.group("[HIGHLIGHT] Enable");
    disableHighlightMode();
    const fieldElements = getIndexedFields();
    console.log("Fields Found:",fieldElements.length);
    fieldElements.forEach((fieldElement,index) => {
        if (DEBUG.HIGHLIGHT){
            console.table(
                fieldElements.map(
                    (fieldElement,index)=>({
                        index,
                        label:getDisplayLabel(fieldElement),
                        value:getFieldValue(fieldElement),
                        type:fieldElement.tagName
                    })
                )
            );
        }
        const elementType = `${fieldElement.tagName}${fieldElement.type ? `(${fieldElement.type})` : ''}`;
        const color = TYPE_COLORS[elementType] || "#cccccc";
        fieldElement.style.outline = `3px solid ${color}`;
        fieldElement.style.backgroundColor = `${color}22`;

        const label = getDisplayLabel(fieldElement);

        const marker = document.createElement("span");
        marker.textContent = `[${index + 1}]`;
        marker.style.background = color;
        marker.style.color = "white";
        marker.style.fontSize = "10px";
        marker.style.padding = "2px 4px";
        marker.style.marginRight = "4px";
        marker.style.borderRadius = "3px";
        marker.style.fontWeight = "bold";
        marker.className = "qa-highlight-marker";
        fieldElement.parentNode?.insertBefore(marker,fieldElement);
        // marker.textContent = `[${index}] ${fieldElement.tagName}, ${label}`;
        marker.textContent = `[${index}]`;
        fieldElement.setAttribute(
            "placeholder",
            `[${index + 1}]`
        );
    });
    console.log("[HIGHLIGHT] Complete");
    console.groupEnd();
}

function disableHighlightMode(){
    console.group("[HIGHLIGHT] Disable");
    // Remove markers
    document
        .querySelectorAll(".qa-highlight-marker")
        .forEach(marker => marker.remove());

    // Remove styles
    document
        .querySelectorAll(
            'input, textarea, select, [contenteditable="true"]'
        )
        .forEach(fieldElement => {
            fieldElement.style.outline = "";
            fieldElement.style.backgroundColor = "";
        });
    console.log("Highlight Removed");
    console.groupEnd();
}
