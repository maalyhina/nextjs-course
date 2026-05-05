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
      <div className="content-card">
        <div style={{ position: "relative" }}>
          <img
            src={item.poster || "/no-image.jpg"}
            alt={item.title}
            className="content-card-img"
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
    <div style={{ marginBottom: "40px" }}>
      <div className="row-header">
        <h2 style={{ color: "#fff", fontSize: "20px", fontWeight: 700, margin: 0 }}>{title}</h2>
        {href && (
          <Link href={href} style={{ color: "#bcbcbc", fontSize: "14px", textDecoration: "none", fontWeight: 600, whiteSpace: "nowrap" }}>
            Дивитись все →
          </Link>
        )}
      </div>
      <div className="content-scroll">
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
    <>
      <style>{`
        .hero-wrap {
          position: relative;
          height: 85vh;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .hero-inner {
          position: absolute;
          bottom: 0;
          left: 0;
          padding: 0 4rem 3.5rem;
          max-width: 650px;
        }
        .hero-btns {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .hero-btns a {
          white-space: nowrap;
        }
        .row-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
          padding: 0 4rem;
        }
        .content-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 0 4rem 8px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .content-scroll::-webkit-scrollbar { display: none; }
        .content-card {
          width: 160px;
          border-radius: 4px;
          overflow: hidden;
          background: #1f1f1f;
          position: relative;
          flex-shrink: 0;
        }
        .content-card-img {
          width: 160px;
          height: 240px;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 768px) {
          .hero-inner {
            padding: 0 1rem 2rem;
            max-width: 100%;
          }
          .hero-btns a {
            flex: 1;
            justify-content: center;
            text-align: center;
          }
          .row-header {
            padding: 0 1rem;
          }
          .content-scroll {
            padding: 0 1rem 8px;
            gap: 10px;
          }
          .content-card {
            width: 130px;
          }
          .content-card-img {
            width: 130px;
            height: 195px;
          }
        }

        @media (max-width: 480px) {
          .content-card {
            width: 110px;
          }
          .content-card-img {
            width: 110px;
            height: 165px;
          }
        }
      `}</style>

      <div style={{ background: "#141414", minHeight: "100vh", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>

        {/* HERO */}
        {featured ? (
          <div className="hero-wrap">
            <div style={{
              position: "absolute", inset: 0,
              backgroundImage: `url(${featured.backdrop || featured.poster || "/no-image.jpg"})`,
              backgroundSize: "cover", backgroundPosition: "center top",
              transform: "scale(1.04)",
            }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #141414 30%, rgba(20,20,20,0.5) 70%, transparent 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #141414 0%, transparent 60%)" }} />

            <div className="hero-inner">
              <div style={{
                display: "inline-block", color: "#E50914", fontSize: "11px", fontWeight: 900,
                letterSpacing: "0.25em", textTransform: "uppercase",
                border: "1px solid rgba(229,9,20,0.5)", padding: "2px 8px", borderRadius: "2px", marginBottom: "14px",
              }}>
                {featured.type === "MOVIE" ? "Фільм" : featured.type === "SERIES" ? "Серіал" : featured.type === "ANIME" ? "Аніме" : "Мультик"}
              </div>

              <h1 style={{
                fontSize: "clamp(1.6rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.05,
                textShadow: "2px 4px 20px rgba(0,0,0,0.9)", marginBottom: "12px", color: "#fff",
              }}>
                {featured.title}
              </h1>

              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", marginBottom: "12px", flexWrap: "wrap" }}>
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
                display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                overflow: "hidden", marginBottom: "20px",
              }}>
                {featured.description}
              </p>

              <div className="hero-btns">
                <Link href={`/content/${featured.id}`} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "#fff", color: "#000", padding: "11px 28px",
                  borderRadius: "4px", fontWeight: 700, fontSize: "15px", textDecoration: "none",
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" style={{ fill: "#000" }}>
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Дивитись
                </Link>
                <Link href={`/content/${featured.id}`} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  background: "rgba(109,109,110,0.7)", color: "#fff", padding: "11px 24px",
                  borderRadius: "4px", fontWeight: 700, fontSize: "15px", textDecoration: "none",
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
    </>
  );
}