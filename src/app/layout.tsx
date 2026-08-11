import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JustReadPDF",
  description: "Aplicación básica",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
