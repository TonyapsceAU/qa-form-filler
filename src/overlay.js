function showImportOverlay(){
    if (document.getElementById(IMPORT_OVERLAY_ID)){
        return;
    }

    const overlayElement = document.createElement("div");
    overlayElement.id = IMPORT_OVERLAY_ID;
    overlayElement.innerHTML = `
        <div style="
            background:white;
            padding:20px 40px;
            border-radius:8px;
            font-size:16px;
            font-weight:bold;
            box-shadow:0 4px 12px rgba(0,0,0,.3);
        ">
            Importing Excel...
        </div>
    `;

    overlayElement.style.cssText = `
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.35);
        display:flex;
        justify-content:center;
        align-items:center;
        z-index:2147483647;
    `;

    document.body.appendChild(overlayElement);
}

function hideImportOverlay(){
    document
        .getElementById(IMPORT_OVERLAY_ID)
        ?.remove();
}