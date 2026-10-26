"use client";

import { useState } from "react";
import { endpoints, type Departure, type StationsResponse, type TripsResponse } from "@/lib/api";
import { BEKASI_STATIONS, POPULAR_DESTINATIONS } from "@/lib/stations";
import { countdownLabel, formatClock, formatDuration } from "@/lib/time";
import { useApi } from "@/hooks/useApi";
import styles from "./TripPlanner.module.css";

interface Props {
  currentStationId: string;
  now: number | null;
  onSelectTrain: (dep: Departure) => void;
}

export function TripPlanner({ currentStationId, now, onSelectTrain }: Props) {
  const [origin, setOrigin] = useState(currentStationId);
  const [destination, setDestination] = useState<string>("MRI"); // default Manggarai
  const [swapRotating, setSwapRotating] = useState(false);

  // Sinkronisasi origin kalau stasiun aktif di dashboard berganti
  if (currentStationId !== origin && BEKASI_STATIONS.some((s) => s.id === currentStationId)) {
    if (currentStationId === destination) {
      setDestination(currentStationId === "MRI" ? "BKS" : "MRI");
    }
  }

  // Load daftar semua stasiun untuk dropdown
  const { data: stationsData } = useApi<StationsResponse>(endpoints.stations());
  const allStations = stationsData?.all || [];

  // Query trips saat origin != destination
  const validQuery = origin && destination && origin !== destination;
  const tripsPath = validQuery ? endpoints.trips(origin, destination, 8) : null;
  const { data, loading, error, reload } = useApi<TripsResponse>(tripsPath, 30_000);

  const handleSwap = () => {
    setSwapRotating(true);
    setTimeout(() => setSwapRotating(false), 400);
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  return (
    <section className={styles.section} aria-labelledby="trip-title">
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.headBadge}>
            <span className={styles.compassIcon}>🧭</span>
            Perencana Rute Langsung
          </div>
          <h2 id="trip-title" className={styles.title}>
            Cari Jadwal Perjalanan Tanpa Transit
          </h2>
          <p className={styles.subtitle}>
            Estimasi waktu tempuh presisi, jadwal keberangkatan, dan hitung mundur KA langsung
          </p>
        </div>
      </div>

      {/* Selector Controls Bar */}
      <div className={styles.filterBar}>
        {/* Origin Selector */}
        <div className={styles.field}>
          <label htmlFor="origin-select" className={styles.label}>
            <span className={styles.originDot} /> Dari (Stasiun Asal)
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="origin-select"
              className={styles.select}
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
            >
              <optgroup label="Stasiun Koridor Bekasi">
                {BEKASI_STATIONS.map((s) => (
                  <option key={`orig-${s.id}`} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </optgroup>
              {allStations.length > 0 && (
                <optgroup label="Stasiun Lainnya">
                  {allStations
                    .filter((s) => !BEKASI_STATIONS.some((b) => b.id === s.id))
                    .map((s) => (
                      <option key={`orig-${s.id}`} value={s.id}>
                        {s.name} ({s.id})
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>
        </div>

        {/* Animated Swap Button */}
        <button
          id="btn-swap-stations"
          type="button"
          className={`${styles.swapBtn} ${swapRotating ? styles.swapSpin : ""}`}
          onClick={handleSwap}
          title="Tukar stasiun asal dan tujuan"
          aria-label="Tukar stasiun"
        >
          ⇄
        </button>

        {/* Destination Selector */}
        <div className={styles.field}>
          <label htmlFor="dest-select" className={styles.label}>
            <span className={styles.destDot} /> Ke (Stasiun Tujuan)
          </label>
          <div className={styles.selectWrapper}>
            <select
              id="dest-select"
              className={styles.select}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            >
              <optgroup label="Tujuan Populer">
                {POPULAR_DESTINATIONS.map((id) => {
                  const s = allStations.find((item) => item.id === id);
                  return (
                    <option key={`pop-${id}`} value={id}>
                      {s ? s.name : id} ({id})
                    </option>
                  );
                })}
              </optgroup>
              <optgroup label="Semua Stasiun">
                {allStations.map((s) => (
                  <option key={`dest-${s.id}`} value={s.id}>
                    {s.name} ({s.id})
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Pills for popular destinations */}
      <div className={styles.quickPills} aria-label="Tujuan cepat">
        <span className={styles.pillsLabel}>Pilihan Cepat:</span>
        {POPULAR_DESTINATIONS.slice(0, 7).map((id) => {
          const s = allStations.find((item) => item.id === id);
          const name = s ? s.name : id;
          const active = destination === id;
          return (
            <button
              key={`pill-${id}`}
              id={`pill-dest-${id.toLowerCase()}`}
              type="button"
              className={styles.pill}
              data-active={active || undefined}
              onClick={() => setDestination(id)}
            >
              {name}
            </button>
          );
        })}
      </div>

      {/* Results Container */}
      <div className={styles.resultBox}>
        {origin === destination ? (
          <div className={styles.emptyBox}>
            <p className={styles.emptyMsg}>⚠️ Stasiun asal dan tujuan tidak boleh sama.</p>
          </div>
        ) : loading && !data ? (
          <div className={styles.loadingBox}>
            <span className="skeleton" style={{ width: "100%", height: 56, marginBottom: 10 }} />
            <span className="skeleton" style={{ width: "100%", height: 56, marginBottom: 10 }} />
            <span className="skeleton" style={{ width: "100%", height: 56 }} />
          </div>
        ) : error ? (
          <div className={styles.errorBox}>
            <p className={styles.errorText}>
              Tidak ditemukan jadwal kereta langsung untuk rute ini atau rute memerlukan transit.
            </p>
            <button type="button" className={styles.retryBtn} onClick={reload}>
              Coba Lagi
            </button>
          </div>
        ) : !data || data.trips.length === 0 ? (
          <div className={styles.emptyBox}>
            <span className={styles.emptyIcon}>🚉</span>
            <p className={styles.emptyTitle}>Tidak ada kereta langsung tanpa transit saat ini.</p>
            <p className={styles.emptyDesc}>
              Untuk menuju stasiun tersebut, Anda disarankan transit di <strong>Stasiun Manggarai</strong> atau <strong>Jatinegara</strong>.
            </p>
          </div>
        ) : (
          <div className={styles.tripsList}>
            <div className={styles.tableHeader}>
              <span>Nomor Kereta</span>
              <span>Berangkat ({data.origin.name})</span>
              <span>Tiba ({data.destination.name})</span>
              <span>Estimasi Durasi</span>
              <span style={{ textAlign: "right" }}>Hitung Mundur</span>
            </div>

            {data.trips.map((trip) => {
              const asDeparture: Departure = {
                train_id: trip.train_id,
                line: trip.line,
                origin_id: data.origin.id,
                origin_name: data.origin.name,
                destination_id: data.destination.id,
                destination_name: trip.destination_name,
                departs_at: trip.departs_at,
                arrives_at: trip.arrives_at,
                direction: "jakarta",
                color: trip.color,
                is_passenger: true,
              };

              return (
                <button
                  key={`${trip.train_id}-${trip.departs_at}`}
                  id={`trip-${trip.train_id}`}
                  type="button"
                  className={styles.tripRow}
                  onClick={() => onSelectTrain(asDeparture)}
                  title={`Klik untuk melihat detail perhentian KA ${trip.train_id}`}
                >
                  <div className={styles.trainInfo}>
                    <span className={styles.colorStrip} style={{ background: trip.color }} />
                    <div className={styles.trainMetaCol}>
                      <span className={`${styles.trainId} mono`}>KA {trip.train_id}</span>
                      <span className={styles.trainLine}>tujuan {trip.destination_name}</span>
                    </div>
                  </div>

                  <div className={`${styles.timeCol} mono`}>
                    <strong>{formatClock(trip.departs_at)}</strong>
                    <span className={styles.tzLabel}>WIB</span>
                  </div>

                  <div className={`${styles.timeCol} mono`}>
                    {trip.arrives_at ? (
                      <>
                        <strong>{formatClock(trip.arrives_at)}</strong>
                        <span className={styles.tzLabel}>WIB</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </div>

                  <div className={styles.durCol}>
                    <span className={styles.durBadge}>
                      ⏱️ {formatDuration(trip.duration_min)}
                    </span>
                  </div>

                  <div className={styles.countdownCol} suppressHydrationWarning>
                    <span className={`${styles.countdownText} mono`}>
                      {now ? countdownLabel(trip.departs_at, now) : "—"}
                    </span>
                    <span className={styles.clickHint}>Rute ➔</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
