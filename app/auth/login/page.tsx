import Link from "next/link";

import { AuthForm } from "@/app/auth/login/auth-form";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative flex min-h-screen items-center justify-center px-6 py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/20" />
        <Card className="relative w-full max-w-lg border-border/60 bg-background/90 p-8 shadow-lg">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
              DietCraft
            </p>
            <h1 className="font-display text-3xl font-semibold">
              Inicia sesion y desbloquea tu plan.
            </h1>
            <p className="text-sm text-muted-foreground">
              Semana 1 gratis. Ajusta tus macros, escanea comidas y mide tu progreso.
            </p>
          </div>
          <div className="mt-8">
            <AuthForm
              enableGoogle={Boolean(
                process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
              )}
            />
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Al continuar aceptas la politica de privacidad. <Link className="text-emerald-600" href="/">Volver al inicio</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
