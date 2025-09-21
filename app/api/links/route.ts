import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/auth";

// Criar novo link
export async function POST(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { folderId, title, url, notes } = await req.json();
  if (!folderId || !title || !url) {
    return NextResponse.json(
      { error: "folderId, title e url são obrigatórios" },
      { status: 400 }
    );
  }

  const folder = await prisma.folder.findUnique({ where: { id: Number(folderId) } });
  if (!folder || folder.userId !== userId) {
    return NextResponse.json({ error: "Pasta não encontrada" }, { status: 404 });
  }

  const link = await prisma.link.create({
    data: { folderId: Number(folderId), title, url, notes },
  });

  return NextResponse.json(link, { status: 201 });
}

// Listar links de uma pasta
export async function GET(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  if (!folderId) {
    return NextResponse.json({ error: "folderId é obrigatório" }, { status: 400 });
  }

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

// Editar link existente
export async function PUT(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, title, url, notes } = await req.json();
  if (!id || !title || !url) {
    return NextResponse.json({ error: "id, title e url são obrigatórios" }, { status: 400 });
  }

  const link = await prisma.link.findUnique({ where: { id: Number(id) } });
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  const folder = await prisma.folder.findUnique({ where: { id: link.folderId } });
  if (!folder || folder.userId !== userId) {
    return NextResponse.json({ error: "Não autorizado para alterar este link" }, { status: 403 });
  }

  const updated = await prisma.link.update({
    where: { id: Number(id) },
    data: { title, url, notes },
  });

  return NextResponse.json(updated, { status: 200 });
}

// Remover link
export async function DELETE(req: Request) {
  const userId = getUserIdFromRequest(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

  const link = await prisma.link.findUnique({ where: { id: Number(id) } });
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  const folder = await prisma.folder.findUnique({ where: { id: link.folderId } });
  if (!folder || folder.userId !== userId) {
    return NextResponse.json({ error: "Não autorizado para deletar este link" }, { status: 403 });
  }

  await prisma.link.delete({ where: { id: Number(id) } });
  return NextResponse.json({ message: "Link deletado com sucesso" }, { status: 200 });
}
