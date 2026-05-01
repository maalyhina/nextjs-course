import { prisma } from "@/lib/prisma";
import Link from "next/link";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string; genre?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, type, genre } = await searchParams;

  const genres = await prisma.genre.findMany({ orderBy: { name: "asc" } });

  const where: any = {};
  if (q) where.title = { contains: q, mode: "insensitive" };
  if (type) where.type = type;
  if (genre) where.genres = { some: { genre: { name: genre } } };

  const results = await prisma.content.findMany({
    where,
    orderBy: { views: "desc" },
    include: { genres: { include: { genre: true } } },
    take: 50,
  });

  const types = [
    { value: "", label: "Все" },
    { value: "MOVIE", label: "Фільми" },
    { value: "SERIES", label: "Серіали" },
    { value: "ANIME", label: "Аніме" },
    { value: "CARTOON", label: "Мультики" },
  ];

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        <h1 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "32px" }}>
          {q ? `Результати пошуку: "${q}"` : "Пошук та фільтрація"}
        </h1>

        {/* Search form */}
        <form method="GET" style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              name="q"
              defaultValue={q}
              placeholder="Пошук за назвою..."
              style={{
                flex: 1, minWidth: "200px",
                background: "#2a2a2a", border: "1px solid #333",
                borderRadius: "4px", padding: "10px 16px",
                color: "#fff", fontSize: "15px", outline: "none",
              }}
            />
            <button type="submit" style={{
              background: "#E50914", color: "#fff", border: "none",
              padding: "10px 24px", borderRadius: "4px",
              fontWeight: 700, fontSize: "15px", cursor: "pointer",
            }}>
              Знайти
            </button>
          </div>
        </form>

        {/* Filters */}
        <div style={{ marginBottom: "32px", display: "flex", gap: "24px", flexWrap: "wrap" }}>
          {/* Type filter */}
          <div>
            <p style={{ color: "#777", fontSize: "13px", marginBottom: "8px" }}>Тип</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {types.map(t => (
                <Link
                  key={t.value}
                  href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), ...(t.value ? { type: t.value } : {}), ...(genre ? { genre } : {}) }).toString()}`}
                  style={{
                    padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
                    textDecoration: "none", fontWeight: 600,
                    background: type === t.value || (!type && !t.value) ? "#E50914" : "#2a2a2a",
                    color: "#fff",
                    border: type === t.value || (!type && !t.value) ? "none" : "1px solid #444",
                  }}
                >
                  {t.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Genre filter */}
          <div>
            <p style={{ color: "#777", fontSize: "13px", marginBottom: "8px" }}>Жанр</p>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <Link
                href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), ...(type ? { type } : {}) }).toString()}`}
                style={{
                  padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
                  textDecoration: "none", fontWeight: 600,
                  background: !genre ? "#E50914" : "#2a2a2a",
                  color: "#fff", border: !genre ? "none" : "1px solid #444",
                }}
              >
                Всі
              </Link>
              {genres.map((g: any) => (
                <Link
                  key={g.id}
                  href={`/search?${new URLSearchParams({ ...(q ? { q } : {}), ...(type ? { type } : {}), genre: g.name }).toString()}`}
                  style={{
                    padding: "6px 16px", borderRadius: "20px", fontSize: "13px",
                    textDecoration: "none", fontWeight: 600,
                    background: genre === g.name ? "#E50914" : "#2a2a2a",
                    color: "#fff", border: genre === g.name ? "none" : "1px solid #444",
                  }}
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Results count */}
        <p style={{ color: "#777", fontSize: "14px", marginBottom: "24px" }}>
          Знайдено: {results.length} результатів
        </p>

        {/* Results grid */}
        {results.length > 0 ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
            {results.map((item: any) => (
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
                      {item.type === "MOVIE" ? "Фільм" : item.type === "SERIES" ? "Серіал" : item.type === "ANIME" ? "Аніме" : "Мультик"}
                    </div>
                  </div>
                  <div style={{ padding: "10px" }}>
                    <p style={{ color: "#e5e5e5", fontSize: "13px", fontWeight: 600, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </p>
                    <p style={{ color: "#777", fontSize: "12px", margin: 0 }}>
                      {item.year}
                      {item.rating > 0 && <span style={{ color: "#46d369", marginLeft: "8px" }}>⭐ {item.rating.toFixed(1)}</span>}
                    </p>
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
            <p style={{ fontSize: "18px", marginBottom: "8px" }}>Нічого не знайдено</p>
            <p style={{ fontSize: "14px" }}>Спробуйте інший запит або фільтри</p>
          </div>
        )}
      </div>
    </div>
  );
}