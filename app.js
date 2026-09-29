const DEFAULT_INHU_DRIVE_URL = 'https://lh3.googleusercontent.com/d/1U-Whswnt_2pOQipuTZ0hHag42p6EhZgb';
const DEFAULT_SATPOL_PP_DRIVE_URL = 'https://lh3.googleusercontent.com/d/1sxdzLxjYv-T3N2D7EH1cIP1YvOKlMxdr';
const SILAHAPP_DEFAULT_ICON_URL = 'https://lh3.googleusercontent.com/d/1OpcEZCqFtfhS13i9m5qdyBPhxuPqy313';
const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1aPfFmrtTlEkUEMNsWn-fASHKXQYP6nxL?usp=drive_link';

const COMING_SOON_FOLDERS = {
    1: 'https://drive.google.com/drive/folders/1xnLVXT41K96_dHipGjCDDQKF-SkDHbyf?usp=sharing',
    2: 'https://drive.google.com/drive/folders/2xnLVXT41K96_dHipGjCDDQKF-SkDHbyf?usp=sharing'
};

let userProfile = {
    logoLeft: DEFAULT_INHU_DRIVE_URL,
    logoRight: DEFAULT_SATPOL_PP_DRIVE_URL,
    sidebarIcons: {
        'silahapp': SILAHAPP_DEFAULT_ICON_URL,
        '1': DEFAULT_INHU_DRIVE_URL,
        '2': DEFAULT_SATPOL_PP_DRIVE_URL
    },
    nama: 'Fajar Ari Prakoso',
    nip: '199507102025211095',
    jabatan: 'Staff Program dan Keuangan'
};

let uploadedPhotos = [];
let anggotaListContainer, lokasiListContainer, hasilListContainer;
let csData = {};
let settingsModal, driveNoticeModal, inputNip;

document.addEventListener('DOMContentLoaded', () => {
    const cacheVersion = localStorage.getItem('satpol_app_version');
    if (cacheVersion !== 'v31_fix_all_functions') {
        localStorage.removeItem('satpolpp_inhu_trantibum_profile');
        localStorage.setItem('satpol_app_version', 'v31_fix_all_functions');
    }

    settingsModal = document.getElementById('settingsModal');
    driveNoticeModal = document.getElementById('driveNoticeModal');
    inputNip = document.getElementById('inputSettingNip');

    generateComingSoonViews();

    lokasiListContainer = document.getElementById('lokasiList');
    hasilListContainer = document.getElementById('hasilList');
    anggotaListContainer = document.getElementById('anggotaList');

    lucide.createIcons();
    loadSettings();
    initDefaultDate();
    
    addLokasiInput();
    addHasilInput();
    addAnggotaInput();

    for (let i = 1; i <= 2; i++) {
        csData[i] = { uploadedPhotos: [], anggotaPhotos: [], manualAnggota: [] };
        addCsLokasiInput(i);
        addCsHasilInput(i);
        addCsManualAnggotaInput(i);
        initCsModuleEvents(i);
    }
    
    bindEvents();
    updatePreview();
    initTopNavNavigation();
});

function initTopNavNavigation() {
    const navBtns = document.querySelectorAll('.top-nav-btn');
    const appViews = document.querySelectorAll('.app-view');

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            appViews.forEach(view => {
                view.classList.add('hidden');
                view.classList.remove('active-view');
            });

            const targetView = document.getElementById(`view-${target}`);
            if (targetView) {
                targetView.classList.remove('hidden');
                targetView.classList.add('active-view');
            }
        });
    });
}

