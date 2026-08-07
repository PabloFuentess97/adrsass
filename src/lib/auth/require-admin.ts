import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireAdminPage() {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/login");
  return session;
}

export async function requireAdminRequest(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session) return { ok: false as const, status: 401 };
  if (session.user.role !== "ADMIN") return { ok: false as const, status: 403 };
  return { ok: true as const, session };
}
