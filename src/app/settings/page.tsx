'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { logoutUser } from '@/services/authService';
import {
  useSettingsStore,
  type Theme,
  type FontSize,
  type LayoutPosition,
} from '@/stores/settingsStore';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
];

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'small', label: '작게' },
  { value: 'medium', label: '보통' },
  { value: 'large', label: '크게' },
];

const LAYOUT_OPTIONS: { value: LayoutPosition; label: string }[] = [
  { value: 'left', label: '왼쪽' },
  { value: 'center', label: '중앙' },
  { value: 'wide', label: '넓게' },
];

function ToggleGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex flex-col gap-xs">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <div className="flex rounded-md border border-border overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-sm py-xs text-sm font-medium transition-colors ${
              value === opt.value
                ? 'bg-primary text-white'
                : 'bg-surface text-text-secondary hover:bg-primary-light'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, isAuthenticated, refreshToken, clearAuth } = useAuthStore();
  const { theme, fontSize, layoutPosition, setTheme, setFontSize, setLayoutPosition } =
    useSettingsStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      if (refreshToken) {
        await logoutUser(refreshToken);
      }
    } catch {
      // 로그아웃 API 실패해도 로컬 상태는 초기화
    } finally {
      clearAuth();
      setIsLoggingOut(false);
      router.push('/');
    }
  };

  return (
    <div className="flex flex-col items-center gap-lg py-xl">
      <h1 className="text-2xl font-bold text-text-primary">설정</h1>

      <Card className="w-full max-w-2xl">
        <h2 className="mb-md text-lg font-semibold text-text-primary">계정</h2>
        {isAuthenticated && user ? (
          <div className="flex flex-col gap-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-text-primary">{user.nickname}</p>
                <p className="text-sm text-text-secondary">{user.email}</p>
              </div>
            </div>
            <Button variant="secondary" size="md" onClick={handleLogout} disabled={isLoggingOut}>
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            <p className="text-sm text-text-secondary">
              로그인하면 묵상 노트를 저장하고 분석 기록을 관리할 수 있습니다.
            </p>
            <div className="flex gap-sm">
              <Button
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => router.push('/login')}
              >
                로그인
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="flex-1"
                onClick={() => router.push('/register')}
              >
                회원가입
              </Button>
            </div>
          </div>
        )}
      </Card>

      {mounted && (
        <Card className="w-full max-w-2xl">
          <h2 className="mb-md text-lg font-semibold text-text-primary">화면 설정</h2>
          <div className="flex flex-col gap-md">
            <ToggleGroup label="테마" options={THEME_OPTIONS} value={theme} onChange={setTheme} />
            <ToggleGroup
              label="글꼴 크기"
              options={FONT_SIZE_OPTIONS}
              value={fontSize}
              onChange={setFontSize}
            />
            <ToggleGroup
              label="레이아웃"
              options={LAYOUT_OPTIONS}
              value={layoutPosition}
              onChange={setLayoutPosition}
            />
          </div>
        </Card>
      )}

      <Card className="w-full max-w-2xl">
        <h2 className="mb-md text-lg font-semibold text-text-primary">앱 정보</h2>
        <div className="flex flex-col gap-sm text-sm text-text-secondary">
          <div className="flex justify-between">
            <span>버전</span>
            <span>0.0.1</span>
          </div>
          <div className="flex justify-between">
            <span>신학적 기준</span>
            <span>개혁신학</span>
          </div>
          <div className="flex justify-between">
            <span>해석 방법론</span>
            <span>문법-역사적 해석</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
