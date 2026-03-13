'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';

// FEAT-0: Main header component
export function Header() {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    nickname: string | undefined;
  } | null>(null);

  useEffect(() => {
    // 클라이언트 마운트 후에만 auth 상태를 읽어 Hydration 불일치 방지
    const unsubscribe = useAuthStore.subscribe((state) => {
      setAuthState({ isAuthenticated: state.isAuthenticated, nickname: state.user?.nickname });
    });
    const current = useAuthStore.getState();
    setAuthState({ isAuthenticated: current.isAuthenticated, nickname: current.user?.nickname });
    return unsubscribe;
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-screen-xl items-center justify-between px-md">
        <Link href="/" className="text-xl font-bold text-primary">
          BeeSvat
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
          {authState &&
            (authState.isAuthenticated ? (
              <span className="text-sm font-medium text-primary">{authState.nickname}</span>
            ) : (
              <>
                <Link
                  href="/register"
                  className="text-sm text-text-secondary hover:text-primary transition-colors"
                >
                  회원가입
                </Link>
                <Link
                  href="/login"
                  className="rounded-md bg-primary px-md py-xs text-sm text-white hover:bg-primary-hover transition-colors"
                >
                  로그인
                </Link>
              </>
            ))}
        </nav>
      </div>
    </header>
  );
}
