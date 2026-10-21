import type { ReactNode } from "react";
import { Source_Serif_4, Inter } from "next/font/google";

const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-conform-serif" });
const sans = Inter({ subsets: ["latin"], variable: "--font-conform" });

/**
 * "Task List Hub" (GOV.UK-style) scope — minimal, editorial, lots of whitespace,
 * serif headings over a clean near-white page. All Conform styling lives under
 * `.conform-scope`.
 */
export default function ConformLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${serif.variable} ${sans.variable} conform-scope min-h-screen bg-stone-50 font-[family-name:var(--font-conform)] text-stone-900`}
    >
      {children}
    </div>
  );
}
