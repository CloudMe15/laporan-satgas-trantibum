module.exports = async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

    try {
        const { filename, fileBase64, mimeType, folderId } = req.body;

        // URL Web App Google Apps Script Anda yang baru
        const gasUrl = 'https://script.google.com/macros/s/AKfycbzpSCFC7HnISdchHP9lDJrQihSj01cyLW53yL1NsC918xkyRuP3eL1JjRhFy1c2WJKyqw/exec';

        const formData = new URLSearchParams();
        formData.append('filename', filename);
        formData.append('fileBase64', fileBase64);
        formData.append('mimeType', mimeType);
        formData.append('folderId', folderId);

        const response = await fetch(gasUrl, {
            method: 'POST',
            body: formData
        });

        const textResult = await response.text();
        let result;
        try {
            result = JSON.parse(textResult);
        } catch (e) {
            throw new Error(`Respons GAS ditolak. Pastikan akses deployment di set ke "Anyone". Respons: ${textResult}`);
        }

        if (!result.success) throw new Error(result.error || 'Gagal menyimpan di Apps Script');
        
        res.status(200).json(result);
    } catch (error) {
        console.error('GAS Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
