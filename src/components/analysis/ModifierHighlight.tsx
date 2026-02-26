// FEAT-2: Inline highlight component for modifiers

interface ModifierHighlightProps {
  word: string;
  type: string;
}

export default function ModifierHighlight({ word, type }: ModifierHighlightProps) {
  return (
    <span className="rounded-sm bg-syntax-modifier-bg text-syntax-modifier px-xs" title={type}>
      {word}
    </span>
  );
}
