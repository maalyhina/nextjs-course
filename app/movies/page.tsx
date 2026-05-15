import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

interface Props {
  searchParams: Promise<{ type?: string; page?: string }>;
}

const typeLabels: Record<string, string> = {
  MOVIE: "Фільми",
  SERIES: "Серіали",
  ANIME: "Аніме",
  CARTOON: "Мультики",
};

const ITEMS_PER_PAGE = 20;

export default async function MoviesPage({ searchParams }: Props) {
  const { type, page } = await searchParams;
  const currentPage = parseInt(page || "1");

  const where: any = {};
  if (type) where.type = type;

  const [total, content] = await Promise.all([
    prisma.content.count({ where }),
    prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { genres: { include: { genre: true } } },
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
    }),
  ]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const tabs = [
    { value: "", label: "Все" },
    { value: "MOVIE", label: "Фільми" },
    { value: "SERIES", label: "Серіали" },
    { value: "ANIME", label: "Аніме" },
    { value: "CARTOON", label: "Мультики" },
  ];

  const title = type ? typeLabels[type] : "Весь контент";

  function buildUrl(p: number, t?: string) {
    const params = new URLSearchParams();
    if (t || type) params.set("type", t ?? type ?? "");
    if (p > 1) params.set("page", p.toString());
    const str = params.toString();
    return `/movies${str ? `?${str}` : ""}`;
  }

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
      <div style={{ padding: "40px 4rem 60px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "24px" }}>{title}</h1>



        {/* Count */}
        <p style={{ color: "#777", fontSize: "14px", marginBottom: "24px" }}>
          Знайдено: {total} | Сторінка {currentPage} з {totalPages || 1}
        </p>

        {/* Grid */}
        {content.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px", marginBottom: "40px" }}>
            {content.map((item: any) => (
              <Link key={item.id} href={`/content/${item.id}`} style={{ textDecoration: "none" }}>
                <div style={{ borderRadius: "4px", overflow: "hidden", background: "#1f1f1f" }}>
                  <div style={{ position: "relative", width: "160px", height: "240px" }}>
  <Image
    src={item.poster || "/no-image.jpg"}
    alt={item.title}
    fill
    style={{
      objectFit: "cover",
      borderRadius: "4px"
    }}
  />
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
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#777" }}>
            <p style={{ fontSize: "18px" }}>Контенту ще немає</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {/* Prev */}
            {currentPage > 1 ? (
              <Link href={buildUrl(currentPage - 1)} style={{
                padding: "8px 16px", borderRadius: "4px", textDecoration: "none",
                background: "#2a2a2a", color: "#fff", fontWeight: 600, fontSize: "14px",
              }}>
                ← Назад
              </Link>
            ) : (
              <span style={{ padding: "8px 16px", borderRadius: "4px", background: "#1a1a1a", color: "#555", fontSize: "14px" }}>
                ← Назад
              </span>
            )}

            {/* Page numbers */}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce<(number | string)[]>((acc, p, idx, arr) => {
                if (idx > 0 && (p as number) - (arr[idx - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} style={{ color: "#777", padding: "8px 4px" }}>...</span>
                ) : (
                  <Link key={p} href={buildUrl(p as number)} style={{
                    padding: "8px 14px", borderRadius: "4px", textDecoration: "none",
                    background: currentPage === p ? "#E50914" : "#2a2a2a",
                    color: "#fff", fontWeight: 600, fontSize: "14px",
                  }}>
                    {p}
                  </Link>
                )
              )}

            {/* Next */}
            {currentPage < totalPages ? (
              <Link href={buildUrl(currentPage + 1)} style={{
                padding: "8px 16px", borderRadius: "4px", textDecoration: "none",
                background: "#2a2a2a", color: "#fff", fontWeight: 600, fontSize: "14px",
              }}>
                Вперед →
              </Link>
            ) : (
              <span style={{ padding: "8px 16px", borderRadius: "4px", background: "#1a1a1a", color: "#555", fontSize: "14px" }}>
                Вперед →
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}