import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{
      background: "#141414", minHeight: "100vh", color: "#fff",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    }}>
      <h1 style={{ fontSize: "96px", fontWeight: 900, color: "#E50914", margin: 0, lineHeight: 1 }}>404</h1>
      <p style={{ fontSize: "20px", color: "#aaa", margin: "16px 0 32px" }}>Сторінку не знайдено</p>
      <Link href="/" style={{
        background: "#E50914", color: "#fff", textDecoration: "none",
        padding: "12px 28px", borderRadius: "6px", fontWeight: 700, fontSize: "15px",
      }}>
        На головну
      </Link>
    </div>
  );
}