function generateComingSoonViews() {
    const container = document.getElementById('comingSoonContainer');
    let htmlContent = '';

    const moduleTitles = { 1: 'Pelaporan Surat Tugas', 2: 'Coming Soon' };
    const moduleSubtitles = { 1: 'Sistem Pelaporan Surat Tugas Perjalanan Dinas', 2: 'Modul Pengembangan Lanjutan 2' };

    for (let i = 1; i <= 2; i++) {
        htmlContent += `
            <div id="view-coming-soon-${i}" class="app-view hidden flex-1 flex flex-col">
                <header class="glass-header text-white sticky top-[53px] sm:top-[57px] z-30 shadow-2xl border-b border-slate-700/60 no-print">
                    <div class="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
                        <div class="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-start">
                            <div class="flex items-center gap-2">
                                <img src="${DEFAULT_INHU_DRIVE_URL}" class="w-8 h-8 object-contain bg-white rounded p-0.5">
                                <img src="${DEFAULT_SATPOL_PP_DRIVE_URL}" class="w-8 h-8 object-contain bg-white rounded p-0.5">
                            </div>
                            <div>
                                <h1 class="font-extrabold text-base sm:text-lg tracking-wide leading-tight text-white flex items-center gap-1.5">${moduleTitles[i]}</h1>
                                <p class="text-[10px] sm:text-[11px] text-indigo-400 font-semibold tracking-wider">${moduleSubtitles[i]}</p>
                            </div>
                        </div>
                        <div class="flex items-center justify-end w-full sm:w-auto">
                            <button id="btnSettings" class="w-full sm:w-auto flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-400 text-slate-950 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition shadow-lg shadow-amber-500/20 active:scale-95">
                                <i data-lucide="settings" class="w-4 h-4"></i>
                                <span>Pengaturan Profil</span>
                            </button>
                        </div>
                    </div>
                </header>

                <main class="relative z-10 flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div class="lg:hidden col-span-1 flex bg-slate-900/90 p-1 rounded-xl backdrop-blur-md mb-2 no-print border border-slate-700/60 shadow-xl">
                        <button id="csTabFormBtn-${i}" class="flex-1 py-2 text-center font-bold text-xs rounded-lg bg-indigo-500 text-white shadow-md transition">Isi Laporan</button>
                        <button id="csTabPreviewBtn-${i}" class="flex-1 py-2 text-center font-semibold text-xs rounded-lg text-slate-300 transition">Pratinjau</button>
                    </div>

                    <!-- FORM CS -->
                    <section id="csFormSection-${i}" class="lg:col-span-5 space-y-6 no-print">
                        <div class="glass-panel p-4 sm:p-6 rounded-3xl shadow-2xl border border-white/70">
                            <div class="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                                <h2 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                                    <i data-lucide="clipboard-list" class="w-5 h-5 text-indigo-600"></i> Formulir ${moduleTitles[i]}
                                </h2>
                                <span class="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">${moduleTitles[i]}</span>
                            </div>

                            <form class="space-y-4" onsubmit="event.preventDefault();">
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">1. Tanggal Laporan</label>
                                    <input type="date" id="csInputTanggal-${i}" class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs sm:text-sm font-semibold shadow-sm">
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-1.5">
                                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">2. Dasar Pelaksanaan & Lokasi</label>
                                        <button type="button" id="csBtnAddLokasi-${i}" class="text-[11px] font-bold text-indigo-800 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-lg transition border border-indigo-300">+ Tambah Lokasi</button>
                                    </div>
                                    <div class="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200 shadow-inner space-y-3">
                                        <textarea id="csInputDasar-${i}" rows="2" placeholder="Dasar Pelaksanaan..." class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm outline-none shadow-sm"></textarea>
                                        <div class="pt-1 border-t border-indigo-200">
                                            <label class="block text-[11px] font-bold text-indigo-900 uppercase mb-1.5">Daftar Tempat / Lokasi:</label>
                                            <div id="csLokasiList-${i}" class="space-y-2"></div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-1.5">
                                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">3. Uraian Kegiatan</label>
                                        <button type="button" id="csBtnAddHasil-${i}" class="text-[11px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-lg transition border border-indigo-300">+ Tambah Poin</button>
                                    </div>
                                    <div class="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200 shadow-inner">
                                        <div id="csHasilList-${i}" class="space-y-2"></div>
                                    </div>
                                </div>
                                <div>
                                    <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">4. Hasil Kegiatan</label>
                                    <div class="bg-slate-100 p-3 rounded-2xl border border-slate-300 shadow-inner">
                                        <textarea id="csInputKegiatan-${i}" rows="3" placeholder="Deskripsikan rincian..." class="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm outline-none shadow-sm"></textarea>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex items-center justify-between mb-1.5">
                                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">5. Nama Anggota Satgas (Pilih Opsi)</label>
                                    </div>
                                    <div class="flex bg-slate-200 p-1 rounded-xl mb-3">
                                        <button type="button" id="csAnggotaModeFotoBtn-${i}" class="flex-1 py-1.5 text-center font-bold text-xs rounded-lg bg-indigo-600 text-white shadow transition">Foto Nama Anggota</button>
                                        <button type="button" id="csAnggotaModeManualBtn-${i}" class="flex-1 py-1.5 text-center font-semibold text-xs rounded-lg text-slate-700 transition">Tambah Manual</button>
                                    </div>

                                    <!-- Mode 1: Foto -->
                                    <div id="csAnggotaFotoWrapper-${i}" class="space-y-2">
                                        <div class="flex justify-between items-center">
                                            <span class="text-[11px] font-bold text-slate-600">Foto Nama Anggota</span>
                                            <span id="csAnggotaPhotoCount-${i}" class="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">0 / 10 Foto</span>
                                        </div>
                                        <div class="border-2 border-dashed border-indigo-300 bg-white rounded-2xl p-4 text-center relative cursor-pointer group">
                                            <input type="file" id="csInputAnggotaFoto-${i}" accept="image/*" multiple class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                                            <p class="text-xs font-bold text-slate-800">Klik / Tarik Foto Nama Anggota</p>
                                        </div>
                                        <div id="csAnggotaPhotoPreview-${i}" class="grid grid-cols-4 gap-2 mt-2"></div>
                                    </div>

                                    <!-- Mode 2: Manual -->
                                    <div id="csAnggotaManualWrapper-${i}" class="space-y-2 hidden">
                                        <div class="flex justify-between items-center">
                                            <span class="text-[11px] font-bold text-slate-600">Daftar Nama Anggota</span>
                                            <button type="button" id="csBtnAddManualAnggota-${i}" class="text-[11px] font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-2 py-1 rounded-lg transition border border-indigo-300">+ Tambah Nama</button>
                                        </div>
                                        <div class="bg-indigo-50/80 p-3 rounded-2xl border border-indigo-200 shadow-inner">
                                            <div id="csManualAnggotaList-${i}" class="space-y-2"></div>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <div class="flex justify-between items-center mb-1.5">
                                        <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">6. Foto Dokumentasi</label>
                                        <span id="csPhotoCount-${i}" class="text-[10px] font-bold text-slate-600 bg-slate-200 px-2 py-0.5 rounded-full">0 / 10 Foto</span>
                                    </div>
                                    <div class="border-2 border-dashed border-indigo-300 bg-white rounded-2xl p-4 text-center relative cursor-pointer group">
                                        <input type="file" id="csInputDokumentasi-${i}" accept="image/*" multiple class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10">
                                        <p class="text-xs font-bold text-slate-800">Klik / Tarik Foto Dokumentasi</p>
                                    </div>
                                    <div id="csPhotoPreview-${i}" class="grid grid-cols-4 gap-2 mt-3"></div>
                                </div>
                            </form>
                        </div>
                    </section>

                    <!-- PREVIEW CS -->
                    <section id="csPreviewSection-${i}" class="lg:col-span-7 hidden lg:block space-y-4">
                        <div class="glass-panel p-4 rounded-2xl shadow-2xl border border-white/70 flex flex-wrap gap-3 justify-between items-center no-print">
                            <span class="text-xs text-slate-800 font-extrabold flex items-center gap-2">
                                <span class="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-pulse"></span> Pratinjau Dokumen A4 (${moduleTitles[i]})
                            </span>
                            <div class="flex items-center gap-2 w-full sm:w-auto">
                                <button id="csBtnDownloadPDF-${i}" class="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg">Download PDF</button>
                                <button id="csBtnUploadDrive-${i}" class="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-lg">Google Drive</button>
                            </div>
                        </div>
                        <div class="overflow-x-auto pb-6">
                            <div id="csPdfContent-${i}" class="a4-page text-slate-900 text-xs leading-relaxed flex flex-col justify-between">
                                <div>
                                    <div class="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-4 gap-3">
                                        <div class="flex-shrink-0 flex items-center justify-center"><img src="${DEFAULT_INHU_DRIVE_URL}" class="object-contain" style="width:100%; height:100%; background:#fff; padding:6px; border-radius:8px;"></div>
                                        <div class="flex-1 text-center px-1">
                                            <h3 class="text-[11px] font-black uppercase tracking-widest text-slate-900 leading-tight">PEMERINTAH KABUPATEN INDRAGIRI HULU</h3>
                                            <h2 class="text-sm sm:text-base font-black uppercase tracking-wider text-slate-950 my-0.5 leading-tight">SATUAN POLISI PAMONG PRAJA</h2>
                                            <div class="w-full h-0.5 bg-slate-900 my-1"></div>
                                            <h1 class="text-sm sm:text-base font-black uppercase tracking-wide text-indigo-950 leading-tight">LAPORAN ${moduleTitles[i].toUpperCase()}</h1>
                                        </div>
                                        <div class="flex-shrink-0 flex items-center justify-center"><img src="${DEFAULT_SATPOL_PP_DRIVE_URL}" class="object-contain" style="width:100%; height:100%; background:#fff; padding:6px; border-radius:8px;"></div>
                                    </div>
                                    <div class="preview-block pdf-box shadow-sm mb-4">
                                        <div class="grid grid-cols-2 gap-2 text-[11px]">
                                            <div><span class="font-semibold text-slate-500 block text-[10px]">Nama Lengkap:</span><span id="csViewNama-${i}" class="font-bold text-slate-900 text-xs">-</span></div>
                                            <div><span class="font-semibold text-slate-500 block text-[10px]">NIP:</span><span id="csViewNip-${i}" class="font-semibold text-slate-800">-</span></div>
                                            <div class="col-span-2 border-t border-slate-200 pt-1.5 mt-0.5"><span class="font-semibold text-slate-500 block text-[10px]">Jabatan / Unit Kerja:</span><span id="csViewJabatan-${i}" class="font-semibold text-slate-800">-</span></div>
                                        </div>
                                    </div>
                                    <div class="space-y-3">
                                        <div class="preview-block flex items-center gap-2 border-b border-slate-200 pb-2">
                                            <span class="font-bold text-slate-900 w-32 flex-shrink-0 text-xs">Hari / Tanggal</span><span class="text-slate-400">:</span><span id="csViewTanggal-${i}" class="font-bold text-slate-950 text-xs"></span>
                                        </div>
                                        <div id="csBlockDasar-${i}" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">1. Dasar Pelaksanaan</label><div id="csViewDasar-${i}" class="pdf-box min-h-[42px] whitespace-pre-line">-</div></div>
                                        <div id="csBlockLokasi-${i}" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">2. Tempat Pelaksanaan</label><div class="pdf-box min-h-[42px]"><div id="csViewTempat-${i}" class="space-y-1"></div></div></div>
                                        <div id="csBlockHasil-${i}" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">3. Hasil Kegiatan</label><div class="pdf-box min-h-[48px]"><div id="csViewHasil-${i}" class="space-y-1"></div></div></div>
                                        <div id="csBlockKegiatan-${i}" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">4. Uraian Kegiatan</label><div id="csViewKegiatan-${i}" class="pdf-box min-h-[48px] whitespace-pre-line">-</div></div>
                                        <div id="csBlockAnggota-${i}" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1" id="csLabelAnggotaTitle-${i}">5. Daftar Nama Anggota Satgas</label><div class="pdf-box min-h-[50px]"><div id="csViewAnggota-${i}"></div></div></div>
                                        <div id="csBlockDokumentasi-${i}" class="preview-block"><label class="font-bold text-slate-900 text-[11px] uppercase block mb-1">6. Dokumentasi Foto Kegiatan</label><div class="pdf-box min-h-[90px]"><div id="csViewDokumentasi-${i}" class="grid grid-cols-2 gap-3"></div></div></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        `;
    }
    container.innerHTML = htmlContent;
}

function initDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    const mainDate = document.getElementById('inputTanggal');
    if (mainDate) mainDate.value = today;
    
    for (let i = 1; i <= 2; i++) {
        const dateInput = document.getElementById(`csInputTanggal-${i}`);
        if (dateInput) dateInput.value = today;
    }
}

function formatIndonesianDate(dateStr) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function generatePdfFilename(modulePrefix, inputDateId) {
    const dateEl = document.getElementById(inputDateId);
    const rawDate = (dateEl && dateEl.value) ? dateEl.value : new Date().toISOString().split('T')[0];
    const cleanNama = (userProfile.nama || 'Petugas').trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    return `${rawDate}_${modulePrefix}_${cleanNama}.pdf`;
}

function createPdfListItem(index, text) {
    const row = document.createElement('div');
    row.className = 'pdf-list-item';
    row.innerHTML = `<span class="pdf-list-num">${index}.</span><span class="pdf-list-text">${text}</span>`;
    return row;
}

// ================= SILAHAPP LOGIC =================
function addLokasiInput(value = '') {
    if (!lokasiListContainer) return;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 class-lokasi-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center lokasi-index">1.</span>
        <input type="text" value="${value}" placeholder="Tempat / Lokasi..." class="input-lokasi flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none">
        <button type="button" class="btn-remove-lokasi text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    `;
    lokasiListContainer.appendChild(div);
    lucide.createIcons();
    updateLokasiIndexes();
    div.querySelector('.input-lokasi').addEventListener('input', updatePreview);
    div.querySelector('.btn-remove-lokasi').addEventListener('click', () => {
        if (lokasiListContainer.children.length > 1) { div.remove(); updateLokasiIndexes(); updatePreview(); }
    });
}
function updateLokasiIndexes() {
    if (!lokasiListContainer) return;
    lokasiListContainer.querySelectorAll('.class-lokasi-item').forEach((item, index) => {
        item.querySelector('.lokasi-index').textContent = `${index + 1}.`;
    });
}

