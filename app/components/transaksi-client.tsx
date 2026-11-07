"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTitle, Panel, StatCard, StatusPill } from "@/app/components/ui";
import { WeeklyRevenueChart } from "@/app/components/weekly-revenue-chart";
import { formatRupiah } from "@/app/lib/demo-data";
import { useClientDate } from "@/app/lib/use-client-date";

type Transaction = {
  id_transaksi: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  tanggal: string;
  metode_pembayaran: string;
  kasir: string;
};

type TransactionResponse = {
  summary: {
    jumlahTransaksi: number;
    totalNilaiTransaksi: number;
    totalTransfer: number;
    totalTunai: number;
  };
  transactions: Transaction[];
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

export default function TransaksiClient() {
  const [data, setData] = useState<TransactionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const today = useClientDate();
  const period = selectedPeriod ?? today.slice(0, 7);

  useEffect(() => {
    if (!period) return;
    const controller = new AbortController();

    async function loadTransactions() {
      setIsLoading(true);
      setError(null);

      try {
        const [year, month] = period.split("-").map(Number);
        const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const from = `${period}-01`;
        const to = `${period}-${String(lastDay).padStart(2, "0")}`;
        const response = await fetch(`/api/transaksi?from=${from}&to=${to}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        const result = (await response.json()) as
          | TransactionResponse
          | { error?: string };

        if (!response.ok) {
          throw new Error(
            "error" in result && result.error
              ? result.error
              : "Tidak dapat memuat transaksi.",
          );
        }

        setData(result as TransactionResponse);
      } catch (loadError) {
        if (controller.signal.aborted) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Terjadi kesalahan saat memuat transaksi.",
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadTransactions();
    return () => controller.abort();
  }, [period, reloadKey]);

  const dailySales = useMemo(() => {
    const grouped = new Map<string, number>();
    for (const transaction of data?.transactions ?? []) {
      const date = transaction.tanggal.slice(0, 10);
      grouped.set(
        date,
        (grouped.get(date) ?? 0) +
          transaction.jumlah * transaction.harga_satuan,
      );
    }
    return [...grouped.entries()]
      .sort(([first], [second]) => first.localeCompare(second))
      .map(([date, revenue]) => ({ date, revenue }));
  }, [data]);

  return (
    <>
      <PageTitle title="Data Transaksi & Penjualan" />
      <div className="toolbar">
        <label className="field-label" htmlFor="transaction-period">
          Periode
        </label>
        <input className="text-input period-select" id="transaction-period" onChange={(event) => setSelectedPeriod(event.target.value)} type="month" value={period} />
        <button className="button button--outline" onClick={() => window.print()} type="button">Cetak</button>
      </div>
      {error ? (
        <section className="panel" role="alert">
          <p>{error}</p>
          <button
            className="button button--primary"
            onClick={() => setReloadKey((key) => key + 1)}
            type="button"
          >
            Coba lagi
          </button>
        </section>
      ) : (
        <>
          <div className="stat-grid">
            <StatCard
              label="Total penjualan"
              value={
                isLoading
                  ? "Memuat…"
                  : formatRupiah(data?.summary.totalNilaiTransaksi ?? 0)
              }
            />
            <StatCard
              label="Jumlah transaksi"
              value={isLoading ? "Memuat…" : String(data?.summary.jumlahTransaksi ?? 0)}
            />
            <StatCard
              label="Transfer"
              value={
                isLoading
                  ? "Memuat…"
                  : formatRupiah(data?.summary.totalTransfer ?? 0)
              }
            />
            <StatCard
              label="Tunai"
              value={
                isLoading ? "Memuat…" : formatRupiah(data?.summary.totalTunai ?? 0)
              }
            />
          </div>
          <div className="sales-grid">
            <WeeklyRevenueChart daily={dailySales} month={period} />
            <Panel title="Transaksi terbaru">
              <div className="table-scroll">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Pesanan</th>
                      <th>Metode</th>
                      <th>Jumlah</th>
                      <th>Tanggal</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={6}>Memuat transaksi…</td>
                      </tr>
                    ) : data?.transactions.length ? (
                      data.transactions.map((transaction) => (
                        <tr key={transaction.id_transaksi}>
                          <td>{transaction.id_transaksi}</td>
                          <td>{transaction.nama_barang}</td>
                          <td>{transaction.metode_pembayaran}</td>
                          <td>
                            {formatRupiah(
                              transaction.jumlah * transaction.harga_satuan,
                            )}
                          </td>
                          <td>{dateFormatter.format(new Date(transaction.tanggal))}</td>
                          <td>
                            <StatusPill>Berhasil</StatusPill>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6}>Belum ada transaksi.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        </>
      )}
    </>
  );
}
