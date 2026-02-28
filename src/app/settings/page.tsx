'use client';

import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { logoutUser } from '@/services/authService';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function SettingsPage() {
  const { user, isAuthenticated, refreshToken, clearAuth } = useAuthStore();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
          <div className="flex flex-col gap-sm">
            <p className="text-sm text-text-secondary">
              현재 게스트 모드로 사용 중입니다. 분석 기능은 로그인 없이도 이용 가능합니다.
            </p>
            <Button variant="primary" size="md" onClick={() => router.push('/')}>
              홈으로 이동
            </Button>
          </div>
        )}
      </Card>

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
