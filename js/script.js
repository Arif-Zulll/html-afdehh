// javascript lah pokoknya

// ==========================================
// 1. KONTROL SIDEBAR NAVIGASI
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const tombolMenu = document.getElementById('menuBtn');
  const tombolTutup = document.getElementById('closeBtn');
  const bilahSisi = document.getElementById('sidebar');
  const pelapisBilahSisi = document.getElementById('sidebarOverlay');

  const beralihBilahSisi = () => {
    if (bilahSisi) bilahSisi.classList.toggle('aktif');
    if (pelapisBilahSisi) pelapisBilahSisi.classList.toggle('aktif');
    document.body.classList.toggle('bilah-sisi-terbuka');
  };

  if (tombolMenu) tombolMenu.addEventListener('click', beralihBilahSisi);
  if (tombolTutup) tombolTutup.addEventListener('click', beralihBilahSisi);

  if (pelapisBilahSisi) {
    pelapisBilahSisi.addEventListener('click', () => {
      if (bilahSisi) bilahSisi.classList.remove('aktif');
      pelapisBilahSisi.classList.remove('aktif');
      document.body.classList.remove('bilah-sisi-terbuka');
    });
  }

  perbaruiUIAutentikasi();
  inisialisasiModalPlaylist();
});

// ==========================================
// 2. ELEMEN DOM & GLOBAL STATE
// ==========================================
const inputCari = document.getElementById('searchInput');
const tombolCari = document.getElementById('searchBtn');
const gridLagu = document.getElementById('playlistGrid') || document.getElementById('songGrid');

const gambarPemutar = document.getElementById('playerImg');
const judulPemutar = document.getElementById('playerTitle');
const penyanyiPemutar = document.getElementById('playerArtist');

const tombolPutarJeda = document.getElementById('playPauseBtn');
const bilahProgres = document.getElementById('progressBar');
const elemenWaktuSekarang = document.getElementById('currentTime');
const elemenWaktuTotal = document.getElementById('totalTime');
const bilahVolume = document.getElementById('volumeBar');

const audio = new Audio();
let dataMusik = [];
let dataUtamaMusik = [];
let laguYangAkanDitambah = null;

const isHalamanPlaylist = window.location.pathname.includes('playlist.html');
const isHalamanFavorit = window.location.pathname.includes('favorit.html');
const isHalamanTrending = window.location.pathname.includes('trending.html');

// ==========================================
// 3. LOGIKA AKUN & BATAS PEMUTARAN
// ==========================================
function getJumlahPemutaran() {
  return parseInt(localStorage.getItem('playCount')) || 0;
}

function tambahJumlahPemutaran() {
  const hitung = getJumlahPemutaran() + 1;
  localStorage.setItem('playCount', hitung);
  return hitung;
}

function isSudahLogin() {
  return localStorage.getItem('currentUser') !== null;
}

function periksaBatasPemutaran() {
  if (isSudahLogin()) return true;

  const hitungSekarang = getJumlahPemutaran();
  if (hitungSekarang >= 5) {
    alert('Batas pemutaran gratis (5 kali) telah habis! Silakan Login atau Daftar untuk melanjutkan.');
    bukaModalAutentikasi();
    return false;
  }
  return true;
}

// ==========================================
// 4. KONTROL MODAL LOGIN & DAFTAR
// ==========================================
const modalAutentikasi = document.getElementById('authModal');
const tombolTutupModal = document.getElementById('closeModalBtn');
const kontainerFormLogin = document.getElementById('loginFormContainer');
const kontainerFormDaftar = document.getElementById('registerFormContainer');
const tombolPindahDaftar = document.getElementById('switchToRegister');
const tombolPindahLogin = document.getElementById('switchToLogin');

const formLogin = document.getElementById('loginForm');
const formDaftar = document.getElementById('registerForm');
const liMenuAutentikasi = document.getElementById('authMenuLi');

function bukaModalAutentikasi() {
  if (modalAutentikasi) modalAutentikasi.classList.remove('tersembunyi');
}

