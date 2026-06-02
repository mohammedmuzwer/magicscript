"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";

export default function ThemeProvider({ children }) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      {children}
    </NextThemeProvider>
  );
}
