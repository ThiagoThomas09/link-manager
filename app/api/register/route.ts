import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  // gerar o hash da senha
  const hashedPassword = await bcrypt.hash(password, 10);

  // criar usuário
  const user = await prisma.user.create({
    data: { email, password: hashedPassword },
  });

  return NextResponse.json(
    { id: user.id, email: user.email },
    { status: 201 }
  );
}
