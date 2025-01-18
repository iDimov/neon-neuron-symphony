import React, { useState } from 'react';
import { DemoSection } from './DemoSection';
import { VideoPanel } from './VideoPanel';
import { Sparkles } from 'lucide-react';

const DEMO_SECTIONS = [
  {
    title: "Plan Your Journey",
    description: [
      "Personalized learning paths tailored to your IT career goals",
      "AI analysis of your current English proficiency level",
      "Custom roadmap creation based on your goals",
      "Adaptive learning schedule that fits your pace"
    ]
  },
  {
    title: "Personalized Learning",
    description: [
      "Real-world IT scenarios and code reviews",
      "Technical discussions in English",
      "Practice with industry-specific terminology",
      "Hands-on programming challenges"
    ]
  },
  {
    title: "Tracking & Analytics",
    description: [
      "Detailed analytics of your learning progress",
      "Vocabulary growth monitoring",
      "Speaking confidence metrics",
      "Professional communication skills assessment"
    ]
  },
  {
    title: "Tech Community",
    description: [
      "Connect with IT professionals worldwide",
      "Real conversations about technology",
      "Coding discussions and peer reviews",
      "Industry trends and best practices"
    ]
  }
];

export const DemoTour = () => {
  const [activeSection, setActiveSection] = useState(0);

  const handleSectionComplete = () => {
    setActiveSection(current => (current + 1) % DEMO_SECTIONS.length);
  };

  const handleSectionClick = (index: number) => {
    setActiveSection(index);
  };

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-demo-background/0 via-demo-purple/5 to-demo-background/0" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-radial from-demo-purple/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-radial from-demo-blue/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-1/3 h-1/3 bg-gradient-radial from-demo-pink/20 to-transparent rounded-full blur-3xl" />
      </div>
      
      {/* Content container */}
      <div className="relative max-w-[1400px] mx-auto px-8">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20 relative">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-6 
                       border border-purple-500/20 rounded-full bg-purple-500/10 group backdrop-blur-sm
                       hover:bg-purple-500/20 transition-all duration-300">
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 
                         bg-clip-text text-transparent">
              Interactive Demo
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r 
                       from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8
                       tracking-tight leading-[1.1]">
            Your English Learning Revolution
          </h2>
          <p className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto">
            Watch how our AI-powered platform transforms your learning journey with personalized experiences.
          </p>
        </div>

        {/* Main content with glass effect container */}
        <div className="relative rounded-2xl backdrop-blur-md bg-gradient-to-b from-white/5 to-white/10 border border-white/10 p-8">
          <div className="flex flex-col lg:flex-row gap-8 relative">
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
                  className="transition-all duration-300 hover:transform hover:scale-[1.02] 
                           border border-white/10 hover:border-demo-purple/30 
                           shadow-lg hover:shadow-demo-purple/20 
                           bg-gradient-to-b from-white/5 to-transparent"
                />
              ))}
            </div>
            
            {/* Right Panel - Video with aspect ratio */}
            <div className="flex-1 relative">
              <div className="w-full pt-[56.25%] relative">
                <div className="absolute inset-0">
                  <VideoPanel 
                    activeSection={DEMO_SECTIONS[activeSection].title}
                    className="w-full h-full rounded-xl overflow-hidden
                             shadow-2xl shadow-black/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 