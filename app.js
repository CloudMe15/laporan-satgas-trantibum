// Direct Link PNG Google Drive Resmi
const DEFAULT_INHU_DRIVE_URL = 'https://lh3.googleusercontent.com/d/1CQz4gxA1VCO4hcR7AnlDXeD4FVM6JQMw';
const DEFAULT_SATPOL_PP_DRIVE_URL = 'https://lh3.googleusercontent.com/d/1sxdzLxjYv-T3N2D7EH1cIP1YvOKlMxdr';
const GOOGLE_DRIVE_FOLDER_URL = 'https://drive.google.com/drive/folders/1aPfFmrtTlEkUEMNsWn-fASHKXQYP6nxL?usp=drive_link';

let userProfile = {
    logoLeft: DEFAULT_INHU_DRIVE_URL,
    logoRight: DEFAULT_SATPOL_PP_DRIVE_URL,
    nama: 'Rahmat Santoso, S.STP',
    nip: '198506152008011002',
    jabatan: 'Komandan Regu Satgas Patroli Trantibum'
};

let uploadedPhotos = [];

let settingsModal, driveNoticeModal, lokasiListContainer, hasilListContainer, anggotaListContainer, inputNip;

document.addEventListener('DOMContentLoaded', () => {
    // FORCE CLEAR LOCALSTORAGE LAMA AGAR LOGO GOOGLE DRIVE LANGSUNG AKTIF
    const cacheVersion = localStorage.getItem('satpol_app_version');
    if (cacheVersion !== 'v3_clean_pdf') {
        localStorage.removeItem('satpolpp_inhu_trantibum_profile');
        localStorage.setItem('satpol_app_version', 'v3_clean_pdf');
    }

    settingsModal = document.getElementById('settingsModal');
    driveNoticeModal = document.getElementById('driveNoticeModal');
    lokasiListContainer = document.getElementById('lokasiList');
    hasilListContainer = document.getElementById('hasilList');
    anggotaListContainer = document.getElementById('anggotaList');
    inputNip = document.getElementById('inputSettingNip');

    lucide.createIcons();
    loadSettings();
    initDefaultDate();
    addLokasiInput();
    addHasilInput();
    addAnggotaInput();
    bindEvents();
    updatePreview();
});

function initDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('inputTanggal').value = today;
}

