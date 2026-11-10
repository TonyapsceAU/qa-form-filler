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

function showValidationError(fileName,report){

    const overlayElement =
        document.getElementById(
            IMPORT_OVERLAY_ID
        );

    if (!overlayElement){
        return;
    }

    const totalIssues =
        report.nameMismatches.length +
        report.typeMismatches.length +
        report.missingFields.length +
        (
            report.rowCountMismatch
                ? 1
                : 0
        );

    const detailRows = [

        ...report.nameMismatches.map(
            item => ({
                issue: "Name",
                fieldIndex:
                    item.fieldIndex,
                expected:
                    item.expectedName,
                actual:
                    item.actualName
            })
        ),

        ...report.typeMismatches.map(
            item => ({
                issue: "Type",
                fieldIndex:
                    item.fieldIndex,
                expected:
                    item.expectedType,
                actual:
                    item.actualType
            })
        ),

        ...report.missingFields.map(
            item => ({
                issue: "Missing",
                fieldIndex:
                    item.fieldIndex,
                expected:
                    item.field,
                actual:
                    "Not Found"
            })
        )

    ]
    .slice(0,10)
    .map(item => `
        <tr>
            <td>${item.fieldIndex}</td>
            <td>${item.issue}</td>
            <td>${item.expected}</td>
            <td>${item.actual}</td>
        </tr>
    `)
    .join("");

    overlayElement.innerHTML = `
        <div style="
            background:white;
            padding:24px 32px;
            border-radius:8px;
            max-width:900px;
            max-height:80vh;
            overflow:auto;
            box-shadow:0 4px 12px rgba(0,0,0,.3);
        ">

            <div style="
                color:#d32f2f;
                font-size:20px;
                font-weight:bold;
                margin-bottom:16px;
            ">
                ⚠ Structure Validation Failed
            </div>

            <div style="margin-bottom:12px;">
                <b>File:</b><br>
                ${fileName}
            </div>

            <div style="
                display:grid;
                grid-template-columns:repeat(2,1fr);
                gap:12px;
                margin-bottom:20px;
            ">

                <div>
                    <b>Excel Fields</b><br>
                    ${report.excelFields}
                </div>

                <div>
                    <b>Form Fields</b><br>
                    ${report.formFields}
                </div>

                <div>
                    <b>Name Mismatches</b><br>
                    ${report.nameMismatches.length}
                </div>

                <div>
                    <b>Type Mismatches</b><br>
                    ${report.typeMismatches.length}
                </div>

                <div>
                    <b>Missing Fields</b><br>
                    ${report.missingFields.length}
                </div>

                <div>
                    <b>Total Issues</b><br>
                    ${totalIssues}
                </div>

            </div>

            ${
                report.rowCountMismatch
                ? `
                    <div style="
                        margin-bottom:16px;
                        padding:12px;
                        background:#fff3cd;
                        border:1px solid #ffe69c;
                        border-radius:4px;
                    ">
                        <b>Row Count Mismatch</b><br>

                        Excel: ${report.excelFields}<br>
                        Form: ${report.formFields}
                    </div>
                `
                : ""
            }

            ${
                detailRows
                ? `
                    <div style="margin-top:20px;">

                        <div style="
                            font-weight:bold;
                            margin-bottom:10px;
                        ">
                            First 10 Issues
                        </div>

                        <table style="
                            width:100%;
                            border-collapse:collapse;
                            font-size:13px;
                        ">
                            <thead>
                                <tr style="
                                    background:#f5f5f5;
                                ">
                                    <th style="padding:8px;border:1px solid #ddd;">#</th>
                                    <th style="padding:8px;border:1px solid #ddd;">Issue</th>
                                    <th style="padding:8px;border:1px solid #ddd;">Expected</th>
                                    <th style="padding:8px;border:1px solid #ddd;">Actual</th>
                                </tr>
                            </thead>

                            <tbody>
                                ${detailRows}
                            </tbody>
                        </table>

                    </div>
                `
                : ""
            }

            <div style="
                margin-top:20px;
                color:#444;
                line-height:1.6;
            ">
                The Excel template appears to be incompatible with the current APWMS form structure.
                <br><br>
                Please export a fresh template and re-enter the data before importing again.
            </div>

            <div style="
                margin-top:20px;
                text-align:right;
            ">
                <button
                    id="qa-validation-close"
                    style="
                        padding:8px 16px;
                        border:none;
                        border-radius:4px;
                        background:#1976d2;
                        color:white;
                        cursor:pointer;
                    "
                >
                    OK
                </button>
            </div>

        </div>
    `;

    document
        .getElementById(
            "qa-validation-close"
        )
        ?.addEventListener(
            "click",
            hideImportOverlay
        );
}