function tutupModalAutentikasi() {
  if (modalAutentikasi) modalAutentikasi.classList.add('tersembunyi');
}

if (tombolTutupModal) tombolTutupModal.addEventListener('click', tutupModalAutentikasi);

if (tombolPindahDaftar) {
  tombolPindahDaftar.addEventListener('click', (e) => {
    e.preventDefault();
    if (kontainerFormLogin) kontainerFormLogin.classList.add('tersembunyi');
    if (kontainerFormDaftar) kontainerFormDaftar.classList.remove('tersembunyi');
  });
}

if (tombolPindahLogin) {
  tombolPindahLogin.addEventListener('click', (e) => {
    e.preventDefault();
    if (kontainerFormDaftar) kontainerFormDaftar.classList.add('tersembunyi');
    if (kontainerFormLogin) kontainerFormLogin.classList.remove('tersembunyi');
  });
}

if (formDaftar) {
  formDaftar.addEventListener('submit', (e) => {
    e.preventDefault();
    const namaLengkap = document.getElementById('regFullName').value.trim();
    const telepon = document.getElementById('regPhone').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const kataSandi = document.getElementById('regPassword').value;

    const penggunaTerdaftar = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const penggunaAda = penggunaTerdaftar.some(user => user.email === email);

    if (penggunaAda) {
      alert('Email sudah terdaftar! Gunakan email lain.');
      return;
    }

    const penggunaBaru = { fullName: namaLengkap, phone: telepon, email, password: kataSandi };
    penggunaTerdaftar.push(penggunaBaru);
    localStorage.setItem('registeredUsers', JSON.stringify(penggunaTerdaftar));

    localStorage.setItem('currentUser', JSON.stringify(penggunaBaru));
    alert(`Pendaftaran berhasil! Selamat datang, ${namaLengkap}.`);
    formDaftar.reset();
    tutupModalAutentikasi();
    perbaruiUIAutentikasi();
  });
}

if (formLogin) {
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const kataSandi = document.getElementById('loginPassword').value;

    const penggunaTerdaftar = JSON.parse(localStorage.getItem('registeredUsers')) || [];
    const penggunaValid = penggunaTerdaftar.find(user => user.email === email && user.password === kataSandi);

    if (penggunaValid) {
      localStorage.setItem('currentUser', JSON.stringify(penggunaValid));
      alert(`Login berhasil! Selamat datang kembali, ${penggunaValid.fullName}.`);
      formLogin.reset();
      tutupModalAutentikasi();
      perbaruiUIAutentikasi();
    } else {
      alert('Email atau kata sandi salah!');
    }
  });
}

function perbaruiUIAutentikasi() {
  if (!liMenuAutentikasi) return;
  bersihkanElemen(liMenuAutentikasi);

  if (isSudahLogin()) {
    const pengguna = JSON.parse(localStorage.getItem('currentUser'));
    const tombolKeluar = document.createElement('a');
    tombolKeluar.href = '#';
    tombolKeluar.title = 'Keluar';
    tombolKeluar.setAttribute('data-tooltip', 'Keluar');

    const spanIkon = document.createElement('span');
    spanIkon.className = 'material-symbols-outlined ikon-menu';
    spanIkon.textContent = 'logout';

    const spanTeks = document.createElement('span');
    spanTeks.className = 'teks-menu';
    spanTeks.textContent = `Keluar (${pengguna.fullName.split(' ')[0]})`;

    tombolKeluar.appendChild(spanIkon);
    tombolKeluar.appendChild(spanTeks);

    tombolKeluar.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      alert('Anda telah keluar.');
      perbaruiUIAutentikasi();
    });

    liMenuAutentikasi.appendChild(tombolKeluar);
  } else {
    const tautanMasuk = document.createElement('a');
    tautanMasuk.href = '#';
    tautanMasuk.id = 'openAuthBtn';
    tautanMasuk.title = 'Masuk / Daftar';
    tautanMasuk.setAttribute('data-tooltip', 'Masuk / Daftar');

    const spanIkon = document.createElement('span');
    spanIkon.className = 'material-symbols-outlined ikon-menu';
    spanIkon.textContent = 'key';

    const spanTeks = document.createElement('span');
    spanTeks.className = 'teks-menu';
    spanTeks.textContent = 'Masuk / Daftar';

    tautanMasuk.appendChild(spanIkon);
    tautanMasuk.appendChild(spanTeks);

    tautanMasuk.addEventListener('click', (e) => {
      e.preventDefault();
      bukaModalAutentikasi();
    });

    liMenuAutentikasi.appendChild(tautanMasuk);
  }
}

