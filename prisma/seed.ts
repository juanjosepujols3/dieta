import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const recipes = [
  {
    name: "Bowl proteico de pollo",
    description: "Pollo a la plancha con quinoa y vegetales asados.",
    tags: ["high_protein", "quick", "budget"],
    calories: 520,
    proteinGrams: 45,
    carbsGrams: 48,
    fatGrams: 14,
    defaultServing: "1 bowl",
    ingredients: ["pollo", "quinoa", "brocoli", "zanahoria", "aceite de oliva"],
    instructions: ["Asa el pollo", "Cocina la quinoa", "Mezcla todo"],
  },
  {
    name: "Pescado caribeno al horno",
    description: "Filete de pescado con limon y especias dominicanas.",
    tags: ["dominican", "low_carb", "high_protein"],
    calories: 410,
    proteinGrams: 38,
    carbsGrams: 12,
    fatGrams: 20,
    defaultServing: "1 filete",
    ingredients: ["pescado", "limon", "ajo", "oregano", "aceite"],
    instructions: ["Marina el pescado", "Hornea 18 min"],
  },
  {
    name: "Ensalada mediterranea",
    description: "Vegetales frescos con queso feta y garbanzos.",
    tags: ["vegetarian", "quick", "budget"],
    calories: 360,
    proteinGrams: 16,
    carbsGrams: 42,
    fatGrams: 14,
    defaultServing: "1 plato",
    ingredients: ["lechuga", "tomate", "garbanzos", "feta"],
    instructions: ["Corta vegetales", "Mezcla"],
  },
  {
    name: "Avena power",
    description: "Avena con yogurt griego y frutas.",
    tags: ["budget", "quick"],
    calories: 340,
    proteinGrams: 20,
    carbsGrams: 45,
    fatGrams: 8,
    defaultServing: "1 bowl",
    ingredients: ["avena", "yogurt griego", "frutas", "miel"],
    instructions: ["Mezcla todo", "Sirve frio"],
  },
  {
    name: "Tacos de pavo",
    description: "Pavo molido con tortillas integrales y pico de gallo.",
    tags: ["high_protein", "quick"],
    calories: 480,
    proteinGrams: 36,
    carbsGrams: 44,
    fatGrams: 16,
    defaultServing: "2 tacos",
    ingredients: ["pavo molido", "tortillas", "tomate", "cebolla"],
    instructions: ["Saltea el pavo", "Arma tacos"],
  },
  {
    name: "Salteado vegano",
    description: "Tofu con vegetales y salsa de soya baja en sodio.",
    tags: ["vegan", "low_carb", "quick"],
    calories: 390,
    proteinGrams: 24,
    carbsGrams: 28,
    fatGrams: 18,
    defaultServing: "1 bowl",
    ingredients: ["tofu", "pimientos", "brocoli", "soya"],
    instructions: ["Saltea tofu", "Agrega vegetales"],
  },
  {
    name: "Carne guisada ligera",
    description: "Carne magra con vegetales estilo dominicano.",
    tags: ["dominican", "high_protein"],
    calories: 540,
    proteinGrams: 42,
    carbsGrams: 36,
    fatGrams: 22,
    defaultServing: "1 plato",
    ingredients: ["carne magra", "tomate", "pimientos"],
    instructions: ["Sofrie", "Cocina a fuego lento"],
  },
  {
    name: "Omelette verde",
    description: "Huevos con espinaca, champinones y queso ligero.",
    tags: ["low_carb", "high_protein", "quick"],
    calories: 300,
    proteinGrams: 26,
    carbsGrams: 8,
    fatGrams: 18,
    defaultServing: "1 omelette",
    ingredients: ["huevo", "espinaca", "champinones"],
    instructions: ["Bate huevos", "Cocina con vegetales"],
  },
  {
    name: "Buddha bowl",
    description: "Arroz integral con vegetales, aguacate y frijoles.",
    tags: ["vegetarian", "budget"],
    calories: 500,
    proteinGrams: 18,
    carbsGrams: 62,
    fatGrams: 18,
    defaultServing: "1 bowl",
    ingredients: ["arroz integral", "frijoles", "aguacate", "vegetales"],
    instructions: ["Cocina arroz", "Arma bowl"],
  },
  {
    name: "Wrap keto",
    description: "Lechuga wrap con pollo y aderezo de yogurt.",
    tags: ["keto", "low_carb", "high_protein"],
    calories: 320,
    proteinGrams: 30,
    carbsGrams: 10,
    fatGrams: 16,
    defaultServing: "2 wraps",
    ingredients: ["pollo", "lechuga", "yogurt", "pepino"],
    instructions: ["Corta ingredientes", "Enrolla"],
  },
];

async function main() {
  await prisma.recipe.deleteMany();
  await prisma.recipe.createMany({
    data: recipes.map((recipe) => ({
      ...recipe,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
    })),
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
