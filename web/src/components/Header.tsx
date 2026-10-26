"use client";

import type { SourceInfo } from "@/lib/api";
import { formatClockSeconds, formatLongDate, relativeAgo } from "@/lib/time";
import { ThemeToggle } from "./ThemeToggle";
import styles from "./Header.module.css";

interface Props {
  source: SourceInfo | null;
  updatedAt: number | null;
  refreshing: boolean;
  onRefresh: () => void;
  now: number | null;
}

export function Header({ source, updatedAt, refreshing, onRefresh, now }: Props) {
  const isSnapshot = source?.provider === "snapshot" || source?.stale;
  const latency = source?.attempts.find((a) => a.ok)?.latency_ms;

  return (
    <header className={styles.header}>
      {/* Mini Ticker Banner di Atas */}
      <div className={styles.topTicker}>
        <div className={styles.tickerContent}>
          <span className={styles.tickerItem}>
            <span className={styles.livePulse} />
            Hub Antarmoda KRL Cikarang Line + Transjakarta Aktif
          </span>
          <span className={styles.tickerDot}>•</span>
          <span className={styles.tickerItem}>Sinkronisasi Otomatis Tiap 15 Detik</span>
          <span className={styles.tickerDot}>•</span>
          <span className={styles.tickerItem}>Rute BRT B11, B12, B21, B22, Kor. 11 & Trans Patriot</span>
        </div>
      </div>

      <div className={styles.inner}>
        {/* Brand / Logo */}
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            <span className={styles.brandIcon}>🚆</span>
            <span className={styles.brandC}>+</span>
          </div>
          <div>
            <div className={styles.titleRow}>
              <h1 className={styles.brandTitle}>BEKASI TRANSIT HUB</h1>
              <span className={styles.badgeLine}>KRL + Transjakarta</span>
            </div>
            <p className={styles.subtitle}>
              Sistem Informasi Terpadu Multi-Modal: KRL Commuter Line & Jaringan Bus Transjakarta Bekasi
            </p>
          </div>
        </div>

        {/* Center Live Clock (WIB) dengan efek glowing digital */}
        <div className={styles.clockBox} aria-label="Waktu Indonesia Barat">
          <div className={styles.clockHeader}>
            <span className={styles.clockDot} />
            <span className={styles.clockLabel}>WAKTU REAL-TIME (WIB)</span>
          </div>
          <div className={`${styles.clockTime} mono`} suppressHydrationWarning>
            {now ? formatClockSeconds(now) : "—:—:—"}
          </div>
          <div className={styles.clockDate} suppressHydrationWarning>
            {now ? formatLongDate(now) : "Memuat kalender..."}
          </div>
        </div>

        {/* Right Actions: Status Pill, Refresh button, Theme Switcher */}
        <div className={styles.actions}>
          <div className={styles.statusBox}>
            <div
              className={styles.statusPill}
              data-stale={isSnapshot ? "true" : undefined}
              title={isSnapshot ? "Menggunakan database cadangan offline di disk" : "Terhubung langsung ke scraper API"}
            >
              <span className={styles.statusRadar}>
                <span className={styles.radarDot} />
                <span className={styles.radarRing} />
              </span>
              <span className={styles.statusText}>
                {isSnapshot
                  ? "Snapshot Offline"
                  : source
                    ? `Live · ${source.provider}`
                    : "Menghubungkan..."}
              </span>
            </div>
            {updatedAt && now && (
              <span className={styles.updatedAgo}>
                Diperbarui {relativeAgo(updatedAt, now)}
                {latency ? ` (${latency}ms)` : ""}
              </span>
            )}
          </div>

          <div className={styles.controls}>
            <button
              id="btn-refresh"
              type="button"
              className={styles.refreshBtn}
              onClick={onRefresh}
              disabled={refreshing}
              title="Segarkan jadwal KRL sekarang"
              aria-label="Segarkan jadwal KRL sekarang"
            >
              <svg
                viewBox="0 0 16 16"
                className={`${styles.refreshIcon} ${refreshing ? styles.spinning : ""}`}
                aria-hidden="true"
              >
                <path
                  d="M13.65 2.35A8 8 0 1 1 2.35 13.65 8 8 0 0 1 13.65 2.35ZM8 1.5a6.5 6.5 0 0 0-4.6 11.1 6.5 6.5 0 1 0 9.2-9.2A6.47 6.47 0 0 0 8 1.5Z"
                  fill="none"
                />
                <path
                  d="M13.5 1v4.5H9M8 4a5 5 0 1 1-3.54 1.46"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
