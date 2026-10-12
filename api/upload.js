const ALLOWED_FOLDERS = new Set([
    '12LUEDf2oqmUJYBzg53HACcO8J0qS26ta', // SiLAHAPP
    '1tYSAUCmmnmoibhNHplsIVV3tuYGjJ3dr', // PESUT
    '1o6KyMinIed9hK05RiB1xtDY9o_-bnb-V'  // Modul Lanjutan
]);

const APP_SECURITY_TOKEN = 'SATPOL_INHU_TRANTIBUM_2026';
const MAX_BASE64_LENGTH = 30 * 1024 * 1024; // Maksimal ~22MB binary

// Rate limiter berbasis IP dalam memori serverless instance
const ipRateLimits = new Map();
const RATE_WINDOW_MS = 1 * 60 * 1000; // Jendela 1 menit
const MAX_UPLOADS_PER_WINDOW = 10;     // Maksimal 10 upload per IP per menit

function checkRateLimit(ip) {
    const now = Date.now();
    const entry = ipRateLimits.get(ip) || { count: 0, resetTime: now + RATE_WINDOW_MS };

    if (now > entry.resetTime) {
        entry.count = 1;
        entry.resetTime = now + RATE_WINDOW_MS;
        ipRateLimits.set(ip, entry);
        return { allowed: true };
    }

    entry.count++;
    ipRateLimits.set(ip, entry);
    if (entry.count > MAX_UPLOADS_PER_WINDOW) {
        const remainingSeconds = Math.ceil((entry.resetTime - now) / 1000);
        return { allowed: false, remainingSeconds };
    }

    return { allowed: true };
}

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method Not Allowed' });
    }

    try {
        // 1. IP Rate Limiting & Throttling
        const clientIp = (req.headers['x-forwarded-for'] ? req.headers['x-forwarded-for'].split(',')[0].trim() : null) ||
                         req.headers['x-real-ip'] ||
                         (req.socket ? req.socket.remoteAddress : 'unknown');

        const rateCheck = checkRateLimit(clientIp);
        if (!rateCheck.allowed) {
            return res.status(429).json({
                success: false,
                error: `Terlalu banyak permintaan upload dari perangkat Anda. Harap tunggu ${rateCheck.remainingSeconds} detik.`
            });
        }

        // 2. Token Autentikasi Aplikasi (Mencegah Akses Script Eksternal)
        const appToken = req.headers['x-app-token'] || req.headers['authorization'];
        if (appToken !== APP_SECURITY_TOKEN) {
            return res.status(401).json({ success: false, error: 'Akses ditolak: Token autentikasi aplikasi tidak sah.' });
        }

        const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
        const { filename, fileBase64, mimeType, folderId, hp_trap } = payload;

        // 3. Honeypot Trap (Pencegahan Bot Spam Otomatis)
        if (hp_trap && String(hp_trap).trim() !== '') {
            return res.status(400).json({ success: false, error: 'Aktivitas tidak wajar terdeteksi.' });
        }

        // 4. Validasi Whitelist Folder Google Drive
        if (!folderId || !ALLOWED_FOLDERS.has(folderId)) {
            return res.status(403).json({ success: false, error: 'ID Folder Google Drive tujuan tidak diizinkan.' });
        }

        // 5. Validasi Tipe File (Harus PDF Murni)
        if (mimeType !== 'application/pdf') {
            return res.status(400).json({ success: false, error: 'Tipe file harus berupa Dokumen PDF (application/pdf).' });
        }

        // 6. Validasi Nama File & Path Traversal Prevention
        if (!filename || typeof filename !== 'string' || !filename.endsWith('.pdf') || filename.length > 150) {
            return res.status(400).json({ success: false, error: 'Format nama file PDF tidak valid.' });
        }
        if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
            return res.status(400).json({ success: false, error: 'Karakter nama file tidak aman.' });
        }

        // 7. Validasi Integritas & Batas Ukuran File Base64
        if (!fileBase64 || typeof fileBase64 !== 'string' || fileBase64.length < 100) {
            return res.status(400).json({ success: false, error: 'Konten file PDF kosong atau rusak.' });
        }
        if (fileBase64.length > MAX_BASE64_LENGTH) {
            return res.status(413).json({ success: false, error: 'Ukuran file PDF melebihi batas maksimal aman (20MB).' });
        }

        // 8. Penerusan Aman ke Google Apps Script
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
            throw new Error(`Respons Google Apps Script tidak valid. Respons: ${textResult}`);
        }

        if (!result.success) throw new Error(result.error || 'Google Apps Script menolak penyimpanan.');

        return res.status(200).json(result);
    } catch (error) {
        console.error('GAS Error:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
};
