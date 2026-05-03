"use client";

import { useState } from "react";

interface Episode {
  id: string;
  number: number;
  title: string;
  videoUrl: string;
  duration: number | null;
}

interface Season {
  id: string;
  number: number;
  title: string | null;
  episodes: Episode[];
}

export default function EpisodePlayer({ seasons }: { seasons: Season[] }) {
  const firstEpisode = seasons[0]?.episodes[0] || null;
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(firstEpisode);
  const [activeSeason, setActiveSeason] = useState(seasons[0]?.number || 1);

  const currentSeason = seasons.find(s => s.number === activeSeason);

  return (
    <div>
      {/* Video player */}
      {activeEpisode?.videoUrl ? (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ borderRadius: "6px", overflow: "hidden", background: "#000", border: "1px solid rgba(255,255,255,0.07)", marginBottom: "12px" }}>
            <video
              key={activeEpisode.id}
              controls
              style={{ width: "100%", maxHeight: "500px", display: "block" }}
              src={activeEpisode.videoUrl}
            />
          </div>
          <p style={{ color: "#e5e5e5", fontSize: "15px", fontWeight: 600 }}>
            S{activeSeason}:E{activeEpisode.number} — {activeEpisode.title}
          </p>
        </div>
      ) : activeEpisode ? (
        <div style={{
          background: "#1f1f1f", borderRadius: "6px", padding: "24px",
          textAlign: "center", marginBottom: "24px", border: "1px solid rgba(255,255,255,0.07)",
        }}>
          <p style={{ color: "#777" }}>Відео для цього епізоду недоступне</p>
        </div>
      ) : null}

      {/* Season tabs */}
      {seasons.length > 1 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
          {seasons.map(season => (
            <button
              key={season.id}
              onClick={() => {
                setActiveSeason(season.number);
                setActiveEpisode(season.episodes[0] || null);
              }}
              style={{
                padding: "6px 16px", borderRadius: "4px", fontSize: "14px",
                fontWeight: 700, cursor: "pointer", border: "none",
                background: activeSeason === season.number ? "#E50914" : "#2a2a2a",
                color: "#fff",
              }}
            >
              Сезон {season.number}
              {season.title && ` — ${season.title}`}
            </button>
          ))}
        </div>
      )}

      {/* Episodes list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {currentSeason?.episodes.map(ep => (
          <button
            key={ep.id}
            onClick={() => setActiveEpisode(ep)}
            style={{
              background: activeEpisode?.id === ep.id ? "rgba(229,9,20,0.15)" : "#1f1f1f",
              border: activeEpisode?.id === ep.id ? "1px solid #E50914" : "1px solid rgba(255,255,255,0.07)",
              borderRadius: "4px", padding: "12px 16px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              cursor: "pointer", width: "100%", textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                background: activeEpisode?.id === ep.id ? "#E50914" : "#333",
                color: "#fff", fontSize: "12px", fontWeight: 700,
                padding: "2px 8px", borderRadius: "2px", flexShrink: 0,
              }}>
                E{ep.number}
              </span>
              <span style={{ color: "#e5e5e5", fontSize: "14px" }}>{ep.title}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
              {ep.duration && (
                <span style={{ color: "#777", fontSize: "13px" }}>{ep.duration} хв</span>
              )}
              {ep.videoUrl ? (
                <span style={{ color: "#46d369", fontSize: "12px" }}>▶ Доступно</span>
              ) : (
                <span style={{ color: "#555", fontSize: "12px" }}>Немає відео</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}