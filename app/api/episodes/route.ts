import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { seasonId, number, title, videoUrl, duration } = await req.json();
  const episode = await prisma.episode.create({ data: { seasonId, number, title, videoUrl, duration } });
  return NextResponse.json(episode);
}