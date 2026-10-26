/**
 * Preferensi tema: "system" (ikuti OS), "light", atau "dark".
 *
 * Preferensi disimpan di localStorage. Tema yang *terpakai* (light/dark)
 * ditulis ke atribut `data-theme` di <html> oleh skrip inline di <head>
 * sebelum halaman di-paint, jadi tidak ada kedipan tema saat load.
 */

export type ThemePref = "system" | "light" | "dark";

export const THEME_KEY = "bt-theme";
export const THEME_EVENT = "bt-theme-change";

/** Dijalankan sinkron di <head>. Harus ES5 dan tanpa dependensi. */
export const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem("${THEME_KEY}");var d=p==="dark"||(p!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()`;

export function readThemePref(): ThemePref {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : "system";
  } catch {
    return "system";
  }
}

export function resolveTheme(pref: ThemePref): "light" | "dark" {
  if (pref !== "system") return pref;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(pref: ThemePref) {
  try {
    if (pref === "system") localStorage.removeItem(THEME_KEY);
    else localStorage.setItem(THEME_KEY, pref);
  } catch {
    // localStorage bisa diblokir (mode privat); tema tetap diterapkan untuk sesi ini.
  }
  document.documentElement.setAttribute("data-theme", resolveTheme(pref));
  window.dispatchEvent(new Event(THEME_EVENT));
}
