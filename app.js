const CONFIG = {
    APP_VERSION: 'v46_aligned_report_points',
    SECURITY_TOKEN: 'SATPOL_INHU_TRANTIBUM_2026',
    DEFAULT_LOGOS: {
        INHU: 'https://lh3.googleusercontent.com/d/1U-Whswnt_2pOQipuTZ0hHag42p6EhZgb',
        SATPOL: 'https://lh3.googleusercontent.com/d/1sxdzLxjYv-T3N2D7EH1cIP1YvOKlMxdr',
        SILAHAPP_ICON: 'https://lh3.googleusercontent.com/d/1OpcEZCqFtfhS13i9m5qdyBPhxuPqy313',
        PESUT_ICON: 'logo-pesut.png',
        PESUT_DRIVE_URL: 'https://lh3.googleusercontent.com/d/1n-4lVxoLXLyZwzbFX8QYatC7nx9eMoyN'
    },
    FOLDERS: {
        silahapp: {
            driveFolderUrl: 'https://drive.google.com/drive/folders/12LUEDf2oqmUJYBzg53HACcO8J0qS26ta?usp=drive_link',
            folderId: '12LUEDf2oqmUJYBzg53HACcO8J0qS26ta',
            title: 'SiLAHAPP',
            subtitle: 'Sistem Laporan Harian Piket dan Patroli',
            prefix: 'SiLAHAPP'
        },
        1: {
            driveFolderUrl: 'https://drive.google.com/drive/folders/1tYSAUCmmnmoibhNHplsIVV3tuYGjJ3dr?usp=drive_link',
            folderId: '1tYSAUCmmnmoibhNHplsIVV3tuYGjJ3dr',
            title: 'Pelaporan Surat Tugas (PESUT)',
            subtitle: 'Sistem Pelaporan Surat Tugas Satpol PP',
            prefix: 'Pesut'
        },
        2: {
            driveFolderUrl: 'https://drive.google.com/drive/folders/1o6KyMinIed9hK05RiB1xtDY9o_-bnb-V?usp=drive_link',
            folderId: '1o6KyMinIed9hK05RiB1xtDY9o_-bnb-V',
            title: 'Coming Soon',
            subtitle: 'Modul Pengembangan Lanjutan 2',
            prefix: 'ComingSoon'
        }
    },
    DEFAULT_PROFILE: {
        nama: 'Fajar Ari Prakoso',
        nip: '199507102025211095',
        jabatan: 'Staff Program dan Keuangan'
    }
};

const StorageService = {
    STORAGE_KEY: 'satpolpp_inhu_trantibum_profile',
    VERSION_KEY: 'satpol_app_version',

    init() {
        const cachedVer = localStorage.getItem(this.VERSION_KEY);
        if (cachedVer !== CONFIG.APP_VERSION) {
            localStorage.removeItem(this.STORAGE_KEY);
            localStorage.setItem(this.VERSION_KEY, CONFIG.APP_VERSION);
        }
    },

    getProfile() {
        let profile = {
            ...CONFIG.DEFAULT_PROFILE,
            logoLeft: CONFIG.DEFAULT_LOGOS.INHU,
            logoRight: CONFIG.DEFAULT_LOGOS.SATPOL,
            sidebarIcons: {
                silahapp: CONFIG.DEFAULT_LOGOS.SILAHAPP_ICON,
                '1': CONFIG.DEFAULT_LOGOS.PESUT_ICON,
                '2': CONFIG.DEFAULT_LOGOS.SATPOL
            }
        };

        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.sidebarIcons && parsed.sidebarIcons['1'] && parsed.sidebarIcons['1'].includes('109_eNYKyEZdA')) {
                    delete parsed.sidebarIcons['1'];
                }
                profile = {
                    ...profile,
                    ...parsed,
                    sidebarIcons: {
                        ...profile.sidebarIcons,
                        ...(parsed.sidebarIcons || {})
                    }
                };
            } catch (e) {
                console.error('Failed to parse stored profile:', e);
            }
        }
        return profile;
    },

    saveProfile(profile) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(profile));
        } catch (e) {
            console.error('Failed to save profile:', e);
        }
    }
};

const MediaHelper = {
    async compressImage(file, maxSizeMB = 2) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;

                    const MAX_DIMENSION = 1920;
                    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
                        if (width > height) {
                            height = Math.round((height * MAX_DIMENSION) / width);
                            width = MAX_DIMENSION;
                        } else {
                            width = Math.round((width * MAX_DIMENSION) / height);
                            height = MAX_DIMENSION;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                    ctx.drawImage(img, 0, 0, width, height);

                    let quality = 0.9;
                    let base64 = canvas.toDataURL('image/jpeg', quality);

                    while (
                        Math.round((base64.length * 3) / 4) / (1024 * 1024) > maxSizeMB &&
                        quality > 0.15
                    ) {
                        quality = Math.max(0.1, Number((quality - 0.1).toFixed(2)));
                        base64 = canvas.toDataURL('image/jpeg', quality);
                    }
                    resolve(base64);
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    },

    readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    }
};

