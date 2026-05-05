"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SubscribeButton({
  planId,
  currentPlan,
  color,
}: {
  planId: string;
  currentPlan: string;
  color: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const isCurrentPlan = planId === currentPlan;

  function formatCardNumber(val: string) {
    return val.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function formatExpiry(val: string) {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    return clean.length >= 3 ? `${clean.slice(0, 2)}/${clean.slice(2)}` : clean;
  }

  async function handlePayment() {
    setError("");

    if (card.number.replace(/\s/g, "").length !== 16)
      return setError("Невірний номер картки");
    if (!/^\d{2}\/\d{2}$/.test(card.expiry))
      return setError("Невірна дата (MM/YY)");
    if (card.cvv.length < 3)
      return setError("Невірний CVV");
    if (!card.name.trim())
      return setError("Введіть ім'я на картці");

    setLoading(true);

    await new Promise((res) => setTimeout(res, 1500));

    await fetch("/api/subscription", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planId }),
    });

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setShowModal(false);
      setSuccess(false);
      setCard({ number: "", name: "", expiry: "", cvv: "" });
      router.refresh();
    }, 2000);
  }

  return (
    <>
      <button
        onClick={() => {
          if (isCurrentPlan) return;
          if (planId === "FREE") {
            fetch("/api/subscription", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ plan: "FREE" }),
            }).then(() => router.refresh());
          } else {
            setShowModal(true);
          }
        }}
        disabled={isCurrentPlan || loading}
        style={{
          width: "100%", padding: "12px", borderRadius: "6px",
          fontWeight: 700, fontSize: "15px",
          cursor: isCurrentPlan ? "default" : "pointer",
          background: isCurrentPlan ? "#2a2a2a" : color,
          color: "#fff", border: "none",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {isCurrentPlan ? "Активний" : "Обрати"}
      </button>

      {/* МОДАЛЬНЕ ВІКНО ОПЛАТИ */}
      {showModal && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px",
          }}
        >
          <div style={{
            background: "#1a1a1a",
            border: "1px solid #2a2a2a",
            borderRadius: "16px",
            padding: "36px",
            width: "100%",
            maxWidth: "420px",
            position: "relative",
          }}>
            {/* Закрити */}
            <button
              onClick={() => { setShowModal(false); setError(""); }}
              style={{
                position: "absolute", top: "16px", right: "16px",
                background: "none", border: "none",
                color: "#888", fontSize: "20px", cursor: "pointer",
              }}
            >✕</button>

            {success ? (
              // ─── УСПІХ ───────────────────────────────────────────
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
                <h3 style={{ color: "#fff", fontSize: "20px", marginBottom: "8px" }}>
                  Оплату прийнято!
                </h3>
                <p style={{ color: "#888", fontSize: "14px" }}>
                  Підписку активовано. Сторінка оновлюється...
                </p>
              </div>
            ) : (
              // ─── ФОРМА ОПЛАТИ ─────────────────────────────────────
              <>
                <h3 style={{ color: "#fff", fontSize: "20px", fontWeight: 800, marginBottom: "4px" }}>
                  Оплата підписки
                </h3>
                <p style={{ color: "#888", fontSize: "13px", marginBottom: "24px" }}>
                  Захищено шифруванням SSL
                </p>

                {/* Макет картки */}
                <div style={{
                  background: "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)",
                  borderRadius: "12px", padding: "20px 24px",
                  marginBottom: "24px",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}>
                  <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", marginBottom: "16px", letterSpacing: "2px" }}>
                    CINEMAX PAY
                  </div>
                  <div style={{ fontSize: "16px", letterSpacing: "3px", color: "#fff", marginBottom: "20px", fontFamily: "monospace" }}>
                    {card.number || "•••• •••• •••• ••••"}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                    <div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>ІМ'Я</div>
                      <div style={{ color: "#fff", fontSize: "13px", fontFamily: "monospace" }}>
                        {card.name || "ВАШЕ ІМ'Я"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.4)", marginBottom: "2px" }}>ТЕРМІН</div>
                      <div style={{ color: "#fff", fontSize: "13px", fontFamily: "monospace" }}>
                        {card.expiry || "MM/YY"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Поля */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={labelStyle}>Номер картки</label>
                    <input
                      style={inputStyle}
                      placeholder="0000 0000 0000 0000"
                      value={card.number}
                      onChange={e => setCard(c => ({ ...c, number: formatCardNumber(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Ім'я на картці</label>
                    <input
                      style={inputStyle}
                      placeholder="IVAN PETRENKO"
                      value={card.name}
                      onChange={e => setCard(c => ({ ...c, name: e.target.value.toUpperCase() }))}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>Термін дії</label>
                      <input
                        style={inputStyle}
                        placeholder="MM/YY"
                        value={card.expiry}
                        onChange={e => setCard(c => ({ ...c, expiry: formatExpiry(e.target.value) }))}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>CVV</label>
                      <input
                        style={inputStyle}
                        placeholder="•••"
                        type="password"
                        maxLength={3}
                        value={card.cvv}
                        onChange={e => setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "") }))}
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <p style={{ color: "#E50914", fontSize: "13px", marginTop: "12px" }}>
                    ⚠ {error}
                  </p>
                )}

                <button
                  onClick={handlePayment}
                  disabled={loading}
                  style={{
                    width: "100%", marginTop: "20px",
                    padding: "13px", borderRadius: "8px",
                    background: loading ? "#555" : color,
                    color: "#fff", border: "none",
                    fontSize: "15px", fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  {loading ? "Обробка платежу..." : "Оплатити"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0f0f0f",
  border: "1px solid #333",
  borderRadius: "6px",
  padding: "10px 14px",
  color: "#fff",
  fontSize: "15px",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#888",
  fontSize: "11px",
  marginBottom: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};