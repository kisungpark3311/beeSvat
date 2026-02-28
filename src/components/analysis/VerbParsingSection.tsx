// FEAT-2: BibleWorks-style verb parsing display section
import type { MainVerb } from '@contracts/analysis.contract';
import Card from '@/components/ui/Card';

interface VerbParsingSectionProps {
  mainVerbs: MainVerb[];
}

function VerbCard({ verb, index }: { verb: MainVerb; index: number }) {
  return (
    <div className="rounded-lg border border-border bg-background p-md">
      {/* Header */}
      <h4 className="mb-md text-base font-bold text-primary">
        주동사 {index + 1}: {verb.original} &ldquo;{verb.word}&rdquo;
        {verb.verseReference && (
          <span className="ml-1 text-sm font-normal text-text-secondary">
            ({verb.verseReference})
          </span>
        )}
      </h4>

      {/* Original word */}
      <div className="mb-md">
        <h5 className="mb-xs text-sm font-semibold text-text-primary">원문</h5>
        <ul className="ml-md list-disc text-sm text-text-primary space-y-xs">
          <li>
            <strong>헬라어/히브리어</strong>: {verb.original}
            {verb.transliteration && (
              <span className="text-text-secondary"> ({verb.transliteration})</span>
            )}
          </li>
          {verb.transliteration && (
            <li>
              <strong>음역</strong>: {verb.transliteration}
            </li>
          )}
        </ul>
      </div>

      {/* Parsing table */}
      {verb.parsing && (
        <div className="mb-md">
          <h5 className="mb-sm text-sm font-semibold text-text-primary">파싱 분석</h5>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-xs px-sm text-left font-semibold text-text-secondary bg-surface">
                    항목
                  </th>
                  <th className="py-xs px-sm text-left font-semibold text-text-secondary bg-surface">
                    값
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="py-xs px-sm font-medium text-text-primary">법(Mood)</td>
                  <td className="py-xs px-sm text-text-primary">{verb.parsing.mood}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-xs px-sm font-medium text-text-primary">시상(Tense)</td>
                  <td className="py-xs px-sm text-text-primary">{verb.parsing.tense}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-xs px-sm font-medium text-text-primary">태(Voice)</td>
                  <td className="py-xs px-sm text-text-primary">{verb.parsing.voice}</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="py-xs px-sm font-medium text-text-primary">인칭/수</td>
                  <td className="py-xs px-sm text-text-primary">{verb.parsing.personNumber}</td>
                </tr>
                {verb.parsing.specialForm && (
                  <tr className="border-b border-border">
                    <td className="py-xs px-sm font-medium text-text-primary">특수 형태</td>
                    <td className="py-xs px-sm text-text-primary">{verb.parsing.specialForm}</td>
                  </tr>
                )}
                <tr>
                  <td className="py-xs px-sm font-medium text-text-primary">원형</td>
                  <td className="py-xs px-sm text-text-primary">
                    {verb.original}
                    {verb.meaning && (
                      <span className="text-text-secondary">
                        {' '}
                        ({verb.meaning.split('.')[0]?.split(',').slice(0, 3).join(', ')})
                      </span>
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contextual meaning */}
      {verb.contextualMeaning && (
        <div className="mb-md">
          <h5 className="mb-xs text-sm font-semibold text-text-primary">문맥적 의미</h5>
          <p className="text-sm text-text-primary leading-relaxed">{verb.contextualMeaning}</p>
        </div>
      )}

      {/* Modern Korean */}
      {verb.modernKorean && (
        <div className="mb-md">
          <h5 className="mb-xs text-sm font-semibold text-text-primary">현대 한글 해석</h5>
          <p className="text-sm text-text-primary">{verb.modernKorean}</p>
        </div>
      )}

      {/* Theological implication */}
      {verb.theologicalImplication && (
        <div>
          <h5 className="mb-xs text-sm font-semibold text-text-primary">신학적 함의</h5>
          <p className="text-sm text-text-primary leading-relaxed">{verb.theologicalImplication}</p>
        </div>
      )}
    </div>
  );
}

export default function VerbParsingSection({ mainVerbs }: VerbParsingSectionProps) {
  if (!mainVerbs || mainVerbs.length === 0) return null;

  return (
    <Card>
      <h3 className="mb-md text-lg font-bold text-text-primary">주동사 파싱 분석 (BibleWorks)</h3>
      <div className="flex flex-col gap-md">
        {mainVerbs.map((verb, index) => (
          <VerbCard key={index} verb={verb} index={index} />
        ))}
      </div>
    </Card>
  );
}
