import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/app/lib/auth";

// Criar novo link
export async function POST(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { folderId, title, url, notes } = await req.json();

  if (!folderId || !title || !url) {
    return NextResponse.json(
      { error: "folderId, title e url são obrigatórios" },
      { status: 400 }
    );
  }

  // Confere se a pasta pertence ao usuário
  const folder = await prisma.folder.findUnique({ where: { id: folderId } });
  if (!folder || folder.userId !== userId) {
    return NextResponse.json({ error: "Pasta não encontrada" }, { status: 404 });
  }

  const link = await prisma.link.create({
    data: { folderId, title, url, notes },
  });

  return NextResponse.json(link, { status: 201 });
}

// Listar links de uma pasta
export async function GET(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  if (!folderId) {
    return NextResponse.json(
      { error: "folderId é obrigatório" },
      { status: 400 }
    );
  }

  // Confere se a pasta pertence ao usuário
  const folder = await prisma.folder.findUnique({ where: { id: Number(folderId) } });
  if (!folder || folder.userId !== userId) {
    return NextResponse.json({ error: "Pasta não encontrada" }, { status: 404 });
  }

  const links = await prisma.link.findMany({
    where: { folderId: Number(folderId) },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(links, { status: 200 });
}
