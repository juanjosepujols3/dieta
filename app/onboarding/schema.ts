import { z } from "zod";

export const onboardingSchema = z.object({
  age: z.number().int().min(12).max(90),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(35).max(250),
  country: z.string().min(2),
  sex: z.string().optional(),
  goalType: z.enum(["LOSE_FAT", "GAIN_MUSCLE", "MAINTAIN", "RECOMP"]),
  pace: z.enum(["AGGRESSIVE", "MODERATE", "GENTLE"]),
  activityLevel: z.enum(["LOW", "MODERATE", "HIGH", "ATHLETE"]),
  trainingType: z.string().optional(),
  trainingDaysPerWeek: z.number().int().min(0).max(7).optional(),
  trainingDurationMin: z.number().int().min(0).max(240).optional(),
  mealsPerDay: z.number().int().min(2).max(6),
  mealTimes: z.string().optional(),
  style: z.enum([
    "NORMAL",
    "LOW_CARB",
    "HIGH_PROTEIN",
    "VEGETARIAN",
    "VEGAN",
    "KETO",
  ]),
  cuisinePreference: z.string().optional(),
  dislikedFoods: z.string().optional(),
  allergies: z.string().optional(),
  intolerances: z.string().optional(),
  culturalRestrictions: z.string().optional(),
  budgetLevel: z.string().optional(),
  cookingTimeLevel: z.string().optional(),
  cookingEquipment: z.string().optional(),
  flexibility: z.string().optional(),
  snacks: z.boolean(),
  repeatMeals: z.boolean(),
  freeDay: z.boolean(),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
