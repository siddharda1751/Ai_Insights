import { google } from 'googleapis';
import stream from 'stream';

import credentials from '../config/google-service-account.json' with {
    type: 'json'
};

const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({
    version: 'v3',
    auth,
});

export const uploadPDFToDrive = async (
    pdfBuffer,
    fileName
) => {

    const bufferStream = new stream.PassThrough();

    bufferStream.end(pdfBuffer);

    const response = await drive.files.create({
        requestBody: {
            name: fileName,
            parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
            mimeType: 'application/pdf',
        },

        media: {
            mimeType: 'application/pdf',
            body: bufferStream,
        },

        fields: 'id, webViewLink',
    });

    const fileId = response.data.id;

    // Make file public
    await drive.permissions.create({
        fileId,
        requestBody: {
            role: 'reader',
            type: 'anyone',
        },
    });

    return `https://drive.google.com/file/d/${fileId}/view`;
};