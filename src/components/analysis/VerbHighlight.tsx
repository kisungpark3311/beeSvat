// FEAT-2: Inline highlight component for main verbs

interface VerbHighlightProps {
  word: string;
  meaning: string;
  original: string;
  onClick?: () => void;
}

export default function VerbHighlight({ word, meaning, original, onClick }: VerbHighlightProps) {
  return (
    <span
      className={[
        'rounded-sm bg-syntax-verb-bg text-syntax-verb font-semibold underline px-xs',
        onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      title={`${meaning} (${original})`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {word}
    </span>
  );
}
