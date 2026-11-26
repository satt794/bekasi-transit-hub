import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";
import { OfflineSupport } from "@/components/OfflineSupport";

const archivo = Plus_Jakarta_Sans({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TransitKita — Transportasi Jabodetabek",
  description:
    "Panduan perjalanan transportasi umum Jabodetabek, jadwal KRL, dan informasi bus.",
  applicationName: "TransitKita",
  icons: { icon: "/transitkita.svg", apple: "/transitkita.svg" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0f766e" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1011" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme diisi skrip di <head> sebelum paint → butuh suppressHydrationWarning.
    <html lang="id" className={`${archivo.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body><OfflineSupport/>{children}</body>
    </html>
  );
}
