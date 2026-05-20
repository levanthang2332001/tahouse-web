"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Load wishlist, recentlyViewed, and theme from LocalStorage on mount
  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("kassler_wishlist");
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedRecent = localStorage.getItem("kassler_recent");
      if (savedRecent) setRecentlyViewed(JSON.parse(savedRecent));

      const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        document.documentElement.classList.add("dark");
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("theme", next);
      if (next === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  };

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem("kassler_wishlist", JSON.stringify(updated));
      return updated;
    });
  };

  const addToCompare = (product: Product): boolean => {
    if (compareList.some((p) => p.id === product.id)) {
      return false; // Already in compare list
    }
    if (compareList.length >= 3) {
      return false; // Capped at 3 products
    }
    setCompareList((prev) => [...prev, product]);
    return true;
  };

  const removeFromCompare = (id: string) => {
    setCompareList((prev) => prev.filter((p) => p.id !== id));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const addToRecentlyViewed = (id: string) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((item) => item !== id);
      const updated = [id, ...filtered].slice(0, 5); // Cap at 5 products
      localStorage.setItem("kassler_recent", JSON.stringify(updated));
      return updated;
    });
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  };

  const toggleTechnologyFilter = (tech: string) => {
    setFilters((prev) => {
      const technologies = prev.technologies.includes(tech)
        ? prev.technologies.filter((t) => t !== tech)
        : [...prev.technologies, tech];
      return { ...prev, technologies };
    });
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchQuery("");
  };

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
