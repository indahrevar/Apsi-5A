"use client";

import { useEffect, useState } from "react";

type Transaction = {
  id_transaksi: string;
  nama_barang: string;
  jumlah: number;
  harga_satuan: number;
  tanggal: string;
  kasir: string;
};

type TransactionResponse = {
  summary: {
    jumlahTransaksi: number;
    totalNilaiTransaksi: number;
  };
  transactions: Transaction[];
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
});

export default function TransaksiPage() {
  const [data, setData] = useState<TransactionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadTransactions() {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/transaksi", {
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
        if (controller.signal.aborted) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Terjadi kesalahan saat memuat transaksi.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadTransactions();

    return () => controller.abort();
  }, [reloadKey]);

  return (
    <main className="min-h-screen bg-[#fafafa] px-4 py-8 font-sans text-[#2b2b2b] sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header>
          <h1 className="m-0 text-2xl font-bold sm:text-3xl">Transaksi</h1>
          <p className="mt-2 text-sm text-[#6b6b6b]">
            Ringkasan dan daftar transaksi Dapur Abita.
          </p>
        </header>

        {error ? (
          <section
            className="rounded-lg border border-red-200 bg-white p-6"
            role="alert"
          >
            <p className="m-0 text-sm text-red-700">{error}</p>
            <button
              className="mt-4 rounded-full bg-[#2f2f2f] px-4 py-2 text-sm font-medium text-white"
              onClick={() => setReloadKey((key) => key + 1)}
              type="button"
            >
              Coba lagi
            </button>
          </section>
        ) : (
          <>
            <section
              aria-label="Ringkasan transaksi"
              className="grid gap-4 sm:grid-cols-2"
            >
              <article className="rounded-lg border border-[#e2e2e2] bg-white p-5">
                <h2 className="m-0 text-sm font-medium text-[#6b6b6b]">
                  Jumlah Transaksi
                </h2>
                <p className="mt-3 mb-0 text-2xl font-semibold">
                  {isLoading ? "Memuat..." : data?.summary.jumlahTransaksi ?? 0}
                </p>
              </article>
              <article className="rounded-lg border border-[#e2e2e2] bg-white p-5">
                <h2 className="m-0 text-sm font-medium text-[#6b6b6b]">
                  Total Nilai Transaksi
                </h2>
                <p className="mt-3 mb-0 text-2xl font-semibold">
                  {isLoading
                    ? "Memuat..."
                    : currencyFormatter.format(
                        data?.summary.totalNilaiTransaksi ?? 0,
                      )}
                </p>
              </article>
            </section>

            <section className="overflow-hidden rounded-lg border border-[#e2e2e2] bg-white">
              <div className="border-b border-[#e2e2e2] px-5 py-4">
                <h2 className="m-0 text-base font-semibold">
                  Daftar Transaksi
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-[#fafafa] text-xs text-[#6b6b6b]">
                    <tr>
                      <th className="px-5 py-3 font-medium">ID Transaksi</th>
                      <th className="px-5 py-3 font-medium">Nama Barang</th>
                      <th className="px-5 py-3 font-medium">Jumlah</th>
                      <th className="px-5 py-3 font-medium">Harga Satuan</th>
                      <th className="px-5 py-3 font-medium">Tanggal</th>
                      <th className="px-5 py-3 font-medium">Kasir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td
                          className="px-5 py-8 text-center text-[#6b6b6b]"
                          colSpan={6}
                        >
                          Memuat transaksi...
                        </td>
                      </tr>
                    ) : data?.transactions.length ? (
                      data.transactions.map((transaction) => (
                        <tr
                          className="border-t border-[#eee]"
                          key={transaction.id_transaksi}
                        >
                          <td className="px-5 py-4 font-medium">
                            {transaction.id_transaksi}
                          </td>
                          <td className="px-5 py-4">
                            {transaction.nama_barang}
                          </td>
                          <td className="px-5 py-4">{transaction.jumlah}</td>
                          <td className="px-5 py-4">
                            {currencyFormatter.format(
                              transaction.harga_satuan,
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {dateFormatter.format(
                              new Date(transaction.tanggal),
                            )}
                          </td>
                          <td className="px-5 py-4">{transaction.kasir}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-5 py-8 text-center text-[#6b6b6b]"
                          colSpan={6}
                        >
                          Belum ada transaksi.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
