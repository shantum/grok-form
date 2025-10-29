const { google } = require('googleapis');

exports.handler = async (event) => {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_CLIENT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') // Handle newlines in env var
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets']
        });

        const sheets = google.sheets({ version: 'v4', auth });
        const data = JSON.parse(event.body);

        // Append to Sheet (assuming headers in row 1: Name, Email, Message)
        await sheets.spreadsheets.values.append({
            spreadsheetId: process.env.GOOGLE_SHEET_ID,
            range: 'Sheet1!A:C', // Adjust range based on columns
            valueInputOption: 'RAW',
            resource: { values: [[data.name, data.email, data.message]] }
        });

        return { statusCode: 200, body: 'Success' };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: 'Server Error' };
    }
};