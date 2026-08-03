import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import UserMenu from "@/components/UserMenu";
import styles from "./layout.module.css";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${styles.html}`}>
      <body className={styles.body}>
        <header className={styles.header}>
          <UserMenu />
        </header>
        {children}
      </body>
    </html>
  );
}
