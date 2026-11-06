DROP TABLE IF EXISTS ulasan;
DROP TABLE IF EXISTS penyerahan;
DROP TABLE IF EXISTS produksi;
DROP TABLE IF EXISTS pembayaran;
DROP TABLE IF EXISTS detail_pesanan;
DROP TABLE IF EXISTS pesanan;
DROP TABLE IF EXISTS produk;
DROP TABLE IF EXISTS karyawan;
DROP TABLE IF EXISTS admin;
DROP TABLE IF EXISTS owner;
DROP TABLE IF EXISTS pelanggan;

CREATE TABLE pelanggan (
    id_pelanggan VARCHAR(10) PRIMARY KEY,
    nama_pelanggan VARCHAR(50) NOT NULL,
    jenis_kelamin VARCHAR(10) NOT NULL,
    no_telepon VARCHAR(16) NOT NULL,
    email VARCHAR(40) NOT NULL,
    nama_jalan VARCHAR(50) NOT NULL,
    nomor VARCHAR(4) NOT NULL,
    kota VARCHAR(15) NOT NULL
);

CREATE TABLE owner (
    id_owner VARCHAR(10) PRIMARY KEY,
    nama_owner VARCHAR(50) NOT NULL,
    jenis_kelamin VARCHAR(10) NOT NULL,
    no_telepon VARCHAR(16) NOT NULL,
    email VARCHAR(40) NOT NULL,
    tanggal_bergabung DATE NOT NULL
);

