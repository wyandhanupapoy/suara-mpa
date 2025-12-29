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

export const metadata = {
  title: "Suara MPA HIMAKOM - Platform Aspirasi Mahasiswa",
  description: "Platform resmi untuk menyampaikan aspirasi, kritik, dan saran mahasiswa kepada MPA HIMAKOM Politeknik Negeri Bandung secara anonim dan aman.",
  keywords: "MPA, HIMAKOM, POLBAN, aspirasi mahasiswa, kritik dan saran, anonymous feedback",
  authors: [{ name: "MPA HIMAKOM" }],
  creator: "MPA HIMAKOM",
  publisher: "MPA HIMAKOM POLBAN",
  robots: "index, follow",
  openGraph: {
    title: "Suara MPA HIMAKOM",
    description: "Suarakan aspirasi Anda dengan aman dan anonim",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Suara MPA HIMAKOM",
    description: "Platform aspirasi mahasiswa yang aman dan terpercaya",
  },
};

// Viewport configuration (Next.js 16+ requirement)
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#3b82f6",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
