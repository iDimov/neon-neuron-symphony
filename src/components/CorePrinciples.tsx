import { useRef, useEffect } from 'react';
import { Brain, Layers, Repeat, Code } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import MotionPathPlugin from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export const CorePrinciples = () => {
  const sectionRef = useRef(null);
  const principlesRef = useRef(null);
  const logoRef = useRef(null);

  const principles = [
    {
      icon: Layers,
      title: "Language Acquisition",
      description: "Natural learning through IT contexts",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "Second Brain",
      description: "Systematic knowledge organization",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      icon: Repeat,
      title: "Habit Building",
      description: "Consistent learning routines",
      gradient: "from-pink-500 to-rose-500",
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state setup
      gsap.set(".app-logo", { scale: 0, opacity: 0 });
      
      // Initial animation of principles appearing
      gsap.from(".principle-card", {
        y: 30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.7)",
      });

      // Scroll-based animation sequence
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top",
          end: "+=100%",
          pin: true,
          scrub: 1,
          markers: true,
          toggleActions: "play none none reverse"
        }
      });

      // First phase: Spread out and float
      principles.forEach((_, index) => {
        const xPos = index === 0 ? -25 : index === 1 ? 0 : 25;
        
        tl.to(`.principle-card:nth-child(${index + 1})`, {
          x: `${xPos}%`,
          y: index === 1 ? "-15vh" : "5vh",
          scale: 1.05,
          duration: 1,
          ease: "power2.inOut"
        }, "spread");
      });

      // Second phase: Rotate and merge
      principles.forEach((_, index) => {
        const rotation = index === 0 ? -180 : index === 1 ? 0 : 180;
        
        tl.to(`.principle-card:nth-child(${index + 1})`, {
          x: 0,
          y: 0,
          rotation: rotation,
          scale: 0.5,
          opacity: 0,
          duration: 1.5,
          ease: "power3.inOut"
        }, "merge");
      });

      // Show logo with glow effect
      tl.to(".app-logo", {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "elastic.out(1, 0.75)",
        onComplete: () => {
          gsap.to(".app-logo", {
            boxShadow: "0 0 30px rgba(59,130,246,0.5)",
            repeat: -1,
            yoyo: true,
            duration: 1.5
          });
        }
      }, "merge+=0.5");

    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden">
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex items-center justify-center">
        <div ref={principlesRef} className="relative w-full">
          {/* Initial horizontal layout */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {principles.map(({ icon: Icon, title, description, gradient }, index) => (
              <div
                key={index}
                className="principle-card"
              >
                <div className="relative p-6 rounded-2xl bg-white/5 border border-white/10 
                             backdrop-blur-2xl flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${gradient}
                                flex items-center justify-center mb-4 
                                shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {title}
                  </h3>
                  <p className="text-slate-300 text-sm">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* App Logo */}
          <div ref={logoRef} className="app-logo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500
                          flex items-center justify-center shadow-2xl">
              <Code className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 