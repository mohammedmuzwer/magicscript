import { Inter, Sora } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/theme-provider";
import { AuthProvider } from "@/lib/auth-context";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

export const metadata = {
  metadataBase: new URL("https://magicscript.ai"),
  title: {
    default: "Magic Script — Evidence-Based Multilingual Content Studio",
    template: "%s · Magic Script",
  },
  description:
    "Create viral health content backed by real science. Generate medically responsible multilingual creator content powered by scientific research verification from PubMed, NIH, WHO and FDA.",
  keywords: [
    "AI health content",
    "medical content verification",
    "multilingual content generator",
    "Tamil content AI",
    "evidence-based content",
    "PubMed AI",
    "creator tools",
  ],
  authors: [{ name: "Magic Script" }],
  openGraph: {
    title: "Magic Script — Create Viral Health Content Backed by Real Science",
    description:
      "AI scientific content studio with research-backed multilingual creator workflows.",
    type: "website",
    locale: "en_US",
    siteName: "Magic Script",
  },
  twitter: {
    card: "summary_large_image",
    title: "Magic Script",
    description:
      "AI scientific content studio with research-backed multilingual creator workflows.",
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#070b18",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${sora.variable}`}>
      <body className="app-bg min-h-screen font-sans antialiased">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
