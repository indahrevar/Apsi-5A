INSERT INTO pelanggan (id_pelanggan, nama_pelanggan, jenis_kelamin, no_telepon, email, nama_jalan, nomor, kota)
VALUES
    ('PLG01', 'Rizky Ramadhan', 'Laki-laki', '081234567890', 'rizky@gmail.com', 'Jl. Khatib Sulaiman', '12', 'Padang'),
    ('PLG02', 'Siti Rahma', 'Perempuan', '081298765432', 'siti@gmail.com', 'Jl. Ahmad Dahlan', '45', 'Padang')
ON CONFLICT (id_pelanggan) DO NOTHING;

INSERT INTO owner (id_owner, nama_owner, jenis_kelamin, no_telepon, email, tanggal_bergabung)
VALUES ('OWN01', 'Fauziah', 'Perempuan', '08111222333', 'fauziah@abita.com', '2022-01-10')
ON CONFLICT (id_owner) DO NOTHING;

INSERT INTO admin (id_admin, id_owner, nama_admin, jenis_kelamin, no_telepon, email, tanggal_bergabung)
VALUES ('ADM01', 'OWN01', 'Admin Dapur', 'Perempuan', '08114444555', 'admin@abita.com', '2023-05-15')
ON CONFLICT (id_admin) DO NOTHING;

INSERT INTO karyawan (id_karyawan, nama_karyawan, jenis_kelamin, no_telepon, email, tanggal_bergabung)
VALUES ('KRY01', 'Budi Santoso', 'Laki-laki', '082155566677', 'budi.prod@abita.com', '2023-06-01')
ON CONFLICT (id_karyawan) DO NOTHING;

INSERT INTO produk (id_produk, nama_produk, kategori_produk, satuan_produk, stok_minimum, gambar_url)
VALUES
    ('PRD01', 'Pinukuik Special', 'Makanan', 'Porsi', 5, 'https://upload.wikimedia.org/wikipedia/commons/7/74/Pinukuik.jpg'),
    ('PRD02', 'Pinukuik Original', 'Makanan', 'Porsi', 10, 'https://upload.wikimedia.org/wikipedia/commons/7/74/Pinukuik.jpg')
ON CONFLICT (id_produk) DO NOTHING;

INSERT INTO pesanan (no_pesanan, id_admin, id_pelanggan, tanggal_pesanan, status_pesanan)
VALUES ('PSN01', 'ADM01', 'PLG01', '2026-06-06', 'Selesai')
ON CONFLICT (no_pesanan) DO NOTHING;

INSERT INTO detail_pesanan (no_pesanan, id_produk, jumlah, harga_satuan, stok_produk_sebelum, stok_produk_sesudah)
VALUES ('PSN01', 'PRD01', 2, 15000, 20, 18)
ON CONFLICT (no_pesanan, id_produk) DO NOTHING;

INSERT INTO pembayaran (id_pembayaran, id_admin, no_pesanan, metode_pembayaran, jumlah_bayar, tanggal_bayar, status_pembayaran)
VALUES ('BYR01', 'ADM01', 'PSN01', 'Transfer', 30000, '2026-06-06', 'Lunas')
ON CONFLICT (id_pembayaran) DO NOTHING;

INSERT INTO produksi (id_produksi, no_pesanan, id_karyawan, status_produksi, tanggal_mulai_produksi, tanggal_selesai_produksi)
VALUES ('PRD-K01', 'PSN01', 'KRY01', 'Selesai', '2026-06-06', '2026-06-06')
ON CONFLICT (id_produksi) DO NOTHING;

INSERT INTO penyerahan (id_penyerahan, id_admin, no_pesanan, metode_penyerahan, status_penyerahan, tanggal_penyerahan)
VALUES ('SRH01', 'ADM01', 'PSN01', 'Ambil', 'Diambil', '2026-06-06')
ON CONFLICT (id_penyerahan) DO NOTHING;

INSERT INTO ulasan (id_ulasan, no_pesanan, rating, isi_ulasan, tanggal_ulasan)
VALUES ('ULS01', 'PSN01', 5, 'Rasanya enak dan sangat mantap!', '2026-06-06')
ON CONFLICT (id_ulasan) DO NOTHING;
