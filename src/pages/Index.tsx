import React from 'react';
import { Hero } from '@/components/Hero';
import { CorePrinciplesAlt } from '@/components/CorePrinciplesAlt';
import { NeuralBackground } from '@/components/NeuralBackground';
import { DemoSection } from '@/components/DemoSection';
import { VideoPanel } from '@/components/VideoPanel';

const DEMO_SECTIONS = [
  {
    title: "Planning Your Journey",
    description: [
      "Personalized learning paths tailored to your IT career goals",
      "AI analysis of your current English proficiency level",
      "Custom roadmap creation based on your goals",
      "Adaptive learning schedule that fits your pace"
    ]
  },
  {
    title: "Interactive Learning Hub",
    description: [
      "Real-world IT scenarios and code reviews",
      "Technical discussions in English",
      "Practice with industry-specific terminology",
      "Hands-on programming challenges"
    ]
  },
  {
    title: "Progress Tracking & Analytics",
    description: [
      "Detailed analytics of your learning progress",
      "Vocabulary growth monitoring",
      "Speaking confidence metrics",
      "Professional communication skills assessment"
    ]
  },
  {
    title: "Global Tech Community",
    description: [
      "Connect with IT professionals worldwide",
      "Real conversations about technology",
      "Coding discussions and peer reviews",
      "Industry trends and best practices"
    ]
  }
];

const Index = () => {
  const [activeSection, setActiveSection] = React.useState(0);

  const handleSectionComplete = () => {
    setActiveSection((prev) => (prev) % DEMO_SECTIONS.length);
  };

  const handleSectionClick = (index: number) => {
    setActiveSection(index);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-neural-bg">
      <NeuralBackground />
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
              Discover how our AI-Powered Platform Makes Learning Engaging and Practical.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Panel - Fixed width */}
            <div className="w-full lg:w-[300px] space-y-6 flex-shrink-0">
              {DEMO_SECTIONS.map((section, index) => (
                <DemoSection
                  key={section.title}
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
                <div className="absolute inset-0">
                  <VideoPanel 
                    activeSection={DEMO_SECTIONS[activeSection].title}
                    className="w-full h-full"
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