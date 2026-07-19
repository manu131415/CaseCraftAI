import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "./providers/LanguageProvider";
import './legal_section.css';

export const metadata: Metadata = {
  title: "CaseCraftAI",
  description: "Streamline case registration and investigation workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