// ==========================================
// 5. FUNGSI UTILITAS & HELPER
// ==========================================
function bersihkanElemen(elemen) {
  while (elemen.firstChild) {
    elemen.removeChild(elemen.firstChild);
  }
}

function setTeksStatus(pesan) {
  if (!gridLagu) return;
  bersihkanElemen(gridLagu);

  const divStatus = document.createElement('div');
  divStatus.className = 'teks-status';
  divStatus.textContent = pesan;
  gridLagu.appendChild(divStatus);
}

function formatWaktu(detik) {
  const menit = Math.floor(detik / 60);
  const sisaDetik = Math.floor(detik % 60);
  return `${menit}:${sisaDetik < 10 ? '0' : ''}${sisaDetik}`;
}

async function fetchDenganTenggat(sumber, opsi = {}) {
  const { timeout = 5000 } = opsi;
  const pengontrol = new AbortController();
  const id = setTimeout(() => pengontrol.abort(), timeout);
  const respons = await fetch(sumber, { ...opsi, signal: pengontrol.signal });
  clearTimeout(id);
  return respons;
}

function getIdTrek(lagu) {
  return lagu.trackId || lagu.id || lagu.title || lagu.name;
}

// ==========================================
// 6. LOGIKA LOCALSTORAGE (MULTI-PLAYLIST & FAVORIT)
// ==========================================
function getDataPenyimpanan(kunci) {
  return JSON.parse(localStorage.getItem(kunci)) || [];
}

function simpanDataPenyimpanan(kunci, data) {
  localStorage.setItem(kunci, JSON.stringify(data));
}

function getDaftarPlaylist() {
  return JSON.parse(localStorage.getItem('userPlaylists')) || [];
}

function simpanDaftarPlaylist(data) {
  localStorage.setItem('userPlaylists', JSON.stringify(data));
}

function beralihFavorit(lagu) {
  const favorit = getDataPenyimpanan('myFavorites');
  const targetId = getIdTrek(lagu);
  const indeks = favorit.findIndex(item => getIdTrek(item) === targetId);

  if (indeks === -1) {
    favorit.push(lagu);
    simpanDataPenyimpanan('myFavorites', favorit);
    alert('Lagu ditambahkan ke Favorit ❤️');
  } else {
    favorit.splice(indeks, 1);
    simpanDataPenyimpanan('myFavorites', favorit);
    alert('Lagu dihapus dari Favorit 💔');
  }

  if (isHalamanFavorit) {
    muatHalamanFavorit();
  } else if (gridLagu && dataMusik.length > 0) {
    tampilkanLagu(dataMusik);
  }
}

function bukaModalPilihPlaylist(lagu) {
  const playlists = getDaftarPlaylist();

  if (playlists.length === 0) {
    alert('Kamu belum memiliki playlist. Silakan buat playlist terlebih dahulu di halaman Playlist!');
    return;
  }

  laguYangAkanDitambah = lagu;
  const modal = document.getElementById('selectPlaylistModal');
  const kontainerList = document.getElementById('playlistSelectList');

  if (!modal || !kontainerList) return;

  bersihkanElemen(kontainerList);

  playlists.forEach(pl => {
    const divItem = document.createElement('div');
    divItem.className = 'item-pilihan-playlist';

    const spanNama = document.createElement('span');
    spanNama.textContent = pl.nama;

    const spanJumlah = document.createElement('span');
    spanJumlah.textContent = `${pl.lagu.length} Lagu`;
    spanJumlah.style.color = '#b3b3b3';
    spanJumlah.style.fontSize = '0.85rem';

    divItem.appendChild(spanNama);
    divItem.appendChild(spanJumlah);

    divItem.addEventListener('click', () => {
      masukkanLaguKePlaylistSpesifik(pl.id);
      modal.classList.add('tersembunyi');
    });

    kontainerList.appendChild(divItem);
  });

  modal.classList.remove('tersembunyi');
}

