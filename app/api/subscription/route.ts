import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  const userId = (session.user as any).id;

  const expiresAt = plan === "FREE" ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const subscription = await prisma.subscription.upsert({
    where: { userId },
    update: { plan, expiresAt },
    create: { userId, plan, expiresAt },
  });

  return NextResponse.json(subscription);
}