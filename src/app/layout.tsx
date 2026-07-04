import type { Metadata } from "next";
import { Sora, Fraunces } from "next/font/google";
import Link from "next/link";
import { Database, FolderOpen, Award, BarChart3 } from "lucide-react";
import PaperTexture from "@/components/PaperTexture";
import EditorialOrganicElement from "@/components/EditorialOrganicElement";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "TenderDB — Procurement Analytics Platform",
  description: "High-performance exploration of millions of active tenders and contract awards.",
};

export default function RootLayout({
  children,
  ...props
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${sora.variable} ${fraunces.variable} antialiased min-h-full flex flex-col bg-[#FAF8F2] text-[#2D3A1F] selection:bg-[#C4AD6A]/30 selection:text-[#2D3A1F]`}
      >
        <PaperTexture />
        <EditorialOrganicElement
          style={{
            position: 'fixed',
            right: '-100px',
            bottom: '-40px',
            top: 'auto',
            width: '440px',
            height: '440px',
            opacity: 0.075,
            animation: 'botanicalFloat 32s ease-in-out infinite',
            zIndex: 1,
          }}
        />
        <header className="sticky top-0 z-40 w-full border-b border-[#D4CFC3] bg-[#FAF8F2]/85 backdrop-blur-md">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-4">
              {/* Logo / Brand */}
              <div className="flex items-center gap-8">
                <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-90">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2D3A1F] shadow-md shadow-[#2D3A1F]/10">
                    <Database className="h-5 w-5 text-[#FAF8F2]" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-[#2D3A1F]" style={{ fontFamily: "var(--font-fraunces)" }}>
                    Tender<span className="text-[#C4AD6A]">DB</span>
                  </span>
                </Link>
                
                {/* Navigation links */}
                <nav className="hidden md:flex items-center gap-1">
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium text-[#2D3A1F]/70 hover:text-[#2D3A1F] hover:bg-[#EDE8DA] transition-colors"
                  >
                    <BarChart3 className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/tenders"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium text-[#2D3A1F]/70 hover:text-[#2D3A1F] hover:bg-[#EDE8DA] transition-colors"
                  >
                    <FolderOpen className="h-4 w-4" />
                    Tenders
                  </Link>
                  <Link
                    href="/aoc"
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium text-[#2D3A1F]/70 hover:text-[#2D3A1F] hover:bg-[#EDE8DA] transition-colors"
                  >
                    <Award className="h-4 w-4" />
                    Contract Awards
                  </Link>
                </nav>
              </div>

              {/* Status indicator */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-[#EDE8DA] border border-[#D4CFC3] px-3.5 py-1.5 rounded-full text-xs font-medium text-[#2D3A1F]/80">
                  <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  Local DB Connected
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col w-full mx-auto max-w-6xl px-6 sm:px-8 lg:px-12 py-10">
          {children}
        </main>

        <footer className="border-t border-[#D4CFC3] py-10 text-center text-xs text-[#2D3A1F]/40">
          <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} TenderDB. Powered by Next.js & DuckDB.</p>
            <div className="flex gap-6 text-[10px] tracking-[0.15em] uppercase">
              <Link href="/tenders" className="hover:text-[#2D3A1F] transition-colors">Tenders</Link>
              <Link href="/aoc" className="hover:text-[#2D3A1F] transition-colors">Contract Awards</Link>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
