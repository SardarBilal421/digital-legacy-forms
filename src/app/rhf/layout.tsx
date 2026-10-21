import type { ReactNode } from "react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-rhf",
});

/**
 * "Classic Wizard" (GEICO-minimal) scope. Its own typeface (Inter) and a
 * light-gray canvas; all RHF styling lives under `.rhf-scope`.
 */
export default function RhfLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${inter.variable} rhf-scope min-h-screen bg-slate-100 font-[family-name:var(--font-rhf)] text-slate-900`}
    >
      {children}
    </div>
  );
}
