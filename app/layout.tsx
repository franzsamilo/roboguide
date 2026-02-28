import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";
import TechGrid from "@/components/ui/TechGrid";

export const metadata: Metadata = {
  title: "ROBOGUIDE | The Living Blueprint",
  description: "A scalable, hardware-agnostic IoT knowledge repository for the modern maker. Browse pinouts, datasheets, and hyperlocal guides for Arduino, ESP32, sensors, and more.",
  keywords: ["IoT", "Arduino", "ESP32", "electronics", "robotics", "pinout", "datasheet", "maker"],
  openGraph: {
    title: "ROBOGUIDE | The Living Blueprint",
    description: "A high-fidelity IoT knowledge repository bridging the gap between raw hardware data and hyperlocal regional context.",
    type: "website",
  },
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
          <ToastProvider>
            <ConfirmProvider>
              <TechGrid />
              <div className="relative min-h-screen">
                {children}
              </div>
            </ConfirmProvider>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
