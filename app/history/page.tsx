import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const history = await prisma.watchHistory.findMany({
    where: { userId: (session.user as any).id },
    include: {
      content: true,
      episode: true,
    },
    orderBy: { watchedAt: "desc" },
    take: 50,
  });

  return (
    <>
      <style>{`
        .history-wrap {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 2rem 80px;
        }
        .history-item {
          background: #1f1f1f;
          border-radius: 8px;
          padding: 16px;
          display: flex;
          gap: 16px;
          align-items: center;
          border: 1px solid rgba(255,255,255,0.07);
        }
        @media (max-width: 768px) {
          .history-wrap { padding: 24px 1rem 60px; }
          .history-item { padding: 12px; gap: 12px; }
        }
      `}</style>

      <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
        <div className="history-wrap">
          <h1 style={{ fontSize: "24px", fontWeight: 900, marginBottom: "32px" }}>
            Історія перегляду ({history.length})
          </h1>

          {history.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {history.map((item: any) => (
                <Link key={item.id} href={`/content/${item.content.id}`} style={{ textDecoration: "none" }}>
                  <div className="history-item">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <div style={{ position: "relative", width: "60px", height: "90px", flexShrink: 0 }}>
  <Image
    src={item.content.poster || "/no-image.jpg"}
    alt={item.content.title}
    fill
    sizes="60px"
    style={{ objectFit: "cover", borderRadius: "4px" }}
  />
</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ color: "#e5e5e5", fontSize: "16px", fontWeight: 600, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.content.title}
                      </p>
                      {item.episode && (
                        <p style={{ color: "#777", fontSize: "13px", margin: "0 0 4px" }}>
                          Епізод: {item.episode.title}
                        </p>
                      )}
                      <p style={{ color: "#555", fontSize: "12px", margin: 0 }}>
                        {new Date(item.watchedAt).toLocaleDateString("uk-UA", {
                          day: "numeric", month: "long", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {item.progress > 0 && (
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ color: "#46d369", fontSize: "13px", margin: 0 }}>
                          {Math.floor(item.progress / 60)} хв
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0", color: "#777" }}>
              <p style={{ fontSize: "18px", marginBottom: "8px" }}>Історія порожня</p>
              <p style={{ fontSize: "14px", marginBottom: "24px" }}>Починайте переглядати контент</p>
              <Link href="/" style={{
                background: "#E50914", color: "#fff", textDecoration: "none",
                padding: "10px 24px", borderRadius: "4px", fontWeight: 700,
              }}>
                На головну
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}