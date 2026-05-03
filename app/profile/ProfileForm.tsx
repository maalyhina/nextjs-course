"use client";

import { useState } from "react";
import { UploadButton } from "@/components/UploadButton";

export default function ProfileForm({ user }: { user: { id: string; name: string; email: string; avatar?: string | null } }) {
  const [name, setName] = useState(user.name);
  const [avatar, setAvatar] = useState(user.avatar || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, avatar }),
    });

    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      setError("Помилка збереження");
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "#2a2a2a", border: "1px solid #333", borderRadius: "4px",
    padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", width: "100%",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

      {/* Avatar */}
      <div>
        <label style={{ color: "#777", fontSize: "13px", marginBottom: "8px", display: "block" }}>Фото профілю</label>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "10px" }}>
          {avatar ? (
            <img src={avatar} alt="avatar" style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover" }} />
          ) : (
            <div style={{
              width: "64px", height: "64px", borderRadius: "50%",
              background: "#E50914", display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: "24px", fontWeight: 900, color: "#fff",
            }}>
              {(user.name || user.email)[0].toUpperCase()}
            </div>
          )}
          <UploadButton
            endpoint="imageUploader"
            onUploadBegin={() => setUploading(true)}
            onClientUploadComplete={(res: any) => {
              setAvatar(res[0].ufsUrl || res[0].url);
              setUploading(false);
            }}
            onUploadError={() => setUploading(false)}
          />
        </div>
        {uploading && <p style={{ color: "#777", fontSize: "13px" }}>Завантаження...</p>}
      </div>

      <div>
        <label style={{ color: "#777", fontSize: "13px", marginBottom: "6px", display: "block" }}>Ім'я</label>
        <input value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Ваше ім'я" />
      </div>

      <div>
        <label style={{ color: "#777", fontSize: "13px", marginBottom: "6px", display: "block" }}>Email</label>
        <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }} />
      </div>

      {success && <p style={{ color: "#46d369", fontSize: "13px" }}>✓ Збережено!</p>}
      {error && <p style={{ color: "#E50914", fontSize: "13px" }}>{error}</p>}

      <button type="submit" disabled={loading} style={{
        background: "#E50914", color: "#fff", border: "none",
        padding: "10px 24px", borderRadius: "4px", fontWeight: 700,
        fontSize: "14px", cursor: "pointer",
      }}>
        {loading ? "Збереження..." : "Зберегти"}
      </button>
    </form>
  );
}