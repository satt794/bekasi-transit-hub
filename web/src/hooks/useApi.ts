"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getJSON } from "@/lib/api";

interface State<T> {
  /** Path yang menghasilkan `data`/`error` ini (untuk mendeteksi data basi). */
  key: string | null;
  data: T | null;
  error: Error | null;
  updatedAt: number | null;
}

export interface ApiResult<T> {
  data: T | null;
  error: Error | null;
  /** True saat belum ada data sama sekali untuk path ini. */
  loading: boolean;
  /** True saat sedang mengambil ulang di latar belakang. */
  refreshing: boolean;
  updatedAt: number | null;
  reload: () => void;
}

/**
 * Ambil JSON dari `path` dan perbarui otomatis tiap `refreshMs`.
 *
 * - `path = null` → tidak fetch apa pun.
 * - Polling berhenti saat tab tidak terlihat, dan langsung fetch ulang saat
 *   tab kembali aktif.
 * - Data lama tetap ditampilkan selama refresh, dan tetap ditampilkan
 *   kalau refresh gagal (error dicatat terpisah).
 */
export function useApi<T>(path: string | null, refreshMs = 0): ApiResult<T> {
  const [state, setState] = useState<State<T>>({
    key: null,
    data: null,
    error: null,
    updatedAt: null,
  });
  const [inflight, setInflight] = useState(false);
  const [nonce, setNonce] = useState(0);
  const controller = useRef<AbortController | null>(null);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  useEffect(() => {
    if (!path) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      controller.current?.abort();
      const ac = new AbortController();
      controller.current = ac;
      setInflight(true);
      try {
        const data = await getJSON<T>(path, ac.signal);
        if (!cancelled) setState({ key: path, data, error: null, updatedAt: Date.now() });
      } catch (err) {
        if ((err as Error).name === "AbortError" || cancelled) return;
        setState((prev) => ({
          key: path,
          // Simpan data lama hanya kalau masih untuk path yang sama.
          data: prev.key === path ? prev.data : null,
          error: err as Error,
          updatedAt: prev.key === path ? prev.updatedAt : null,
        }));
      } finally {
        if (!cancelled) setInflight(false);
        schedule();
      }
    };

    const schedule = () => {
      clearTimeout(timer);
      if (cancelled || !refreshMs || document.visibilityState !== "visible") return;
      timer = setTimeout(run, refreshMs);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") run();
      else clearTimeout(timer);
    };

    run();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller.current?.abort();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [path, refreshMs, nonce]);

  const current = state.key === path;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: !!path && (!current || (state.data === null && state.error === null)),
    refreshing: inflight,
    updatedAt: current ? state.updatedAt : null,
    reload,
  };
}
