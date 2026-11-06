"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function logout() {
    setError("");
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (!response.ok) {
      setError("Tidak dapat keluar. Silakan coba lagi.");
      return;
    }
    router.replace("/");
  }

  return (
    <>
      <button className="button button--outline logout-button" onClick={logout} type="button">
        Keluar
      </button>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </>
  );
}
