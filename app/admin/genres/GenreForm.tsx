"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function GenreForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/genres", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    setName("");
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px" }}>
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Назва жанру (напр. Бойовик)"
        required
        style={{
          flex: 1, background: "#2a2a2a", border: "1px solid #333",
          borderRadius: "4px", padding: "10px 14px", color: "#fff",
          fontSize: "14px", outline: "none",
        }}
      />
      <button type="submit" disabled={loading} style={{
        background: "#E50914", color: "#fff", border: "none",
        padding: "10px 24px", borderRadius: "4px", fontWeight: 700,
        fontSize: "14px", cursor: "pointer",
      }}>
        {loading ? "..." : "Додати"}
      </button>
    </form>
  );
}