async function saveTestCase(fileName,importRows){
    console.log("[TEST CASE] Saving:",fileName,`(${importRows.length} rows)`);
    const result = await chrome.storage.local.get(STORAGE_KEYS.TEST_CASES);
    const testCases = result[STORAGE_KEYS.TEST_CASES] || {};
    testCases[fileName] = {
        fileName,
        importRows,
        savedAt: new Date().toISOString()
    };
    await chrome.storage.local.set({[STORAGE_KEYS.TEST_CASES]: testCases});
    console.log("[TEST CASE] Saved:",fileName);
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
        testCaseList.appendChild(
            createTestCaseRow(testCase)
        );
    });
    console.log("[TEST CASE LIST]",Object.keys(testCases).length,"item(s)");
}

function createTestCaseRow(testCase){
    const row = document.createElement("div");
    // row.style.marginBottom = "4px";
    row.className = "listRow";
    row.innerHTML = `
        <div class="listRowContent">
            <button
                class="load-test-case"
                data-file="${testCase.fileName}"
            >
                Load
            </button>

            <span class="listName">
                ${testCase.fileName}
            </span>

            <button class="delete-test-case deleteButton">
                🗑
            </button>
        </div>
    `;
    const loadButton = row.querySelector(".load-test-case");
    loadButton.addEventListener(
        "click",() => {
            loadTestCase(testCase);
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
    return row;
}

function loadTestCase(testCase){
    console.log("[TEST CASE] Loaded:",testCase.fileName);
    loadedImportRows = testCase.importRows;
    loadedFileName = testCase.fileName;
    console.log("[TEST CASE] Loaded Rows:",loadedImportRows);
    const totalRows = 
        loadedImportRows.length? loadedImportRows.reduce((sum,page) => 
            sum + page.importRows.length,0): loadedImportRows.length;
    renderImportInfo(`
        <div class="infoBox">
            📄 Loaded File:<b>${loadedFileName}</b>
            <br>
            Sheets:<b>${loadedImportRows.length || 1}</b>
            <br>
            Rows:<b>${totalRows}</b>
        </div>
    `);
}

async function deleteTestCase(fileName){
    console.log("[TEST CASE] Deleting:",fileName);
    const result = await chrome.storage.local.get(STORAGE_KEYS.TEST_CASES);
    const testCases =result[STORAGE_KEYS.TEST_CASES] || {};
    delete testCases[fileName];
    await chrome.storage.local.set({
        [STORAGE_KEYS.TEST_CASES]: testCases
    });
    console.log("[TEST CASE] Deleted:",fileName);
}

async function saveSupportFile(file){
    const buffer = await file.arrayBuffer();
    const bytesUsed = await chrome.storage.local.getBytesInUse();
    const remaining = (10 * 1024 * 1024) - bytesUsed;
    if (buffer.byteLength > remaining){
        alert("Not enough storage space.\n\n" +"Please remove unused support files.");
        return false;
    }
    console.log("[SUPPORT FILE] Importing:",file.name,`(${Math.round(file.size / 1024)} KB)`);
    const result = await chrome.storage.local.get(STORAGE_KEYS.SUPPORT_FILES);
    const supportFiles = result[STORAGE_KEYS.SUPPORT_FILES] || {};
    supportFiles[file.name] = {
        name: file.name,
        type: file.type,
        size: file.size,
        importedAt: new Date().toISOString(),
        buffer: Array.from(new Uint8Array(await file.arrayBuffer()))
    };
    
    await chrome.storage.local.set({[STORAGE_KEYS.SUPPORT_FILES]:supportFiles});
    console.log("[SUPPORT FILE] Imported:",file.name);
    return true;
}

async function getSupportFiles(){
    const result = await chrome.storage.local.get(STORAGE_KEYS.SUPPORT_FILES);
    return (result[STORAGE_KEYS.SUPPORT_FILES] || {});
}

async function getSupportFile(fileName){
    const supportFiles = await getSupportFiles();
    const supportFile = supportFiles[fileName];
    if (!supportFile){
        console.warn("[SUPPORT FILE] Not Found:",fileName);
        // console.groupEnd();
        return null;
    }
    console.log("[SUPPORT FILE] Loaded:",fileName);
    return new File(
        [new Uint8Array(supportFile.buffer)],
        supportFile.name,
        {type: supportFile.type}
    );
}

async function uploadFile(fileInput,file){
    const allInputs = [
        ...document.querySelectorAll(
            'input[type="file"]'
        )
    ];
    const inputIndex = allInputs.indexOf(fileInput);
    const buffer = await file.arrayBuffer();
    window.postMessage({
        type:"QA_UPLOAD_FILE",
        inputIndex,
        fileName:file.name,
        fileType:file.type,
        fileBytes:[
            ...new Uint8Array(buffer)
        ]
    },"*");
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
            supportFileList.appendChild(createSupportFileRow(file));
        });
    console.log("[SUPPORT FILE LIST]",Object.keys(supportFiles).length,"item(s)");
}

function createSupportFileRow(file){
    const row = document.createElement("div");
    row.className = "listRow";
    row.innerHTML = `
        <div class="listRowContent">
            <button class="preview-support-file" >
                Preview
            </button>

            <span class="listName">
                ${file.name}
                <small>
                    (${Math.round(file.size / 1024)} KB)
                </small>
            </span>

            <button class="delete-support-file deleteButton" >
                🗑
            </button>

        </div>
    `;

    const previewButton = row.querySelector(".preview-support-file");
    previewButton.addEventListener(
        "click",
        async () => {
            console.log("[SUPPORT FILE] Preview:",file.name);
            const supportFile =await getSupportFile(file.name);
            if (!supportFile){
                alert(`Unable to open "${file.name}".`);
                return;
            }
            const url =URL.createObjectURL(supportFile);
            window.open(url,"_blank");
        }
    );

    const deleteButton = row.querySelector(".delete-support-file");
    deleteButton.addEventListener(
        "click",
        async () => {
            if (!confirm(`Delete "${file.name}" ?`)){
                return;
            }
            await deleteSupportFile(file.name);
            await renderSupportFileList();
        }
    );

    return row;
}

async function loadSupportFile(file){
    const supportFile = await getSupportFile(file.name);
    console.log("[SUPPORT FILE]",supportFile);
    await renderImportInfo(`
        <div class="infoBox">
            📄 Loaded Support File:
            <b>${file.name}</b>
            <br>
            Size:
            <b>${Math.round(file.size / 1024)} KB</b>
        </div>
    `);
}

async function deleteSupportFile(fileName){
    console.log("[SUPPORT FILE] Deleting:",fileName);
    const result = await chrome.storage.local.get(STORAGE_KEYS.SUPPORT_FILES);
    const supportFiles = result[STORAGE_KEYS.SUPPORT_FILES] || {};
    delete supportFiles[fileName];
    await chrome.storage.local.set({
        [STORAGE_KEYS.SUPPORT_FILES]:
            supportFiles
    });
    console.log("[SUPPORT FILE] Deleted:",fileName);
}