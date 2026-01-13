const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

type FoodNutrient = { nutrientName?: string; nutrient?: { name?: string }; value?: number };
type FoodDetails = { foodNutrients?: FoodNutrient[]; servingSize?: number; servingSizeUnit?: string };

const nutrientMap = {
  calories: ["Energy", "Energy (Atwater General Factors)", "Energy (Atwater Specific Factors)", "Calories"],
  protein: ["Protein"],
  carbs: ["Carbohydrate, by difference", "Carbohydrate"],
  fat: ["Total lipid (fat)", "Total lipid"],
} as const;

function findNutrientValue(nutrients: FoodNutrient[], names: string[]) {
  const nutrient = nutrients.find((item) => {
    const name = item.nutrientName ?? item.nutrient?.name;
    return name ? names.includes(name) : false;
  });
  return nutrient?.value ?? 0;
}

export async function searchFood(query: string) {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) throw new Error("USDA_API_KEY missing");

  const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(query)}&pageSize=1&api_key=${apiKey}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("USDA search failed");
  }
  const data = await response.json();
  return data.foods?.[0] ?? null;
}

export async function getFoodDetails(fdcId: number): Promise<FoodDetails> {
  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) throw new Error("USDA_API_KEY missing");

  const response = await fetch(`${USDA_BASE}/food/${fdcId}?api_key=${apiKey}`);
  if (!response.ok) {
    throw new Error("USDA details failed");
  }
  return response.json();
}

export function extractMacros(food: FoodDetails) {
  const nutrients = food.foodNutrients ?? [];
  const calories = findNutrientValue(nutrients, nutrientMap.calories as unknown as string[]);
  const protein = findNutrientValue(nutrients, nutrientMap.protein as unknown as string[]);
  const carbs = findNutrientValue(nutrients, nutrientMap.carbs as unknown as string[]);
  const fat = findNutrientValue(nutrients, nutrientMap.fat as unknown as string[]);

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
  };
}