function masukkanLaguKePlaylistSpesifik(playlistId) {
  if (!laguYangAkanDitambah) return;

  const playlists = getDaftarPlaylist();
  const index = playlists.findIndex(p => p.id === playlistId);

  if (index !== -1) {
    const targetId = getIdTrek(laguYangAkanDitambah);
    const sudahAda = playlists[index].lagu.some(item => getIdTrek(item) === targetId);

    if (!sudahAda) {
      playlists[index].lagu.push(laguYangAkanDitambah);
      simpanDaftarPlaylist(playlists);
      alert(`Lagu berhasil ditambahkan ke playlist "${playlists[index].nama}"!`);
    } else {
      alert(`Lagu sudah ada di dalam playlist "${playlists[index].nama}".`);
    }
  }
  laguYangAkanDitambah = null;
}

const btnTutupPilih = document.getElementById('closeSelectPlaylistBtn');
if (btnTutupPilih) {
  btnTutupPilih.addEventListener('click', () => {
    const modal = document.getElementById('selectPlaylistModal');
    if (modal) modal.classList.add('tersembunyi');
  });
}

function hapusLaguDariPlaylistSpesifik(playlistId, lagu) {
  const playlists = getDaftarPlaylist();
  const index = playlists.findIndex(p => p.id === playlistId);

  if (index !== -1) {
    const targetId = getIdTrek(lagu);
    playlists[index].lagu = playlists[index].lagu.filter(item => getIdTrek(item) !== targetId);
    simpanDaftarPlaylist(playlists);
    bukaIsiPlaylist(playlists[index]);
  }
}

function muatHalamanPlaylist() {
  if (!gridLagu) return;

  const urlParams = new URLSearchParams(window.location.search);
  const playlistId = urlParams.get('id');
  const playlists = getDaftarPlaylist();

  if (playlistId) {
    const playlistDipilih = playlists.find(p => p.id === playlistId);
    if (playlistDipilih) {
      bukaIsiPlaylist(playlistDipilih);
      return;
    }
  }

  bersihkanElemen(gridLagu);

  if (playlists.length === 0) {
    setTeksStatus('Belum ada playlist yang dibuat.');
    return;
  }

  playlists.forEach(pl => {
    const kartu = document.createElement('div');
    kartu.className = 'kartu-lagu';

    const divSampul = document.createElement('div');
    divSampul.className = 'sampul-placeholder-playlist';

    const spanIkonMusik = document.createElement('span');
    spanIkonMusik.className = 'material-symbols-outlined';
    spanIkonMusik.textContent = 'queue_music';
    divSampul.appendChild(spanIkonMusik);

    const divInfo = document.createElement('div');
    divInfo.className = 'info-playlist-baru';

    const h4Judul = document.createElement('h4');
    h4Judul.textContent = pl.nama;

    const pJumlah = document.createElement('p');
    pJumlah.textContent = `${pl.lagu.length} Lagu`;

    divInfo.appendChild(h4Judul);
    divInfo.appendChild(pJumlah);

    kartu.appendChild(divSampul);
    kartu.appendChild(divInfo);

    kartu.addEventListener('click', () => {
      window.location.href = `playlist.html?id=${pl.id}`;
    });

    gridLagu.appendChild(kartu);
  });
}

function bukaIsiPlaylist(playlist) {
  if (!gridLagu) return;

  dataMusik = playlist.lagu;

  if (playlist.lagu.length === 0) {
    setTeksStatus(`Playlist "${playlist.nama}" masih kosong.`);
    return;
  }

  tampilkanLaguKhususPlaylist(playlist.lagu, playlist.id);
}

