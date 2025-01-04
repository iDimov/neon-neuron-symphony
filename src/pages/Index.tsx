import React from 'react';
import { NeuralBackground } from '../components/NeuralBackground';
import { Hero } from '../components/Hero';

const Index = () => {
  return (
    <main className="relative min-h-screen overflow-hidden bg-neural-bg">
      <NeuralBackground />
      <Hero />
    </main>
  );
};

export default Index;