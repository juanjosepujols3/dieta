"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const mealTypes = [
  { value: "BREAKFAST", label: "Desayuno" },
  { value: "LUNCH", label: "Almuerzo" },
  { value: "DINNER", label: "Cena" },
  { value: "SNACK", label: "Snack" },
] as const;

type ScanItem = {
  name: string;
  usdaFdcId?: number | null;
  servingText?: string | null;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence: number;
  quantity: number;
};

type ScanResponse = {
  items: ScanItem[];
  totals: { calories: number; protein: number; carbs: number; fat: number };
  needs_confirmation: boolean;
};

export function FoodScan() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mealType, setMealType] = useState("LUNCH");
  const [isPending, startTransition] = useTransition();

  const onDrop = useCallback((accepted: File[]) => {
    setFile(accepted[0] ?? null);
    setResult(null);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected: () => {
      setError("Archivo invalido o demasiado grande.");
    },
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxSize: 5 * 1024 * 1024,
  });

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleScan = () => {
    if (!file) return;
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "No pudimos analizar la foto.");
        return;
      }

      const data = (await response.json()) as ScanResponse;
      setResult(data);
    });
  };

  const updateQuantity = (index: number, value: number) => {
    if (!result) return;
    const items = result.items.map((item, idx) =>
      idx === index ? { ...item, quantity: value } : item
    );
    const totals = items.reduce(
      (acc, item) => {
        acc.calories += item.calories * item.quantity;
        acc.protein += item.protein * item.quantity;
        acc.carbs += item.carbs * item.quantity;
        acc.fat += item.fat * item.quantity;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setResult({ ...result, items, totals });
  };

  const handleAddToDay = () => {
    if (!result) return;
    startTransition(async () => {
      await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          mealType,
          source: "SCAN",
          items: result.items,
          totals: result.totals,
        }),
      });
      setResult(null);
      setFile(null);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-border/60 bg-background p-6">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Food Scan
          </p>
          <h2 className="font-display text-2xl font-semibold">Sube una foto de tu comida.</h2>
          <p className="text-sm text-muted-foreground">
            Procesamos la imagen en memoria y la descartamos al finalizar.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`mt-6 flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-border/70 bg-muted/30 px-6 text-center text-sm transition ${
            isDragActive ? "border-emerald-400 bg-emerald-500/10" : ""
          }`}
        >
          <input {...getInputProps({ capture: "environment" })} />
          <p className="font-medium">Arrastra una foto o usa la camara del movil</p>
          <p className="mt-2 text-xs text-muted-foreground">JPG, PNG o WEBP hasta 5MB</p>
        </div>

        {previewUrl && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-border/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Preview" className="h-48 w-full object-cover" />
          </div>
        )}

        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

        <Button className="mt-6 rounded-full" onClick={handleScan} disabled={!file || isPending}>
          {isPending ? "Analizando..." : "Analizar foto"}
        </Button>
      </Card>

      <Card className="border-border/60 bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Resultado</p>
            <h3 className="font-display text-xl font-semibold">Macros estimados</h3>
          </div>
          <Select value={mealType} onValueChange={setMealType}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mealTypes.map((meal) => (
                <SelectItem key={meal.value} value={meal.value}>
                  {meal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!result && (
          <div className="mt-6 rounded-2xl border border-dashed border-border/80 p-6 text-sm text-muted-foreground">
            Aun no hay resultados. Sube una foto para ver los items detectados.
          </div>
        )}

        {result && (
          <div className="mt-6 space-y-4">
            {result.items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-border/80 p-4 text-sm text-muted-foreground">
                No detectamos alimentos. Intenta otra foto o ajusta la iluminacion.
              </div>
            )}
            {result.items.map((item, index) => (
              <div key={`${item.name}-${index}`} className="rounded-2xl border border-border/60 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.servingText ?? "Porcion estimada"} / {Math.round(item.confidence * 100)}%
                    </p>
                  </div>
                  <Input
                    type="number"
                    min={0.25}
                    step={0.25}
                    value={item.quantity}
                    onChange={(event) => updateQuantity(index, Number(event.target.value))}
                    className="w-20"
                  />
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {item.calories} kcal / {item.protein}g P / {item.carbs}g C / {item.fat}g G
                </p>
              </div>
            ))}

            <div className="rounded-2xl bg-muted/40 p-4 text-sm">
              <p className="font-semibold">Totales</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(result.totals.calories)} kcal / {Math.round(result.totals.protein)}g P / {Math.round(result.totals.carbs)}g C / {Math.round(result.totals.fat)}g G
              </p>
            </div>

            <Button
              className="w-full rounded-full"
              onClick={handleAddToDay}
              disabled={result.items.length === 0}
            >
              Anadir a mi dia
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
