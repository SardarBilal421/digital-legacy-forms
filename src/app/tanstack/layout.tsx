import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

const geist = Geist({ subsets: ["latin"], variable: "--font-tanstack" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-tanstack-mono" });

/**
 * "Sidebar Dashboard" scope — dark, modern SaaS (Linear/Vercel). Its own
 * typeface (Geist) and a near-black canvas; all TanStack styling lives under
 * `.tanstack-scope`.
 */
export default function TanstackLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${geist.variable} ${geistMono.variable} tanstack-scope min-h-screen bg-zinc-950 font-[family-name:var(--font-tanstack)] text-zinc-100`}
    >
      {children}
    </div>
  );
}
