import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PSIUMEET — Vídeo P2P WebRTC 1x1 com Registro Imutável",
    template: "%s | PSIUMEET",
  },

  description:
    "Plataforma de vídeo peer-to-peer (P2P) baseada em WebRTC, exclusiva para sessões 1x1. Gravação server-side, telemetria em tempo real e registro imutável de eventos. Ideal para atendimentos, perícias, supervisões e sessões que exigem conformidade e resguardo legal.",

  keywords: [
    "vídeo P2P",
    "WebRTC 1x1",
    "chamada peer-to-peer",
    "vídeo um para um",
    "WebRTC enterprise",
    "gravação de sessão 1x1",
    "telemetria WebRTC",
    "vídeo com auditoria",
    "registro imutável de vídeo",
    "PSIUMEET",
    "plataforma de vídeo forense",
    "sessão segura 1x1",
  ],

  authors: [{ name: "PSIUMEET" }],
  creator: "PSIUMEET",
  publisher: "PSIUMEET",

  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://psiumeeet.com.br",
    siteName: "PSIUMEET",
    title: "PSIUMEET — Vídeo P2P WebRTC exclusivo para sessões 1x1",
    description:
      "Solução de vídeo peer-to-peer (WebRTC) focada exclusivamente em chamadas 1x1, com gravação server-side, telemetria e registro imutável de eventos.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PSIUMEET - Vídeo P2P WebRTC 1x1",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "PSIUMEET — WebRTC P2P 1x1 com Registro Imutável",
    description:
      "Plataforma de vídeo peer-to-peer exclusiva para sessões 1x1. Gravação server-side + telemetria + evidência imutável.",
    images: ["/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  alternates: {
    canonical: "https://psiumeeet.com.br",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0a0b] text-zinc-100">
        {children}
      </body>
    </html>
  );
}