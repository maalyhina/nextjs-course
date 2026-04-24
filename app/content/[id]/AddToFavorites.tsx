"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AddToFavorites({ contentId }: { contentId: string }) {
  const { data: session } = useSession();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!session) {
      window.location.href = "/login";
      return;
    }
    setLoading(true);
    await fetch("/api/favorites", {
      method: added ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contentId }),
    });
    setAdded(!added);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: added ? "rgba(229,9,20,0.2)" : "rgba(109,109,110,0.7)",
        color: "#fff", border: added ? "1px solid #E50914" : "none",
        padding: "10px 24px", borderRadius: "4px",
        fontWeight: 700, fontSize: "16px", cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {added ? "❤️ В обраному" : "+ Обране"}
    </button>
  );
}