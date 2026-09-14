import type { Metadata } from "next";
import { Piazzolla, Pixelify_Sans } from "next/font/google";
import { intro, person } from "@/content/site";
import "./globals.css";

// Two faces only: Piazzolla for everything you read, Pixelify Sans for the
// short pixel captions and labels.
const serif = Piazzolla({
  variable: "--font-piazzolla",
  subsets: ["latin"],
  axes: ["opsz"],
});

const pixel = Pixelify_Sans({
  variable: "--font-pixelify",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${person.name} — ${intro.subtitle}`,
  description: intro.thesis,
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      noimageindex: true,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${pixel.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
