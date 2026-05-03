import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { contentId, episodeId, progress } = await req.json();
  const userId = (session.user as any).id;

  const existing = await prisma.watchHistory.findFirst({
    where: { userId, contentId, episodeId: episodeId || null },
  });

  if (existing) {
    await prisma.watchHistory.update({
      where: { id: existing.id },
      data: { progress, watchedAt: new Date() },
    });
  } else {
    await prisma.watchHistory.create({
      data: { userId, contentId, episodeId: episodeId || null, progress },
    });
  }

  return NextResponse.json({ success: true });
}