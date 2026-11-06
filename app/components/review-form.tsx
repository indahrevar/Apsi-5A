"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Panel } from "@/app/components/ui";

type Order = { id: string; items: string; status: string };
type Review = { id: string; orderId: string; product: string; rating: number; content: string; date: string };

export function ReviewForm() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orderId, setOrderId] = useState("");
  const [rating, setRating] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  async function fetchData() {
    const [orderResponse, reviewResponse] = await Promise.all([
      fetch("/api/orders", { cache: "no-store" }),
      fetch("/api/reviews", { cache: "no-store" }),
    ]);
    const [orderResult, reviewResult] = await Promise.all([orderResponse.json(), reviewResponse.json()]);
    if (!orderResponse.ok) throw new Error(orderResult.error ?? "Pesanan tidak dapat dimuat.");
    if (!reviewResponse.ok) throw new Error(reviewResult.error ?? "Ulasan tidak dapat dimuat.");
    return { orders: orderResult as Order[], reviews: reviewResult as Review[] };
  }

  async function load() {
    const data = await fetchData();
    const orderResult = data.orders;
    const reviewResult = data.reviews;
    setOrders(orderResult);
    setReviews(reviewResult);
    const reviewedIds = new Set(reviewResult.map((review: Review) => review.orderId));
    const eligible = orderResult.filter((order: Order) => order.status === "Selesai" && !reviewedIds.has(order.id));
    if (!orderId && eligible.length) {
      const requestedOrder = new URLSearchParams(window.location.search).get("order");
      setOrderId(eligible.find((order: Order) => order.id === requestedOrder)?.id ?? eligible[0].id);
    }
  }

  useEffect(() => {
    let active = true;
    void fetchData()
      .then(({ orders: loadedOrders, reviews: loadedReviews }) => {
        if (!active) return;
        setOrders(loadedOrders);
        setReviews(loadedReviews);
        const reviewedIds = new Set(loadedReviews.map((review) => review.orderId));
        const eligibleOrders = loadedOrders.filter((order) => order.status === "Selesai" && !reviewedIds.has(order.id));
        const requestedOrder = new URLSearchParams(window.location.search).get("order");
        setOrderId(eligibleOrders.find((order) => order.id === requestedOrder)?.id ?? eligibleOrders[0]?.id ?? "");
      })
      .catch((loadError: unknown) =>
        setError(loadError instanceof Error ? loadError.message : "Data ulasan tidak dapat dimuat."),
      );
    return () => { active = false; };
  }, []);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, rating, content: form.get("review") }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Ulasan tidak dapat dikirim.");
      return;
    }
    setSuccess("Terima kasih, ulasan Anda sudah dikirim.");
    setRating(0);
    await load();
  }

  async function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: form.get("feedback") }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Kritik dan saran tidak dapat dikirim.");
      return;
    }
    setFeedbackMessage("Kritik dan saran berhasil dikirim.");
    event.currentTarget.reset();
  }

  const reviewedIds = new Set(reviews.map((review) => review.orderId));
  const eligible = orders.filter((order) => order.status === "Selesai" && !reviewedIds.has(order.id));

  return (
    <div className="review-layout">
      <div className="stack">
        <form className="panel review-form" onSubmit={submitReview}>
          <h2>Ulasan Pesanan Selesai</h2>
          <div className="form-field">
            <label className="field-label" htmlFor="review-order">Pesanan yang diulas</label>
            <select className="text-input" id="review-order" onChange={(event) => setOrderId(event.target.value)} required value={orderId}>
              <option value="">Pilih pesanan selesai</option>
              {eligible.map((order) => <option key={order.id} value={order.id}>{order.id} · {order.items}</option>)}
            </select>
          </div>
          <fieldset className="rating-field">
            <legend className="field-label">Rating</legend>
            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <button aria-label={`${star} dari 5 bintang`} aria-pressed={rating === star} className={star <= rating ? "is-selected" : ""} key={star} onClick={() => setRating(star)} type="button">★</button>
              ))}
            </div>
          </fieldset>
          <div className="form-field">
            <label className="field-label" htmlFor="review-content">Isi ulasan</label>
            <textarea className="text-input" id="review-content" maxLength={255} name="review" placeholder="Ceritakan pengalaman Anda" required rows={4} />
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {success ? <p className="form-success" role="status">{success}</p> : null}
          <button className="button button--primary" disabled={!eligible.length || !rating} type="submit">Kirim Ulasan</button>
        </form>

        <form className="panel review-form" onSubmit={submitFeedback}>
          <h2>Kritik dan Saran</h2>
          <div className="form-field">
            <label className="field-label" htmlFor="feedback-content">Masukan untuk Dapur Abita</label>
            <textarea className="text-input" id="feedback-content" maxLength={500} name="feedback" required rows={4} />
          </div>
          {feedbackMessage ? <p className="form-success" role="status">{feedbackMessage}</p> : null}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="button button--primary" type="submit">Kirim Kritik dan Saran</button>
        </form>
      </div>
      <Panel title="Ulasan Saya">
        {reviews.length ? reviews.map((review) => (
          <article className="review-card" key={review.id}>
            <div className="review-card__meta"><span>{review.product} · {review.orderId}</span><span aria-label={`${review.rating} dari 5 bintang`}>{"★".repeat(review.rating)}</span></div>
            <p>{review.content}</p>
            <p>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(review.date))}</p>
          </article>
        )) : <p className="empty-state">Belum ada ulasan dari akun ini.</p>}
      </Panel>
    </div>
  );
}
