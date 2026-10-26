"use client";

import { useMemo } from "react";
import { BEKASI_STATIONS } from "@/lib/stations";
import styles from "./CorridorMap.module.css";

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

/**
 * Diagram jalur KRL Cikarang ruas Bekasi dengan animasi seluncur kereta (train glider)
 * interaktif yang bergerak secara dinamis ke stasiun yang dipilih.
 */
export function CorridorMap({ selected, onSelect }: Props) {
  // Hitung posisi persentase stasiun yang aktif (0 sampai 6)
  const selectedIndex = useMemo(() => {
    const idx = BEKASI_STATIONS.findIndex((s) => s.id === selected);
    return idx >= 0 ? idx : 1; // default Bekasi (idx 1)
  }, [selected]);

  // Persentase posisi horizontal kereta di jalur track
  // Ada 7 stasiun, lebar per stop = 100% / 7
  const gliderLeftPct = useMemo(() => {
    return ((selectedIndex + 0.5) / BEKASI_STATIONS.length) * 100;
  }, [selectedIndex]);

  return (
    <nav className={styles.wrap} aria-label="Pilih stasiun">
      <div className={styles.glowLine} aria-hidden="true" />
      <div className={styles.scroller}>
        <div className={styles.map}>
          {/* Cap Barat: Arah Jakarta */}
          <div className={styles.endcap} aria-hidden="true">
            <span className={styles.endArrow}>←</span>
            <span>
              <span className={styles.endTitle}>Arah Jakarta</span>
              <span className={styles.endSub}>Cakung · Jatinegara · Manggarai</span>
            </span>
          </div>

          {/* Jalur Utama & Stasiun */}
          <div className={styles.trackArea}>
            {/* Rel Utama & Rel Glow */}
            <div className={styles.railTrack} />
            <div className={styles.railTrackGlow} />

            {/* Kereta Animasi yang Bergerak ke Stasiun Terpilih */}
            <div
              className={styles.trainGlider}
              style={{ left: `${gliderLeftPct}%` }}
              aria-hidden="true"
            >
              <div className={styles.trainBody}>
                <span className={styles.trainHeadlight} />
                <span className={styles.trainIcon}>🚆</span>
              </div>
              <div className={styles.trainPing} />
            </div>

            <ol className={styles.track}>
              {BEKASI_STATIONS.map((s, i) => {
                const active = s.id === selected;
                const regionStart = i === 0 || BEKASI_STATIONS[i - 1].region !== s.region;
                return (
                  <li
                    key={s.id}
                    className={styles.stop}
                    data-region-start={regionStart || undefined}
                  >
                    {regionStart && <span className={styles.region}>{s.region}</span>}
                    <button
                      id={`station-${s.id.toLowerCase()}`}
                      type="button"
                      className={styles.button}
                      aria-pressed={active}
                      aria-label={`${s.name} (${s.id})`}
                      onClick={() => onSelect(s.id)}
                    >
                      <span className={`${styles.code} mono`}>{s.id}</span>
                      
                      {/* Node Titik Stasiun */}
                      <div className={styles.dotContainer}>
                        <span className={styles.dot} />
                        {active && <span className={styles.dotRing} />}
                      </div>

                      <span className={styles.name}>{s.name}</span>

                      {active && (
                        <span className={styles.activeBadge}>
                          Aktif
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </nav>
  );
}
