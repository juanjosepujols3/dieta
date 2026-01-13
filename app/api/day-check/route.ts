import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const checkSchema = z.object({
  date: z.string(),
  isCompleted: z.boolean(),
  mealsCompleted: z.record(z.string(), z.boolean()),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = checkSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const date = new Date(parsed.data.date);

  await prisma.dayCheck.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date,
      },
    },
    update: {
      isCompleted: parsed.data.isCompleted,
      mealsCompleted: parsed.data.mealsCompleted,
      notes: parsed.data.notes,
    },
    create: {
      userId: session.user.id,
      date,
      isCompleted: parsed.data.isCompleted,
      mealsCompleted: parsed.data.mealsCompleted,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json({ success: true });
}
