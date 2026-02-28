// FEAT-5.2: Bible passage viewer with proper typography

import VerseNumber from './VerseNumber';

export interface BibleVerse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

interface BibleViewerProps {
  verses: BibleVerse[];
  book: string;
  chapter: number;
}

export default function BibleViewer({ verses, book, chapter }: BibleViewerProps) {
  return (
    <div className="rounded-lg bg-surface p-lg">
      <h3 className="mb-md text-lg font-semibold text-text-primary">
        {book} {chapter}장
      </h3>
      <div className="font-serif text-lg leading-[2.0] text-text-primary break-keep">
        {verses.map((verse) => (
          <span key={verse.verse}>
            <VerseNumber number={verse.verse} />
            {verse.text}{' '}
          </span>
        ))}
      </div>
    </div>
  );
}
