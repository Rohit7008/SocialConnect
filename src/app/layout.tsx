import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { AuthProvider } from "@/context/AuthProvider";
import { ThemeProvider } from "@/context/ThemeProvider";

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
    default: "SocialConnect - Connect, Share, and Discover",
    template: "%s | SocialConnect",
  },
  description:
    "SocialConnect is a modern social media platform where you can connect with friends, share your thoughts and experiences, discover amazing content, and build meaningful relationships. Join our vibrant community today!",
  keywords: [
    "social media",
    "social network",
    "connect",
    "share",
    "discover",
    "community",
    "social platform",
    "networking",
    "posts",
    "friends",
  ],
  authors: [{ name: "SocialConnect Team" }],
  creator: "SocialConnect",
  publisher: "SocialConnect",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://socialconnect.app",
    siteName: "SocialConnect",
    title: "SocialConnect - Connect, Share, and Discover",
    description:
      "SocialConnect is a modern social media platform where you can connect with friends, share your thoughts and experiences, discover amazing content, and build meaningful relationships.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SocialConnect - Connect, Share, and Discover",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SocialConnect - Connect, Share, and Discover",
    description:
      "SocialConnect is a modern social media platform where you can connect with friends, share your thoughts and experiences, discover amazing content, and build meaningful relationships.",
    images: ["/og-image.png"],
    creator: "@socialconnect",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://socialconnect.app"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('theme-mode');
                  var html = document.documentElement;
                  if (saved === 'light' || saved === 'dark') {
                    html.setAttribute('data-theme', saved);
                  } else {
                    html.removeAttribute('data-theme');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <Nav />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
