import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ContentForm from "../ContentForm";

export default async function NewContentPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const [genres, actors] = await Promise.all([
    prisma.genre.findMany({ orderBy: { name: "asc" } }),
    prisma.actor.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <Link href="/admin/content" style={{ color: "#777", textDecoration: "none", fontSize: "14px" }}>← Назад</Link>
          <h1 style={{ fontSize: "24px", fontWeight: 900 }}>Додати контент</h1>
        </div>
        <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "32px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <ContentForm genres={genres} actors={actors} />
        </div>
      </div>
    </div>
  );
}