import React from 'react';
import { Hero } from '../components/Hero';
import { CorePrinciples } from '../components/CorePrinciples';
import { NetworkVisualization } from '../components/NetworkVisualization';
import { HeroAnimation } from '@/components/HeroAnimation';
import AnimatedLearningMethods from '@/components/AnimatedLearningMethods';
import { CorePrinciplesAlt } from '@/components/CorePrinciplesAlt';
import { DemoSection } from '@/components/DemoSection';
import { VideoPanel } from '@/components/VideoPanel';
import { NeuralBackground } from '@/components/NeuralBackground';

const DEMO_SECTIONS = [
  {
    title: "Planning Your Journey",
    description: "Set clear goals, organize study schedules, and track daily progress with our comprehensive planning tools. Perfect for IT professionals looking to enhance their English communication skills."
  },
  {
    title: "Interactive Learning Hub",
    description: "Access our Academy for structured lessons, practice real-world scenarios in our Lab, and build your IT vocabulary through interactive exercises tailored for tech professionals."
  },
  {
    title: "Progress Tracking & Analytics",
    description: "Monitor your learning journey with detailed statistics, maintain a personal learning journal, and track completed activities to stay motivated and focused."
  },
  {
    title: "Global Tech Community",
    description: "Connect with fellow IT professionals worldwide, join live learning sessions, and find practice partners to improve your English communication skills in a tech-focused environment."
  }
];

const Index = () => {
  const [activeSection, setActiveSection] = React.useState(0);
  const [videoKey, setVideoKey] = React.useState(0);

  const handleSectionComplete = () => {
    setActiveSection((prev) => (prev + 1) % DEMO_SECTIONS.length);
  };

  const handleSectionClick = (index: number) => {
    setActiveSection(index);
    setVideoKey(prev => prev + 1);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-neural-bg">
      {/* <NeuralBackground /> */}
      <Hero />
      <CorePrinciplesAlt />
      
      {/* Demo Section */}
      <section className="relative py-32">
        <div className="max-w-[1400px] mx-auto px-8">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 
                         border border-purple-500/20 rounded-full bg-purple-500/10">
              <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 
                           bg-clip-text text-transparent">
                How it works. Quick Tour
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r 
                         from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8
                         tracking-tight leading-[1.1]">
             Your English Evolution: <br /> A Quick Overview
            </h2>
            <p className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto">
              Discover how our AI-Powered Platform Make Learning Engaging and Practical.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Panel - Fixed width */}
            <div className="w-full lg:w-[300px] space-y-6 flex-shrink-0">
              {DEMO_SECTIONS.map((section, index) => (
                <DemoSection
                  key={index}
                  title={section.title}
                  description={section.description}
                  isActive={activeSection === index}
                  onComplete={handleSectionComplete}
                  onClick={() => handleSectionClick(index)}
                  className="transition-all duration-300 hover:transform hover:scale-[1.02] border border-transparent hover:border-demo-purple/30 shadow-lg hover:shadow-demo-purple/20"
                />
              ))}
            </div>
            
            {/* Right Panel - Video with aspect ratio */}
            <div className="flex-1 relative">
              <div className="w-full pt-[56.25%] relative">
                <div className="absolute inset-0 rounded-xl overflow-hidden shadow-2xl border border-demo-purple/20 backdrop-blur-sm animate-fade-in opacity-0" style={{ animationDelay: '0.4s' }}>
                  <VideoPanel 
                    key={videoKey} 
                    activeSection={activeSection} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;