function addHasilInput(value = '') {
    if (!hasilListContainer) return;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 class-hasil-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center item-index">1.</span>
        <input type="text" value="${value}" placeholder="Poin hasil patroli..." class="input-hasil flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none">
        <button type="button" class="btn-remove-hasil text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    `;
    hasilListContainer.appendChild(div);
    lucide.createIcons();
    updateHasilIndexes();
    div.querySelector('.input-hasil').addEventListener('input', updatePreview);
    div.querySelector('.btn-remove-hasil').addEventListener('click', () => {
        if (hasilListContainer.children.length > 1) { div.remove(); updateHasilIndexes(); updatePreview(); }
    });
}
function updateHasilIndexes() {
    if (!hasilListContainer) return;
    hasilListContainer.querySelectorAll('.class-hasil-item').forEach((item, index) => {
        item.querySelector('.item-index').textContent = `${index + 1}.`;
    });
}

function addAnggotaInput(value = '') {
    if (!anggotaListContainer) return;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 class-anggota-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center anggota-index">1.</span>
        <input type="text" value="${value}" placeholder="Nama lengkap anggota..." class="input-anggota flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none">
        <button type="button" class="btn-remove-anggota text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    `;
    anggotaListContainer.appendChild(div);
    lucide.createIcons();
    updateAnggotaIndexes();
    div.querySelector('.input-anggota').addEventListener('input', updatePreview);
    div.querySelector('.btn-remove-anggota').addEventListener('click', () => {
        if (anggotaListContainer.children.length > 1) { div.remove(); updateAnggotaIndexes(); updatePreview(); }
    });
}
function updateAnggotaIndexes() {
    if (!anggotaListContainer) return;
    anggotaListContainer.querySelectorAll('.class-anggota-item').forEach((item, index) => {
        item.querySelector('.anggota-index').textContent = `${index + 1}.`;
    });
}

function updatePreview() {
    const inputTanggal = document.getElementById('inputTanggal');
    if (!inputTanggal) return;
    
    document.getElementById('viewTanggal').textContent = formatIndonesianDate(inputTanggal.value);

    const dasarVal = document.getElementById('inputDasar').value.trim();
    document.getElementById('blockDasar').style.display = dasarVal ? 'block' : 'none';
    document.getElementById('viewDasar').textContent = dasarVal;

    const viewTempat = document.getElementById('viewTempat');
    viewTempat.innerHTML = '';
    let lCount = 0;
    document.querySelectorAll('.input-lokasi').forEach(inp => {
        if (inp.value.trim()) viewTempat.appendChild(createPdfListItem(++lCount, inp.value.trim()));
    });
    document.getElementById('blockLokasi').style.display = lCount > 0 ? 'block' : 'none';

    const viewHasil = document.getElementById('viewHasil');
    viewHasil.innerHTML = '';
    let hCount = 0;
    document.querySelectorAll('.input-hasil').forEach(inp => {
        if (inp.value.trim()) viewHasil.appendChild(createPdfListItem(++hCount, inp.value.trim()));
    });
    document.getElementById('blockHasil').style.display = hCount > 0 ? 'block' : 'none';

    const kVal = document.getElementById('inputKegiatan').value.trim();
    document.getElementById('blockKegiatan').style.display = kVal ? 'block' : 'none';
    document.getElementById('viewKegiatan').textContent = kVal;

    const viewAnggota = document.getElementById('viewAnggota');
    viewAnggota.innerHTML = '';
    let aCount = 0;
    document.querySelectorAll('.input-anggota').forEach(inp => {
        if (inp.value.trim()) viewAnggota.appendChild(createPdfListItem(++aCount, inp.value.trim()));
    });
    document.getElementById('blockAnggota').style.display = aCount > 0 ? 'block' : 'none';

    renderPhotoPreview();
}

function renderPhotoPreview() {
    const container = document.getElementById('photoPreview');
    const viewContainer = document.getElementById('viewDokumentasi');
    const countEl = document.getElementById('photoCount');
    const blockDoc = document.getElementById('blockDokumentasi');
    
    if (!container || !viewContainer) return;

    countEl.textContent = `${uploadedPhotos.length} / 10 Foto`;
    blockDoc.style.display = uploadedPhotos.length === 0 ? 'none' : 'block';
    
    container.innerHTML = '';
    viewContainer.innerHTML = '';

    uploadedPhotos.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'relative aspect-square border rounded-xl overflow-hidden bg-white shadow-sm';
        thumb.innerHTML = `<img src="${src}" class="w-full h-full object-cover"><button type="button" onclick="removePhoto(${idx})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"><i data-lucide="x" class="w-3 h-3"></i></button>`;
        container.appendChild(thumb);

        const pdfCard = document.createElement('div');
        pdfCard.className = 'border rounded-xl p-2 bg-white text-center shadow-sm photo-wrapper';
        pdfCard.innerHTML = `<div class="photo-wrapper"><img src="${src}"></div><span class="text-[10px] text-slate-600 font-bold block mt-1.5">Dokumentasi ${idx + 1}</span>`;
        viewContainer.appendChild(pdfCard);
    });
    lucide.createIcons();
}

window.removePhoto = (i) => { uploadedPhotos.splice(i, 1); renderPhotoPreview(); };


