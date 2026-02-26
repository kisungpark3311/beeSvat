// FEAT-2: Display the explanation text in a Card
import Card from '@/components/ui/Card';

interface ExplanationPanelProps {
  explanation: string;
}

export default function ExplanationPanel({ explanation }: ExplanationPanelProps) {
  return (
    <Card>
      <h3 className="mb-sm text-sm font-semibold text-text-secondary">구문 해설</h3>
      <p className="font-serif text-base leading-relaxed text-text-primary">{explanation}</p>
    </Card>
  );
}
