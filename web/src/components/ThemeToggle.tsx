"use client";

import { useEffect, useSyncExternalStore } from "react";
import { applyTheme, readThemePref, THEME_EVENT, THEME_KEY, type ThemePref } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

const OPTIONS: { value: ThemePref; label: string; icon: React.ReactNode }[] = [
  {
    value: "system",
    label: "Ikuti sistem",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <rect x="1.5" y="2.5" width="13" height="9" rx="1" />
        <path d="M5.5 14h5M8 11.5V14" />
      </svg>
    ),
  },
  {
    value: "light",
    label: "Terang",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="8" cy="8" r="3" />
        <path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Gelap",
    icon: (
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7Z" />
      </svg>
    ),
  },
];

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => e.key === THEME_KEY && cb();
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function ThemeToggle() {
  const pref = useSyncExternalStore(subscribe, readThemePref, () => "system" as ThemePref);

  // Kalau mengikuti sistem, ikut berubah saat OS ganti mode terang/gelap.
  useEffect(() => {
    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme("system");
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [pref]);

  return (
    <div className={styles.group} role="radiogroup" aria-label="Tema tampilan">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          id={`theme-${opt.value}`}
          type="button"
          role="radio"
          aria-checked={pref === opt.value}
          aria-label={opt.label}
          title={opt.label}
          className={styles.option}
          onClick={() => applyTheme(opt.value)}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
