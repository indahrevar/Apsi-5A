export type MenuProduct = {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  minimum: number;
  image: string;
};

export type CustomerOrder = {
  id: string;
  customer: string;
  items: string;
  total: number;
  method: string;
  payment: string;
  status: string;
  delivery: string;
  date: string;
};

export const menuProducts: MenuProduct[] = [
  {
    id: "PR01",
    name: "Brownies Kukus",
    category: "Kue Basah",
    unit: "pcs",
    price: 35000,
    stock: 277,
    minimum: 20,
    image: "/figma/menu-brownies.jpg",
  },
  {
    id: "PR02",
    name: "Bolu Gulung",
    category: "Kue Basah",
    unit: "roll",
    price: 45000,
    stock: 117,
    minimum: 10,
    image: "/figma/menu-bolu.jpg",
  },
  {
    id: "PR03",
    name: "Risoles Ragout",
    category: "Makanan Ringan",
    unit: "pcs",
    price: 5000,
    stock: 45,
    minimum: 50,
    image: "/figma/menu-risol.jpg",
  },
  {
    id: "PR04",
    name: "Pastel Isi",
    category: "Makanan Ringan",
    unit: "pcs",
    price: 6000,
    stock: 300,
    minimum: 30,
    image: "/figma/menu-pastel.jpg",
  },
  {
    id: "PR05",
    name: "Lapis Surabaya",
    category: "Kue Basah",
    unit: "loyang",
    price: 72000,
    stock: 40,
    minimum: 5,
    image: "/figma/menu-lapis.jpg",
  },
];

export const orders: CustomerOrder[] = [
  {
    id: "DA-004",
    customer: "Mawar Sejahtera",
    items: "Brownies Kukus, Bolu Gulung",
    total: 85000,
    method: "Transfer",
    payment: "Menunggu",
    status: "Diterima",
    delivery: "Diambil",
    date: "06 Nov 2026",
  },
  {
    id: "DA-003",
    customer: "Rina Marlina",
    items: "Lapis Surabaya, Pastel Isi",
    total: 90000,
    method: "Transfer",
    payment: "Dikonfirmasi",
    status: "Sedang dibuat",
    delivery: "Diantar",
    date: "06 Nov 2026",
  },
  {
    id: "DA-002",
    customer: "Andi Pratama",
    items: "Brownies Kukus",
    total: 95000,
    method: "Transfer",
    payment: "Dikonfirmasi",
    status: "Selesai",
    delivery: "Diambil",
    date: "05 Nov 2026",
  },
  {
    id: "DA-001",
    customer: "Siti Rahma",
    items: "Bolu Gulung, Risoles Ragout",
    total: 115000,
    method: "Tunai",
    payment: "Berhasil",
    status: "Selesai",
    delivery: "Diserahkan",
    date: "05 Nov 2026",
  },
];

export const customerReviews = [
  {
    id: "UL-014",
    order: "DA-002",
    customer: "Siti Rahma",
    product: "Brownies Kukus",
    rating: 5,
    date: "06 Nov 2026",
    content: "Rasanya enak dan sangat mantap!",
  },
  {
    id: "UL-013",
    order: "DA-001",
    customer: "Rina Marlina",
    product: "Bolu Gulung",
    rating: 4,
    date: "05 Nov 2026",
    content: "Lembut, tidak terlalu manis. Kemasannya juga rapi.",
  },
  {
    id: "UL-012",
    order: "DA-001",
    customer: "Andi Pratama",
    product: "Risoles Ragout",
    rating: 5,
    date: "04 Nov 2026",
    content: "Pesanan sesuai dan tepat waktu.",
  },
  {
    id: "UL-011",
    order: "DA-003",
    customer: "Mawar Sejahtera",
    product: "Brownies Kukus",
    rating: 3,
    date: "03 Nov 2026",
    content: "Pengantaran terlambat.",
  },
  {
    id: "UL-010",
    order: "DA-004",
    customer: "Siti Rahma",
    product: "Pastel Isi",
    rating: 5,
    date: "02 Nov 2026",
    content: "Rasa enak dan kemasan rapi.",
  },
];

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
