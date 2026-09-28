const DEFAULT_INHU_DRIVE_URL = 'https://lh3.googleusercontent.com/d/1U-Whswnt_2pOQipuTZ0hHag42p6EhZgb';
const DEFAULT_SATPOL_PP_DRIVE_URL = 'https://lh3.googleusercontent.com/d/1sxdzLxjYv-T3N2D7EH1cIP1YvOKlMxdr';
const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1aPfFmrtTlEkUEMNsWn-fASHKXQYP6nxL?usp=drive_link';
const COMING_SOON_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1xnLVXT41K96_dHipGjCDDQKF-SkDHbyf?usp=sharing';

let userProfile = {
    logoLeft: DEFAULT_INHU_DRIVE_URL,
    logoRight: DEFAULT_SATPOL_PP_DRIVE_URL,
    nama: 'Fajar Ari Prakoso',
    nip: '199507102025211095',
    jabatan: 'Staff Program dan Keuangan'
};

let uploadedPhotos = [];
let anggotaPhotos = [];
let csUploadedPhotos = [];
let csAnggotaPhotos = [];

let settingsModal, driveNoticeModal, lokasiListContainer, hasilListContainer, inputNip;
let csLokasiListContainer, csHasilListContainer;

document.addEventListener('DOMContentLoaded', () => {
    const cacheVersion = localStorage.getItem('satpol_app_version');
    if (cacheVersion !== 'v13_latest_inhu_logo') {
        localStorage.removeItem('satpolpp_inhu_trantibum_profile');
        localStorage.setItem('satpol_app_version', 'v13_latest_inhu_logo');
    }

    settingsModal = document.getElementById('settingsModal');
    driveNoticeModal = document.getElementById('driveNoticeModal');
    
    lokasiListContainer = document.getElementById('lokasiList');
    hasilListContainer = document.getElementById('hasilList');
    
    csLokasiListContainer = document.getElementById('csLokasiList');
    csHasilListContainer = document.getElementById('csHasilList');

    inputNip = document.getElementById('inputSettingNip');

    lucide.createIcons();
    loadSettings();
    initDefaultDate();
    
    addLokasiInput();
    addHasilInput();

    addCsLokasiInput();
    addCsHasilInput();
    
    bindEvents();
    updatePreview();
    updateCsPreview();
    initSidebarNavigation();
});

function initSidebarNavigation() {
    const sidebarBtns = document.querySelectorAll('.sidebar-btn');
    const appViews = document.querySelectorAll('.app-view');

    sidebarBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.getAttribute('data-target');
            
            sidebarBtns.forEach(b => b.classList.remove('active'));
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

function initDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inputTanggal').value = today;
    document.getElementById('csInputTanggal').value = today;
}

function generatePdfFilename(prefix = 'Laporan_Satgas_Patroli_Trantibum') {
    const rawNama = userProfile.nama || 'Petugas';
    const cleanNama = rawNama.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    const rawDate = document.getElementById('inputTanggal').value || new Date().toISOString().split('T')[0];
    return `${prefix}_${cleanNama}_${rawDate}.pdf`;
}

function formatIndonesianDate(dateStr) {
    if (!dateStr) return '-';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', options);
}

function formatIndonesianDateShort(dateStr) {
    if (!dateStr) return '-';
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', options);
}

function createPdfListItem(index, text) {
    const row = document.createElement('div');
    row.className = 'pdf-list-item';
    
    const numSpan = document.createElement('span');
    numSpan.className = 'pdf-list-num';
    numSpan.textContent = `${index}.`;

    const textSpan = document.createElement('span');
    textSpan.className = 'pdf-list-text';
    textSpan.textContent = text;

    row.appendChild(numSpan);
    row.appendChild(textSpan);
    return row;
}

