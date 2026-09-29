document.addEventListener('DOMContentLoaded', () => {
    const reportForm = document.getElementById('reportForm');
    const tanggalInput = document.getElementById('tanggal');
    const exportPdfBtn = document.getElementById('exportPdf');
    const reportTableBody = document.getElementById('reportTableBody');
    const searchFilter = document.getElementById('searchFilter');

    // 1. Set otomatis tanggal hari ini pada input form
    if (tanggalInput) {
        tanggalInput.value = new Date().toISOString().split('T')[0];
    }

    // Muat data laporan dari LocalStorage saat halaman dibuka
    loadReports();

    // 2. Event Listener saat form disubmit
    reportForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const newReport = {
            id: Date.now(),
            tanggal: document.getElementById('tanggal').value,
            regu: document.getElementById('regu').value.trim(),
            lokasi: document.getElementById('lokasi').value.trim(),
            uraian: document.getElementById('uraian').value.trim()
        };

        // Ambil data lama atau buat array kosong
        let reports = JSON.parse(localStorage.getItem('satgas_reports')) || [];
        reports.unshift(newReport); // Masukkan ke urutan paling atas

        // Simpan kembali ke localStorage
        localStorage.setItem('satgas_reports', JSON.stringify(reports));

        // Reset form & perbarui tampilan tabel
        reportForm.reset();
        tanggalInput.value = new Date().toISOString().split('T')[0];
        loadReports();

        alert('Laporan berhasil disimpan ke sistem lokal!');
    });

    // 3. Fungsi memuat dan menampilkan data ke tabel
    function loadReports(filterText = '') {
        let reports = JSON.parse(localStorage.getItem('satgas_reports')) || [];
        reportTableBody.innerHTML = '';

        // Filter pencarian jika ada kata kunci
        if (filterText) {
            reports = reports.filter(r => 
                r.lokasi.toLowerCase().includes(filterText.toLowerCase()) ||
                r.regu.toLowerCase().includes(filterText.toLowerCase()) ||
                r.uraian.toLowerCase().includes(filterText.toLowerCase())
            );
        }

        if (reports.length === 0) {
            reportTableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="5" style="text-align: center; color: #777;">Tidak ada data laporan yang ditemukan.</td>
                </tr>
            `;
            return;
        }

        reports.forEach((report) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${escapeHtml(report.tanggal)}</td>
                <td><strong>${escapeHtml(report.regu)}</strong></td>
                <td>${escapeHtml(report.lokasi)}</td>
                <td>${escapeHtml(report.uraian)}</td>
                <td>
                    <button class="btn-danger-sm" onclick="deleteReport(${report.id})">Hapus</button>
                </td>
            `;
            reportTableBody.appendChild(tr);
        });
    }

    // 4. Fitur Filter Pencarian Instan
    if (searchFilter) {
        searchFilter.addEventListener('input', (e) => {
            loadReports(e.target.value);
        });
    }

    // 5. Fungsi Cetak / Ekspor ke PDF
    if (exportPdfBtn) {
        exportPdfBtn.addEventListener('click', function() {
            const reports = JSON.parse(localStorage.getItem('satgas_reports')) || [];
            if (reports.length === 0) {
                alert('Belum ada data laporan untuk dicetak.');
                return;
            }
            window.print();
        });
    }
});

// Fungsi Global untuk Menghapus Laporan
window.deleteReport = function(id) {
    if (confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
        let reports = JSON.parse(localStorage.getItem('satgas_reports')) || [];
        reports = reports.filter(report => report.id !== id);
        localStorage.setItem('satgas_reports', JSON.stringify(reports));
        
        // Refresh tabel
        location.reload();
    }
};

// Fungsi Keamanan Sederhana untuk Mencegah XSS pada Input Teks
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
