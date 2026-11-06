import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { requireRole } from "@/lib/auth";
import { LogoutButton } from "@/app/components/logout-button";

type WorkspaceLink = {
  href: string;
  label: string;
};

type WorkspaceShellProps = {
  role: "ADMIN" | "KARYAWAN PRODUKSI" | "OWNER";
  active: string;
  links: WorkspaceLink[];
  children: ReactNode;
};

export function WorkspaceShell({
  role,
  active,
  links,
  children,
}: WorkspaceShellProps) {
  return (
    <Suspense fallback={<main className="workspace-main"><p className="panel">Memuat akun…</p></main>}>
      <AuthenticatedWorkspace active={active} links={links} role={role}>
        {children}
      </AuthenticatedWorkspace>
    </Suspense>
  );
}

async function AuthenticatedWorkspace({
  role,
  active,
  links,
  children,
}: WorkspaceShellProps) {
  const sessionRole =
    role === "KARYAWAN PRODUKSI" ? "KARYAWAN_PRODUKSI" : role;
  const user = await requireRole(sessionRole);

  return (
    <div className="workspace-layout">
      <aside className="workspace-sidebar">
        <Link aria-label="Kembali ke beranda" className="brand-mark" href="/">
          <span aria-hidden="true" className="brand-mark__cake"><span /></span>
        </Link>
        <p className="workspace-role">{role}</p>
        <p className="workspace-user">{user.name}</p>
        <nav aria-label={`Navigasi ${role.toLowerCase()}`} className="workspace-nav">
          {links.map((link) => {
            const isActive = active === link.href;
            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`workspace-nav__link${isActive ? " is-active" : ""}`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <LogoutButton />
      </aside>
      <main className="workspace-main">{children}</main>
    </div>
  );
}

export const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/menu", label: "Kelola Menu & Stok" },
  { href: "/admin/pesanan", label: "Pesanan & Pembayaran" },
  { href: "/admin/penyerahan", label: "Laporan Penyerahan" },
  { href: "/admin/laporan", label: "Laporan" },
  { href: "/admin/akun", label: "Akun Karyawan" },
  { href: "/transaksi", label: "Data Transaksi & Penjualan" },
];

export const productionLinks = [
  { href: "/produksi", label: "Daftar Pesanan" },
];

export const ownerLinks = [
  { href: "/owner", label: "Dashboard" },
  { href: "/owner/menu", label: "Menu & Stok" },
  { href: "/owner/laporan", label: "Laporan" },
  { href: "/owner/ulasan", label: "Ulasan Pelanggan" },
  { href: "/owner/akun", label: "Akun Admin" },
];
