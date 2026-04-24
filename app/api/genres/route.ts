import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(genres);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name } = await req.json();
  const genre = await prisma.genre.create({ data: { name } });
  return NextResponse.json(genre);
}