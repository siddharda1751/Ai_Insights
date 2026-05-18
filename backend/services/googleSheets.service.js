import { google } from 'googleapis';
import credentials from '../config/google-service-account.json' with { type: 'json' };

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