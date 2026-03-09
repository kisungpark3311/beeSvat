'use client';

import { Header } from './Header';
import { BottomNav } from './BottomNav';
import SettingsPanel from '@/components/settings/SettingsPanel';
import { useSettingsEffect } from '@/hooks/useSettingsEffect';

// FEAT-0: Main layout wrapper
export function MainLayout({ children }: { children: React.ReactNode }) {
  useSettingsEffect();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="layout-main mx-auto w-full flex-1 px-md pb-3xl md:pb-md">{children}</main>
      <BottomNav />
      <SettingsPanel />
    </div>
  );
}
