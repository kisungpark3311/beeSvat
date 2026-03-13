// FEAT-1.4: Sample syntax analysis display for onboarding
export function SampleAnalysis() {
  return (
    <div className="flex flex-col gap-md w-full">
      {/* Verse reference */}
      <p className="text-sm font-medium text-text-secondary text-center">디모데후서 2:1-2</p>

      {/* Analyzed verse with syntax highlighting */}
      <div className="rounded-lg border border-border bg-surface p-md font-serif text-base leading-loose">
        <span className="rounded-sm bg-syntax-modifier-bg text-syntax-modifier px-xs">
          내 아들아
        </span>{' '}
        <span className="rounded-sm bg-syntax-connector-bg text-syntax-connector px-xs">
          그러므로
        </span>{' '}
        너는{' '}
        <span className="rounded-sm bg-syntax-modifier-bg text-syntax-modifier px-xs">
          그리스도 예수 안에 있는 은혜 가운데서
        </span>{' '}
        <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">강하고</span> 또 네가{' '}
        <span className="rounded-sm bg-syntax-modifier-bg text-syntax-modifier px-xs">
          많은 증인 앞에서
        </span>{' '}
        내게 <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">들은</span> 바를{' '}
        <span className="rounded-sm bg-syntax-modifier-bg text-syntax-modifier px-xs">
          충성된 사람들에게
        </span>{' '}
        <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">부탁하라</span> 그들이
        또 다른 사람들을{' '}
        <span className="rounded-sm bg-syntax-verb-bg text-syntax-verb px-xs">
          가르칠 수 있으리라
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
