import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const TYPE_LABEL: Record<string, string> = {
  MOVIE: "Фільм", SERIES: "Серіал", ANIME: "Аніме", CARTOON: "Мультик",
};

export default async function FavoritesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const favorites = await prisma.favorite.findMany({
    where: { userId: (session.user as any).id },
    include: { content: { include: { genres: { include: { genre: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <style>{`
        .fav-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 2rem 80px;
        }
        .fav-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }
        @media (max-width: 768px) {
          .fav-wrap { padding: 24px 1rem 60px; }
          .fav-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; }
        }
        @media (max-width: 480px) {
          .fav-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <div className="fav-wrap">
          <h1 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "32px" }}>
            Моє обране ({favorites.length})
          </h1>

          {favorites.length > 0 ? (
            <div className="fav-grid">
              {favorites.map((fav: any) => (
                <Link key={fav.id} href={`/content/${fav.content.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ borderRadius: "4px", overflow: "hidden", background: "#1f1f1f" }}>
                    <div style={{ position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <div style={{ position: "relative", width: "100%", height: "240px" }}>
  <Image
    src={fav.content.poster || "/no-image.jpg"}
    alt={fav.content.title}
    fill
    sizes="(max-width: 768px) 130px, 160px"
    style={{ objectFit: "cover" }}
  />
</div>
                      <div style={{
                        position: "absolute", top: "8px", left: "8px",
                        background: "#E50914", color: "#fff", fontSize: "10px",
                        fontWeight: 700, padding: "2px 6px", borderRadius: "2px",
                      }}>
                        {TYPE_LABEL[fav.content.type] || fav.content.type}
                      </div>
                      {fav.content.rating > 0 && (
                        <div style={{
                          position: "absolute", top: "8px", right: "8px",
                          background: "rgba(0,0,0,0.7)", color: "#46d369", fontSize: "11px",
                          fontWeight: 700, padding: "2px 6px", borderRadius: "2px",
                        }}>
                          ⭐ {fav.content.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    <div style={{ padding: "10px" }}>
                      <p style={{
                        color: "#e5e5e5", fontSize: "13px", fontWeight: 600,
                        margin: "0 0 4px", overflow: "hidden",
                        textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {fav.content.title}
                      </p>
                      <p style={{ color: "#777", fontSize: "12px", margin: 0 }}>
                        {fav.content.year}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#777" }}>
              <p style={{ fontSize: "18px", marginBottom: "8px" }}>Обране порожнє</p>
              <p style={{ fontSize: "14px", marginBottom: "24px" }}>Додавайте фільми та серіали до обраного</p>
              <Link href="/" style={{
                background: "#E50914", color: "#fff", textDecoration: "none",
                padding: "10px 24px", borderRadius: "4px", fontWeight: 700,
              }}>
                На головну
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}