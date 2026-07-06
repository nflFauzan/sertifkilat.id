"use client";

import { useState, useRef, useEffect } from "react";
import { Sun, Moon } from "@phosphor-icons/react";
import { useSettings, type ThemeValue } from "@/lib/context/SettingsContext";

const THEME_OPTIONS: { id: ThemeValue; label: string; icon: typeof Sun }[] = [
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

export default function LandingThemeSwitcher() {
  const { theme, setTheme } = useSettings();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const currentOption = THEME_OPTIONS.find((o) => o.id === theme) ?? THEME_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

  return (
    <div ref={ref} className="relative z-50">
      <button
        id="landing-theme-switcher"
        onClick={() => setOpen((o) => !o)}
        aria-label="Change theme"
        className={`
          flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold
          transition-all duration-200 shadow-sm backdrop-blur-md
          bg-white/80 dark:bg-ink-800/80
          border-ink-200 dark:border-ink-700
          text-ink-700 dark:text-ink-200
          hover:bg-white dark:hover:bg-ink-700
          hover:shadow-md
        `}
      >
        <CurrentIcon className="w-4 h-4 text-brand-500" />
        <span className="hidden sm:inline">{currentOption.label}</span>
      </button>

      {open && (
        <div
          className="
            absolute right-0 top-full mt-2 w-36 rounded-2xl border
            bg-white/95 dark:bg-ink-800/95 backdrop-blur-lg
            border-ink-100 dark:border-ink-700
            shadow-xl shadow-ink-900/10
            overflow-hidden
            animate-in fade-in slide-in-from-top-2 duration-150
          "
        >
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.id;
            return (
              <button
                key={option.id}
                id={`landing-theme-${option.id}`}
                onClick={() => {
                  setTheme(option.id);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold
                  transition-colors duration-150 text-left
                  ${
                    isActive
                      ? "bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400"
                      : "text-ink-700 dark:text-ink-300 hover:bg-ink-50 dark:hover:bg-ink-700"
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-500" : "text-ink-400"}`} />
                {option.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
