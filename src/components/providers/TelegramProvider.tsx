"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Profile } from "@/types/app";

interface TelegramContextType {
  user: Profile | null;
  isLoading: boolean;
  isReady: boolean;
  webApp: WebApp | null;
}

interface WebApp {
  initData: string;
  initDataUnsafe: Record<string, unknown>;
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
    setText: (text: string) => void;
    enable: () => void;
    disable: () => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (cb: () => void) => void;
    offClick: (cb: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: WebApp;
    };
  }
}

const TelegramContext = createContext<TelegramContextType>({
  user: null,
  isLoading: true,
  isReady: false,
  webApp: null,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

export function TelegramProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [webApp, setWebApp] = useState<WebApp | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) {
      // Dev mode: no Telegram context
      setIsLoading(false);
      return;
    }

    setWebApp(tg);
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();

    // Apply theme
    const root = document.documentElement;
    const tp = tg.themeParams;
    if (tp) {
      Object.entries(tp).forEach(([key, value]) => {
        root.style.setProperty(
          `--tg-theme-${key.replace(/_/g, "-")}`,
          value
        );
      });
    }

    // Authenticate
    const initData = tg.initData;
    if (initData) {
      fetch("/api/auth/telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initData }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setUser(data.user);
            setIsReady(true);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  return (
    <TelegramContext.Provider value={{ user, isLoading, isReady, webApp }}>
      {children}
    </TelegramContext.Provider>
  );
}
