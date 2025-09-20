import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/app/lib/auth";

// Criar nova pasta
export async function POST(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name) {
    return NextResponse.json({ error: "name é obrigatório" }, { status: 400 });
  }

  const folder = await prisma.folder.create({
    data: { name, userId },
  });

  return NextResponse.json(folder, { status: 201 });
}

// Listar pastas
export async function GET(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const folders = await prisma.folder.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(folders, { status: 200 });
}

// Editar pasta
export async function PUT(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, name } = await req.json();
  if (!id || !name) {
    return NextResponse.json({ error: "id e name são obrigatórios" }, { status: 400 });
  }

  const folder = await prisma.folder.findUnique({ where: { id: Number(id) } });
  if (!folder || folder.userId !== userId) {
    return NextResponse.json({ error: "Pasta não encontrada" }, { status: 404 });
  }

  const updated = await prisma.folder.update({
    where: { id: Number(id) },
    data: { name },
  });

  return NextResponse.json(updated, { status: 200 });
}

// Remover pasta (e links dentro)
export async function DELETE(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  const folder = await prisma.folder.findUnique({
    where: { id: Number(id) },
    include: { links: true },
  });

  if (!folder || folder.userId !== userId) {
    return NextResponse.json({ error: "Pasta não encontrada" }, { status: 404 });
  }

  // Deleta todos os links da pasta antes
  await prisma.link.deleteMany({ where: { folderId: Number(id) } });

  // Deleta a pasta
  await prisma.folder.delete({ where: { id: Number(id) } });

  return NextResponse.json({ message: "Pasta e links deletados com sucesso" }, { status: 200 });
}
