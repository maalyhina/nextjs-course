import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ type?: string }>;
}

const typeLabels: Record<string, string> = {
  MOVIE: "Фільми",
  SERIES: "Серіали",
  ANIME: "Аніме",
  CARTOON: "Мультики",
};

export default async function MoviesPage({ searchParams }: Props) {
  const { type } = await searchParams;

  const where: any = {};
  if (type) where.type = type;

  const content = await prisma.content.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { genres: { include: { genre: true } } },
  });


  const title = type ? typeLabels[type] : "Весь контент";

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <div style={{ padding: "40px 4rem 60px" }}>

        {/* Count */}
        <p style={{ color: "#777", fontSize: "14px", marginBottom: "24px" }}>
          {content.length} {content.length === 1 ? "результат" : "результатів"}
        </p>

        {/* Grid */}
        {content.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
            {content.map((item: any) => (
              <Link key={item.id} href={`/content/${item.id}`} style={{ textDecoration: "none" }}>
                <div style={{ borderRadius: "4px", overflow: "hidden", background: "#1f1f1f" }}>
                  <div style={{ position: "relative" }}>
                    <img
                      src={item.poster || "/no-image.jpg"}
                      alt={item.title}
                      style={{ width: "100%", height: "240px", objectFit: "cover", display: "block" }}
                    />
                    <div style={{
                      position: "absolute", top: "8px", left: "8px",
                      background: "#E50914", color: "#fff", fontSize: "10px",
                      fontWeight: 700, padding: "2px 6px", borderRadius: "2px",
                    }}>
                      {typeLabels[item.type] || item.type}
                    </div>
                  </div>
                  <div style={{ padding: "10px" }}>
                    <p style={{ color: "#e5e5e5", fontSize: "13px", fontWeight: 600, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ color: "#777", fontSize: "12px", margin: 0 }}>{item.year}</p>
                      {item.rating > 0 && (
                        <span style={{ color: "#46d369", fontSize: "12px", fontWeight: 700 }}>⭐ {item.rating.toFixed(1)}</span>
                      )}
                    </div>
                    {item.genres.length > 0 && (
                      <p style={{ color: "#555", fontSize: "11px", margin: "4px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.genres.map((g: any) => g.genre.name).join(", ")}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#777" }}>
            <p style={{ fontSize: "18px", marginBottom: "8px" }}>Контенту ще немає</p>
            <p style={{ fontSize: "14px" }}>Додайте контент через адмін панель</p>
          </div>
        )}
      </div>
    </div>
  );
}