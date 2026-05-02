import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("contentId");

  if (contentId) {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_contentId: {
          userId: (session.user as any).id,
          contentId,
        },
      },
    });
    return NextResponse.json({ isFavorite: !!favorite });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: (session.user as any).id },
    include: { content: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(favorites);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contentId } = await req.json();

  const favorite = await prisma.favorite.upsert({
    where: {
      userId_contentId: {
        userId: (session.user as any).id,
        contentId,
      },
    },
    update: {},
    create: {
      userId: (session.user as any).id,
      contentId,
    },
  });

  return NextResponse.json(favorite);
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contentId } = await req.json();

  await prisma.favorite.deleteMany({
    where: {
      userId: (session.user as any).id,
      contentId,
    },
  });

  return NextResponse.json({ success: true });
}