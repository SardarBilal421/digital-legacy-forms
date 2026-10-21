import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-baseline" });

/**
 * "Split Screen Live Preview" scope — calm, premium, teal accent with a secure
 * feel. Its own typeface (Plus Jakarta Sans). All baseline styling lives under
 * `.baseline-scope`.
 */
export default function BaselineLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${jakarta.variable} baseline-scope min-h-screen bg-teal-50/40 font-[family-name:var(--font-baseline)] text-slate-900`}
    >
      {children}
    </div>
  );
}