// ================= MODUL LANJUTAN LOGIC =================
function addCsLokasiInput(i, value = '') {
    const container = document.getElementById(`csLokasiList-${i}`);
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 cs-lokasi-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center cs-lokasi-index">1.</span>
        <input type="text" value="${value}" placeholder="Tempat / Lokasi..." class="cs-input-lokasi flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none">
        <button type="button" class="cs-btn-remove-lokasi text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    `;
    container.appendChild(div);
    lucide.createIcons();
    updateCsLokasiIndexes(i);
    div.querySelector('.cs-input-lokasi').addEventListener('input', () => updateCsPreview(i));
    div.querySelector('.cs-btn-remove-lokasi').addEventListener('click', () => {
        if (container.children.length > 1) { div.remove(); updateCsLokasiIndexes(i); updateCsPreview(i); }
    });
}
function updateCsLokasiIndexes(i) {
    const container = document.getElementById(`csLokasiList-${i}`);
    if (!container) return;
    container.querySelectorAll('.cs-lokasi-item').forEach((item, index) => {
        item.querySelector('.cs-lokasi-index').textContent = `${index + 1}.`;
    });
}

function addCsHasilInput(i, value = '') {
    const container = document.getElementById(`csHasilList-${i}`);
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 cs-hasil-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center cs-item-index">1.</span>
        <input type="text" value="${value}" placeholder="Poin hasil..." class="cs-input-hasil flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none">
        <button type="button" class="cs-btn-remove-hasil text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    `;
    container.appendChild(div);
    lucide.createIcons();
    updateCsHasilIndexes(i);
    div.querySelector('.cs-input-hasil').addEventListener('input', () => updateCsPreview(i));
    div.querySelector('.cs-btn-remove-hasil').addEventListener('click', () => {
        if (container.children.length > 1) { div.remove(); updateCsHasilIndexes(i); updateCsPreview(i); }
    });
}
function updateCsHasilIndexes(i) {
    const container = document.getElementById(`csHasilList-${i}`);
    if (!container) return;
    container.querySelectorAll('.cs-hasil-item').forEach((item, index) => {
        item.querySelector('.cs-item-index').textContent = `${index + 1}.`;
    });
}

function addCsManualAnggotaInput(i, value = '') {
    const container = document.getElementById(`csManualAnggotaList-${i}`);
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 cs-manual-anggota-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center cs-manual-anggota-index">1.</span>
        <input type="text" value="${value}" placeholder="Nama lengkap anggota..." class="cs-input-manual-anggota flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none">
        <button type="button" class="cs-btn-remove-manual-anggota text-slate-400 hover:text-red-600 p-1"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
    `;
    container.appendChild(div);
    lucide.createIcons();
    updateCsManualAnggotaIndexes(i);
    div.querySelector('.cs-input-manual-anggota').addEventListener('input', () => updateCsPreview(i));
    div.querySelector('.cs-btn-remove-manual-anggota').addEventListener('click', () => {
        if (container.children.length > 1) { div.remove(); updateCsManualAnggotaIndexes(i); updateCsPreview(i); }
    });
}
function updateCsManualAnggotaIndexes(i) {
    const container = document.getElementById(`csManualAnggotaList-${i}`);
    if (!container) return;
    container.querySelectorAll('.cs-manual-anggota-item').forEach((item, index) => {
        item.querySelector('.cs-manual-anggota-index').textContent = `${index + 1}.`;
    });
}

function updateCsPreview(i) {
    const dateInput = document.getElementById(`csInputTanggal-${i}`);
    if (!dateInput) return;

    document.getElementById(`csViewTanggal-${i}`).textContent = formatIndonesianDate(dateInput.value);

    const dVal = document.getElementById(`csInputDasar-${i}`).value.trim();
    document.getElementById(`csBlockDasar-${i}`).style.display = dVal ? 'block' : 'none';
    document.getElementById(`csViewDasar-${i}`).textContent = dVal;

    const viewTempat = document.getElementById(`csViewTempat-${i}`);
    viewTempat.innerHTML = '';
    let lCount = 0;
    document.querySelectorAll(`#view-coming-soon-${i} .cs-input-lokasi`).forEach(inp => {
        if (inp.value.trim()) viewTempat.appendChild(createPdfListItem(++lCount, inp.value.trim()));
    });
    document.getElementById(`csBlockLokasi-${i}`).style.display = lCount > 0 ? 'block' : 'none';

    const viewHasil = document.getElementById(`csViewHasil-${i}`);
    viewHasil.innerHTML = '';
    let hCount = 0;
    document.querySelectorAll(`#view-coming-soon-${i} .cs-input-hasil`).forEach(inp => {
        if (inp.value.trim()) viewHasil.appendChild(createPdfListItem(++hCount, inp.value.trim()));
    });
    document.getElementById(`csBlockHasil-${i}`).style.display = hCount > 0 ? 'block' : 'none';

    const kVal = document.getElementById(`csInputKegiatan-${i}`).value.trim();
    document.getElementById(`csBlockKegiatan-${i}`).style.display = kVal ? 'block' : 'none';
    document.getElementById(`csViewKegiatan-${i}`).textContent = kVal;

    renderCsPhotoPreviews(i);
}

