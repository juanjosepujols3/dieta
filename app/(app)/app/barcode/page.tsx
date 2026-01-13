import { BarcodeScan } from "@/components/barcode/barcode-scan";

export default function BarcodePage() {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Barcode</p>
        <h1 className="font-display text-3xl font-semibold">Escanea o busca productos</h1>
      </div>
      <BarcodeScan />
    </div>
  );
}
