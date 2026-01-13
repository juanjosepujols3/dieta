import { z } from "zod";

const detectionSchema = z.array(
  z.object({
    name: z.string(),
    portion_guess: z.string().optional(),
    quantity_guess: z.number().optional(),
    confidence: z.number().min(0).max(1).optional(),
  })
);

export async function detectFoodsFromImage(base64: string, mimeType = "image/jpeg") {
  if (!process.env.OPENAI_API_KEY) {
    return [
      {
        name: "arroz blanco",
        portion_guess: "1 taza",
        quantity_guess: 1,
        confidence: 0.5,
      },
      {
        name: "pollo guisado",
        portion_guess: "150 g",
        quantity_guess: 1,
        confidence: 0.6,
      },
    ];
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Detecta alimentos en una foto y responde solo con JSON array. Campos: name, portion_guess, quantity_guess, confidence.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${base64}` },
            },
          ],
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    throw new Error("Vision provider failed");
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? "[]";
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = detectionSchema.safeParse(JSON.parse(cleaned));

  if (!parsed.success) {
    throw new Error("Vision response invalid");
  }

  return parsed.data;
}
