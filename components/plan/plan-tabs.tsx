"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const mealLabel = {
  BREAKFAST: "Desayuno",
  LUNCH: "Almuerzo",
  DINNER: "Cena",
  SNACK: "Snack",
} as const;

const mealOrder: Array<keyof typeof mealLabel> = [
  "BREAKFAST",
  "LUNCH",
  "DINNER",
  "SNACK",
];

type PlanMeal = {
  id: string;
  mealType: keyof typeof mealLabel;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  recipe?: { name: string | null } | null;
};

type PlanDay = {
  id: string;
  dayIndex: number;
  dateLabel: string;
  meals: PlanMeal[];
};

type PlanWeek = {
  id: string;
  weekIndex: number;
  days: PlanDay[];
  groceryItems: { id: string; name: string; quantity: string }[];
};

type PlanCycle = {
  weeks: PlanWeek[];
};

export function PlanTabs({
  plan,
  accessWeeks,
}: {
  plan: PlanCycle;
  accessWeeks: number;
}) {
  return (
    <Tabs defaultValue="week-1" className="space-y-6">
      <TabsList className="flex w-full flex-wrap justify-start gap-2 bg-transparent">
        {plan.weeks.map((week) => (
          <TabsTrigger
            key={week.id}
            value={`week-${week.weekIndex}`}
            className="rounded-full data-[state=active]:bg-emerald-500/10 data-[state=active]:text-emerald-600"
          >
            Semana {week.weekIndex}
          </TabsTrigger>
        ))}
      </TabsList>

      {plan.weeks.map((week) => {
        const locked = week.weekIndex > accessWeeks;
        return (
          <TabsContent key={week.id} value={`week-${week.weekIndex}`}>
            <Card className="border-border/60 bg-background p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-semibold">
                    Semana {week.weekIndex}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {locked ? "Bloqueada" : "Disponible"}
                  </p>
                </div>
                {locked && <Badge variant="secondary">Upgrade para desbloquear</Badge>}
              </div>

              {locked ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border/80 bg-muted/40 p-6 text-sm text-muted-foreground">
                  Esta semana esta bloqueada por el paywall. Activa un plan pago o comped para ver
                  las comidas.
                </div>
              ) : (
                <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
                  <div className="space-y-4">
                    {week.days.map((day) => (
                      <Card key={day.id} className="border-border/60 bg-muted/30 p-4">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold">Dia {day.dayIndex}</p>
                          <p className="text-xs text-muted-foreground">{day.dateLabel}</p>
                        </div>
                        <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                          {[...day.meals]
                            .sort(
                              (a, b) =>
                                mealOrder.indexOf(a.mealType) -
                                mealOrder.indexOf(b.mealType)
                            )
                            .map((meal) => (
                            <div
                              key={meal.id}
                              className="rounded-xl border border-border/60 bg-background px-3 py-2"
                            >
                              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                                {mealLabel[meal.mealType]}
                              </p>
                              <p className="mt-1 font-medium">
                                {meal.recipe?.name ?? "Receta sugerida"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {meal.calories} kcal / {meal.proteinGrams}g P
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                  <Card className="border-border/60 bg-background p-4">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                      Lista de compras
                    </p>
                    <div className="mt-4 space-y-2 text-sm">
                      {week.groceryItems.length === 0 && (
                        <p className="text-muted-foreground">Sin items por ahora.</p>
                      )}
                      {week.groceryItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between">
                          <span>{item.name}</span>
                          <span className="text-muted-foreground">{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </Card>
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
