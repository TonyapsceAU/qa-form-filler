console.log("QA Form Filler Loaded");
chrome.runtime.onMessage.addListener(
    (request,_sender,sendResponse) => {
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
            case ACTIONS.IMPORT_EXCEL:
                importExcel(request.buffer);
                sendResponse({success: true});
                break;
            case ACTIONS.CLEAR_HIGHLIGHT:
                disableHighlightMode();
                sendResponse({success: true});
                break;
            default:
                console.warn("Unknown action:",request.action);
                break;
        }
        return true;
    }
);