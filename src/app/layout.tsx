import type { Metadata } from "next";
import { Manrope, Orbitron, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/providers/ThemeProvider";
import DashboardNavbar from "@/components/navbar/DashboardNavbar";
import MobileNavbar from "@/components/navbar/MobileNavbar";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { CapacitorProvider } from "@/lib/providers/CapacitorProvider";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const orbitron = Orbitron({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hissa",
  description: "Track shared expenses with elegance",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={[
          manrope.variable,
          orbitron.variable,
          instrumentSerif.variable,
          "min-h-screen bg-background text-foreground font-sans antialiased",
        ].join(" ")}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange>
          <QueryProvider>
            <CapacitorProvider>
              <div className="relative min-h-screen pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.06),transparent_35%)]" />
                <div className="relative font-sans">
                  {children}
                </div>
                <MobileNavbar />
              </div>
            </CapacitorProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
