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

  return (
    <section className="relative py-32">
      <div className="max-w-[1400px] mx-auto px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 mb-6 
                       border border-purple-500/20 rounded-full bg-purple-500/10 group">
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-300 transition-colors" />
            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 
                         bg-clip-text text-transparent">
              Interactive Demo
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r 
                       from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8
                       tracking-tight leading-[1.1]">
            Experience the Future <br />
            of Tech Learning
          </h2>
          <p className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto">
            Watch how our AI-powered platform transforms your learning journey with personalized experiences.
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
                onClick={() => setActiveSection(index)}
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
  );
}; 