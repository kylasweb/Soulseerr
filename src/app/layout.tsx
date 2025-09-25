import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/components/auth/EnhancedAuthProvider";
import "@/lib/notification-init"; // Initialize notification scheduler

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SoulSeer - A Community of Gifted Psychics",
  description: "Connect with gifted spiritual readers and discover your path. Premium mystical consultation platform with ethical guidance and compassionate support.",
  keywords: ["psychic", "spiritual", "tarot", "astrology", "mediumship", "guidance", "mystical", "soulseer"],
  authors: [{ name: "SoulSeer Team" }],
  openGraph: {
    title: "SoulSeer - A Community of Gifted Psychics",
    description: "Connect with gifted spiritual readers and discover your path",
    url: "https://soulseer.com",
    siteName: "SoulSeer",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SoulSeer - A Community of Gifted Psychics",
    description: "Connect with gifted spiritual readers and discover your path",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-black text-white min-h-screen`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
