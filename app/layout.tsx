import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discord",
  description: "A dark-themed Discord UI clone built with Next.js and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-d-chat text-d-text">{children}</body>
    </html>
  );
}
