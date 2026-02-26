'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { registerRequestSchema } from '@contracts/auth.contract';
import type { RegisterRequest } from '@contracts/auth.contract';
import { registerUser } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';

// FEAT-0: Registration form component
export function RegisterForm() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterRequest>({
    resolver: zodResolver(registerRequestSchema),
  });

  const onSubmit = async (formData: RegisterRequest) => {
    setServerError('');
    try {
      const result = await registerUser(formData.email, formData.password, formData.nickname);
      setAuth({ ...result.user, profileImage: null }, result.accessToken, result.refreshToken);
      router.push('/onboarding');
    } catch {
      setServerError('회원가입에 실패했습니다. 다시 시도해주세요.');
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
        <label htmlFor="nickname" className="text-sm font-medium text-text-primary">
          닉네임
        </label>
        <input
          id="nickname"
          type="text"
          autoComplete="nickname"
          {...register('nickname')}
          className="h-11 rounded-md border border-border bg-background px-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          placeholder="2자 이상 닉네임"
        />
        {errors.nickname && <p className="text-xs text-error">{errors.nickname.message}</p>}
      </div>

      <div className="flex flex-col gap-xs">
        <label htmlFor="password" className="text-sm font-medium text-text-primary">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          className="h-11 rounded-md border border-border bg-background px-sm text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          placeholder="8자 이상 비밀번호"
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
        {isSubmitting ? '가입 중...' : '회원가입'}
      </button>

      <p className="text-sm text-text-secondary text-center">
        이미 계정이 있으신가요?{' '}
        <Link href="/login" className="text-primary font-medium hover:underline">
          로그인
        </Link>
      </p>
    </form>
  );
}
