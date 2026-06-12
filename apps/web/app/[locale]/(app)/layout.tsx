import type { ReactNode } from "react";
import { SessionProvider } from "@/lib/auth/session";
import { getServerSession } from "@/lib/auth/session.server";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

/** Back-office shell: fixed sidebar (role-filtered) + topbar, demo layout. */
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { session, persona } = await getServerSession();

  return (
    <SessionProvider initialPersonaId={persona.id} tenant={session.tenant}>
      <div className="min-h-screen">
        <Sidebar />
        <div className="flex min-h-screen min-w-0 flex-col ms-[248px]">
          <Topbar />
          <main className="w-full max-w-[1280px] p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
