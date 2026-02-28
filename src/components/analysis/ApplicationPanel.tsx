import Card from '@/components/ui/Card';
import type { AnalysisApplication } from '@contracts/analysis.contract';

interface ApplicationPanelProps {
  application: AnalysisApplication;
}

export default function ApplicationPanel({ application }: ApplicationPanelProps) {
  return (
    <Card>
      <h3 className="mb-md text-base font-bold text-text-primary">
        적용 (나는 어떻게 살아야 하는가?)
      </h3>

      {/* 영적 원리 */}
      {application.principles.length > 0 && (
        <div className="mb-md">
          <h4 className="mb-xs text-sm font-semibold text-text-secondary">시대 초월적 영적 원리</h4>
          <ol className="list-decimal list-inside text-sm text-text-primary space-y-xs">
            {application.principles.map((p, i) => (
              <li key={i} className="leading-relaxed">
                {p}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 개인 적용 */}
      <div className="mb-md">
        <h4 className="mb-xs text-sm font-semibold text-text-secondary">개인적 삶의 적용</h4>
        <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
          {application.personalApplication}
        </p>
      </div>

      {/* 설교 포인트 */}
      {application.pastoralPoints.length > 0 && (
        <div className="mb-md">
          <h4 className="mb-xs text-sm font-semibold text-text-secondary">설교 포인트</h4>
          <ol className="list-decimal list-inside text-sm text-text-primary space-y-xs">
            {application.pastoralPoints.map((p, i) => (
              <li key={i} className="leading-relaxed">
                {p}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 실천 계획 */}
      {application.practicePlan && (
        <div className="mb-md">
          <h4 className="mb-xs text-sm font-semibold text-text-secondary">구체적 실천 계획</h4>
          {application.practicePlan.weekly && application.practicePlan.weekly.length > 0 && (
            <div className="mb-xs">
              <span className="text-xs font-medium text-text-secondary">이번 주:</span>
              <ul className="list-disc list-inside text-sm text-text-primary ml-sm">
                {application.practicePlan.weekly.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          {application.practicePlan.monthly && (
            <div className="mb-xs">
              <span className="text-xs font-medium text-text-secondary">이번 달:</span>
              <p className="text-sm text-text-primary ml-sm">{application.practicePlan.monthly}</p>
            </div>
          )}
          {application.practicePlan.longTerm && (
            <div>
              <span className="text-xs font-medium text-text-secondary">장기 목표:</span>
              <p className="text-sm text-text-primary ml-sm">{application.practicePlan.longTerm}</p>
            </div>
          )}
        </div>
      )}

      {/* 교회 공동체 메시지 */}
      {application.communityMessage && (
        <div>
          <h4 className="mb-xs text-sm font-semibold text-text-secondary">
            교회공동체에 대한 메시지
          </h4>
          <p className="font-serif text-sm leading-relaxed text-text-primary whitespace-pre-line">
            {application.communityMessage}
          </p>
        </div>
      )}
    </Card>
  );
}
