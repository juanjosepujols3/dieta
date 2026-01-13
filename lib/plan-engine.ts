import { addDays, startOfDay } from "date-fns";
import type {
  ActivityLevel,
  DietStyle,
  GoalPace,
  GoalType,
  MealType,
  Recipe,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

const activityFactor: Record<ActivityLevel, number> = {
  LOW: 1.2,
  MODERATE: 1.4,
  HIGH: 1.6,
  ATHLETE: 1.8,
};

const paceAdjustment = {
  lose: {
    AGGRESSIVE: 0.25,
    MODERATE: 0.15,
    GENTLE: 0.1,
  },
  gain: {
    AGGRESSIVE: 0.15,
    MODERATE: 0.1,
    GENTLE: 0.05,
  },
} as const;

function calculateTdee({
  weightKg,
  heightCm,
  age,
  sex,
  activityLevel,
}: {
  weightKg: number;
  heightCm: number;
  age: number;
  sex?: string | null;
  activityLevel: ActivityLevel;
}) {
  const normalized = sex?.toLowerCase() ?? "";
  const isFemale = normalized.includes("fem") || normalized.includes("mujer");
  const isMale = normalized.includes("male") || normalized.includes("masc") || normalized.includes("hombre");
  const sexFactor = isFemale ? -161 : isMale ? 5 : 0;
  const bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + sexFactor;
  return bmr * activityFactor[activityLevel];
}

function adjustCalories({
  tdee,
  goalType,
  pace,
}: {
  tdee: number;
  goalType: GoalType;
  pace: GoalPace;
}) {
  if (goalType === "LOSE_FAT") {
    return tdee * (1 - paceAdjustment.lose[pace]);
  }
  if (goalType === "GAIN_MUSCLE") {
    return tdee * (1 + paceAdjustment.gain[pace]);
  }
  return tdee;
}

function macroTargets({
  calories,
  weightKg,
  goalType,
}: {
  calories: number;
  weightKg: number;
  goalType: GoalType;
}) {
  const proteinPerKg = goalType === "GAIN_MUSCLE" ? 2.1 : goalType === "LOSE_FAT" ? 1.9 : 1.7;
  const protein = weightKg * proteinPerKg;
  const fat = weightKg * 0.7;
  const proteinCalories = protein * 4;
  const fatCalories = fat * 9;
  const carbsCalories = Math.max(calories - proteinCalories - fatCalories, calories * 0.2);
  const carbs = carbsCalories / 4;

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
  };
}

function resolveMealTypes(mealsPerDay: number, snacks: boolean): MealType[] {
  if (mealsPerDay <= 2) {
    return ["BREAKFAST", "DINNER"];
  }
  if (mealsPerDay === 3) {
    return ["BREAKFAST", "LUNCH", "DINNER"];
  }
  return snacks ? ["BREAKFAST", "LUNCH", "DINNER", "SNACK"] : ["BREAKFAST", "LUNCH", "DINNER"];
}

function filterRecipes(recipes: Recipe[], preferences: {
  style: DietStyle;
  dislikedFoods: string[];
  allergies: string[];
  intolerances: string[];
  culturalRestrictions: string[];
  budgetLevel?: string | null;
  cookingTimeLevel?: string | null;
}) {
  const banned = [
    ...preferences.dislikedFoods,
    ...preferences.allergies,
    ...preferences.intolerances,
    ...preferences.culturalRestrictions,
  ]
    .filter(Boolean)
    .map((item) => item.toLowerCase());

  return recipes.filter((recipe) => {
    const haystack = `${recipe.name} ${recipe.description ?? ""} ${(recipe.ingredients as string[]).join(" ")}`.toLowerCase();
    if (banned.some((item) => haystack.includes(item))) return false;

    if (preferences.style === "VEGAN" && !recipe.tags.includes("vegan")) return false;
    if (preferences.style === "VEGETARIAN" && !(recipe.tags.includes("vegetarian") || recipe.tags.includes("vegan")))
      return false;
    if (preferences.style === "KETO" && !(recipe.tags.includes("keto") || recipe.tags.includes("low_carb")))
      return false;
    if (preferences.style === "LOW_CARB" && !(recipe.tags.includes("low_carb") || recipe.tags.includes("keto")))
      return false;
    if (preferences.style === "HIGH_PROTEIN" && !recipe.tags.includes("high_protein")) return false;

    if (preferences.budgetLevel?.toLowerCase().includes("bajo") && !recipe.tags.includes("budget"))
      return false;
    if (preferences.cookingTimeLevel?.toLowerCase().includes("rapido") && !recipe.tags.includes("quick"))
      return false;

    return true;
  });
}

