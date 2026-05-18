"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function AddToFavorites({ contentId }: { contentId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!session) {
      setChecking(false);
      return;
    }
    fetch(`/api/favorites?contentId=${contentId}`, { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        setAdded(data.isFavorite);
        setChecking(false);
      })
      .catch(() => setChecking(false));
  }, [session, contentId]);

  async function toggle() {
    if (!session) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
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
    router.refresh();
  }

  if (checking) return null;

  return (
    <button
      onClick={toggle}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        background: added ? "rgba(229,9,20,0.15)" : "rgba(109,109,110,0.7)",
        color: "#fff",
        border: added ? "2px solid #E50914" : "2px solid transparent",
        padding: "10px 20px", borderRadius: "4px",
        fontWeight: 700, fontSize: "15px",
        cursor: loading ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        opacity: loading ? 0.7 : 1,
        whiteSpace: "nowrap",   
        flexShrink: 0,      
      }}
    >
      {added ? "❤ В обраному" : "+ Обране"}
    </button>
  );
}