import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const actors = await prisma.actor.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(actors);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { name, photo } = await req.json();
  const actor = await prisma.actor.create({ data: { name, photo } });
  return NextResponse.json(actor);
}