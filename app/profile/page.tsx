import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "./ProfileForm";

const PLAN_INFO = {
  FREE:    { label: "Безкоштовний", color: "#888",  textColor: "#fff" },
  BASIC:   { label: "Базовий",      color: "#1a5276",  textColor: "#fff" },
  PREMIUM: { label: "Преміум",      color: "#E50914",  textColor: "#fff" },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      _count: {
        select: {
          favorites: true,
          reviews: true,
          watchHistory: true,
        },
      },
      subscription: true, 
    },
  });

  if (!user) redirect("/login");

  const recentFavorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { content: true },
    orderBy: { createdAt: "desc" },
    take: 4,
  });

  const recentReviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: { content: true },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const plan = (user.subscription?.plan || "FREE") as keyof typeof PLAN_INFO;
  const planInfo = PLAN_INFO[plan];
  const expiresAt = user.subscription?.expiresAt;

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>

        {/* Profile header */}
        <div style={{ display: "flex", alignItems: "center", gap: "24px", marginBottom: "40px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "#E50914", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", fontWeight: 900, flexShrink: 0,
          }}>
            {(user.name || user.email)[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 900, margin: "0 0 4px" }}>
              {user.name || "Без імені"}
            </h1>
            <p style={{ color: "#777", fontSize: "14px", margin: "0 0 8px" }}>{user.email}</p>
            <span style={{
              background: user.role === "ADMIN" ? "#E50914" : "#1f1f1f",
              color: "#fff", fontSize: "12px", fontWeight: 700,
              padding: "3px 10px", borderRadius: "12px",
              border: user.role === "ADMIN" ? "none" : "1px solid #333",
            }}>
              {user.role === "ADMIN" ? "Адміністратор" : "Користувач"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
          {[
            { label: "В обраному", value: user._count.favorites, href: "/favorites" },
            { label: "Відгуків", value: user._count.reviews, href: "#reviews" },
            { label: "Переглянуто", value: user._count.watchHistory, href: "/history" },
          ].map(stat => (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#1f1f1f", borderRadius: "8px", padding: "20px",
                textAlign: "center", border: "1px solid rgba(255,255,255,0.07)",
              }}>
                <div style={{ color: "#E50914", fontSize: "28px", fontWeight: 900 }}>{stat.value}</div>
                <div style={{ color: "#777", fontSize: "13px", marginTop: "4px" }}>{stat.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{
          background: "#1f1f1f",
          borderRadius: "8px",
          padding: "20px 24px",
          marginBottom: "24px",
          border: `1px solid ${planInfo.color}44`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ color: "#aaa", fontSize: "13px" }}>Поточний план:</span>
                <span style={{
                  background: planInfo.color,
                  color: "#fff", fontSize: "12px", fontWeight: 700,
                  padding: "2px 10px", borderRadius: "12px",
                }}>
                  {planInfo.label}
                </span>
              </div>

              {expiresAt ? (
                <p style={{ color: "#46d369", fontSize: "13px", margin: 0 }}>
                  ✓ Активна до {new Date(expiresAt).toLocaleDateString("uk-UA")}
                </p>
              ) : plan === "FREE" ? (
                <p style={{ color: "#555", fontSize: "13px", margin: 0 }}>
                  Безкоштовний доступ — оновіть для повного
                </p>
              ) : (
                <p style={{ color: "#46d369", fontSize: "13px", margin: 0 }}>
                  ✓ Активна
                </p>
              )}
            </div>
          </div>

          <Link href="/subscription" style={{
            background: plan === "FREE" ? "#E50914" : "#2a2a2a",
            color: "#fff", textDecoration: "none",
            padding: "9px 22px", borderRadius: "6px",
            fontSize: "14px", fontWeight: 700,
            border: plan === "FREE" ? "none" : "1px solid #444",
            whiteSpace: "nowrap",
          }}>
            {plan === "FREE" ? "⚡ Оновити план" : "Змінити план"}
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "40px" }}>

          {/* Edit profile form */}
          <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Редагувати профіль</h2>
            <ProfileForm user={{ id: user.id, name: user.name || "", email: user.email }} />
          </div>

          {/* Recent favorites */}
          <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Обране</h2>
              <Link href="/favorites" style={{ color: "#E50914", textDecoration: "none", fontSize: "14px" }}>Всі →</Link>
            </div>
            {recentFavorites.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {recentFavorites.map((fav: any) => (
                  <Link key={fav.id} href={`/content/${fav.content.id}`} style={{ textDecoration: "none" }}>
                    <img
                      src={fav.content.poster || "/no-image.jpg"}
                      alt={fav.content.title}
                      style={{ width: "100%", height: "100px", objectFit: "cover", borderRadius: "4px", display: "block" }}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: "#777", fontSize: "14px" }}>Обране порожнє</p>
            )}
          </div>
        </div>

        {/* Recent reviews */}
        {recentReviews.length > 0 && (
          <div id="reviews" style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>Мої відгуки</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {recentReviews.map((review: any) => (
                <Link key={review.id} href={`/content/${review.content.id}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#141414", borderRadius: "6px", padding: "14px",
                    border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ color: "#e5e5e5", fontWeight: 600, fontSize: "14px" }}>{review.content.title}</span>
                      <span style={{ color: "#46d369", fontSize: "13px", fontWeight: 700 }}>⭐ {review.rating}/10</span>
                    </div>
                    <p style={{ color: "#bcbcbc", fontSize: "13px", margin: 0, lineHeight: 1.5 }}>{review.text}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}