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
            <div id="qa-import-status">
                Importing Excel...
            </div>

            <div style="
                width:100%;
                height:20px;
                background:#eee;
                border-radius:10px;
                overflow:hidden;
                margin-top:12px;
            ">
                <div
                    id="qa-import-progress"
                    style="
                        width:0%;
                        height:100%;
                        background:#4caf50;
                        transition:width .2s;
                    ">
                </div>
            </div>

            <div
                id="qa-import-progress-text"
                style="
                    margin-top:8px;
                    text-align:center;
                ">
                0%
            </div>
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

function updateImportProgress(current,total,statusText = "Importing Excel..."){
    const progressBar = document.getElementById("qa-import-progress");
    const progressText = document.getElementById("qa-import-progress-text");
    const statusElement = document.getElementById("qa-import-status");
    if (!progressBar ||!progressText ||!statusElement){
        return;
    }
    const safeTotal = Math.max(total, 1);
    const percentage = Math.min(100,Math.round((current / safeTotal) * 100));
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${percentage}% (${current}/${total})`;
    statusElement.textContent = statusText;
}