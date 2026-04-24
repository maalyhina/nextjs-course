"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton, UploadDropzone } from "@/components/UploadButton";

interface Props {
  initial?: any;
  genres: any[];
}

export default function ContentForm({ initial, genres }: Props) {
  const router = useRouter();
  const isEdit = !!initial;

  const [form, setForm] = useState({
    title: initial?.title || "",
    description: initial?.description || "",
    poster: initial?.poster || "",
    backdrop: initial?.backdrop || "",
    trailerUrl: initial?.trailerUrl || "",
    videoUrl: initial?.videoUrl || "",
    type: initial?.type || "MOVIE",
    year: initial?.year || new Date().getFullYear(),
    duration: initial?.duration || "",
    country: initial?.country || "",
    genreIds: initial?.genres?.map((g: any) => g.genreId) || [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleGenre(id: string) {
    setForm(prev => ({
      ...prev,
      genreIds: prev.genreIds.includes(id)
        ? prev.genreIds.filter((g: string) => g !== id)
        : [...prev.genreIds, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(isEdit ? `/api/content/${initial.id}` : "/api/content", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        year: Number(form.year),
        duration: form.duration ? Number(form.duration) : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Помилка");
    } else {
      router.push("/admin/content");
      router.refresh();
    }
  }

  const inputStyle = {
    background: "#2a2a2a", border: "1px solid #333", borderRadius: "4px",
    padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", width: "100%",
  };
  const labelStyle = { color: "#777", fontSize: "13px", marginBottom: "6px", display: "block" as const };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Назва *</label>
          <input name="title" value={form.title} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Тип *</label>
          <select name="type" value={form.type} onChange={handleChange} style={inputStyle}>
            <option value="MOVIE">Фільм</option>
            <option value="SERIES">Серіал</option>
            <option value="ANIME">Аніме</option>
            <option value="CARTOON">Мультик</option>
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Опис *</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={4}
          style={{ ...inputStyle, resize: "vertical" }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Рік *</label>
          <input name="year" type="number" value={form.year} onChange={handleChange} required style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Тривалість (хвилини)</label>
          <input name="duration" type="number" value={form.duration} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Країна</label>
        <input name="country" value={form.country} onChange={handleChange} style={inputStyle} />
      </div>

      {/* POSTER UPLOAD */}
      <div>
        <label style={labelStyle}>Постер</label>
        {form.poster && (
          <img src={form.poster} alt="poster" style={{ width: "80px", height: "120px", objectFit: "cover", borderRadius: "4px", marginBottom: "8px", display: "block" }} />
        )}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
          <input name="poster" value={form.poster} onChange={handleChange} placeholder="або вставте URL" style={{ ...inputStyle, flex: 1 }} />
        </div>
        <UploadButton
          endpoint="imageUploader"
          onUploadBegin={() => setUploadingPoster(true)}
          onClientUploadComplete={(res) => {
            setForm(prev => ({ ...prev, poster: res[0].url }));
            setUploadingPoster(false);
          }}
          onUploadError={() => setUploadingPoster(false)}
        />
        {uploadingPoster && <p style={{ color: "#777", fontSize: "13px" }}>Завантаження...</p>}
      </div>

      {/* BACKDROP UPLOAD */}
      <div>
        <label style={labelStyle}>Backdrop (фонове зображення)</label>
        {form.backdrop && (
          <img src={form.backdrop} alt="backdrop" style={{ width: "160px", height: "90px", objectFit: "cover", borderRadius: "4px", marginBottom: "8px", display: "block" }} />
        )}
        <input name="backdrop" value={form.backdrop} onChange={handleChange} placeholder="URL або завантажте" style={{ ...inputStyle, marginBottom: "8px" }} />
        <UploadButton
          endpoint="imageUploader"
          onUploadBegin={() => setUploadingBackdrop(true)}
          onClientUploadComplete={(res) => {
            setForm(prev => ({ ...prev, backdrop: res[0].url }));
            setUploadingBackdrop(false);
          }}
          onUploadError={() => setUploadingBackdrop(false)}
        />
        {uploadingBackdrop && <p style={{ color: "#777", fontSize: "13px" }}>Завантаження...</p>}
      </div>

      {/* TRAILER URL */}
      <div>
        <label style={labelStyle}>Трейлер (YouTube URL)</label>
        <input name="trailerUrl" value={form.trailerUrl} onChange={handleChange}
          placeholder="https://www.youtube.com/watch?v=..." style={inputStyle} />
      </div>

      {/* VIDEO UPLOAD */}
      <div>
        <label style={labelStyle}>Відео файл (для фільмів)</label>
        {form.videoUrl && (
          <div style={{ marginBottom: "8px" }}>
            <video src={form.videoUrl} style={{ width: "100%", maxHeight: "200px", borderRadius: "4px" }} controls />
          </div>
        )}
        <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="URL або завантажте з ПК" style={{ ...inputStyle, marginBottom: "8px" }} />
        <div style={{ border: "2px dashed #333", borderRadius: "8px", padding: "20px" }}>
          <p style={{ color: "#777", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>
            Завантажте відео з ПК (до 512MB)
          </p>
          <UploadDropzone
            endpoint="videoUploader"
            onUploadBegin={() => setUploadingVideo(true)}
            onClientUploadComplete={(res) => {
              setForm(prev => ({ ...prev, videoUrl: res[0].url }));
              setUploadingVideo(false);
            }}
            onUploadError={(err) => {
              setError(`Помилка завантаження: ${err.message}`);
              setUploadingVideo(false);
            }}
          />
          {uploadingVideo && <p style={{ color: "#46d369", fontSize: "13px", textAlign: "center" }}>Завантаження відео...</p>}
        </div>
      </div>

      {/* GENRES */}
      {genres.length > 0 && (
        <div>
          <label style={labelStyle}>Жанри</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {genres.map((genre: any) => (
              <button key={genre.id} type="button" onClick={() => toggleGenre(genre.id)} style={{
                padding: "6px 14px", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
                background: form.genreIds.includes(genre.id) ? "#E50914" : "#2a2a2a",
                color: "#fff", border: form.genreIds.includes(genre.id) ? "none" : "1px solid #444",
              }}>
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p style={{ color: "#E50914", fontSize: "14px" }}>{error}</p>}

      <div style={{ display: "flex", gap: "12px" }}>
        <button type="submit" disabled={loading} style={{
          background: "#E50914", color: "#fff", border: "none",
          padding: "12px 32px", borderRadius: "4px", fontWeight: 700,
          fontSize: "15px", cursor: "pointer",
        }}>
          {loading ? "Збереження..." : isEdit ? "Зберегти" : "Додати"}
        </button>
        <button type="button" onClick={() => router.back()} style={{
          background: "#333", color: "#fff", border: "none",
          padding: "12px 24px", borderRadius: "4px", fontSize: "15px", cursor: "pointer",
        }}>
          Скасувати
        </button>
      </div>
    </form>
  );
}