document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const appViews = document.querySelectorAll('.app-view');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Hapus kelas aktif dari seluruh menu dan view
            menuItems.forEach(nav => nav.classList.remove('active'));
            appViews.forEach(view => view.classList.remove('active-view'));

            // Aktifkan menu yang dipilih
            item.classList.add('active');

            // Tampilkan view target yang sesuai
            const target = item.getAttribute('data-target');
            const targetView = document.getElementById(`view-${target}`);
            if (targetView) {
                targetView.classList.add('active-view');
            }
        });
    });
});
