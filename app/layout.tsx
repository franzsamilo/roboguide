import type { Metadata } from "next";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { ConfirmProvider } from "@/components/ui/ConfirmProvider";

export const metadata: Metadata = {
  title: "ROBOGUIDE — Learn IoT the Easy Way",
  description: "Your go-to resource for IoT tutorials, Arduino projects, ESP32 guides, sensor interfacing, and electronics made simple. Quick, easy, and to the point.",
  keywords: ["IoT", "Arduino", "ESP32", "electronics", "robotics", "tutorials", "sensors", "maker"],
  openGraph: {
    title: "ROBOGUIDE — Learn IoT the Easy Way",
    description: "Your go-to resource for IoT tutorials, Arduino projects, ESP32 guides, and electronics made simple.",
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
