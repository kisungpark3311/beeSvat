'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { loginRequestSchema } from '@contracts/auth.contract';
import type { LoginRequest } from '@contracts/auth.contract';
import { loginUser } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

// FEAT-0: Login form component
export function LoginForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginRequestSchema),
  });

  const onSubmit = async (formData: LoginRequest) => {
    setServerError('');
    try {
      const result = await loginUser(formData.email, formData.password);
      setAuth(result.user, result.accessToken, result.refreshToken);
      router.push('/');
    } catch {
      setServerError('이메일 또는 비밀번호가 올바르지 않습니다');
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-md w-full max-w-sm"
      noValidate
    >
      <div className="flex flex-col gap-xs">
        <label htmlFor="email" className="text-sm font-medium text-text-primary">
          이메일
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          {...register('email')}
          className="h-11 rounded-md border border-border bg-background px-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          placeholder="email@example.com"
        />
        {errors.email && <p className="text-xs text-error">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="password" className="text-sm font-medium text-text-primary">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          {...register('password')}
          className="h-11 rounded-md border border-border bg-background px-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          placeholder="비밀번호를 입력하세요"
        />
        {errors.password && <p className="text-xs text-error">{errors.password.message}</p>}
      </div>

      {serverError && (
        <p className="text-sm text-error text-center" role="alert">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-12 rounded-lg bg-primary text-white font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>

      <p className="text-sm text-text-secondary text-center">
        계정이 없으신가요?{' '}
        <Link href="/register" className="text-primary font-medium hover:underline">
          회원가입
        </Link>
      </p>
    </form>
  );
}
