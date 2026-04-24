import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");

  const where: any = {};
  if (type) where.type = type;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const content = await prisma.content.findMany({
    where, take: limit,
    orderBy: { createdAt: "desc" },
    include: { genres: { include: { genre: true } } },
  });

  return NextResponse.json(content);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, poster, backdrop, trailerUrl, videoUrl, type, year, duration, country, genreIds } = await req.json();

  const content = await prisma.content.create({
    data: {
      title, description, poster, backdrop, trailerUrl, videoUrl,
      type, year, duration, country,
      genres: {
        create: genreIds?.map((id: string) => ({ genre: { connect: { id } } })) || [],
      },
    },
  });

  return NextResponse.json(content);
}