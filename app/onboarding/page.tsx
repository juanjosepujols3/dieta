"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { completeOnboarding } from "./actions";
import { onboardingSchema, type OnboardingValues } from "./schema";

const steps: Array<{ title: string; fields: Array<keyof OnboardingValues> }> = [
  {
    title: "Basicos",
    fields: ["age", "heightCm", "weightKg", "country", "sex"],
  },
  {
    title: "Meta",
    fields: ["goalType", "pace"],
  },
  {
    title: "Actividad",
    fields: ["activityLevel", "trainingType", "trainingDaysPerWeek", "trainingDurationMin"],
  },
  {
    title: "Preferencias",
    fields: ["mealsPerDay", "mealTimes", "style", "cuisinePreference"],
  },
  {
    title: "Restricciones",
    fields: [
      "dislikedFoods",
      "allergies",
      "intolerances",
      "culturalRestrictions",
      "budgetLevel",
      "cookingTimeLevel",
      "cookingEquipment",
      "flexibility",
      "snacks",
      "repeatMeals",
      "freeDay",
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPending, startTransition] = useTransition();

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      age: 25,
      heightCm: 170,
      weightKg: 70,
      country: "",
      sex: "",
      goalType: "LOSE_FAT",
      pace: "MODERATE",
      activityLevel: "MODERATE",
      trainingType: "",
      trainingDaysPerWeek: 3,
      trainingDurationMin: 45,
      mealsPerDay: 3,
      mealTimes: "",
      style: "NORMAL",
      cuisinePreference: "",
      dislikedFoods: "",
      allergies: "",
      intolerances: "",
      culturalRestrictions: "",
      budgetLevel: "",
      cookingTimeLevel: "",
      cookingEquipment: "",
      flexibility: "",
      snacks: true,
      repeatMeals: false,
      freeDay: false,
    },
  });

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => {
    const valid = await form.trigger(step.fields);
    if (!valid) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const onSubmit = (values: OnboardingValues) => {
    startTransition(async () => {
      await completeOnboarding(values);
      router.push("/app");
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-muted/30 px-6 py-12">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-500">Onboarding</p>
          <h1 className="font-display text-3xl font-semibold">Configura tu plan en minutos.</h1>
          <p className="text-sm text-muted-foreground">
            Completa tu perfil para generar un plan de 4 semanas y habilitar tu semana gratis.
          </p>
        </div>

        <Card className="border-border/60 bg-background p-6">
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {steps.map((item, index) => (
              <span
                key={item.title}
                className={`rounded-full px-3 py-1 ${
                  index === currentStep ? "bg-emerald-500/10 text-emerald-600" : "bg-muted"
                }`}
              >
                {item.title}
              </span>
            ))}
          </div>

          <form className="mt-6 space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            {currentStep === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Edad</Label>
                  <Input type="number" {...form.register("age", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Altura (cm)</Label>
                  <Input type="number" {...form.register("heightCm", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Peso (kg)</Label>
                  <Input type="number" {...form.register("weightKg", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Pais</Label>
                  <Input {...form.register("country")} placeholder="Republica Dominicana" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Sexo (opcional)</Label>
                  <Input {...form.register("sex")} placeholder="male / female / otro" />
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Meta</Label>
                  <Controller
                    control={form.control}
                    name="goalType"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu meta" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOSE_FAT">Bajar grasa</SelectItem>
                          <SelectItem value="GAIN_MUSCLE">Subir musculo</SelectItem>
                          <SelectItem value="MAINTAIN">Mantener</SelectItem>
                          <SelectItem value="RECOMP">Recomposicion</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ritmo</Label>
                  <Controller
                    control={form.control}
                    name="pace"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona ritmo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AGGRESSIVE">Agresivo</SelectItem>
                          <SelectItem value="MODERATE">Moderado</SelectItem>
                          <SelectItem value="GENTLE">Suave</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nivel diario</Label>
                  <Controller
                    control={form.control}
                    name="activityLevel"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Actividad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Baja</SelectItem>
                          <SelectItem value="MODERATE">Moderada</SelectItem>
                          <SelectItem value="HIGH">Alta</SelectItem>
                          <SelectItem value="ATHLETE">Atleta</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo de entreno</Label>
                  <Input {...form.register("trainingType")} placeholder="Fuerza, cardio, mixto" />
                </div>
                <div className="space-y-2">
                  <Label>Dias por semana</Label>
                  <Input
                    type="number"
                    {...form.register("trainingDaysPerWeek", {
                      setValueAs: (value) => (value === "" ? undefined : Number(value)),
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duracion (min)</Label>
                  <Input
                    type="number"
                    {...form.register("trainingDurationMin", {
                      setValueAs: (value) => (value === "" ? undefined : Number(value)),
                    })}
                  />
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Comidas por dia</Label>
                  <Input type="number" {...form.register("mealsPerDay", { valueAsNumber: true })} />
                </div>
                <div className="space-y-2">
                  <Label>Horarios preferidos</Label>
                  <Input {...form.register("mealTimes")} placeholder="8am, 1pm, 7pm" />
                </div>
                <div className="space-y-2">
                  <Label>Estilo</Label>
                  <Controller
                    control={form.control}
                    name="style"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona estilo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NORMAL">Normal</SelectItem>
                          <SelectItem value="LOW_CARB">Low carb</SelectItem>
                          <SelectItem value="HIGH_PROTEIN">High protein</SelectItem>
                          <SelectItem value="VEGETARIAN">Vegetariano</SelectItem>
                          <SelectItem value="VEGAN">Vegano</SelectItem>
                          <SelectItem value="KETO">Keto</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cocina preferida</Label>
                  <Input {...form.register("cuisinePreference")} placeholder="Dominicana, mediterranea" />
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label>Alimentos que no comes</Label>
                  <Textarea {...form.register("dislikedFoods")} placeholder="cebolla, ajo, lacteos" />
                </div>
                <div className="space-y-2">
                  <Label>Alergias</Label>
                  <Textarea {...form.register("allergies")} placeholder="mani, gluten" />
                </div>
                <div className="space-y-2">
                  <Label>Intolerancias</Label>
                  <Textarea {...form.register("intolerances")} placeholder="lactosa" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Restricciones culturales</Label>
                  <Textarea {...form.register("culturalRestrictions")} placeholder="sin cerdo" />
                </div>
                <div className="space-y-2">
                  <Label>Presupuesto</Label>
                  <Input {...form.register("budgetLevel")} placeholder="bajo / medio / alto" />
                </div>
                <div className="space-y-2">
                  <Label>Tiempo de cocina</Label>
                  <Input {...form.register("cookingTimeLevel")} placeholder="rapido / normal" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Equipo de cocina</Label>
                  <Input {...form.register("cookingEquipment")} placeholder="airfryer, licuadora" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Flexibilidad</Label>
                  <Input {...form.register("flexibility")} placeholder="alto / medio / bajo" />
                </div>
                <div className="flex flex-wrap gap-6 sm:col-span-2">
                  <label className="flex items-center gap-3 text-sm">
                    <Controller
                      control={form.control}
                      name="snacks"
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    Permitir snacks
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <Controller
                      control={form.control}
                      name="repeatMeals"
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    Repetir comidas
                  </label>
                  <label className="flex items-center gap-3 text-sm">
                    <Controller
                      control={form.control}
                      name="freeDay"
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    Dia libre
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
                disabled={currentStep === 0}
              >
                Atras
              </Button>
              {isLastStep ? (
                <Button type="submit" className="rounded-full" disabled={isPending}>
                  {isPending ? "Guardando..." : "Finalizar"}
                </Button>
              ) : (
                <Button type="button" className="rounded-full" onClick={handleNext}>
                  Siguiente
                </Button>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
