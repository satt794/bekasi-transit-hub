"use client";

import { useMemo, useState } from "react";
import { CorridorMap } from "@/components/CorridorMap";
import { DepartureBoard } from "@/components/DepartureBoard";
import { Header } from "@/components/Header";
import { StationSummary } from "@/components/StationSummary";
import { TrainModal } from "@/components/TrainModal";
import { TransjakartaModal } from "@/components/TransjakartaModal";
import { TransjakartaSection } from "@/components/TransjakartaSection";
import { TripPlanner } from "@/components/TripPlanner";
import {
  endpoints,
  type Departure,
  type DeparturesResponse,
  type TransjakartaRoute,
} from "@/lib/api";
import { BEKASI_STATIONS, DEFAULT_STATION, findBekasiStation } from "@/lib/stations";
import { useApi } from "@/hooks/useApi";
import { useNow } from "@/hooks/useNow";
import styles from "./page.module.css";

export default function DashboardPage() {
  const [stationId, setStationId] = useState<string>(DEFAULT_STATION);
  const [expandedDepartures, setExpandedDepartures] = useState(false);
  const [selectedTrain, setSelectedTrain] = useState<Departure | null>(null);
  const [selectedBusRoute, setSelectedBusRoute] = useState<TransjakartaRoute | null>(null);

  const now = useNow();

  // Ambil data keberangkatan stasiun aktif (limit 8 saat compact, 16 saat expanded)
  const limit = expandedDepartures ? 16 : 8;
  const departuresPath = endpoints.departures(stationId, limit);
  const { data, loading, error, refreshing, updatedAt, reload } = useApi<DeparturesResponse>(
    departuresPath,
    15_000, // refresh setiap 15 detik
  );

  const currentStation = useMemo(
    () => data?.station || findBekasiStation(stationId) || BEKASI_STATIONS[1],
    [data?.station, stationId],
  );

  return (
    <div className={styles.wrapper}>
      {/* Top Header */}
      <Header
        source={data?.source || null}
        updatedAt={updatedAt}
        refreshing={refreshing}
        onRefresh={reload}
        now={now}
      />

      {/* Corridor Line Map Selector */}
      <CorridorMap selected={stationId} onSelect={setStationId} />

      {/* Main Content Dashboard */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Station Overview & Stats */}
          <StationSummary
            station={currentStation}
            summary={data?.summary || null}
            loading={loading}
            now={now}
          />

          {/* Real-time Departure Board */}
          <DepartureBoard
            data={data}
            loading={loading}
            error={error}
            now={now}
            expanded={expandedDepartures}
            onToggleExpanded={() => setExpandedDepartures((v) => !v)}
            onSelectTrain={setSelectedTrain}
            onRetry={reload}
          />

          {/* Transjakarta & Feeder Bus Section (All-in-One Multi-Modal Hub) */}
          <TransjakartaSection
            currentStation={currentStation}
            onSelectRoute={setSelectedBusRoute}
          />

          {/* Trip Planner */}
          <TripPlanner
            currentStationId={stationId}
            now={now}
            onSelectTrain={setSelectedTrain}
          />
        </div>
      </main>

      {/* Train Detail Modal */}
      {selectedTrain && (
        <TrainModal
          train={selectedTrain}
          now={now}
          onClose={() => setSelectedTrain(null)}
        />
      )}

      {/* Transjakarta Route Detail Modal */}
      {selectedBusRoute && (
        <TransjakartaModal
          route={selectedBusRoute}
          onClose={() => setSelectedBusRoute(null)}
        />
      )}

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerCol}>
            <span className={styles.footerBrand}>Bekasi Transit Hub</span>
            <p className={styles.footerDesc}>
              Platform transportasi terpadu (All-in-One) koridor Bekasi: pemantauan real-time KRL Commuter
              Line Cikarang terintegrasi langsung dengan jaringan bus Transjakarta & Trans Patriot.
            </p>
          </div>

          <div className={styles.footerColLinks}>
            <div className={styles.linkGroup}>
              <span className={styles.linkGroupTitle}>API & Integrasi</span>
              <a
                href="/api/transjakarta/routes"
                target="_blank"
                rel="noreferrer"
                className={styles.footerLink}
              >
                Rute Transjakarta (/api/transjakarta/routes)
              </a>
              <a
                href={`/api/stations/${stationId}/transjakarta`}
                target="_blank"
                rel="noreferrer"
                className={styles.footerLink}
              >
                Halte Transit Stasiun (/api/stations/.../transjakarta)
              </a>
              <a
                href="/api/health"
                target="_blank"
                rel="noreferrer"
                className={styles.footerLink}
              >
                Health Check (/api/health)
              </a>
              <a
                href="http://localhost:8000/docs"
                target="_blank"
                rel="noreferrer"
                className={styles.footerLink}
              >
                FastAPI Swagger Docs
              </a>
            </div>

            <div className={styles.linkGroup}>
              <span className={styles.linkGroupTitle}>Penyedia Layanan</span>
              <span className={styles.footerText}>KAI Commuter (commuterline.id)</span>
              <span className={styles.footerText}>PT Transportasi Jakarta (Transjakarta)</span>
              <span className={styles.footerText}>Trans Patriot (Dishub Kota Bekasi)</span>
              <span className={styles.footerText}>Fallback snapshot offline di disk</span>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© 2026 Bekasi Transit Hub · Platform Antarmoda KRL & Transjakarta untuk Warga Bekasi.</p>
        </div>
      </footer>
    </div>
  );
}
