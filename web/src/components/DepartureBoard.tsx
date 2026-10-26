"use client";

import type { Departure, DeparturesResponse, Direction } from "@/lib/api";
import { countdownLabel, formatClock, minutesUntil } from "@/lib/time";
import styles from "./DepartureBoard.module.css";

interface Props {
  data: DeparturesResponse | null;
  loading: boolean;
  error: Error | null;
  now: number | null;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSelectTrain: (dep: Departure) => void;
  onRetry: () => void;
}

const COLUMNS: { dir: Direction; title: string; hint: string; icon: string }[] = [
  {
    dir: "jakarta",
    title: "Arah Jakarta",
    hint: "Manggarai · Sudirman · Kampung Bandan · Angke",
    icon: "🏙️",
  },
  {
    dir: "cikarang",
    title: "Arah Cikarang",
    hint: "Bekasi Timur · Tambun · Cibitung · Cikarang",
    icon: "🌾",
  },
];

export function DepartureBoard(props: Props) {
  const { data, loading, error, now, expanded, onToggleExpanded, onSelectTrain, onRetry } = props;
  const stationId = data?.station.id;

  return (
    <section className={styles.board} aria-labelledby="board-title">
      <header className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.headBadge}>
            <span className={styles.radarPing} />
            Papan Jadwal Real-Time
          </div>
          <h2 id="board-title" className={styles.title}>
            Keberangkatan Berikutnya
          </h2>
        </div>

        <button
          id="toggle-more-departures"
          type="button"
          className={styles.moreBtn}
          onClick={onToggleExpanded}
          aria-expanded={expanded}
        >
          <span>{expanded ? "Tampilkan Ringkas" : "Lihat Lebih Banyak"}</span>
          <span className={styles.moreIcon}>{expanded ? "▲" : "▼"}</span>
        </button>
      </header>

      {error && !data ? (
        <BoardError error={error} onRetry={onRetry} />
      ) : (
        <div className={styles.columns}>
          {COLUMNS.map((col) => {
            const items = data?.departures[col.dir] ?? [];
            const terminus = stationId === "CKR" && col.dir === "cikarang";

            return (
              <div key={col.dir} className={styles.column} aria-labelledby={`col-${col.dir}`}>
                <div className={styles.colHead}>
                  <div className={styles.colHeadTop}>
                    <span className={styles.colIcon}>{col.icon}</span>
                    <h3 id={`col-${col.dir}`} className={styles.colTitle}>
                      <span className={styles.arrow} aria-hidden="true">
                        {col.dir === "jakarta" ? "←" : "→"}
                      </span>
                      {col.title}
                    </h3>
                  </div>
                  <span className={styles.colHint}>{col.hint}</span>
                </div>

                {loading && !data ? (
                  <SkeletonRows />
                ) : items.length === 0 ? (
                  <p className={styles.empty}>
                    {terminus
                      ? "Cikarang adalah stasiun terminus — tidak ada keberangkatan ke arah timur."
                      : "Tidak ada keberangkatan dalam jadwal tersisa hari ini."}
                  </p>
                ) : (
                  <ol className={styles.rows}>
                    {items.map((dep, i) => (
                      <DepartureRow
                        key={`${dep.train_id}-${dep.departs_at}`}
                        dep={dep}
                        now={now}
                        first={i === 0}
                        onSelect={onSelectTrain}
                      />
                    ))}
                  </ol>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function DepartureRow({
  dep,
  now,
  first,
  onSelect,
}: {
  dep: Departure;
  now: number | null;
  first: boolean;
  onSelect: (dep: Departure) => void;
}) {
  const min = now === null ? null : minutesUntil(dep.departs_at, now);
  const urgency =
    min === null ? "none" : min < 0 ? "gone" : min <= 2 ? "now" : min <= 7 ? "soon" : "later";

  return (
    <li className={styles.row} data-first={first || undefined} data-urgency={urgency}>
      <button
        id={`train-${dep.train_id}`}
        type="button"
        className={styles.rowButton}
        onClick={() => onSelect(dep)}
        aria-label={`KA ${dep.train_id} tujuan ${dep.destination_name}, berangkat ${formatClock(dep.departs_at)}. Lihat rute.`}
      >
        {/* Glowing Line Stripe */}
        <span
          className={styles.stripe}
          style={{ background: dep.color }}
          aria-hidden="true"
        />

        {/* Departure Time */}
        <div className={styles.timeBlock}>
          <span className={`${styles.time} mono`}>{formatClock(dep.departs_at)}</span>
          <span className={styles.wibTag}>WIB</span>
        </div>

        {/* Info Kereta & Tujuan */}
        <div className={styles.info}>
          <div className={styles.destRow}>
            {first && (
              <span className={styles.nextSpotlight}>
                <span className={styles.spotlightBeacon} /> Kereta Berikutnya
              </span>
            )}
            <span className={styles.dest}>{dep.destination_name}</span>
          </div>

          <div className={styles.meta}>
            <span className={`${styles.kaBadge} mono`}>KA {dep.train_id}</span>
            {dep.platform && (
              <span
                className={`${styles.platformBadge} mono`}
                title={`Berangkat dari ${dep.platform}`}
              >
                <span className={styles.platformDot} />
                {dep.platform}
              </span>
            )}
            {!dep.is_passenger && <span className={styles.tagDinas}>Dinas</span>}
            {dep.arrives_at && (
              <span className={styles.arrivalMeta}>
                Tiba di tujuan <span className="mono">{formatClock(dep.arrives_at)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Dynamic Countdown Badge */}
        <div className={styles.countdownBox}>
          <span className={`${styles.countdownBadge} mono`} suppressHydrationWarning>
            {now === null ? "—" : countdownLabel(dep.departs_at, now)}
          </span>
          <span className={styles.viewDetail}>Lihat rute ➔</span>
        </div>
      </button>
    </li>
  );
}

function SkeletonRows() {
  return (
    <ol className={styles.rows} aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <li key={i} className={styles.skeletonRow}>
          <span className="skeleton" style={{ width: 56, height: 26 }} />
          <span className="skeleton" style={{ width: `${55 - i * 5}%`, height: 18 }} />
          <span className="skeleton" style={{ width: 60, height: 22, marginLeft: "auto" }} />
        </li>
      ))}
    </ol>
  );
}

function BoardError({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className={styles.error} role="alert">
      <div className={styles.errorIcon}>⚠️</div>
      <p className={styles.errorTitle}>Jadwal belum bisa dimuat</p>
      <p className={styles.errorText}>{error.message}</p>
      <p className={styles.errorHint}>
        Pastikan backend aktif di port 8000:
        <code className="mono"> uv run uvicorn app.main:app --port 8000</code>
      </p>
      <button id="retry-departures" type="button" className={styles.retry} onClick={onRetry}>
        Coba lagi
      </button>
    </div>
  );
}
