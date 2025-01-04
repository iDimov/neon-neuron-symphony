import React from 'react';
import { Button } from './ui/button';

export const Hero = () => {
  return (
    <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-3xl mx-auto">
        <div className="space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neural-primary via-neural-secondary to-neural-accent">
            Neural Fusion
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed">
            Where artificial intelligence meets infinite possibilities. Experience the next
            generation of cognitive computing.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Button
            className="bg-neural-primary hover:bg-neural-primary/90 text-white px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105"
          >
            Explore AI
          </Button>
          <Button
            variant="outline"
            className="border-neural-secondary text-neural-secondary hover:bg-neural-secondary/10 px-8 py-6 text-lg rounded-full transition-all duration-300 hover:scale-105"
          >
            Learn More
          </Button>
        </div>
      </div>
    </div>
  );
};