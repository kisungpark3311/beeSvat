// FEAT-2: Grammatical analysis table for verb detail

interface GrammarEntry {
  tense: string | null;
  voice: string | null;
  mood: string | null;
  person: string | null;
  number: string | null;
  binyan: string | null;
}

interface GrammarTableProps {
  grammar: GrammarEntry;
  language: 'hebrew' | 'greek';
}

interface GrammarRow {
  label: string;
  labelEn: string;
  value: string | null;
}

export default function GrammarTable({ grammar, language }: GrammarTableProps) {
  const rows: GrammarRow[] = [
    { label: '\uC2DC\uC81C', labelEn: 'Tense', value: grammar.tense },
    { label: '\uD0DC', labelEn: 'Voice', value: grammar.voice },
    { label: '\uBC95', labelEn: 'Mood', value: grammar.mood },
    { label: '\uC778\uCE6D', labelEn: 'Person', value: grammar.person },
    { label: '\uC218', labelEn: 'Number', value: grammar.number },
  ];

  // Binyan is only relevant for Hebrew
  if (language === 'hebrew') {
    rows.push({ label: '\uBE48\uC580', labelEn: 'Binyan', value: grammar.binyan });
  }

  return (
    <div className="overflow-hidden rounded-md border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface">
            <th className="px-md py-sm text-left font-medium text-text-secondary">
              {'\uBB38\uBC95 \uD56D\uBAA9'}
            </th>
            <th className="px-md py-sm text-left font-medium text-text-secondary">{'\uAC12'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.labelEn} className={index % 2 === 0 ? 'bg-background' : 'bg-surface'}>
              <td className="px-md py-sm font-medium text-text-primary">
                {row.label} <span className="text-xs text-text-secondary">({row.labelEn})</span>
              </td>
              <td className="px-md py-sm">
                {row.value ? (
                  <span className="text-text-primary">{row.value}</span>
                ) : (
                  <span className="text-text-secondary">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
