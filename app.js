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
