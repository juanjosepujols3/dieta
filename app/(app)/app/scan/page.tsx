import { FoodScan } from "@/components/scan/food-scan";

export default function ScanPage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Food Scan</p>
        <h1 className="font-display text-3xl font-semibold">Escanea tu comida</h1>
      </div>
      <FoodScan />
    </div>
  );
}
