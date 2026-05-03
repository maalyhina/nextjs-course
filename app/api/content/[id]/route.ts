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
  const { title, description, poster, backdrop, trailerUrl, videoUrl, type, year, duration, country, genreIds, actorIds, seasons } = await req.json();

  await prisma.contentGenre.deleteMany({ where: { contentId: id } });
  await prisma.contentActor.deleteMany({ where: { contentId: id } });

  const existingSeasons = await prisma.season.findMany({ where: { contentId: id } });
  for (const season of existingSeasons) {
    await prisma.episode.deleteMany({ where: { seasonId: season.id } });
  }
  await prisma.season.deleteMany({ where: { contentId: id } });

  const content = await prisma.content.update({
    where: { id },
    data: {
      title, description, poster, backdrop, trailerUrl, videoUrl,
      type, year, duration, country,
      genres: {
        create: genreIds?.map((gid: string) => ({ genre: { connect: { id: gid } } })) || [],
      },
      actors: {
        create: actorIds?.map((a: any) => ({
          actor: { connect: { id: a.actorId } },
          role: a.role || null,
        })) || [],
      },
      seasons: {
        create: seasons?.map((s: any) => ({
          number: Number(s.number),
          title: s.title || null,
          episodes: {
            create: s.episodes?.map((ep: any) => ({
              number: Number(ep.number),
              title: ep.title,
              videoUrl: ep.videoUrl || "",
              duration: ep.duration ? Number(ep.duration) : null,
            })) || [],
          },
        })) || [],
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