function tampilkanLaguKhususPlaylist(daftarLagu, playlistId) {
  bersihkanElemen(gridLagu);

  daftarLagu.forEach(lagu => {
    const teksJudul = lagu.title || lagu.trackName || lagu.name || 'Tanpa Judul';
    const teksPenyanyi = lagu.artist || lagu.artistName || lagu.singer || 'Artis Tidak Diketahui';

    let gambarMini = lagu.image || lagu.cover || lagu.thumbnail || lagu.poster;
    if (!gambarMini && lagu.artworkUrl100) {
      gambarMini = lagu.artworkUrl100.replace('100x100bb', '600x600bb');
    }
    if (!gambarMini) gambarMini = './images/placeholder.png';

    const urlAudio = lagu.audio || lagu.previewUrl || lagu.url || lagu.src;

    const kartu = document.createElement('div');
    kartu.className = 'kartu-lagu';

    const img = document.createElement('img');
    img.src = gambarMini;
    img.alt = teksJudul;

    const divJudul = document.createElement('div');
    divJudul.className = 'judul-lagu';
    divJudul.textContent = teksJudul;

    const divPenyanyi = document.createElement('div');
    divPenyanyi.className = 'penyanyi-lagu';
    divPenyanyi.textContent = teksPenyanyi;

    const kontainerAksi = document.createElement('div');
    kontainerAksi.className = 'kontainer-aksi-kartu';

    const tombolHapus = document.createElement('button');
    tombolHapus.className = 'tombol-hapus-playlist tombol-lebar-penuh';
    tombolHapus.textContent = 'Hapus dari Playlist';
    tombolHapus.addEventListener('click', (e) => {
      e.stopPropagation();
      hapusLaguDariPlaylistSpesifik(playlistId, lagu);
    });

    kontainerAksi.appendChild(tombolHapus);

    kartu.appendChild(img);
    kartu.appendChild(divJudul);
    kartu.appendChild(divPenyanyi);
    kartu.appendChild(kontainerAksi);

    kartu.addEventListener('click', async () => {
      if (!periksaBatasPemutaran()) return;
      if (urlAudio) {
        mulaiMusik(urlAudio, teksJudul, teksPenyanyi, gambarMini, lagu);
      } else {
        await putarDariCadanganiTunes(teksJudul, teksPenyanyi, gambarMini);
      }
    });

    gridLagu.appendChild(kartu);
  });
}

function muatHalamanFavorit() {
  const favorit = getDataPenyimpanan('myFavorites');
  dataMusik = favorit;
  if (favorit.length > 0) tampilkanLagu(favorit);
  else setTeksStatus('Belum ada lagu favorit.');
}

