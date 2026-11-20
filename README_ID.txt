GOLD SCALPER V2 — iPhone PWA Market Viewer

ISI:
- Harga spot XAU/USD dari Gold API (https://api.gold-api.com/price/XAU)
- Pembaruan target setiap 30 detik (mengikuti penyedia data)
- Candle M1, M5, M15, H1 dibentuk dari sampel harga yang dikumpulkan aplikasi.
- EMA 20/50/200, RSI 14, ATR 14.
- Tidak ada order, tombol BUY/SELL, akun broker, atau eksekusi transaksi.

PENTING:
1. Harga spot bersifat indikatif, bukan harga bid/ask Exness.
2. Candle dibentuk secara lokal dari saat aplikasi mulai mengumpulkan sampel. Tidak tersedia candle historis broker.
3. Setelah pertama kali dibuka, M1 perlu setidaknya beberapa menit untuk mulai terbentuk; M5/M15/H1 perlu lebih lama.
4. ADX belum dihitung pada versi ini; antarmuka menandai kebutuhan data.
5. Data sampel disimpan di localStorage perangkat. Menghapus data situs akan menghapus sampel.
6. Aplikasi perlu di-host melalui HTTPS agar PWA dan service worker berfungsi.

CARA PASANG DI IPHONE:
1. Unggah seluruh isi folder ini ke repository GitHub (bukan folder ZIP-nya).
2. Di GitHub repository: Settings > Pages.
3. Pilih Deploy from a branch, branch main, folder /(root), lalu Save.
4. Tunggu sampai GitHub Pages memberikan alamat situs.
5. Buka alamat itu di Safari iPhone.
6. Tekan tombol Share (ikon kotak dengan panah ke atas) > Add to Home Screen > Add.

Jika GitHub Pages menampilkan 404, periksa apakah index.html berada di root repository dan Pages mengarah ke main /(root).

Tidak ada username/password, token broker, atau API key yang diminta.
