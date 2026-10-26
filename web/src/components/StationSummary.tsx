"use client";

import { useState } from "react";
import type { Station, StationSummary as StationSummaryData } from "@/lib/api";
import { formatClock, hourInWIB } from "@/lib/time";
import styles from "./StationSummary.module.css";

interface Props {
  station: Station;
  summary: StationSummaryData | null;
  loading: boolean;
  now: number | null;
}

export function StationSummary({ station, summary, loading, now }: Props) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  if (loading && !summary) {
    return (
      <section className={styles.section} aria-label="Statistik stasiun">
        <div className={styles.cards}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <span className="skeleton" style={{ width: "40%", height: 14 }} />
              <span className="skeleton" style={{ width: "70%", height: 32, marginTop: 10 }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!summary) return null;

  const currentHour = now !== null ? hourInWIB(now) : null;
  const maxCount = Math.max(...(summary.per_hour.map((h) => h.count) || [1]), 1);

  return (
    <section className={styles.section} aria-labelledby="summary-title">
      {/* Top Banner Stasiun Aktif */}
      <div className={styles.heroBanner}>
        <div className={styles.heroLeft}>
          <div className={styles.heroBadgeRow}>
            <span className={styles.heroBadge}>Stasiun Aktif</span>
            <span className={styles.regionTag}>{station.region || "Wilayah Bekasi"}</span>
            <span className={styles.liveTag}>
              <span className={styles.pulseDot} /> Real-Time
            </span>
          </div>

          <h2 id="summary-title" className={styles.stationName}>
            Stasiun {station.name}{" "}
            <span className={`${styles.stationCode} mono`}>({station.id})</span>
          </h2>
          <p className={styles.heroDesc}>
            Lintasan utama Commuter Line Cikarang — Penghubung komuter Bekasi & Jabodetabek
          </p>
          {station.platform_guide && (
            <div className={styles.platformGuideBox}>
              <span className={styles.platformGuideIcon}>🚊</span>
              <div className={styles.platformGuideText}>
                <span className={styles.platformGuideLabel}>Panduan Peron Stasiun:</span>
                <span className={styles.platformGuideContent}>{station.platform_guide}</span>
              </div>
            </div>
          )}
        </div>

        {summary.first_departure && summary.last_departure && (
          <div className={styles.operatingHours}>
            <span className={styles.opLabel}>Jam Layanan Hari Ini</span>
            <div className={styles.opTimeBox}>
              <span className="mono">
                {formatClock(summary.first_departure)}
              </span>
              <span className={styles.opDivider}>➔</span>
              <span className="mono">
                {formatClock(summary.last_departure)} WIB
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Cards Metrik Interaktif */}
      <div className={styles.cards}>
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Total Jadwal Hari Ini</span>
            <span className={styles.cardIcon}>📊</span>
          </div>
          <div className={styles.cardValue}>
            <span className="mono">{summary.total_trips}</span>
            <span className={styles.cardUnit}>perjalanan</span>
          </div>
          <span className={styles.cardDesc}>Arah Jakarta & Cikarang</span>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Kereta 60 Mnt ke Depan</span>
            <span className={styles.cardIcon}>⚡</span>
          </div>
          <div className={styles.cardValue}>
            <span className="mono">{summary.trips_next_hour}</span>
            <span className={styles.cardUnit}>kereta</span>
          </div>
          <span className={styles.cardDesc}>Frekuensi keberangkatan</span>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Rata-Rata Selang (Headway)</span>
            <span className={styles.cardIcon}>⏱️</span>
          </div>
          <div className={styles.cardValue}>
            <span className="mono">
              {summary.avg_headway_min !== null ? summary.avg_headway_min : "—"}
            </span>
            <span className={styles.cardUnit}>menit</span>
          </div>
          <span className={styles.cardDesc}>Jeda waktu antar kereta</span>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.cardLabel}>Jadwal Awal & Akhir</span>
            <span className={styles.cardIcon}>🌅</span>
          </div>
          <div className={styles.cardValueSmall}>
            <div className={styles.timeItem}>
              <span className={styles.timeTag}>Perdana:</span>
              <span className="mono">
                {summary.first_departure ? formatClock(summary.first_departure) : "—"}
              </span>
            </div>
            <div className={styles.timeItem}>
              <span className={styles.timeTag}>Terakhir:</span>
              <span className="mono">
                {summary.last_departure ? formatClock(summary.last_departure) : "—"}
              </span>
            </div>
          </div>
          <span className={styles.cardDesc}>WIB (Asia/Jakarta)</span>
        </div>
      </div>

      {/* Hourly Density Distribution Chart */}
      {summary.per_hour && summary.per_hour.length > 0 && (
        <div className={styles.chartBox}>
          <div className={styles.chartHeader}>
            <div>
              <span className={styles.chartTitle}>Distribusi Frekuensi Kereta Tiap Jam (WIB)</span>
              <p className={styles.chartSub}>
                Sorot batang grafik untuk melihat kepadatan perjalanan KA pada jam tersebut
              </p>
            </div>
            <div className={styles.chartLegend}>
              <span className={styles.legendItem}>
                <span className={styles.legendDotCurrent} /> Jam Aktif Saat Ini
              </span>
              <span className={styles.legendItem}>
                <span className={styles.legendDotPeak} /> Jam Sibuk (≥20 KA/jam)
              </span>
            </div>
          </div>

          <div className={styles.chartBars} role="img" aria-label="Grafik frekuensi kereta per jam">
            {summary.per_hour.map((b) => {
              const isCurrent = currentHour === b.hour;
              const isPeak = b.count >= 20;
              const isHovered = hoveredHour === b.hour;
              const heightPct = Math.round((b.count / maxCount) * 100);
              const labelHour = String(b.hour).padStart(2, "0");

              return (
                <div
                  key={b.hour}
                  className={styles.barCol}
                  data-current={isCurrent || undefined}
                  data-peak={isPeak || undefined}
                  data-hovered={isHovered || undefined}
                  onMouseEnter={() => setHoveredHour(b.hour)}
                  onMouseLeave={() => setHoveredHour(null)}
                  title={`Pukul ${labelHour}:00: ${b.count} perjalanan`}
                >
                  {/* Floating tooltip saat di-hover */}
                  {isHovered && (
                    <div className={styles.barTooltip}>
                      <span className="mono">{b.count} KA</span>
                      <span className={styles.tooltipSub}>pk {labelHour}:00</span>
                    </div>
                  )}

                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ height: `${Math.max(heightPct, 8)}%` }}
                    />
                  </div>
                  <span className={`${styles.barValue} mono`}>{b.count}</span>
                  <span className={`${styles.barLabel} mono`}>{labelHour}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
