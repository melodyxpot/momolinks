"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";
import { Toast } from "@heroui/react";
import { Analytics } from "@vercel/analytics/next"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <Analytics/>
      <Toast.Provider />
      {children}
    </NextThemesProvider>
  );
}
