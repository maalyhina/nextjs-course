"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  }

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      height: "68px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 4rem",
      transition: "background 0.4s ease",
      background: scrolled ? "#141414" : "linear-gradient(to bottom, rgba(0,0,0,0.85), transparent)",
    }}>

      {/* LEFT */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "#E50914", fontSize: "26px", fontWeight: 900, letterSpacing: "-1px" }}>
            CINEMAX
          </span>
        </Link>

        {/* Навігація залежно від ролі */}
        <nav style={{ display: "flex", gap: "20px" }}>
          {isAdmin ? (
            // Навігація для АДМІНА
            <>
              {[
                { label: "Панель", href: "/admin" },
                { label: "Фільми", href: "/admin/movies" },
                { label: "Користувачі", href: "/admin/users" },
              ].map(({ label, href }) => (
                <Link key={href} href={href} style={{
                  color: "#e5e5e5", textDecoration: "none",
                  fontSize: "14px", fontWeight: 500,
                  transition: "color 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#e5e5e5")}
                >
                  {label}
                </Link>
              ))}
            </>
          ) : (
            // Навігація для звичайного USER
            <>
              {[
                { label: "Фільми", href: "/movies?type=MOVIE" },
                { label: "Серіали", href: "/movies?type=SERIES" },
                { label: "Аніме", href: "/movies?type=ANIME" },
                { label: "Мультики", href: "/movies?type=CARTOON" },
                { label: "Обране", href: "/favorites" },
              ].map(({ label, href }) => (
                <Link key={href} href={href} style={{
                  color: "#e5e5e5", textDecoration: "none",
                  fontSize: "14px", fontWeight: 500,
                  transition: "color 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#e5e5e5")}
                >
                  {label}
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>

        {/* Пошук — тільки для USER, не для адміна */}
        {!isAdmin && (
          <form onSubmit={handleSearch} style={{ display: "flex", alignItems: "center" }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Пошук..."
              style={{
                background: "rgba(0,0,0,0.6)",
                border: "1px solid #444",
                borderRadius: "4px",
                padding: "6px 12px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                width: "180px",
              }}
            />
          </form>
        )}

        {session ? (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                background: isAdmin ? "#b8860b" : "#E50914",
                color: "#fff", border: "none",
                borderRadius: "4px", padding: "7px 16px",
                fontSize: "14px", fontWeight: 700, cursor: "pointer",
              }}
            >
              {isAdmin && "⚙ "}
              {(session.user as any)?.name || session.user?.email?.split("@")[0]}
            </button>

            {menuOpen && (
              <div style={{
                position: "absolute", top: "42px", right: 0,
                background: "#1f1f1f", border: "1px solid #333",
                borderRadius: "4px", minWidth: "180px", zIndex: 100,
              }}>

                {isAdmin ? (
                  <>
                    <div style={{
                      padding: "8px 16px 6px",
                      fontSize: "11px", color: "#888",
                      textTransform: "uppercase", letterSpacing: "1px",
                      borderBottom: "1px solid #2a2a2a",
                    }}>
                      Адміністратор
                    </div>
                    <Link href="/admin" style={{ display: "block", padding: "10px 16px", color: "#b8860b", textDecoration: "none", fontSize: "14px", fontWeight: 700 }}
                      onClick={() => setMenuOpen(false)}>
                      Адмін панель
                    </Link>
                    <Link href="/admin/content" style={{ display: "block", padding: "10px 16px", color: "#e5e5e5", textDecoration: "none", fontSize: "14px" }}
                      onClick={() => setMenuOpen(false)}>
                      Керування фільмами
                    </Link>
                    <Link href="/admin/users" style={{ display: "block", padding: "10px 16px", color: "#e5e5e5", textDecoration: "none", fontSize: "14px" }}
                      onClick={() => setMenuOpen(false)}>
                      Керування користувачами
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/history" style={{ display: "block", padding: "10px 16px", color: "#e5e5e5", textDecoration: "none", fontSize: "14px" }}
                      onClick={() => setMenuOpen(false)}>
                      Історія
                    </Link>
                    <Link href="/profile" style={{ display: "block", padding: "10px 16px", color: "#e5e5e5", textDecoration: "none", fontSize: "14px" }}
                      onClick={() => setMenuOpen(false)}>
                      Профіль
                    </Link>
                  </>
                )}

                {/* Вийти — для всіх */}
                <div style={{ borderTop: "1px solid #2a2a2a", marginTop: "4px" }}>
                  <button
                    onClick={() => { signOut(); setMenuOpen(false); }}
                    style={{
                      display: "block", width: "100%", textAlign: "left",
                      padding: "10px 16px", color: "#E50914", background: "none",
                      border: "none", fontSize: "14px", cursor: "pointer",
                    }}
                  >
                    Вийти
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" style={{
            background: "#E50914", color: "#fff", textDecoration: "none",
            padding: "7px 18px", borderRadius: "4px",
            fontSize: "14px", fontWeight: 700,
          }}>
            Увійти
          </Link>
        )}
      </div>
    </header>
  );
}