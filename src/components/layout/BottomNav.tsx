'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// FEAT-0: Mobile bottom navigation
const navItems = [
  { href: '/', label: '홈', icon: '📖' },
  { href: '/analysis', label: '분석', icon: '✨' },
  { href: '/meditation', label: '묵상', icon: '✏️' },
  { href: '/settings', label: '설정', icon: '⚙️' },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="flex h-16 items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 text-xs transition-colors ${
                isActive ? 'text-primary font-medium' : 'text-text-secondary'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