// --- SILAHAPP FUNCTIONS ---
function addLokasiInput(value = '') {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 class-lokasi-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center lokasi-index">1.</span>
        <input type="text" value="${value}" placeholder="Tempat / Lokasi Patroli..." class="input-lokasi flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none font-semibold">
        <button type="button" class="btn-remove-lokasi text-slate-400 hover:text-red-600 p-1 rounded-lg transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;
    lokasiListContainer.appendChild(div);
    lucide.createIcons();
    updateLokasiIndexes();
    div.querySelector('.input-lokasi').addEventListener('input', updatePreview);
    div.querySelector('.btn-remove-lokasi').addEventListener('click', () => {
        if (lokasiListContainer.children.length > 1) {
            div.remove();
            updateLokasiIndexes();
            updatePreview();
        }
    });
}
function updateLokasiIndexes() {
    lokasiListContainer.querySelectorAll('.class-lokasi-item').forEach((item, index) => {
        item.querySelector('.lokasi-index').textContent = `${index + 1}.`;
    });
}

function addHasilInput(value = '') {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 class-hasil-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center item-index">1.</span>
        <input type="text" value="${value}" placeholder="Tuliskan poin hasil patroli..." class="input-hasil flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 outline-none font-semibold">
        <button type="button" class="btn-remove-hasil text-slate-400 hover:text-red-600 p-1 rounded-lg transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;
    hasilListContainer.appendChild(div);
    lucide.createIcons();
    updateHasilIndexes();
    div.querySelector('.input-hasil').addEventListener('input', updatePreview);
    div.querySelector('.btn-remove-hasil').addEventListener('click', () => {
        if (hasilListContainer.children.length > 1) {
            div.remove();
            updateHasilIndexes();
            updatePreview();
        }
    });
}
function updateHasilIndexes() {
    hasilListContainer.querySelectorAll('.class-hasil-item').forEach((item, index) => {
        item.querySelector('.item-index').textContent = `${index + 1}.`;
    });
}

function updatePreview() {
    const rawDate = document.getElementById('inputTanggal').value;
    document.getElementById('viewTanggal').textContent = formatIndonesianDate(rawDate);
    document.getElementById('viewTanggalTtd').textContent = `Rengat, ${formatIndonesianDateShort(rawDate)}`;

    const blockDasar = document.getElementById('blockDasar');
    const dasarVal = document.getElementById('inputDasar').value.trim();
    blockDasar.style.display = dasarVal ? 'block' : 'none';
    document.getElementById('viewDasar').textContent = dasarVal;

    const blockLokasi = document.getElementById('blockLokasi');
    const viewTempat = document.getElementById('viewTempat');
    viewTempat.innerHTML = '';
    let lokasiCount = 0;
    document.querySelectorAll('.input-lokasi').forEach(input => {
        const val = input.value.trim();
        if (val) {
            lokasiCount++;
            viewTempat.appendChild(createPdfListItem(lokasiCount, val));
        }
    });
    blockLokasi.style.display = lokasiCount > 0 ? 'block' : 'none';

    const blockHasil = document.getElementById('blockHasil');
    const viewHasil = document.getElementById('viewHasil');
    viewHasil.innerHTML = '';
    let hasilCount = 0;
    document.querySelectorAll('.input-hasil').forEach(input => {
        const val = input.value.trim();
        if (val) {
            hasilCount++;
            viewHasil.appendChild(createPdfListItem(hasilCount, val));
        }
    });
    blockHasil.style.display = hasilCount > 0 ? 'block' : 'none';

    const blockKegiatan = document.getElementById('blockKegiatan');
    const kegiatanVal = document.getElementById('inputKegiatan').value.trim();
    blockKegiatan.style.display = kegiatanVal ? 'block' : 'none';
    document.getElementById('viewKegiatan').textContent = kegiatanVal;

    renderAnggotaPhotoPreview();
    renderPhotoPreview();
}

function renderAnggotaPhotoPreview() {
    const container = document.getElementById('anggotaPhotoPreview');
    const viewContainer = document.getElementById('viewAnggota');
    const countLabel = document.getElementById('anggotaPhotoCount');
    const blockAnggota = document.getElementById('blockAnggota');
    
    container.innerHTML = '';
    viewContainer.innerHTML = '';
    countLabel.textContent = `${anggotaPhotos.length} / 4 Foto`;
    blockAnggota.style.display = anggotaPhotos.length === 0 ? 'none' : 'block';

    anggotaPhotos.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'relative aspect-square border border-slate-300 rounded-xl overflow-hidden group shadow-sm bg-white';
        thumb.innerHTML = `
            <img src="${src}" class="w-full h-full object-cover">
            <button type="button" onclick="removeAnggotaPhoto(${idx})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow-md">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        `;
        container.appendChild(thumb);

        const pdfCard = document.createElement('div');
        pdfCard.className = 'border border-slate-200 rounded-xl p-2 bg-white text-center shadow-sm photo-wrapper';
        pdfCard.innerHTML = `
            <div class="photo-wrapper"><img src="${src}" alt="Anggota ${idx + 1}"></div>
            <span class="text-[10px] text-slate-600 font-bold block mt-1.5">Anggota Satgas ${idx + 1}</span>
        `;
        viewContainer.appendChild(pdfCard);
    });
    lucide.createIcons();
}

