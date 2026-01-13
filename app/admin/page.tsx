import Link from "next/link";

import { AdminCharts } from "@/components/admin/admin-charts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [userCount, planCount, scanCount, barcodeCount] = await Promise.all([
    prisma.user.count(),
    prisma.planCycle.count(),
    prisma.foodLogEntry.count({ where: { source: "SCAN" } }),
    prisma.foodLogEntry.count({ where: { source: "BARCODE" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Admin</p>
          <h1 className="font-display text-3xl font-semibold">Panel de control</h1>
        </div>
        <Button asChild className="rounded-full">
          <Link href="/admin/users">Gestionar usuarios</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Usuarios", value: userCount },
          { label: "Planes", value: planCount },
          { label: "Food scans", value: scanCount },
          { label: "Barcodes", value: barcodeCount },
        ].map((item) => (
          <Card key={item.label} className="border-border/60 bg-background p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {item.label}
            </p>
            <p className="mt-2 text-3xl font-semibold">{item.value}</p>
          </Card>
        ))}
      </div>

      <AdminCharts
        data={[
          { name: "Planes", value: planCount },
          { name: "Scans", value: scanCount },
          { name: "Barcodes", value: barcodeCount },
        ]}
      />
    </div>
  );
}
