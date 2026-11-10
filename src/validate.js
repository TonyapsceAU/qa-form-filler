function validateImportStructure(importRows){
    const fieldElements = getIndexedFields();
    const report = {
        excelFields: importRows.length,
        formFields: fieldElements.length,

        rowCountMismatch:
            importRows.length !==
            fieldElements.length,

        nameMismatches: [],
        typeMismatches: [],
        missingFields: []
    };

    importRows.forEach(importRow => {
        const fieldIndex = Number(importRow[EXPORT_COLUMNS.NO]);
        if (Number.isNaN(fieldIndex)){
            return;
        }

        const fieldElement = fieldElements[fieldIndex];
        if (!fieldElement){
            report.missingFields.push({
                fieldIndex,
                field:
                    importRow[
                        EXPORT_COLUMNS.FIELD
                    ]
            });
            return;
        }

        const expectedName = importRow[EXPORT_COLUMNS.FIELD_NAME] || "";
        const actualName = fieldElement.name || "";
        if (expectedName &&actualName &&expectedName !== actualName){
            report.nameMismatches.push({
                fieldIndex,
                expectedName,
                actualName
            });
        }

        const expectedType = importRow[EXPORT_COLUMNS.TYPE] || "";
        const actualType = fieldElement.tagName || "";
        if (expectedType &&actualType &&expectedType !== actualType){
            report.typeMismatches.push({
                fieldIndex,
                expectedType,
                actualType
            });
        }
    });
    return report;
}