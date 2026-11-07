"use client";

import { useState } from "react";

export function ProductionControls({ id, initialStatus }: { id: string; initialStatus: string }) {
  const [status, setStatus] = useState(initialStatus);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  async function saveStatus(nextStatus: string) {
    setError("");
    const response = await fetch(`/api/production/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Status produksi tidak dapat diperbarui.");
      return;
    }
    setStatus(nextStatus);
    setSaved(true);
  }

  return (
    <div className="production-controls">
      <div aria-label="Status produksi" className="status-options">
        {(["Diterima", "Sedang dibuat", "Selesai"] as const).map((option) => (
          <label
            className={`status-option${status === option ? " is-selected" : ""}`}
            key={option}
          >
            <input
              checked={status === option}
              name="production-status"
              onChange={() => setStatus(option)}
              type="radio"
              value={option}
            />
            {option}
          </label>
        ))}
      </div>
      <button
        className="button button--primary button--wide"
        onClick={() => void saveStatus("Sedang dibuat")}
        type="button"
      >
        Mulai Produksi
      </button>
      <button
        className="button button--outline button--wide"
        onClick={() => void saveStatus("Selesai")}
        type="button"
      >
        Tandai Selesai
      </button>
      {saved ? (
        <p className="form-success" role="status">
          Status diperbarui: {status}.
        </p>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
