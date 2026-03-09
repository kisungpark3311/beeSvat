'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

// 설정 변경 시 DOM에 반영
export function useSettingsEffect() {
  const { theme, fontSize, layoutPosition } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;
    // 테마
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    // 글꼴 크기
    root.classList.remove('font-small', 'font-medium', 'font-large');
    root.classList.add(`font-${fontSize}`);
  }, [fontSize]);

  useEffect(() => {
    const root = document.documentElement;
    // 레이아웃 포지션
    root.classList.remove('layout-center', 'layout-left', 'layout-wide');
    root.classList.add(`layout-${layoutPosition}`);
  }, [layoutPosition]);
}
