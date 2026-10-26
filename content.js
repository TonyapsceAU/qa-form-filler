console.log("QA Form Filler Loaded");
chrome.runtime.onMessage.addListener(
    (
        request,
        sender,
        sendResponse
    ) => {
        if (request.action === "scanForm"){
            sendResponse(
                scanForm()
            );
        }
    }
);

function scanForm(){
    //console.log("scanform");
    const fields = [];
    scanStandardFields(fields);
    scanRichTextFields(fields);
    return fields;
}

// scane
function scanStandardFields(fields){
    //console.log("scanStandardFields");
    document
        .querySelectorAll("input, textarea, select")
        .forEach(el => {
            if (!shouldSkipElement(el)) {
                fields.push(createFieldInfo(el,fields.length + 1));
            }
        });
}

function scanRichTextFields(fields){
    //console.log("scanRichTextFields");
    document
        .querySelectorAll('[contenteditable="true"]')
        .forEach(el => {
            fields.push(createRichTextInfo(el,fields.length + 1));
        });
}

// info
function createFieldInfo(el,fieldId){
    //console.log("createFieldInfo");
    return {
        fieldId: fieldId,
        label: findLabel(el),
        // tagName: el.tagName,
        type: el.type || "unknown",
        // id:el.id || "",
        // name:el.name || "",
        // placeholder:el.placeholder || "",
        // required:el.required || false,
        // className:el.className || "",
        // value:el.value || "",
        // outerHTML:getShortHtml(el)
        selector: generateSelector(el)
    };
}


function createRichTextInfo(el,fieldId){
    //console.log("createRichTextInfo");
    return {
        fieldId: fieldId,
        label: findLabel(el),
        // tagName: el.tagName,
        type: el.type || "richtext",
        // id:el.id || "",
        // name:el.name || "",
        // placeholder:el.placeholder || "",
        // required:el.required || false,
        // className:el.className || "",
        // value:el.value || "",
        // outerHTML:getShortHtml(el)
        selector: generateSelector(el)
    };
}

// helper
function getShortHtml(el){
    //console.log("getShortHtml");
    return el.outerHTML.substring(0, 200);
}

function getShortText(el){
    //console.log("getShortText");
    return el.innerText
        .trim()
        .substring(0, 100);
}

function shouldSkipElement(el){
    return (
        el.closest(".ql-toolbar") ||
        el.closest(".note-toolbar")
    );
}

function findNearbyLabel(el){
    //console.log("findNearbyLabel");
    let parent = el.parentElement;
    while (parent){
        const texts = Array
            .from(parent.childNodes)
            .filter(node => node.nodeType === Node.TEXT_NODE)
            .map(node => node.textContent.trim())
            .filter(text => text.length > 0);

        if (texts.length > 0){
            return texts[0];
        }

        parent = parent.parentElement;
    }

    return "";
}

function generateSelector(el){
    if (el.id)    {
        return "#" + el.id;
    }

    if (el.name)    {
        return `[name="${el.name}"]`;
    }

    return buildCssPath(el);
}

function buildCssPath(el){
    let path = [];

    while (
        el &&
        el.nodeType === Node.ELEMENT_NODE
    ){
        let selector = el.nodeName.toLowerCase();

        if (el.id){
            selector += "#" + el.id;
            path.unshift(selector);
            break;
        }

        path.unshift(selector);
        el = el.parentElement;
    }

    return path.join(" > ");
}

function findLabel(el){
    if (!el.id){
        return "";
    }

    const label = document.querySelector(`label[for="${el.id}"]`);
    if (!label)    {
        return "";
    }

    return label.innerText.trim();
}