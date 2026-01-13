"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

const meals = [
  { key: "BREAKFAST", label: "Desayuno" },
  { key: "LUNCH", label: "Almuerzo" },
  { key: "DINNER", label: "Cena" },
  { key: "SNACK", label: "Snack" },
] as const;

type MealKey = (typeof meals)[number]["key"];

type DayCheckState = {
  date: string;
  isCompleted: boolean;
  mealsCompleted: Record<MealKey, boolean>;
  notes: string;
};

export function DayCheck({
  initial,
  weeklyProgress,
  streak,
}: {
  initial: DayCheckState;
  weeklyProgress: number;
  streak: number;
}) {
  const [state, setState] = useState(initial);
  const [isPending, startTransition] = useTransition();

  const completedCount = meals.filter((meal) => state.mealsCompleted[meal.key]).length;
  const mealProgress = Math.round((completedCount / meals.length) * 100);

  const updateState = (updates: Partial<DayCheckState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const handleSave = () => {
    startTransition(async () => {
      await fetch("/api/day-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });
    });
  };

  return (
    <Card className="border-border/60 bg-background p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Check diario</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Hoy</h2>
        </div>
        <Button
          variant={state.isCompleted ? "secondary" : "default"}
          className="rounded-full"
          onClick={() => updateState({ isCompleted: !state.isCompleted })}
        >
          {state.isCompleted ? "Completado" : "Marcar como completado"}
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {meals.map((meal) => (
          <label key={meal.key} className="flex items-center gap-3 text-sm">
            <Checkbox
              checked={state.mealsCompleted[meal.key]}
              onCheckedChange={(checked) =>
                updateState({
                  mealsCompleted: {
                    ...state.mealsCompleted,
                    [meal.key]: Boolean(checked),
                  },
                })
              }
            />
            {meal.label}
          </label>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Comidas completas</p>
          <Progress value={mealProgress} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">
            Progreso semanal - racha {streak} dias
          </p>
          <Progress value={weeklyProgress} />
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-sm text-muted-foreground">Notas</p>
        <Textarea
          value={state.notes}
          onChange={(event) => updateState({ notes: event.target.value })}
          placeholder="Como te sentiste hoy?"
        />
      </div>

      <Button
        className="mt-6 rounded-full"
        onClick={handleSave}
        disabled={isPending}
      >
        {isPending ? "Guardando..." : "Guardar check"}
      </Button>
    </Card>
  );
}
