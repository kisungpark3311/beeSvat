// FEAT-1.4: Sample syntax analysis display for onboarding
export function SampleAnalysis() {
  return (
    <div className="flex flex-col gap-md w-full">
      {/* Verse reference */}
      <p className="text-sm font-medium text-text-secondary text-center">요한복음 3:16</p>

      {/* Analyzed verse with syntax highlighting */}
      <div className="rounded-lg border border-border bg-surface p-md font-serif text-base leading-loose">
        <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">하나님이</span> 세상을{' '}
        <span className="rounded-sm bg-syntax-modifier-bg text-syntax-modifier px-xs">이처럼</span>{' '}
        <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">사랑하사</span>{' '}
        <span className="rounded-sm bg-syntax-modifier-bg text-syntax-modifier px-xs">
          독생자를
        </span>{' '}
        <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">주셨으니</span>{' '}
        <span className="rounded-sm bg-syntax-connector-bg text-syntax-connector px-xs">이는</span>{' '}
        그를 <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">믿는</span>{' '}
        자마다{' '}
        <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">멸망하지 않고</span>{' '}
        <span className="rounded-sm bg-syntax-modifier-bg text-syntax-modifier px-xs">영생을</span>{' '}
        <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">
          얻게 하려 하심이라
        </span>
      </div>

      {/* Brief explanation */}
      <p className="text-xs text-text-secondary leading-relaxed text-center">
        구문 분석을 통해 성경 본문의 주요 동사, 수식어, 접속어를 시각적으로 구분하여 본문의 구조와
        의미를 더 깊이 이해할 수 있습니다.
      </p>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-md text-xs">
        <div className="flex items-center gap-xs">
          <span className="inline-block h-3 w-3 rounded-sm bg-syntax-verb-bg border border-syntax-verb" />
          <span className="text-text-secondary">동사(서술어)</span>
        </div>
        <div className="flex items-center gap-xs">
          <span className="inline-block h-3 w-3 rounded-sm bg-syntax-modifier-bg border border-syntax-modifier" />
          <span className="text-text-secondary">수식어(목적어)</span>
        </div>
        <div className="flex items-center gap-xs">
          <span className="inline-block h-3 w-3 rounded-sm bg-syntax-connector-bg border border-syntax-connector" />
          <span className="text-text-secondary">접속어</span>
        </div>
      </div>
    </div>
  );
}
