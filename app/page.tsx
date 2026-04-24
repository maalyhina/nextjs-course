import { prisma } from "@/lib/prisma";
import Link from "next/link";

async function getContentByType(type: string, limit = 10) {
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

function ContentCard({ item }: { item: any }) {
  return (
    <Link href={`/content/${item.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        position: "relative",
        borderRadius: "4px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.2s",
        flexShrink: 0,
        width: "180px",
      }}>
        <img
          src={item.poster || "/no-image.jpg"}
          alt={item.title}
          style={{ width: "180px", height: "270px", objectFit: "cover", display: "block" }}
        />
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(to top, rgba(0,0,0,0.9), transparent)",
          padding: "20px 10px 10px",
        }}>
          <p style={{ color: "#fff", fontSize: "13px", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {item.title}
          </p>
          <p style={{ color: "#46d369", fontSize: "12px", margin: "2px 0 0" }}>
            {item.year}
          </p>
        </div>
      </div>
    </Link>
  );
}

function ContentRow({ title, items }: { title: string; items: any[] }) {
  if (!items.length) return null;
  return (
    <div style={{ marginBottom: "40px" }}>
      <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, marginBottom: "16px", paddingLeft: "4rem" }}>
        {title}
      </h2>
      <div style={{
        display: "flex", gap: "8px", overflowX: "auto", paddingLeft: "4rem", paddingRight: "4rem",
        scrollbarWidth: "none",
      }}>
        {items.map(item => <ContentCard key={item.id} item={item} />)}
      </div>
    </div>
  );
}

export default async function Home() {
  const [featured, movies, series, anime, cartoons] = await Promise.all([
    getFeatured(),
    getContentByType("MOVIE"),
    getContentByType("SERIES"),
    getContentByType("ANIME"),
    getContentByType("CARTOON"),
  ]);

  return (
    <div style={{ background: "#141414", minHeight: "100vh", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

      {/* HERO */}
      {featured ? (
        <div style={{ position: "relative", height: "85vh", overflow: "hidden" }}>
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
              letterSpacing: "0.25em", textTransform: "uppercase",
              border: "1px solid rgba(229,9,20,0.5)", padding: "2px 8px", borderRadius: "2px", marginBottom: "14px",
            }}>
              {featured.type === "MOVIE" ? "Фільм" : featured.type === "SERIES" ? "Серіал" : featured.type === "ANIME" ? "Аніме" : "Мультик"}
            </div>

            <h1 style={{
              fontSize: "clamp(2rem, 4.5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.05,
              letterSpacing: "-0.5px", textShadow: "2px 4px 20px rgba(0,0,0,0.9)", marginBottom: "12px", color: "#fff",
            }}>
              {featured.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "14px", marginBottom: "16px" }}>
              <span style={{ color: "#46d369", fontWeight: 700 }}>{featured.year}</span>
              {featured.duration && <span style={{ color: "#bcbcbc" }}>{Math.floor(featured.duration / 60)}h {featured.duration % 60}m</span>}
              <span style={{ border: "1px solid #777", color: "#bcbcbc", fontSize: "11px", padding: "1px 6px", borderRadius: "2px" }}>HD</span>
            </div>

            <p style={{
              color: "#e5e5e5", fontSize: "15px", lineHeight: 1.65,
              display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
              overflow: "hidden", marginBottom: "24px", maxWidth: "500px",
            }}>
              {featured.description}
            </p>

            <div style={{ display: "flex", gap: "12px" }}>
              <Link href={`/content/${featured.id}`} style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "#fff", color: "#000", padding: "10px 28px",
                borderRadius: "4px", fontWeight: 700, fontSize: "16px", textDecoration: "none",
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" style={{ fill: "#000" }}>
                  <path d="M8 5v14l11-7z" />
                </svg>
                Дивитись
              </Link>
              <Link href={`/content/${featured.id}`} style={{
                display: "flex", alignItems: "center", gap: "8px",
                background: "rgba(109,109,110,0.7)", color: "#fff", padding: "10px 24px",
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
      <div style={{ paddingTop: "20px", paddingBottom: "60px" }}>
        <ContentRow title="Фільми" items={movies} />
        <ContentRow title="Серіали" items={series} />
        <ContentRow title="Аніме" items={anime} />
        <ContentRow title="Мультики" items={cartoons} />
      </div>
    </div>
  );
}