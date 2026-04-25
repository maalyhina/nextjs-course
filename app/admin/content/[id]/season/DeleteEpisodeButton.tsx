"use client";
import { useRouter } from "next/navigation";

export default function DeleteEpisodeButton({ id }: { id: string }) {
  const router = useRouter();
  async function handleDelete() {
    if (!confirm("Видалити епізод?")) return;
    await fetch(`/api/episodes/${id}`, { method: "DELETE" });
    router.refresh();
  }
  return (
    <button onClick={handleDelete} style={{
      color: "#777", background: "none", border: "1px solid #444",
      padding: "3px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer",
    }}>Видалити</button>
  );
}