import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import MiniKitProvider from "@/providers/minikit-provider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sudoku Challenge - World App",
  description: "A tasteful, mobile-first Sudoku with World ID verification",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/sudoku.png", type: "image/png" },
      { url: "/globe.svg", type: "image/svg+xml" }
    ],
    apple: { url: "/sudoku.png", type: "image/png" }
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MiniKitProvider>
          {children}
        </MiniKitProvider>
      </body>
    </html>
  );
}