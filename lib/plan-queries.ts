import { prisma } from "@/lib/prisma";

export async function getActivePlanCycle(userId: string) {
  return prisma.planCycle.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: {
      weeks: {
        orderBy: { weekIndex: "asc" },
        include: {
          days: {
            orderBy: { dayIndex: "asc" },
            include: {
              meals: {
                include: { recipe: true },
                orderBy: { mealType: "asc" },
              },
            },
          },
          groceryItems: {
            orderBy: { name: "asc" },
          },
        },
      },
    },
  });
}
