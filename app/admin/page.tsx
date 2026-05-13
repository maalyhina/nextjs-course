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
    { label: "Користувачів", value: userCount,   color: "#E50914" },
    { label: "Контенту",     value: contentCount, color: "#46d369" },
    { label: "Відгуків",     value: reviewCount,  color: "#f5a623" },
    { label: "Переглядів",   value: watchCount,   color: "#0080ff" },
  ];

  const typeLabels: any = {
    MOVIE:   "Фільми",
    SERIES:  "Серіали",
    ANIME:   "Аніме",
    CARTOON: "Мультики",
  };

  return (
    <>
      <style>{`
        .admin-wrap {
          background: #141414;
          min-height: 100vh;
          color: #fff;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          padding: 40px 4rem;
        }
        .admin-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .admin-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .admin-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 40px;
        }
        .admin-two-col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 24px;
        }
        .admin-nav {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .content-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          gap: 8px;
          flex-wrap: wrap;
        }
        @media (max-width: 768px) {
          .admin-wrap {
            padding: 24px 1rem;
          }
          .admin-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .admin-two-col {
            grid-template-columns: 1fr;
          }
          .admin-nav {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 480px) {
          .admin-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          .admin-nav {
            grid-template-columns: 1fr;
          }
          .admin-header h1 {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="admin-wrap">
        <div className="admin-inner">

          {/* Header */}
          <div className="admin-header">
            <h1 style={{ fontSize: "28px", fontWeight: 900, margin: 0 }}>Адмін панель</h1>
            <Link href="/admin/content/new" style={{
              background: "#E50914", color: "#fff", textDecoration: "none",
              padding: "10px 24px", borderRadius: "4px", fontWeight: 700,
              fontSize: "14px", whiteSpace: "nowrap",
            }}>
              + Додати контент
            </Link>
          </div>

          {/* Stats */}
          <div className="admin-stats">
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

          {/* Recent content + users */}
          <div className="admin-two-col">
            <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Останній контент</h2>
                <Link href="/admin/content" style={{ color: "#E50914", textDecoration: "none", fontSize: "14px" }}>Всі →</Link>
              </div>
              {recentContent.map((item: any) => (
                <div key={item.id} className="content-row">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: "#e5e5e5", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.title}
                    </div>
                    <div style={{ color: "#777", fontSize: "12px" }}>{typeLabels[item.type]} · {item.year}</div>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                    <Link href={`/admin/content/${item.id}`} style={{ color: "#E50914", textDecoration: "none", fontSize: "13px" }}>
                      Редагувати
                    </Link>
                    {(item.type === "SERIES" || item.type === "ANIME") && (
                      <Link href={`/admin/content/${item.id}/seasons`} style={{
                        color: "#fff", textDecoration: "none", fontSize: "13px",
                        background: "#1a1a6e", padding: "4px 12px", borderRadius: "4px",
                      }}>
                        Сезони
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Останні користувачі</h2>
                <Link href="/admin/users" style={{ color: "#E50914", textDecoration: "none", fontSize: "14px" }}>Всі →</Link>
              </div>
              {recentUsers.map((user: any) => (
                <div key={user.id} className="content-row">
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ color: "#e5e5e5", fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {user.name || user.email}
                    </div>
                    <div style={{ color: "#777", fontSize: "12px" }}>{user.email}</div>
                  </div>
                  <span style={{
                    color: user.role === "ADMIN" ? "#E50914" : "#46d369",
                    fontSize: "12px", fontWeight: 700, flexShrink: 0,
                  }}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="admin-nav">
            {[
              { label: "Управління контентом",      href: "/admin/content", desc: "Додати, редагувати, видалити фільми та серіали" },
              { label: "Управління користувачами",  href: "/admin/users",   desc: "Переглянути та керувати акаунтами" },
              { label: "Жанри",                     href: "/admin/genres",  desc: "Управління жанрами контенту" },
              { label: "Актори",                    href: "/admin/actors",  desc: "Управління акторами" },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#1f1f1f", borderRadius: "8px", padding: "24px",
                  border: "1px solid rgba(255,255,255,0.07)",
                  height: "100%", boxSizing: "border-box",
                }}>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: "16px", marginBottom: "8px" }}>{item.label}</div>
                  <div style={{ color: "#777", fontSize: "13px" }}>{item.desc}</div>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}