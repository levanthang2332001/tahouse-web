"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/data/products";

interface FilterState {
  category: string;
  priceRange: string;
  color: string;
  technologies: string[];
}

interface AppContextType {
  wishlist: string[];
  compareList: Product[];
  recentlyViewed: string[];
  searchQuery: string;
  filters: FilterState;
  isChatbotOpen: boolean;
  chatbotProductContext: Product | null;
  theme: "dark" | "light";
  toggleTheme: () => void;
  toggleWishlist: (id: string) => void;
  addToCompare: (product: Product) => boolean; // returns true if added, false if full or already exists
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  addToRecentlyViewed: (id: string) => void;
  setSearchQuery: (query: string) => void;
  updateFilters: (updates: Partial<FilterState>) => void;
  toggleTechnologyFilter: (tech: string) => void;
  clearFilters: () => void;
  setIsChatbotOpen: (isOpen: boolean) => void;
  setChatbotProductContext: (product: Product | null) => void;
}

const defaultFilters: FilterState = {
  category: "all",
  priceRange: "all",
  color: "all",
  technologies: [],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [compareList, setCompareList] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatbotProductContext, setChatbotProductContext] = useState<Product | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("light");

  // Load wishlist, recentlyViewed, and theme from LocalStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("tahouse_wishlist");
      const savedRecent = localStorage.getItem("tahouse_recent");

      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
      if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));

      // Permanently force light theme and clear any dark mode configurations
      setTheme("light");
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Theme is permanently light to preserve unified brand aesthetics
    localStorage.setItem("theme", "light");
    document.documentElement.classList.remove("dark");
  }, []);

  const toggleWishlist = useCallback((id: string) => {
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("tahouse_wishlist", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addToCompare = useCallback((product: Product): boolean => {
    if (compareList.some((p) => p.id === product.id)) {
      return false; // Already in compare list
    }
    if (compareList.length >= 3) {
      return false; // Capped at 3 products
    }
    setCompareList((prev) => [...prev, product]);
    return true;
  }, [compareList]);

  const removeFromCompare = useCallback((id: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearCompare = useCallback(() => {
    setCompareList([]);
  }, []);

  const addToRecentlyViewed = useCallback((id: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 5); // Cap at 5 products
      localStorage.setItem("tahouse_recent", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const toggleTechnologyFilter = useCallback((tech: string) => {
    setFilters((prev) => {
      const technologies = prev.technologies.includes(tech)
        ? prev.technologies.filter((t) => t !== tech)
        : [...prev.technologies, tech];
      return { ...prev, technologies };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(defaultFilters);
    setSearchQuery("");
  }, []);

  return (
    <AppContext.Provider
      value={{
        wishlist,
        compareList,
        recentlyViewed,
        searchQuery,
        filters,
        isChatbotOpen,
        chatbotProductContext,
        theme,
        toggleTheme,
        toggleWishlist,
        addToCompare,
        removeFromCompare,
        clearCompare,
        addToRecentlyViewed,
        setSearchQuery,
        updateFilters,
        toggleTechnologyFilter,
        clearFilters,
        setIsChatbotOpen,
        setChatbotProductContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
