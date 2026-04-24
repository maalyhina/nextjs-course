import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToFavorites from "./AddToFavorites";
import ReviewForm from "./ReviewForm";

export default async function ContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const content = await prisma.content.findUnique({
    where: { id },
    include: {
      genres: { include: { genre: true } },
      actors: { include: { actor: true } },
      seasons: {
        orderBy: { number: "asc" },
        include: {
          episodes: { orderBy: { number: "asc" } },
        },
      },
      reviews: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!content) notFound();

  const similar = await prisma.content.findMany({
    where: { type: content.type, id: { not: content.id } },
    take: 6,
    orderBy: { views: "desc" },
  });

  const isSeries = content.type === "SERIES" || content.type === "ANIME";
  const runtime = content.duration
    ? `${Math.floor(content.duration / 60)}h ${content.duration % 60}m`
    : null;
  const genres = content.genres.map((g: any) => g.genre.name).join(", ");

  return (
    <div style={{ background: "#141414", minHeight: "100vh", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: "#fff" }}>

      <div style={{ position: "relative", height: "80vh", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${content.backdrop || content.poster || "/no-image.jpg"})`,
          backgroundSize: "cover", backgroundPosition: "center top",
          transform: "scale(1.04)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #141414 30%, rgba(20,20,20,0.5) 70%, transparent 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #141414 0%, transparent 60%)" }} />

        <div style={{ position: "absolute", bottom: 0, left: 0, padding: "0 4rem 3.5rem", maxWidth: "650px" }}>
          <div style={{
            display: "inline-block", color: "#E50914", fontSize: "11px", fontWeight: 900,
            letterSpacing: "0.25em", textTransform: "uppercase" as const,
            border: "1px solid rgba(229,9,20,0.5)", padding: "2px 8px", borderRadius: "2px", marginBottom: "14px",
          }}>
            {content.type === "MOVIE" ? "Фільм" : content.type === "SERIES" ? "Серіал" : content.type === "ANIME" ? "Аніме" : "Мультик"}
          </div>

          <h1 style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.05, marginBottom: "12px" }}>
            {content.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", marginBottom: "16px" }}>
            <span style={{ color: "#46d369", fontWeight: 700 }}>{content.year}</span>
            {runtime && <span style={{ color: "#bcbcbc" }}>{runtime}</span>}
            {content.country && <span style={{ color: "#bcbcbc" }}>{content.country}</span>}
            <span style={{ border: "1px solid #777", color: "#bcbcbc", fontSize: "11px", padding: "1px 6px", borderRadius: "2px" }}>HD</span>
          </div>

          <p style={{
            color: "#e5e5e5", fontSize: "15px", lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const,
            overflow: "hidden", marginBottom: "24px", maxWidth: "500px",
          }}>
            {content.description}
          </p>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            {content.trailerUrl && (
              <a href={content.trailerUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#fff", color: "#000", padding: "10px 28px",
                borderRadius: "4px", fontWeight: 700, fontSize: "16px", textDecoration: "none",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "#000" }}><path d="M8 5v14l11-7z" /></svg>
                Трейлер
              </a>
            )}
            <AddToFavorites contentId={content.id} />
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 4rem 80px", display: "grid", gridTemplateColumns: "2fr 1fr", gap: "48px" }}>
        <div>
          <p style={{ color: "#d2d2d2", fontSize: "15px", lineHeight: 1.75, marginBottom: "40px" }}>
            {content.description}
          </p>
          {!isSeries && content.videoUrl && (
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Дивитись</h2>
              <div style={{ borderRadius: "6px", overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                <video
                  controls
                  style={{ width: "100%", maxHeight: "450px", display: "block" }}
                  src={content.videoUrl}
                />
              </div>
            </div>
          )}
          {content.trailerUrl && (
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Трейлер</h2>
              <div style={{ borderRadius: "6px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
                <iframe
                  width="100%"
                  height="380"
                  src={content.trailerUrl.replace("watch?v=", "embed/")}
                  title="Trailer"
                  allowFullScreen
                  style={{ display: "block" }}
                />
              </div>
            </div>
          )}
          {isSeries && content.seasons.length > 0 && (
            <div style={{ marginBottom: "40px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Епізоди</h2>
              {content.seasons.map((season: any) => (
                <div key={season.id} style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#e5e5e5", marginBottom: "12px" }}>
                    Сезон {season.number}{season.title ? ` — ${season.title}` : ""}
                  </h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {season.episodes.map((ep: any) => (
                      <div key={ep.id} style={{
                        background: "#1f1f1f", borderRadius: "4px", padding: "12px 16px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}>
                        <div>
                          <span style={{ color: "#777", fontSize: "13px", marginRight: "12px" }}>
                            E{ep.number}
                          </span>
                          <span style={{ color: "#e5e5e5", fontSize: "14px" }}>{ep.title}</span>
                        </div>
                        {ep.duration && (
                          <span style={{ color: "#777", fontSize: "13px" }}>{ep.duration} хв</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
              Відгуки {content.reviews.length > 0 && `(${content.reviews.length})`}
            </h2>
            <ReviewForm contentId={content.id} />
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              {content.reviews.map((review: any) => (
                <div key={review.id} style={{
                  background: "#1f1f1f", borderRadius: "6px", padding: "16px",
                  border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ color: "#e5e5e5", fontWeight: 600, fontSize: "14px" }}>
                      {review.user.name || review.user.email}
                    </span>
                    <span style={{ color: "#46d369", fontWeight: 700 }}>⭐ {review.rating}/10</span>
                  </div>
                  <p style={{ color: "#bcbcbc", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ paddingTop: "4px", fontSize: "14px", lineHeight: 1.8" }}>
          {[
            { label: "Рік", value: content.year },
            content.country ? { label: "Країна", value: content.country } : null,
            genres ? { label: "Жанри", value: genres } : null,
            runtime ? { label: "Тривалість", value: runtime } : null,
            content.rating > 0 ? { label: "Рейтинг", value: `⭐ ${content.rating.toFixed(1)}/10` } : null,
          ].filter(Boolean).map((row: any) => (
            <div key={row.label} style={{ marginBottom: "16px" }}>
              <div style={{ color: "#777", marginBottom: "2px" }}>{row.label}</div>
              <div style={{ color: "#e5e5e5" }}>{row.value}</div>
            </div>
          ))}

          {content.actors.length > 0 && (
            <div style={{ marginBottom: "16px" }}>
              <div style={{ color: "#777", marginBottom: "8px" }}>Актори</div>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {content.actors.slice(0, 5).map((ca: any) => (
                  <div key={ca.actorId} style={{ color: "#e5e5e5", fontSize: "13px" }}>
                    {ca.actor.name}
                    {ca.role && <span style={{ color: "#777" }}> — {ca.role}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {similar.length > 0 && (
        <div style={{ paddingBottom: "60px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px", paddingLeft: "4rem" }}>
            Схожий контент
          </h2>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingLeft: "4rem", paddingRight: "4rem", scrollbarWidth: "none" }}>
            {similar.map((item: any) => (
              <Link key={item.id} href={`/content/${item.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{ width: "160px" }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <img
                    src={item.poster || "/no-image.jpg"}
                    alt={item.title}
                    style={{ width: "160px", height: "240px", objectFit: "cover", borderRadius: "4px", display: "block" }}
                  />
                  <p style={{ color: "#e5e5e5", fontSize: "13px", marginTop: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}