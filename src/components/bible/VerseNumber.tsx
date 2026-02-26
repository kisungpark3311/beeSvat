// FEAT-5.2: Verse number indicator (superscript style)

export default function VerseNumber({ number }: { number: number }) {
  return <sup className="mr-1 font-mono text-xs text-text-secondary">{number}</sup>;
}
