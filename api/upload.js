const { google } = require('googleapis');
const stream = require('stream');

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { filename, fileBase64, mimeType, folderId } = req.body;

        if (!process.env.G_CLIENT_EMAIL || !process.env.G_PRIVATE_KEY) {
            return res.status(500).json({ error: 'Kredensial Google Drive belum diatur di Vercel.' });
        }

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.G_CLIENT_EMAIL,
                private_key: process.env.G_PRIVATE_KEY.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });
        const bufferStream = new stream.PassThrough();
        
        // Membaca raw base64 dari app.js menjadi buffer data
        bufferStream.end(Buffer.from(fileBase64, 'base64'));

        const response = await drive.files.create({
            requestBody: {
                name: filename,
                parents: [folderId],
            },
            media: {
                mimeType: mimeType || 'image/jpeg',
                body: bufferStream,
            },
        });

        res.status(200).json({ success: true, fileId: response.data.id });
    } catch (error) {
        console.error('Drive API Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
