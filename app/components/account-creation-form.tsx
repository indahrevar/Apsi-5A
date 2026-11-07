"use client";

import { useState } from "react";

export function AccountCreationForm({ role }: { role: "ADMIN" | "KARYAWAN_PRODUKSI" }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setMessage("");
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Akun tidak dapat dibuat.");
      setMessage(`Akun ${role === "ADMIN" ? "Admin" : "Karyawan Produksi"} @${result.username} berhasil dibuat.`);
      formElement.reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Akun tidak dapat dibuat.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel inline-form account-form" onSubmit={submit}>
      <div className="form-field">
        <label className="field-label" htmlFor="account-name">Nama lengkap</label>
        <input autoComplete="name" className="text-input" id="account-name" maxLength={50} name="name" required />
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="account-gender">Jenis kelamin</label>
        <select className="text-input" id="account-gender" name="gender" required>
          <option value="">Pilih jenis kelamin</option>
          <option>Laki-laki</option>
          <option>Perempuan</option>
        </select>
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="account-phone">No. telepon</label>
        <input className="text-input" id="account-phone" maxLength={16} name="phone" required />
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="account-email">Email</label>
        <input className="text-input" id="account-email" maxLength={40} name="email" required type="email" />
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="account-username">Username</label>
        <input autoComplete="username" className="text-input" id="account-username" maxLength={50} minLength={3} name="username" required />
      </div>
      <div className="form-field">
        <label className="field-label" htmlFor="account-password">Password sementara</label>
        <input autoComplete="new-password" className="text-input" id="account-password" minLength={8} name="password" required type="password" />
      </div>
      {message ? <p className="form-success" role="status">{message}</p> : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      <button className="button button--primary" disabled={busy} type="submit">
        {busy ? "Menyimpan…" : "Buat Akun"}
      </button>
    </form>
  );
}
