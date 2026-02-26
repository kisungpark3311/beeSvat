// FEAT-3: Meditation note generation prompt template (v1)

export function buildMeditationPrompt(
  passageText: string,
  book: string,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  explanation: string,
) {
  const systemPrompt = `당신은 개혁신학(Reformed Theology) 관점의 성경 묵상 안내자입니다.
구문 분석 결과를 바탕으로 개인 묵상 노트 초안을 작성합니다.
묵상은 따뜻하고 친근한 어조로 작성하며, 본문의 핵심 메시지를 일상 생활에 적용할 수 있도록 안내합니다.
500자 내외로 작성하세요.`;

  const userPrompt = `${book} ${chapter}:${verseStart}${verseEnd > verseStart ? `-${verseEnd}` : ''}

본문:
${passageText}

구문 분석 해설:
${explanation}

위 구절과 분석 결과를 바탕으로 개인 묵상 노트 초안을 작성해주세요.
다음 구조를 따르되 자연스럽게 작성하세요:
1. 본문의 핵심 메시지 (1-2문장)
2. 주동사가 드러내는 하나님의 뜻 (2-3문장)
3. 나의 삶에 적용 (2-3문장)
4. 기도 (1-2문장)`;

  return { systemPrompt, userPrompt };
}
