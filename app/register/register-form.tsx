"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const message =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Pendaftaran gagal.";
        throw new Error(message);
      }

      router.replace("/customer");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Pendaftaran gagal.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="mt-6" onSubmit={submit}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nama Lengkap" name="name" maxLength={50} />
        <label className="block text-xs text-[#666]">
          Jenis Kelamin
          <select
            className="mt-1.5 h-10 w-full rounded border border-[#ccc] bg-white px-3 text-sm text-[#303030]"
            name="gender"
            required
          >
            <option value="">Pilih jenis kelamin</option>
            <option value="Perempuan">Perempuan</option>
            <option value="Laki-laki">Laki-laki</option>
          </select>
        </label>
        <Field label="No. Telepon" name="phone" maxLength={16} type="tel" />
        <Field label="Email" name="email" maxLength={40} type="email" />
        <Field label="Nama Jalan" name="street" maxLength={50} />
        <Field label="Nomor Jalan" name="number" maxLength={4} />
        <Field label="Kota" name="city" maxLength={15} />
      </div>
      {error ? (
        <p className="mt-4 text-sm text-[#9a3333]" role="alert">
          {error}
        </p>
      ) : null}
      <p className="mt-5 rounded bg-[#f5f5f5] p-3 text-xs leading-5 text-[#666]">
        Pendaftaran demo menyimpan profil ke database dan langsung membuka sesi
        customer. Model database saat ini belum memiliki kolom kredensial akun,
        sehingga password tidak diminta atau disimpan.
      </p>
      <button
        className="mt-5 h-10 w-full rounded-full bg-[#303030] text-sm text-white disabled:cursor-wait disabled:opacity-70"
        disabled={busy}
        type="submit"
      >
        {busy ? "Menyimpan..." : "Daftar"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  maxLength,
  type = "text",
}: {
  label: string;
  name: string;
  maxLength: number;
  type?: string;
}) {
  return (
    <label className="block text-xs text-[#666]">
      {label}
      <input
        className="mt-1.5 h-10 w-full rounded border border-[#ccc] px-3 text-sm text-[#303030]"
        maxLength={maxLength}
        name={name}
        required
        type={type}
      />
    </label>
  );
}
