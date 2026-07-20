import type { Metadata } from "next";
import { DM_Sans, Source_Serif_4 } from "next/font/google";
import { AppHeader } from "@/components/layout/AppHeader";
import { QueryProvider } from "@/components/providers/QueryProvider";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JurisSync",
  description: "Dashboard de jurimetria e processos judiciais",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${dmSans.variable} ${sourceSerif.variable} antialiased`}>
        <QueryProvider>
          <AppHeader />
          <div className="pt-[7.25rem]">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
