import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import ActorForm from "./ActorForm";
import DeleteActorButton from "./DeleteActorButton";

export default async function AdminActorsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "ADMIN") redirect("/");

  const actors = await prisma.actor.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { contents: true } } },
  });

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "40px 4rem" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" }}>
          <Link href="/admin" style={{ color: "#777", textDecoration: "none", fontSize: "14px" }}>← Назад</Link>
          <h1 style={{ fontSize: "24px", fontWeight: 900 }}>Актори ({actors.length})</h1>
        </div>

        <div style={{ background: "#1f1f1f", borderRadius: "8px", padding: "24px", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.07)" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px" }}>Додати актора</h2>
          <ActorForm />
        </div>

        <div style={{ background: "#1f1f1f", borderRadius: "8px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}>
          {actors.map((actor: any) => (
            <div key={actor.id} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "14px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                {actor.photo && (
                  <img src={actor.photo} alt={actor.name} style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover" }} />
                )}
                <div>
                  <span style={{ color: "#e5e5e5", fontSize: "15px", fontWeight: 600 }}>{actor.name}</span>
                  <span style={{ color: "#777", fontSize: "13px", marginLeft: "12px" }}>{actor._count.contents} фільмів</span>
                </div>
              </div>
              <DeleteActorButton id={actor.id} />
            </div>
          ))}
          {actors.length === 0 && (
            <div style={{ padding: "24px", color: "#777", textAlign: "center" }}>Акторів ще немає</div>
          )}
        </div>
      </div>
    </div>
  );
}