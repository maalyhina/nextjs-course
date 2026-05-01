import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Header from "@/app/components/Header";

export const metadata: Metadata = {
  title: "Cinemax",
  description: "Перегляд фільмів, серіалів, аніме та мультиків",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk">
      <body style={{ background: "#141414", minHeight: "100vh" }}>
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