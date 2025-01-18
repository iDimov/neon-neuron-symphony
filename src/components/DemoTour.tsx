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
    <section className="relative py-20 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-demo-background via-demo-purple/5 to-demo-background pointer-events-none">
        <div className="absolute inset-0 opacity-40 mix-blend-soft-light">
          <div className="absolute top-0 -left-1/4 w-1/2 h-1/2 bg-gradient-conic from-purple-500 via-transparent to-transparent rounded-full blur-[120px] rotate-90" />
          <div className="absolute bottom-0 -right-1/4 w-1/2 h-1/2 bg-gradient-conic from-blue-500 via-transparent to-transparent rounded-full blur-[120px] -rotate-90" />
          <div className="absolute top-1/4 right-0 w-1/3 h-1/3 bg-gradient-conic from-pink-500 via-transparent to-transparent rounded-full blur-[100px]" />
        </div>
      </div>
      
      {/* Content container */}
      <div className="relative max-w-[1400px] mx-auto px-8">
        {/* Section Header */}
        <div className="text-center max-w-4xl mx-auto mb-20 relative">
          <div className="inline-flex items-center justify-center gap-2 px-5 py-2 mb-8
                       border border-purple-500/20 rounded-full bg-purple-500/10 group backdrop-blur-sm
                       hover:bg-purple-500/20 transition-all duration-300 hover:border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 
                         bg-clip-text text-transparent">
              Interactive Demo
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-br 
                       from-white via-purple-400 to-blue-400 bg-clip-text text-transparent mb-8
                       tracking-tight leading-[1.1] drop-shadow-2xl">
            Your English Learning <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text">Revolution</span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto">
            Watch how our AI-powered platform transforms your learning journey with personalized experiences.
          </p>
        </div>

        {/* Main content with glass effect container */}
        <div className="relative rounded-3xl backdrop-blur-md bg-gradient-to-b from-white/10 to-white/5 border border-white/10 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl pointer-events-none" />
          
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
                           border border-white/10 hover:border-purple-500/30 
                           shadow-lg hover:shadow-purple-500/20 
                           bg-gradient-to-br from-white/10 via-white/5 to-transparent
                           backdrop-blur-md"
                />
              ))}
            </div>
            
            {/* Right Panel - Video with aspect ratio */}
            <div className="flex-1 relative">
              <div className="w-full pt-[56.25%] relative">
                <div className="absolute inset-0">
                  <VideoPanel 
                    activeSection={DEMO_SECTIONS[activeSection].title}
                    className="w-full h-full rounded-2xl overflow-hidden
                             shadow-2xl shadow-black/20 border border-white/10
                             bg-gradient-to-br from-white/10 via-white/5 to-transparent"
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