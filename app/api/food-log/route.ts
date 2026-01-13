import { startOfDay } from "date-fns";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Totals = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

const totalsSchema = z.object({
  calories: z.number(),
  protein: z.number(),
  carbs: z.number(),
  fat: z.number(),
});

const logSchema = z.object({
  date: z.string(),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  source: z.enum(["SCAN", "BARCODE", "MANUAL"]),
  items: z.array(z.any()),
  totals: totalsSchema,
  barcode: z.string().optional(),
  name: z.string().optional(),
  servingText: z.string().optional(),
  quantity: z.number().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = logSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const date = startOfDay(new Date(parsed.data.date));
  const existingDay = await prisma.foodLogDay.findUnique({
    where: {
      userId_date: {
        userId: session.user.id,
        date,
      },
    },
  });

  const existingTotals = (existingDay?.totals as Totals | null) ?? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };

  const nextTotals = {
    calories: existingTotals.calories + parsed.data.totals.calories,
    protein: existingTotals.protein + parsed.data.totals.protein,
    carbs: existingTotals.carbs + parsed.data.totals.carbs,
    fat: existingTotals.fat + parsed.data.totals.fat,
  };

  const day = await prisma.foodLogDay.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date,
      },
    },
    update: { totals: nextTotals },
    create: {
      userId: session.user.id,
      date,
      totals: nextTotals,
    },
  });

  await prisma.foodLogEntry.create({
    data: {
      userId: session.user.id,
      foodLogDayId: day.id,
      date,
      mealType: parsed.data.mealType,
      source: parsed.data.source,
      items: parsed.data.items,
      totals: parsed.data.totals,
      barcode: parsed.data.barcode,
      name: parsed.data.name,
      servingText: parsed.data.servingText,
      quantity: parsed.data.quantity,
    },
  });

  return NextResponse.json({ success: true });
}
