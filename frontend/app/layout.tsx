import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header, Sidebar, NotificationCenter } from "@/components/layouts";

export const metadata: Metadata = {
  title: "EnarcExchange - Prediction Markets",
  description: "A modern prediction market platform powered by LMSR",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="text-primary antialiased">
        <Providers>
          <Header />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 min-h-[calc(100vh-4rem)]">
              {children}
            </main>
          </div>
          <NotificationCenter />
        </Providers>
      </body>
    </html>
  );
}
