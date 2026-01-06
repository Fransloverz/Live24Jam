import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Live24Jam - Streaming 24 Jam Nonstop Tanpa Ribet",
  description: "Platform streaming otomatis 24/7. Upload sekali, live terus dari cloud. Tanpa komputer menyala, tanpa khawatir putus.",
  keywords: "live streaming, youtube live, facebook live, 24 jam streaming, server streaming, otomatis, live24jam",
  openGraph: {
    title: "Live24Jam - Streaming 24 Jam Nonstop",
    description: "Platform streaming otomatis 24/7. Upload sekali, live terus dari cloud.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
