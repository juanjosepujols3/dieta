"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { Card } from "@/components/ui/card";

export function AdminCharts({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <Card className="border-border/60 bg-background p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Actividad</p>
      <h3 className="mt-2 font-display text-xl font-semibold">Eventos recientes</h3>
      <div className="mt-6 h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <Tooltip cursor={{ fill: "rgba(16,185,129,0.08)" }} />
            <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
