import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';
export type FontSize = 'small' | 'medium' | 'large';
export type LayoutPosition = 'center' | 'left' | 'wide';

interface SettingsState {
  theme: Theme;
  fontSize: FontSize;
  layoutPosition: LayoutPosition;
  setTheme: (theme: Theme) => void;
  setFontSize: (fontSize: FontSize) => void;
  setLayoutPosition: (position: LayoutPosition) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'light',
      fontSize: 'medium',
      layoutPosition: 'center',
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setLayoutPosition: (position) => set({ layoutPosition: position }),
    }),
    { name: 'beesvat-settings' },
  ),
);
