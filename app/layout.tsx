import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ROBOGUIDE — Learn IoT the Easy Way",
    template: "%s • ROBOGUIDE",
  },
  description: "Your go-to resource for IoT tutorials, Arduino projects, ESP32 guides, sensor interfacing, and electronics made simple. Quick, easy, and to the point.",
  keywords: ["IoT", "Arduino", "ESP32", "electronics", "robotics", "tutorials", "sensors", "maker"],
  openGraph: {
    title: "ROBOGUIDE — Learn IoT the Easy Way",
    description: "Your go-to resource for IoT tutorials, Arduino projects, ESP32 guides, and electronics made simple.",
    type: "website",
    siteName: "ROBOGUIDE",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "ROBOGUIDE — Learn IoT the Easy Way",
    description: "IoT tutorials, components, and community projects.",
  },
  robots: {
    index: true,
    follow: true,
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
        <SessionProvider>
          <AuthProvider>
            <ToastProvider>
              <ConfirmProvider>
                <div className="relative min-h-screen">
                  {children}
                </div>
              </ConfirmProvider>
            </ToastProvider>
          </AuthProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
