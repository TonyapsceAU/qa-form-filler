// Actions
const ACTIONS = {
    SCAN_FORM: "scanForm",
    HIGHLIGHT_FORM: "highlightForm",
    CLEAR_HIGHLIGHT: "clearHighlight",
    EXPORT_EXCEL: "exportExcel",
    // IMPORT_EXCEL: "importExcel",
    FILL_FORM: "fillForm"
};

// Element IDs
const ELEMENT_IDS = {
    SCAN_BUTTON: "scanBtn",
    RESULT_CONTAINER: "resultContainer",
    HIGHLIGHT_BUTTON: "highlightModeBtn",
    CLEAR_HIGHLIGHT_BUTTON: "clearhighlightBtn",
    EXPORT_BUTTON: "exportBtn",
    IMPORT_BUTTON: "importBtn",
    IMPORT_FILE_INPUT: "importFile",
    IMPORT_INFO: "importInfo",
    FILL_BUTTON: "fillBtn",
    TEST_CASE_LIST: "testCaseList",
    SUPPORT_FILE_LIST:"supportFileList"
};

// Storage
const STORAGE_KEYS = {
    TEST_CASES: "testCases",
    SUPPORT_FILES: "supportFiles",
    ACTIVE_TEST_CASE: "activeTestCase"
};
const MAX_FILE_SIZE_MB = 10;

// Supported File Types
const FILE_TYPES = {
    EXCEL: [".xlsx", ".xls"],
    SUPPORT: [".pdf", ".doc", ".docx"]
};

// Export
const EXPORT_COLUMNS = {
    NO: "No",
    SECTION: "Section",
    GROUP: "Group",
    REPEAT_GROUP: "repeatGroup",
    REPEAT_INDEX: "repeatIndex",
    FIELD: "Field",
    VALUE: "Value",
    FIELD_ID: "Field ID",
    FIELD_NAME: "Field Name",
    TYPE: "Type"
};
const EXPORT_SHEET_NAME = "QA Export";

// APWMS
const APWMS_FIELD_PREFIX = "nsfcJrcApplicationInput";
const PRELIM_PART_PREFIX = "prelim_part1_";

// UI
const TYPE_COLORS = {
    "INPUT(text)": "#00aa00",
    "INPUT(radio)": "#888800",
    "INPUT(search)": "#00cccc",
    "TEXTAREA": "#0066ff",
    "SELECT": "#ff8800",
    "RICHTEXT": "#cc00cc",
    "INPUT(email)": "#ff00aa"
};
const FIELD_LABEL_MAP = {
    orcid: "ORCID iD",
    surname: "Surname (with title)",
    other_name: "Other Name",
    chinese_name: "Chinese Name (with title)",
    post: "Post",
    org: "Unit / Department / University"
};

// Overlay
const IMPORT_OVERLAY_ID = "qa-import-overlay";

// Debug Settings
const DEBUG = {
    IMPORT: false,//missing useage
    EXPORT: false,//missing useage
    REPEAT: false,
    LABELS: false,
    HIGHLIGHT: false,
    KEYWORDS: false
};


// Runtime State
let loadedImportRows = [];
let loadedFileName = "";