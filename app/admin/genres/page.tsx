import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import GenreForm from "./GenreForm";
import DeleteGenreButton from "./DeleteGenreButton";

export default async function AdminGenresPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const genres = await prisma.genre.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { contents: true } } },
  });

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <Link href="/admin" style={{ color: "#777", textDecoration: "none", fontSize: "14px" }}>← Назад</Link>
          <h1 style={{ fontSize: "24px", fontWeight: 900 }}>Жанри ({genres.length})</h1>
        </div>

        {/* Add genre form */}
        <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Додати жанр</h2>
          <GenreForm />
        </div>

        {/* Genres list */}
        <div style={{ background: "#1f1f1f", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          {genres.map((genre: any) => (
            <div key={genre.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div>
                <span style={{ color: "#e5e5e5", fontSize: "15px", fontWeight: 600 }}>{genre.name}</span>
                <span style={{ color: "#777", fontSize: "13px", marginLeft: "12px" }}>{genre._count.contents} контент</span>
              </div>
              <DeleteGenreButton id={genre.id} />
            </div>
          ))}
          {genres.length === 0 && (
            <div style={{ padding: "24px", color: "#777", textAlign: "center" }}>Жанрів ще немає</div>
          )}
        </div>
      </div>
    </div>
  );
}