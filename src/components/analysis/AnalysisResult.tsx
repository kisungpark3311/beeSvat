'use client';

// FEAT-2: Display full analysis result with highlighted syntax elements
import { useState, useCallback } from 'react';
import type { AnalysisDetail } from '@contracts/analysis.contract';
import VerbHighlight from '@/components/analysis/VerbHighlight';
import ModifierHighlight from '@/components/analysis/ModifierHighlight';
import ExplanationPanel from '@/components/analysis/ExplanationPanel';
import SyntaxLegend from '@/components/analysis/SyntaxLegend';
import VerbDetailPanel from '@/components/analysis/VerbDetailPanel';
import Card from '@/components/ui/Card';

interface SelectedVerb {
  word: string;
  original: string;
  meaning: string;
  analysisResultId: string;
}

interface AnalysisResultProps {
  analysis: AnalysisDetail;
}

export default function AnalysisResult({ analysis }: AnalysisResultProps) {
  const { result } = analysis;
  const [selectedVerb, setSelectedVerb] = useState<SelectedVerb | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleVerbClick = useCallback(
    (verb: { word: string; original: string; meaning: string }) => {
      setSelectedVerb({
        word: verb.word,
        original: verb.original,
        meaning: verb.meaning,
        analysisResultId: result?.id ?? '',
      });
      setIsPanelOpen(true);
    },
    [result?.id],
  );

  const handlePanelClose = useCallback(() => {
    setIsPanelOpen(false);
  }, []);

  if (!result) {
    return (
      <Card className="flex flex-col items-center gap-md py-xl">
        <span
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
          role="status"
          aria-label="loading"
        />
        <p className="text-text-secondary">구문 분석 중입니다...</p>
        <p className="text-xs text-text-secondary">잠시만 기다려 주세요</p>
      </Card>
    );
  }

  const { mainVerbs, modifiers, connectors, structure } = result;

  // Build a position-based lookup for highlighting
  const verbMap = new Map(mainVerbs.map((v) => [v.position, v]));
  const modifierMap = new Map(modifiers.map((m) => [m.position, m]));
  const connectorMap = new Map(connectors.map((c) => [c.position, c]));

  return (
    <div className="flex flex-col gap-lg">
      {/* Verse reference */}
      <div className="text-center">
        <p className="text-sm font-medium text-text-secondary">
          {analysis.book} {analysis.chapter}:{analysis.verseStart}
          {analysis.verseEnd > analysis.verseStart ? `-${analysis.verseEnd}` : ''}
        </p>
      </div>

      {/* Highlighted passage */}
      <Card>
        <div className="font-serif text-base leading-loose">
          {structure.parsed.map((word, index) => {
            const verb = verbMap.get(index);
            if (verb) {
              return (
                <span key={index}>
                  <VerbHighlight
                    word={verb.word}
                    meaning={verb.meaning}
                    original={verb.original}
                    onClick={() => handleVerbClick(verb)}
                  />{' '}
                </span>
              );
            }

            const modifier = modifierMap.get(index);
            if (modifier) {
              return (
                <span key={index}>
                  <ModifierHighlight word={modifier.word} type={modifier.type} />{' '}
                </span>
              );
            }

            const connector = connectorMap.get(index);
            if (connector) {
              return (
                <span key={index}>
                  <span className="rounded-sm bg-syntax-connector-bg text-syntax-connector px-xs">
                    {connector.word}
                  </span>{' '}
                </span>
              );
            }

            return <span key={index}>{word} </span>;
          })}
        </div>
      </Card>

      {/* Syntax legend */}
      <SyntaxLegend />

      {/* Explanation */}
      <ExplanationPanel explanation={result.explanation} />

      {/* Processing info */}
      <p className="text-xs text-text-secondary text-right">
        AI: {result.aiModel} / {result.processingTimeMs}ms
      </p>

      {/* Verb detail panel */}
      {selectedVerb && (
        <VerbDetailPanel verb={selectedVerb} isOpen={isPanelOpen} onClose={handlePanelClose} />
      )}
    </div>
  );
}
