import type { Metadata, Viewport } from "next";
import { TelegramProvider } from "@/components/providers/TelegramProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Знакомства",
  description: "Telegram Mini App для знакомств",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" />
      </head>
      <body className="bg-tg-bg text-tg-text">
        <TelegramProvider>
          <div className="h-full flex flex-col">{children}</div>
        </TelegramProvider>
      </body>
    </html>
  );
}