// ==========================================
// 7. FETCH DATA MUSIK (API INTEGRATION)
// ==========================================
async function muatMusikLokal() {
  if (!gridLagu) return;

  if (isHalamanPlaylist) { muatHalamanPlaylist(); return; }
  if (isHalamanFavorit) { muatHalamanFavorit(); return; }

  if (isHalamanTrending) {
    setTeksStatus('Memuat lagu Top Trending...');
    try {
      const res = await fetchDenganTenggat('https://itunes.apple.com/us/rss/topsongs/limit=72/json', { timeout: 6000 });
      if (!res.ok) throw new Error('Gagal memuat Top Trending');

      const data = await res.json();
      const entri = data.feed?.entry || [];

      dataMusik = entri.map(item => {
        let tautanAudio = '';
        if (Array.isArray(item.link)) {
          const objekAudio = item.link.find(l => l.attributes?.type?.includes('audio'));
          tautanAudio = objekAudio?.attributes?.href || '';
        } else if (item.link?.attributes?.href) {
          tautanAudio = item.link.attributes.href;
        }

        return {
          trackId: item.id?.attributes?.['im:id'] || Math.random().toString(),
          title: item['im:name']?.label || 'Tanpa Judul',
          artist: item['im:artist']?.label || 'Artis Tidak Diketahui',
          image: item['im:image']?.[2]?.label || item['im:image']?.[0]?.label || '',
          audio: tautanAudio
        };
      });

      if (dataMusik.length > 0) {
        tampilkanLagu(dataMusik);
      } else {
        setTeksStatus('Tidak ada lagu trending ditemukan.');
      }
      return;
    } catch (err) {
      console.error('Fetch Trending Error:', err);
      setTeksStatus('Gagal memuat lagu trending. Memuat lagu populer alternatif...');
      ambilMusikDariAPI('Pop Hits');
      return;
    }
  }

  setTeksStatus('Memuat lagu pilihan...');

  try {
    const res = await fetchDenganTenggat('https://pane-api-phi.vercel.app/musics.json', { timeout: 5000 });
    if (!res.ok) throw new Error('Gagal mengambil lagu dari Pane API');

    const data = await res.json();
    dataUtamaMusik = Array.isArray(data) ? data : (data.musics || data.results || []);
    dataMusik = dataUtamaMusik;

    if (dataMusik.length > 0) {
      tampilkanLagu(dataMusik);
    } else {
      throw new Error('Data Pane API kosong');
    }
  } catch (err) {
    try {
      const resCadangan = await fetchDenganTenggat('https://itunes.apple.com/search?term=indonesia&entity=song&limit=24', { timeout: 6000 });
      const dataCadangan = await resCadangan.json();
      dataMusik = dataCadangan.results || [];

      if (dataMusik.length > 0) {
        tampilkanLagu(dataMusik);
      } else {
        setTeksStatus('Gagal memuat lagu dari server.');
      }
    } catch (errCadangan) {
      console.error('Fallback Fetch Error:', errCadangan);
      setTeksStatus('Gagal koneksi server. Periksa jaringan Anda.');
    }
  }
}

async function ambilMusikDariAPI(kataKunci) {
  if (!gridLagu) return;
  setTeksStatus('Mencari lagu...');

  const kataKunciKecil = kataKunci.toLowerCase();

  const lokalTersaring = dataUtamaMusik.filter(lagu => {
    const judul = (lagu.title || lagu.trackName || lagu.name || '').toLowerCase();
    const penyanyi = (lagu.artist || lagu.artistName || lagu.singer || '').toLowerCase();
    return judul.includes(kataKunciKecil) || penyanyi.includes(kataKunciKecil);
  });

  if (lokalTersaring.length > 0) {
    dataMusik = lokalTersaring;
    tampilkanLagu(dataMusik);
    return;
  }

  try {
    const res = await fetchDenganTenggat(`https://itunes.apple.com/search?term=${encodeURIComponent(kataKunci)}&entity=song&limit=24`, { timeout: 6000 });
    if (!res.ok) throw new Error('Gagal mengambil data dari iTunes API');

    const data = await res.json();
    dataMusik = data.results || [];

    if (dataMusik.length > 0) {
      tampilkanLagu(dataMusik);
    } else {
      setTeksStatus('Lagu tidak ditemukan. Coba kata kunci lain.');
    }
  } catch (err) {
    console.error('Fetch iTunes API Error:', err);
    setTeksStatus('Gagal memuat pencarian.');
  }
}

if (gridLagu) muatMusikLokal();

// ==========================================
// 8. EVENT LISTENER PENCARIAN
// ==========================================
if (tombolCari && inputCari) {
  tombolCari.addEventListener('click', () => {
    const kataKunci = inputCari.value.trim();
    if (kataKunci) ambilMusikDariAPI(kataKunci);
    else muatMusikLokal();
  });

  inputCari.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const kataKunci = inputCari.value.trim();
      if (kataKunci) ambilMusikDariAPI(kataKunci);
      else muatMusikLokal();
    }
  });
}

