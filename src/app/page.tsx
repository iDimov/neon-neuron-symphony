import { Hero } from '@/components/Hero';
import { CorePrinciples } from '@/components/CorePrinciples';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-[#030409]">
      <div className="relative z-10">
        <Hero />
        <CorePrinciples />
      </div>
    </main>
  );
} 