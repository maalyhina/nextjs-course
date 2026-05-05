"use client";
import { useRouter } from "next/navigation";

export default function DeleteSeasonButton({ id }: { id: string }) {
  const router = useRouter();
  async function handleDelete() {
    if (!confirm("Видалити сезон і всі його епізоди?")) return;
    await fetch(`/api/seasons/${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <button onClick={handleDelete} style={{
      color: "#E50914", background: "none", border: "1px solid #E50914",
      padding: "4px 12px", borderRadius: "4px", fontSize: "13px", cursor: "pointer",
    }}>Видалити сезон</button>
  );
}