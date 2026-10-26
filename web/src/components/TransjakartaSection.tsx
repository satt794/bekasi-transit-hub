"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const AREAS = [
  { id: "all", label: "🌐 Semua Jabodetabek" },
  { id: "bekasi", label: "🚆 Bekasi & Trans Patriot" },
  { id: "brt_jakarta", label: "🚌 Koridor Utama BRT (1–14)" },
  { id: "bogor_depok", label: "🌲 Bogor & Depok" },
  { id: "tangerang", label: "🏙️ Tangerang & Tangsel" },
];

export function TransjakartaSection({ currentStation, onSelectRoute }: Props) {
  const [activeTab, setActiveTab] = useState<TabType>("station_hub");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const tabGroupRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  // Ambil data integrasi bus di stasiun aktif
  const { data: hubData, loading: hubLoading } = useApi<StationTransitHubResponse>(
    endpoints.stationTransjakarta(currentStation.id),
    60_000,
  );

  // Ambil seluruh rute Transjakarta & Trans Patriot se-Jabodetabek
  const { data: allRoutesData, loading: allLoading } = useApi<TransjakartaResponse>(
    endpoints.transjakartaRoutes(),
    300_000,
  );

  const integration = hubData?.integration;
  const connectedRoutes = useMemo(() => integration?.routes || [], [integration?.routes]);
  const allRoutes = useMemo(() => allRoutesData?.routes || [], [allRoutesData?.routes]);

  // Filter rute se-Jabodetabek berdasarkan kategori wilayah dan pencarian kata kunci
  const filteredAllRoutes = useMemo(() => {
    let list = allRoutes;
    if (selectedArea !== "all") {
      list = list.filter((r) => r.area === selectedArea);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.route_id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.corridor.toLowerCase().includes(q) ||
          (r.area_name && r.area_name.toLowerCase().includes(q)) ||
          r.stops.some((s) => s.toLowerCase().includes(q)),
      );
    }
    return list;
  }, [allRoutes, selectedArea, searchQuery]);

  // Hitung status scroll tabGroup
  const checkScroll = useCallback(() => {
    const el = tabGroupRef.current;
    if (!el) return;
    const hasScroll = el.scrollWidth > el.clientWidth + 2;
    setCanScrollLeft(el.scrollLeft > 6);
    setCanScrollRight(hasScroll && el.scrollLeft < el.scrollWidth - el.clientWidth - 6);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = tabGroupRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, connectedRoutes.length, allRoutes.length]);

  // Otomatis pusatkan tab aktif agar terlihat penuh tanpa terpotong
  useEffect(() => {
    const el = tabGroupRef.current;
    if (!el) return;
    const activeBtn = el.querySelector<HTMLButtonElement>('[aria-selected="true"]');
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
    // Update button visibility setelah scroll
    const timer = setTimeout(checkScroll, 300);
    return () => clearTimeout(timer);
  }, [activeTab, checkScroll]);

  const scrollTabs = (direction: "left" | "right") => {
    const el = tabGroupRef.current;
    if (!el) return;
    const amount = direction === "left" ? -220 : 220;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Mouse Drag-to-Scroll untuk desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = tabGroupRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = tabGroupRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  return (
    <section className={styles.section} aria-labelledby="tj-title">
      {/* Header Section */}
      <div className={styles.head}>
        <div className={styles.headBadge}>
          <span className={styles.busIcon}>🚌</span>
          Integrasi Antarmoda Terpadu
        </div>
        <h2 id="tj-title" className={styles.title}>
          Transjakarta & Jaringan Bus Se-Jabodetabek
        </h2>
        <p className={styles.subtitle}>
          Koneksi lanjutan multi-modal dari peron KRL ke seluruh koridor BRT Transjakarta (1–14), bus kota
          Trans Patriot Bekasi, serta rute perbatasan Bogor, Depok, dan Tangerang
        </p>
      </div>

      {/* Tab Switcher Bar - Full Width, Bebas Terhimpit & Mendukung Geser Penuh */}
      <div className={styles.tabNavRow}>
        <div className={styles.tabGroupWrapper}>
          <button
            type="button"
            className={`${styles.tabScrollBtn} ${styles.tabScrollBtnLeft}`}
            data-visible={canScrollLeft}
            onClick={() => scrollTabs("left")}
            aria-label="Geser tab ke kiri"
          >
            ‹
          </button>

          <div
            ref={tabGroupRef}
            className={styles.tabGroup}
            role="tablist"
            aria-label="Kategori transit bus"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "station_hub"}
              className={styles.tabBtn}
              onClick={() => setActiveTab("station_hub")}
            >
              <span className={styles.tabIcon}>📍</span>
              <span>Di Stasiun {currentStation.name}</span>
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
              <span className={styles.tabIcon}>🗺️</span>
              <span>Jaringan Se-Jabodetabek</span>
              <span className={styles.tabCount}>{allRoutes.length || 30}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "transfer_guide"}
              className={styles.tabBtn}
              onClick={() => setActiveTab("transfer_guide")}
            >
              <span className={styles.tabIcon}>🚶</span>
              <span>Panduan Transfer Antarmoda</span>
            </button>
          </div>

          <button
            type="button"
            className={`${styles.tabScrollBtn} ${styles.tabScrollBtnRight}`}
            data-visible={canScrollRight}
            onClick={() => scrollTabs("right")}
            aria-label="Geser tab ke kanan"
          >
            ›
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
                      <strong>Jaringan Se-Jabodetabek</strong> untuk rute utama menuju Jakarta dan Bodetabek.
                    </p>
                    <button
                      type="button"
                      className={styles.emptyActionBtn}
                      onClick={() => setActiveTab("all_routes")}
                    >
                      Buka Semua Rute Transjakarta ➔
                    </button>
                  </div>
                </div>
              ) : (
                <RoutesListView routes={connectedRoutes} onSelectRoute={onSelectRoute} />
              )}
            </>
          )}
        </div>
      )}

      {/* TAB 2: Semua Rute Transjakarta Se-Jabodetabek */}
      {activeTab === "all_routes" && (
        <div className={styles.tabContent}>
          <div className={styles.allRoutesNotice}>
            <span>
              🌐 <strong>Jaringan Transjakarta Se-Jabodetabek:</strong> Mencakup seluruh 14 Koridor Utama
              BRT Jakarta, bus perbatasan Transjabodetabek koridor Bekasi, Depok, Bogor, dan Tangerang,
              serta bus pengumpan stasiun KRL.
            </span>
          </div>

          {/* Search Bar & Area Filter Bar */}
          <div className={styles.filterSection}>
            <div className={styles.searchBox}>
              <span className={styles.searchIcon}>🔍</span>
              <input
                id="search-transjakarta"
                type="text"
                className={styles.searchInput}
                placeholder="Cari rute (misal: B11, 13, D11, Koridor 1), tujuan (Ciledug, Depok, BSD, Monas, Tosari)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  className={styles.searchClearBtn}
                  onClick={() => setSearchQuery("")}
                  aria-label="Hapus pencarian"
                >
                  ✕
                </button>
              )}
            </div>

            <div className={styles.areaFilterChips} role="group" aria-label="Filter wilayah">
              {AREAS.map((a) => {
                const count = a.id === "all" ? allRoutes.length : allRoutes.filter((r) => r.area === a.id).length;
                return (
                  <button
                    key={a.id}
                    type="button"
                    className={`${styles.areaChip} ${selectedArea === a.id ? styles.areaChipActive : ""}`}
                    onClick={() => setSelectedArea(a.id)}
                  >
                    <span>{a.label}</span>
                    <span className={styles.areaChipCount}>{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {allLoading && allRoutes.length === 0 ? (
            <div className={styles.skeletonGrid}>
              <span className="skeleton" style={{ width: "100%", height: 120, borderRadius: 12 }} />
              <span className="skeleton" style={{ width: "100%", height: 120, borderRadius: 12 }} />
              <span className="skeleton" style={{ width: "100%", height: 120, borderRadius: 12 }} />
            </div>
          ) : filteredAllRoutes.length === 0 ? (
            <div className={styles.emptySearchCard}>
              <span className={styles.emptySearchIcon}>🔍</span>
              <h4 className={styles.emptyTitle}>Tidak ada rute yang cocok</h4>
              <p className={styles.emptyDesc}>
                Tidak ditemukan rute bus untuk kata kunci <strong>&ldquo;{searchQuery}&rdquo;</strong> di wilayah terpilih.
              </p>
              <button
                type="button"
                className={styles.resetFilterBtn}
                onClick={() => {
                  setSearchQuery("");
                  setSelectedArea("all");
                }}
              >
                Reset Filter Pencarian
              </button>
            </div>
          ) : (
            <RoutesListView routes={filteredAllRoutes} onSelectRoute={onSelectRoute} />
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

function RoutesListView({
  routes,
  onSelectRoute,
}: {
  routes: TransjakartaRoute[];
  onSelectRoute: (route: TransjakartaRoute) => void;
}) {
  const [viewMode, setViewMode] = useState<"slider" | "grid">("slider");
  const sliderRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const scrollSlider = (direction: "left" | "right") => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = direction === "left" ? -340 : 340;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = sliderRef.current;
    if (!el) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - el.offsetLeft;
    scrollLeftRef.current = el.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = sliderRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    el.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className={styles.routesContainer}>
      <div className={styles.routesControlsRow}>
        <span className={styles.routesSummaryText}>
          🚌 Menampilkan <strong>{routes.length} rute bus</strong>
        </span>

        <div className={styles.routesActions}>
          {viewMode === "slider" && (
            <div className={styles.sliderNavBtns}>
              <button
                type="button"
                className={styles.sliderNavBtn}
                onClick={() => scrollSlider("left")}
                aria-label="Geser rute ke kiri"
                title="Geser rute ke kiri"
              >
                ‹
              </button>
              <button
                type="button"
                className={styles.sliderNavBtn}
                onClick={() => scrollSlider("right")}
                aria-label="Geser rute ke kanan"
                title="Geser rute ke kanan"
              >
                ›
              </button>
            </div>
          )}

          <div className={styles.viewModeToggle} role="group" aria-label="Pilih mode tampilan">
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === "slider" ? styles.viewToggleActive : ""}`}
              onClick={() => setViewMode("slider")}
              title="Tampilan geser horizontal penuh"
            >
              ↔ Geser Penuh
            </button>
            <button
              type="button"
              className={`${styles.viewToggleBtn} ${viewMode === "grid" ? styles.viewToggleActive : ""}`}
              onClick={() => setViewMode("grid")}
              title="Tampilan kotak grid"
            >
              ⊞ Grid
            </button>
          </div>
        </div>
      </div>

      {viewMode === "slider" ? (
        <div
          ref={sliderRef}
          className={styles.routesSlider}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          role="region"
          aria-label="Daftar rute bus geser horizontal"
        >
          {routes.map((route) => (
            <RouteCard key={route.route_id} route={route} onSelect={onSelectRoute} isSlider />
          ))}
        </div>
      ) : (
        <div className={styles.routesGrid}>
          {routes.map((route) => (
            <RouteCard key={route.route_id} route={route} onSelect={onSelectRoute} />
          ))}
        </div>
      )}
    </div>
  );
}

function RouteCard({
  route,
  onSelect,
  isSlider = false,
}: {
  route: TransjakartaRoute;
  onSelect: (route: TransjakartaRoute) => void;
  isSlider?: boolean;
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
      className={`${styles.routeCard} ${isSlider ? styles.routeCardSlider : ""}`}
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
              background: route.color || (isTransPatriot ? "#dc2626" : isRoyal ? "#7c3aed" : "#0284c7"),
            }}
          >
            {route.route_id}
          </span>
          <span className={styles.serviceTypeTag} data-type={route.service_type}>
            {route.service_type}
          </span>
          {route.area_name && (
            <span className={styles.areaBadge}>
              {route.area_name}
            </span>
          )}
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
