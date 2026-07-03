import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GoMotarCar Franchise Partner Portal",
  description: "Manage bookings, staff and account performance for franchise partners.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
