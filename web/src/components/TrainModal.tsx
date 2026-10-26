"use client";

import { useEffect } from "react";
import { endpoints, type Departure, type TrainRouteResponse } from "@/lib/api";
import { formatClock, relativeAgo } from "@/lib/time";
import { useApi } from "@/hooks/useApi";
import styles from "./TrainModal.module.css";

interface Props {
  train: Departure;
  now: number | null;
  onClose: () => void;
}

export function TrainModal({ train, now, onClose }: Props) {
  const { data, loading, error, reload } = useApi<TrainRouteResponse>(
    endpoints.route(train.train_id),
    15_000,
  );

  // Tutup dengan tombol Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div className={styles.linePill} style={{ background: train.color }}>
              <span className="mono">KA {train.train_id}</span>
            </div>
            <div>
              <h2 className={styles.trainTitle}>{train.line || "Commuter Line"}</h2>
              <p className={styles.trainRoute}>
                Tujuan akhir: <strong>{train.destination_name}</strong>
              </p>
            </div>
          </div>
          <button
            id="btn-close-modal"
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Tutup jendela rute"
          >
            ✕
          </button>
        </div>

        {/* Status bar */}
        <div className={styles.statusBar}>
          <span className={styles.statusLabel}>
            {data?.partial ? "Rute (data stasiun koridor)" : "Pemberhentian lengkap perjalanan"}
          </span>
          {data?.source && now && (
            <span className={styles.sourceTime}>
              Sumber: {data.source.provider} ({relativeAgo(data.source.fetched_at, now)})
            </span>
          )}
        </div>

        {/* Content body */}
        <div className={styles.body}>
          {loading && !data ? (
            <div className={styles.loading}>
              <span className="skeleton" style={{ width: "80%", height: 24, marginBottom: 12 }} />
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={styles.skeletonStop}>
                  <span className="skeleton" style={{ width: 14, height: 14, borderRadius: "50%" }} />
                  <span className="skeleton" style={{ width: "45%", height: 16 }} />
                  <span className="skeleton" style={{ width: 40, height: 16, marginLeft: "auto" }} />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className={styles.errorBox}>
              <p className={styles.errorText}>Gagal mengambil detail rute KA {train.train_id}.</p>
              <button type="button" className={styles.retryBtn} onClick={reload}>
                Coba lagi
              </button>
            </div>
          ) : !data || data.stops.length === 0 ? (
            <p className={styles.emptyText}>Tidak ada data pemberhentian untuk kereta ini.</p>
          ) : (
            <ol className={styles.timeline}>
              {data.stops.map((stop) => {
                const isPassed = stop.status === "passed";
                const isNext = stop.status === "next";
                return (
                  <li
                    key={stop.station_id}
                    className={styles.stopItem}
                    data-status={stop.status}
                    data-bekasi={stop.is_bekasi || undefined}
                  >
                    <div className={styles.markerTrack}>
                      <span className={styles.trackLine} />
                      <span className={styles.markerDot}>
                        {isPassed ? "✓" : isNext ? "●" : ""}
                      </span>
                    </div>

                    <div className={styles.stopInfo}>
                      <div className={styles.stationNameRow}>
                        <span className={styles.stopName}>{stop.station_name}</span>
                        {stop.is_bekasi && <span className={styles.bekasiTag}>Bekasi</span>}
                        {isNext && <span className={styles.nextTag}>Stasiun Terdekat</span>}
                      </div>
                      <span className={`${styles.stationCode} mono`}>{stop.station_id}</span>
                    </div>

                    <div className={`${styles.stopTime} mono`}>
                      {formatClock(stop.departs_at)}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={styles.doneBtn} onClick={onClose}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
