import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { Header } from "@/components/Header/index";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { FXRatesProvider } from "@/lib/contexts/FXRatesProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Personal Finance App",
  description: "Manage your finances with AI-powered insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FXRatesProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <div className="flex flex-1">
                <main className="flex-1 overflow-y-auto">{children}</main>
                <Toaster />
              </div>
            </div>
          </FXRatesProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
