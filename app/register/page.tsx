"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { BrandLockup } from "@/app/components/brand-lockup";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          gender: formData.get("gender"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          street: formData.get("street"),
          streetNumber: formData.get("streetNumber"),
          city: formData.get("city"),
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Pendaftaran gagal.");
      router.replace("/menu");
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Pendaftaran gagal.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section aria-labelledby="register-title" className="panel register-card">
        <div className="register-brand">
          <Link aria-label="Kembali ke masuk" href="/">
            <BrandLockup />
          </Link>
        </div>
        <h1 className="page-title" id="register-title">
          Daftar Akun
        </h1>
        <form className="register-form" onSubmit={register}>
          <div className="form-field">
            <label className="field-label" htmlFor="full-name">
              Nama lengkap
            </label>
            <input className="text-input" id="full-name" name="name" maxLength={50} required />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="gender">
              Jenis kelamin
            </label>
            <select className="text-input" id="gender" name="gender" required>
              <option value="">Pilih jenis kelamin</option>
              <option>Laki-laki</option>
              <option>Perempuan</option>
            </select>
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="phone">
              No. telepon
            </label>
            <input
              className="text-input"
              id="phone"
              inputMode="tel"
              maxLength={16}
              name="phone"
              required
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="email">
              Email
            </label>
            <input
              className="text-input"
              id="email"
              maxLength={40}
              name="email"
              required
              type="email"
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="street">
              Nama jalan
            </label>
            <input className="text-input" id="street" maxLength={50} name="street" required />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="street-number">
              Nomor
            </label>
            <input className="text-input" id="street-number" maxLength={4} name="streetNumber" required />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="city">
              Kota
            </label>
            <input className="text-input" id="city" maxLength={15} name="city" required />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="new-username">
              Username
            </label>
            <input
              autoComplete="username"
              className="text-input"
              id="new-username"
              maxLength={50}
              name="username"
              required
            />
          </div>
          <div className="form-field register-form__password">
            <label className="field-label" htmlFor="new-password">
              Password
            </label>
            <input
              autoComplete="new-password"
              className="text-input"
              id="new-password"
              name="password"
              minLength={8}
              required
              type="password"
            />
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <div className="button-row register-form__actions">
            <button className="button button--primary" disabled={submitting} type="submit">
              {submitting ? "Mendaftarkan…" : "Daftar"}
            </button>
            <Link className="button button--outline" href="/">
              Batal
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