const PdfService = {
    cooldownUntil: 0,
    COOLDOWN_SECONDS: 5,

    async uploadPdf(filename, base64Data, mimeType, folderId) {
        const gasUrl = 'https://script.google.com/macros/s/AKfycbzpSCFC7HnISdchHP9lDJrQihSj01cyLW53yL1NsC918xkyRuP3eL1JjRhFy1c2WJKyqw/exec';
        const trapHp = document.getElementById('hpSecurityTrap')?.value || '';

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-App-Token': CONFIG.SECURITY_TOKEN
                },
                body: JSON.stringify({
                    filename,
                    fileBase64: base64Data,
                    mimeType,
                    folderId,
                    hp_trap: trapHp
                })
            });

            if (response.ok) {
                const result = await response.json();
                if (result.success) return result;
                throw new Error(result.error || 'Server menolak file');
            } else {
                const errData = await response.json().catch(() => ({}));
                const errMsg = errData.error || `Server menolak upload (Status ${response.status})`;
                // Tolakan keamanan (429, 401, 403, 400) langsung lempar agar tidak ditembus via fallback
                if (response.status === 429 || response.status === 401 || response.status === 403 || response.status === 400) {
                    throw new Error(errMsg);
                }
                throw new Error(errMsg);
            }
        } catch (apiErr) {
            if (
                apiErr.message.includes('Terlalu banyak') ||
                apiErr.message.includes('Akses ditolak') ||
                apiErr.message.includes('tidak diizinkan') ||
                apiErr.message.includes('Server menolak')
            ) {
                throw apiErr;
            }
            console.warn('Fallback direct to GAS:', apiErr);
        }

        const formData = new URLSearchParams();
        formData.append('filename', filename);
        formData.append('fileBase64', base64Data);
        formData.append('mimeType', mimeType);
        formData.append('folderId', folderId);

        const gasResponse = await fetch(gasUrl, {
            method: 'POST',
            body: formData
        });

        const textResult = await gasResponse.text();
        let result;
        try {
            result = JSON.parse(textResult);
        } catch (e) {
            throw new Error(`Invalid response: ${textResult}`);
        }
        if (!result.success) throw new Error(result.error || 'Server rejected upload');
        return result;
    },

    formatIndonesianDate(dateStr) {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    generateFilename(prefix, dateInputId, userName) {
        const dateEl = document.getElementById(dateInputId);
        const rawDate = dateEl && dateEl.value ? dateEl.value : new Date().toISOString().split('T')[0];
        const cleanName = (userName || 'Petugas')
            .trim()
            .replace(/\s+/g, '_')
            .replace(/[^a-zA-Z0-9_\-]/g, '');
        return `${rawDate}_${prefix}_${cleanName}.pdf`;
    },

    promptConfirmation({ moduleTitle, dateFormatted, officerName, onConfirm }) {
        const modal = document.getElementById('confirmUploadModal');
        const elModul = document.getElementById('confirmModalModul');
        const elTanggal = document.getElementById('confirmModalTanggal');
        const elPetugas = document.getElementById('confirmModalPetugas');
        const btnCancel = document.getElementById('btnCancelConfirmUpload');
        const btnProceed = document.getElementById('btnProceedConfirmUpload');

        if (!modal || !btnProceed) {
            if (confirm(`Kirim Laporan Resmi ke Google Drive?\n\nModul: ${moduleTitle}\nTanggal: ${dateFormatted}\nPetugas: ${officerName}`)) {
                onConfirm();
            }
            return;
        }

        if (elModul) elModul.textContent = moduleTitle;
        if (elTanggal) elTanggal.textContent = dateFormatted;
        if (elPetugas) elPetugas.textContent = officerName;

        const closeModal = () => {
            modal.classList.add('hidden');
            btnProceed.onclick = null;
            btnCancel.onclick = null;
        };

        btnCancel.onclick = closeModal;
        btnProceed.onclick = () => {
            closeModal();
            onConfirm();
        };

        modal.classList.remove('hidden');
        if (window.lucide) lucide.createIcons();
    },

    async processAndUpload({ buttonEl, containerId, filename, folderId, driveFolderUrl }) {
        const originalHtml = buttonEl.innerHTML;
        buttonEl.innerHTML = '<span class="animate-pulse">Membuat PDF & Mengunggah...</span>';
        buttonEl.disabled = true;

        let pdfDataUri = null;
        try {
            const element = document.getElementById(containerId);
            if (!element) throw new Error(`Elemen konten PDF tidak ditemukan (${containerId})`);

            const opt = {
                margin: [0, 0, 0, 0],
                filename: filename,
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { scale: 1.6, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            pdfDataUri = await html2pdf().set(opt).from(element).output('datauristring');

            const downloadLink = document.createElement('a');
            downloadLink.href = pdfDataUri;
            downloadLink.download = filename;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);

            let uploadSuccess = false;
            let uploadErrorMessage = '';
            try {
                const pdfBase64 = pdfDataUri.split(',')[1];
                await this.uploadPdf(filename, pdfBase64, 'application/pdf', folderId);
                uploadSuccess = true;
                // Aktifkan jeda waktu cooldown setelah pengiriman sukses
                this.cooldownUntil = Date.now() + (this.COOLDOWN_SECONDS * 1000);
            } catch (uploadErr) {
                console.warn('Google Drive upload notice:', uploadErr);
                uploadErrorMessage = uploadErr.message;
            }

            this.showDriveNoticeModal(filename, driveFolderUrl, uploadSuccess, uploadErrorMessage);

        } catch (err) {
            console.error('PDF generation error:', err);
            alert(`Gagal memproses laporan: ${err.message}`);
        } finally {
            buttonEl.innerHTML = originalHtml;
            buttonEl.disabled = false;
        }
    },

    showDriveNoticeModal(filename, driveFolderUrl, uploadSuccess, uploadErrorMessage) {
        const driveNoticeModal = document.getElementById('driveNoticeModal');
        const filenameLabel = document.getElementById('driveFilenameLabel');
        const noticeDesc = document.querySelector('#driveNoticeModal p.text-slate-500');
        const btnClose = document.getElementById('btnCloseDriveNotice');

        if (filenameLabel) filenameLabel.textContent = filename;

        if (noticeDesc) {
            if (uploadSuccess) {
                noticeDesc.innerHTML = `File Laporan PDF telah berhasil <b>diunduh</b> ke perangkat Anda dan <b>diunggah otomatis</b> ke Google Drive.<br><br>Klik tombol di bawah untuk membuka Folder Google Drive dan memeriksa file Anda.`;
            } else {
                noticeDesc.innerHTML = `File Laporan PDF telah berhasil <b>diunduh</b> ke komputer Anda.<br><span class="text-amber-600 text-[11px] block mt-1">Catatan: Pengunggahan otomatis ke Google Drive mengalami kendala (${uploadErrorMessage || 'offline/API limit'}). Anda dapat mengunggah file yang sudah diunduh secara manual.</span>`;
            }
        }

        if (btnClose) {
            btnClose.textContent = uploadSuccess ? "Buka Folder Google Drive" : "Tutup / Buka Folder Drive";
            btnClose.onclick = () => {
                if (driveFolderUrl) window.open(driveFolderUrl, '_blank');
                if (driveNoticeModal) driveNoticeModal.classList.add('hidden');
            };
        }

        if (driveNoticeModal) driveNoticeModal.classList.remove('hidden');
    }
};

let currentProfile = {};

const moduleStates = {
    silahapp: {
        anggotaMode: 'foto',
        anggotaPhotos: [],
        uploadedPhotos: []
    },
    1: {
        anggotaMode: 'foto',
        anggotaPhotos: [],
        uploadedPhotos: []
    },
    2: {
        anggotaMode: 'foto',
        anggotaPhotos: [],
        uploadedPhotos: []
    }
};

function createPdfListItem(index, text) {
    const row = document.createElement('div');
    row.className = 'pdf-list-item';
    row.innerHTML = `<span class="pdf-list-num">${index}.</span><span class="pdf-list-text">${text}</span>`;
    return row;
}

function generateComingSoonViews() {
    const container = document.getElementById('comingSoonContainer');
    if (!container) return;

    const info = CONFIG.FOLDERS[1];
    const htmlContent = `
        <div id="view-coming-soon-1" class="app-view hidden flex-1 flex-col">
            <header class="glass-header text-white sticky top-[53px] sm:top-[57px] z-30 shadow-2xl border-b border-slate-700/60 no-print">
                <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                    <div class="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
                        <div class="flex items-center gap-2">
                            <img id="csHeaderLogoLeft-1" src="${CONFIG.DEFAULT_LOGOS.INHU}" class="w-8 h-8 object-contain bg-white rounded p-0.5" alt="Logo Kiri">
                            <img id="csHeaderLogoRight-1" src="${CONFIG.DEFAULT_LOGOS.SATPOL}" class="w-8 h-8 object-contain bg-white rounded p-0.5" alt="Logo Kanan">
                        </div>
                        <div>
                            <h1 class="font-extrabold text-base sm:text-lg tracking-wide leading-tight text-white flex items-center gap-1.5">${info.title}</h1>
                            <p class="text-[10px] sm:text-[11px] text-indigo-400 font-semibold tracking-wider">${info.subtitle}</p>
                        </div>
                    </div>
                    <div class="flex items-center justify-end w-full sm:w-auto">
                        <button id="btnSettings-cs-1" class="btn-open-settings w-full sm:w-auto flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition shadow-lg shadow-amber-500/20 active:scale-95">
                            <i data-lucide="settings" class="w-4 h-4"></i>
                            <span>Pengaturan Profil</span>
                        </button>
                    </div>
                </div>
            </header>

            <main class="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div class="lg:hidden col-span-1 flex bg-slate-900/90 p-1 rounded-xl backdrop-blur-md mb-2 no-print border border-slate-700/60 shadow-xl">
                    <button id="csTabFormBtn-1" class="flex-1 py-2 text-center font-bold text-xs rounded-lg bg-indigo-500 text-white shadow-md transition">Isi Laporan</button>
                    <button id="csTabPreviewBtn-1" class="flex-1 py-2 text-center font-semibold text-xs rounded-lg text-slate-300 transition">Pratinjau</button>
                </div>

                <section id="csFormSection-1" class="lg:col-span-5 space-y-6 no-print">
                    <div class="glass-panel p-4 sm:p-6 rounded-3xl shadow-2xl border border-white/70">
                        <div class="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                            <h2 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                <i data-lucide="clipboard-list" class="w-5 h-5 text-indigo-600"></i> Formulir ${info.title}
                            </h2>
                            <span class="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">${info.prefix}</span>
                        </div>

                        <form class="space-y-4" onsubmit="event.preventDefault();">
                            <div>
                                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">1. Tanggal Laporan</label>
                                <input type="date" id="csInputTanggal-1" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs sm:text-sm font-semibold shadow-sm">
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-1.5">
                                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">2. Dasar Pelaksanaan & Lokasi</label>
                                    <button type="button" id="csBtnAddLokasi-1" class="text-[11px] font-bold text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-lg transition border border-indigo-300">+ Tambah Lokasi</button>
                                </div>
                                <div class="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200 shadow-inner space-y-3">
                                    <textarea id="csInputDasar-1" rows="2" placeholder="Dasar Pelaksanaan (Contoh: Surat Tugas Nomor: 094/123/ST-SATPOLPP/2026...)" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm outline-none shadow-sm"></textarea>
                                    <div class="pt-1 border-t border-indigo-200">
                                        <label class="block text-[11px] font-bold text-indigo-900 uppercase mb-1.5">Daftar Tempat / Lokasi:</label>
                                        <div id="csLokasiList-1" class="space-y-2"></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-1.5">
                                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">3. Uraian Kegiatan</label>
                                    <button type="button" id="csBtnAddHasil-1" class="text-[11px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-lg transition border border-indigo-300">+ Tambah Poin</button>
                                </div>
                                <div class="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200 shadow-inner">
                                    <div id="csHasilList-1" class="space-y-2"></div>
                                </div>
                            </div>
                            <div>
                                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">4. Hasil Kegiatan</label>
                                <div class="bg-slate-100 p-3 rounded-2xl border border-slate-300 shadow-inner">
                                    <textarea id="csInputKegiatan-1" rows="3" placeholder="Deskripsikan rincian hasil kegiatan..." class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm outline-none shadow-sm"></textarea>
                                </div>
                            </div>
                            <div>
                                <div class="flex items-center justify-between mb-1.5">
                                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">5. Nama Anggota (Pilih Opsi)</label>
                                </div>
                                <div class="flex bg-slate-200 p-1 rounded-xl mb-3">
                                    <button type="button" id="csAnggotaModeFotoBtn-1" class="flex-1 py-1.5 text-center font-bold text-xs rounded-lg bg-indigo-600 text-white shadow transition">Foto Nama Anggota</button>
                                    <button type="button" id="csAnggotaModeManualBtn-1" class="flex-1 py-1.5 text-center font-semibold text-xs rounded-lg text-slate-700 transition">Tambah Manual</button>
                                </div>

                                <div id="csAnggotaFotoWrapper-1" class="space-y-2">
                                    <div class="flex justify-between items-center">
                                        <span class="text-[11px] font-bold text-slate-600">Foto Nama Anggota</span>
                                        <span id="csAnggotaPhotoCount-1" class="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">0 / 10 Foto</span>
                                    </div>
                                    <div class="border-2 border-dashed border-indigo-300 bg-white rounded-2xl p-4 text-center relative cursor-pointer group">
                                        <input type="file" id="csInputAnggotaFoto-1" accept="image/*" multiple class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                                        <p class="text-xs font-bold text-slate-800">Klik / Tarik Foto Nama Anggota</p>
                                    </div>
                                    <div id="csAnggotaPhotoPreview-1" class="grid grid-cols-4 gap-2 mt-2"></div>
                                </div>

                                <div id="csAnggotaManualWrapper-1" class="space-y-2 hidden">
                                    <div class="flex justify-between items-center">
                                        <span class="text-[11px] font-bold text-slate-600">Daftar Nama Anggota</span>
                                        <button type="button" id="csBtnAddManualAnggota-1" class="text-[11px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-lg transition border border-indigo-300">+ Tambah Nama</button>
                                    </div>
                                    <div class="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200 shadow-inner">
                                        <div id="csManualAnggotaList-1" class="space-y-2"></div>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div class="flex justify-between items-center mb-1.5">
                                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">6. Foto Dokumentasi</label>
                                    <span id="csPhotoCount-1" class="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">0 / 10 Foto</span>
                                </div>
                                <div class="border-2 border-dashed border-indigo-300 bg-white rounded-2xl p-4 text-center relative cursor-pointer group">
                                    <input type="file" id="csInputDokumentasi-1" accept="image/*" multiple class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                                    <p class="text-xs font-bold text-slate-800">Klik / Tarik Foto Dokumentasi</p>
                                </div>
                                <div id="csPhotoPreview-1" class="grid grid-cols-4 gap-2 mt-3"></div>
                            </div>
                        </form>
                    </div>
                </section>

                <section id="csPreviewSection-1" class="lg:col-span-7 hidden lg:block space-y-4">
                    <div class="glass-panel p-4 rounded-2xl shadow-2xl border border-white/70 flex flex-wrap gap-3 justify-between items-center no-print">
                        <span class="text-xs text-slate-800 font-extrabold flex items-center gap-2">
                            <span class="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span> Pratinjau Dokumen A4 (${info.title})
                        </span>
                        <div class="flex items-center gap-2 w-full sm:w-auto">
                            <button id="csBtnUploadDrive-1" class="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg transition active:scale-95">Download dan Upload</button>
                        </div>
                    </div>
                    <div class="overflow-x-auto pb-6">
                        <div id="csPdfContent-1" class="a4-page text-slate-900 text-xs leading-relaxed flex flex-col justify-between">
                            <div>
                                <div class="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-4 gap-3">
                                    <div class="flex-shrink-0 flex items-center justify-center"><img id="csPreviewLogoLeft-1" src="${CONFIG.DEFAULT_LOGOS.INHU}" class="object-contain" style="width:100%; height:100%; background:#fff; padding:6px; border-radius:8px;" alt="Logo Inhu"></div>
                                    <div class="flex-1 text-center px-1">
                                        <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-900 leading-tight">PEMERINTAH KABUPATEN INDRAGIRI HULU</h3>
                                        <h2 class="text-sm sm:text-base font-black uppercase tracking-wider text-slate-950 my-0.5 leading-tight">SATUAN POLISI PAMONG PRAJA</h2>
                                        <div class="w-full h-0.5 bg-slate-900 my-1"></div>
                                        <h1 class="text-sm sm:text-base font-black uppercase tracking-wide text-indigo-950 leading-tight">LAPORAN ${info.title.toUpperCase()}</h1>
                                    </div>
                                    <div class="flex-shrink-0 flex items-center justify-center"><img id="csPreviewLogoRight-1" src="${CONFIG.DEFAULT_LOGOS.SATPOL}" class="object-contain" style="width:100%; height:100%; background:#fff; padding:6px; border-radius:8px;" alt="Logo Satpol"></div>
                                </div>
                                <div class="preview-block pdf-box shadow-sm mb-4">
                                    <div class="grid grid-cols-2 gap-2 text-[11px]">
                                        <div><span class="font-semibold text-slate-500 block text-[10px]">Nama Lengkap:</span><span id="csViewNama-1" class="font-bold text-slate-900 text-xs">-</span></div>
                                        <div><span class="font-semibold text-slate-500 block text-[10px]">NIP:</span><span id="csViewNip-1" class="font-semibold text-slate-800">-</span></div>
                                        <div class="col-span-2 border-t border-slate-200 pt-1.5 mt-0.5"><span class="font-semibold text-slate-500 block text-[10px]">Jabatan / Unit Kerja:</span><span id="csViewJabatan-1" class="font-semibold text-slate-800">-</span></div>
                                    </div>
                                </div>
                                <div class="space-y-3">
                                    <div class="preview-block flex items-center gap-2 border-b border-slate-200 pb-2">
                                        <span class="font-bold text-slate-900 w-32 flex-shrink-0 text-xs">Hari / Tanggal</span><span class="text-slate-400">:</span><span id="csViewTanggal-1" class="font-bold text-slate-950 text-xs">-</span>
                                    </div>
                                    <div id="csBlockDasar-1" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">1. Dasar Pelaksanaan</label><div id="csViewDasar-1" class="pdf-box min-h-[42px] whitespace-pre-line">-</div></div>
                                    <div id="csBlockLokasi-1" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">2. Tempat Pelaksanaan</label><div class="pdf-box min-h-[42px]"><div id="csViewTempat-1" class="space-y-1"></div></div></div>
                                    <div id="csBlockHasil-1" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">3. Uraian Kegiatan</label><div class="pdf-box min-h-[48px]"><div id="csViewHasil-1" class="space-y-1"></div></div></div>
                                    <div id="csBlockKegiatan-1" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">4. Hasil Kegiatan</label><div id="csViewKegiatan-1" class="pdf-box min-h-[48px] whitespace-pre-line">-</div></div>
                                    <div id="csBlockAnggota-1" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1" id="csLabelAnggotaTitle-1">5. Daftar Nama Anggota</label><div class="pdf-box min-h-[50px]"><div id="csViewAnggota-1"></div></div></div>
                                    <div id="csBlockDokumentasi-1" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">6. Dokumentasi Foto Kegiatan</label><div class="pdf-box min-h-[90px]"><div id="csViewDokumentasi-1" class="grid grid-cols-2 gap-3"></div></div></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>

        <div id="view-coming-soon-2" class="app-view hidden flex-1 flex-col items-center justify-center p-4 sm:p-8 min-h-[65vh]">
            <div class="glass-panel max-w-lg w-full p-8 sm:p-10 rounded-3xl shadow-2xl border border-white/60 text-center space-y-6 relative overflow-hidden backdrop-blur-xl">
                <div class="w-20 h-20 bg-amber-500/10 border border-amber-500/30 text-amber-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                    <i data-lucide="wrench" class="w-10 h-10"></i>
                </div>
                
                <div class="space-y-2">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/40 tracking-wider uppercase">
                        <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                        Tahap Pengembangan & Maintenance
                    </span>
                    <h2 class="text-xl sm:text-2xl font-black text-white tracking-wide">
                        Modul Sedang Dalam Pemeliharaan
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
                        Layanan pada modul ini sedang dalam tahap perancangan dan integrasi sistem lanjutan oleh Tim IT & Bagian Program Satpol PP Kabupaten Indragiri Hulu.
                    </p>
                </div>

                <div class="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-4 text-left space-y-2">
                    <div class="flex items-center gap-2 text-xs font-bold text-amber-400">
                        <i data-lucide="info" class="w-4 h-4 flex-shrink-0"></i>
                        <span>Informasi Layanan:</span>
                    </div>
                    <p class="text-[11px] text-slate-300 leading-relaxed">
                        Silakan gunakan modul <strong>SiLAHAPP</strong> untuk pelaporan piket/patroli harian atau <strong>PESUT</strong> untuk pelaporan surat tugas.
                    </p>
                </div>

                <div class="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                    <button type="button" id="btnCsBackSilahapp" class="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95 flex items-center justify-center gap-2">
                        <i data-lucide="arrow-left" class="w-4 h-4"></i>
                        <span>Kembali ke SiLAHAPP</span>
                    </button>
                    <button type="button" id="btnCsBackPesut" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 flex items-center justify-center gap-2">
                        <i data-lucide="file-text" class="w-4 h-4"></i>
                        <span>Buka Modul PESUT</span>
                    </button>
                </div>
            </div>
        </div>
    `;
    container.innerHTML = htmlContent;
}

const ProfileManager = {
    applyUI(profile) {
        currentProfile = profile;

        const cleanNip = profile.nip ? profile.nip.replace(/\D/g, '') : '';
        const formattedNip = cleanNip ? `NIP. ${cleanNip}` : '-';
        const nama = profile.nama || '-';
        const jabatan = profile.jabatan || '-';

        const elNama = document.getElementById('viewNama');
        if (elNama) elNama.textContent = nama;
        const elNip = document.getElementById('viewNip');
        if (elNip) elNip.textContent = formattedNip;
        const elJabatan = document.getElementById('viewJabatan');
        if (elJabatan) elJabatan.textContent = jabatan;

        for (let i = 1; i <= 2; i++) {
            const csNama = document.getElementById(`csViewNama-${i}`);
            if (csNama) csNama.textContent = nama;
            const csNip = document.getElementById(`csViewNip-${i}`);
            if (csNip) csNip.textContent = formattedNip;
            const csJabatan = document.getElementById(`csViewJabatan-${i}`);
            if (csJabatan) csJabatan.textContent = jabatan;
        }

        const inputNama = document.getElementById('inputSettingNama');
        if (inputNama) inputNama.value = profile.nama || '';
        const inputNip = document.getElementById('inputSettingNip');
        if (inputNip) {
            inputNip.value = cleanNip;
            const nipCounter = document.getElementById('nipCounter');
            if (nipCounter) nipCounter.textContent = `${cleanNip.length} / 18 Digit`;
        }
        const inputJabatan = document.getElementById('inputSettingJabatan');
        if (inputJabatan) inputJabatan.value = profile.jabatan || '';

        const logoLeft = profile.logoLeft || CONFIG.DEFAULT_LOGOS.INHU;
        const logoRight = profile.logoRight || CONFIG.DEFAULT_LOGOS.SATPOL;
        const logoPesut = (profile.sidebarIcons && profile.sidebarIcons['1']) || CONFIG.DEFAULT_LOGOS.PESUT_ICON;

        const handlePesutImg = (imgEl) => {
            if (!imgEl) return;
            imgEl.src = logoPesut;
            imgEl.onerror = () => {
                imgEl.onerror = null;
                imgEl.src = CONFIG.DEFAULT_LOGOS.PESUT_DRIVE_URL;
            };
        };

        const headerLeft = document.getElementById('headerLogoLeft');
        if (headerLeft) headerLeft.src = logoLeft;
        const headerRight = document.getElementById('headerLogoRight');
        if (headerRight) headerRight.src = logoRight;

        const prevLeft = document.getElementById('previewLogoLeft');
        if (prevLeft) prevLeft.src = logoLeft;
        const prevRight = document.getElementById('previewLogoRight');
        if (prevRight) prevRight.src = logoRight;

        for (let i = 1; i <= 2; i++) {
            const csHLeft = document.getElementById(`csHeaderLogoLeft-${i}`);
            if (csHLeft) csHLeft.src = logoLeft;
            const csHRight = document.getElementById(`csHeaderLogoRight-${i}`);
            if (csHRight) csHRight.src = logoRight;

            const csPLeft = document.getElementById(`csPreviewLogoLeft-${i}`);
            if (csPLeft) csPLeft.src = logoLeft;
            const csPRight = document.getElementById(`csPreviewLogoRight-${i}`);
            if (csPRight) csPRight.src = logoRight;
        }

        const sidebarPesut = document.getElementById('sidebarIcon-1');
        if (sidebarPesut) handlePesutImg(sidebarPesut);

        const sidebarSilahapp = document.getElementById('sidebarIcon-silahapp');
        if (sidebarSilahapp && profile.sidebarIcons && profile.sidebarIcons.silahapp) {
            sidebarSilahapp.src = profile.sidebarIcons.silahapp;
        }

        const sidebarCs2 = document.getElementById('sidebarIcon-2');
        if (sidebarCs2 && profile.sidebarIcons && profile.sidebarIcons['2']) {
            sidebarCs2.src = profile.sidebarIcons['2'];
        }
    },

    bindEvents() {
        const inputNip = document.getElementById('inputSettingNip');
        if (inputNip) {
            inputNip.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '');
                const nipCounter = document.getElementById('nipCounter');
                if (nipCounter) nipCounter.textContent = `${e.target.value.length} / 18 Digit`;
                const nipError = document.getElementById('nipError');
                if (e.target.value.length === 18 && nipError) nipError.classList.add('hidden');
            });
        }

        const settingsModal = document.getElementById('settingsModal');
        document.querySelectorAll('.btn-open-settings, #btnSettings').forEach((btn) => {
            btn.addEventListener('click', () => {
                ProfileManager.applyUI(currentProfile);
                if (settingsModal) settingsModal.classList.remove('hidden');
            });
        });

        const closeBtn = document.getElementById('btnCloseSettings');
        if (closeBtn) closeBtn.addEventListener('click', () => settingsModal && settingsModal.classList.add('hidden'));

        const cancelBtn = document.getElementById('btnCancelSettings');
        if (cancelBtn) cancelBtn.addEventListener('click', () => settingsModal && settingsModal.classList.add('hidden'));

        const saveBtn = document.getElementById('btnSaveSettings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const nipVal = inputNip ? inputNip.value.trim() : '';
                const nipError = document.getElementById('nipError');
                if (nipVal && nipVal.length !== 18) {
                    if (nipError) nipError.classList.remove('hidden');
                    return;
                }
                if (nipError) nipError.classList.add('hidden');

                const namaInp = document.getElementById('inputSettingNama');
                const jabatanInp = document.getElementById('inputSettingJabatan');

                currentProfile.nama = namaInp ? namaInp.value.trim() : currentProfile.nama;
                currentProfile.nip = nipVal;
                currentProfile.jabatan = jabatanInp ? jabatanInp.value.trim() : currentProfile.jabatan;

                StorageService.saveProfile(currentProfile);
                ProfileManager.applyUI(currentProfile);

                if (settingsModal) settingsModal.classList.add('hidden');
            });
        }
    }
};

