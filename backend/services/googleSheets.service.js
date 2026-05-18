import { google } from 'googleapis';
let credentials;

// 1. Check if the JSON is provided as an environment variable (Production)
if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    try {
        credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    } catch (error) {
        console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON env variable:", error);
    }
} else {
    // 2. Fallback to your local file if the env variable isn't set (Local Development)
    try {
        const { default: localCreds } = await import('../config/google-service-account.json', {
            with: { type: 'json' }
        });
        credentials = localCreds;
    } catch (error) {
        console.error("Failed to load local google-service-account.json:", error);
        throw error;
    }
}

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({
    version: 'v4',
    auth,
});

export const appendLeadRow = async (lead) => {

    const response  = await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,

        range: 'Sheet1!A:J',

        valueInputOption: 'USER_ENTERED',

        requestBody: {
            values: [[
                lead._id.toString(),
                lead.name,
                lead.email,
                lead.companyName,
                lead.companyWebsite,
                lead.industry,
                lead.createdAt,
                lead.status,
                '',
                ''
            ]]
        }
    });

    const updatedRange =
        response.data.updates.updatedRange;

    // Extract row number
    const rowNumber =
         updatedRange.match(/![A-Z]+(\d+)/)[1];


    console.log('[Sheets] Lead row appended');
    return Number(rowNumber);
};

export const updateLeadSheetStatus = async (
    rowNumber,
    status,
    error = ''
) => {

    await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,

        range: `Sheet1!H${rowNumber}:I${rowNumber}`,

        valueInputOption: 'USER_ENTERED',

        requestBody: {
            values: [[
                status,
                error
            ]]
        }
    });

    console.log(`[Sheets] Updated row ${rowNumber} → ${status}`);
};