import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/require-admin";
import { Button } from "@/components/ui/button";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await getServerSession();
  if (session?.user.role === "ADMIN") redirect("/editor");
  const params = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-md border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Acceso privado</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">Generador ADR</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Inicia sesion con la cuenta administrativa creada durante el despliegue. El registro publico esta deshabilitado.
        </p>
        {params.error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            Credenciales no validas o demasiados intentos. Revisa los datos e intentalo de nuevo.
          </div>
        ) : null}
        <form className="mt-6 grid gap-4" action="/api/auth/sign-in/email" method="post">
          <label className="grid gap-1.5 text-sm font-medium">
            Correo
            <input className="min-h-11 rounded-md border border-slate-300 px-3" name="email" type="email" required autoComplete="email" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium">
            Contrasena
            <input className="min-h-11 rounded-md border border-slate-300 px-3" name="password" type="password" required minLength={12} autoComplete="current-password" />
          </label>
          <input type="hidden" name="callbackURL" value="/editor" />
          <Button type="submit">Entrar</Button>
        </form>
      </section>
    </main>
  );
}
