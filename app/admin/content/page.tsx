import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteButton from "./DeleteButton";

export default async function AdminContentPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const content = await prisma.content.findMany({
    orderBy: { createdAt: "desc" },
    include: { genres: { include: { genre: true } } },
  });

  const typeLabels: any = {
    MOVIE: "Фільм", SERIES: "Серіал", ANIME: "Аніме", CARTOON: "Мультик",
  };

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <Link href="/admin" style={{ color: "#777", textDecoration: "none", fontSize: "14px" }}>← Назад</Link>
            <h1 style={{ fontSize: "24px", fontWeight: 900 }}>Контент ({content.length})</h1>
          </div>
          <Link href="/admin/content/new" style={{
            background: "#E50914", color: "#fff", textDecoration: "none",
            padding: "10px 24px", borderRadius: "4px", fontWeight: 700, fontSize: "14px",
          }}>
            + Додати
          </Link>
        </div>

        <div style={{ background: "#1f1f1f", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Назва", "Тип", "Рік", "Рейтинг", "Перегляди", "Дії"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#777", fontSize: "13px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {content.map((item: any) => (
                <tr key={item.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      {item.poster && (
                        <img src={item.poster} alt="" style={{ width: "36px", height: "54px", objectFit: "cover", borderRadius: "2px" }} />
                      )}
                      <span style={{ color: "#e5e5e5", fontSize: "14px" }}>{item.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#777", fontSize: "13px" }}>{typeLabels[item.type]}</td>
                  <td style={{ padding: "14px 16px", color: "#777", fontSize: "13px" }}>{item.year}</td>
                  <td style={{ padding: "14px 16px", color: "#46d369", fontSize: "13px" }}>{item.rating.toFixed(1)}</td>
                  <td style={{ padding: "14px 16px", color: "#777", fontSize: "13px" }}>{item.views}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link href={`/admin/content/${item.id}`} style={{
                        color: "#fff", textDecoration: "none", fontSize: "13px",
                        background: "#333", padding: "4px 12px", borderRadius: "4px",
                      }}>
                        Редагувати
                      </Link>
                      <DeleteButton id={item.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}