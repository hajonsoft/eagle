export function getDocumentNumber(format, fields) {
    switch (format) {
        case 'TD1':
        case 'TD2':
        case 'TD3':
        case 'FRENCH_DRIVING_LICENSE':
            return buildDocumentNumber(fields.documentNumber);
        case 'FRENCH_NATIONAL_ID':
            return buildDocumentNumber(fields.issueDate, fields.administrativeCode2, fields.documentNumber);
        case 'SWISS_DRIVING_LICENSE':
            return buildDocumentNumber(fields.pinCode, fields.versionNumber);
        default:
            assertUnreachableFormat(format);
    }
}
function buildDocumentNumber(...parts) {
    let result = '';
    for (const part of parts) {
        if (!part) {
            return null;
        }
        result += part;
    }
    return result;
}
function assertUnreachableFormat(format) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    throw new Error(`unrecognized format: ${format}`);
}
//# sourceMappingURL=getDocumentNumber.js.map