import { describe, it, expect } from 'vitest';
import { buildAnalysisPrompt } from '@/server/prompts/analysis-v1.prompt';

// FEAT-1: Analysis prompt template tests

describe('buildAnalysisPrompt', () => {
  const passageText = '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니';
  const book = '요한복음';
  const chapter = 3;
  const verseStart = 16;
  const verseEnd = 16;

  it('프롬프트 템플릿이 올바른 형식을 생성한다', () => {
    const { systemPrompt, userPrompt } = buildAnalysisPrompt(
      passageText,
      book,
      chapter,
      verseStart,
      verseEnd,
    );

    expect(systemPrompt).toBeDefined();
    expect(userPrompt).toBeDefined();
    expect(typeof systemPrompt).toBe('string');
    expect(typeof userPrompt).toBe('string');
  });

  it('개혁신학 관점 지시문이 시스템 프롬프트에 포함된다', () => {
    const { systemPrompt } = buildAnalysisPrompt(passageText, book, chapter, verseStart, verseEnd);

    expect(systemPrompt).toContain('개혁신학');
    expect(systemPrompt).toContain('Reformed Theology');
    expect(systemPrompt).toContain('주동사');
    expect(systemPrompt).toContain('수식어');
    expect(systemPrompt).toContain('접속사');
  });

  it('사용자 프롬프트에 본문 텍스트가 포함된다', () => {
    const { userPrompt } = buildAnalysisPrompt(passageText, book, chapter, verseStart, verseEnd);

    expect(userPrompt).toContain(passageText);
    expect(userPrompt).toContain(book);
  });

  it('단일 절 범위가 올바르게 포맷된다', () => {
    const { userPrompt } = buildAnalysisPrompt(passageText, book, chapter, 16, 16);

    expect(userPrompt).toContain('요한복음 3:16');
    expect(userPrompt).not.toContain('16-16');
  });

  it('복수 절 범위가 올바르게 포맷된다', () => {
    const { userPrompt } = buildAnalysisPrompt(passageText, book, chapter, 16, 18);

    expect(userPrompt).toContain('요한복음 3:16-18');
  });

  it('프롬프트에 JSON 형식 지시가 포함된다', () => {
    const { systemPrompt, userPrompt } = buildAnalysisPrompt(
      passageText,
      book,
      chapter,
      verseStart,
      verseEnd,
    );

    expect(systemPrompt).toContain('JSON');
    expect(userPrompt).toContain('mainVerbs');
    expect(userPrompt).toContain('modifiers');
    expect(userPrompt).toContain('connectors');
    expect(userPrompt).toContain('structure');
    expect(userPrompt).toContain('explanation');
  });

  it('BibleWorks 스타일 파싱 지시가 포함된다', () => {
    const { systemPrompt, userPrompt } = buildAnalysisPrompt(
      passageText,
      book,
      chapter,
      verseStart,
      verseEnd,
    );

    expect(systemPrompt).toContain('BibleWorks');
    expect(systemPrompt).toContain('법/시상/태/인칭·수');
    expect(userPrompt).toContain('parsing');
    expect(userPrompt).toContain('mood');
    expect(userPrompt).toContain('tense');
    expect(userPrompt).toContain('voice');
    expect(userPrompt).toContain('transliteration');
    expect(userPrompt).toContain('theologicalImplication');
  });

  it('관찰/해석/적용 섹션 지시가 포함된다', () => {
    const { userPrompt } = buildAnalysisPrompt(passageText, book, chapter, verseStart, verseEnd);

    expect(userPrompt).toContain('observation');
    expect(userPrompt).toContain('interpretation');
    expect(userPrompt).toContain('application');
    expect(userPrompt).toContain('parallelPassages');
    expect(userPrompt).toContain('redemptiveHistory');
    expect(userPrompt).toContain('pastoralPoints');
  });
});
