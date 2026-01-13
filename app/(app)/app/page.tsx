import Link from "next/link";
import { getServerSession } from "next-auth";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { getActivePlanCycle } from "@/lib/plan-queries";
import { prisma } from "@/lib/prisma";

import { generatePlanAction } from "./actions";

export default async function AppDashboard() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const [plan, user, scans] = await Promise.all([
    getActivePlanCycle(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { accessWeeks: true } }),
    prisma.foodLogEntry.count({ where: { userId, source: "SCAN" } }),
  ]);
  const accessWeeks = user?.accessWeeks ?? 1;
  const firstDayMeals = plan?.weeks?.[0]?.days?.[0]?.meals ?? [];
  const totals = firstDayMeals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories;
      acc.protein += meal.proteinGrams;
      acc.carbs += meal.carbsGrams;
      acc.fat += meal.fatGrams;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/60 bg-background p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Resumen diario
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold">
            Tu objetivo hoy
          </h1>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Calorias objetivo</p>
              <p className="mt-2 text-3xl font-semibold">
                {totals.calories > 0 ? totals.calories : "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Macros (P/C/G)</p>
              <p className="mt-2 text-lg font-semibold">
                {totals.calories > 0
                  ? `${totals.protein}g / ${totals.carbs}g / ${totals.fat}g`
                  : "-"}
              </p>
            </div>
          </div>
          {!plan && (
            <form action={generatePlanAction} className="mt-6">
              <Button className="rounded-full">Generar plan mensual</Button>
            </form>
          )}
          {plan && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="rounded-full">
                <Link href="/app/plan">Ver plan</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/app/scan">Food Scan</Link>
              </Button>
            </div>
          )}
        </Card>
        <Card className="border-border/60 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/20 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Actividad reciente
          </p>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>Planes generados</span>
              <span className="font-semibold">{plan ? 1 : 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Food scans</span>
              <span className="font-semibold">{scans}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Acceso semanal</span>
              <span className="font-semibold">{accessWeeks} / 4</span>
            </div>
          </div>
          <Button asChild variant="outline" className="mt-6 rounded-full">
            <Link href="/app/day">Check diario</Link>
          </Button>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Plan mensual",
            copy: "Explora semanas, comidas y lista de compras.",
            href: "/app/plan",
          },
          {
            title: "Food Scan",
            copy: "Sube fotos sin guardarlas y calcula macros.",
            href: "/app/scan",
          },
          {
            title: "Barcode",
            copy: "Busca productos con codigo de barras.",
            href: "/app/barcode",
          },
        ].map((item) => (
          <Card key={item.title} className="border-border/60 bg-background p-5">
            <p className="font-display text-lg font-semibold">{item.title}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.copy}</p>
            <Button asChild variant="link" className="mt-3 px-0">
              <Link href={item.href}>Ir ahora</Link>
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
