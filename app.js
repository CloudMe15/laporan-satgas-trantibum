document.addEventListener('DOMContentLoaded', function() {
    const patrolForm = document.getElementById('patrolForm');

    if (patrolForm) {
        patrolForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const petugas = document.getElementById('petugas').value;
            const catatan = document.getElementById('catatan').value;

            if(petugas.trim() === '') {
                alert('Nama petugas wajib diisi!');
                return;
            }

            console.log('Laporan Disimpan:');
            console.log('Petugas:', petugas);
            console.log('Catatan:', catatan);

            alert('Catatan hasil patroli berhasil disimpan!');
            patrolForm.reset();
        });
    }
});
