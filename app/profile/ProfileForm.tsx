"use client";

import { useState } from "react";

export default function ProfileForm({ user }: { user: { id: string; name: string; email: string } }) {
  const [name, setName] = useState(user.name);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    setLoading(false);

    if (res.ok) {
      setSuccess(true);
    } else {
      setError("Помилка збереження");
    }
  }

  const inputStyle = {
    background: "#2a2a2a", border: "1px solid #333", borderRadius: "4px",
    padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", width: "100%",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" as const, gap: "16px" }}>
      <div>
        <label style={{ color: "#777", fontSize: "13px", marginBottom: "6px", display: "block" }}>Ім'я</label>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Ваше ім'я" />
      </div>
      <div>
        <label style={{ color: "#777", fontSize: "13px", marginBottom: "6px", display: "block" }}>Email</label>
        <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
      </div>

      {success && <p style={{ color: "#46d369", fontSize: "13px" }}>✓ Збережено!</p>}
      {error && <p style={{ color: "#E50914", fontSize: "13px" }}>{error}</p>}

      <button type="submit" disabled={loading} style={{
        background: "#E50914", color: "#fff", border: "none",
        padding: "10px 24px", borderRadius: "4px", fontWeight: 700,
        fontSize: "14px", cursor: "pointer",
      }}>
        {loading ? "Збереження..." : "Зберегти"}
      </button>
    </form>
  );
}