function renderCsPhotoPreviews(i) {
    const data = csData[i];
    const manualWrapper = document.getElementById(`csAnggotaManualWrapper-${i}`);
    if (!manualWrapper) return;
    
    const isManualMode = !manualWrapper.classList.contains('hidden');

    const titleEl = document.getElementById(`csLabelAnggotaTitle-${i}`);
    const viewAnggotaContainer = document.getElementById(`csViewAnggota-${i}`);
    viewAnggotaContainer.innerHTML = '';

    if (isManualMode) {
        titleEl.textContent = '5. Daftar Nama Anggota Satgas';
        let mCount = 0;
        let hasContent = false;
        const manualItems = document.querySelectorAll(`#csManualAnggotaList-${i} .cs-input-manual-anggota`);
        
        const listDiv = document.createElement('div');
        manualItems.forEach(inp => {
            if (inp.value.trim()) {
                hasContent = true;
                listDiv.appendChild(createPdfListItem(++mCount, inp.value.trim()));
            }
        });
        viewAnggotaContainer.appendChild(listDiv);
        document.getElementById(`csBlockAnggota-${i}`).style.display = hasContent ? 'block' : 'none';
    } else {
        titleEl.textContent = '5. Dokumentasi Foto Nama Anggota';
        document.getElementById(`csAnggotaPhotoCount-${i}`).textContent = `${data.anggotaPhotos.length} / 10 Foto`;
        document.getElementById(`csBlockAnggota-${i}`).style.display = data.anggotaPhotos.length === 0 ? 'none' : 'block';

        const gridDiv = document.createElement('div');
        gridDiv.className = 'grid grid-cols-2 gap-3';
        data.anggotaPhotos.forEach((src, idx) => {
            const pdfCard = document.createElement('div');
            pdfCard.className = 'border rounded-xl p-2 bg-white text-center shadow-sm photo-wrapper';
            pdfCard.innerHTML = `<div class="photo-wrapper"><img src="${src}"></div><span class="text-[10px] text-slate-600 font-bold block mt-1.5">Nama Anggota ${idx + 1}</span>`;
            gridDiv.appendChild(pdfCard);
        });
        viewAnggotaContainer.appendChild(gridDiv);
    }

    const aContainer = document.getElementById(`csAnggotaPhotoPreview-${i}`);
    aContainer.innerHTML = '';
    data.anggotaPhotos.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'relative aspect-square border rounded-xl overflow-hidden bg-white shadow-sm';
        thumb.innerHTML = `<img src="${src}" class="w-full h-full object-cover"><button type="button" onclick="removeCsAnggotaPhoto(${i}, ${idx})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"><i data-lucide="x" class="w-3 h-3"></i></button>`;
        aContainer.appendChild(thumb);
    });

    const dContainer = document.getElementById(`csPhotoPreview-${i}`);
    const dViewContainer = document.getElementById(`csViewDokumentasi-${i}`);
    document.getElementById(`csPhotoCount-${i}`).textContent = `${data.uploadedPhotos.length} / 10 Foto`;
    document.getElementById(`csBlockDokumentasi-${i}`).style.display = data.uploadedPhotos.length === 0 ? 'none' : 'block';

    dContainer.innerHTML = '';
    dViewContainer.innerHTML = '';
    data.uploadedPhotos.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'relative aspect-square border rounded-xl overflow-hidden bg-white shadow-sm';
        thumb.innerHTML = `<img src="${src}" class="w-full h-full object-cover"><button type="button" onclick="removeCsPhoto(${i}, ${idx})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"><i data-lucide="x" class="w-3 h-3"></i></button>`;
        dContainer.appendChild(thumb);

        const pdfCard = document.createElement('div');
        pdfCard.className = 'border rounded-xl p-2 bg-white text-center shadow-sm photo-wrapper';
        pdfCard.innerHTML = `<div class="photo-wrapper"><img src="${src}"></div><span class="text-[10px] text-slate-600 font-bold block mt-1.5">Dokumentasi ${idx + 1}</span>`;
        dViewContainer.appendChild(pdfCard);
    });
    lucide.createIcons();
}

window.removeCsAnggotaPhoto = (i, idx) => { csData[i].anggotaPhotos.splice(idx, 1); renderCsPhotoPreviews(i); };
window.removeCsPhoto = (i, idx) => { csData[i].uploadedPhotos.splice(idx, 1); renderCsPhotoPreviews(i); };

