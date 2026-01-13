import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos invalidos." }, { status: 400 });
    }

    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return NextResponse.json({ error: "El email ya esta registrado." }, { status: 409 });
    }

    const passwordHash = await hash(password, 10);
    const role =
      process.env.SUPERADMIN_EMAIL?.toLowerCase() === email.toLowerCase()
        ? "SUPERADMIN"
        : "USER";

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        entitlement: "FREE",
        accessWeeks: 1,
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "No se pudo crear el usuario. Verifica la base de datos." },
      { status: 500 }
    );
  }
}
