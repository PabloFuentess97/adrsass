import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Generador ADR HP Latex",
  description: "Herramienta privada para generar senales ADR vectoriales con CutContour.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
