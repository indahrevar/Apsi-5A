import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Dapur Abita",
  description: "Masuk ke sistem Dapur Abita.",
=======
  title: "Dapur Abita | Brownies & Kue",
  description: "Pesan kue dan kelola pesanan Dapur Abita.",
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
<<<<<<< HEAD
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
=======
    <html lang="id" className={`${plusJakartaSans.variable} h-full antialiased`}>
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
