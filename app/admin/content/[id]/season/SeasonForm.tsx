"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SeasonForm({ contentId, nextNumber }: { contentId: string; nextNumber: number }) {
  const router = useRouter();
  const [number, setNumber] = useState(nextNumber);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/seasons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId, number, title }),
    });
    setTitle("");
    setLoading(false);
    router.refresh();
  }

  const inputStyle = {
    background: "#2a2a2a", border: "1px solid #333", borderRadius: "4px",
    padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
      <div>
        <label style={{ color: "#777", fontSize: "12px", display: "block", marginBottom: "4px" }}>Номер</label>
        <input type="number" value={number} onChange={e => setNumber(Number(e.target.value))}
          required style={{ ...inputStyle, width: "80px" }} />
      </div>
      <div style={{ flex: 1 }}>
        <label style={{ color: "#777", fontSize: "12px", display: "block", marginBottom: "4px" }}>Назва (необов'язково)</label>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="напр. Перша кров" style={{ ...inputStyle, width: "100%" }} />
      </div>
      <button type="submit" disabled={loading} style={{
        background: "#E50914", color: "#fff", border: "none",
        padding: "10px 20px", borderRadius: "4px", fontWeight: 700,
        fontSize: "14px", cursor: "pointer",
      }}>
        {loading ? "..." : "Додати сезон"}
      </button>
    </form>
  );
}