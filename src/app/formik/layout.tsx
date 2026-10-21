import type { ReactNode } from "react";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-formik",
});

/**
 * "One Question at a Time" scope — Typeform/Lemonade: a warm rose/amber gradient,
 * a friendly rounded typeface (Poppins). All Formik styling lives under
 * `.formik-scope`.
 */
export default function FormikLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${poppins.variable} formik-scope min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 font-[family-name:var(--font-formik)] text-rose-950`}
    >
      {children}
    </div>
  );
}
