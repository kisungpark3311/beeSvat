'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

// FEAT-0: Main header component
export function Header() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-md">
        <Link href="/" className="text-xl font-bold text-primary">
          beeSvat
        </Link>
        <nav className="hidden items-center gap-lg md:flex">
          <Link
            href="/analysis"
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            구문 분석
          </Link>
          <Link
            href="/meditation"
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            묵상 노트
          </Link>
          <Link
            href="/settings"
            className="text-sm text-text-secondary hover:text-primary transition-colors"
          >
            설정
          </Link>
          {isAuthenticated ? (
            <span className="text-sm font-medium text-primary">{user?.nickname}</span>
          ) : (
            <Link
              href="/settings"
              className="rounded-md bg-primary px-md py-xs text-sm text-white hover:bg-primary-hover transition-colors"
            >
              게스트
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
