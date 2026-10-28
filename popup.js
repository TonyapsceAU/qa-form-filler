document.addEventListener(
    "DOMContentLoaded",
    () => {
        const scanBtn = document.getElementById("scanBtn");
        const result = document.getElementById("result");
        const highlightModeBtn = document.getElementById("highlightModeBtn");
        const clearhighlightBtn = document.getElementById("clearhighlightBtn");
        const exportBtn = document.getElementById("exportBtn");
        const importBtn = document.getElementById("importBtn");
        const importFile = document.getElementById("importFile");

        scanBtn.addEventListener(
            "click",
            async () => {
                try {
                    const [tab] =
                        await chrome.tabs.query({
                            active: true,
                            currentWindow: true
                        });

                    const response =
                        await chrome.tabs.sendMessage(
                            tab.id,
                            {
                                action: "scanForm"
                            }
                        );
                            
                    result.innerHTML = "";
                    response.forEach(field => {

                        const row =
                            document.createElement("div");

                        row.style.borderBottom =
                            "1px solid #ddd";

                        row.style.padding =
                            "4px";

                        row.style.marginBottom =
                            "4px";

                        row.innerHTML = `
                            <b>[${field.fieldId}]</b><br>

                            <b>tag:</b>
                            ${field.tag || "(empty)"}<br>

                            <b>attributes:</b>
                            <pre style="
                                margin:2px 0;
                                white-space:pre-wrap;
                                word-break:break-word;
                            ">${JSON.stringify(
                                field.attributes,
                                null,
                                2
                            )}</pre>

                            <b>computed:</b>
                            <pre style="
                                margin:2px 0;
                                white-space:pre-wrap;
                                word-break:break-word;
                            ">${JSON.stringify(
                                field.computed,
                                null,
                                2
                            )}</pre>

                            <b>html:</b>
                            <pre style="
                                margin:2px 0;
                                max-height:150px;
                                overflow:auto;
                                white-space:pre-wrap;
                                word-break:break-word;
                            ">${field.html || "(empty)"}</pre>
                        `;

                        const btn =
                            document.createElement("button");

                        btn.textContent =
                            "Highlight";

                        btn.style.display =
                            "block";

                        btn.style.marginTop =
                            "4px";

                        btn.addEventListener(
                            "click",
                            async () => {

                                console.log(
                                    "Highlight clicked",
                                    field
                                );

                                try
                                {
                                    await chrome.tabs.sendMessage(
                                        tab.id,
                                        {
                                            action: "highlight",
                                            field: field
                                        }
                                    );
                                }
                                catch (error)
                                {
                                    console.error(error);
                                }
                            }
                        );

                        row.appendChild(btn);

                        result.appendChild(row);
                    });
                }
                catch(error) {
                    result.textContent =
                        "Scan Failed:\n" +
                        error.message;

                    console.error(error);
                }

            }
        );
        
        importBtn.addEventListener("click",() => {importFile.click();});

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
                    {
                        action: "highlight"
                    }
                );
            }
        );

        clearhighlightBtn.addEventListener(
            "click",
            async () => {
                const [tab] =
                    await chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    });

                await chrome.tabs.sendMessage(
                    tab.id,
                    {
                        action: "Clearhighlight"
                    }
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
                    {
                        action: "exportScan"
                    }
                );
            }
        );

        importFile.addEventListener(
            "change",
            async (e) => {

                const file =
                    e.target.files?.[0];

                if (!file) {
                    return;
                }

                const buffer =
                    await file.arrayBuffer();

                const [tab] =
                    await chrome.tabs.query({
                        active: true,
                        currentWindow: true
                    });

                await chrome.tabs.sendMessage(
                    tab.id,
                    {
                        action: "importExcel",
                        buffer: Array.from(
                            new Uint8Array(buffer)
                        )
                    }
                );
            }
        );
    });