module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { filename, fileBase64, mimeType, folderId } = req.body;

        // URL Google Apps Script milik Anda (Berjalan atas nama Gmail Anda, bebas masalah kuota)
        const gasUrl = 'https://script.google.com/macros/s/AKfycbwsstkCJzRnRJ7Pt4SDbAXHbc2Cs8RugusZoraejVKNuj5llFbb_mOe4yAIzlNDESchhg/exec';

        // Memformat data persis seperti yang diharapkan oleh Apps Script
        const formData = new URLSearchParams();
        formData.append('filename', filename);
        formData.append('fileBase64', fileBase64);
        formData.append('mimeType', mimeType);
        formData.append('folderId', folderId);

        // Server Vercel mem-bypass CORS browser dan mengeksekusi GAS secara langsung
        const response = await fetch(gasUrl, {
            method: 'POST',
            body: formData
        });

        const textResult = await response.text();
        
        let result;
        try {
            result = JSON.parse(textResult);
        } catch (e) {
            throw new Error(`Respons tidak valid dari Apps Script: ${textResult}`);
        }

        if (!result.success) {
            throw new Error(result.error || 'Gagal mengunggah via Apps Script');
        }

        res.status(200).json(result);
    } catch (error) {
        console.error('GAS Proxy Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
