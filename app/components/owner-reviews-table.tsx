"use client";

import { useEffect, useState } from "react";
import { PageTitle, StatusPill, StatCard } from "@/app/components/ui";

type Review = {
  id: string;
  customer: string;
  orderId: string;
  product: string;
  rating: number;
  content: string;
  date: string;
};

export function OwnerReviewsTable() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void fetch("/api/reviews", { cache: "no-store" })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Ulasan tidak dapat dimuat.");
        setReviews(result);
      })
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : "Ulasan tidak dapat dimuat."),
      );
  }, []);

  const average = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;
  const fiveStars = reviews.filter((review) => review.rating === 5).length;
  const lowRatings = reviews.filter((review) => review.rating <= 3).length;
  return (
    <>
      <PageTitle title="Ulasan Pelanggan" description="Masukan pelanggan tentang produk Dapur Abita." />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="owner-report-grid">
        <StatCard label="Rata-rata rating" value={`${average.toFixed(1)} / 5`} />
        <StatCard label="Jumlah ulasan" value={String(reviews.length)} />
        <StatCard label="Rating 5" value={String(fiveStars)} />
        <StatCard label="Rating 3 atau kurang" value={String(lowRatings)} />
      </div>
      <div className="table-scroll">
        <table className="data-table">
          <thead><tr><th>Tanggal</th><th>Pelanggan</th><th>Pesanan</th><th>Produk</th><th>Rating</th><th>Ulasan</th></tr></thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(review.date))}</td>
                <td>{review.customer}</td><td>{review.orderId}</td><td>{review.product}</td>
                <td><StatusPill>{review.rating} / 5</StatusPill></td><td>{review.content}</td>
              </tr>
            ))}
            {!reviews.length ? <tr><td colSpan={6}>Belum ada ulasan.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
