"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UploadButton, UploadDropzone } from "@/components/UploadButton";

interface Episode {
  number: number;
  title: string;
  videoUrl: string;
  duration: string;
}

interface Season {
  number: number;
  title: string;
  episodes: Episode[];
}

interface Props {
  initial?: any;
  genres: any[];
  actors: any[];
}

export default function ContentForm({ initial, genres, actors }: Props) {
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
    actorIds: initial?.actors?.map((a: any) => ({ actorId: a.actorId, role: a.role || "" })) || [],
  });

  const [seasons, setSeasons] = useState<Season[]>(
    initial?.seasons?.map((s: any) => ({
      number: s.number,
      title: s.title || "",
      episodes: s.episodes?.map((e: any) => ({
        number: e.number,
        title: e.title,
        videoUrl: e.videoUrl || "",
        duration: e.duration?.toString() || "",
      })) || [],
    })) || []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPoster, setUploadingPoster] = useState(false);
  const [uploadingBackdrop, setUploadingBackdrop] = useState(false);

  const isSeries = form.type === "SERIES" || form.type === "ANIME";

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

  function toggleActor(actorId: string) {
    setForm(prev => {
      const exists = prev.actorIds.find((a: any) => a.actorId === actorId);
      return {
        ...prev,
        actorIds: exists
          ? prev.actorIds.filter((a: any) => a.actorId !== actorId)
          : [...prev.actorIds, { actorId, role: "" }],
      };
    });
  }

  function updateActorRole(actorId: string, role: string) {
    setForm(prev => ({
      ...prev,
      actorIds: prev.actorIds.map((a: any) =>
        a.actorId === actorId ? { ...a, role } : a
      ),
    }));
  }

  function addSeason() {
    setSeasons(prev => [...prev, { number: prev.length + 1, title: "", episodes: [] }]);
  }

  function removeSeason(index: number) {
    setSeasons(prev => prev.filter((_, i) => i !== index));
  }

  function updateSeason(index: number, field: string, value: string) {
    setSeasons(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  }

  function addEpisode(seasonIndex: number) {
    setSeasons(prev => prev.map((s, i) =>
      i === seasonIndex
        ? { ...s, episodes: [...s.episodes, { number: s.episodes.length + 1, title: "", videoUrl: "", duration: "" }] }
        : s
    ));
  }

  function removeEpisode(seasonIndex: number, epIndex: number) {
    setSeasons(prev => prev.map((s, i) =>
      i === seasonIndex
        ? { ...s, episodes: s.episodes.filter((_, ei) => ei !== epIndex) }
        : s
    ));
  }

  function updateEpisode(seasonIndex: number, epIndex: number, field: string, value: string) {
    setSeasons(prev => prev.map((s, i) =>
      i === seasonIndex
        ? { ...s, episodes: s.episodes.map((ep, ei) => ei === epIndex ? { ...ep, [field]: value } : ep) }
        : s
    ));
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
        seasons: isSeries ? seasons : [],
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

  const inputStyle: React.CSSProperties = {
    background: "#2a2a2a", border: "1px solid #333", borderRadius: "4px",
    padding: "10px 14px", color: "#fff", fontSize: "14px", outline: "none", width: "100%",
  };
  const labelStyle: React.CSSProperties = { color: "#777", fontSize: "13px", marginBottom: "6px", display: "block" };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* Basic info */}
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
        <div>
          <label style={labelStyle}>Рік *</label>
          <input name="year" type="number" value={form.year} onChange={handleChange} required style={inputStyle} />
        </div>
        {!isSeries && (
          <div>
            <label style={labelStyle}>Тривалість (хвилини)</label>
            <input name="duration" type="number" value={form.duration} onChange={handleChange} style={inputStyle} />
          </div>
        )}
        <div>
          <label style={labelStyle}>Країна</label>
          <input name="country" value={form.country} onChange={handleChange} style={inputStyle} />
        </div>
      </div>

      {/* Poster */}
      <div>
        <label style={labelStyle}>Постер</label>
        {form.poster && <img src={form.poster} alt="poster" style={{ width: "80px", height: "120px", objectFit: "cover", borderRadius: "4px", marginBottom: "8px", display: "block" }} />}
        <input name="poster" value={form.poster} onChange={handleChange} placeholder="URL постера" style={{ ...inputStyle, marginBottom: "8px" }} />
        <UploadButton endpoint="imageUploader"
          onUploadBegin={() => setUploadingPoster(true)}
          onClientUploadComplete={(res: any) => { setForm(p => ({ ...p, poster: res[0].ufsUrl || res[0].url })); setUploadingPoster(false); }}
          onUploadError={() => setUploadingPoster(false)}
        />
        {uploadingPoster && <p style={{ color: "#777", fontSize: "13px" }}>Завантаження...</p>}
      </div>

      {/* Backdrop */}
      <div>
        <label style={labelStyle}>Backdrop (фонове зображення)</label>
        {form.backdrop && <img src={form.backdrop} alt="backdrop" style={{ width: "160px", height: "90px", objectFit: "cover", borderRadius: "4px", marginBottom: "8px", display: "block" }} />}
        <input name="backdrop" value={form.backdrop} onChange={handleChange} placeholder="URL backdrop" style={{ ...inputStyle, marginBottom: "8px" }} />
        <UploadButton endpoint="imageUploader"
          onUploadBegin={() => setUploadingBackdrop(true)}
          onClientUploadComplete={(res: any) => { setForm(p => ({ ...p, backdrop: res[0].ufsUrl || res[0].url })); setUploadingBackdrop(false); }}
          onUploadError={() => setUploadingBackdrop(false)}
        />
        {uploadingBackdrop && <p style={{ color: "#777", fontSize: "13px" }}>Завантаження...</p>}
      </div>

      {/* Trailer */}
      <div>
        <label style={labelStyle}>Трейлер (YouTube URL)</label>
        <input name="trailerUrl" value={form.trailerUrl} onChange={handleChange}
          placeholder="https://www.youtube.com/watch?v=..." style={inputStyle} />
      </div>

      {/* Video — only for movies/cartoons */}
      {!isSeries && (
        <div>
          <label style={labelStyle}>Відео файл</label>
          {form.videoUrl && <video src={form.videoUrl} style={{ width: "100%", maxHeight: "200px", borderRadius: "4px", marginBottom: "8px" }} controls />}
          <input name="videoUrl" value={form.videoUrl} onChange={handleChange} placeholder="URL відео або завантажте" style={{ ...inputStyle, marginBottom: "8px" }} />
          <div style={{ border: "2px dashed #333", borderRadius: "8px", padding: "20px" }}>
            <p style={{ color: "#777", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>Завантажте відео (до 2GB)</p>
            <UploadDropzone endpoint="videoUploader"
              onUploadBegin={() => setUploadingVideo(true)}
              onClientUploadComplete={(res: any) => { setForm(p => ({ ...p, videoUrl: res[0].ufsUrl || res[0].url })); setUploadingVideo(false); }}
              onUploadError={(err: any) => { setError(`Помилка: ${err.message}`); setUploadingVideo(false); }}
            />
            {uploadingVideo && <p style={{ color: "#46d369", fontSize: "13px", textAlign: "center" }}>Завантаження...</p>}
            {form.videoUrl && <p style={{ color: "#46d369", fontSize: "13px", textAlign: "center" }}>✓ Відео додано</p>}
          </div>
        </div>
      )}

      {/* Genres */}
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

      {/* Actors */}
      {actors.length > 0 && (
        <div>
          <label style={labelStyle}>Актори</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {actors.map((actor: any) => {
              const selected = form.actorIds.find((a: any) => a.actorId === actor.id);
              return (
                <div key={actor.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <button type="button" onClick={() => toggleActor(actor.id)} style={{
                    padding: "6px 14px", borderRadius: "20px", fontSize: "13px", cursor: "pointer",
                    background: selected ? "#E50914" : "#2a2a2a",
                    color: "#fff", border: selected ? "none" : "1px solid #444",
                    flexShrink: 0,
                  }}>
                    {actor.name}
                  </button>
                  {selected && (
                    <input
                      placeholder="Роль у фільмі"
                      value={selected.role}
                      onChange={e => updateActorRole(actor.id, e.target.value)}
                      style={{ ...inputStyle, width: "200px", padding: "6px 10px", fontSize: "13px" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Seasons & Episodes — only for series/anime */}
      {isSeries && (
        <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ color: "#fff", fontSize: "18px", fontWeight: 700, margin: 0 }}>Сезони та епізоди</h3>
            <button type="button" onClick={addSeason} style={{
              background: "#E50914", color: "#fff", border: "none",
              padding: "8px 16px", borderRadius: "4px", fontSize: "13px",
              fontWeight: 700, cursor: "pointer",
            }}>
              + Додати сезон
            </button>
          </div>

          {seasons.length === 0 && (
            <p style={{ color: "#777", fontSize: "14px", textAlign: "center" }}>Додайте перший сезон</p>
          )}

          {seasons.map((season, sIdx) => (
            <div key={sIdx} style={{ background: "#1a1a1a", borderRadius: "6px", padding: "16px", marginBottom: "16px", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "16px" }}>
                <div style={{ display: "flex", gap: "8px", flex: 1 }}>
                  <input
                    type="number"
                    value={season.number}
                    onChange={e => updateSeason(sIdx, "number", e.target.value)}
                    placeholder="№"
                    style={{ ...inputStyle, width: "70px" }}
                  />
                  <input
                    value={season.title}
                    onChange={e => updateSeason(sIdx, "title", e.target.value)}
                    placeholder={`Назва сезону ${season.number} (необов'язково)`}
                    style={inputStyle}
                  />
                </div>
                <button type="button" onClick={() => removeSeason(sIdx)} style={{
                  background: "none", border: "1px solid #E50914", color: "#E50914",
                  padding: "6px 12px", borderRadius: "4px", fontSize: "13px", cursor: "pointer", flexShrink: 0,
                }}>
                  Видалити
                </button>
              </div>

              {/* Episodes */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "12px" }}>
                {season.episodes.map((ep, epIdx) => (
                  <div key={epIdx} style={{ background: "#141414", borderRadius: "4px", padding: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 80px", gap: "8px", marginBottom: "8px" }}>
                      <input
                        type="number"
                        value={ep.number}
                        onChange={e => updateEpisode(sIdx, epIdx, "number", e.target.value)}
                        placeholder="№"
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                      <input
                        value={ep.title}
                        onChange={e => updateEpisode(sIdx, epIdx, "title", e.target.value)}
                        placeholder="Назва епізоду *"
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                      <input
                        type="number"
                        value={ep.duration}
                        onChange={e => updateEpisode(sIdx, epIdx, "duration", e.target.value)}
                        placeholder="хв"
                        style={{ ...inputStyle, padding: "8px" }}
                      />
                    </div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        value={ep.videoUrl}
                        onChange={e => updateEpisode(sIdx, epIdx, "videoUrl", e.target.value)}
                        placeholder="URL відео або завантажте"
                        style={{ ...inputStyle, flex: 1, padding: "8px", fontSize: "13px" }}
                      />
                      <UploadButton
                        endpoint="videoUploader"
                        onClientUploadComplete={(res: any) => updateEpisode(sIdx, epIdx, "videoUrl", res[0].ufsUrl || res[0].url)}
                        onUploadError={() => {}}
                      />
                      <button type="button" onClick={() => removeEpisode(sIdx, epIdx)} style={{
                        background: "none", border: "1px solid #555", color: "#777",
                        padding: "6px 10px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", flexShrink: 0,
                      }}>
                        ✕
                      </button>
                    </div>
                    {ep.videoUrl && <p style={{ color: "#46d369", fontSize: "12px", margin: "4px 0 0" }}>✓ Відео додано</p>}
                  </div>
                ))}
              </div>

              <button type="button" onClick={() => addEpisode(sIdx)} style={{
                background: "#2a2a2a", color: "#e5e5e5", border: "1px solid #444",
                padding: "8px 16px", borderRadius: "4px", fontSize: "13px",
                cursor: "pointer", width: "100%",
              }}>
                + Додати епізод
              </button>
            </div>
          ))}
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