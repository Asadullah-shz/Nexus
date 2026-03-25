import React, { createContext, useContext, useEffect, useState } from 'react';

type AccentColor = 'blue' | 'purple' | 'green' | 'indigo';

interface ThemeContextType {
  accentColor: AccentColor;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ACCENT_PALETTES: Record<AccentColor, Record<string, string>> = {
  blue: {
    '50': '#EFF6FF', '100': '#DBEAFE', '200': '#BFDBFE', '300': '#93C5FD', '400': '#60A5FA',
    '500': '#3B82F6', '600': '#2563EB', '700': '#1D4ED8', '800': '#1E40AF', '900': '#1E3A8A', '950': '#172554'
  },
  purple: {
    '50': '#FAF5FF', '100': '#F3E8FF', '200': '#E9D5FF', '300': '#D8B4FE', '400': '#C084FC',
    '500': '#A855F7', '600': '#9333EA', '700': '#7E22CE', '800': '#6B21A8', '900': '#581C87', '950': '#3B0764'
  },
  green: {
    '50': '#ECFDF5', '100': '#D1FAE5', '200': '#A7F3D0', '300': '#6EE7B7', '400': '#34D399',
    '500': '#10B981', '600': '#059669', '700': '#047857', '800': '#065F46', '900': '#064E3B', '950': '#022C22'
  },
  indigo: {
    '50': '#EEF2FF', '100': '#E0E7FF', '200': '#C7D2FE', '300': '#A5B4FC', '400': '#818CF8',
    '500': '#6366F1', '600': '#4F46E5', '700': '#4338CA', '800': '#3730A3', '900': '#312E81', '950': '#1E1B4B'
  }
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accentColor, setAccentColor] = useState<AccentColor>(
    (localStorage.getItem('nexus-accent') as AccentColor) || 'blue'
  );

  useEffect(() => {
    localStorage.setItem('nexus-accent', accentColor);
    
    // Clear legacy theme settings
    if (localStorage.getItem('nexus-theme')) {
      localStorage.removeItem('nexus-theme');
    }

    const root = window.document.documentElement;
    
    // Ensure Dark Mode is always disabled
    root.classList.remove('dark');

    // Handle Accent Color
    const palette = ACCENT_PALETTES[accentColor];
    
    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `${r} ${g} ${b}`;
    };

    Object.entries(palette).forEach(([shade, hex]) => {
      root.style.setProperty(`--primary-${shade}`, hexToRgb(hex));
    });
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
