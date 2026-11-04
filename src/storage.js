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
                    <div>
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

    const result =
        await chrome.storage.local.get(
            STORAGE_KEYS.TEST_CASES
        );

    const testCases =
        result[
            STORAGE_KEYS.TEST_CASES
        ] || {};

    delete testCases[fileName];

    await chrome.storage.local.set({
        [STORAGE_KEYS.TEST_CASES]:
            testCases
    });

}