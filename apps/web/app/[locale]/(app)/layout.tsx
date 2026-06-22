import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { SessionProvider } from "@/lib/auth/session";
import { getServerSession } from "@/lib/auth/session.server";
import { Sidebar } from "@/components/shell/Sidebar";
import { Topbar } from "@/components/shell/Topbar";

/** Back-office shell: fixed sidebar (role-filtered) + topbar. */
export default async function AppLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const { session, mode, persona } = await getServerSession();

  // Auth mode with no signed-in user → send to login.
  if (!session) redirect(`/${locale}/login`);

  return (
    <SessionProvider
      mode={mode}
      session={session}
      tenant={session.tenant}
      initialPersonaId={persona?.id}
    >
      <div className="min-h-screen">
        <Sidebar />
        <div className="ms-[248px] flex min-h-screen min-w-0 flex-col">
          <Topbar />
          <main className="w-full max-w-[1280px] p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
