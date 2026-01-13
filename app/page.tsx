import Link from "next/link";

import { AnimatedSection } from "@/components/animated-section";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="surface-grid relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-radial-fade opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-grain mix-blend-soft-light" />
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-6 pb-24 pt-16 md:pt-24">
          <section className="relative grid gap-12 md:grid-cols-[1.1fr_0.9fr] md:items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-300">
                1 semana gratis
              </span>
              <h1 className="font-display text-4xl font-semibold leading-tight md:text-6xl">
                Planes de dieta personalizados que evolucionan contigo.
              </h1>
              <p className="text-lg text-muted-foreground">
                DietCraft combina perfiles detallados, planes de 4 semanas,
                seguimiento diario y escaneo de comidas para que avances sin
                friccion.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/auth/login">Empieza ahora</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full">
                  <Link href="#planes">Ver plan mensual</Link>
                </Button>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "TDEE + macros", value: "100% deterministico" },
                  { label: "Check diario", value: "progreso real" },
                  { label: "Food Scan", value: "USDA integrado" },
                ].map((item) => (
                  <Card key={item.label} className="border-emerald-500/20 bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 font-semibold">{item.value}</p>
                  </Card>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="relative overflow-hidden border-border/60 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/20 p-6 shadow-lg">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Plan mensual</p>
                    <p className="mt-2 font-display text-3xl font-semibold">
                      Semana 1: Encendido
                    </p>
                  </div>
                  <div className="space-y-3">
                    {[
                      "Desayuno alto en proteina",
                      "Almuerzo balanceado",
                      "Cena ligera",
                      "Snack estrategico",
                    ].map((item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/80 px-4 py-3"
                      >
                        <span className="text-sm font-medium">{item}</span>
                        <span className="text-xs text-emerald-600">320 kcal</span>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-2xl bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-200">
                    Week 1 desbloqueada. Semana 2-4 con plan pago o comped.
                  </div>
                </div>
              </Card>
            </div>
          </section>

          <AnimatedSection id="como-funciona" className="space-y-10">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
                Como funciona
              </p>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                De tu perfil a tu plan de 28 dias.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  title: "Onboarding completo",
                  copy: "Recopila objetivos, actividad, preferencias y restricciones.",
                },
                {
                  title: "Motor deterministico",
                  copy: "Calcula TDEE, macros y asigna recetas segun tus reglas.",
                },
                {
                  title: "Seguimiento diario",
                  copy: "Check-ins, notas y progreso semanal con racha.",
                },
              ].map((item) => (
                <Card key={item.title} className="border-border/60 bg-background/80 p-6">
                  <p className="font-display text-xl font-semibold">{item.title}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{item.copy}</p>
                </Card>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection id="beneficios" className="grid gap-8 md:grid-cols-[0.9fr_1.1fr]">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
                Beneficios
              </p>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">
                Menos friccion, mas consistencia.
              </h2>
              <p className="text-muted-foreground">
                DietCraft cuida el detalle: paywall inteligente, escaneo de comida con USDA,
                y un panel admin para equipos de coaching.
              </p>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/auth/login">Crear mi cuenta</Link>
              </Button>
            </div>
            <div className="grid gap-4">
              {[
                "Planes semanales con lista de compras",
                "Food Scan sin guardar fotos",
                "Barcode scan con Open Food Facts",
                "Seguimiento de macros y calorias",
              ].map((item) => (
                <Card key={item} className="flex items-center justify-between border-border/60 bg-background/80 px-5 py-4">
                  <span className="font-medium">{item}</span>
                  <span className="text-xs text-muted-foreground">Incluido</span>
                </Card>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection id="planes" className="space-y-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">
                  Plan mensual
                </p>
                <h2 className="font-display text-3xl font-semibold md:text-4xl">
                  4 semanas, una evolucion continua.
                </h2>
              </div>
              <Button asChild size="lg" className="rounded-full">
                <Link href="/auth/login">Activar semana gratis</Link>
              </Button>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { week: "Semana 1", label: "Gratis", tone: "emerald" },
                { week: "Semana 2", label: "Bloqueada", tone: "zinc" },
                { week: "Semana 3", label: "Bloqueada", tone: "zinc" },
                { week: "Semana 4", label: "Bloqueada", tone: "zinc" },
              ].map((week) => (
                <Card
                  key={week.week}
                  className="border-border/60 bg-background/80 p-5 text-sm"
                >
                  <p className="font-display text-lg font-semibold">{week.week}</p>
                  <p
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs ${
                      week.tone === "emerald"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {week.label}
                  </p>
                  <p className="mt-3 text-muted-foreground">
                    Planes diarios, lista de compras y check-ins.
                  </p>
                </Card>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </main>
      <footer className="border-t border-border/60 bg-background">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <span>DietCraft. Planifica y ejecuta mejor.</span>
          <span>Hecho para rutinas reales.</span>
        </div>
      </footer>
    </div>
  );
}
