import type { Metadata } from "next";
import { IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "XRlab Assembler — Заявки на монтаж",
  description:
    "Внутренний таск-трекер для монтажа печатных плат и сборки прототипов",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ru">
      <body
        className={`${ibmPlexSans.className} ${jetbrainsMono.variable} min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
