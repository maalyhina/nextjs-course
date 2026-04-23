import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");

  const where: any = {};
  if (type) where.type = type;
  if (search) where.title = { contains: search, mode: "insensitive" };

  const content = await prisma.content.findMany({
    where,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      genres: { include: { genre: true } },
    },
  });

  return NextResponse.json(content);
}