// ==========================================
// 9. RENDER KARTU LAGU (BERANDA / FAVORIT / TRENDING)
// ==========================================
function tampilkanLagu(daftarLagu) {
  if (!gridLagu) return;
  bersihkanElemen(gridLagu);

  const favorit = getDataPenyimpanan('myFavorites');

  daftarLagu.forEach(lagu => {
    const teksJudul = lagu.title || lagu.trackName || lagu.name || 'Tanpa Judul';
    const teksPenyanyi = lagu.artist || lagu.artistName || lagu.singer || 'Artis Tidak Diketahui';

    let gambarMini = lagu.image || lagu.cover || lagu.thumbnail || lagu.poster;
    if (!gambarMini && lagu.artworkUrl100) {
      gambarMini = lagu.artworkUrl100.replace('100x100bb', '600x600bb');
    }
    if (!gambarMini) gambarMini = './images/placeholder.png';

    const urlAudio = lagu.audio || lagu.previewUrl || lagu.url || lagu.src;
    const idLaguSekarang = getIdTrek(lagu);

    const kartu = document.createElement('div');
    kartu.className = 'kartu-lagu';

    const img = document.createElement('img');
    img.src = gambarMini;
    img.alt = teksJudul;

    const divJudul = document.createElement('div');
    divJudul.className = 'judul-lagu';
    divJudul.textContent = teksJudul;

    const divPenyanyi = document.createElement('div');
    divPenyanyi.className = 'penyanyi-lagu';
    divPenyanyi.textContent = teksPenyanyi;

    const kontainerAksi = document.createElement('div');
    kontainerAksi.className = 'kontainer-aksi-kartu';

    const isFav = favorit.some(item => getIdTrek(item) === idLaguSekarang);

    if (isHalamanFavorit) {
      const tombolHapusFav = document.createElement('button');
      tombolHapusFav.className = 'tombol-hapus-playlist tombol-lebar-penuh';
      tombolHapusFav.textContent = '💔 Hapus Favorit';
      tombolHapusFav.addEventListener('click', (e) => {
        e.stopPropagation();
        beralihFavorit(lagu);
      });
      kontainerAksi.appendChild(tombolHapusFav);

    } else {
      const tombolFav = document.createElement('button');
      tombolFav.textContent = isFav ? '❤️' : '🤍';
      tombolFav.className = 'tombol-tambah-playlist';
      tombolFav.addEventListener('click', (e) => {
        e.stopPropagation();
        beralihFavorit(lagu);
      });

      const tombolAksi = document.createElement('button');
      tombolAksi.className = 'tombol-tambah-playlist tombol-lebar-penuh';
      tombolAksi.textContent = '+ Playlist';
      tombolAksi.addEventListener('click', (e) => {
        e.stopPropagation();
        bukaModalPilihPlaylist(lagu);
      });

      kontainerAksi.appendChild(tombolFav);
      kontainerAksi.appendChild(tombolAksi);
    }

    kartu.appendChild(img);
    kartu.appendChild(divJudul);
    kartu.appendChild(divPenyanyi);
    kartu.appendChild(kontainerAksi);

    kartu.addEventListener('click', async () => {
      if (!periksaBatasPemutaran()) return;
      if (urlAudio) {
        mulaiMusik(urlAudio, teksJudul, teksPenyanyi, gambarMini, lagu);
      } else {
        await putarDariCadanganiTunes(teksJudul, teksPenyanyi, gambarMini);
      }
    });

    gridLagu.appendChild(kartu);
  });
}

// ==========================================
// 10. FUNGSI PEMUTAR AUDIO
// ==========================================
async function putarDariCadanganiTunes(judul, penyanyi, gambarCadangan) {
  try {
    const kataKunci = `${judul} ${penyanyi}`;
    const res = await fetchDenganTenggat(`https://itunes.apple.com/search?term=${encodeURIComponent(kataKunci)}&entity=song&limit=1`, { timeout: 5000 });

    if (!res.ok) return;

    const data = await res.json();
    const trek = data.results && data.results[0];

    if (trek && trek.previewUrl) {
      const gambarITunes = trek.artworkUrl100 ? trek.artworkUrl100.replace('100x100bb', '600x600bb') : gambarCadangan;
      const judulTrek = trek.trackName || judul;
      const penyanyiTrek = trek.artistName || penyanyi;

      mulaiMusik(trek.previewUrl, judulTrek, penyanyiTrek, gambarITunes);
    }
  } catch (err) {}
}

