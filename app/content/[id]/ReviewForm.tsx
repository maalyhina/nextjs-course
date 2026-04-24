"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function ReviewForm({ contentId }: { contentId: string }) {
  const { data: session } = useSession();
  const [text, setText] = useState("");
  const [rating, setRating] = useState(8);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!session) {
    return (
      <p style={{ color: "#777", fontSize: "14px" }}>
        <a href="/login" style={{ color: "#E50914" }}>Увійдіть</a> щоб залишити відгук
      </p>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId, text, rating }),
    });
    setLoading(false);
    setSuccess(true);
    setText("");
  }

  if (success) {
    return <p style={{ color: "#46d369", fontSize: "14px" }}>✓ Відгук додано!</p>;
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <label style={{ color: "#777", fontSize: "14px" }}>Оцінка:</label>
        <select
          value={rating}
          onChange={e => setRating(Number(e.target.value))}
          style={{ background: "#333", border: "none", color: "#fff", padding: "6px 10px", borderRadius: "4px", fontSize: "14px" }}
        >
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <option key={n} value={n}>{n}/10</option>
          ))}
        </select>
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Напишіть відгук..."
        required
        rows={3}
        style={{
          background: "#333", border: "none", borderRadius: "4px",
          padding: "12px", color: "#fff", fontSize: "14px",
          resize: "vertical", outline: "none",
        }}
      />
      <button type="submit" disabled={loading} style={{
        background: "#E50914", color: "#fff", border: "none",
        borderRadius: "4px", padding: "10px 24px", fontSize: "14px",
        fontWeight: 700, cursor: "pointer", alignSelf: "flex-start",
      }}>
        {loading ? "Відправка..." : "Залишити відгук"}
      </button>
    </form>
  );
}