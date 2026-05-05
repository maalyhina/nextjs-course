import type { Metadata, Viewport } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Cinemax",
  description: "Перегляд фільмів, серіалів, аніме та мультиків",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body style={{ background: "#141414", minHeight: "100vh", margin: 0, padding: 0 }}>
        <Providers>
          <Header />
          <main style={{ paddingTop: "68px" }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}