import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import ContentForm from "../ContentForm";

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const { id } = await params;
  const [content, genres] = await Promise.all([
    prisma.content.findUnique({
      where: { id },
      include: { genres: true },
    }),
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!content) notFound();

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <Link href="/admin/content" style={{ color: "#777", textDecoration: "none", fontSize: "14px" }}>← Назад</Link>
          <h1 style={{ fontSize: "24px", fontWeight: 900 }}>Редагувати: {content.title}</h1>
        </div>
        <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "32px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <ContentForm initial={content} genres={genres} />
        </div>
      </div>
    </div>
  );
}