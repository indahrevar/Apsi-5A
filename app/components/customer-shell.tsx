import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { LogoutButton } from "@/app/components/logout-button";
import { BrandLockup } from "@/app/components/brand-lockup";

const links = [
  { href: "/menu", label: "Menu & Pesan" },
  { href: "/pembayaran", label: "Pembayaran" },
  { href: "/pesanan", label: "Pesanan Saya" },
  { href: "/ulasan", label: "Kritik & Saran" },
];

export function CustomerShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<main className="customer-main"><p className="panel">Memuat akun…</p></main>}>
      <AuthenticatedCustomerShell active={active}>{children}</AuthenticatedCustomerShell>
    </Suspense>
  );
}

async function AuthenticatedCustomerShell({
  active,
  children,
}: {
  active: string;
  children: ReactNode;
}) {
  const user = await requireRole("CUSTOMER");
  return (
    <div className="customer-layout">
      <header className="customer-header">
        <Link aria-label="Dapur Abita" className="customer-brand" href="/menu">
          <BrandLockup />
        </Link>
        <nav aria-label="Navigasi pelanggan" className="customer-nav">
          {links.map((link) => (
            <Link
              aria-current={active === link.href ? "page" : undefined}
              className={active === link.href ? "is-active" : ""}
              href={link.href}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <span className="customer-user">{user.name}</span>
        <LogoutButton />
      </header>
      <main className="customer-main">{children}</main>
    </div>
  );
}
