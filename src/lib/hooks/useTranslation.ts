"use client";

import { useSettings } from "@/lib/hooks/useSettings";
import { TRANSLATIONS } from "../translations";

export function useTranslation() {
  const { lang } = useSettings();
  
  const t = (key: string, replacements?: Record<string, string>) => {
    const keys = key.split(".");
    let current: any = TRANSLATIONS[lang];
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return key;
      }
    }
    
    if (typeof current !== "string") {
      return key;
    }
    
    let result = current;
    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        result = result.replace(`{${k}}`, v);
      });
    }
    
    return result;
  };

  return { t, lang };
}
