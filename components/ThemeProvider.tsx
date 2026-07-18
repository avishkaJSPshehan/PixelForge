'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  // Read saved preference on first mount
  useEffect(() => {
    const saved = localStorage.getItem('pf-theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved: Theme = saved ?? (prefersDark ? 'dark' : 'light');
    setTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    setMounted(true);
  }, []);

  const toggle = () => {
    setTheme((prev) => {
      const next: Theme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('pf-theme', next);
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  };

  // Prevent flash of wrong theme: render children only after mount
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
