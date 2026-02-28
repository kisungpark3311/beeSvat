import Card from '@/components/ui/Card';
import type { AnalysisTheologicalReflection } from '@contracts/analysis.contract';

interface TheologicalReflectionPanelProps {
  reflection: AnalysisTheologicalReflection;
}

export default function TheologicalReflectionPanel({
  reflection,
}: TheologicalReflectionPanelProps) {
  return (
    <Card>
      <h3 className="mb-md text-base font-bold text-text-primary">신학적 성찰</h3>

      {/* 핵심 통찰 */}
      <div className="mb-md">
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">핵심 통찰</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {reflection.coreInsight}
        </p>
      </div>

      {/* 개인적 메시지 */}
      <div>
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">저에게 주는 말씀</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary italic whitespace-pre-line">
          {reflection.personalMessage}
        </p>
      </div>
    </Card>
  );
}
