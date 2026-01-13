export async function fetchProductByBarcode(barcode: string) {
  const response = await fetch(
    `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data.status !== 1) {
    return null;
  }

  const product = data.product;
  const nutriments = product?.nutriments ?? {};

  const calories = Number(nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"]);
  const protein = Number(nutriments["proteins_100g"] ?? nutriments["proteins"]);
  const carbs = Number(nutriments["carbohydrates_100g"] ?? nutriments["carbohydrates"]);
  const fat = Number(nutriments["fat_100g"] ?? nutriments["fat"]);

  if ([calories, protein, carbs, fat].some((value) => Number.isNaN(value))) {
    return null;
  }

  return {
    name: product.product_name || product.generic_name || "Producto",
    serving: product.serving_size || "100 g",
    macros: {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    },
  };
}
