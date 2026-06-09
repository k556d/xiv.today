import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "./components/AuthProvider";
import UserMenu from "./components/UserMenu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "xiv.today",
  description: "Track upcoming Final Fantasy XIV community events.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <header className="flex items-center justify-end px-6 py-4 sm:px-10 lg:px-16">
            <UserMenu />
          </header>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
