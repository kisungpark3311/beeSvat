// FEAT-1.5 + FEAT-5.2: Home page with TodayQT and verse input area
import Card from '@/components/ui/Card';
import VerseInputForm from '@/components/bible/VerseInputForm';
import TodayQT from '@/components/bible/TodayQT';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center gap-lg py-xl">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">beeSvat</h1>
        <p className="mt-sm text-text-secondary">
          성경 구절을 입력하면 구문 구조를 자동으로 분석합니다
        </p>
      </div>
      <div className="w-full max-w-2xl">
        <TodayQT />
      </div>
      <Card className="w-full max-w-2xl">
        <h2 className="mb-md text-xl font-semibold text-text-primary">성경 구문 분석</h2>
        <VerseInputForm />
      </Card>
    </div>
  );
}
