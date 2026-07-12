"use client";

import { useState, useEffect } from "react";

export function useLanguage() {
  const [lang, setLang] = useState<"id" | "en">("id");

  useEffect(() => {
    // Read on mount
    const saved = localStorage.getItem("settings_lang") as "id" | "en";
    if (saved) {
      setLang(saved);
    }

    const handleSettingsChange = () => {
      const updated = localStorage.getItem("settings_lang") as "id" | "en";
      if (updated) setLang(updated);
    };

    window.addEventListener("settings-changed", handleSettingsChange);
    window.addEventListener("storage", handleSettingsChange);
    return () => {
      window.removeEventListener("settings-changed", handleSettingsChange);
      window.removeEventListener("storage", handleSettingsChange);
    };
  }, []);

  const changeLanguage = (newLang: "id" | "en") => {
    setLang(newLang);
    localStorage.setItem("settings_lang", newLang);
    window.dispatchEvent(new Event("settings-changed"));
  };

  return { lang, changeLanguage };
}
