document.addEventListener(
    "DOMContentLoaded",
    async () => {
        const scanBtn = document.getElementById(ELEMENT_IDS.SCAN_BUTTON);
        const highlightModeBtn = document.getElementById(ELEMENT_IDS.HIGHLIGHT_BUTTON);
        const clearHighlightBtn = document.getElementById(ELEMENT_IDS.CLEAR_HIGHLIGHT_BUTTON);
        const exportAllBtn = document.getElementById(ELEMENT_IDS.EXPOT_ALL_BUTTON);
        const exportCurretnBtn = document.getElementById(ELEMENT_IDS.EXPOT_CURRENT_BUTTON);
        const importBtn = document.getElementById(ELEMENT_IDS.IMPORT_BUTTON);
        const fillBtn = document.getElementById(ELEMENT_IDS.FILL_BUTTON);

        const resultContainer = document.getElementById(ELEMENT_IDS.RESULT_CONTAINER);
        const importFileInput = document.getElementById(ELEMENT_IDS.IMPORT_FILE_INPUT);
        const loadedFile = localStorage.getItem("loadedFile");

        await renderImportInfo(`
            <div class="infoBox">
                📄 Previously Loaded File:
                <b>${loadedFile}</b>
                <br>
                <small>Please import again before filling.</small>
            </div>
        `);
        
        scanBtn.addEventListener(
            "click",
            async () => {
                try {
                    const [tab] = await getCurrentTab();
                    const scanResults = await chrome.tabs.sendMessage(tab.id,{action: ACTIONS.SCAN_FORM});
                    renderScanResults(scanResults,tab.id);
                }catch(error){
                    resultContainer.textContent = "Scan Failed:\n" + error.message;
                    console.error(error);
                }
            }
        );
        
        importBtn.addEventListener("click",() => {importFileInput.click();});

        highlightModeBtn.addEventListener(
            "click",
            async () => {
                const [tab] = await getCurrentTab();
                await chrome.tabs.sendMessage(
                    tab.id,
                    {action: ACTIONS.HIGHLIGHT_FORM}
                );
            }
        );

        clearHighlightBtn.addEventListener(
            "click",
            async () => {
                const [tab] = await getCurrentTab();
                await chrome.tabs.sendMessage(
                    tab.id,
                    {action: ACTIONS.CLEAR_HIGHLIGHT}
                );
            }
        );

        exportAllBtn.addEventListener(
            "click",
            async () => {
                const [tab] = await getCurrentTab();
                await chrome.tabs.sendMessage(
                    tab.id,
                    {action: ACTIONS.EXPORT_ALL_EXCEL}
                );
            }
        );

        exportCurretnBtn.addEventListener(
            "click",
            async () => {
                const [tab] = await getCurrentTab();
                await chrome.tabs.sendMessage(
                    tab.id,
                    {action: ACTIONS.EXPORT_CURRENT_EXCEL}
                );
            }
        );

        importFileInput.addEventListener(
            "change",
            async (e) => {
                const files = [...e.target.files];
                if (files.length === 0) {
                    return;
                }
                let importedTestCases = 0;
                let importedSupportFiles = 0;
                for (const file of files){
                    if (file.size >MAX_FILE_SIZE_MB * 1024 * 1024){
                        alert(`"${file.name}" is too large.\n\n` +`Maximum supported size: ${MAX_FILE_SIZE_MB} MB`);
                        return;
                    }
                    if (file.name.endsWith(".xlsx") ||file.name.endsWith(".xls")){
                        const buffer = await file.arrayBuffer();
                        const workbook = XLSX.read(buffer);
                        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                        loadedImportRows = XLSX.utils.sheet_to_json(worksheet);
                        loadedFileName = file.name;
                        await saveTestCase(loadedFileName,loadedImportRows);
                        importedTestCases++;
                    }else{
                        console.log("saveSupportFile");
                        const imported = await saveSupportFile(file);
                        if (imported){
                            importedSupportFiles++;
                        }
                    }
                }
                localStorage.setItem("loadedFile",loadedFileName);
                
                // await debugStorage();
                await renderTestCaseList();
                await renderSupportFileList();
                await renderImportInfo(`
                    <div class="infoBox">
                        📁 Imported Test Cases: <b>${importedTestCases}</b>
                        <br>
                        📄 Support Files: <b>${importedSupportFiles}</b>
                        <br>
                        Last Loaded:
                        <b>${loadedFileName}</b>
                    </div>
                `);
            }
        );

        fillBtn.addEventListener(
            "click",
            async () => {
                if (!loadedImportRows || loadedImportRows.length === 0){
                    alert("Please load an Excel file first.");
                    return;
                }
                const [tab] = await getCurrentTab();
                await chrome.tabs.sendMessage(
                    tab.id,
                    {
                        action: ACTIONS.FILL_FORM,
                        importRows: loadedImportRows,
                        fileName: loadedFileName
                    }
                );

            }
        );

        await renderTestCaseList();
        await renderSupportFileList();
    });

async function getCurrentTab(){
    return await chrome.tabs.query({active: true,currentWindow: true});
}

async function renderImportInfo(message){
    const importInfo = document.getElementById(ELEMENT_IDS.IMPORT_INFO);
    if (!importInfo){
        return;
    }
    importInfo.innerHTML = message;
}

function renderScanResults(scanResults,tabId){
    const resultContainer = document.getElementById(ELEMENT_IDS.RESULT_CONTAINER);
    resultContainer.innerHTML = "";
    scanResults.forEach(fieldInfo => {
        const resultRow = document.createElement("div");
        resultRow.className = "scanResultRow";
        resultRow.innerHTML = ` 
            <b>[${fieldInfo.fieldId}]</b>
            <br>
                <b>tag:</b>
                ${fieldInfo.tagName || "(empty)"}
            <br>

            <b>attributes:</b>
            <pre class="scanResultPre">
                ${JSON.stringify(fieldInfo.attributes, null, 2 )}
            </pre>

            <b>computed:</b>
            <pre class="scanResultPre">
                ${JSON.stringify(fieldInfo.computed,null,2)}
            </pre>

            <b>html:</b>
            <pre class="scanHtmlPreview">
                ${fieldInfo.parentHtml  || "(empty)"}
            </pre>
        `;

        const highlightButton = document.createElement("button");
        highlightButton.textContent = "Highlight";
        highlightButton.style.display = "block";
        highlightButton.style.marginTop = "4px";
        highlightButton.addEventListener(
            "click",
            async () => {
                console.log("Highlight clicked",fieldInfo);
                try{
                    await chrome.tabs.sendMessage(tabId,{action: ACTIONS.HIGHLIGHT_FORM,fieldInfo: fieldInfo});
                }catch (error){
                    console.error(error);
                }
            }
        );
        resultRow.appendChild(highlightButton);
        resultContainer.appendChild(resultRow);
    });
}