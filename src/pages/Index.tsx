import React from 'react';
import { Hero } from '@/components/Hero';
import { CorePrinciplesAlt } from '@/components/CorePrinciplesAlt';
import { NeuralBackground } from '@/components/NeuralBackground';
import { DemoTour } from '@/components/DemoTour';

export default function Index() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neural-bg">
      <NeuralBackground />
      <Hero />
      <CorePrinciplesAlt />
      <DemoTour />
    </main>
  );
}