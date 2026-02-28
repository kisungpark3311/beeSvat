import Card from '@/components/ui/Card';
import type { AnalysisInterpretation } from '@contracts/analysis.contract';

interface InterpretationPanelProps {
  interpretation: AnalysisInterpretation;
}

export default function InterpretationPanel({ interpretation }: InterpretationPanelProps) {
  return (
    <Card>
      <h3 className="mb-md text-base font-bold text-text-primary">
        해석 (본문은 무엇을 의미하는가?)
      </h3>

      {/* 핵심 신학적 메시지 */}
      <div className="mb-md">
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">핵심 신학적 메시지</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {interpretation.theologicalMessage}
        </p>
      </div>

      {/* 역사적/문화적 배경 */}
      <div className="mb-md">
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">역사적/문화적 배경</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {interpretation.historicalBackground}
        </p>
      </div>

      {/* 구속사 관점 */}
      <div>
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">구속사 관점</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {interpretation.redemptiveHistory}
        </p>
      </div>
    </Card>
  );
}
