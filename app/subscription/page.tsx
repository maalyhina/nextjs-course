import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import SubscribeButton from "./SubscribeButton";

const plans = [
  {
    id: "FREE",
    name: "Безкоштовний",
    price: "0₴",
    period: "назавжди",
    color: "#333",
    features: [
      "Перегляд трейлерів",
      "Додавання в обране",
      "Відгуки та рейтинги",
      "Обмежений контент",
    ],
  },
  {
    id: "BASIC",
    name: "Базовий",
    price: "99₴",
    period: "на місяць",
    color: "#1a5276",
    features: [
      "Все з безкоштовного",
      "HD якість",
      "Повний доступ до фільмів",
      "Без реклами",
    ],
  },
  {
    id: "PREMIUM",
    name: "Преміум",
    price: "199₴",
    period: "на місяць",
    color: "#E50914",
    features: [
      "Все з базового",
      "4K якість",
      "Завантаження для офлайн",
      "До 4 екранів одночасно",
      "Пріоритетна підтримка",
    ],
  },
];

export default async function SubscriptionPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const subscription = await prisma.subscription.findUnique({
    where: { userId: (session.user as any).id },
  });

  const currentPlan = subscription?.plan || "FREE";

  return (
    <div style={{ background: "#141414", minHeight: "100vh", color: "#fff", fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", padding: "60px 4rem" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <h1 style={{ fontSize: "32px", fontWeight: 900, marginBottom: "12px" }}>Оберіть план</h1>
          <p style={{ color: "#bcbcbc", fontSize: "16px" }}>Отримайте доступ до тисяч фільмів і серіалів</p>
          {subscription?.expiresAt && (
            <p style={{ color: "#46d369", fontSize: "14px", marginTop: "8px" }}>
              Ваша підписка діє до: {new Date(subscription.expiresAt).toLocaleDateString("uk-UA")}
            </p>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              background: "#1f1f1f", borderRadius: "12px", padding: "32px",
              border: currentPlan === plan.id ? `2px solid ${plan.color}` : "2px solid transparent",
              position: "relative",
            }}>
              {currentPlan === plan.id && (
                <div style={{
                  position: "absolute", top: "-12px", left: "50%", transform: "translateX(-50%)",
                  background: plan.color, color: "#fff", fontSize: "12px", fontWeight: 700,
                  padding: "4px 16px", borderRadius: "12px",
                }}>
                  Поточний план
                </div>
              )}

              <h2 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>{plan.name}</h2>
              <div style={{ marginBottom: "24px" }}>
                <span style={{ fontSize: "36px", fontWeight: 900, color: plan.color }}>{plan.price}</span>
                <span style={{ color: "#777", fontSize: "14px", marginLeft: "8px" }}>{plan.period}</span>
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                {plan.features.map(feature => (
                  <li key={feature} style={{ display: "flex", alignItems: "center", gap: "8px", color: "#e5e5e5", fontSize: "14px" }}>
                    <span style={{ color: "#46d369", fontWeight: 700 }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>

              <SubscribeButton planId={plan.id} currentPlan={currentPlan} color={plan.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}