window.removeAnggotaPhoto = function(index) {
    anggotaPhotos.splice(index, 1);
    renderAnggotaPhotoPreview();
}

function renderPhotoPreview() {
    const container = document.getElementById('photoPreview');
    const viewContainer = document.getElementById('viewDokumentasi');
    const countLabel = document.getElementById('photoCount');
    const blockDokumentasi = document.getElementById('blockDokumentasi');
    
    container.innerHTML = '';
    viewContainer.innerHTML = '';
    countLabel.textContent = `${uploadedPhotos.length} / 4 Foto`;
    blockDokumentasi.style.display = uploadedPhotos.length === 0 ? 'none' : 'block';

    uploadedPhotos.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'relative aspect-square border border-slate-300 rounded-xl overflow-hidden group shadow-sm bg-white';
        thumb.innerHTML = `
            <img src="${src}" class="w-full h-full object-cover">
            <button type="button" onclick="removePhoto(${idx})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow-md">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        `;
        container.appendChild(thumb);

        const pdfCard = document.createElement('div');
        pdfCard.className = 'border border-slate-200 rounded-xl p-2 bg-white text-center shadow-sm photo-wrapper';
        pdfCard.innerHTML = `
            <div class="photo-wrapper"><img src="${src}" alt="Dokumentasi ${idx + 1}"></div>
            <span class="text-[10px] text-slate-600 font-bold block mt-1.5">Dokumentasi ${idx + 1}</span>
        `;
        viewContainer.appendChild(pdfCard);
    });
    lucide.createIcons();
}

window.removePhoto = function(index) {
    uploadedPhotos.splice(index, 1);
    renderPhotoPreview();
}


// --- COMING SOON FUNCTIONS ---
function addCsLokasiInput(value = '') {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 cs-lokasi-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center cs-lokasi-index">1.</span>
        <input type="text" value="${value}" placeholder="Tempat / Lokasi Patroli CS..." class="cs-input-lokasi flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-semibold">
        <button type="button" class="cs-btn-remove-lokasi text-slate-400 hover:text-red-600 p-1 rounded-lg transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;
    csLokasiListContainer.appendChild(div);
    lucide.createIcons();
    updateCsLokasiIndexes();
    div.querySelector('.cs-input-lokasi').addEventListener('input', updateCsPreview);
    div.querySelector('.cs-btn-remove-lokasi').addEventListener('click', () => {
        if (csLokasiListContainer.children.length > 1) {
            div.remove();
            updateCsLokasiIndexes();
            updateCsPreview();
        }
    });
}
function updateCsLokasiIndexes() {
    csLokasiListContainer.querySelectorAll('.cs-lokasi-item').forEach((item, index) => {
        item.querySelector('.cs-lokasi-index').textContent = `${index + 1}.`;
    });
}

function addCsHasilInput(value = '') {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 cs-hasil-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center cs-item-index">1.</span>
        <input type="text" value="${value}" placeholder="Tuliskan poin hasil..." class="cs-input-hasil flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-semibold">
        <button type="button" class="cs-btn-remove-hasil text-slate-400 hover:text-red-600 p-1 rounded-lg transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;
    csHasilListContainer.appendChild(div);
    lucide.createIcons();
    updateCsHasilIndexes();
    div.querySelector('.cs-input-hasil').addEventListener('input', updateCsPreview);
    div.querySelector('.cs-btn-remove-hasil').addEventListener('click', () => {
        if (csHasilListContainer.children.length > 1) {
            div.remove();
            updateCsHasilIndexes();
            updateCsPreview();
        }
    });
}
function updateCsHasilIndexes() {
    csHasilListContainer.querySelectorAll('.cs-hasil-item').forEach((item, index) => {
        item.querySelector('.cs-item-index').textContent = `${index + 1}.`;
    });
}

