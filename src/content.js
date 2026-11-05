console.log("QA Form Filler Loaded");
injectPageBridge();
chrome.runtime.onMessage.addListener(
    (request,_sender,sendResponse) => {
        (async () => {
            try {
                switch (request.action) {
                    case ACTIONS.SCAN_FORM:
                        sendResponse(scanForm());
                        break;
                    case ACTIONS.HIGHLIGHT_FORM:
                        enableHighlightMode();
                        sendResponse({success: true});
                        break;
                    case ACTIONS.EXPORT_EXCEL:
                        exportToExcel();
                        sendResponse({success: true});
                        break;
                    case ACTIONS.FILL_FORM:
                        await fillImportedRows(
                            request.importRows,
                            request.fileName
                        );
                        sendResponse({success: true});
                        break;
                    case ACTIONS.CLEAR_HIGHLIGHT:
                        disableHighlightMode();
                        sendResponse({success: true});
                        break;
                    default:
                        console.warn("Unknown action:",request.action);
                        sendResponse({success: false,error: `Unknown action: ${request.action}`});
                        break;
                }
            }catch(error){
                console.error(error);
                sendResponse({success: false,error: error.message});
            }
        })();
        return true;
    }
);

function injectPageBridge(){
    if (document.getElementById("qa-page-bridge")){
        return;
    }

    const script =document.createElement("script");
    script.id ="qa-page-bridge";
    script.src =chrome.runtime.getURL("src/pageBridge.js");
    document.documentElement.appendChild(script);
    script.remove();
    console.log("[QA] Page Bridge Injected");
}