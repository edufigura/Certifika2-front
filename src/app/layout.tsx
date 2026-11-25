import type { Metadata, Viewport } from "next";
import { DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const bodyFont = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Certifika2 — Tu próximo nivel empieza aquí",
    template: "%s | Certifika2",
  },
  description:
    "Plataforma de certificaciones profesionales en ciberseguridad, IoT, cloud, datos, IA y más.",
  icons: {
    icon: [{ url: "/brand-mark.svg", type: "image/svg+xml" }],
    apple: "/brand-mark.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f8fc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${bodyFont.variable} ${displayFont.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Saltar al contenido</a>
        <Header />
        <main className="main" id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