function updateCsPreview() {
    const rawDate = document.getElementById('csInputTanggal').value;
    document.getElementById('csViewTanggal').textContent = formatIndonesianDate(rawDate);
    document.getElementById('csViewTanggalTtd').textContent = `Rengat, ${formatIndonesianDateShort(rawDate)}`;

    const blockDasar = document.getElementById('csBlockDasar');
    const dasarVal = document.getElementById('csInputDasar').value.trim();
    blockDasar.style.display = dasarVal ? 'block' : 'none';
    document.getElementById('csViewDasar').textContent = dasarVal;

    const blockLokasi = document.getElementById('csBlockLokasi');
    const viewTempat = document.getElementById('csViewTempat');
    viewTempat.innerHTML = '';
    let lokasiCount = 0;
    document.querySelectorAll('.cs-input-lokasi').forEach(input => {
        const val = input.value.trim();
        if (val) {
            lokasiCount++;
            viewTempat.appendChild(createPdfListItem(lokasiCount, val));
        }
    });
    blockLokasi.style.display = lokasiCount > 0 ? 'block' : 'none';

    const blockHasil = document.getElementById('csBlockHasil');
    const viewHasil = document.getElementById('csViewHasil');
    viewHasil.innerHTML = '';
    let hasilCount = 0;
    document.querySelectorAll('.cs-input-hasil').forEach(input => {
        const val = input.value.trim();
        if (val) {
            hasilCount++;
            viewHasil.appendChild(createPdfListItem(hasilCount, val));
        }
    });
    blockHasil.style.display = hasilCount > 0 ? 'block' : 'none';

    const blockKegiatan = document.getElementById('csBlockKegiatan');
    const kegiatanVal = document.getElementById('csInputKegiatan').value.trim();
    blockKegiatan.style.display = kegiatanVal ? 'block' : 'none';
    document.getElementById('csViewKegiatan').textContent = kegiatanVal;

    renderCsAnggotaPhotoPreview();
    renderCsPhotoPreview();
}

function renderCsAnggotaPhotoPreview() {
    const container = document.getElementById('csAnggotaPhotoPreview');
    const viewContainer = document.getElementById('csViewAnggota');
    const countLabel = document.getElementById('csAnggotaPhotoCount');
    const blockAnggota = document.getElementById('csBlockAnggota');
    
    container.innerHTML = '';
    viewContainer.innerHTML = '';
    countLabel.textContent = `${csAnggotaPhotos.length} / 4 Foto`;
    blockAnggota.style.display = csAnggotaPhotos.length === 0 ? 'none' : 'block';

    csAnggotaPhotos.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'relative aspect-square border border-slate-300 rounded-xl overflow-hidden group shadow-sm bg-white';
        thumb.innerHTML = `
            <img src="${src}" class="w-full h-full object-cover">
            <button type="button" onclick="removeCsAnggotaPhoto(${idx})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow-md">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        `;
        container.appendChild(thumb);

        const pdfCard = document.createElement('div');
        pdfCard.className = 'border border-slate-200 rounded-xl p-2 bg-white text-center shadow-sm photo-wrapper';
        pdfCard.innerHTML = `
            <div class="photo-wrapper"><img src="${src}" alt="Anggota CS ${idx + 1}"></div>
            <span class="text-[10px] text-slate-600 font-bold block mt-1.5">Anggota Satgas ${idx + 1}</span>
        `;
        viewContainer.appendChild(pdfCard);
    });
    lucide.createIcons();
}

window.removeCsAnggotaPhoto = function(index) {
    csAnggotaPhotos.splice(index, 1);
    renderCsAnggotaPhotoPreview();
}

