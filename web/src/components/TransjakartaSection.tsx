"use client";

import { useState } from "react";
import {
  endpoints,
  type Station,
  type StationTransitHubResponse,
  type TransjakartaResponse,
  type TransjakartaRoute,
} from "@/lib/api";
import { useApi } from "@/hooks/useApi";
import styles from "./TransjakartaSection.module.css";

interface Props {
  currentStation: Station;
  onSelectRoute: (route: TransjakartaRoute) => void;
}

type TabType = "station_hub" | "all_routes" | "transfer_guide";

export function TransjakartaSection({ currentStation, onSelectRoute }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("station_hub");

  // Ambil data integrasi bus di stasiun aktif
  const { data: hubData, loading: hubLoading } = useApi<StationTransitHubResponse>(
    endpoints.stationTransjakarta(currentStation.id),
    60_000,
  );

  // Ambil seluruh rute Transjakarta & Trans Patriot koridor Bekasi
  const { data: allRoutesData, loading: allLoading } = useApi<TransjakartaResponse>(
    endpoints.transjakartaRoutes(),
    300_000,
  );

  const integration = hubData?.integration;
  const connectedRoutes = integration?.routes || [];
  const allRoutes = allRoutesData?.routes || [];

  return (
    <section className={styles.section} aria-labelledby="tj-title">
      {/* Header Section */}
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.headBadge}>
            <span className={styles.busIcon}>🚌</span>
            Integrasi Antarmoda Terpadu
          </div>
          <h2 id="tj-title" className={styles.title}>
            Transjakarta & Bus Feeder Koridor Bekasi
          </h2>
          <p className={styles.subtitle}>
            Koneksi lanjutan langsung dari peron KRL ke jaringan BRT Transjakarta, bus kota Trans
            Patriot, dan pengumpan perbatasan
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabGroup} role="tablist" aria-label="Kategori transit bus">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "station_hub"}
            className={styles.tabBtn}
            onClick={() => setActiveTab("station_hub")}
          >
            📍 Di Stasiun {currentStation.name}
            {connectedRoutes.length > 0 && (
              <span className={styles.tabCount}>{connectedRoutes.length}</span>
            )}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "all_routes"}
            className={styles.tabBtn}
            onClick={() => setActiveTab("all_routes")}
          >
            🗺️ Semua Rute Bekasi — Jakarta
            <span className={styles.tabCount}>{allRoutes.length || 10}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "transfer_guide"}
            className={styles.tabBtn}
            onClick={() => setActiveTab("transfer_guide")}
          >
            🚶 Panduan Transfer
          </button>
        </div>
      </div>

      {/* TAB 1: Hub Stasiun Terpilih */}
      {activeTab === "station_hub" && (
        <div className={styles.tabContent}>
          {hubLoading && !hubData ? (
            <div className={styles.skeletonGrid}>
              <span className="skeleton" style={{ width: "100%", height: 110, borderRadius: 12 }} />
              <span className="skeleton" style={{ width: "100%", height: 110, borderRadius: 12 }} />
            </div>
          ) : (
            <>
              {/* Info Halte Terdekat */}
              <div className={styles.hubOverviewCard}>
                <div className={styles.hubIconBox}>
                  <span className={styles.hubBigIcon}>🚏</span>
                </div>
                <div className={styles.hubDetails}>
                  <div className={styles.hubTitleRow}>
                    <span className={styles.hubLabel}>Halte / Titik Integrasi Terdekat</span>
                    <span className={styles.distanceBadge}>
                      ⚡ {integration?.distance_m ?? 80} m · ±{integration?.walking_time_min ?? 2} mnt jalan kaki
                    </span>
                  </div>
                  <h3 className={styles.hubStopName}>
                    {integration?.nearest_bus_stop || `Halte Stasiun ${currentStation.name}`}
                  </h3>
                  <p className={styles.hubGuideText}>{integration?.transfer_guide}</p>
                </div>
              </div>

              {/* Daftar Rute Bus yang Terhubung */}
              {connectedRoutes.length === 0 ? (
                <div className={styles.emptyCard}>
                  <span className={styles.emptyIcon}>ℹ️</span>
                  <div>
                    <h4 className={styles.emptyTitle}>
                      Belum ada rute BRT Transjakarta langsung di stasiun ini
                    </h4>
                    <p className={styles.emptyDesc}>
                      Tersedia angkutan pengumpan lokal / ojek daring menuju koridor utama Transjakarta
                      terdekat (seperti Halte Summarecon Bekasi atau Terminal Bekasi). Cek tab{" "}
                      <strong>Semua Rute Bekasi</strong> untuk rute utama menuju Jakarta.
                    </p>
                  </div>
                </div>
              ) : (
                <div className={styles.routesGrid}>
                  {connectedRoutes.map((route) => (
                    <RouteCard key={route.route_id} route={route} onSelect={onSelectRoute} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: Semua Rute Bekasi - Jakarta */}
      {activeTab === "all_routes" && (
        <div className={styles.tabContent}>
          <div className={styles.allRoutesNotice}>
            <span>
              💡 <strong>Rute Lintas Batas:</strong> Transjakarta koridor B (Bekasi) dan Trans Patriot
              beroperasi melalui jalur Tol Jakarta-Cikampek dan koridor layang untuk menghubungkan komuter
              Bekasi ke sentra bisnis Sudirman, Grogol, Tanjung Priok, dan sekitarnya.
            </span>
          </div>

          {allLoading && allRoutes.length === 0 ? (
            <div className={styles.skeletonGrid}>
              <span className="skeleton" style={{ width: "100%", height: 120, borderRadius: 12 }} />
              <span className="skeleton" style={{ width: "100%", height: 120, borderRadius: 12 }} />
              <span className="skeleton" style={{ width: "100%", height: 120, borderRadius: 12 }} />
            </div>
          ) : (
            <div className={styles.routesGrid}>
              {allRoutes.map((route) => (
                <RouteCard key={route.route_id} route={route} onSelect={onSelectRoute} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Panduan Transfer Antarmoda */}
      {activeTab === "transfer_guide" && (
        <div className={styles.tabContent}>
          <div className={styles.guideGrid}>
            <div className={styles.guideCard}>
              <div className={styles.guideCardHead}>
                <span className={styles.guideStepNum}>1</span>
                <div>
                  <h4 className={styles.guideCardTitle}>Integrasi Langsung Skybridge Cakung (CUK)</h4>
                  <span className={styles.guideBadge}>Paling Direkomendasikan</span>
                </div>
              </div>
              <p className={styles.guideCardText}>
                Stasiun KRL Cakung memiliki <strong>Jembatan Layang (Skybridge)</strong> langsung di
                lantai 2 menuju Halte BRT Transjakarta Koridor 11 (Pulo Gebang - Kampung Melayu). Anda
                tidak perlu keluar ke jalan raya, cukup tap kartu tiket antarmoda.
              </p>
              <div className={styles.guideCardTags}>
                <span>KRL Cakung ⇄ TJ Koridor 11</span>
                <span>Waktu Pindah: 1 Menit</span>
                <span>Tarif TJ: Rp 3.500</span>
              </div>
            </div>

            <div className={styles.guideCard}>
              <div className={styles.guideCardHead}>
                <span className={styles.guideStepNum}>2</span>
                <div>
                  <h4 className={styles.guideCardTitle}>Hub Terpadu Stasiun Bekasi (BKS)</h4>
                  <span className={styles.guideBadgeSecondary}>Pusat Kota Bekasi</span>
                </div>
              </div>
              <p className={styles.guideCardText}>
                Keluar melalui <strong>Pintu Selatan Stasiun Bekasi</strong> untuk menaiki Bus Trans
                Patriot Koridor 1 (menuju Harapan Indah) atau Trans Patriot Koridor 2 (menuju Summarecon
                / Bantargebang). Untuk bus TJ B11/B12 ke Sudirman, dapat transit 5 menit ke Halte
                Summarecon Mall Bekasi.
              </p>
              <div className={styles.guideCardTags}>
                <span>Pintu Selatan St. Bekasi</span>
                <span>Trans Patriot: Rp 4.000</span>
                <span>Koneksi B11 / B12</span>
              </div>
            </div>

            <div className={styles.guideCard}>
              <div className={styles.guideCardHead}>
                <span className={styles.guideStepNum}>3</span>
                <div>
                  <h4 className={styles.guideCardTitle}>Skybridge Halte Jatinegara (JNG)</h4>
                  <span className={styles.guideBadgeSecondary}>Gerbang Jakarta Timur</span>
                </div>
              </div>
              <p className={styles.guideCardText}>
                Dari peron KRL Jatinegara, naik ke concourse lantai atas lalu ikuti penunjuk arah menuju
                <strong> JPO Halte Stasiun Jatinegara / Flyover</strong>. Terkoneksi langsung ke Koridor
                11 (ke Kampung Melayu) dan Koridor 4 (ke Pulo Gadung / Galunggung Dukuh Atas).
              </p>
              <div className={styles.guideCardTags}>
                <span>KRL Jatinegara ⇄ Koridor 4 & 11</span>
                <span>Koneksi Koridor Sudirman</span>
                <span>Operasional: 24 Jam</span>
              </div>
            </div>

            <div className={styles.guideCard}>
              <div className={styles.guideCardHead}>
                <span className={styles.guideStepNum}>4</span>
                <div>
                  <h4 className={styles.guideCardTitle}>Terminal Terpadu Bekasi Timur (BKST)</h4>
                  <span className={styles.guideBadgeSecondary}>Bekasi Timur</span>
                </div>
              </div>
              <p className={styles.guideCardText}>
                Hanya 120 meter dari Stasiun Bekasi Timur, tersedia Halte Transjakarta untuk rute B21
                (menuju Grogol via Tol Timur) dan B22 (menuju Juanda / Pasar Senen), memudahkan komuter
                yang ingin perjalanan langsung tanpa transit kereta di Manggarai.
              </p>
              <div className={styles.guideCardTags}>
                <span>Stasiun Bekasi Timur ⇄ Terminal</span>
                <span>Rute B21 & B22</span>
                <span>Tarif: Rp 3.500</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function RouteCard({
  route,
  onSelect,
}: {
  route: TransjakartaRoute;
  onSelect: (route: TransjakartaRoute) => void;
}) {
  const isTransPatriot = route.service_type === "Trans Patriot";
  const isRoyal = route.service_type === "Royaltrans";
  const formattedFare = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(route.fare);

  return (
    <div
      className={styles.routeCard}
      onClick={() => onSelect(route)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(route)}
    >
      <div className={styles.cardHeader}>
        <div className={styles.badgeWrapper}>
          <span
            className={styles.routeIdBadge}
            style={{
              background: isTransPatriot ? "#dc2626" : isRoyal ? "#7c3aed" : "#0284c7",
            }}
          >
            {route.route_id}
          </span>
          <span className={styles.serviceTypeTag} data-type={route.service_type}>
            {route.service_type}
          </span>
        </div>
        <span className={styles.fareBadge}>{formattedFare}</span>
      </div>

      <h4 className={styles.routeName}>{route.name}</h4>
      <span className={styles.routeCorridor}>{route.corridor}</span>

      <p className={styles.routeDesc}>{route.description}</p>

      {/* Info Operasional */}
      <div className={styles.cardFooter}>
        <div className={styles.metaCol}>
          <span className={styles.metaLabel}>Jam Operasi</span>
          <span className={`${styles.metaVal} mono`}>{route.operational_hours}</span>
        </div>
        <div className={styles.metaCol} style={{ textAlign: "right" }}>
          <span className={styles.metaLabel}>Interval Bus</span>
          <span className={`${styles.metaVal} mono`}>±{route.headway_min} menit</span>
        </div>
      </div>

      {/* Stop Snippet Preview */}
      <div className={styles.stopSnippet}>
        <span className={styles.stopIcon}>➔</span>
        <span className={styles.stopSnippetText}>
          {route.stops.slice(0, 3).join(" • ")} {route.stops.length > 3 ? "..." : ""}
        </span>
        <span className={styles.detailLink}>Lihat Rute</span>
      </div>
    </div>
  );
}
