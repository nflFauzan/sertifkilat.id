"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ThemeValue = "light" | "dark";
export type LangValue = "id" | "en";
export type DensityValue = "comfortable" | "compact";

export interface AppSettings {
  theme: ThemeValue;
  lang: LangValue;
  certLang: LangValue;
  dateFormat: string;
  timezone: string;
  density: DensityValue;
}

export interface SettingsContextValue extends AppSettings {
  setTheme: (theme: ThemeValue) => void;
  setLang: (lang: LangValue) => void;
  setCertLang: (certLang: LangValue) => void;
  setDateFormat: (dateFormat: string) => void;
  setTimezone: (timezone: string) => void;
  setDensity: (density: DensityValue) => void;
  resetToDefaults: () => void;
}

// ─── Default values ───────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: AppSettings = {
  theme: "light",
  lang: "id",
  certLang: "id",
  dateFormat: "DD Month YYYY",
  timezone: "Asia/Jakarta",
  density: "comfortable",
};

const STORAGE_KEYS = {
  theme: "settings_theme",
  lang: "settings_lang",
  certLang: "settings_cert_lang",
  dateFormat: "settings_date_format",
  timezone: "settings_timezone",
  density: "settings_density",
} as const;

// ─── Context ──────────────────────────────────────────────────────────────────

export const SettingsContext = createContext<SettingsContextValue>({
  ...DEFAULT_SETTINGS,
  setTheme: () => {},
  setLang: () => {},
  setCertLang: () => {},
  setDateFormat: () => {},
  setTimezone: () => {},
  setDensity: () => {},
  resetToDefaults: () => {},
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function applyThemeToDom(theme: ThemeValue) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function loadSettingsFromStorage(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  return {
    theme:
      (localStorage.getItem(STORAGE_KEYS.theme) as ThemeValue) ||
      DEFAULT_SETTINGS.theme,
    lang:
      (localStorage.getItem(STORAGE_KEYS.lang) as LangValue) ||
      DEFAULT_SETTINGS.lang,
    certLang:
      (localStorage.getItem(STORAGE_KEYS.certLang) as LangValue) ||
      DEFAULT_SETTINGS.certLang,
    dateFormat:
      localStorage.getItem(STORAGE_KEYS.dateFormat) ||
      DEFAULT_SETTINGS.dateFormat,
    timezone:
      localStorage.getItem(STORAGE_KEYS.timezone) || DEFAULT_SETTINGS.timezone,
    density:
      (localStorage.getItem(STORAGE_KEYS.density) as DensityValue) ||
      DEFAULT_SETTINGS.density,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const loaded = loadSettingsFromStorage();
    setSettings(loaded);
    applyThemeToDom(loaded.theme);
    setMounted(true);
  }, []);

  // Broadcast cross-tab sync (storage events from other tabs)
  useEffect(() => {
    if (!mounted) return;
    const handleStorage = (e: StorageEvent) => {
      if (Object.values(STORAGE_KEYS).includes(e.key as never)) {
        const updated = loadSettingsFromStorage();
        setSettings(updated);
        applyThemeToDom(updated.theme);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [mounted]);

  // Generic setter that also persists to localStorage and applies side effects
  const updateSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      localStorage.setItem(STORAGE_KEYS[key], String(value));
      if (key === "theme") {
        applyThemeToDom(value as ThemeValue);
      }
      window.dispatchEvent(new Event("settings-changed"));
    },
    []
  );

  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    Object.entries(STORAGE_KEYS).forEach(([, storageKey]) =>
      localStorage.removeItem(storageKey)
    );
    applyThemeToDom(DEFAULT_SETTINGS.theme);
    window.dispatchEvent(new Event("settings-changed"));
  }, []);

  const value: SettingsContextValue = {
    ...settings,
    setTheme: (v) => updateSetting("theme", v),
    setLang: (v) => updateSetting("lang", v),
    setCertLang: (v) => updateSetting("certLang", v),
    setDateFormat: (v) => updateSetting("dateFormat", v),
    setTimezone: (v) => updateSetting("timezone", v),
    setDensity: (v) => updateSetting("density", v),
    resetToDefaults,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSettings(): SettingsContextValue {
  return useContext(SettingsContext);
}
