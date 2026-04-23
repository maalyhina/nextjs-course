"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Щось пішло не так");
    } else {
      router.push("/login");
    }
  }

  return (
    <div style={{
      minHeight: "100vh", background: "#141414",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "rgba(0,0,0,0.75)", borderRadius: "4px",
        padding: "60px 68px", width: "100%", maxWidth: "450px",
      }}>
        <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: 700, marginBottom: "28px" }}>
          Реєстрація
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="text" placeholder="Ім'я" value={name}
            onChange={e => setName(e.target.value)}
            style={{ background: "#333", border: "none", borderRadius: "4px", padding: "16px", color: "#fff", fontSize: "16px", outline: "none" }}
          />
          <input
            type="email" placeholder="Email" value={email}
            onChange={e => setEmail(e.target.value)} required
            style={{ background: "#333", border: "none", borderRadius: "4px", padding: "16px", color: "#fff", fontSize: "16px", outline: "none" }}
          />
          <input
            type="password" placeholder="Пароль" value={password}
            onChange={e => setPassword(e.target.value)} required
            style={{ background: "#333", border: "none", borderRadius: "4px", padding: "16px", color: "#fff", fontSize: "16px", outline: "none" }}
          />

          {error && (
            <p style={{ color: "#e87c03", fontSize: "14px", background: "rgba(232,124,3,0.1)", padding: "10px", borderRadius: "4px" }}>
              {error}
            </p>
          )}

          <button type="submit" disabled={loading} style={{
            background: "#E50914", color: "#fff", border: "none",
            borderRadius: "4px", padding: "16px", fontSize: "16px",
            fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, marginTop: "8px",
          }}>
            {loading ? "Завантаження..." : "Зареєструватись"}
          </button>
        </form>

        <p style={{ color: "#737373", fontSize: "14px", marginTop: "16px" }}>
          Вже є акаунт?{" "}
          <Link href="/login" style={{ color: "#fff", textDecoration: "none" }}>
            Увійти
          </Link>
        </p>
      </div>
    </div>
  );
}