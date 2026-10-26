"use client";

import { useSyncExternalStore } from "react";

/**
 * Jam bersama untuk seluruh komponen. Satu interval global (bukan satu per
 * komponen) supaya semua hitung mundur di layar berganti serentak.
 *
 * Mengembalikan `null` saat server render & hydration pertama, sehingga
 * tidak ada mismatch antara waktu server dan waktu browser.
 */

const TICK_MS = 1000;
let now = 0;
let timer: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (timer === null) {
    now = Date.now();
    timer = setInterval(() => {
      now = Date.now();
      listeners.forEach((l) => l());
    }, TICK_MS);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => now || Date.now();
const getServerSnapshot = () => null;

export function useNow(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
