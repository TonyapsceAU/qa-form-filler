function validateImportStructure(importRows){

    const fieldElements =
        getIndexedFields();

    const mismatches = [];

    importRows.forEach(importRow => {

        const fieldIndex =
            Number(
                importRow[
                    EXPORT_COLUMNS.NO
                ]
            );

        if (Number.isNaN(fieldIndex)){
            return;
        }

        const expectedName =
            importRow[
                EXPORT_COLUMNS.FIELD_NAME
            ];

        const actualName =
            fieldElements[
                fieldIndex
            ]?.name || "";

        if (
            expectedName &&
            actualName &&
            expectedName !== actualName
        ){
            mismatches.push({
                fieldIndex,
                expectedName,
                actualName
            });
        }
    });

    return mismatches;
}