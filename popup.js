document.addEventListener(
    "DOMContentLoaded",
    () => {
        const scanBtn = document.getElementById("scanBtn");
        const resultContainer = document.getElementById("resultContainer");
        const highlightModeBtn = document.getElementById("highlightModeBtn");
        const clearHighlightBtn = document.getElementById("clearhighlightBtn");
        const exportBtn = document.getElementById("exportBtn");
        const importBtn = document.getElementById("importBtn");
        const importFileInput = document.getElementById("importFile");
        const ACTIONS = {
            SCAN_FORM: "scanForm",
            HIGHLIGHT_FORM: "highlightForm",
            CLEAR_HIGHLIGHT: "clearHighlight",
            EXPORT_EXCEL: "exportExcel",
            IMPORT_EXCEL: "importExcel"
        };
        scanBtn.addEventListener(
            "click",
            async () => {
                try {
                    const [tab] = await chrome.tabs.query({active: true,currentWindow: true});
                    const scanResults = await chrome.tabs.sendMessage(tab.id,{action: "scanForm"});
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
                const file = e.target.files?.[0];
                if (!file) {
                    return;
                }

                const buffer = await file.arrayBuffer();

                const [tab] =
                    await chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    });

                await chrome.tabs.sendMessage(
                    tab.id,
                    {
                        action: ACTIONS.IMPORT_EXCEL,
                        buffer: Array.from(new Uint8Array(buffer))
                    }
                );
            }
        );
    });