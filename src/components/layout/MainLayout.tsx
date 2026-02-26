import { Header } from './Header';
import { BottomNav } from './BottomNav';

// FEAT-0: Main layout wrapper
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-screen-xl flex-1 px-md pb-3xl md:pb-md">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
