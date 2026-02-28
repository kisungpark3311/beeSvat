import Card from '@/components/ui/Card';
import type { AnalysisPrayerDedication } from '@contracts/analysis.contract';

interface PrayerDedicationPanelProps {
  prayer: AnalysisPrayerDedication;
}

export default function PrayerDedicationPanel({ prayer }: PrayerDedicationPanelProps) {
  return (
    <Card>
      <h3 className="mb-md text-base font-bold text-text-primary">기도와 헌신</h3>

      {/* 감사 */}
      <div className="mb-md">
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">감사</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {prayer.thanksgiving}
        </p>
      </div>

      {/* 고백 */}
      <div className="mb-md">
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">고백</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {prayer.confession}
        </p>
      </div>

      {/* 중보기도 */}
      <div className="mb-md">
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">중보기도</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {prayer.intercession}
        </p>
      </div>

      {/* 헌신 서약 */}
      <div>
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">헌신 서약</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary italic whitespace-pre-line">
          {prayer.dedication}
        </p>
      </div>
    </Card>
  );
}
