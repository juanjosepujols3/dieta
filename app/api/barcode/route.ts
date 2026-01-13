import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { fetchProductByBarcode } from "@/lib/openfoodfacts";
import { extractMacros, getFoodDetails, searchFood } from "@/lib/usda";

const barcodeSchema = z.object({
  barcode: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = barcodeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Codigo invalido" }, { status: 400 });
  }

  try {
    const offProduct = await fetchProductByBarcode(parsed.data.barcode);
    if (offProduct) {
      return NextResponse.json({
        source: "open_food_facts",
        name: offProduct.name,
        serving: offProduct.serving,
        macros: offProduct.macros,
        confidence: 0.9,
      });
    }

    const fallbackQuery = parsed.data.name;
    if (!fallbackQuery) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const found = await searchFood(fallbackQuery);
    if (!found?.fdcId) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
    }

    const details = await getFoodDetails(found.fdcId);
    const macros = extractMacros(details);

    return NextResponse.json({
      source: "usda",
      name: found.description ?? fallbackQuery,
      serving: details.servingSize
        ? `${details.servingSize} ${details.servingSizeUnit ?? "g"}`
        : "100 g",
      macros,
      confidence: 0.6,
    });
  } catch {
    return NextResponse.json({ error: "No pudimos consultar el producto" }, { status: 500 });
  }
}