function perbaruiIkonPlayPause(isPaused) {
  if (!tombolPutarJeda) return;
  bersihkanElemen(tombolPutarJeda);

  const spanIkon = document.createElement('span');
  spanIkon.className = 'material-symbols-outlined';
  spanIkon.textContent = isPaused ? 'play_arrow' : 'pause';
  tombolPutarJeda.appendChild(spanIkon);
}

function mulaiMusik(urlStream, judul, penyanyi, sampul, dataLaguAsli = null) {
  if (judulPemutar) judulPemutar.textContent = judul;
  if (penyanyiPemutar) penyanyiPemutar.textContent = penyanyi;
  if (gambarPemutar) gambarPemutar.src = sampul;

  audio.src = urlStream;
  if (bilahVolume) audio.volume = bilahVolume.value / 100;

  audio.play().then(() => {
    perbaruiIkonPlayPause(false);
    if (!isSudahLogin()) {
      tambahJumlahPemutaran();
    }
  }).catch(async () => {
    if (dataLaguAsli) {
      await putarDariCadanganiTunes(judul, penyanyi, sampul);
    }
  });
}

if (tombolPutarJeda) {
  tombolPutarJeda.addEventListener('click', () => {
    if (!audio.src) return;

    if (audio.paused) {
      if (!periksaBatasPemutaran()) return;
      audio.play();
      perbaruiIkonPlayPause(false);
    } else {
      audio.pause();
      perbaruiIkonPlayPause(true);
    }
  });
}

if (bilahProgres) {
  bilahProgres.addEventListener('input', () => {
    if (!audio.duration) return;
    audio.currentTime = (bilahProgres.value / 100) * audio.duration;
  });
}

if (bilahVolume) {
  bilahVolume.addEventListener('input', () => {
    audio.volume = bilahVolume.value / 100;
  });
}

audio.addEventListener('timeupdate', () => {
  if (audio.duration && bilahProgres && elemenWaktuSekarang && elemenWaktuTotal) {
    bilahProgres.value = (audio.currentTime / audio.duration) * 100;
    elemenWaktuSekarang.textContent = formatWaktu(audio.currentTime);
    elemenWaktuTotal.textContent = formatWaktu(audio.duration);
  }
});

audio.addEventListener('ended', () => {
  perbaruiIkonPlayPause(true);
  if (bilahProgres) bilahProgres.value = 0;
});

// ==========================================
// 11. MODAL BUAT PLAYLIST BARU
// ==========================================
function inisialisasiModalPlaylist() {
  const tombolBuatPlaylist = document.getElementById('createPlaylistBtn');
  const modalBuatPlaylist = document.getElementById('createPlaylistModal');
  const tombolTutupModalPlaylist = document.getElementById('closePlaylistModalBtn');
  const formBuatPlaylist = document.getElementById('createPlaylistForm');
  const inputNamaPlaylist = document.getElementById('playlistName');

  const tutupModal = () => {
    if (modalBuatPlaylist) modalBuatPlaylist.classList.et ? modalBuatPlaylist.classList.add('tersembunyi') : modalBuatPlaylist.classList.add('tersembunyi');
  };

  if (tombolBuatPlaylist && modalBuatPlaylist) {
    tombolBuatPlaylist.addEventListener('click', () => {
      modalBuatPlaylist.classList.remove('tersembunyi');
      if (inputNamaPlaylist) {
        inputNamaPlaylist.value = '';
        inputNamaPlaylist.focus();
      }
    });
  }

  if (tombolTutupModalPlaylist) {
    tombolTutupModalPlaylist.addEventListener('click', tutupModal);
  }

  if (formBuatPlaylist) {
    formBuatPlaylist.addEventListener('submit', (e) => {
      e.preventDefault();

      const nama = inputNamaPlaylist ? inputNamaPlaylist.value.trim() : '';
      if (!nama) return;

      const playlists = getDaftarPlaylist();
      const playlistBaru = {
        id: 'pl_' + Date.now(),
        nama: nama,
        lagu: []
      };

      playlists.push(playlistBaru);
      simpanDaftarPlaylist(playlists);

      tutupModal();
      if (isHalamanPlaylist) {
        muatHalamanPlaylist();
      }
    });
  }
}