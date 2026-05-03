import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getContentByType(type: string, limit = 12) {
  return prisma.content.findMany({
    where: { type: type as any },
    take: limit,
    orderBy: { createdAt: "desc" },
    include: { genres: { include: { genre: true } } },
  });
}

async function getFeatured() {
  return prisma.content.findFirst({
    orderBy: { views: "desc" },
    include: { genres: { include: { genre: true } } },
  });
}

async function getPopular(limit = 12) {
  return prisma.content.findMany({
    orderBy: { views: "desc" },
    take: limit,
    include: { genres: { include: { genre: true } } },
  });
}

async function getNewest(limit = 12) {
  return prisma.content.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { genres: { include: { genre: true } } },
  });
}

function ContentCard({ item }: { item: any }) {
  const typeLabel: Record<string, string> = {
    MOVIE: "Фільм", SERIES: "Серіал", ANIME: "Аніме", CARTOON: "Мультик",
  };

  return (
    <Link href={`/content/${item.id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
      <div style={{ width: "160px", borderRadius: "4px", overflow: "hidden", background: "#1f1f1f", position: "relative" }}>
        <div style={{ position: "relative" }}>
          <img
            src={item.poster || "/no-image.jpg"}
            alt={item.title}
            style={{ width: "160px", height: "240px", objectFit: "cover", display: "block" }}
          />
          <div style={{
            position: "absolute", top: "8px", left: "8px",
            background: "rgba(0,0,0,0.7)", color: "#fff", fontSize: "10px",
            fontWeight: 700, padding: "2px 6px", borderRadius: "2px",
          }}>
            {typeLabel[item.type]}
          </div>
          {item.rating > 0 && (
            <div style={{
              position: "absolute", top: "8px", right: "8px",
              background: "rgba(0,0,0,0.7)", color: "#46d369", fontSize: "11px",
              fontWeight: 700, padding: "2px 6px", borderRadius: "2px",
            }}>
              ⭐ {item.rating.toFixed(1)}
            </div>
          )}
        </div>
        <div style={{ padding: "8px 10px" }}>
          <p style={{
            color: "#e5e5e5", fontSize: "13px", fontWeight: 600,
            margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {item.title}
          </p>
          <p style={{ color: "#777", fontSize: "11px", margin: 0 }}>{item.year}</p>
        </div>
      </div>
    </Link>
  );
}

function ContentRow({ title, items, href }: { title: string; items: any[]; href?: string }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: "48px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", paddingLeft: "4rem", paddingRight: "4rem" }}>
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: 0 }}>{title}</h2>
        {href && (
          <Link href={href} style={{ color: "#bcbcbc", fontSize: "14px", textDecoration: "none", fontWeight: 600 }}>
            Дивитись все →
          </Link>
        )}
      </div>
      <div style={{
        display: "flex", gap: "8px",
        overflowX: "auto", paddingLeft: "4rem", paddingRight: "4rem",
        scrollbarWidth: "none", msOverflowStyle: "none",
      }}>
        {items.map(item => <ContentCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

export default async function Home() {
  const [featured, popular, newest, movies, series, anime, cartoons] = await Promise.all([
    getFeatured(),
    getPopular(),
    getNewest(),
    getContentByType("MOVIE"),
    getContentByType("SERIES"),
    getContentByType("ANIME"),
    getContentByType("CARTOON"),
  ]);

  return (
    <div style={{ background: "#141414", minHeight: "100vh", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* HERO */}
      {featured ? (
        <div style={{ position: "relative", height: "85vh", overflow: "hidden", marginBottom: "40px" }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `url(${featured.backdrop || featured.poster || "/no-image.jpg"})`,
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
              {featured.type === "MOVIE" ? "Фільм" : featured.type === "SERIES" ? "Серіал" : featured.type === "ANIME" ? "Аніме" : "Мультик"}
            </div>

            <h1 style={{
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.05,
              textShadow: "2px 4px 20px rgba(0,0,0,0.9)", marginBottom: "12px", color: "#fff",
            }}>
              {featured.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", marginBottom: "16px" }}>
              <span style={{ color: "#46d369", fontWeight: 700 }}>{featured.year}</span>
              {featured.duration && (
                <span style={{ color: "#bcbcbc" }}>{Math.floor(featured.duration / 60)}h {featured.duration % 60}m</span>
              )}
              {featured.rating > 0 && (
                <span style={{ color: "#46d369", fontWeight: 700 }}>⭐ {featured.rating.toFixed(1)}</span>
              )}
              <span style={{ border: "1px solid #777", color: "#bcbcbc", fontSize: "11px", padding: "1px 6px", borderRadius: "2px" }}>HD</span>
            </div>

            <p style={{
              color: "#e5e5e5", fontSize: "15px", lineHeight: 1.65,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const,
              overflow: "hidden", marginBottom: "24px", maxWidth: "500px",
            }}>
              {featured.description}
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <Link href={`/content/${featured.id}`} style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#fff", color: "#000", padding: "12px 32px",
                borderRadius: "4px", fontWeight: 700, fontSize: "16px", textDecoration: "none",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "#000" }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
                Дивитись
              </Link>
              <Link href={`/content/${featured.id}`} style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(109,109,110,0.7)", color: "#fff", padding: "12px 24px",
                borderRadius: "4px", fontWeight: 700, fontSize: "16px", textDecoration: "none",
              }}>
                Детальніше
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ height: "85vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "16px" }}>
          <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 900 }}>CINEMAX</h1>
          <p style={{ color: "#bcbcbc", fontSize: "16px" }}>Контент ще не додано</p>
          <Link href="/admin" style={{
            background: "#E50914", color: "#fff", padding: "10px 24px",
            borderRadius: "4px", fontWeight: 700, textDecoration: "none",
          }}>
            Додати контент в адмін панелі
          </Link>
        </div>
      )}

      {/* CONTENT ROWS */}
      <div style={{ paddingBottom: "60px" }}>
        <ContentRow title="Популярне" items={popular} href="/movies" />
        <ContentRow title="Новинки" items={newest} href="/movies" />
        <ContentRow title="Фільми" items={movies} href="/movies?type=MOVIE" />
        <ContentRow title="Серіали" items={series} href="/movies?type=SERIES" />
        <ContentRow title="Аніме" items={anime} href="/movies?type=ANIME" />
        <ContentRow title="Мультики" items={cartoons} href="/movies?type=CARTOON" />
      </div>
    </div>
  );
}