import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AddToFavorites from "@/components/content/AddToFavorites";
import ReviewForm from "@/components/content/ReviewForm";
import EpisodePlayer from "@/components/content/EpisodePlayer";
import VideoPlayer from "@/components/content/VideoPlayer";
import Image from "next/image";

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

  await prisma.content.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  const session = await getServerSession(authOptions);
  if (session?.user) {
    const existing = await prisma.watchHistory.findFirst({
      where: {
        userId: (session.user as any).id,
        contentId: id,
        episodeId: null,
      },
    });

    if (existing) {
      await prisma.watchHistory.update({
        where: { id: existing.id },
        data: { watchedAt: new Date() },
      });
    } else {
      await prisma.watchHistory.create({
        data: {
          userId: (session.user as any).id,
          contentId: id,
          episodeId: null,
        },
      });
    }
  }

  const similar = await prisma.content.findMany({
    where: { type: content.type, id: { not: content.id } },
    take: 8,
    orderBy: { views: "desc" },
  });

  const isSeries = content.type === "SERIES" || content.type === "ANIME";
  const runtime = content.duration
    ? `${Math.floor(content.duration / 60)}h ${content.duration % 60}m`
    : null;
  const genres = content.genres.map((g: any) => g.genre.name).join(", ");

  const typeLabel =
    content.type === "MOVIE" ? "Фільм" :
    content.type === "SERIES" ? "Серіал" :
    content.type === "ANIME" ? "Аніме" : "Мультик";

  return (
    <div style={{ background: "#141414", minHeight: "100vh", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", color: "#fff" }}>

      {/* HERO */}
      <div style={{ position: "relative", height: "80vh", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${content.backdrop || content.poster || "/no-image.jpg"})`,
          backgroundSize: "cover", backgroundPosition: "center top",
          transform: "scale(1.04)",
        }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #141414 30%, rgba(20,20,20,0.5) 70%, transparent 100%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #141414 0%, transparent 60%)" }} />

        {/* hero-content — адаптивний через CSS клас */}
        <div className="hero-content">
          <div style={{
            display: "inline-block", color: "#E50914", fontSize: "11px", fontWeight: 900,
            letterSpacing: "0.25em", textTransform: "uppercase",
            border: "1px solid rgba(229,9,20,0.5)", padding: "2px 8px", borderRadius: "2px", marginBottom: "14px",
          }}>
            {typeLabel}
          </div>

          <h1 style={{ fontSize: "clamp(1.6rem, 4.5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.05, marginBottom: "12px" }}>
            {content.title}
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", marginBottom: "16px", flexWrap: "wrap" }}>
            <span style={{ color: "#46d369", fontWeight: 700 }}>{content.year}</span>
            {runtime && <span style={{ color: "#bcbcbc" }}>{runtime}</span>}
            {content.country && <span style={{ color: "#bcbcbc" }}>{content.country}</span>}
            {content.rating > 0 && <span style={{ color: "#46d369", fontWeight: 700 }}>⭐ {content.rating.toFixed(1)}</span>}
            <span style={{ border: "1px solid #777", color: "#bcbcbc", fontSize: "11px", padding: "1px 6px", borderRadius: "2px" }}>HD</span>
          </div>

          <p style={{
            color: "#e5e5e5", fontSize: "15px", lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
            overflow: "hidden", marginBottom: "24px", maxWidth: "500px",
          }}>
            {content.description}
          </p>

          {/* hero-actions — flex wrap через CSS клас */}
          <div className="hero-actions">
            {!isSeries && content.videoUrl && (
              <a href="#player" style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#fff", color: "#000", padding: "10px 28px",
                borderRadius: "4px", fontWeight: 700, fontSize: "16px", textDecoration: "none",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "#000" }}><path d="M8 5v14l11-7z" /></svg>
                Дивитись
              </a>
            )}
            {isSeries && content.seasons.length > 0 && (
              <a href="#episodes" style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#fff", color: "#000", padding: "10px 28px",
                borderRadius: "4px", fontWeight: 700, fontSize: "16px", textDecoration: "none",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "#000" }}><path d="M8 5v14l11-7z" /></svg>
                Дивитись
              </a>
            )}
            {content.trailerUrl && (
              <a href={content.trailerUrl} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(109,109,110,0.7)", color: "#fff", padding: "10px 24px",
                borderRadius: "4px", fontWeight: 700, fontSize: "16px", textDecoration: "none",
              }}>
                Трейлер
              </a>
            )}
            <AddToFavorites contentId={content.id} />
          </div>
        </div>
      </div>

      {/* MAIN — grid-2 адаптується до 1 колонки на мобільному */}
      <div className="page-container">
        <div className="grid-2">
          <div>
            <p style={{ color: "#d2d2d2", fontSize: "15px", lineHeight: 1.75, marginBottom: "40px" }}>
              {content.description}
            </p>

            {/* Video player */}
            {!isSeries && content.videoUrl && (
              <div id="player" style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Дивитись</h2>
                <div style={{ borderRadius: "6px", overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <VideoPlayer src={content.videoUrl} contentId={id} />
                </div>
              </div>
            )}

            {/* Episodes */}
            {isSeries && content.seasons.length > 0 && (
              <div id="episodes" style={{ marginBottom: "40px" }}>
                <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>Епізоди</h2>
                <EpisodePlayer seasons={content.seasons} />
              </div>
            )}

            {/* Reviews */}
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
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
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

          {/* Sidebar — на мобільному іде після основного контенту */}
          <div style={{ paddingTop: "4px", fontSize: "14px", lineHeight: 1.8 }}>
            {[
              { label: "Рік", value: content.year },
              content.country ? { label: "Країна", value: content.country } : null,
              genres ? { label: "Жанри", value: genres } : null,
              runtime ? { label: "Тривалість", value: runtime } : null,
              content.rating > 0 ? { label: "Рейтинг", value: `⭐ ${content.rating.toFixed(1)}/10` } : null,
              { label: "Переглядів", value: content.views },
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
      </div>

      {/* Similar — горизонтальний скрол, адаптивний padding */}
      {similar.length > 0 && (
        <div style={{ paddingBottom: "60px" }}>
          <h2 className="section-padding" style={{ fontSize: "20px", fontWeight: 700, marginBottom: "16px" }}>
            Схожий контент
          </h2>
          <div className="similar-scroll">
            {similar.map((item: any) => (
              <Link key={item.id} href={`/content/${item.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
                <div style={{ width: "160px" }}>
                  <Image src={item.poster || "/no-image.jpg"} alt={item.title}
                    style={{ width: "160px", height: "240px", objectFit: "cover", borderRadius: "4px", display: "block" }} />
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