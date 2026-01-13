import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const weekIndex = Number(searchParams.get("week"));

  if (!weekIndex || weekIndex < 1 || weekIndex > 4) {
    return NextResponse.json({ error: "Semana invalida" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { accessWeeks: true },
  });

  if (weekIndex > (user?.accessWeeks ?? 1)) {
    return NextResponse.json({ error: "Acceso restringido" }, { status: 403 });
  }

  const cycle = await prisma.planCycle.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
  });

  if (!cycle) {
    return NextResponse.json({ error: "Sin plan activo" }, { status: 404 });
  }

  const week = await prisma.planWeek.findFirst({
    where: { cycleId: cycle.id, weekIndex },
    include: {
      days: {
        orderBy: { dayIndex: "asc" },
        include: { meals: { include: { recipe: true } } },
      },
      groceryItems: true,
    },
  });

  if (!week) {
    return NextResponse.json({ error: "Semana no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ week });
}
