/**
 * Tipe data & client untuk Bekasi Transit API (lihat backend/app/models.py).
 * Semua waktu berupa string ISO-8601 dengan offset +07:00 (WIB).
 */

export type Direction = "jakarta" | "cikarang";

export interface Station {
  id: string;
  name: string;
  region: string | null;
  is_bekasi: boolean;
  order: number | null;
}

export interface ProviderAttempt {
  provider: string;
  ok: boolean;
  latency_ms: number | null;
  error: string | null;
}

export interface SourceInfo {
  provider: string;
  fetched_at: string;
  cached: boolean;
  stale: boolean;
  attempts: ProviderAttempt[];
}

export interface Departure {
  train_id: string;
  line: string;
  origin_id: string | null;
  origin_name: string;
  destination_id: string | null;
  destination_name: string;
  departs_at: string;
  arrives_at: string | null;
  direction: Direction;
  color: string;
  is_passenger: boolean;
}

export interface HourBucket {
  hour: number;
  count: number;
}

export interface StationSummary {
  total_trips: number;
  first_departure: string | null;
  last_departure: string | null;
  trips_next_hour: number;
  avg_headway_min: number | null;
  per_hour: HourBucket[];
}

export interface DeparturesResponse {
  station: Station;
  generated_at: string;
  source: SourceInfo;
  summary: StationSummary;
  departures: Record<Direction, Departure[]>;
}

export interface RouteStop {
  station_id: string;
  station_name: string;
  departs_at: string;
  status: "passed" | "next" | "upcoming";
  is_bekasi: boolean;
}

export interface TrainRouteResponse {
  train_id: string;
  line: string | null;
  color: string;
  generated_at: string;
  source: SourceInfo;
  partial: boolean;
  stops: RouteStop[];
}

export interface Trip {
  train_id: string;
  line: string;
  destination_name: string;
  color: string;
  departs_at: string;
  arrives_at: string;
  duration_min: number;
}

export interface TripsResponse {
  origin: Station;
  destination: Station;
  generated_at: string;
  source: SourceInfo;
  trips: Trip[];
}

export interface StationsResponse {
  generated_at: string;
  source: SourceInfo;
  bekasi: Station[];
  all: Station[];
}

/** Error dari API, membawa status HTTP supaya UI bisa memberi pesan yang tepat. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getJSON<T>(path: string, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { signal, headers: { Accept: "application/json" }, cache: "no-store" });
  } catch (err) {
    if ((err as Error).name === "AbortError") throw err;
    throw new ApiError("Tidak bisa terhubung ke server.", 0);
  }

  if (!res.ok) {
    let detail = `Server membalas ${res.status}.`;
    try {
      const body = await res.json();
      if (typeof body?.detail === "string") detail = body.detail;
    } catch {
      // Proxy Next.js mengembalikan HTML/teks kalau backend mati.
      if (res.status >= 500) detail = "Backend tidak merespons. Pastikan API sudah berjalan.";
    }
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

export interface TransjakartaRoute {
  route_id: string;
  name: string;
  corridor: string;
  service_type: "BRT" | "Non-BRT" | "Trans Patriot" | "Royaltrans";
  color: string;
  fare: number;
  operational_hours: string;
  headway_min: number;
  connecting_stations: string[];
  stops: string[];
  description: string;
}

export interface StationBusIntegration {
  station_id: string;
  station_name: string;
  nearest_bus_stop: string;
  distance_m: number;
  walking_time_min: number;
  transfer_guide: string;
  routes: TransjakartaRoute[];
}

export interface TransjakartaResponse {
  generated_at: string;
  routes: TransjakartaRoute[];
  total_routes: number;
}

export interface StationTransitHubResponse {
  station: Station;
  generated_at: string;
  integration: StationBusIntegration;
}

export const endpoints = {
  stations: () => "/api/stations",
  departures: (stationId: string, limit: number) =>
    `/api/stations/${encodeURIComponent(stationId)}/departures?limit=${limit}`,
  route: (trainId: string) => `/api/trains/${encodeURIComponent(trainId)}/route`,
  trips: (from: string, to: string, limit = 8) =>
    `/api/trips?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&limit=${limit}`,
  transjakartaRoutes: () => "/api/transjakarta/routes",
  stationTransjakarta: (stationId: string) =>
    `/api/stations/${encodeURIComponent(stationId)}/transjakarta`,
};

