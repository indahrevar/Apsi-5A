"use client";

import { useState } from "react";
import { formatRupiah } from "@/app/lib/demo-data";
import { Panel, StatCard } from "@/app/components/ui";

type Report = {
  summary: { orders: number; completed: number; handedOver: number; revenue: number; averageProductionDays: number };
  daily: Array<{ date: string; orders: number; completed: number; handedOver: number; revenue: number }>;
};

function monthRange(month: string) {
  if (!month) return { from: "", to: "" };
  const [year, value] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, value, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, "0")}` };
}

export function OwnerReportsClient() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateReport() {
    setLoading(true);
    setError("");
    try {
      const { from, to } = monthRange(month);
      const response = await fetch(`/api/reports?from=${from}&to=${to}`, { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Laporan tidak dapat dibuat.");
      setReport(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Laporan tidak dapat dibuat.");
    } finally {
      setLoading(false);
    }
  }

  async function loadPayments() {
    const response = await fetch("/api/payments", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? "Pembayaran tidak dapat dimuat.");
    return result as Array<{ id: string; orderId: string; method: string; amount: number; status: string; date: string }>;
  }

  return (
    <>
      <div className="toolbar">
        <label className="field-label" htmlFor="owner-period">Periode</label>
        <input className="text-input period-select" id="owner-period" onChange={(event) => setMonth(event.target.value)} type="month" value={month} />
        <button className="button button--primary" disabled={loading} onClick={() => void generateReport()} type="button">{loading ? "Membuat…" : "Buat Laporan"}</button>
        <button className="button button--outline" disabled={!report} onClick={() => window.print()} type="button">Cetak</button>
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {report ? (
        <>
          <div className="owner-report-grid">
            <StatCard label="Pesanan masuk" value={String(report.summary.orders)} />
            <StatCard label="Produksi selesai" value={String(report.summary.completed)} />
            <StatCard label="Pesanan diserahkan" value={String(report.summary.handedOver)} />
            <StatCard label="Pendapatan terkonfirmasi" value={formatRupiah(report.summary.revenue)} />
          </div>
          <p>Rata-rata waktu produksi: {report.summary.averageProductionDays.toFixed(1)} hari.</p>
          <Panel title="Ringkasan per tanggal pesanan">
            <div className="table-scroll">
              <table className="data-table">
                <thead><tr><th>Tanggal</th><th>Pesanan</th><th>Diproduksi</th><th>Diserahkan</th><th>Pendapatan</th></tr></thead>
                <tbody>
                  {report.daily.map((row) => (
                    <tr key={row.date}>
                      <td>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(`${row.date}T00:00:00Z`))}</td>
                      <td>{row.orders}</td><td>{row.completed}</td><td>{row.handedOver}</td><td>{formatRupiah(row.revenue)}</td>
                    </tr>
                  ))}
                  {!report.daily.length ? <tr><td colSpan={5}>Tidak ada data pada periode ini.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </Panel>
        </>
      ) : <p className="empty-state">Pilih periode dan buat laporan untuk melihat data.</p>}
      <OwnerPaymentTable loadPayments={loadPayments} />
      <OwnerHandoverTable />
    </>
  );
}

function OwnerPaymentTable({ loadPayments }: { loadPayments: () => Promise<Array<{ id: string; orderId: string; method: string; amount: number; status: string; date: string }>> }) {
  const [payments, setPayments] = useState<Array<{ id: string; orderId: string; method: string; amount: number; status: string; date: string }> | null>(null);
  const [error, setError] = useState("");
  async function showPayments() {
    setError("");
    try {
      setPayments(await loadPayments());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Pembayaran tidak dapat dimuat.");
    }
  }
  return (
    <Panel className="top-gap" title="Data Pembayaran">
      <div className="toolbar"><button className="button button--outline" onClick={() => void showPayments()} type="button">Lihat Pembayaran</button></div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {payments ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Pesanan</th><th>Metode</th><th>Jumlah</th><th>Status</th><th>Tanggal</th></tr></thead>
            <tbody>{payments.map((payment) => (
              <tr key={payment.id}><td>{payment.id}</td><td>{payment.orderId}</td><td>{payment.method}</td><td>{formatRupiah(payment.amount)}</td><td>{payment.status}</td><td>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(payment.date))}</td></tr>
            ))}</tbody>
          </table>
        </div>
      ) : null}
    </Panel>
  );
}

function OwnerHandoverTable() {
  const [records, setRecords] = useState<Array<{ id: string; orderId: string; customer: string; method: string; status: string; date: string }> | null>(null);
  const [error, setError] = useState("");
  async function load() {
    setError("");
    try {
      const response = await fetch("/api/handovers", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Penyerahan tidak dapat dimuat.");
      setRecords(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Penyerahan tidak dapat dimuat.");
    }
  }
  return (
    <Panel className="top-gap" title="Data Penyerahan">
      <div className="toolbar"><button className="button button--outline" onClick={() => void load()} type="button">Lihat Penyerahan</button></div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {records ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead><tr><th>Pesanan</th><th>Pelanggan</th><th>Metode</th><th>Status</th><th>Tanggal</th></tr></thead>
            <tbody>{records.map((record) => (
              <tr key={record.id}><td>{record.orderId}</td><td>{record.customer}</td><td>{record.method}</td><td>{record.status}</td><td>{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(record.date))}</td></tr>
            ))}</tbody>
          </table>
        </div>
      ) : null}
    </Panel>
  );
}