CREATE TABLE admin (
    id_admin VARCHAR(10) PRIMARY KEY,
    id_owner VARCHAR(10) NOT NULL,
    nama_admin VARCHAR(50) NOT NULL,
    jenis_kelamin VARCHAR(10) NOT NULL,
    no_telepon VARCHAR(16) NOT NULL,
    email VARCHAR(40) NOT NULL,
    tanggal_bergabung DATE NOT NULL,
    FOREIGN KEY (id_owner) 
        REFERENCES owner(id_owner) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

CREATE TABLE karyawan (
    id_karyawan VARCHAR(10) PRIMARY KEY,
    nama_karyawan VARCHAR(50) NOT NULL,
    jenis_kelamin VARCHAR(10) NOT NULL,
    no_telepon VARCHAR(16) NOT NULL,
    email VARCHAR(40) NOT NULL,
    tanggal_bergabung DATE NOT NULL
);

CREATE TABLE produk (
    id_produk VARCHAR(10) PRIMARY KEY,
    nama_produk VARCHAR(30) NOT NULL,
    kategori_produk VARCHAR(10) NOT NULL,
    satuan_produk VARCHAR(10) NOT NULL,
    stok_minimum INTEGER NOT NULL
);

CREATE TABLE pesanan (
    no_pesanan VARCHAR(10) PRIMARY KEY,
    id_admin VARCHAR(10) NOT NULL,
    id_pelanggan VARCHAR(10) NOT NULL,
    tanggal_pesanan DATE NOT NULL,
    status_pesanan VARCHAR(10) NOT NULL,
    FOREIGN KEY (id_admin) 
        REFERENCES admin(id_admin) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    FOREIGN KEY (id_pelanggan) 
        REFERENCES pelanggan(id_pelanggan) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

CREATE TABLE detail_pesanan (
    no_pesanan VARCHAR(10) NOT NULL,
    id_produk VARCHAR(10) NOT NULL,
    jumlah INTEGER NOT NULL CHECK (jumlah > 0),
    harga_satuan DECIMAL(19, 2) NOT NULL CHECK (harga_satuan >= 0),
    stok_produk_sebelum INTEGER NOT NULL,
    stok_produk_sesudah INTEGER NOT NULL,
    PRIMARY KEY (no_pesanan, id_produk),
    FOREIGN KEY (no_pesanan) 
        REFERENCES pesanan(no_pesanan) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    FOREIGN KEY (id_produk) 
        REFERENCES produk(id_produk) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

CREATE TABLE pembayaran (
    id_pembayaran VARCHAR(10) PRIMARY KEY,
    id_admin VARCHAR(10) NOT NULL,
    no_pesanan VARCHAR(10) NOT NULL,
    metode_pembayaran VARCHAR(10) NOT NULL,
    jumlah_bayar DECIMAL(19, 2) NOT NULL,
    tanggal_bayar DATE NOT NULL,
    status_pembayaran VARCHAR(10) NOT NULL,
    FOREIGN KEY (id_admin) 
        REFERENCES admin(id_admin) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    FOREIGN KEY (no_pesanan) 
        REFERENCES pesanan(no_pesanan) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

CREATE TABLE produksi (
    id_produksi VARCHAR(10) PRIMARY KEY,
    no_pesanan VARCHAR(10) NOT NULL,
    id_karyawan VARCHAR(10) NOT NULL,
    status_produksi VARCHAR(10) NOT NULL,
    tanggal_mulai_produksi DATE NOT NULL,
    tanggal_selesai_produksi DATE NOT NULL,
    FOREIGN KEY (no_pesanan) 
        REFERENCES pesanan(no_pesanan) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    FOREIGN KEY (id_karyawan) 
        REFERENCES karyawan(id_karyawan) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

CREATE TABLE penyerahan (
    id_penyerahan VARCHAR(10) PRIMARY KEY,
    id_admin VARCHAR(10) NOT NULL,
    no_pesanan VARCHAR(10) NOT NULL,
    metode_penyerahan VARCHAR(10) NOT NULL,
    status_penyerahan VARCHAR(10) NOT NULL,
    tanggal_penyerahan DATE NOT NULL,
    FOREIGN KEY (id_admin) 
        REFERENCES admin(id_admin) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    FOREIGN KEY (no_pesanan) 
        REFERENCES pesanan(no_pesanan) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

CREATE TABLE ulasan (
    id_ulasan VARCHAR(10) PRIMARY KEY,
    no_pesanan VARCHAR(10) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    isi_ulasan VARCHAR(255) NOT NULL,
    tanggal_ulasan DATE NOT NULL,
    FOREIGN KEY (no_pesanan) 
        REFERENCES pesanan(no_pesanan) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT
);

select * FROM pelanggan;

INSERT INTO pelanggan (id_pelanggan, nama_pelanggan, jenis_kelamin, no_telepon, email, nama_jalan, nomor, kota)
VALUES 
    ('PLG01', 'Rizky Ramadhan', 'Laki-laki', '081234567890', 'rizky@gmail.com', 'Jl. Khatib Sulaiman', '12', 'Padang'),
    ('PLG02', 'Siti Rahma', 'Perempuan', '081298765432', 'siti@gmail.com', 'Jl. Ahmad Dahlan', '45', 'Padang');


INSERT INTO owner (id_owner, nama_owner, jenis_kelamin, no_telepon, email, tanggal_bergabung)
VALUES 
    ('OWN01', 'Fauziah', 'Perempuan', '08111222333', 'fauziah@abita.com', '2022-01-10');


INSERT INTO admin (id_admin, id_owner, nama_admin, jenis_kelamin, no_telepon, email, tanggal_bergabung)
VALUES 
    ('ADM01', 'OWN01', 'Admin Dapur', 'Perempuan', '08114444555', 'admin@abita.com', '2023-05-15');


INSERT INTO karyawan (id_karyawan, nama_karyawan, jenis_kelamin, no_telepon, email, tanggal_bergabung)
VALUES 
    ('KRY01', 'Budi Santoso', 'Laki-laki', '082155566677', 'budi.prod@abita.com', '2023-06-01');


INSERT INTO produk (id_produk, nama_produk, kategori_produk, satuan_produk, stok_minimum)
VALUES 
    ('PRD01', 'Pinukuik Special', 'Makanan', 'Porsi', 5),
    ('PRD02', 'Pinukuik Original', 'Makanan', 'Porsi', 10);


INSERT INTO pesanan (no_pesanan, id_admin, id_pelanggan, tanggal_pesanan, status_pesanan)
VALUES 
    ('PSN01', 'ADM01', 'PLG01', '2026-06-06', 'Selesai');


INSERT INTO detail_pesanan (no_pesanan, id_produk, jumlah, harga_satuan, stok_produk_sebelum, stok_produk_sesudah)
VALUES 
    ('PSN01', 'PRD01', 2, 15000, 20, 18);


INSERT INTO pembayaran (id_pembayaran, id_admin, no_pesanan, metode_pembayaran, jumlah_bayar, tanggal_bayar, status_pembayaran)
VALUES 
    ('BYR01', 'ADM01', 'PSN01', 'Transfer', 30000, '2026-06-06', 'Lunas');


INSERT INTO produksi (id_produksi, no_pesanan, id_karyawan, status_produksi, tanggal_mulai_produksi, tanggal_selesai_produksi)
VALUES 
    ('PRD-K01', 'PSN01', 'KRY01', 'Selesai', '2026-06-06', '2026-06-06');


INSERT INTO penyerahan (id_penyerahan, id_admin, no_pesanan, metode_penyerahan, status_penyerahan, tanggal_penyerahan)
VALUES 
    ('SRH01', 'ADM01', 'PSN01', 'Ambil', 'Diambil', '2026-06-06');


INSERT INTO ulasan (id_ulasan, no_pesanan, rating, isi_ulasan, tanggal_ulasan)
VALUES 
    ('ULS01', 'PSN01', 5, 'Rasanya enak dan sangat mantap!', '2026-06-06');

SELECT 
    p.no_pesanan,
    pl.nama_pelanggan,
    a.nama_admin,
    p.tanggal_pesanan,
    p.status_pesanan
FROM pesanan p
JOIN pelanggan pl ON p.id_pelanggan = pl.id_pelanggan
JOIN admin a ON p.id_admin = a.id_admin;


SELECT 
    dp.no_pesanan,
    pr.nama_produk,
    dp.jumlah,
    dp.harga_satuan,
    (dp.jumlah * dp.harga_satuan) AS subtotal
FROM detail_pesanan dp
JOIN produk pr ON dp.id_produk = pr.id_produk;


SELECT 
    SUM(jumlah_bayar) AS total_pendapatan_kotor
FROM pembayaran
WHERE status_pembayaran = 'Lunas';