import { RegisterForm } from '@/components/auth/RegisterForm';

// FEAT-0: Registration page
export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center py-2xl">
      <div className="flex flex-col items-center gap-lg w-full px-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary">회원가입</h1>
          <p className="mt-sm text-sm text-text-secondary">성경 구문 분석 도우미에 가입하세요</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
