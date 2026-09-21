import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { Metadata, Viewport } from 'next';
import { SettingProvider } from '@/context/SettingContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { PreloaderProvider } from '@/context/PreloaderContext';
import { WalletProvider } from '@/context/WalletContext';
import { PwaProvider } from '@/context/PwaContext';
import PwaRegister from '@/components/PwaRegister';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard | Feel Safe Private Limited",
  description: "Feel Safe Private Limited Description",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Feel Safe",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/images/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#dd55a0" },
    { media: "(prefers-color-scheme: dark)", color: "#101828" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <PwaProvider>
          <ThemeProvider>
            <PreloaderProvider>
              <AuthProvider>
                <SettingProvider>
                  <WalletProvider>
                    <NotificationProvider>
                      <SidebarProvider>{children}</SidebarProvider>
                    </NotificationProvider>
                  </WalletProvider>
                </SettingProvider>
              </AuthProvider>
            </PreloaderProvider>
          </ThemeProvider>
        </PwaProvider>
        <PwaRegister />
      </body>
    </html>
  );
}
