export default function Footer() {
  return (
    <footer style={{
      background: "#0a0a0a",
      borderTop: "1px solid rgba(255,255,255,0.07)",
      color: "#555",
      fontSize: "13px",
      padding: "32px 2rem",
      textAlign: "center",
    }}>
      <p style={{ margin: "0 0 8px", color: "#E50914", fontWeight: 900, fontSize: "16px", letterSpacing: "0.1em" }}>
        CINEMAX
      </p>
      <p style={{ margin: 0 }}>
        © {new Date().getFullYear()} Cinemax. Всі права захищено.
      </p>
    </footer>
  );
}