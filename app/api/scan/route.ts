import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

import { authOptions } from "@/lib/auth";
import { detectFoodsFromImage } from "@/lib/vision";
import { extractMacros, getFoodDetails, searchFood } from "@/lib/usda";

const MAX_SIZE = 5 * 1024 * 1024;
const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("image");

  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });
  }

  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Tipo de imagen no permitido" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Imagen supera 5MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");

  try {
    const detections = await detectFoodsFromImage(base64, file.type);
    const items = [] as Array<{
      name: string;
      usdaFdcId?: number | null;
      servingText?: string | null;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      confidence: number;
      quantity: number;
    }>;

    for (const detection of detections) {
      const found = await searchFood(detection.name);
      if (!found?.fdcId) continue;
      const details = await getFoodDetails(found.fdcId);
      const macros = extractMacros(details);

      items.push({
        name: found.description ?? detection.name,
        usdaFdcId: found.fdcId,
        servingText: details.servingSize
          ? `${details.servingSize} ${details.servingSizeUnit ?? "g"}`
          : "100 g",
        calories: macros.calories,
        protein: macros.protein,
        carbs: macros.carbs,
        fat: macros.fat,
        confidence: detection.confidence ?? 0.6,
        quantity: detection.quantity_guess ?? 1,
      });
    }

    const totals = items.reduce(
      (acc, item) => {
        acc.calories += item.calories * item.quantity;
        acc.protein += item.protein * item.quantity;
        acc.carbs += item.carbs * item.quantity;
        acc.fat += item.fat * item.quantity;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );

    return NextResponse.json({
      items,
      totals,
      needs_confirmation: true,
    });
  } catch {
    return NextResponse.json({ error: "No pudimos procesar la imagen" }, { status: 500 });
  }
}
