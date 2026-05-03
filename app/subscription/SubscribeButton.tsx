"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscribeButton({ planId, currentPlan, color }: { planId: string; currentPlan: string; color: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubscribe() {
    if (planId === currentPlan) return;
    setLoading(true);

    await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });

    setLoading(false);
    router.refresh();
  }

  const isCurrentPlan = planId === currentPlan;

  return (
    <button
      onClick={handleSubscribe}
      disabled={isCurrentPlan || loading}
      style={{
        width: "100%", padding: "12px", borderRadius: "6px",
        fontWeight: 700, fontSize: "15px", cursor: isCurrentPlan ? "default" : "pointer",
        background: isCurrentPlan ? "#2a2a2a" : color,
        color: "#fff", border: "none",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? "Завантаження..." : isCurrentPlan ? "Активний" : "Обрати"}
    </button>
  );
}