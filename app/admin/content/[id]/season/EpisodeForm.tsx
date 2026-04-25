"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton } from "@/components/UploadButton";

export default function EpisodeForm({ seasonId, nextNumber }: { seasonId: string; nextNumber: number }) {
  const router = useRouter();
  const [number, setNumber] = useState(nextNumber);
  const [title, setTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [duration, setDuration] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/episodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seasonId, number, title, videoUrl, duration: duration ? Number(duration) : null }),
    });
    setTitle("");
    setVideoUrl("");
    setDuration("");
    setLoading(false);
    router.refresh();
  }

  const inputStyle = {
    background: "#2a2a2a", border: "1px solid #333", borderRadius: "4px",
    padding: "8px 12px", color: "#fff", fontSize: "14px", outline: "none",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" as const, gap: "10px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px", gap: "10px" }}>
        <div>
          <label style={{ color: "#777", fontSize: "12px", display: "block", marginBottom: "4px" }}>№</label>
          <input type="number" value={number} onChange={e => setNumber(Number(e.target.value))}
            required style={{ ...inputStyle, width: "100%" }} />
        </div>
        <div>
          <label style={{ color: "#777", fontSize: "12px", display: "block", marginBottom: "4px" }}>Назва *</label>
          <input value={title} onChange={e => setTitle(e.target.value)} required
            placeholder="Назва епізоду" style={{ ...inputStyle, width: "100%" }} />
        </div>
        <div>
          <label style={{ color: "#777", fontSize: "12px", display: "block", marginBottom: "4px" }}>Хвилини</label>
          <input type="number" value={duration} onChange={e => setDuration(e.target.value)}
            placeholder="45" style={{ ...inputStyle, width: "100%" }} />
        </div>
      </div>

      <div>
        <label style={{ color: "#777", fontSize: "12px", display: "block", marginBottom: "4px" }}>Відео URL або завантажте</label>
        <input value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
          placeholder="URL відео" style={{ ...inputStyle, width: "100%", marginBottom: "6px" }} />
        <UploadButton
          endpoint="videoUploader"
          onUploadBegin={() => setUploading(true)}
          onClientUploadComplete={(res: any) => {
            setVideoUrl(res[0].url);
            setUploading(false);
          }}
          onUploadError={() => setUploading(false)}
        />
        {uploading && <p style={{ color: "#777", fontSize: "12px" }}>Завантаження...</p>}
        {videoUrl && <p style={{ color: "#46d369", fontSize: "12px" }}>✓ Відео додано</p>}
      </div>

      <button type="submit" disabled={loading || !title} style={{
        background: "#333", color: "#fff", border: "none",
        padding: "8px 20px", borderRadius: "4px", fontWeight: 700,
        fontSize: "14px", cursor: "pointer", alignSelf: "flex-start" as const,
      }}>
        {loading ? "..." : "Додати епізод"}
      </button>
    </form>
  );
}