'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useSettingsStore,
  type Theme,
  type FontSize,
  type LayoutPosition,
} from '@/stores/settingsStore';

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
      <span className="text-xs font-medium text-text-secondary">{label}</span>
      <div className="flex rounded-md border border-border overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 px-sm py-xs text-xs font-medium transition-colors ${
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

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const { theme, fontSize, layoutPosition, setTheme, setFontSize, setLayoutPosition } =
    useSettingsStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 패널 외부 클릭 시 닫기
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div ref={panelRef} className="fixed bottom-4 left-4 z-40 hidden md:block">
      {isOpen && (
        <div className="mb-2 w-56 rounded-lg border border-border bg-surface p-md shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-200">
          <h3 className="mb-md text-sm font-semibold text-text-primary">설정</h3>
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
        </div>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/80 text-white shadow-md hover:bg-primary transition-all opacity-60 hover:opacity-100"
        aria-label="설정 열기"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  );
}
