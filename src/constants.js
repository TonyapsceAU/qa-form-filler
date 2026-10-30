const ACTIONS = {
    SCAN_FORM: "scanForm",
    HIGHLIGHT_FORM: "highlightForm",
    EXPORT_EXCEL: "exportExcel",
    IMPORT_EXCEL: "importExcel",
    CLEAR_HIGHLIGHT: "clearHighlight"
};

const EXPORT_COLUMNS = {
    NO: "No",
    SECTION: "Section",
    GROUP: "Group",
    REPEAT_GROUP: "RepeatGroup",
    REPEAT_INDEX: "RepeatIndex",
    FIELD: "Field",
    VALUE: "Value",
    FIELD_ID: "Field ID",
    FIELD_NAME: "Field Name",
    TYPE: "Type"
};

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

const IMPORT_OVERLAY_ID = "qa-import-overlay";

const EXPORT_SHEET_NAME = "QA Export";

const APWMS_FIELD_PREFIX = "nsfcJrcApplicationInput";

const PRELIM_PART_PREFIX = "prelim_part1_";
