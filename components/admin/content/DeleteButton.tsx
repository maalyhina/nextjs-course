"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm("Видалити цей контент?")) return;
    
    setLoading(true);

    try {
      await fetch(`/api/content/${id}`, { method: "DELETE" });
      router.refresh();
    } catch {
      alert("Помилка при видаленні.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button disabled={loading} onClick={handleDelete} style={{
      color: "#E50914", background: "none", border: "1px solid #E50914",
      padding: "4px 12px", borderRadius: "4px", fontSize: "13px", cursor: loading ? "not-allowed" : "pointer",
      opacity: loading ? 0.5 : 1
    }}>
      {loading ? "Видалення..." : "Видалити"}
    </button>
  );
}