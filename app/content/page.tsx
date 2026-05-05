import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function ContentPage() {
  const content = await prisma.content.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      genres: { include: { genre: true } },
    },
  });

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", padding: "40px 2rem" }}>
      <h1 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "24px" }}>Каталог</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "16px" }}>
        {content.map((item: any) => (
          <Link key={item.id} href={`/content/${item.id}`} style={{ textDecoration: "none" }}>
            <div style={{ background: "#1f1f1f", borderRadius: "8px", overflow: "hidden" }}>
              <img
                src={item.poster || "/no-image.jpg"}
                alt={item.title}
                style={{ width: "100%", aspectRatio: "2/3", objectFit: "cover", display: "block" }}
              />
              <div style={{ padding: "10px" }}>
                <p style={{ color: "#fff", fontSize: "13px", fontWeight: 600, margin: 0 }}>{item.title}</p>
                <p style={{ color: "#777", fontSize: "12px", margin: "4px 0 0" }}>{item.year}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}