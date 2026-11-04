async function saveTestCase(fileName,importRows){
    const result = await chrome.storage.local.get(STORAGE_KEYS.TEST_CASES);
    const testCases = result[STORAGE_KEYS.TEST_CASES] || {};

    testCases[fileName] = {
        fileName,
        importRows,
        savedAt: new Date().toISOString()
    };

    await chrome.storage.local.set({[STORAGE_KEYS.TEST_CASES]: testCases});
}

async function getTestCases(){
    const result = await chrome.storage.local.get(STORAGE_KEYS.TEST_CASES);
    return (result[STORAGE_KEYS.TEST_CASES] || {});
}


async function debugStorage(){
    const data = await chrome.storage.local.get();
    console.log("[STORAGE]",data);

}

async function renderTestCaseList(){
    const testCaseList = document.getElementById(ELEMENT_IDS.TEST_CASE_LIST);
    if (!testCaseList){
        return;
    }
    const testCases = await getTestCases();
    testCaseList.innerHTML = "";

    Object.values(testCases).forEach(testCase => {
        const row = document.createElement("div");
        row.style.marginBottom = "4px";
        row.innerHTML = `
            <div style="
                display:flex;
                align-items:center;
                gap:8px;
                width:100%;
            ">
                <button
                    class="load-test-case"
                    data-file="${testCase.fileName}"
                >
                    Load
                </button>

                <span style="
                    flex:1;
                    overflow:hidden;
                    text-overflow:ellipsis;
                    white-space:nowrap;
                ">
                    ${testCase.fileName}
                </span>

                <button
                    class="delete-test-case"
                    style="
                        margin-left:auto;
                        background:#dc3545;
                        color:white;
                    "
                >
                    🗑
                </button>
            </div>
        `;
        const loadButton = row.querySelector(".load-test-case");
        loadButton.addEventListener(
            "click",() => {
                loadedImportRows = testCase.importRows;
                loadedFileName = testCase.fileName;
                importInfo.innerHTML = `
                    <div class="infoBox">
                        📄 Loaded File:<b>${loadedFileName}</b>
                        <br>
                        Rows:<b>${loadedImportRows.length}</b>
                    </div>
                `;
            }
        );

        const deleteButton = row.querySelector(".delete-test-case");
        deleteButton.addEventListener(
            "click",
            async () => {
                if (!confirm(`Delete "${testCase.fileName}" ?`)){
                    return;
                }
                await deleteTestCase(testCase.fileName);
                await renderTestCaseList();

            }
        );
        testCaseList.appendChild(row);
    });
}

async function deleteTestCase(fileName){
    const result = await chrome.storage.local.get(STORAGE_KEYS.TEST_CASES);
    const testCases =result[STORAGE_KEYS.TEST_CASES] || {};
    delete testCases[fileName];

    await chrome.storage.local.set({
        [STORAGE_KEYS.TEST_CASES]: testCases
    });

}

async function saveSupportFile(file){
    const result = await chrome.storage.local.get(STORAGE_KEYS.SUPPORT_FILES);
    const supportFiles = result[STORAGE_KEYS.SUPPORT_FILES] || {};
    supportFiles[file.name] = {
        name: file.name,
        type: file.type,
        size: file.size,
        importedAt: new Date().toISOString()
        // buffer: Array.from(new Uint8Array(await file.arrayBuffer()))
    };

    await chrome.storage.local.set({[STORAGE_KEYS.SUPPORT_FILES]:supportFiles});

}

async function getSupportFiles(){
    const result = await chrome.storage.local.get(STORAGE_KEYS.SUPPORT_FILES);
    return (result[STORAGE_KEYS.SUPPORT_FILES] || {});
}

async function getSupportFile(fileName){
    const supportFiles = await getSupportFiles();
    const supportFile = supportFiles[fileName];
    if (!supportFile){
        return null;
    }

    return new File(
        [new Uint8Array(supportFile.buffer)],
        supportFile.name,
        {type: supportFile.type}
    );
}

async function uploadFile(fileInput,file){
    if (!file){
        throw new Error("Support file not found.");
    }
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change",{ bubbles: true }));
}

async function renderSupportFileList(){
    const supportFileList = document.getElementById(ELEMENT_IDS.SUPPORT_FILE_LIST);
    if (!supportFileList){
        return;
    }
    const supportFiles = await getSupportFiles();
    supportFileList.innerHTML = "";
    Object.values(supportFiles)
        .forEach(file => {
            const row = document.createElement("div");
            row.innerHTML = `
                <div style="padding:4px 0;">
                📄 ${file.name} <small>(${Math.round(file.size / 1024)} KB)</small>
                </div>
            `;
            supportFileList.appendChild(row);
        });
}