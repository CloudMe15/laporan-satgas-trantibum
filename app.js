const DEFAULT_INHU_DRIVE_URL = 'https://lh3.googleusercontent.com/d/1U-Whswnt_2pOQipuTZ0hHag42p6EhZgb';
const DEFAULT_SATPOL_PP_DRIVE_URL = 'https://lh3.googleusercontent.com/d/1sxdzLxjYv-T3N2D7EH1cIP1YvOKlMxdr';
const SILAHAPP_DEFAULT_ICON_URL = 'https://lh3.googleusercontent.com/d/1OpcEZCqFtfhS13i9m5qdyBPhxuPqy313';
const PESUT_ICON_URL = 'https://lh3.googleusercontent.com/d/1lU-PcawNqUuzPh_HYya0fxFMcy4D_yHX'; // Diperbarui dengan link baru
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
        '1': PESUT_ICON_URL, // Menggunakan link baru untuk PESUT
        '2': DEFAULT_SATPOL_PP_DRIVE_URL
    },
    nama: 'Fajar Ari Prakoso',
    nip: '199507102025211095',
    jabatan: 'Staff Program dan Keuangan'
};
