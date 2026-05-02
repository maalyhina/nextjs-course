import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();

  const user = await prisma.user.update({
    where: { id: (session.user as any).id },
    data: { name },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email });
}