function initCsModuleEvents(i) {
    const tanggalInp = document.getElementById(`csInputTanggal-${i}`);
    if (!tanggalInp) return;

    tanggalInp.addEventListener('input', () => updateCsPreview(i));
    document.getElementById(`csInputDasar-${i}`).addEventListener('input', () => updateCsPreview(i));
    document.getElementById(`csBtnAddLokasi-${i}`).addEventListener('click', () => addCsLokasiInput(i));
    document.getElementById(`csInputKegiatan-${i}`).addEventListener('input', () => updateCsPreview(i));
    document.getElementById(`csBtnAddHasil-${i}`).addEventListener('click', () => addCsHasilInput(i));
    document.getElementById(`csBtnAddManualAnggota-${i}`).addEventListener('click', () => addCsManualAnggotaInput(i));

    const fotoBtn = document.getElementById(`csAnggotaModeFotoBtn-${i}`);
    const manualBtn = document.getElementById(`csAnggotaModeManualBtn-${i}`);
    const fotoWrapper = document.getElementById(`csAnggotaFotoWrapper-${i}`);
    const manualWrapper = document.getElementById(`csAnggotaManualWrapper-${i}`);

    fotoBtn.addEventListener('click', () => {
        fotoBtn.className = 'flex-1 py-1.5 text-center font-bold text-xs rounded-lg bg-indigo-600 text-white shadow transition';
        manualBtn.className = 'flex-1 py-1.5 text-center font-semibold text-xs rounded-lg text-slate-700 transition';
        fotoWrapper.classList.remove('hidden');
        manualWrapper.classList.add('hidden');
        renderCsPhotoPreviews(i);
    });

    manualBtn.addEventListener('click', () => {
        manualBtn.className = 'flex-1 py-1.5 text-center font-bold text-xs rounded-lg bg-indigo-600 text-white shadow transition';
        fotoBtn.className = 'flex-1 py-1.5 text-center font-semibold text-xs rounded-lg text-slate-700 transition';
        manualWrapper.classList.remove('hidden');
        fotoWrapper.classList.add('hidden');
        renderCsPhotoPreviews(i);
    });

    document.getElementById(`csInputAnggotaFoto-${i}`).addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (csData[i].anggotaPhotos.length + files.length > 10) { alert('Maksimal 10 foto nama anggota!'); return; }
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (csData[i].anggotaPhotos.length < 10) {
                        csData[i].anggotaPhotos.push(ev.target.result);
                        renderCsPhotoPreviews(i);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        e.target.value = '';
    });

    document.getElementById(`csInputDokumentasi-${i}`).addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (csData[i].uploadedPhotos.length + files.length > 10) { alert('Maksimal 10 foto dokumentasi!'); return; }
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (csData[i].uploadedPhotos.length < 10) {
                        csData[i].uploadedPhotos.push(ev.target.result);
                        renderCsPhotoPreviews(i);
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        e.target.value = '';
    });

    document.getElementById(`csTabFormBtn-${i}`).addEventListener('click', () => {
        document.getElementById(`csFormSection-${i}`).classList.remove('hidden');
        document.getElementById(`csPreviewSection-${i}`).classList.add('hidden');
        document.getElementById(`csTabFormBtn-${i}`).className = 'flex-1 py-2 text-center font-bold text-xs rounded-lg bg-indigo-500 text-white shadow-md';
        document.getElementById(`csTabPreviewBtn-${i}`).className = 'flex-1 py-2 text-center font-semibold text-xs rounded-lg text-slate-300';
    });

    document.getElementById(`csTabPreviewBtn-${i}`).addEventListener('click', () => {
        document.getElementById(`csPreviewSection-${i}`).classList.remove('hidden');
        document.getElementById(`csFormSection-${i}`).classList.add('hidden');
        document.getElementById(`csTabPreviewBtn-${i}`).className = 'flex-1 py-2 text-center font-bold text-xs rounded-lg bg-indigo-500 text-white shadow-md';
        document.getElementById(`csTabFormBtn-${i}`).className = 'flex-1 py-2 text-center font-semibold text-xs rounded-lg text-slate-300';
    });

    document.getElementById(`csBtnDownloadPDF-${i}`).addEventListener('click', () => {
        const modulePrefix = i === 1 ? 'SuratTugas' : 'ComingSoon';
        const element = document.getElementById(`csPdfContent-${i}`);
        const filename = generatePdfFilename(modulePrefix, `csInputTanggal-${i}`);
        html2pdf().set({ margin: [0,0,0,0], filename: filename, image: {type:'jpeg', quality:0.92}, html2canvas: {scale:1.5, useCORS:true}, jsPDF: {unit:'mm', format:'a4'} }).from(element).save();
    });

    document.getElementById(`csBtnUploadDrive-${i}`).addEventListener('click', () => {
        const modulePrefix = i === 1 ? 'SuratTugas' : 'ComingSoon';
        const filename = generatePdfFilename(modulePrefix, `csInputTanggal-${i}`);
        document.getElementById('driveFilenameLabel').textContent = filename;
        const element = document.getElementById(`csPdfContent-${i}`);
        html2pdf().set({ margin: [0,0,0,0], filename: filename, image: {type:'jpeg', quality:0.92}, html2canvas: {scale:1.5, useCORS:true}, jsPDF: {unit:'mm', format:'a4'} }).from(element).save();
        window.open(COMING_SOON_FOLDERS[i], '_blank');
        driveNoticeModal.classList.remove('hidden');
    });

    updateCsPreview(i);
}


// ================= PROFILES & GLOBAL EVENTS =================
function loadSettings() {
    const saved = localStorage.getItem('satpolpp_inhu_trantibum_profile');
    if (saved) {
        try { userProfile = { ...userProfile, ...JSON.parse(saved) }; } catch(e){}
    }
    userProfile.logoLeft = DEFAULT_INHU_DRIVE_URL;
    userProfile.logoRight = DEFAULT_SATPOL_PP_DRIVE_URL;
    applyUserProfileUI();
}

function applyUserProfileUI() {
    const viewNama = document.getElementById('viewNama');
    if (viewNama) viewNama.textContent = userProfile.nama || '-';

    for (let i = 1; i <= 2; i++) {
        const el = document.getElementById(`csViewNama-${i}`);
        if (el) el.textContent = userProfile.nama || '-';
    }

    const cleanNip = userProfile.nip ? userProfile.nip.replace(/\D/g, '') : '';
    const formattedNip = cleanNip ? `NIP. ${cleanNip}` : '-';
    
    const viewNip = document.getElementById('viewNip');
    if (viewNip) viewNip.textContent = formattedNip;

    for (let i = 1; i <= 2; i++) {
        const el = document.getElementById(`csViewNip-${i}`);
        if (el) el.textContent = formattedNip;
    }

    const viewJabatan = document.getElementById('viewJabatan');
    if (viewJabatan) viewJabatan.textContent = userProfile.jabatan || '-';

    for (let i = 1; i <= 2; i++) {
        const el = document.getElementById(`csViewJabatan-${i}`);
        if (el) el.textContent = userProfile.jabatan || '-';
    }

    const inputSettingNama = document.getElementById('inputSettingNama');
    if (inputSettingNama) inputSettingNama.value = userProfile.nama || '';
    if (inputNip) inputNip.value = cleanNip;
    
    const inputSettingJabatan = document.getElementById('inputSettingJabatan');
    if (inputSettingJabatan) inputSettingJabatan.value = userProfile.jabatan || '';
    
    updateNipCounter();

    if (userProfile.sidebarIcons) {
        ['silahapp', '1', '2'].forEach(key => {
            const iconImg = document.getElementById(`sidebarIcon-${key}`);
            if (iconImg && userProfile.sidebarIcons[key]) {
                iconImg.src = userProfile.sidebarIcons[key];
            }
        });
    }
}

function updateNipCounter() {
    const nipCounter = document.getElementById('nipCounter');
    if (nipCounter && inputNip) {
        nipCounter.textContent = `${inputNip.value.length} / 18 Digit`;
    }
}

