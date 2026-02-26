import type { ReactNode } from 'react';

interface OnboardingStepProps {
  title: string;
  description: string;
  children?: ReactNode;
}

// FEAT-1.4: Reusable onboarding step component
export function OnboardingStep({ title, description, children }: OnboardingStepProps) {
  return (
    <div className="flex flex-col items-center gap-lg w-full">
      <div className="text-center">
        <h2 className="text-xl font-bold text-primary">{title}</h2>
        <p className="mt-sm text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
      {children && <div className="w-full">{children}</div>}
    </div>
  );
}
