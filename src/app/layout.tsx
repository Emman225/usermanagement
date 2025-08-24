import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "User Management",
  description: "Application de Gestion des utilisateurs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
