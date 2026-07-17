"use client";

import { useEffect, useSyncExternalStore } from "react";
import type { AlurData } from "@/lib/types";
import type { StorageStatus } from "@/lib/storage";
import {
  getServerSnapshot,
  getSnapshot,
  hydrate,
  subscribe,
  update,
} from "@/lib/flow-store";

export interface UseFlows {
  data: AlurData;
  isLoaded: boolean;
  storageStatus: StorageStatus;
  update: (fn: (data: AlurData) => AlurData) => void;
}

export function useFlows(): UseFlows {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Membaca localStorage adalah sinkronisasi dengan sistem eksternal; store yang
  // memberi tahu React lewat listener-nya, bukan setState langsung di sini.
  useEffect(() => {
    hydrate();
  }, []);

  return { ...state, update };
}
