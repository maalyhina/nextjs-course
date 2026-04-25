import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import SeasonForm from "./SeasonForm";
import EpisodeForm from "./EpisodeForm";
import DeleteSeasonButton from "./DeleteSeasonButton";
import DeleteEpisodeButton from "./DeleteEpisodeButton";

export default async function AdminSeasonsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const { id } = await params;

  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      seasons: {
        orderBy: { number: "asc" },
        include: {
          episodes: { orderBy: { number: "asc" } },
        },
      },
    },
  });

  if (!content) notFound();

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <Link href="/admin/content" style={{ color: "#777", textDecoration: "none", fontSize: "14px" }}>← Назад</Link>
          <h1 style={{ fontSize: "24px", fontWeight: 900 }}>
            {content.title} — Сезони та епізоди
          </h1>
        </div>

        {/* Add season */}
        <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", marginBottom: "32px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Додати сезон</h2>
          <SeasonForm contentId={id} nextNumber={content.seasons.length + 1} />
        </div>

        {/* Seasons list */}
        {content.seasons.map((season: any) => (
          <div key={season.id} style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>
                Сезон {season.number}{season.title ? ` — ${season.title}` : ""}
                <span style={{ color: "#777", fontSize: "14px", fontWeight: 400, marginLeft: "12px" }}>
                  {season.episodes.length} епізодів
                </span>
              </h2>
              <DeleteSeasonButton id={season.id} />
            </div>

            {/* Episodes list */}
            {season.episodes.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                {season.episodes.map((ep: any) => (
                  <div key={ep.id} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 14px", background: "#141414", borderRadius: "4px",
                    marginBottom: "6px", border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div>
                      <span style={{ color: "#777", fontSize: "13px", marginRight: "12px" }}>E{ep.number}</span>
                      <span style={{ color: "#e5e5e5", fontSize: "14px" }}>{ep.title}</span>
                      {ep.duration && <span style={{ color: "#777", fontSize: "13px", marginLeft: "12px" }}>{ep.duration} хв</span>}
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      {ep.videoUrl && <span style={{ color: "#46d369", fontSize: "12px" }}>✓ Відео</span>}
                      <DeleteEpisodeButton id={ep.id} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add episode */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "16px" }}>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#777", marginBottom: "12px" }}>
                Додати епізод до сезону {season.number}
              </h3>
              <EpisodeForm seasonId={season.id} nextNumber={season.episodes.length + 1} />
            </div>
          </div>
        ))}

        {content.seasons.length === 0 && (
          <div style={{ color: "#777", textAlign: "center", padding: "40px" }}>
            Сезонів ще немає. Додайте перший сезон вище.
          </div>
        )}
      </div>
    </div>
  );
}