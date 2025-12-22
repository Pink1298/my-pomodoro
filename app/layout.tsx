import type { Metadata } from "next";
import { Inter, Lora, JetBrains_Mono } from "next/font/google"; // Import standard variable fonts
import "./globals.css";
import AppShell from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeApplier } from "@/components/theme-applier";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const lora = Lora({ subsets: ["latin"], variable: "--font-serif" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: {
    default: "Pomodoro Focus | Productive Flow",
    template: "%s | Pomodoro Focus"
  },
  description: "A calm and aesthetic productivity timer with task management and cloud sync. Stay focused and achieve more.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${inter.variable} ${lora.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeApplier />
          <AppShell>{children}</AppShell>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
