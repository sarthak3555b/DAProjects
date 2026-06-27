import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "reactflow/dist/style.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: { default: "Wealth Mastery OS", template: "%s · Wealth Mastery OS" },
  description: "A living learning operating system to master money, business, investing, technology and capital allocation over 10 years.",
  manifest: "/manifest.webmanifest",
  applicationName: "Wealth Mastery OS",
  appleWebApp: { capable: true, title: "Wealth Mastery OS", statusBarStyle: "black-translucent" },
  openGraph: { title: "Wealth Mastery OS", description: "Learn · Build · Observe · Reflect · Implement · Review · Repeat.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#09090B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
