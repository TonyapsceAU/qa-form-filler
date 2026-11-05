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
        testCaseList.appendChild(
            createTestCaseRow(testCase)
        );
    });
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
    loadedImportRows = testCase.importRows;
    loadedFileName = testCase.fileName;
    renderImportInfo(`
        <div class="infoBox">
            📄 Loaded File:<b>${loadedFileName}</b>
            <br>
            Rows:<b>${loadedImportRows.length}</b>
        </div>
    `);
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
        importedAt: new Date().toISOString(),
        buffer: Array.from(new Uint8Array(await file.arrayBuffer()))
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
    const allInputs = [
        ...document.querySelectorAll(
            'input[type="file"]'
        )
    ];
    const inputIndex = allInputs.indexOf(fileInput);
    // console.log("inputIndex",inputIndex);
    // const bridgeId = `qa-${Date.now()}-${Math.random()}`;
    // fileInput.setAttribute("data-qa-upload-id",bridgeId);
    const buffer = await file.arrayBuffer();
    // console.log(
    //     "buffer length",
    //     buffer.byteLength
    // );
    window.postMessage({
        type:"QA_UPLOAD_FILE",
        inputIndex,
        fileName:file.name,
        fileType:file.type,
        fileBytes:[
            ...new Uint8Array(buffer)
        ]
    },"*");


    // attempt2
    // console.log(
    //     "keys:",
    //     Reflect.ownKeys(fileInput)
    // );
    // if (!file){
    //     throw new Error("Support file not found.");
    // }

    // const dataTransfer = new DataTransfer();
    // dataTransfer.items.add(file);
    // const reactPropsKey = Reflect.ownKeys(fileInput).find(key =>key.startsWith("__reactProps"));
    // console.log("React Key:",reactPropsKey);
    // if (!reactPropsKey){
    //     throw new Error("React props not found.");
    // }
    // const reactProps =fileInput[reactPropsKey];
    // console.log("React Props:",reactProps);

    // if (typeof reactProps.onChange ==="function"){
    //     await reactProps.onChange({target:{files:dataTransfer.files}});
    //     console.log(
    //         "File:",
    //         file.name,
    //         file.size,
    //         file.type
    //     );
    //     console.log("React onChange called.");
    // }else{
    //     throw new Error("React onChange not found.");
    // }

    // attempt1
    // fileInput.files = dataTransfer.files;
    // fileInput.dispatchEvent(new Event("input",{ bubbles: true }));
    // fileInput.dispatchEvent(new Event("change",{ bubbles: true }));
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
}

function createSupportFileRow(file){
    const row = document.createElement("div");
    row.className = "listRow";
    row.innerHTML = `
        <div class="listRowContent">
            <button class="load-support-file" >
                Load
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

    const loadButton = row.querySelector(".load-support-file");
    loadButton.addEventListener("click",() => {
        loadSupportFile(file);
    });

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
    const result = await chrome.storage.local.get(STORAGE_KEYS.SUPPORT_FILES);
    const supportFiles = result[STORAGE_KEYS.SUPPORT_FILES] || {};
    delete supportFiles[fileName];
    await chrome.storage.local.set({
        [STORAGE_KEYS.SUPPORT_FILES]:
            supportFiles
    });
}