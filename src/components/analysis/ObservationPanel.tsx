import Card from '@/components/ui/Card';
import type { AnalysisObservation } from '@contracts/analysis.contract';

interface ObservationPanelProps {
  observation: AnalysisObservation;
}

export default function ObservationPanel({ observation }: ObservationPanelProps) {
  return (
    <Card>
      <h3 className="mb-md text-base font-bold text-text-primary">
        관찰 (본문은 무엇을 말하는가?)
      </h3>

      {/* 본문 구성과 흐름 */}
      <div className="mb-md">
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">본문의 구성과 진행</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {observation.structureFlow}
        </p>
      </div>

      {/* 핵심 어휘 테이블 */}
      {observation.keywords.length > 0 && (
        <div className="mb-md">
          <h4 className="mb-xs text-sm font-semibold text-text-secondary">주요 단어와 반복 표현</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-xs px-sm text-left font-medium text-text-secondary">단어</th>
                  <th className="py-xs px-sm text-center font-medium text-text-secondary">횟수</th>
                  <th className="py-xs px-sm text-left font-medium text-text-secondary">의미</th>
                </tr>
              </thead>
              <tbody>
                {observation.keywords.map((kw, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-xs px-sm font-medium">{kw.word}</td>
                    <td className="py-xs px-sm text-center">{kw.count}</td>
                    <td className="py-xs px-sm text-text-secondary">{kw.meaning}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 문맥 */}
      <div className="mb-md">
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">문맥 상황과 배경</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {observation.context}
        </p>
      </div>

      {/* 평행 구절 */}
      {observation.parallelPassages.length > 0 && (
        <div>
          <h4 className="mb-xs text-sm font-semibold text-text-secondary">평행 구절</h4>
          <ul className="list-disc list-inside text-sm text-text-primary space-y-xs">
            {observation.parallelPassages.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
