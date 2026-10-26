"use client";

import { useEffect } from "react";
import type { TransjakartaRoute } from "@/lib/api";
import styles from "./TransjakartaModal.module.css";

interface Props {
  route: TransjakartaRoute;
  onClose: () => void;
}

export function TransjakartaModal({ route, onClose }: Props) {
  // Tutup dengan Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const isTransPatriot = route.service_type === "Trans Patriot";
  const isRoyal = route.service_type === "Royaltrans";

  const formattedFare = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(route.fare);

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <div
              className={styles.routePill}
              style={{
                background: isTransPatriot ? "#dc2626" : isRoyal ? "#7c3aed" : "#0284c7",
              }}
            >
              <span className="mono">{route.route_id}</span>
            </div>
            <div>
              <div className={styles.typeBadgeRow}>
                <span className={styles.serviceTypeTag}>{route.service_type}</span>
                <span className={styles.corridorTag}>{route.corridor}</span>
              </div>
              <h2 className={styles.routeName}>{route.name}</h2>
            </div>
          </div>
          <button
            id="btn-close-bus-modal"
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Tutup jendela rute bus"
          >
            ✕
          </button>
        </div>

        {/* Stats Strip */}
        <div className={styles.statsStrip}>
          <div className={styles.statCol}>
            <span className={styles.statLabel}>Tarif Perjalanan</span>
            <span className={`${styles.statVal} mono`}>{formattedFare}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCol}>
            <span className={styles.statLabel}>Jam Operasional</span>
            <span className={`${styles.statVal} mono`}>{route.operational_hours}</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCol}>
            <span className={styles.statLabel}>Interval Bus (Headway)</span>
            <span className={`${styles.statVal} mono`}>±{route.headway_min} menit</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.statCol}>
            <span className={styles.statLabel}>Total Pemberhentian</span>
            <span className={`${styles.statVal} mono`}>{route.stops.length} titik</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className={styles.body}>
          {/* Deskripsi */}
          <div className={styles.descBox}>
            <span className={styles.descIcon}>📌</span>
            <p className={styles.descText}>{route.description}</p>
          </div>

          {/* Stasiun KRL Interchange */}
          {route.connecting_stations && route.connecting_stations.length > 0 && (
            <div className={styles.interchangeNotice}>
              <span className={styles.trainIcon}>🚆</span>
              <div className={styles.interchangeContent}>
                <strong className={styles.interchangeTitle}>Integrasi Stasiun KRL Terhubung:</strong>
                <div className={styles.interchangeList}>
                  {route.connecting_stations.map((stId) => (
                    <span key={stId} className={styles.interchangeChip}>
                      Stasiun {stId}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Timeline Pemberhentian */}
          <div className={styles.stopsSection}>
            <h3 className={styles.stopsHeading}>
              Daftar Pemberhentian & Halte Utama ({route.stops.length})
            </h3>
            <div className={styles.timeline}>
              {route.stops.map((stop, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === route.stops.length - 1;
                const isStation = stop.toLowerCase().includes("stasiun");

                return (
                  <div key={idx} className={styles.timelineRow}>
                    <div className={styles.timelineCol}>
                      <span
                        className={`${styles.dot} ${isFirst ? styles.dotFirst : ""} ${
                          isLast ? styles.dotLast : ""
                        } ${isStation ? styles.dotStation : ""}`}
                      />
                      {!isLast && <span className={styles.line} />}
                    </div>
                    <div className={styles.stopInfo}>
                      <span className={styles.stopIndex}>{idx + 1}</span>
                      <span className={`${styles.stopName} ${isStation ? styles.stationHighlight : ""}`}>
                        {stop}
                      </span>
                      {isFirst && <span className={styles.originTag}>Titik Awal</span>}
                      {isLast && <span className={styles.destTag}>Tujuan Akhir</span>}
                      {isStation && !isFirst && !isLast && (
                        <span className={styles.krlLinkTag}>Transit KRL</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerHint}>
            💡 Pembayaran menggunakan Kartu Uang Elektronik (e-money, Flazz, TapCash, Brizzi) atau QRIS
            JakLingko
          </span>
          <button type="button" className={styles.actionBtn} onClick={onClose}>
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