class ReportController {
    constructor(key) {
        this.key = key;
        this.isMain = key === 'silahapp';
        this.state = moduleStates[key];
    }

    getId(prefix) {
        return this.isMain ? prefix : `cs${prefix.charAt(0).toUpperCase() + prefix.slice(1)}-${this.key}`;
    }

    init() {
        this.initDefaultDate();
        this.addLokasiInput();
        this.addHasilInput();
        if (this.isMain) {
            this.addMainAnggotaInput();
        } else {
            this.addCsManualAnggotaInput();
        }
        this.bindEvents();
        this.updatePreview();
    }

    initDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById(this.getId('inputTanggal'));
        if (dateInput) dateInput.value = today;
    }

    addLokasiInput(value = '') {
        const listEl = document.getElementById(this.getId('lokasiList'));
        if (!listEl) return;

        const item = document.createElement('div');
        item.className = 'flex items-center gap-2 lokasi-row';
        const numClass = this.isMain ? 'lokasi-index' : 'cs-lokasi-index';
        const inpClass = this.isMain ? 'input-lokasi' : 'cs-input-lokasi';
        const btnClass = this.isMain ? 'btn-remove-lokasi' : 'cs-btn-remove-lokasi';

        item.innerHTML = `
            <span class="text-xs font-bold text-slate-400 w-4 text-center ${numClass}">1.</span>
            <input type="text" value="${value}" placeholder="Tempat / Lokasi..." class="${inpClass} flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none shadow-sm">
            <button type="button" class="${btnClass} text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        `;
        listEl.appendChild(item);
        lucide.createIcons();
        this.updateLokasiIndexes();

        item.querySelector(`.${inpClass}`).addEventListener('input', () => this.updatePreview());
        item.querySelector(`.${btnClass}`).addEventListener('click', () => {
            if (listEl.children.length > 1) {
                item.remove();
                this.updateLokasiIndexes();
                this.updatePreview();
            }
        });
    }

    updateLokasiIndexes() {
        const listEl = document.getElementById(this.getId('lokasiList'));
        if (!listEl) return;
        const numClass = this.isMain ? '.lokasi-index' : '.cs-lokasi-index';
        listEl.querySelectorAll('.lokasi-row').forEach((row, idx) => {
            const num = row.querySelector(numClass);
            if (num) num.textContent = `${idx + 1}.`;
        });
    }

    addHasilInput(value = '') {
        const listEl = document.getElementById(this.getId('hasilList'));
        if (!listEl) return;

        const item = document.createElement('div');
        item.className = 'flex items-center gap-2 hasil-row';
        const numClass = this.isMain ? 'item-index' : 'cs-item-index';
        const inpClass = this.isMain ? 'input-hasil' : 'cs-input-hasil';
        const btnClass = this.isMain ? 'btn-remove-hasil' : 'cs-btn-remove-hasil';

        item.innerHTML = `
            <span class="text-xs font-bold text-slate-400 w-4 text-center ${numClass}">1.</span>
            <input type="text" value="${value}" placeholder="Poin kegiatan..." class="${inpClass} flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none shadow-sm">
            <button type="button" class="${btnClass} text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        `;
        listEl.appendChild(item);
        lucide.createIcons();
        this.updateHasilIndexes();

        item.querySelector(`.${inpClass}`).addEventListener('input', () => this.updatePreview());
        item.querySelector(`.${btnClass}`).addEventListener('click', () => {
            if (listEl.children.length > 1) {
                item.remove();
                this.updateHasilIndexes();
                this.updatePreview();
            }
        });
    }

    updateHasilIndexes() {
        const listEl = document.getElementById(this.getId('hasilList'));
        if (!listEl) return;
        const numClass = this.isMain ? '.item-index' : '.cs-item-index';
        listEl.querySelectorAll('.hasil-row').forEach((row, idx) => {
            const num = row.querySelector(numClass);
            if (num) num.textContent = `${idx + 1}.`;
        });
    }

    addMainAnggotaInput(value = '') {
        const listEl = document.getElementById('anggotaList');
        if (!listEl) return;

        const item = document.createElement('div');
        item.className = 'flex items-center gap-2 class-anggota-item';
        item.innerHTML = `
            <span class="text-xs font-bold text-slate-400 w-4 text-center anggota-index">1.</span>
            <input type="text" value="${value}" placeholder="Nama lengkap anggota..." class="input-anggota flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none shadow-sm">
            <button type="button" class="btn-remove-anggota text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        `;
        listEl.appendChild(item);
        lucide.createIcons();
        this.updateMainAnggotaIndexes();

        item.querySelector('.input-anggota').addEventListener('input', () => this.updatePreview());
        item.querySelector('.btn-remove-anggota').addEventListener('click', () => {
            if (listEl.children.length > 1) {
                item.remove();
                this.updateMainAnggotaIndexes();
                this.updatePreview();
            }
        });
    }

    updateMainAnggotaIndexes() {
        const listEl = document.getElementById('anggotaList');
        if (!listEl) return;
        listEl.querySelectorAll('.class-anggota-item').forEach((row, idx) => {
            const num = row.querySelector('.anggota-index');
            if (num) num.textContent = `${idx + 1}.`;
        });
    }

    addCsManualAnggotaInput(value = '') {
        const listEl = document.getElementById(`csManualAnggotaList-${this.key}`);
        if (!listEl) return;

        const item = document.createElement('div');
        item.className = 'flex items-center gap-2 cs-manual-anggota-item';
        item.innerHTML = `
            <span class="text-xs font-bold text-slate-400 w-4 text-center cs-manual-anggota-index">1.</span>
            <input type="text" value="${value}" placeholder="Nama lengkap anggota..." class="cs-input-manual-anggota flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none shadow-sm">
            <button type="button" class="cs-btn-remove-manual-anggota text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
        `;
        listEl.appendChild(item);
        lucide.createIcons();
        this.updateCsManualAnggotaIndexes();

        item.querySelector('.cs-input-manual-anggota').addEventListener('input', () => this.updatePreview());
        item.querySelector('.cs-btn-remove-manual-anggota').addEventListener('click', () => {
            if (listEl.children.length > 1) {
                item.remove();
                this.updateCsManualAnggotaIndexes();
                this.updatePreview();
            }
        });
    }

    updateCsManualAnggotaIndexes() {
        const listEl = document.getElementById(`csManualAnggotaList-${this.key}`);
        if (!listEl) return;
        listEl.querySelectorAll('.cs-manual-anggota-item').forEach((row, idx) => {
            const num = row.querySelector('.cs-manual-anggota-index');
            if (num) num.textContent = `${idx + 1}.`;
        });
    }

    updatePreview() {
        const dateInp = document.getElementById(this.getId('inputTanggal'));
        const viewTanggal = document.getElementById(this.getId('viewTanggal'));
        if (viewTanggal && dateInp) {
            viewTanggal.textContent = PdfService.formatIndonesianDate(dateInp.value);
        }

        const dasarInp = document.getElementById(this.getId('inputDasar'));
        const viewDasar = document.getElementById(this.getId('viewDasar'));
        const blockDasar = document.getElementById(this.getId('blockDasar'));
        const dasarVal = dasarInp ? dasarInp.value.trim() : '';
        if (blockDasar) blockDasar.style.display = dasarVal ? 'block' : 'none';
        if (viewDasar) viewDasar.textContent = dasarVal;

        const viewTempat = document.getElementById(this.getId('viewTempat'));
        const blockLokasi = document.getElementById(this.getId('blockLokasi'));
        if (viewTempat) {
            viewTempat.innerHTML = '';
            let lCount = 0;
            const selector = this.isMain ? '.input-lokasi' : `#view-coming-soon-${this.key} .cs-input-lokasi`;
            document.querySelectorAll(selector).forEach((inp) => {
                if (inp.value.trim()) viewTempat.appendChild(createPdfListItem(++lCount, inp.value.trim()));
            });
            if (blockLokasi) blockLokasi.style.display = lCount > 0 ? 'block' : 'none';
        }

        const viewHasil = document.getElementById(this.getId('viewHasil'));
        const blockHasil = document.getElementById(this.getId('blockHasil'));
        if (viewHasil) {
            viewHasil.innerHTML = '';
            let hCount = 0;
            const selector = this.isMain ? '.input-hasil' : `#view-coming-soon-${this.key} .cs-input-hasil`;
            document.querySelectorAll(selector).forEach((inp) => {
                if (inp.value.trim()) viewHasil.appendChild(createPdfListItem(++hCount, inp.value.trim()));
            });
            if (blockHasil) blockHasil.style.display = hCount > 0 ? 'block' : 'none';
        }

        const kegInp = document.getElementById(this.getId('inputKegiatan'));
        const viewKegiatan = document.getElementById(this.getId('viewKegiatan'));
        const blockKegiatan = document.getElementById(this.getId('blockKegiatan'));
        const kegVal = kegInp ? kegInp.value.trim() : '';
        if (blockKegiatan) blockKegiatan.style.display = kegVal ? 'block' : 'none';
        if (viewKegiatan) viewKegiatan.textContent = kegVal;

        this.renderAnggotaPreview();
        this.renderDokumentasiPreview();
    }

    renderAnggotaPreview() {
        const isManual = this.state.anggotaMode === 'manual';
        const titleEl = document.getElementById(this.isMain ? 'labelAnggotaTitle' : `csLabelAnggotaTitle-${this.key}`);
        const viewContainer = document.getElementById(this.getId('viewAnggota'));
        const blockAnggota = document.getElementById(this.getId('blockAnggota'));
        const photoCountEl = document.getElementById(this.isMain ? 'anggotaPhotoCount' : `csAnggotaPhotoCount-${this.key}`);
        const previewGrid = document.getElementById(this.isMain ? 'anggotaPhotoPreview' : `csAnggotaPhotoPreview-${this.key}`);

        if (!viewContainer) return;
        viewContainer.innerHTML = '';

        if (isManual) {
            if (titleEl) titleEl.textContent = '5. Daftar Nama Anggota';
            let aCount = 0;
            let hasContent = false;
            const listDiv = document.createElement('div');
            listDiv.className = 'space-y-1';

            const selector = this.isMain
                ? '.input-anggota'
                : `#csManualAnggotaList-${this.key} .cs-input-manual-anggota`;
            document.querySelectorAll(selector).forEach((inp) => {
                if (inp.value.trim()) {
                    hasContent = true;
                    listDiv.appendChild(createPdfListItem(++aCount, inp.value.trim()));
                }
            });
            viewContainer.appendChild(listDiv);
            if (blockAnggota) blockAnggota.style.display = hasContent ? 'block' : 'none';
        } else {
            if (titleEl) titleEl.textContent = '5. Dokumentasi Foto Nama Anggota';
            if (photoCountEl) photoCountEl.textContent = `${this.state.anggotaPhotos.length} / 10 Foto`;
            if (blockAnggota) blockAnggota.style.display = this.state.anggotaPhotos.length === 0 ? 'none' : 'block';

            const gridDiv = document.createElement('div');
            gridDiv.className = 'grid grid-cols-2 gap-3';
            this.state.anggotaPhotos.forEach((src, idx) => {
                const pdfCard = document.createElement('div');
                pdfCard.className = 'border rounded-xl p-2 bg-white text-center shadow-sm photo-wrapper';
                pdfCard.innerHTML = `<div class="photo-wrapper"><img src="${src}"></div><span class="text-[10px] text-slate-600 font-bold block mt-1.5">Nama Anggota ${idx + 1}</span>`;
                gridDiv.appendChild(pdfCard);
            });
            viewContainer.appendChild(gridDiv);
        }

        if (previewGrid) {
            previewGrid.innerHTML = '';
            this.state.anggotaPhotos.forEach((src, idx) => {
                const thumb = document.createElement('div');
                thumb.className = 'relative aspect-square border rounded-xl overflow-hidden bg-white shadow-sm';
                thumb.innerHTML = `
                    <img src="${src}" class="w-full h-full object-cover">
                    <button type="button" class="btn-del-photo absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition shadow"><i data-lucide="x" class="w-3 h-3"></i></button>
                `;
                thumb.querySelector('.btn-del-photo').addEventListener('click', () => {
                    this.state.anggotaPhotos.splice(idx, 1);
                    this.updatePreview();
                });
                previewGrid.appendChild(thumb);
            });
            lucide.createIcons();
        }
    }

    renderDokumentasiPreview() {
        const photoCountEl = document.getElementById(this.isMain ? 'photoCount' : `csPhotoCount-${this.key}`);
        const blockDoc = document.getElementById(this.getId('blockDokumentasi'));
        const formGrid = document.getElementById(this.isMain ? 'photoPreview' : `csPhotoPreview-${this.key}`);
        const pdfGrid = document.getElementById(this.getId('viewDokumentasi'));

        if (!formGrid || !pdfGrid) return;

        if (photoCountEl) photoCountEl.textContent = `${this.state.uploadedPhotos.length} / 10 Foto`;
        if (blockDoc) blockDoc.style.display = this.state.uploadedPhotos.length === 0 ? 'none' : 'block';

        formGrid.innerHTML = '';
        pdfGrid.innerHTML = '';

        this.state.uploadedPhotos.forEach((src, idx) => {
            const thumb = document.createElement('div');
            thumb.className = 'relative aspect-square border rounded-xl overflow-hidden bg-white shadow-sm';
            thumb.innerHTML = `
                <img src="${src}" class="w-full h-full object-cover">
                <button type="button" class="btn-del-doc absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition shadow"><i data-lucide="x" class="w-3 h-3"></i></button>
            `;
            thumb.querySelector('.btn-del-doc').addEventListener('click', () => {
                this.state.uploadedPhotos.splice(idx, 1);
                this.updatePreview();
            });
            formGrid.appendChild(thumb);

            const pdfCard = document.createElement('div');
            pdfCard.className = 'border rounded-xl p-2 bg-white text-center shadow-sm photo-wrapper';
            pdfCard.innerHTML = `
                <div class="photo-wrapper"><img src="${src}"></div>
                <span class="text-[10px] text-slate-600 font-bold block mt-1.5">Dokumentasi ${idx + 1}</span>
            `;
            pdfGrid.appendChild(pdfCard);
        });
        lucide.createIcons();
    }

    bindEvents() {
        const dateInp = document.getElementById(this.getId('inputTanggal'));
        if (dateInp) dateInp.addEventListener('input', () => this.updatePreview());

        const dasarInp = document.getElementById(this.getId('inputDasar'));
        if (dasarInp) dasarInp.addEventListener('input', () => this.updatePreview());

        const addLokasiBtn = document.getElementById(this.getId('btnAddLokasi'));
        if (addLokasiBtn) addLokasiBtn.addEventListener('click', () => this.addLokasiInput());

        const kegInp = document.getElementById(this.getId('inputKegiatan'));
        if (kegInp) kegInp.addEventListener('input', () => this.updatePreview());

        const addHasilBtn = document.getElementById(this.getId('btnAddHasil'));
        if (addHasilBtn) addHasilBtn.addEventListener('click', () => this.addHasilInput());

        const fotoBtn = document.getElementById(this.isMain ? 'anggotaModeFotoBtn' : `csAnggotaModeFotoBtn-${this.key}`);
        const manualBtn = document.getElementById(this.isMain ? 'anggotaModeManualBtn' : `csAnggotaModeManualBtn-${this.key}`);
        const fotoWrapper = document.getElementById(this.isMain ? 'anggotaFotoWrapper' : `csAnggotaFotoWrapper-${this.key}`);
        const manualWrapper = document.getElementById(this.isMain ? 'anggotaManualWrapper' : `csAnggotaManualWrapper-${this.key}`);

        if (fotoBtn && manualBtn) {
            fotoBtn.addEventListener('click', () => {
                this.state.anggotaMode = 'foto';
                fotoBtn.className = 'flex-1 py-1.5 text-center font-bold text-xs rounded-lg bg-indigo-600 text-white shadow transition';
                manualBtn.className = 'flex-1 py-1.5 text-center font-semibold text-xs rounded-lg text-slate-700 transition';
                if (fotoWrapper) fotoWrapper.classList.remove('hidden');
                if (manualWrapper) manualWrapper.classList.add('hidden');
                this.updatePreview();
            });

            manualBtn.addEventListener('click', () => {
                this.state.anggotaMode = 'manual';
                manualBtn.className = 'flex-1 py-1.5 text-center font-bold text-xs rounded-lg bg-indigo-600 text-white shadow transition';
                fotoBtn.className = 'flex-1 py-1.5 text-center font-semibold text-xs rounded-lg text-slate-700 transition';
                if (manualWrapper) manualWrapper.classList.remove('hidden');
                if (fotoWrapper) fotoWrapper.classList.add('hidden');
                this.updatePreview();
            });
        }

        const addAnggotaBtn = document.getElementById(
            this.isMain ? 'btnAddAnggota' : `csBtnAddManualAnggota-${this.key}`
        );
        if (addAnggotaBtn) {
            addAnggotaBtn.addEventListener('click', () => {
                if (this.isMain) this.addMainAnggotaInput();
                else this.addCsManualAnggotaInput();
            });
        }

        const inpAnggotaFoto = document.getElementById(
            this.isMain ? 'inputAnggotaFoto' : `csInputAnggotaFoto-${this.key}`
        );
        if (inpAnggotaFoto) {
            inpAnggotaFoto.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                if (this.state.anggotaPhotos.length + files.length > 10) {
                    alert('Maksimal 10 foto nama anggota!');
                    return;
                }
                for (const file of files) {
                    if (file.type.startsWith('image/')) {
                        if (this.state.anggotaPhotos.length < 10) {
                            const compressed = await MediaHelper.compressImage(file, 2);
                            this.state.anggotaPhotos.push(compressed);
                            this.updatePreview();
                        }
                    }
                }
                e.target.value = '';
            });
        }

        const inpDokumentasi = document.getElementById(
            this.isMain ? 'inputDokumentasi' : `csInputDokumentasi-${this.key}`
        );
        if (inpDokumentasi) {
            inpDokumentasi.addEventListener('change', async (e) => {
                const files = Array.from(e.target.files);
                if (this.state.uploadedPhotos.length + files.length > 10) {
                    alert('Maksimal 10 foto dokumentasi!');
                    return;
                }
                for (const file of files) {
                    if (file.type.startsWith('image/')) {
                        if (this.state.uploadedPhotos.length < 10) {
                            const compressed = await MediaHelper.compressImage(file, 2);
                            this.state.uploadedPhotos.push(compressed);
                            this.updatePreview();
                        }
                    }
                }
                e.target.value = '';
            });
        }

        const tabFormBtn = document.getElementById(this.isMain ? 'tabFormBtn' : `csTabFormBtn-${this.key}`);
        const tabPreviewBtn = document.getElementById(this.isMain ? 'tabPreviewBtn' : `csTabPreviewBtn-${this.key}`);
        const formSection = document.getElementById(this.isMain ? 'formSection' : `csFormSection-${this.key}`);
        const previewSection = document.getElementById(this.isMain ? 'previewSection' : `csPreviewSection-${this.key}`);

        if (tabFormBtn && tabPreviewBtn && formSection && previewSection) {
            const activeColor = this.isMain ? 'bg-amber-500 text-slate-950' : 'bg-indigo-500 text-white';

            tabFormBtn.addEventListener('click', () => {
                formSection.classList.remove('hidden');
                previewSection.classList.add('hidden');
                tabFormBtn.className = `flex-1 py-2 text-center font-bold text-xs rounded-lg ${activeColor} shadow-md transition`;
                tabPreviewBtn.className = 'flex-1 py-2 text-center font-semibold text-xs rounded-lg text-slate-300 transition';
            });

            tabPreviewBtn.addEventListener('click', () => {
                previewSection.classList.remove('hidden');
                formSection.classList.add('hidden');
                tabPreviewBtn.className = `flex-1 py-2 text-center font-bold text-xs rounded-lg ${activeColor} shadow-md transition`;
                tabFormBtn.className = 'flex-1 py-2 text-center font-semibold text-xs rounded-lg text-slate-300 transition';
            });
        }

        const btnUpload = document.getElementById(this.isMain ? 'btnUploadDrive' : `csBtnUploadDrive-${this.key}`);
        if (btnUpload) {
            btnUpload.addEventListener('click', () => {
                const now = Date.now();
                if (PdfService.cooldownUntil && now < PdfService.cooldownUntil) {
                    const remainingSec = Math.ceil((PdfService.cooldownUntil - now) / 1000);
                    alert(`Jeda pengiriman aktif. Harap tunggu ${remainingSec} detik sebelum mengunggah laporan lagi.`);
                    return;
                }

                const check = this.validateReport();
                if (!check.valid) {
                    alert(check.message);
                    return;
                }

                const info = CONFIG.FOLDERS[this.key];
                const dateId = this.getId('inputTanggal');
                const dateEl = document.getElementById(dateId);
                const formattedDate = PdfService.formatIndonesianDate(dateEl ? dateEl.value : '');

                PdfService.promptConfirmation({
                    moduleTitle: info.title,
                    dateFormatted: formattedDate,
                    officerName: currentProfile.nama,
                    onConfirm: async () => {
                        const filename = PdfService.generateFilename(info.prefix, dateId, currentProfile.nama);
                        const containerId = this.isMain ? 'pdfContent' : `csPdfContent-${this.key}`;

                        await PdfService.processAndUpload({
                            buttonEl: btnUpload,
                            containerId: containerId,
                            filename: filename,
                            folderId: info.folderId,
                            driveFolderUrl: info.driveFolderUrl
                        });
                    }
                });
            });
        }
    }

    validateReport() {
        const trapHp = document.getElementById('hpSecurityTrap');
        if (trapHp && trapHp.value.trim() !== '') {
            return { valid: false, message: 'Aktivitas tidak wajar terdeteksi.' };
        }

        if (!currentProfile.nama || currentProfile.nama.trim() === '' || currentProfile.nama === '-') {
            return { valid: false, message: 'Nama Petugas pada Pengaturan Profil belum diisi!' };
        }

        const dateInp = document.getElementById(this.getId('inputTanggal'));
        if (!dateInp || !dateInp.value) {
            return { valid: false, message: 'Harap tentukan tanggal kegiatan terlebih dahulu!' };
        }

        const lokasiSelector = this.isMain ? '.input-lokasi' : `#view-coming-soon-${this.key} .cs-input-lokasi`;
        const lokasiFilled = Array.from(document.querySelectorAll(lokasiSelector))
            .filter((inp) => inp.value.trim().length > 0);
        if (lokasiFilled.length === 0) {
            return { valid: false, message: 'Harap isi minimal 1 (satu) Tempat / Lokasi kegiatan!' };
        }

        const hasilSelector = this.isMain ? '.input-hasil' : `#view-coming-soon-${this.key} .cs-input-hasil`;
        const hasilFilled = Array.from(document.querySelectorAll(hasilSelector))
            .filter((inp) => inp.value.trim().length > 0);
        if (hasilFilled.length === 0) {
            return { valid: false, message: 'Harap isi minimal 1 (satu) poin Uraian Kegiatan!' };
        }

        if (this.state.anggotaMode === 'manual') {
            const anggotaSelector = this.isMain
                ? '.input-anggota'
                : `#csManualAnggotaList-${this.key} .cs-input-manual-anggota`;
            const anggotaFilled = Array.from(document.querySelectorAll(anggotaSelector))
                .filter((inp) => inp.value.trim().length > 0);
            if (anggotaFilled.length === 0) {
                return { valid: false, message: 'Harap isi minimal 1 (satu) Nama Anggota Tim!' };
            }
        } else {
            if (this.state.anggotaPhotos.length === 0) {
                return { valid: false, message: 'Harap unggah minimal 1 (satu) foto Nama Anggota atau gunakan Mode Input Manual!' };
            }
        }

        return { valid: true };
    }
}

