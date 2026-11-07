import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import WorkspaceClient from "@/app/workspace-client";
import { getSession } from "@/lib/auth";
import { rolePaths, type AppRole } from "@/lib/demo-auth";

type Props = {
  role: AppRole;
  view: string;
  validViews: string[];
};

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
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }
  if (session.role !== role) {
    redirect(rolePaths[session.role]);
  }
  if (!validViews.includes(view)) {
    redirect(rolePaths[role]);
  }

  return (
    <WorkspaceClient
      role={session.role}
      userName={session.name}
      view={view}
    />
  );
}
