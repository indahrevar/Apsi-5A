"use client";

import { useEffect, useState } from "react";
import { formatRupiah, type MenuProduct } from "@/app/lib/demo-data";
import { StatusPill } from "@/app/components/ui";

export function OwnerProductsTable() {
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Menu tidak dapat dimuat.");
        setProducts(result);
      })
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : "Menu tidak dapat dimuat."),
      );
  }, []);

  return (
    <>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Nama Menu</th><th>Kategori</th><th>Satuan</th><th>Harga</th><th>Stok</th><th>Minimum</th></tr></thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td><td>{product.category}</td><td>{product.unit}</td><td>{formatRupiah(product.price)}</td>
                <td><StatusPill>{product.stock <= product.minimum ? `Menipis · ${product.stock}` : product.stock}</StatusPill></td><td>{product.minimum}</td>
              </tr>
            ))}
            {!products.length ? <tr><td colSpan={6}>Belum ada menu.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
