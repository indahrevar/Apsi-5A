import type { ReactNode } from "react";

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title-row">
      <div>
        <h1 className="page-title">{title}</h1>
        {description ? <p className="page-description">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`}>
      {title ? (
        <div className="panel__header">
          <h2>{title}</h2>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <article className="stat-card">
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
      {note ? <p className="stat-card__note">{note}</p> : null}
    </article>
  );
}

export function StatusPill({ children }: { children: ReactNode }) {
  const status = String(children).toLowerCase();
  const tone =
    status.includes("berhasil") ||
    status.includes("selesai") ||
    status.includes("diserahkan") ||
    status.includes("dikonfirmasi")
      ? "success"
      : status.includes("menunggu") || status.includes("diterima")
        ? "pending"
        : "neutral";

  return <span className={`status-pill status-pill--${tone}`}>{children}</span>;
}
