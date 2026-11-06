"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PageTitle, Panel, StatCard, StatusPill } from "@/app/components/ui";
import { formatRupiah } from "@/app/lib/demo-data";

type Summary = { orders: number; completed: number; handedOver: number; revenue: number };
type Review = { id: string; customer: string; rating: number; content: string };

export function OwnerDashboardClient() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    void Promise.all([
      fetch("/api/reports", { cache: "no-store" }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Ringkasan tidak dapat dimuat.");
        setSummary(result.summary);
      }),
      fetch("/api/reviews", { cache: "no-store" }).then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Ulasan tidak dapat dimuat.");
        setReviews(result.slice(0, 2));
      }),
    ]).catch((loadError: unknown) =>
      setError(loadError instanceof Error ? loadError.message : "Ringkasan tidak dapat dimuat."),
    );
  }, []);

  return (
    <>
      <PageTitle title="Dashboard Owner" action={<Link className="button button--outline" href="/owner/laporan">Lihat Laporan</Link>} />
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <div className="stat-grid">
        <StatCard label="Pendapatan terkonfirmasi" value={summary ? formatRupiah(summary.revenue) : "Memuat…"} />
        <StatCard label="Total pesanan" value={summary ? String(summary.orders) : "Memuat…"} />
        <StatCard label="Produksi selesai" value={summary ? String(summary.completed) : "Memuat…"} />
        <StatCard label="Pesanan diserahkan" value={summary ? String(summary.handedOver) : "Memuat…"} />
      </div>
      <div className="section-grid">
        <Panel title="Ringkasan Laporan">
          <p>Data dihitung langsung dari pesanan, pembayaran, produksi, dan penyerahan.</p>
          <Link className="button button--outline" href="/owner/laporan">Buat atau cetak laporan</Link>
        </Panel>
        <Panel action={<Link className="text-link" href="/owner/ulasan">Lihat semua</Link>} title="Ulasan Terbaru">
          {reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-card__meta"><span>{review.customer}</span><StatusPill>{review.rating} / 5</StatusPill></div>
              <p>{review.content}</p>
            </div>
          ))}
          {!reviews.length ? <p className="empty-state">Belum ada ulasan.</p> : null}
        </Panel>
      </div>
    </>
  );
}