export async function generatePlanForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, goal: true, preferences: true },
  });

  if (!user?.profile || !user.goal || !user.preferences) {
    throw new Error("Perfil incompleto para generar plan.");
  }

  const tdee = calculateTdee({
    weightKg: user.profile.weightKg,
    heightCm: user.profile.heightCm,
    age: user.profile.age,
    sex: user.profile.sex,
    activityLevel: user.goal.activityLevel,
  });

  const calories = adjustCalories({
    tdee,
    goalType: user.goal.goalType,
    pace: user.goal.pace,
  });

  const macros = macroTargets({
    calories,
    weightKg: user.profile.weightKg,
    goalType: user.goal.goalType,
  });

  const recipes = await prisma.recipe.findMany();
  const filtered = filterRecipes(recipes, user.preferences);
  const mealTypes = resolveMealTypes(user.preferences.mealsPerDay, user.preferences.snacks);
  const planStart = startOfDay(new Date());

  const cycle = await prisma.planCycle.create({
    data: {
      userId,
      startDate: planStart,
      endDate: addDays(planStart, 27),
      status: "ACTIVE",
    },
  });

  let recipeIndex = 0;

  for (let weekIndex = 1; weekIndex <= 4; weekIndex += 1) {
    const week = await prisma.planWeek.create({
      data: {
        cycleId: cycle.id,
        weekIndex,
      },
    });

    const groceryItems = new Map<string, number>();

    for (let dayIndex = 1; dayIndex <= 7; dayIndex += 1) {
      const date = addDays(planStart, (weekIndex - 1) * 7 + (dayIndex - 1));
      const day = await prisma.planDay.create({
        data: {
          weekId: week.id,
          dayIndex,
          date,
        },
      });

      const dayRecipe =
        user.preferences.repeatMeals && (filtered.length > 0 || recipes.length > 0)
          ? filtered.length > 0
            ? filtered[recipeIndex % filtered.length]
            : recipes[recipeIndex % recipes.length]
          : null;

      if (dayRecipe) {
        recipeIndex += 1;
      }

      for (const mealType of mealTypes) {
        const recipe = dayRecipe
          ? dayRecipe
          : filtered.length > 0
            ? filtered[recipeIndex % filtered.length]
            : recipes[recipeIndex % recipes.length];

        if (!dayRecipe) {
          recipeIndex += 1;
        }

        await prisma.meal.create({
          data: {
            dayId: day.id,
            mealType,
            recipeId: recipe?.id,
            calories: Math.round(macros.calories / mealTypes.length),
            proteinGrams: Math.round(macros.protein / mealTypes.length),
            carbsGrams: Math.round(macros.carbs / mealTypes.length),
            fatGrams: Math.round(macros.fat / mealTypes.length),
          },
        });

        if (recipe) {
          (recipe.ingredients as string[]).forEach((ingredient) => {
            groceryItems.set(ingredient, (groceryItems.get(ingredient) ?? 0) + 1);
          });
        }
      }
    }

    if (groceryItems.size > 0) {
      await prisma.groceryItem.createMany({
        data: Array.from(groceryItems.entries()).map(([name, count]) => ({
          weekId: week.id,
          name,
          quantity: `${count}x`,
        })),
      });
    }
  }

  return { cycleId: cycle.id, macros };
}
