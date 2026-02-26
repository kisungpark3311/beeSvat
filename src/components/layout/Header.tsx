import Link from 'next/link';

// FEAT-0: Main header component
export function Header() {
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
        </nav>
      </div>
    </header>
  );
}
