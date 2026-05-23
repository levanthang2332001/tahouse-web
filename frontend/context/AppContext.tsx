"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type AppContextValue = {
  isChatbotOpen: boolean;
  recentlyViewed: string[];
  addToRecentlyViewed: (id: string) => void;
  setIsChatbotOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  const addToRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewed((prev) => {
      const next = [id, ...prev.filter((item) => item !== id)].slice(0, 5);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isChatbotOpen,
      recentlyViewed,
      addToRecentlyViewed,
      setIsChatbotOpen,
    }),
    [isChatbotOpen, recentlyViewed],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }

  return context;
}
