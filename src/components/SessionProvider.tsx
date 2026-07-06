"use client";

import { SessionProvider } from "next-auth/react";
import { SettingsProvider } from "@/lib/context/SettingsContext";

export default function AuthSessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <SettingsProvider>{children}</SettingsProvider>
    </SessionProvider>
  );
}
