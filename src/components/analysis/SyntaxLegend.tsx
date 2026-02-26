// FEAT-2: Color legend showing what each highlight color means

export default function SyntaxLegend() {
  return (
    <div className="flex flex-wrap items-center gap-md text-xs">
      <div className="flex items-center gap-xs">
        <span className="inline-block h-3 w-3 rounded-sm bg-syntax-verb-bg border border-syntax-verb" />
        <span className="text-text-secondary">주동사 (Primary)</span>
      </div>
      <div className="flex items-center gap-xs">
        <span className="inline-block h-3 w-3 rounded-sm bg-syntax-modifier-bg border border-syntax-modifier" />
        <span className="text-text-secondary">수식어 (Secondary)</span>
      </div>
      <div className="flex items-center gap-xs">
        <span className="inline-block h-3 w-3 rounded-sm bg-syntax-connector-bg border border-syntax-connector" />
        <span className="text-text-secondary">접속사 (Accent)</span>
      </div>
    </div>
  );
}
