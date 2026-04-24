import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { favorites: true, reviews: true, watchHistory: true } } },
  });

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <Link href="/admin" style={{ color: "#777", textDecoration: "none", fontSize: "14px" }}>← Назад</Link>
          <h1 style={{ fontSize: "24px", fontWeight: 900 }}>Користувачі ({users.length})</h1>
        </div>

        <div style={{ background: "#1f1f1f", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                {["Email", "Ім'я", "Роль", "Обране", "Відгуки", "Перегляди", "Дата"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", color: "#777", fontSize: "13px", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user: any) => (
                <tr key={user.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "14px 16px", color: "#e5e5e5", fontSize: "14px" }}>{user.email}</td>
                  <td style={{ padding: "14px 16px", color: "#777", fontSize: "13px" }}>{user.name || "—"}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      color: user.role === "ADMIN" ? "#E50914" : "#46d369",
                      fontSize: "12px", fontWeight: 700,
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#777", fontSize: "13px" }}>{user._count.favorites}</td>
                  <td style={{ padding: "14px 16px", color: "#777", fontSize: "13px" }}>{user._count.reviews}</td>
                  <td style={{ padding: "14px 16px", color: "#777", fontSize: "13px" }}>{user._count.watchHistory}</td>
                  <td style={{ padding: "14px 16px", color: "#777", fontSize: "12px" }}>
                    {new Date(user.createdAt).toLocaleDateString("uk-UA")}
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