function saveSettings() {
    if (!inputNip) return;
    const nipVal = inputNip.value.trim();
    if (nipVal && nipVal.length !== 18) {
        document.getElementById('nipError').classList.remove('hidden');
        return;
    }
    document.getElementById('nipError').classList.add('hidden');
    userProfile.nama = document.getElementById('inputSettingNama').value.trim();
    userProfile.nip = nipVal;
    userProfile.jabatan = document.getElementById('inputSettingJabatan').value.trim();

    localStorage.setItem('satpolpp_inhu_trantibum_profile', JSON.stringify(userProfile));
    applyUserProfileUI();
    updatePreview();
    for (let i = 1; i <= 2; i++) updateCsPreview(i);
    settingsModal.classList.add('hidden');
}

function bindEvents() {
    const inputTanggal = document.getElementById('inputTanggal');
    if (inputTanggal) inputTanggal.addEventListener('input', updatePreview);
    
    const inputDasar = document.getElementById('inputDasar');
    if (inputDasar) inputDasar.addEventListener('input', updatePreview);
    
    const btnAddLokasi = document.getElementById('btnAddLokasi');
    if (btnAddLokasi) btnAddLokasi.addEventListener('click', () => addLokasiInput());
    
    const inputKegiatan = document.getElementById('inputKegiatan');
    if (inputKegiatan) inputKegiatan.addEventListener('input', updatePreview);
    
    const btnAddHasil = document.getElementById('btnAddHasil');
    if (btnAddHasil) btnAddHasil.addEventListener('click', () => addHasilInput());
    
    const btnAddAnggota = document.getElementById('btnAddAnggota');
    if (btnAddAnggota) btnAddAnggota.addEventListener('click', () => addAnggotaInput());

    const inputDokumentasi = document.getElementById('inputDokumentasi');
    if (inputDokumentasi) {
        inputDokumentasi.addEventListener('change', (e) => {
            const files = Array.from(e.target.files);
            if (uploadedPhotos.length + files.length > 10) { alert('Maksimal 10 foto dokumentasi!'); return; }
            files.forEach(file => {
                if (file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        if (uploadedPhotos.length < 10) { uploadedPhotos.push(ev.target.result); renderPhotoPreview(); }
                    };
                    reader.readAsDataURL(file);
                }
            });
            e.target.value = '';
        });
    }

    ['silahapp', '1', '2'].forEach(key => {
        const fileInp = document.getElementById(`inputSidebarLogo-${key}`);
        if (fileInp) {
            fileInp.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type.startsWith('image/')) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        userProfile.sidebarIcons[key] = ev.target.result;
                        const iconImg = document.getElementById(`sidebarIcon-${key}`);
                        if (iconImg) iconImg.src = ev.target.result;
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    });

    const tabFormBtn = document.getElementById('tabFormBtn');
    const tabPreviewBtn = document.getElementById('tabPreviewBtn');
    if (tabFormBtn && tabPreviewBtn) {
        tabFormBtn.addEventListener('click', () => {
            document.getElementById('formSection').classList.remove('hidden');
            document.getElementById('previewSection').classList.add('hidden');
            tabFormBtn.className = 'flex-1 py-2 text-center font-bold text-xs rounded-lg bg-amber-500 text-slate-950 shadow-md';
            tabPreviewBtn.className = 'flex-1 py-2 text-center font-semibold text-xs rounded-lg text-slate-300';
        });

        tabPreviewBtn.addEventListener('click', () => {
            document.getElementById('previewSection').classList.remove('hidden');
            document.getElementById('formSection').classList.add('hidden');
            tabPreviewBtn.className = 'flex-1 py-2 text-center font-bold text-xs rounded-lg bg-amber-500 text-slate-950 shadow-md';
            tabFormBtn.className = 'flex-1 py-2 text-center font-semibold text-xs rounded-lg text-slate-300';
        });
    }

    const btnDownloadPDF = document.getElementById('btnDownloadPDF');
    if (btnDownloadPDF) {
        btnDownloadPDF.addEventListener('click', () => {
            const element = document.getElementById('pdfContent');
            const filename = generatePdfFilename('SiLAHAPP', 'inputTanggal');
            html2pdf().set({ margin: [0,0,0,0], filename: filename, image: {type:'jpeg', quality:0.92}, html2canvas: {scale:1.5, useCORS:true}, jsPDF: {unit:'mm', format:'a4'} }).from(element).save();
        });
    }

    const btnUploadDrive = document.getElementById('btnUploadDrive');
    if (btnUploadDrive) {
        btnUploadDrive.addEventListener('click', () => {
            const filename = generatePdfFilename('SiLAHAPP', 'inputTanggal');
            document.getElementById('driveFilenameLabel').textContent = filename;
            const element = document.getElementById('pdfContent');
            html2pdf().set({ margin: [0,0,0,0], filename: filename, image: {type:'jpeg', quality:0.92}, html2canvas: {scale:1.5, useCORS:true}, jsPDF: {unit:'mm', format:'a4'} }).from(element).save();
            window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank');
            driveNoticeModal.classList.add('hidden'); // Diperbaiki dari classList.remove menjadi add agar tidak error state, atau sesuai kebutuhan modal
        });
    }

    if (inputNip) {
        inputNip.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
            updateNipCounter();
            if (e.target.value.length === 18) document.getElementById('nipError').classList.add('hidden');
        });
    }

    document.querySelectorAll('#btnSettings').forEach(btn => {
        btn.addEventListener('click', () => { applyUserProfileUI(); settingsModal.classList.remove('hidden'); });
    });

    const closeSettings = document.getElementById('btnCloseSettings');
    if (closeSettings) closeSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
    
    const cancelSettings = document.getElementById('btnCancelSettings');
    if (cancelSettings) cancelSettings.addEventListener('click', () => settingsModal.classList.add('hidden'));
    
    const saveSettingsBtn = document.getElementById('btnSaveSettings');
    if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);
    
    const closeDriveNotice = document.getElementById('btnCloseDriveNotice');
    if (closeDriveNotice) closeDriveNotice.addEventListener('click', () => driveNoticeModal.classList.add('hidden'));
}
