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
    if (res.ok) setSuccess(true);
    else setError("Помилка збереження");
  }

  const inputStyle: React.CSSProperties = {
    background: "#2a2a2a",
    border: "1px solid #333",
    borderRadius: "4px",
    padding: "10px 14px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
        .upload-btn-wrap {
          width: 100%;
          overflow: hidden;
        }
        /* Перебиваємо стилі uploadthing */
        .upload-btn-wrap > div,
        .upload-btn-wrap label {
          width: 100% !important;
          max-width: 100% !important;
        }
        .upload-btn-wrap input[type="file"] {
          max-width: 100%;
          font-size: 13px;
        }
        .upload-btn-wrap button {
          width: 100% !important;
          box-sizing: border-box !important;
        }
      `}</style>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Avatar */}
        <div>
          <label style={{ color: "#777", fontSize: "13px", marginBottom: "8px", display: "block" }}>
            Фото профілю
          </label>

          {/* Превью аватара */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            {avatar ? (
              <img
                src={avatar}
                alt="avatar"
                style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
              />
            ) : (
              <div style={{
                width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
                background: "#E50914", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: "20px", fontWeight: 900, color: "#fff",
              }}>
                {(user.name || user.email)[0].toUpperCase()}
              </div>
            )}
            <span style={{ color: "#555", fontSize: "12px" }}>
              {uploading ? "Завантаження..." : avatar ? "Фото встановлено" : "Фото не вибрано"}
            </span>
          </div>

          {/* UploadButton в окремому контейнері з обмеженою шириною */}
          <div className="upload-btn-wrap">
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
        </div>

        <div>
          <label style={{ color: "#777", fontSize: "13px", marginBottom: "6px", display: "block" }}>Ім'я</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={inputStyle}
            placeholder="Ваше ім'я"
          />
        </div>

        <div>
          <label style={{ color: "#777", fontSize: "13px", marginBottom: "6px", display: "block" }}>Email</label>
          <input
            value={user.email}
            disabled
            style={{ ...inputStyle, opacity: 0.5, cursor: "not-allowed" }}
          />
        </div>

        {success && <p style={{ color: "#46d369", fontSize: "13px", margin: 0 }}>✓ Збережено!</p>}
        {error && <p style={{ color: "#E50914", fontSize: "13px", margin: 0 }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{
            background: "#E50914", color: "#fff", border: "none",
            padding: "12px 24px", borderRadius: "4px", fontWeight: 700,
            fontSize: "14px", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1, width: "100%", boxSizing: "border-box",
          }}
        >
          {loading ? "Збереження..." : "Зберегти"}
        </button>
      </form>
    </>
  );
}