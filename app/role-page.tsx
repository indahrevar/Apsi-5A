import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import WorkspaceClient from "@/app/workspace-client";
import { getCurrentUser, type AuthUser } from "@/lib/auth";

type Props = {
  role: AuthUser["role"];
  view: string;
  validViews: string[];
};

const rolePaths: Record<AuthUser["role"], string> = {
  ADMIN: "/admin",
  CUSTOMER: "/menu",
  KARYAWAN_PRODUKSI: "/produksi",
  OWNER: "/owner",
};

// Map dari AccountRole (huruf besar) ke format role yang diminta oleh WorkspaceClient (huruf kecil)
function mapRoleToWorkspace(role: AuthUser["role"]): "admin" | "customer" | "production" | "owner" {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "CUSTOMER":
      return "customer";
    case "KARYAWAN_PRODUKSI":
      return "production";
    case "OWNER":
      return "owner";
    default:
      return "customer";
  }
}

export default function RolePage(props: Props) {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#fafafa] p-8 text-sm text-[#777]">
          Memuat aplikasi...
        </main>
      }
    >
      <AuthorizedWorkspace {...props} />
    </Suspense>
  );
}

async function AuthorizedWorkspace({ role, view, validViews }: Props) {
  await connection();
  const session = await getCurrentUser();

  if (!session) {
    redirect("/");
  }
  if (session.role !== role) {
    redirect(rolePaths[session.role] ?? "/");
  }
  if (!validViews.includes(view)) {
    redirect(rolePaths[role] ?? "/");
  }

  return (
    <WorkspaceClient
      role={mapRoleToWorkspace(session.role)}
      userName={session.name}
      view={view}
    />
  );
}