function renderCsPhotoPreview() {
    const container = document.getElementById('csPhotoPreview');
    const viewContainer = document.getElementById('csViewDokumentasi');
    const countLabel = document.getElementById('csPhotoCount');
    const blockDokumentasi = document.getElementById('csBlockDokumentasi');
    
    container.innerHTML = '';
    viewContainer.innerHTML = '';
    countLabel.textContent = `${csUploadedPhotos.length} / 4 Foto`;
    blockDokumentasi.style.display = csUploadedPhotos.length === 0 ? 'none' : 'block';

    csUploadedPhotos.forEach((src, idx) => {
        const thumb = document.createElement('div');
        thumb.className = 'relative aspect-square border border-slate-300 rounded-xl overflow-hidden group shadow-sm bg-white';
        thumb.innerHTML = `
            <img src="${src}" class="w-full h-full object-cover">
            <button type="button" onclick="removeCsPhoto(${idx})" class="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-90 hover:opacity-100 shadow-md">
                <i data-lucide="x" class="w-3 h-3"></i>
            </button>
        `;
        container.appendChild(thumb);

        const pdfCard = document.createElement('div');
        pdfCard.className = 'border border-slate-200 rounded-xl p-2 bg-white text-center shadow-sm photo-wrapper';
        pdfCard.innerHTML = `
            <div class="photo-wrapper"><img src="${src}" alt="Dokumentasi CS ${idx + 1}"></div>
            <span class="text-[10px] text-slate-600 font-bold block mt-1.5">Dokumentasi ${idx + 1}</span>
        `;
        viewContainer.appendChild(pdfCard);
    });
    lucide.createIcons();
}

window.removeCsPhoto = function(index) {
    csUploadedPhotos.splice(index, 1);
    renderCsPhotoPreview();
}


// --- SETTINGS & PROFILES ---
function loadSettings() {
    const saved = localStorage.getItem('satpolpp_inhu_trantibum_profile');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            userProfile = { ...userProfile, ...parsed };
        } catch(e) {}
    }
    userProfile.logoLeft = DEFAULT_INHU_DRIVE_URL;
    userProfile.logoRight = DEFAULT_SATPOL_PP_DRIVE_URL;
    applyUserProfileUI();
}

function applyUserProfileUI() {
    document.getElementById('viewNama').textContent = userProfile.nama || '-';
    document.getElementById('csViewNama').textContent = userProfile.nama || '-';
    
    const cleanNip = userProfile.nip ? userProfile.nip.replace(/\D/g, '') : '';
    const formattedNip = cleanNip.length === 18 ? `NIP. ${cleanNip}` : (cleanNip ? `NIP. ${cleanNip}` : '-');
    document.getElementById('viewNip').textContent = formattedNip;
    document.getElementById('csViewNip').textContent = formattedNip;

    document.getElementById('viewJabatan').textContent = userProfile.jabatan || '-';
    document.getElementById('csViewJabatan').textContent = userProfile.jabatan || '-';

    document.getElementById('headerLogoLeft').src = DEFAULT_INHU_DRIVE_URL;
    document.getElementById('headerLogoRight').src = DEFAULT_SATPOL_PP_DRIVE_URL;
    document.getElementById('previewLogoLeft').src = DEFAULT_INHU_DRIVE_URL;
    document.getElementById('previewLogoRight').src = DEFAULT_SATPOL_PP_DRIVE_URL;
    document.getElementById('settingLogoLeftPreview').src = DEFAULT_INHU_DRIVE_URL;
    document.getElementById('settingLogoRightPreview').src = DEFAULT_SATPOL_PP_DRIVE_URL;

    document.getElementById('inputSettingNama').value = userProfile.nama || '';
    inputNip.value = cleanNip;
    document.getElementById('inputSettingJabatan').value = userProfile.jabatan || '';
    
    updateNipCounter();
}

function updateNipCounter() {
    document.getElementById('nipCounter').textContent = `${inputNip.value.length} / 18 Digit`;
}

function saveSettings() {
    const nipVal = inputNip.value.trim();
    if (nipVal && nipVal.length !== 18) {
        document.getElementById('nipError').classList.remove('hidden');
        return;
    } else {
        document.getElementById('nipError').classList.add('hidden');
    }

    userProfile.nama = document.getElementById('inputSettingNama').value.trim();
    userProfile.nip = nipVal;
    userProfile.jabatan = document.getElementById('inputSettingJabatan').value.trim();

    localStorage.setItem('satpolpp_inhu_trantibum_profile', JSON.stringify(userProfile));
    applyUserProfileUI();
    updatePreview();
    updateCsPreview();
    settingsModal.classList.add('hidden');
}


