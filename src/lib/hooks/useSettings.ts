"use client";

/**
 * useSettings — Global settings hook.
 *
 * This is a thin re-export of the SettingsContext so that all existing
 * consumers (`useSettings()`) continue to work without changes while
 * still reading from the single global SettingsProvider.
 */
export { useSettings } from "@/lib/context/SettingsContext";
