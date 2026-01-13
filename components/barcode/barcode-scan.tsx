"use client";

import { useEffect, useRef, useState, useTransition } from "react";

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

type BarcodeResult = {
  source: string;
  name: string;
  serving: string;
  macros: { calories: number; protein: number; carbs: number; fat: number };
  confidence: number;
};

export function BarcodeScan() {
  const [barcode, setBarcode] = useState("");
  const [result, setResult] = useState<BarcodeResult | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState("LUNCH");
  const [nameQuery, setNameQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isScanning) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let rafId: number;

    const start = async () => {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camara no disponible en este dispositivo.");
        setIsScanning(false);
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      type BarcodeDetectorConstructor = new (options: { formats: string[] }) => {
        detect: (source: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
      };

      const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor })
        .BarcodeDetector;

      if (!Detector) {
        setError("El navegador no soporta BarcodeDetector.");
        setIsScanning(false);
        return;
      }

      const detector = new Detector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });

      const scan = async () => {
        if (!videoRef.current) return;
        const codes = await detector.detect(videoRef.current);
        if (codes.length > 0) {
          const raw = codes[0].rawValue;
          setBarcode(raw);
          setIsScanning(false);
          return;
        }
        rafId = requestAnimationFrame(scan);
      };

      rafId = requestAnimationFrame(scan);
    };

    start();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isScanning]);

  const handleSearch = () => {
    if (!barcode) return;
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/barcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ barcode, name: nameQuery || undefined }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error ?? "Producto no encontrado.");
        setResult(null);
        return;
      }

      const data = (await response.json()) as BarcodeResult;
      setResult(data);
      setQuantity(1);
    });
  };

  const totals = result
    ? {
        calories: result.macros.calories * quantity,
        protein: result.macros.protein * quantity,
        carbs: result.macros.carbs * quantity,
        fat: result.macros.fat * quantity,
      }
    : null;

  const handleAddToDay = () => {
    if (!result || !totals) return;
    startTransition(async () => {
      await fetch("/api/food-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: new Date().toISOString(),
          mealType,
          source: "BARCODE",
          items: [
            {
              name: result.name,
              servingText: result.serving,
              calories: result.macros.calories,
              protein: result.macros.protein,
              carbs: result.macros.carbs,
              fat: result.macros.fat,
              quantity,
            },
          ],
          totals,
          barcode,
          name: result.name,
          servingText: result.serving,
          quantity,
        }),
      });
      setResult(null);
      setBarcode("");
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <Card className="border-border/60 bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Barcode</p>
            <h2 className="font-display text-2xl font-semibold">Busca un producto</h2>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => setIsScanning(!isScanning)}>
            {isScanning ? "Detener" : "Escanear con camara"}
          </Button>
        </div>

        {isScanning && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-border/60">
            <video ref={videoRef} className="h-56 w-full object-cover" />
          </div>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-[1.2fr_0.8fr]">
          <Input
            value={barcode}
            onChange={(event) => setBarcode(event.target.value)}
            placeholder="Ingresa el codigo de barras"
          />
          <Input
            value={nameQuery}
            onChange={(event) => setNameQuery(event.target.value)}
            placeholder="Nombre del producto (opcional)"
          />
        </div>
        <Button className="mt-3 rounded-full" onClick={handleSearch} disabled={isPending}>
          Buscar
        </Button>

        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </Card>

      <Card className="border-border/60 bg-background p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Resultado</p>
            <h3 className="font-display text-xl font-semibold">Nutrientes</h3>
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
            Producto no encontrado, intenta con nombre o foto.
          </div>
        )}

        {result && totals && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-border/60 p-4">
              <p className="font-semibold">{result.name}</p>
              <p className="text-xs text-muted-foreground">{result.serving}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {result.macros.calories} kcal / {result.macros.protein}g P / {result.macros.carbs}g C / {result.macros.fat}g G
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Cantidad</span>
              <Input
                type="number"
                min={0.25}
                step={0.25}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                className="w-24"
              />
            </div>

            <div className="rounded-2xl bg-muted/40 p-4 text-sm">
              <p className="font-semibold">Totales</p>
              <p className="text-xs text-muted-foreground">
                {Math.round(totals.calories)} kcal / {Math.round(totals.protein)}g P / {Math.round(totals.carbs)}g C / {Math.round(totals.fat)}g G
              </p>
            </div>

            <Button className="w-full rounded-full" onClick={handleAddToDay}>
              Anadir a mi dia
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
