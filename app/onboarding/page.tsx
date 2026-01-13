"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, type UseFormReturn, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { completeOnboarding } from "./actions";
import { onboardingSchema, type OnboardingValues } from "./schema";

type Step = {
  group: string;
  title: string;
  description: string;
  field: keyof OnboardingValues;
  optional?: boolean;
  render: (form: UseFormReturn<OnboardingValues>) => React.ReactNode;
};

type Option = {
  value: string;
  label: string;
  description?: string;
};

function OptionGrid({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={`${option.label}-${option.value || "empty"}`}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={isActive}
            className={cn(
              "flex h-full flex-col justify-between rounded-2xl border px-4 py-4 text-left transition",
              isActive
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 shadow-sm dark:text-emerald-300"
                : "border-border/60 bg-muted/40 text-foreground hover:border-emerald-500/30 hover:bg-emerald-500/5"
            )}
          >
            <span className="text-sm font-semibold">{option.label}</span>
            {option.description ? (
              <span className="mt-1 text-xs text-muted-foreground">{option.description}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

function FieldBlock({
  label,
  hint,
  error,
  optional,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        {optional ? <span className="text-xs text-muted-foreground">Opcional</span> : null}
      </div>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}

function ToggleCard({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-4 py-4">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}

const goalOptions: Option[] = [
  { value: "LOSE_FAT", label: "Bajar grasa", description: "Deficit 10-25%" },
  { value: "GAIN_MUSCLE", label: "Subir musculo", description: "Superavit 5-15%" },
  { value: "MAINTAIN", label: "Mantener", description: "Balance estable" },
  { value: "RECOMP", label: "Recomp", description: "Recomposicion gradual" },
];

const paceOptions: Option[] = [
  { value: "AGGRESSIVE", label: "Agresivo", description: "Resultados mas rapidos" },
  { value: "MODERATE", label: "Moderado", description: "Ritmo sostenible" },
  { value: "GENTLE", label: "Suave", description: "Progreso gradual" },
];

const activityOptions: Option[] = [
  { value: "LOW", label: "Baja", description: "Poco movimiento diario" },
  { value: "MODERATE", label: "Moderada", description: "Actividad regular" },
  { value: "HIGH", label: "Alta", description: "Entrenos frecuentes" },
  { value: "ATHLETE", label: "Atleta", description: "Rutina intensa" },
];

const styleOptions: Option[] = [
  { value: "NORMAL", label: "Normal", description: "Balanceado" },
  { value: "LOW_CARB", label: "Low carb", description: "Menos carbohidratos" },
  { value: "HIGH_PROTEIN", label: "High protein", description: "Mas proteina" },
  { value: "VEGETARIAN", label: "Vegetariano", description: "Sin carne" },
  { value: "VEGAN", label: "Vegano", description: "Origen vegetal" },
  { value: "KETO", label: "Keto", description: "Carbos muy bajos" },
];

const sexOptions: Option[] = [
  { value: "male", label: "Hombre" },
  { value: "female", label: "Mujer" },
  { value: "other", label: "Otro" },
  { value: "", label: "Prefiero no decir" },
];

const steps: Step[] = [
  {
    group: "Basicos",
    title: "Edad",
    description: "Necesitamos tu edad para calcular tu metabolismo base.",
    field: "age",
    render: (form) => (
      <FieldBlock
        label="Edad"
        hint="Entre 12 y 90 anos."
        error={form.formState.errors.age?.message}
      >
        <Input
          type="number"
          min={12}
          max={90}
          inputMode="numeric"
          className="h-12 text-lg"
          {...form.register("age", { valueAsNumber: true })}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Basicos",
    title: "Altura",
    description: "Ayuda a estimar tu gasto calorico con precision.",
    field: "heightCm",
    render: (form) => (
      <FieldBlock
        label="Altura (cm)"
        hint="Ej: 170"
        error={form.formState.errors.heightCm?.message}
      >
        <Input
          type="number"
          min={120}
          max={230}
          inputMode="numeric"
          className="h-12 text-lg"
          {...form.register("heightCm", { valueAsNumber: true })}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Basicos",
    title: "Peso",
    description: "Actualizamos macros segun tu peso actual.",
    field: "weightKg",
    render: (form) => (
      <FieldBlock
        label="Peso (kg)"
        hint="Ej: 70"
        error={form.formState.errors.weightKg?.message}
      >
        <Input
          type="number"
          min={35}
          max={250}
          inputMode="numeric"
          className="h-12 text-lg"
          {...form.register("weightKg", { valueAsNumber: true })}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Basicos",
    title: "Pais",
    description: "Nos ayuda a ajustar recetas y horarios.",
    field: "country",
    render: (form) => (
      <FieldBlock
        label="Pais"
        hint="Ej: Republica Dominicana"
        error={form.formState.errors.country?.message}
      >
        <Input className="h-12 text-lg" {...form.register("country")} />
      </FieldBlock>
    ),
  },
  {
    group: "Basicos",
    title: "Sexo",
    description: "Opcional, solo si deseas un calculo mas preciso.",
    field: "sex",
    optional: true,
    render: (form) => (
      <FieldBlock label="Sexo" optional>
        <Controller
          control={form.control}
          name="sex"
          render={({ field }) => (
            <OptionGrid
              value={field.value ?? ""}
              onChange={field.onChange}
              options={sexOptions}
            />
          )}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Meta",
    title: "Objetivo",
    description: "Define hacia donde quieres llevar tu cuerpo.",
    field: "goalType",
    render: (form) => (
      <FieldBlock label="Meta principal">
        <Controller
          control={form.control}
          name="goalType"
          render={({ field }) => (
            <OptionGrid value={field.value} onChange={field.onChange} options={goalOptions} />
          )}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Meta",
    title: "Ritmo",
    description: "Ajusta el nivel de intensidad que prefieres.",
    field: "pace",
    render: (form) => (
      <FieldBlock label="Ritmo">
        <Controller
          control={form.control}
          name="pace"
          render={({ field }) => (
            <OptionGrid value={field.value} onChange={field.onChange} options={paceOptions} />
          )}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Actividad",
    title: "Actividad diaria",
    description: "Selecciona el nivel promedio de actividad.",
    field: "activityLevel",
    render: (form) => (
      <FieldBlock label="Actividad">
        <Controller
          control={form.control}
          name="activityLevel"
          render={({ field }) => (
            <OptionGrid value={field.value} onChange={field.onChange} options={activityOptions} />
          )}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Actividad",
    title: "Tipo de entreno",
    description: "Opcional, describe tu estilo de entrenamiento.",
    field: "trainingType",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Tipo de entreno"
        hint="Ej: fuerza, cardio, mixto"
        optional
        error={form.formState.errors.trainingType?.message}
      >
        <Input className="h-12 text-lg" {...form.register("trainingType")} />
      </FieldBlock>
    ),
  },
  {
    group: "Actividad",
    title: "Dias por semana",
    description: "Cuantos dias entrenas normalmente.",
    field: "trainingDaysPerWeek",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Dias por semana"
        hint="Ej: 3"
        optional
        error={form.formState.errors.trainingDaysPerWeek?.message}
      >
        <Input
          type="number"
          min={0}
          max={7}
          inputMode="numeric"
          className="h-12 text-lg"
          {...form.register("trainingDaysPerWeek", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Actividad",
    title: "Duracion de entreno",
    description: "Tiempo promedio por sesion.",
    field: "trainingDurationMin",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Duracion (min)"
        hint="Ej: 45"
        optional
        error={form.formState.errors.trainingDurationMin?.message}
      >
        <Input
          type="number"
          min={0}
          max={240}
          inputMode="numeric"
          className="h-12 text-lg"
          {...form.register("trainingDurationMin", {
            setValueAs: (value) => (value === "" ? undefined : Number(value)),
          })}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Preferencias",
    title: "Comidas por dia",
    description: "Definimos la frecuencia de tus comidas.",
    field: "mealsPerDay",
    render: (form) => (
      <FieldBlock
        label="Comidas por dia"
        hint="Entre 2 y 6"
        error={form.formState.errors.mealsPerDay?.message}
      >
        <Input
          type="number"
          min={2}
          max={6}
          inputMode="numeric"
          className="h-12 text-lg"
          {...form.register("mealsPerDay", { valueAsNumber: true })}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Preferencias",
    title: "Horarios",
    description: "Opcional, indica horarios preferidos.",
    field: "mealTimes",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Horarios preferidos"
        hint="Ej: 8am, 1pm, 7pm"
        optional
        error={form.formState.errors.mealTimes?.message}
      >
        <Input className="h-12 text-lg" {...form.register("mealTimes")} />
      </FieldBlock>
    ),
  },
  {
    group: "Preferencias",
    title: "Estilo",
    description: "Selecciona el estilo alimenticio principal.",
    field: "style",
    render: (form) => (
      <FieldBlock label="Estilo">
        <Controller
          control={form.control}
          name="style"
          render={({ field }) => (
            <OptionGrid value={field.value} onChange={field.onChange} options={styleOptions} />
          )}
        />
      </FieldBlock>
    ),
  },
  {
    group: "Preferencias",
    title: "Cocina preferida",
    description: "Opcional, define tu estilo culinario.",
    field: "cuisinePreference",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Cocina preferida"
        hint="Ej: dominicana, mediterranea"
        optional
        error={form.formState.errors.cuisinePreference?.message}
      >
        <Input className="h-12 text-lg" {...form.register("cuisinePreference")} />
      </FieldBlock>
    ),
  },
  {
    group: "Restricciones",
    title: "Alimentos que no comes",
    description: "Lista lo que quieres evitar.",
    field: "dislikedFoods",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Alimentos que no comes"
        hint="Separados por coma"
        optional
        error={form.formState.errors.dislikedFoods?.message}
      >
        <Textarea rows={4} {...form.register("dislikedFoods")} />
      </FieldBlock>
    ),
  },
  {
    group: "Restricciones",
    title: "Alergias",
    description: "Opcional, indica alergias.",
    field: "allergies",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Alergias"
        hint="Ej: mani, gluten"
        optional
        error={form.formState.errors.allergies?.message}
      >
        <Textarea rows={3} {...form.register("allergies")} />
      </FieldBlock>
    ),
  },
  {
    group: "Restricciones",
    title: "Intolerancias",
    description: "Opcional, indica intolerancias.",
    field: "intolerances",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Intolerancias"
        hint="Ej: lactosa"
        optional
        error={form.formState.errors.intolerances?.message}
      >
        <Textarea rows={3} {...form.register("intolerances")} />
      </FieldBlock>
    ),
  },
  {
    group: "Restricciones",
    title: "Restricciones culturales",
    description: "Opcional, reglas culturales o religiosas.",
    field: "culturalRestrictions",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Restricciones culturales"
        hint="Ej: sin cerdo"
        optional
        error={form.formState.errors.culturalRestrictions?.message}
      >
        <Textarea rows={3} {...form.register("culturalRestrictions")} />
      </FieldBlock>
    ),
  },
  {
    group: "Restricciones",
    title: "Presupuesto",
    description: "Opcional, ayuda a elegir recetas.",
    field: "budgetLevel",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Presupuesto"
        hint="Ej: bajo, medio, alto"
        optional
        error={form.formState.errors.budgetLevel?.message}
      >
        <Input className="h-12 text-lg" {...form.register("budgetLevel")} />
      </FieldBlock>
    ),
  },
  {
    group: "Restricciones",
    title: "Tiempo de cocina",
    description: "Opcional, cuanto tiempo puedes dedicar.",
    field: "cookingTimeLevel",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Tiempo de cocina"
        hint="Ej: rapido, normal"
        optional
        error={form.formState.errors.cookingTimeLevel?.message}
      >
        <Input className="h-12 text-lg" {...form.register("cookingTimeLevel")} />
      </FieldBlock>
    ),
  },
  {
    group: "Restricciones",
    title: "Equipo de cocina",
    description: "Opcional, equipos disponibles.",
    field: "cookingEquipment",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Equipo de cocina"
        hint="Ej: airfryer, licuadora"
        optional
        error={form.formState.errors.cookingEquipment?.message}
      >
        <Input className="h-12 text-lg" {...form.register("cookingEquipment")} />
      </FieldBlock>
    ),
  },
  {
    group: "Restricciones",
    title: "Flexibilidad",
    description: "Opcional, que tan estricto quieres el plan.",
    field: "flexibility",
    optional: true,
    render: (form) => (
      <FieldBlock
        label="Flexibilidad"
        hint="Ej: alto, medio, bajo"
        optional
        error={form.formState.errors.flexibility?.message}
      >
        <Input className="h-12 text-lg" {...form.register("flexibility")} />
      </FieldBlock>
    ),
  },
  {
    group: "Reglas",
    title: "Snacks",
    description: "Define si quieres snacks en el plan.",
    field: "snacks",
    render: (form) => (
      <Controller
        control={form.control}
        name="snacks"
        render={({ field }) => (
          <ToggleCard
            title="Permitir snacks"
            description="Incluye snacks estrategicos entre comidas."
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    ),
  },
  {
    group: "Reglas",
    title: "Repetir comidas",
    description: "Indica si prefieres repetir platos.",
    field: "repeatMeals",
    render: (form) => (
      <Controller
        control={form.control}
        name="repeatMeals"
        render={({ field }) => (
          <ToggleCard
            title="Repetir comidas"
            description="Reduce variedad para ganar consistencia."
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    ),
  },
  {
    group: "Reglas",
    title: "Dia libre",
    description: "Define si quieres un dia libre semanal.",
    field: "freeDay",
    render: (form) => (
      <Controller
        control={form.control}
        name="freeDay"
        render={({ field }) => (
          <ToggleCard
            title="Dia libre"
            description="Permite una comida flexible a la semana."
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        )}
      />
    ),
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
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  const handleNext = async () => {
    const valid = await form.trigger(step.field);
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
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/20" />
        <div className="absolute inset-0 bg-grain opacity-70" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12 lg:flex-row lg:items-start">
          <aside className="flex flex-1 flex-col gap-6">
            <div className="space-y-4">
              <span className="inline-flex w-fit items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                Onboarding
              </span>
              <h1 className="font-display text-4xl font-semibold leading-tight md:text-5xl">
                Tu plan empieza aqui.
              </h1>
              <p className="text-sm text-muted-foreground">
                Un paso a la vez. Solo una pregunta por pantalla para acelerar tu
                configuracion.
              </p>
            </div>

            <Card className="border-border/60 bg-background/85 p-6">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-muted-foreground">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-emerald-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-4 grid gap-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Seccion</span>
                  <span className="font-medium text-foreground">{step.group}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Actual</span>
                  <span className="font-medium text-foreground">{step.title}</span>
                </div>
              </div>
            </Card>

            <Card className="border-border/60 bg-background/85 p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Semana 1 gratis
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Al completar el onboarding generamos tu plan de 4 semanas y
                desbloqueamos la primera automaticamente.
              </p>
            </Card>
          </aside>

          <Card className="relative w-full flex-[1.1] border-border/60 bg-background/90 p-6 lg:p-8">
            <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-600">
                Paso {currentStep + 1} de {steps.length}
              </span>
              <span className="rounded-full bg-muted px-3 py-1">{step.group}</span>
              {step.optional ? (
                <span className="rounded-full border border-dashed border-border px-3 py-1">
                  Opcional
                </span>
              ) : null}
            </div>

            <div className="mt-6 space-y-3">
              <h2 className="font-display text-2xl font-semibold md:text-3xl">
                {step.title}
              </h2>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>

            <form className="mt-8 space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={step.field}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {step.render(form)}
                </motion.div>
              </AnimatePresence>

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
                  <Button
                    type="button"
                    className="rounded-full"
                    onClick={handleNext}
                    disabled={isPending}
                  >
                    Siguiente
                  </Button>
                )}
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
