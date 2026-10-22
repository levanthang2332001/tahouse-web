"use client";

import React, { createContext, useContext } from "react";
import { FALLBACK_STORE_INFO, type StoreInfo } from "@/lib/store-info";

const StoreInfoContext = createContext<StoreInfo>(FALLBACK_STORE_INFO);

/** Provided by the root layout with the values from `GET /settings`. */
export function StoreInfoProvider({ value, children }: { value: StoreInfo; children: React.ReactNode }) {
  return <StoreInfoContext.Provider value={value}>{children}</StoreInfoContext.Provider>;
}

export function useStoreInfo(): StoreInfo {
  return useContext(StoreInfoContext);
}