// --- EVENT BINDINGS & EXPORT ---
function bindEvents() {
    // SiLAHAPP Events
    document.getElementById('inputTanggal').addEventListener('input', updatePreview);
    document.getElementById('inputDasar').addEventListener('input', updatePreview);
    document.getElementById('btnAddLokasi').addEventListener('click', () => addLokasiInput());
    document.getElementById('inputKegiatan').addEventListener('input', updatePreview);
    document.getElementById('btnAddHasil').addEventListener('click', () => addHasilInput());
    
    document.getElementById('inputAnggotaFoto').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (anggotaPhotos.length + files.length > 4) {
            alert('Maksimal foto anggota adalah 4 foto!');
            return;
        }
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (anggotaPhotos.length < 4) {
                        anggotaPhotos.push(event.target.result);
                        renderAnggotaPhotoPreview();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        e.target.value = '';
    });

    document.getElementById('inputDokumentasi').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (uploadedPhotos.length + files.length > 4) {
            alert('Maksimal foto dokumentasi adalah 4 foto!');
            return;
        }
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (uploadedPhotos.length < 4) {
                        uploadedPhotos.push(event.target.result);
                        renderPhotoPreview();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        e.target.value = '';
    });

    document.getElementById('tabFormBtn').addEventListener('click', () => {
        document.getElementById('formSection').classList.remove('hidden');
        document.getElementById('previewSection').classList.add('hidden');
        document.getElementById('tabFormBtn').className = 'flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-xl bg-amber-500 text-slate-950 shadow-md transition';
        document.getElementById('tabPreviewBtn').className = 'flex-1 py-2.5 text-center font-semibold text-xs sm:text-sm rounded-xl text-slate-300 transition';
    });

    document.getElementById('tabPreviewBtn').addEventListener('click', () => {
        document.getElementById('previewSection').classList.remove('hidden');
        document.getElementById('formSection').classList.add('hidden');
        document.getElementById('tabPreviewBtn').className = 'flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-xl bg-amber-500 text-slate-950 shadow-md transition';
        document.getElementById('tabFormBtn').className = 'flex-1 py-2.5 text-center font-semibold text-xs sm:text-sm rounded-xl text-slate-300 transition';
    });

    document.getElementById('btnDownloadPDF').addEventListener('click', () => {
        const element = document.getElementById('pdfContent');
        const opt = {
            margin: [0, 0, 0, 0],
            filename: generatePdfFilename('Laporan_SiLAHAPP'),
            image: { type: 'jpeg', quality: 0.92 },
            html2canvas: { scale: 1.5, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });

    document.getElementById('btnUploadDrive').addEventListener('click', () => {
        const filename = generatePdfFilename('Laporan_SiLAHAPP');
        document.getElementById('driveFilenameLabel').textContent = filename;
        
        const element = document.getElementById('pdfContent');
        const opt = {
            margin: [0, 0, 0, 0],
            filename: filename,
            image: { type: 'jpeg', quality: 0.92 },
            html2canvas: { scale: 1.5, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();

        window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank');
        driveNoticeModal.classList.remove('hidden');
    });


    // Coming Soon Events
    document.getElementById('csInputTanggal').addEventListener('input', updateCsPreview);
    document.getElementById('csInputDasar').addEventListener('input', updateCsPreview);
    document.getElementById('csBtnAddLokasi').addEventListener('click', () => addCsLokasiInput());
    document.getElementById('csInputKegiatan').addEventListener('input', updateCsPreview);
    document.getElementById('csBtnAddHasil').addEventListener('click', () => addCsHasilInput());

    document.getElementById('csInputAnggotaFoto').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (csAnggotaPhotos.length + files.length > 4) {
            alert('Maksimal foto anggota adalah 4 foto!');
            return;
        }
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (csAnggotaPhotos.length < 4) {
                        csAnggotaPhotos.push(event.target.result);
                        renderCsAnggotaPhotoPreview();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        e.target.value = '';
    });

    document.getElementById('csInputDokumentasi').addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (csUploadedPhotos.length + files.length > 4) {
            alert('Maksimal foto dokumentasi adalah 4 foto!');
            return;
        }
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (csUploadedPhotos.length < 4) {
                        csUploadedPhotos.push(event.target.result);
                        renderCsPhotoPreview();
                    }
                };
                reader.readAsDataURL(file);
            }
        });
        e.target.value = '';
    });

    document.getElementById('csTabFormBtn').addEventListener('click', () => {
        document.getElementById('csFormSection').classList.remove('hidden');
        document.getElementById('csPreviewSection').classList.add('hidden');
        document.getElementById('csTabFormBtn').className = 'flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-xl bg-indigo-500 text-white shadow-md transition';
        document.getElementById('csTabPreviewBtn').className = 'flex-1 py-2.5 text-center font-semibold text-xs sm:text-sm rounded-xl text-slate-300 transition';
    });

    document.getElementById('csTabPreviewBtn').addEventListener('click', () => {
        document.getElementById('csPreviewSection').classList.remove('hidden');
        document.getElementById('csFormSection').classList.add('hidden');
        document.getElementById('csTabPreviewBtn').className = 'flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-xl bg-indigo-500 text-white shadow-md transition';
        document.getElementById('csTabFormBtn').className = 'flex-1 py-2.5 text-center font-semibold text-xs sm:text-sm rounded-xl text-slate-300 transition';
    });

    document.getElementById('csBtnDownloadPDF').addEventListener('click', () => {
        const element = document.getElementById('csPdfContent');
        const opt = {
            margin: [0, 0, 0, 0],
            filename: generatePdfFilename('Laporan_ComingSoon'),
            image: { type: 'jpeg', quality: 0.92 },
            html2canvas: { scale: 1.5, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();
    });

    document.getElementById('csBtnUploadDrive').addEventListener('click', () => {
        const filename = generatePdfFilename('Laporan_ComingSoon');
        document.getElementById('driveFilenameLabel').textContent = filename;
        
        const element = document.getElementById('csPdfContent');
        const opt = {
            margin: [0, 0, 0, 0],
            filename: filename,
            image: { type: 'jpeg', quality: 0.92 },
            html2canvas: { scale: 1.5, useCORS: true, logging: false },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().set(opt).from(element).save();

        window.open(COMING_SOON_DRIVE_FOLDER_URL, '_blank');
        driveNoticeModal.classList.remove('hidden');
    });


    // Global Settings & Modal Events
    inputNip.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        updateNipCounter();
        if (e.target.value.length === 18) {
            document.getElementById('nipError').classList.add('hidden');
        }
    });

    document.querySelectorAll('#btnSettings').forEach(btn => {
        btn.addEventListener('click', () => {
            applyUserProfileUI();
            settingsModal.classList.remove('hidden');
        });
    });

    document.getElementById('btnCloseSettings').addEventListener('click', () => settingsModal.classList.add('hidden'));
    document.getElementById('btnCancelSettings').addEventListener('click', () => settingsModal.classList.add('hidden'));
    document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);

    document.getElementById('btnResetLogoLeft').addEventListener('click', () => {
        userProfile.logoLeft = DEFAULT_INHU_DRIVE_URL;
        document.getElementById('inputSettingLogoLeft').value = '';
        document.getElementById('settingLogoLeftPreview').src = DEFAULT_INHU_DRIVE_URL;
    });

    document.getElementById('btnResetLogoRight').addEventListener('click', () => {
        userProfile.logoRight = DEFAULT_SATPOL_PP_DRIVE_URL;
        document.getElementById('inputSettingLogoRight').value = '';
        document.getElementById('settingLogoRightPreview').src = DEFAULT_SATPOL_PP_DRIVE_URL;
    });

    document.getElementById('btnResetBothLogos').addEventListener('click', () => {
        userProfile.logoLeft = DEFAULT_INHU_DRIVE_URL;
        userProfile.logoRight = DEFAULT_SATPOL_PP_DRIVE_URL;
        document.getElementById('inputSettingLogoLeft').value = '';
        document.getElementById('inputSettingLogoRight').value = '';
        document.getElementById('settingLogoLeftPreview').src = DEFAULT_INHU_DRIVE_URL;
        document.getElementById('settingLogoRightPreview').src = DEFAULT_SATPOL_PP_DRIVE_URL;
    });

    document.getElementById('btnCloseDriveNotice').addEventListener('click', () => {
        driveNoticeModal.classList.add('hidden');
    });
}
