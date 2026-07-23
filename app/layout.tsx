import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const notoSans = localFont({
  src: [
    {
      path: "./fonts/Noto_Sans/NotoSans-VariableFont_wdth,wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/Noto_Sans/NotoSans-Italic-VariableFont_wdth,wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-sans",
});

const playfairDisplay = localFont({
  src: [
    {
      path: "./fonts/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf",
      style: "normal",
    },
    {
      path: "./fonts/Playfair_Display/PlayfairDisplay-Italic-VariableFont_wght.ttf",
      style: "italic",
    },
  ],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: "ETUSL Human Resource Management Attendance",
    template: "%s | ETUSL HR",
  },
  description: "An Attendance Tracker that tracks employee attendance",
};

export const viewport: Viewport = {
  themeColor: "#0f1a2e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${notoSans.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
