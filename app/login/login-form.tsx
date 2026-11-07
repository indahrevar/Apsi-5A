"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const staffRoles = [
  { role: "admin", label: "Admin", username: "admin", password: "admin123" },
  {
    role: "production",
    label: "Produksi",
    username: "produksi",
    password: "produksi123",
  },
  { role: "owner", label: "Owner", username: "owner", password: "owner123" },
] as const;

const customerAccount = { username: "rizky", password: "rizky123" };

export default function LoginForm() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<
    "customer" | "admin" | "production" | "owner"
  >("customer");
  const [username, setUsername] = useState(customerAccount.username);
  const [password, setPassword] = useState(customerAccount.password);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function resetToCustomer() {
    setSelectedRole("customer");
    setUsername(customerAccount.username);
    setPassword(customerAccount.password);
    setMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, role: selectedRole }),
      });
      const result: unknown = await response.json();
      if (!response.ok) {
        const error =
          result &&
          typeof result === "object" &&
          "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "Login gagal.";
        throw new Error(error);
      }

      const destination =
        selectedRole === "production" ? "/produksi" : `/${selectedRole}`;
      router.replace(destination);
      router.refresh();
    } catch (loginError) {
      setMessage(
        loginError instanceof Error ? loginError.message : "Login gagal.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRecoveryClick() {
    setMessage("Pemulihan password belum tersedia.");
  }

  return (
    <section data-bakery-theme="login" className="relative w-full max-w-[420px] rounded-[5px] border border-[#bdbdbd] bg-white px-8 pb-8 pt-8">
      <Link
        href="/"
        aria-label="Kembali ke beranda"
        className="absolute left-1 top-1 flex size-6 items-center justify-center"
        onClick={resetToCustomer}
      >
        <Image
          src="/login-back-arrow.png"
          alt=""
          width={20}
          height={20}
          priority
        />
      </Link>

      <div className="flex flex-col items-center">
        <Image
          src="/login-logo.svg"
          alt=""
          width={48}
          height={26}
          priority
        />
        <h1 className="mt-4 text-[22px] font-bold leading-7">Masuk</h1>
      </div>

      <form className="mt-3" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="username"
            className="mb-1 block text-[13px] leading-5 text-[#666]"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Masukkan username"
            value={username}
            onChange={(event) => setUsername(event.currentTarget.value)}
            required
            className="h-9 w-full rounded-[5px] border border-[#bdbdbd] px-3 text-sm text-[#303030] outline-none transition focus:border-[#555] focus:ring-2 focus:ring-[#303030]/10"
          />
        </div>

        <div className="mt-4">
          <label
            htmlFor="password"
            className="mb-1 block text-[13px] leading-5 text-[#666]"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Masukkan password"
            value={password}
            onChange={(event) => setPassword(event.currentTarget.value)}
            required
            className="h-9 w-full rounded-[5px] border border-[#bdbdbd] px-3 text-sm text-[#303030] outline-none transition focus:border-[#555] focus:ring-2 focus:ring-[#303030]/10"
          />
          <div className="mt-1 text-right">
            <a
              href="#recovery-password"
              onClick={handleRecoveryClick}
              className="text-xs text-[#666] underline-offset-2 hover:text-[#303030] hover:underline"
            >
              Recovery Password
            </a>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-4 h-[34px] w-full rounded-full bg-[#303030] text-[13px] text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#303030] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? "Memeriksa..." : "Masuk"}
        </button>

        <div className="mt-4 flex items-center justify-end gap-2 text-[13px]">
          <span aria-hidden="true" className="h-[6px] w-[110px] rounded-full bg-[#e1e1e1]" />
          <Link
            href="/register"
            className="font-medium text-[#303030] hover:underline"
          >
            Daftar
          </Link>
        </div>
      </form>

      <div className="mt-4 border-t border-[#dedede] pt-4">
        <p className="text-center text-xs text-[#777]">Log In Sebagai</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {staffRoles.map((item) => {
            const isSelected = selectedRole === item.role;

            return (
              <button
                key={item.role}
                type="button"
                aria-pressed={isSelected}
                onClick={() => {
                  if (isSelected) {
                    resetToCustomer();
                  } else {
                    setSelectedRole(item.role);
                    setUsername(item.username);
                    setPassword(item.password);
                  }
                  setMessage("");
                }}
                className={`rounded-full border px-[15px] py-[5px] text-[11px] leading-4 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#303030] ${
                  isSelected
                    ? "border-[#303030] bg-[#303030] text-white"
                    : "border-[#999] bg-white text-[#303030] hover:border-[#303030]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <p
        id="recovery-password"
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-4 text-center text-xs ${
          message ? "text-[#555]" : "text-transparent"
        }`}
      >
        {message || `Masuk sebagai ${selectedRole === "production" ? "Produksi" : selectedRole}.`}
      </p>
      {process.env.NODE_ENV !== "production" ? (
        <p className="mt-2 text-center text-[10px] leading-4 text-[#888]">
          Akun demo · customer: rizky / rizky123
          <br />
          admin: admin / admin123 · produksi: produksi / produksi123 · owner:
          owner / owner123
        </p>
      ) : null}
    </section>
  );
}
