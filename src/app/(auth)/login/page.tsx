import { LoginForm } from '@/components/auth/LoginForm';

// FEAT-0: Login page
export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-2xl">
      <div className="flex flex-col items-center gap-lg w-full px-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">로그인</h1>
          <p className="mt-sm text-sm text-text-secondary">beeSvat에 오신 것을 환영합니다</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
