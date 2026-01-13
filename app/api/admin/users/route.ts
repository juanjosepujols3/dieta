import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { resolveAccessWeeks } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";

const updateSchema = z.object({
  userId: z.string(),
  entitlement: z.enum(["FREE", "COMPED"]),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      entitlement: true,
      accessWeeks: true,
    },
  });

  return NextResponse.json({ users });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const accessWeeks = resolveAccessWeeks(parsed.data.entitlement);

  await prisma.user.update({
    where: { id: parsed.data.userId },
    data: {
      entitlement: parsed.data.entitlement,
      accessWeeks,
      paidUntil: null,
    },
  });

  return NextResponse.json({ success: true });
}
