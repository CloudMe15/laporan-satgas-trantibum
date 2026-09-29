document.getElementById('reportForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const tanggal = document.getElementById('tanggal').value;
    const lokasi = document.getElementById('lokasi').value;
    const kegiatan = document.getElementById('kegiatan').value;
    const foto = document.getElementById('foto').files[0];

    console.log({
        tanggal,
        lokasi,
        kegiatan,
        foto: foto ? foto.name : 'Tidak ada foto'
    });

    alert('Laporan berhasil disiapkan!');
});