function generatePdfFilename() {
    const rawNama = userProfile.nama || 'Petugas';
    const cleanNama = rawNama.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\-]/g, '');
    const rawDate = document.getElementById('inputTanggal').value || new Date().toISOString().split('T')[0];
    
    return `Laporan_Satgas_Patroli_Trantibum_${cleanNama}_${rawDate}.pdf`;
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
    const items = lokasiListContainer.querySelectorAll('.class-lokasi-item');
    items.forEach((item, index) => {
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
    const items = hasilListContainer.querySelectorAll('.class-hasil-item');
    items.forEach((item, index) => {
        item.querySelector('.item-index').textContent = `${index + 1}.`;
    });
}

function addAnggotaInput(value = '') {
    const div = document.createElement('div');
    div.className = 'flex items-center gap-2 class-anggota-item';
    div.innerHTML = `
        <span class="text-xs font-bold text-slate-400 w-4 text-center anggota-index">1.</span>
        <input type="text" value="${value}" placeholder="Tuliskan nama lengkap anggota..." class="input-anggota flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 outline-none font-semibold">
        <button type="button" class="btn-remove-anggota text-slate-400 hover:text-red-600 p-1 rounded-lg transition">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
    `;
    anggotaListContainer.appendChild(div);
    lucide.createIcons();
    updateAnggotaIndexes();

    div.querySelector('.input-anggota').addEventListener('input', updatePreview);
    div.querySelector('.btn-remove-anggota').addEventListener('click', () => {
        if (anggotaListContainer.children.length > 1) {
            div.remove();
            updateAnggotaIndexes();
            updatePreview();
        }
    });
}

function updateAnggotaIndexes() {
    const items = anggotaListContainer.querySelectorAll('.class-anggota-item');
    items.forEach((item, index) => {
        item.querySelector('.anggota-index').textContent = `${index + 1}.`;
    });
}

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
    
    const cleanNip = userProfile.nip ? userProfile.nip.replace(/\D/g, '') : '';
    document.getElementById('viewNip').textContent = cleanNip.length === 18 ? `NIP. ${cleanNip}` : (cleanNip ? `NIP. ${cleanNip}` : '-');
    document.getElementById('viewJabatan').textContent = userProfile.jabatan || '-';

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
    const currentLen = inputNip.value.length;
    document.getElementById('nipCounter').textContent = `${currentLen} / 18 Digit`;
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
    settingsModal.classList.add('hidden');
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

function updatePreview() {
    const rawDate = document.getElementById('inputTanggal').value;
    document.getElementById('viewTanggal').textContent = formatIndonesianDate(rawDate);
    document.getElementById('viewTanggalTtd').textContent = `Rengat, ${formatIndonesianDateShort(rawDate)}`;

    const dasarVal = document.getElementById('inputDasar').value.trim();
    document.getElementById('viewDasar').textContent = dasarVal || '-';

    // 2. Multi-Lokasi
    const viewTempat = document.getElementById('viewTempat');
    viewTempat.innerHTML = '';
    const lokasiInputs = document.querySelectorAll('.input-lokasi');
    let lokasiCount = 0;

    lokasiInputs.forEach(input => {
        const val = input.value.trim();
        if (val) {
            lokasiCount++;
            viewTempat.appendChild(createPdfListItem(lokasiCount, val));
        }
    });

    if (lokasiCount === 0) {
        viewTempat.innerHTML = '<div class="text-slate-400 italic text-xs">Belum ada lokasi diisi.</div>';
    }

    // 3. Hasil Patroli
    const viewHasil = document.getElementById('viewHasil');
    viewHasil.innerHTML = '';
    const hasilInputs = document.querySelectorAll('.input-hasil');
    let hasilCount = 0;

    hasilInputs.forEach(input => {
        const val = input.value.trim();
        if (val) {
            hasilCount++;
            viewHasil.appendChild(createPdfListItem(hasilCount, val));
        }
    });

    if (hasilCount === 0) {
        viewHasil.innerHTML = '<div class="text-slate-400 italic text-xs">Belum ada hasil kegiatan diketik.</div>';
    }

    // 4. Uraian Kegiatan
    const kegiatanVal = document.getElementById('inputKegiatan').value.trim();
    document.getElementById('viewKegiatan').textContent = kegiatanVal || '-';

    // 5. Anggota Satgas
    const viewAnggota = document.getElementById('viewAnggota');
    viewAnggota.innerHTML = '';
    const anggotaInputs = document.querySelectorAll('.input-anggota');
    let anggotaCount = 0;

    anggotaInputs.forEach(input => {
        const val = input.value.trim();
        if (val) {
            anggotaCount++;
            viewAnggota.appendChild(createPdfListItem(anggotaCount, val));
        }
    });

    if (anggotaCount === 0) {
        viewAnggota.innerHTML = '<div class="text-slate-400 italic text-xs">Belum ada anggota ditambahkan.</div>';
    }

    renderPhotoPreview();
}

function renderPhotoPreview() {
    const container = document.getElementById('photoPreview');
    const viewContainer = document.getElementById('viewDokumentasi');
    const countLabel = document.getElementById('photoCount');
    
    container.innerHTML = '';
    viewContainer.innerHTML = '';
    countLabel.textContent = `${uploadedPhotos.length} / 4 Foto`;

    if (uploadedPhotos.length === 0) {
        viewContainer.innerHTML = '<div class="col-span-2 text-center text-slate-400 py-6 italic text-[11px]">Tidak ada foto dokumentasi.</div>';
        return;
    }

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
            <div class="photo-wrapper">
                <img src="${src}" alt="Dokumentasi ${idx + 1}">
            </div>
            <span class="text-[10px] text-slate-600 font-bold block mt-1.5">Dokumentasi ${idx + 1}</span>
        `;
        viewContainer.appendChild(pdfCard);
    });

    lucide.createIcons();
}

window.removePhoto = function(index) {
    uploadedPhotos.splice(index, 1);
    renderPhotoPreview();
};

function handlePhotoUpload(e) {
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
}

function handleSettingLogoLeft(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            userProfile.logoLeft = event.target.result;
            document.getElementById('settingLogoLeftPreview').src = userProfile.logoLeft;
        };
        reader.readAsDataURL(file);
    }
}

function handleSettingLogoRight(e) {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            userProfile.logoRight = event.target.result;
            document.getElementById('settingLogoRightPreview').src = userProfile.logoRight;
        };
        reader.readAsDataURL(file);
    }
}

/* Download PDF Presisi & Otomatis Membuang Halaman Kosong di Akhir */
function downloadPDF() {
    const element = document.getElementById('pdfContent');
    const filename = generatePdfFilename();
    
    const opt = {
        margin:       [0, 0, 0, 0],
        filename:     filename,
        image:        { type: 'png', quality: 1.0 },
        html2canvas:  { 
            scale: 2, 
            useCORS: true, 
            logging: false,
            scrollY: 0,
            scrollX: 0,
            windowHeight: element.offsetHeight
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true },
        pagebreak:    { 
            mode: ['css', 'legacy'],
            avoid: ['.preview-block', '.photo-wrapper', '.signature-block', '.pdf-box']
        }
    };

    return html2pdf().set(opt).from(element).toPdf().get('pdf').then(function(pdf) {
        const totalPages = pdf.internal.getNumberOfPages();
        // Jika total halaman melebihi kebutuhan riil, hapus lembar kosong paling akhir
        if (totalPages > 1) {
            pdf.deletePage(totalPages);
        }
    }).save();
}

function uploadToGoogleDrive() {
    const filename = generatePdfFilename();
    document.getElementById('driveFilenameLabel').textContent = filename;

    downloadPDF();
    window.open(GOOGLE_DRIVE_FOLDER_URL, '_blank');
    driveNoticeModal.classList.remove('hidden');
}

function bindEvents() {
    document.getElementById('inputTanggal').addEventListener('input', updatePreview);
    document.getElementById('inputDasar').addEventListener('input', updatePreview);
    document.getElementById('btnAddLokasi').addEventListener('click', () => addLokasiInput());
    document.getElementById('inputKegiatan').addEventListener('input', updatePreview);
    document.getElementById('btnAddHasil').addEventListener('click', () => addHasilInput());
    document.getElementById('btnAddAnggota').addEventListener('click', () => addAnggotaInput());
    document.getElementById('inputDokumentasi').addEventListener('change', handlePhotoUpload);

    inputNip.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
        updateNipCounter();
        if (e.target.value.length === 18) {
            document.getElementById('nipError').classList.add('hidden');
        }
    });

    document.getElementById('btnSettings').addEventListener('click', () => {
        applyUserProfileUI();
        settingsModal.classList.remove('hidden');
    });
    document.getElementById('btnCloseSettings').addEventListener('click', () => settingsModal.classList.add('hidden'));
    document.getElementById('btnCancelSettings').addEventListener('click', () => settingsModal.classList.add('hidden'));
    document.getElementById('btnSaveSettings').addEventListener('click', saveSettings);
    
    document.getElementById('inputSettingLogoLeft').addEventListener('change', handleSettingLogoLeft);
    document.getElementById('inputSettingLogoRight').addEventListener('change', handleSettingLogoRight);
    
    document.getElementById('btnResetLogoLeft').addEventListener('click', () => {
        userProfile.logoLeft = DEFAULT_INHU_DRIVE_URL;
        document.getElementById('inputSettingLogoLeft').value = '';
        document.getElementById('settingLogoLeftPreview').src = DEFAULT_INHU_DRIVE_URL;
        localStorage.setItem('satpolpp_inhu_trantibum_profile', JSON.stringify(userProfile));
        applyUserProfileUI();
    });

    document.getElementById('btnResetLogoRight').addEventListener('click', () => {
        userProfile.logoRight = DEFAULT_SATPOL_PP_DRIVE_URL;
        document.getElementById('inputSettingLogoRight').value = '';
        document.getElementById('settingLogoRightPreview').src = DEFAULT_SATPOL_PP_DRIVE_URL;
        localStorage.setItem('satpolpp_inhu_trantibum_profile', JSON.stringify(userProfile));
        applyUserProfileUI();
    });

    document.getElementById('btnResetBothLogos').addEventListener('click', () => {
        userProfile.logoLeft = DEFAULT_INHU_DRIVE_URL;
        userProfile.logoRight = DEFAULT_SATPOL_PP_DRIVE_URL;
        document.getElementById('inputSettingLogoLeft').value = '';
        document.getElementById('inputSettingLogoRight').value = '';
        document.getElementById('settingLogoLeftPreview').src = DEFAULT_INHU_DRIVE_URL;
        document.getElementById('settingLogoRightPreview').src = DEFAULT_SATPOL_PP_DRIVE_URL;
        localStorage.setItem('satpolpp_inhu_trantibum_profile', JSON.stringify(userProfile));
        applyUserProfileUI();
    });

    document.getElementById('btnCloseDriveNotice').addEventListener('click', () => {
        driveNoticeModal.classList.add('hidden');
    });

    document.getElementById('btnDownloadPDF').addEventListener('click', downloadPDF);
    document.getElementById('btnUploadDrive').addEventListener('click', uploadToGoogleDrive);

    const tabFormBtn = document.getElementById('tabFormBtn');
    const tabPreviewBtn = document.getElementById('tabPreviewBtn');
    const formSection = document.getElementById('formSection');
    const previewSection = document.getElementById('previewSection');

    tabFormBtn.addEventListener('click', () => {
        formSection.classList.remove('hidden');
        previewSection.classList.add('hidden');
        tabFormBtn.className = 'flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-xl bg-amber-500 text-slate-950 shadow-md transition';
        tabPreviewBtn.className = 'flex-1 py-2.5 text-center font-semibold text-xs sm:text-sm rounded-xl text-slate-300 transition';
    });

    tabPreviewBtn.addEventListener('click', () => {
        previewSection.classList.remove('hidden');
        formSection.classList.add('hidden');
        tabPreviewBtn.className = 'flex-1 py-2.5 text-center font-bold text-xs sm:text-sm rounded-xl bg-amber-500 text-slate-950 shadow-md transition';
        tabFormBtn.className = 'flex-1 py-2.5 text-center font-semibold text-xs sm:text-sm rounded-xl text-slate-300 transition';
    });
}
