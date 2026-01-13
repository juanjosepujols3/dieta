import { endOfWeek, startOfDay, startOfWeek, subDays } from "date-fns";
import { getServerSession } from "next-auth";

import { DayCheck } from "@/components/day-check";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DayPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  const today = startOfDay(new Date());
  const existing = await prisma.dayCheck.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
  });

  const mealsCompletedRaw = existing?.mealsCompleted;
  const mealsCompleted =
    typeof mealsCompletedRaw === "object" && mealsCompletedRaw && !Array.isArray(mealsCompletedRaw)
      ? (mealsCompletedRaw as Record<string, unknown>)
      : {};
  const mealValue = (key: string) => Boolean(mealsCompleted[key]);

  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

  const [weekChecks, streakChecks] = await Promise.all([
    prisma.dayCheck.findMany({
      where: {
        userId,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    }),
    prisma.dayCheck.findMany({
      where: {
        userId,
        isCompleted: true,
        date: {
          gte: subDays(today, 13),
          lte: today,
        },
      },
    }),
  ]);

  const completedDays = weekChecks.filter((check) => check.isCompleted).length;
  const weeklyProgress = Math.round((completedDays / 7) * 100);

  const completedSet = new Set(
    streakChecks.map((check) => startOfDay(check.date).toISOString())
  );

  let streak = 0;
  for (let i = 0; i < 14; i += 1) {
    const day = startOfDay(subDays(today, i));
    if (completedSet.has(day.toISOString())) {
      streak += 1;
    } else {
      break;
    }
  }

  const initial = {
    date: today.toISOString(),
    isCompleted: existing?.isCompleted ?? false,
    mealsCompleted: {
      BREAKFAST: mealValue("BREAKFAST"),
      LUNCH: mealValue("LUNCH"),
      DINNER: mealValue("DINNER"),
      SNACK: mealValue("SNACK"),
    },
    notes: existing?.notes ?? "",
  };

  return <DayCheck initial={initial} weeklyProgress={weeklyProgress} streak={streak} />;
}
