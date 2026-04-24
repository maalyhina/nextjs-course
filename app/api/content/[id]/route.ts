import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title, description, poster, backdrop, trailerUrl, videoUrl, type, year, duration, country, genreIds } = await req.json();

  await prisma.contentGenre.deleteMany({ where: { contentId: id } });

  const content = await prisma.content.update({
    where: { id },
    data: {
      title, description, poster, backdrop, trailerUrl, videoUrl,
      type, year, duration, country,
      genres: {
        create: genreIds?.map((gid: string) => ({ genre: { connect: { id: gid } } })) || [],
      },
    },
  });

  return NextResponse.json(content);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.content.delete({ where: { id } });

  return NextResponse.json({ success: true });
}