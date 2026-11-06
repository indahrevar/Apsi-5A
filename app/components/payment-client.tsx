"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { saveCart, useCart } from "@/app/lib/cart-store";
import { formatRupiah } from "@/app/lib/demo-data";
import type { MenuProduct } from "@/app/lib/demo-data";

export function PaymentClient() {
  const router = useRouter();
  const cart = useCart();
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("Transfer");
  const [deliveryMethod, setDeliveryMethod] = useState("Ambil di Tempat");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Menu tidak dapat dimuat.");
        if (active) setProducts(result);
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Menu tidak dapat dimuat.");
      });
    return () => { active = false; };
  }, []);

  const items = useMemo(
    () => products.filter((product) => (cart[product.id] ?? 0) > 0),
    [cart, products],
  );
  const total = items.reduce(
    (sum, product) => sum + product.price * cart[product.id],
    0,
  );

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) return;
    setError("");
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((product) => ({ productId: product.id, quantity: cart[product.id] })),
          paymentMethod: paymentMethod.startsWith("Tunai") ? "Tunai" : "Transfer",
          deliveryMethod,
          address: formData.get("deliveryAddress"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Pesanan tidak dapat dibuat.");
      setIsSubmitted(true);
      saveCart({});
      window.setTimeout(() => router.push("/pesanan"), 900);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Pesanan tidak dapat dibuat.");
    }
  }

  return (
    <form className="payment-layout" onSubmit={submitOrder}>
      <div className="payment-main">
        <section className="panel">
          <div className="panel__header">
            <h2>Ringkasan Pesanan</h2>
          </div>
          {items.length ? (
            <div className="table-scroll">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Menu</th>
                    <th>Jumlah</th>
                    <th>Harga satuan</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{cart[product.id]}</td>
                      <td>{formatRupiah(product.price)}</td>
                      <td>{formatRupiah(product.price * cart[product.id])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">
              Keranjang masih kosong. Pilih menu terlebih dahulu.
            </p>
          )}
          <p className="table-total">
            Total bayar <strong>{formatRupiah(total)}</strong>
          </p>
        </section>

        <section className="panel">
          <h2>Metode Penyerahan</h2>
          <div className="choice-row">
            {["Ambil di Tempat", "Diantar"].map((method) => (
              <label className="radio-choice" key={method}>
                <input
                  checked={deliveryMethod === method}
                  name="delivery"
                  onChange={() => setDeliveryMethod(method)}
                  type="radio"
                  value={method}
                />
                {method}
              </label>
            ))}
          </div>
          <p aria-live="polite" className="delivery-choice-confirmation" role="status">
            {deliveryMethod === "Diantar"
              ? "Pilihan diterima: pesanan akan diantar. Masukkan alamat pengantaran di bawah."
              : "Pilihan diterima: pesanan akan disiapkan untuk diambil di toko."}
          </p>
          {deliveryMethod === "Diantar" ? (
            <div className="form-field">
              <label className="field-label" htmlFor="delivery-address">
                Alamat pengantaran
              </label>
              <input
                className="text-input"
                id="delivery-address"
                maxLength={150}
                name="deliveryAddress"
                placeholder="Masukkan alamat lengkap"
                required
              />
            </div>
          ) : null}
        </section>
      </div>

      <aside className="panel payment-aside">
        <h2>Metode Pembayaran</h2>
        {["Transfer", "Tunai (bayar saat ambil)"].map((method) => (
          <label className="radio-choice" key={method}>
            <input
              checked={paymentMethod === method}
              name="payment"
              onChange={() => setPaymentMethod(method)}
              type="radio"
              value={method}
            />
            {method}
          </label>
        ))}
        {paymentMethod === "Transfer" ? (
          <>
            <div className="bank-details">
              <strong>Rekening Dapur Abita</strong>
              <span>Admin akan mengonfirmasi pembayaran setelah transfer diterima.</span>
            </div>
          </>
        ) : null}
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        {isSubmitted ? (
          <p className="form-success" role="status">
            Pesanan dibuat. Membuka daftar pesanan…
          </p>
        ) : null}
        <button
          className="button button--primary button--wide"
          disabled={!items.length || isSubmitted || products.length === 0}
          type="submit"
        >
          {isSubmitted ? "Pesanan dibuat" : "Konfirmasi & Bayar"}
        </button>
        <a className="button button--outline button--wide" href="/menu">
          Kembali ke Menu
        </a>
      </aside>
    </form>
  );
}
