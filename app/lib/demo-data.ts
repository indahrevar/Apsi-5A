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

export const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
