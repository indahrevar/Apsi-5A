"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { FormEvent } from "react";
import { BrandLockup } from "@/app/components/brand-lockup";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Gagal masuk.");
      const destinations: Record<string, string> = {
        ADMIN: "/admin",
        CUSTOMER: "/menu",
        KARYAWAN_PRODUKSI: "/produksi",
        OWNER: "/owner",
      };
      router.replace(destinations[result.role] ?? "/");
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Gagal masuk.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section aria-labelledby="login-title" className="login-card">
        <Link
          aria-label="Kembali ke beranda Dapur Abita"
          className="login-card__back"
          href="/beranda"
        >
          <Image
            alt=""
            height={30}
            src="/login-back-arrow.png"
            width={30}
          />
        </Link>
        <BrandLockup className="brand-lockup--auth" />
        <h1 id="login-title">Masuk</h1>
        <form className="login-fields" onSubmit={signIn}>
          <div className="form-field">
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <input
              autoComplete="username"
              className="text-input"
              id="username"
              name="username"
              placeholder="Masukkan username"
              required
            />
          </div>
          <div className="form-field">
            <label className="field-label" htmlFor="password">
              Password
            </label>
            <input
              autoComplete="current-password"
              className="text-input"
              id="password"
              name="password"
              placeholder="Masukkan password"
              required
              type="password"
            />
          </div>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          <button className="button button--primary login-submit" disabled={submitting} type="submit">
            {submitting ? "Memeriksa…" : "Masuk"}
          </button>
        </form>
        <div className="login-card__register">
          <span>Belum memiliki akun?</span>
          <Link href="/register">Daftar</Link>
        </div>
        <Link className="login-home-link" href="/beranda">
          Lihat beranda Dapur Abita
        </Link>
      </section>
    </main>
  );
}