const NavigationManager = {
    switchTo(target) {
        const navBtns = document.querySelectorAll('.top-nav-btn');
        navBtns.forEach((btn) => {
            if (btn.getAttribute('data-target') === target) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        const appViews = document.querySelectorAll('.app-view');
        appViews.forEach((view) => {
            view.classList.add('hidden');
            view.classList.remove('flex', 'active-view');
        });

        const targetView = document.getElementById(`view-${target}`);
        if (targetView) {
            targetView.classList.remove('hidden');
            targetView.classList.add('flex', 'active-view');
        }

        if (window.lucide) {
            lucide.createIcons();
        }
    },

    init() {
        const navBtns = document.querySelectorAll('.top-nav-btn');
        navBtns.forEach((btn) => {
            btn.addEventListener('click', () => {
                const target = btn.getAttribute('data-target');
                this.switchTo(target);
            });
        });

        const btnBackSilahapp = document.getElementById('btnCsBackSilahapp');
        if (btnBackSilahapp) {
            btnBackSilahapp.addEventListener('click', () => {
                this.switchTo('silahapp');
            });
        }

        const btnBackPesut = document.getElementById('btnCsBackPesut');
        if (btnBackPesut) {
            btnBackPesut.addEventListener('click', () => {
                this.switchTo('coming-soon-1');
            });
        }

        const csModal = document.getElementById('csModal');
        const btnOpenCs = document.getElementById('btnOpenCsModal');
        const btnCloseCs = document.getElementById('btnCloseCsModal');
        if (btnOpenCs && csModal && btnCloseCs) {
            btnOpenCs.addEventListener('click', () => csModal.classList.remove('hidden'));
            btnCloseCs.addEventListener('click', () => csModal.classList.add('hidden'));
            csModal.addEventListener('click', (e) => {
                if (e.target === csModal) csModal.classList.add('hidden');
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    StorageService.init();
    generateComingSoonViews();

    const initialProfile = StorageService.getProfile();
    ProfileManager.applyUI(initialProfile);
    ProfileManager.bindEvents();

    const controllers = {
        silahapp: new ReportController('silahapp'),
        1: new ReportController(1)
    };

    controllers.silahapp.init();
    controllers[1].init();

    NavigationManager.init();
    lucide.createIcons();
});
