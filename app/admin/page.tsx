import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const [userCount, contentCount, reviewCount, watchCount] = await Promise.all([
    prisma.user.count(),
    prisma.content.count(),
    prisma.review.count(),
    prisma.watchHistory.count(),
  ]);

  const contentByType = await prisma.content.groupBy({
    by: ["type"],
    _count: true,
  });

  const recentUsers = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, createdAt: true },
  });

  const recentContent = await prisma.content.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, type: true, year: true, createdAt: true },
  });

  const stats = [
    { label: "Користувачів", value: userCount, color: "#E50914" },
    { label: "Контенту", value: contentCount, color: "#46d369" },
    { label: "Відгуків", value: reviewCount, color: "#f5a623" },
    { label: "Переглядів", value: watchCount, color: "#0080ff" },
  ];

  const typeLabels: any = {
    MOVIE: "Фільми",
    SERIES: "Серіали",
    ANIME: "Аніме",
    CARTOON: "Мультики",
  };

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 900 }}>Адмін панель</h1>
          <Link href="/admin/content/new" style={{
            background: "#E50914", color: "#fff", textDecoration: "none",
            padding: "10px 24px", borderRadius: "4px", fontWeight: 700, fontSize: "14px",
          }}>
            + Додати контент
          </Link>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "40px" }}>
          {stats.map(stat => (
            <div key={stat.label} style={{
              background: "#1f1f1f", borderRadius: "8px", padding: "24px",
              border: `1px solid ${stat.color}30`,
            }}>
              <div style={{ color: stat.color, fontSize: "32px", fontWeight: 900 }}>{stat.value}</div>
              <div style={{ color: "#777", fontSize: "14px", marginTop: "4px" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Content by type */}
        <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Контент за типом</h2>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            {contentByType.map((item: any) => (
              <div key={item.type} style={{
                background: "#141414", borderRadius: "6px", padding: "12px 20px",
                border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: "20px" }}>{item._count}</div>
                <div style={{ color: "#777", fontSize: "13px" }}>{typeLabels[item.type]}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>

          {/* Recent content */}
          <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Останній контент</h2>
              <Link href="/admin/content" style={{ color: "#E50914", textDecoration: "none", fontSize: "14px" }}>Всі →</Link>
            </div>
            {recentContent.map((item: any) => (
              <div key={item.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div>
                  <div style={{ color: "#e5e5e5", fontSize: "14px" }}>{item.title}</div>
                  <div style={{ color: "#777", fontSize: "12px" }}>{typeLabels[item.type]} · {item.year}</div>
                </div>
                <Link href={`/admin/content/${item.id}`} style={{ color: "#E50914", textDecoration: "none", fontSize: "13px" }}>
                  Редагувати
                </Link>
              </div>
            ))}
          </div>

          {/* Recent users */}
          <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Останні користувачі</h2>
              <Link href="/admin/users" style={{ color: "#E50914", textDecoration: "none", fontSize: "14px" }}>Всі →</Link>
            </div>
            {recentUsers.map((user: any) => (
              <div key={user.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}>
                <div>
                  <div style={{ color: "#e5e5e5", fontSize: "14px" }}>{user.name || user.email}</div>
                  <div style={{ color: "#777", fontSize: "12px" }}>{user.email}</div>
                </div>
                <span style={{
                  color: user.role === "ADMIN" ? "#E50914" : "#46d369",
                  fontSize: "12px", fontWeight: 700,
                }}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
          {[
  { label: "Управління контентом", href: "/admin/content", desc: "Додати, редагувати, видалити фільми та серіали" },
  { label: "Управління користувачами", href: "/admin/users", desc: "Переглянути та керувати акаунтами" },
  { label: "Жанри", href: "/admin/genres", desc: "Управління жанрами контенту" },
].map(item => (
  <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
    <div style={{
      background: "#1f1f1f", borderRadius: "8px", padding: "24px",
      border: "1px solid rgba(255,255,255,0.07)",
    }}>
      <div style={{ color: "#fff", fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>{item.label}</div>
      <div style={{ color: "#777", fontSize: "13px" }}>{item.desc}</div>
    </div>
  </Link>
))}
        </div>
      </div>
    </div>
  );
}