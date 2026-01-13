import { getServerSession } from "next-auth";

import { PlanTabs } from "@/components/plan/plan-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { authOptions } from "@/lib/auth";
import { getActivePlanCycle } from "@/lib/plan-queries";
import { prisma } from "@/lib/prisma";

import { generatePlanAction } from "../actions";

export default async function PlanPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const [plan, user] = await Promise.all([
    getActivePlanCycle(userId),
    prisma.user.findUnique({ where: { id: userId }, select: { accessWeeks: true } }),
  ]);

  const accessWeeks = user?.accessWeeks ?? 1;

  if (!plan) {
    return (
      <Card className="border-border/60 bg-background p-6">
        <h1 className="font-display text-2xl font-semibold">Plan mensual</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Aun no tienes un plan generado. Completa el onboarding o genera un plan nuevo.
        </p>
        <form action={generatePlanAction} className="mt-6">
          <Button className="rounded-full">Generar plan</Button>
        </form>
      </Card>
    );
  }

  const sanitizedPlan = {
    ...plan,
    weeks: plan.weeks.map((week) =>
      week.weekIndex > accessWeeks
        ? { ...week, days: [], groceryItems: [] }
        : week
    ),
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Plan mensual</p>
        <h1 className="font-display text-3xl font-semibold">4 semanas, 28 dias.</h1>
      </div>
      <PlanTabs plan={sanitizedPlan} accessWeeks={accessWeeks} />
    </div>
  );
}
