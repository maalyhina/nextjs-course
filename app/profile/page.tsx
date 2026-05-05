import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ProfileForm from "./ProfileForm";

const PLAN_INFO = {
  FREE:    { label: "Безкоштовний", color: "#888",    icon: "🆓" },
  BASIC:   { label: "Базовий",      color: "#1a5276", icon: "⭐" },
  PREMIUM: { label: "Преміум",      color: "#E50914", icon: "👑" },
};

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    include: {
      _count: { select: { favorites: true, reviews: true, watchHistory: true } },
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
    <>
      <style>{`
        .profile-wrap {
          max-width: 900px;
          margin: 0 auto;
          padding: 40px 2rem 80px;
        }
        .profile-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-bottom: 40px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
          width: 100%;
        }
        .stats-grid a {
          display: block;
          width: 100%;
        }
        .sub-block {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .profile-wrap {
            padding: 24px 1rem 60px;
          }
          .profile-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .stats-grid {
            gap: 10px;
          }
          .sub-block {
            flex-direction: column;
            align-items: stretch;
          }
          .sub-block a {
            text-align: center;
          }
            .stats-grid,
.profile-grid,
.sub-block-wrap {
  width: 100%;
}
        }
      `}</style>

      <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <div className="profile-wrap">

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "32px", flexWrap: "wrap" }}>
            <div style={{
              width: "72px", height: "72px", borderRadius: "50%", flexShrink: 0,
              background: "#E50914", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "28px", fontWeight: 900,
            }}>
              {(user.name || user.email)[0].toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize: "clamp(18px, 4vw, 24px)", fontWeight: 900, margin: "0 0 4px" }}>
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
          <div className="stats-grid">
            {[
              { label: "В обраному",  value: user._count.favorites,    href: "/favorites" },
              { label: "Відгуків",    value: user._count.reviews,      href: "#reviews" },
              { label: "Переглянуто", value: user._count.watchHistory, href: "/history" },
            ].map(stat => (
              <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#1f1f1f", borderRadius: "8px", padding: "16px 8px",
                  textAlign: "center", border: "1px solid rgba(255,255,255,0.07)",
                }}>
                  <div style={{ color: "#E50914", fontSize: "clamp(20px, 5vw, 28px)", fontWeight: 900 }}>
                    {stat.value}
                  </div>
                  <div style={{ color: "#777", fontSize: "clamp(11px, 2.5vw, 13px)", marginTop: "4px" }}>
                    {stat.label}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Subscription */}
          <div style={{
            background: "#1f1f1f", borderRadius: "8px",
            padding: "20px 24px", marginBottom: "24px",
            border: `1px solid ${planInfo.color}44`,
          }}>
            <div className="sub-block">
              <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                    <span style={{ color: "#aaa", fontSize: "13px" }}>Поточний план:</span>
                    <span style={{
                      background: planInfo.color, color: "#fff",
                      fontSize: "12px", fontWeight: 700,
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
                    <p style={{ color: "#46d369", fontSize: "13px", margin: 0 }}>✓ Активна</p>
                  )}
                </div>
              </div>

              <Link href="/subscription" style={{
                background: plan === "FREE" ? "#E50914" : "#2a2a2a",
                color: "#fff", textDecoration: "none",
                padding: "10px 22px", borderRadius: "6px",
                fontSize: "14px", fontWeight: 700,
                border: plan === "FREE" ? "none" : "1px solid #444",
                whiteSpace: "nowrap",
              }}>
                {plan === "FREE" ? "⚡ Оновити план" : "Змінити план"}
              </Link>
            </div>
          </div>

          {/* Form + Favorites */}
          <div className="profile-grid">
            <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Редагувати профіль</h2>
              <ProfileForm user={{ id: user.id, name: user.name || "", email: user.email, avatar: user.avatar }} />
            </div>

            <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
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

          {/* Reviews */}
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
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", flexWrap: "wrap", gap: "4px" }}>
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
    </>
  );
}