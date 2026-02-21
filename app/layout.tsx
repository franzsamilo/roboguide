import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import TechGrid from "@/components/ui/TechGrid";

export const metadata: Metadata = {
  title: "ROBOGUIDE | The Living Blueprint",
  description: "A scalable, hardware-agnostic IoT knowledge repository for the modern maker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <TechGrid />
          <div className="relative min-h-screen">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
