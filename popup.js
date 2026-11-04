document.addEventListener(
    "DOMContentLoaded",
    async () => {
        // console.log("[SYSTEM]",getBrowserName());
        // const testCases = await getTestCases();
        // console.log("[STORAGE] Test Cases");
        // console.log(testCases);
        // console.table(Object.keys(testCases));

        const scanBtn = document.getElementById(ELEMENT_IDS.SCAN_BUTTON);
        const highlightModeBtn = document.getElementById(ELEMENT_IDS.HIGHLIGHT_BUTTON);
        const clearHighlightBtn = document.getElementById(ELEMENT_IDS.CLEAR_HIGHLIGHT_BUTTON);
        const exportBtn = document.getElementById(ELEMENT_IDS.EXPORT_BUTTON);
        const importBtn = document.getElementById(ELEMENT_IDS.IMPORT_BUTTON);
        const fillBtn = document.getElementById(ELEMENT_IDS.FILL_BUTTON);

        const resultContainer = document.getElementById(ELEMENT_IDS.RESULT_CONTAINER);
        const importFileInput = document.getElementById(ELEMENT_IDS.IMPORT_FILE_INPUT);
        const importInfo = document.getElementById(ELEMENT_IDS.IMPORT_INFO);
        const loadedFile = localStorage.getItem("loadedFile");

        if (importInfo && loadedFile){
            importInfo.innerHTML = `
                <div style="
                    margin:8px 0;
                    padding:8px;
                    border-radius:4px;
                    background:#f0f8ff;
                ">
                    📄 Previously Loaded File:
                    <b>${loadedFile}</b>
                    <br>
                    <small>Please import again before filling.</small>
                </div>
            `;
        }
        
        scanBtn.addEventListener(
            "click",
            async () => {
                try {
                    const [tab] = await chrome.tabs.query({active: true,currentWindow: true});
                    const scanResults = await chrome.tabs.sendMessage(tab.id,{action: ACTIONS.SCAN_FORM});
                    resultContainer.innerHTML = "";
                    scanResults.forEach(fieldInfo => {
                        const resultRow = document.createElement("div");
                        resultRow.style.borderBottom = "1px solid #ddd";
                        resultRow.style.padding = "4px";
                        resultRow.style.marginBottom = "4px";
                        resultRow.innerHTML = ` 
                            <b>[${fieldInfo.fieldId}]</b>
                            <br>
                                <b>tag:</b>
                                ${fieldInfo.tagName || "(empty)"}
                            <br>

                            <b>attributes:</b>
                            <pre style="
                                margin:2px 0;
                                white-space:pre-wrap;
                                word-break:break-word;
                            ">
                                ${JSON.stringify(fieldInfo.attributes, null, 2 )}
                            </pre>

                            <b>computed:</b>
                            <pre style="
                                margin:2px 0;
                                white-space:pre-wrap;
                                word-break:break-word;
                            ">
                                ${JSON.stringify(fieldInfo.computed,null,2)}
                            </pre>

                            <b>html:</b>
                            <pre style="
                                margin:2px 0;
                                max-height:150px;
                                overflow:auto;
                                white-space:pre-wrap;
                                word-break:break-word;
                            ">
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
                                    await chrome.tabs.sendMessage(tab.id,{action: ACTIONS.HIGHLIGHT_FORM,fieldInfo: fieldInfo});
                                }catch (error){
                                    console.error(error);
                                }
                            }
                        );
                        resultRow.appendChild(highlightButton);
                        resultContainer.appendChild(resultRow);
                    });
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
                const [tab] =
                    await chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    });

                await chrome.tabs.sendMessage(
                    tab.id,
                    {action: ACTIONS.HIGHLIGHT_FORM}
                );
            }
        );

        clearHighlightBtn.addEventListener(
            "click",
            async () => {
                const [tab] =
                    await chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    });

                await chrome.tabs.sendMessage(
                    tab.id,
                    {action: ACTIONS.CLEAR_HIGHLIGHT}
                );
            }
        );

        exportBtn.addEventListener(
            "click",
            async () => {
                const [tab] =
                    await chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    });

                await chrome.tabs.sendMessage(
                    tab.id,
                    {action: ACTIONS.EXPORT_EXCEL}
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
                for (const file of files){
                    const buffer = await file.arrayBuffer();
                    const workbook = XLSX.read(buffer);
                    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
                    loadedImportRows = XLSX.utils.sheet_to_json(worksheet);
                    loadedFileName = file.name;
                    await saveTestCase(loadedFileName,loadedImportRows);
                }
                localStorage.setItem("loadedFile",loadedFileName);
                
                // await debugStorage();
                await renderTestCaseList();
                if (importInfo){
                    importInfo.innerHTML = `
                        <div style="
                            margin:8px 0;
                            padding:8px;
                            border-radius:4px;
                            background:#f0f8ff;
                        ">
                            📁 Imported:
                            <b>${files.length}</b>
                            Test Cases
                            <br>
                            Last Loaded:
                            <b>${loadedFileName}</b>
                        </div>
                    `;
                }
            }
        );

        fillBtn.addEventListener(
            "click",
            async () => {
                if (!loadedImportRows || loadedImportRows.length === 0){
                    alert("Please load an Excel file first.");
                    return;
                }
                const [tab] = await chrome.tabs.query({active: true,currentWindow: true});
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
    });