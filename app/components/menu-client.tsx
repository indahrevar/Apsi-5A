"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { saveCart, saveOrderNote, useCart, useOrderNote } from "@/app/lib/cart-store";
import { formatRupiah } from "@/app/lib/demo-data";
import { pinukuikImageUrl } from "@/app/lib/product-image";
import type { MenuProduct } from "@/app/lib/demo-data";

export function MenuClient() {
  const [products, setProducts] = useState<MenuProduct[]>([]);
  const [loadError, setLoadError] = useState("");
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");
  const quantities = useCart();
  const orderNote = useOrderNote();
  useEffect(() => {
    let active = true;
    void fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Menu tidak dapat dimuat.");
        if (active) setProducts(result);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(error instanceof Error ? error.message : "Menu tidak dapat dimuat.");
      });
    return () => { active = false; };
  }, []);
  const filtered = useMemo(
    () =>
      products.filter(
        (product) =>
          (category === "Semua" || product.category === category) &&
          product.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [category, products, query],
  );
  const categories = useMemo(
    () => ["Semua", ...new Set(products.map((product) => product.category))],
    [products],
  );
  const cartCount = Object.values(quantities).reduce(
    (total, quantity) => total + quantity,
    0,
  );
  const cartTotal = products.reduce(
    (total, product) =>
      total + product.price * (quantities[product.id] ?? 0),
    0,
  );

  function updateQuantity(productId: string, delta: number) {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    const maximum = Math.min(product.stock, 100);
    const quantity = quantities[productId] ?? 0;
    if (delta > 0 && quantity >= maximum) return;
    const next = {
      ...quantities,
      [productId]: delta > 0
        ? Math.min(maximum, quantity + delta)
        : Math.max(0, quantity + delta),
    };
    if (next[productId] === 0) delete next[productId];
    saveCart(next);
  }

  return (
    <div className="menu-layout">
      <div className="menu-catalog">
        <div className="catalog-controls">
          <label className="sr-only" htmlFor="menu-search">
            Cari menu
          </label>
          <input
            className="text-input catalog-search"
            id="menu-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Cari menu"
            type="search"
            value={query}
          />
          <div aria-label="Filter kategori" className="filter-list">
            {categories.map((option) => (
              <button
                aria-pressed={category === option}
                className={`button button--filter${category === option ? " is-selected" : ""}`}
                key={option}
                onClick={() => setCategory(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {loadError ? <p className="form-error" role="alert">{loadError}</p> : null}
        <div className="product-grid">
          {filtered.map((product) => (
            <article className="product-card" key={product.id}>
              <div className="product-card__image">
                <Image
                  alt={product.name}
                  fill
                  sizes="(max-width: 700px) 90vw, (max-width: 1100px) 42vw, 260px"
                  src={product.image}
                  unoptimized={product.image === pinukuikImageUrl}
                />
              </div>
              <div className="product-card__body">
                <div>
                  <h2>{product.name}</h2>
                  <p className="product-card__price">{formatRupiah(product.price)}</p>
                  <span className="category-tag">{product.category}</span>
                  <small>{product.stock > 0 ? `Stok: ${product.stock}` : "Stok habis"}</small>
                </div>
                <div className="product-card__actions">
                  <div aria-label={`Jumlah ${product.name}`} className="stepper">
                    <button
                      aria-label={`Kurangi ${product.name}`}
                      onClick={() => updateQuantity(product.id, -1)}
                      type="button"
                    >
                      −
                    </button>
                    <span>{quantities[product.id] ?? 0}</span>
                    <button
                      aria-label={`Tambah ${product.name}`}
                      disabled={(quantities[product.id] ?? 0) >= Math.min(product.stock, 100)}
                      onClick={() => updateQuantity(product.id, 1)}
                      type="button"
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="button button--primary button--small"
                    disabled={(quantities[product.id] ?? 0) >= Math.min(product.stock, 100)}
                    onClick={() => updateQuantity(product.id, 1)}
                    type="button"
                  >
                    Tambah
                  </button>
                </div>
              </div>
            </article>
          ))}
          {!loadError && filtered.length === 0 ? (
            <p className="empty-state">Menu tidak ditemukan. Coba kata lain.</p>
          ) : null}
        </div>
      </div>
      <aside className="panel cart-panel">
        <h2>Keranjang Pesanan</h2>
        {cartCount ? (
          <ul className="cart-list">
            {products
              .filter((product) => quantities[product.id])
              .map((product) => (
                <li key={product.id}>
                  <span>
                    {product.name} <small>× {quantities[product.id]}</small>
                  </span>
                  <strong>
                    {formatRupiah(product.price * quantities[product.id])}
                  </strong>
                </li>
              ))}
          </ul>
        ) : (
          <p className="cart-empty">Belum ada menu yang dipilih.</p>
        )}
        <div className="cart-total">
          <span>Total</span>
          <strong>{formatRupiah(cartTotal)}</strong>
        </div>
        <label className="field-label" htmlFor="order-note">
          Catatan pesanan
        </label>
        <textarea
          className="text-input"
          id="order-note"
          maxLength={500}
          onChange={(event) => saveOrderNote(event.target.value)}
          placeholder="Contoh: tulisan selamat ulang tahun"
          rows={3}
          value={orderNote}
        />
        <Link
          aria-disabled={!cartCount}
          className={`button button--primary button--wide${cartCount ? "" : " is-disabled"}`}
          href={cartCount ? "/pembayaran" : "#"}
          onClick={(event) => {
            if (!cartCount) event.preventDefault();
          }}
        >
          Lanjut ke Pembayaran
        </Link>
      </aside>
    </div>
  );
}
