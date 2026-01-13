"use server";

import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { resolveAccessWeeks } from "@/lib/entitlements";
import { generatePlanForUser } from "@/lib/plan-engine";
import { prisma } from "@/lib/prisma";

import { onboardingSchema, type OnboardingValues } from "./schema";

const splitList = (value?: string) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

export async function completeOnboarding(values: OnboardingValues) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const parsed = onboardingSchema.parse(values);

  await prisma.profile.upsert({
    where: { userId: session.user.id },
    update: {
      age: parsed.age,
      heightCm: parsed.heightCm,
      weightKg: parsed.weightKg,
      country: parsed.country,
      sex: parsed.sex,
    },
    create: {
      userId: session.user.id,
      age: parsed.age,
      heightCm: parsed.heightCm,
      weightKg: parsed.weightKg,
      country: parsed.country,
      sex: parsed.sex,
    },
  });

  await prisma.goal.upsert({
    where: { userId: session.user.id },
    update: {
      goalType: parsed.goalType,
      pace: parsed.pace,
      activityLevel: parsed.activityLevel,
      trainingType: parsed.trainingType,
      trainingDaysPerWeek: parsed.trainingDaysPerWeek,
      trainingDurationMin: parsed.trainingDurationMin,
    },
    create: {
      userId: session.user.id,
      goalType: parsed.goalType,
      pace: parsed.pace,
      activityLevel: parsed.activityLevel,
      trainingType: parsed.trainingType,
      trainingDaysPerWeek: parsed.trainingDaysPerWeek,
      trainingDurationMin: parsed.trainingDurationMin,
    },
  });

  await prisma.preferences.upsert({
    where: { userId: session.user.id },
    update: {
      mealsPerDay: parsed.mealsPerDay,
      mealTimes: splitList(parsed.mealTimes),
      style: parsed.style,
      cuisinePreference: parsed.cuisinePreference,
      dislikedFoods: splitList(parsed.dislikedFoods),
      allergies: splitList(parsed.allergies),
      intolerances: splitList(parsed.intolerances),
      culturalRestrictions: splitList(parsed.culturalRestrictions),
      budgetLevel: parsed.budgetLevel,
      cookingTimeLevel: parsed.cookingTimeLevel,
      cookingEquipment: parsed.cookingEquipment,
      flexibility: parsed.flexibility,
      snacks: parsed.snacks,
      repeatMeals: parsed.repeatMeals,
      freeDay: parsed.freeDay,
    },
    create: {
      userId: session.user.id,
      mealsPerDay: parsed.mealsPerDay,
      mealTimes: splitList(parsed.mealTimes),
      style: parsed.style,
      cuisinePreference: parsed.cuisinePreference,
      dislikedFoods: splitList(parsed.dislikedFoods),
      allergies: splitList(parsed.allergies),
      intolerances: splitList(parsed.intolerances),
      culturalRestrictions: splitList(parsed.culturalRestrictions),
      budgetLevel: parsed.budgetLevel,
      cookingTimeLevel: parsed.cookingTimeLevel,
      cookingEquipment: parsed.cookingEquipment,
      flexibility: parsed.flexibility,
      snacks: parsed.snacks,
      repeatMeals: parsed.repeatMeals,
      freeDay: parsed.freeDay,
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { entitlement: true },
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingCompleted: true,
      accessWeeks: resolveAccessWeeks(user?.entitlement ?? "FREE"),
    },
  });

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
}
