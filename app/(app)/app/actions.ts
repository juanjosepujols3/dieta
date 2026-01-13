"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

import { authOptions } from "@/lib/auth";
import { generatePlanForUser } from "@/lib/plan-engine";
import { prisma } from "@/lib/prisma";

export async function generatePlanAction() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const active = await prisma.planCycle.findFirst({
    where: { userId: session.user.id, status: "ACTIVE" },
  });

  if (active) {
    await prisma.planCycle.update({
      where: { id: active.id },
      data: { status: "ARCHIVED" },
    });
  }

  await generatePlanForUser(session.user.id);
  revalidatePath("/app");
  revalidatePath("/app/plan");
}
