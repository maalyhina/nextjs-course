import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contentId, text, rating } = await req.json();

  const review = await prisma.review.upsert({
    where: { userId_contentId: { userId: (session.user as any).id, contentId } },
    update: { text, rating },
    create: { userId: (session.user as any).id, contentId, text, rating },
  });

  const avg = await prisma.review.aggregate({
    where: { contentId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.content.update({
    where: { id: contentId },
    data: { rating: avg._avg.rating || 0, reviewCount: avg._count },
  });

  return NextResponse.json(review);
}