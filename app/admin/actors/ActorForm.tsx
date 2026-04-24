"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActorForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [photo, setPhoto] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/actors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, photo }),
    });
    setName("");
    setPhoto("");
    setLoading(false);
    router.refresh();
  }

  const inputStyle = {
    background: "#2a2a2a", border: "1px solid #333", borderRadius: "4px",
    padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", width: "100%",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" as const, gap: "12px" }}>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Ім'я актора" required style={inputStyle} />
      <input value={photo} onChange={e => setPhoto(e.target.value)} placeholder="URL фото (необов'язково)" style={inputStyle} />
      <button type="submit" disabled={loading} style={{
        background: "#E50914", color: "#fff", border: "none",
        padding: "10px 24px", borderRadius: "4px", fontWeight: 700,
        fontSize: "14px", cursor: "pointer", alignSelf: "flex-start" as const,
      }}>
        {loading ? "..." : "Додати"}
      </button>
    </form>
  );
}