"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    gender: "Laki-laki",
    phone: "",
    email: "",
    street: "",
    streetNumber: "",
    city: "",
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Pendaftaran gagal.");
      }

      router.push("/menu");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-4 py-8 font-sans text-[#303030]">
      <section className="w-full max-w-[460px] rounded-[8px] border border-[#e0e0e0] bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold">Daftar Akun</h1>
        <p className="mt-1 text-center text-sm text-[#666]">
          Lengkapi data diri untuk membuat akun pelanggan Dapur Abita.
        </p>

        {error && (
          <div className="mt-4 rounded bg-red-50 p-3 text-center text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 text-sm">
          <div>
            <label className="block text-xs font-semibold mb-1">Nama Lengkap</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex gap-3">
            <div className="w-1/2">
              <label className="block text-xs font-semibold mb-1">Jenis Kelamin</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full rounded border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-black"
              >
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
            <div className="w-1/2">
              <label className="block text-xs font-semibold mb-1">No. Telepon</label>
              <input
                type="text"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1">Nama Jalan</label>
              <input
                type="text"
                required
                value={form.street}
                onChange={(e) => setForm({ ...form, street: e.target.value })}
                className="w-full rounded border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
            <div className="w-20">
              <label className="block text-xs font-semibold mb-1">No. Rumah</label>
              <input
                type="text"
                required
                value={form.streetNumber}
                onChange={(e) => setForm({ ...form, streetNumber: e.target.value })}
                className="w-full rounded border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Kota</label>
            <input
              type="text"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full rounded border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <hr className="my-2 border-t border-[#eee]" />

          <div>
            <label className="block text-xs font-semibold mb-1">Username</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full rounded border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="Min. 8 karakter (huruf & angka)"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded border border-[#ccc] px-3 py-2 text-sm focus:outline-none focus:border-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 h-10 w-full rounded bg-[#303030] font-medium text-white transition hover:bg-black disabled:opacity-50"
          >
            {loading ? "Memproses..." : "Daftar"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-[#666]">
          Sudah punya akun?{" "}
          <Link href="/login" className="font-semibold text-black underline">
            Masuk di sini
          </Link>
        </p>
      </section>
    </main>
  );
}