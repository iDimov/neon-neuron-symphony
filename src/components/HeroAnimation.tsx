import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import MotionPathPlugin from 'gsap/MotionPathPlugin';
import { CodeFlow } from './CodeFlow';
import { NetworkVisualization } from './NetworkVisualization';
import { NeuralPatterns } from './NeuralPatterns';

gsap.registerPlugin(ScrollTrigger);

export const HeroAnimation = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial setup
      gsap.set([".principle", ".principle-text", ".ai-overlay"], { opacity: 0 });
      gsap.set(".logo-container", { scale: 0, opacity: 0 });
      
      // Main timeline
      const tl = gsap.timeline({
        defaults: { duration: 1, ease: "power2.inOut" }
      });

      // Opening question animation
      tl.to(".opening-question", {
        opacity: 1,
        duration: 1.5,
        ease: "power2.out"
      })
      .to(".opening-question", {
        opacity: 0,
        y: -30,
        duration: 1,
        ease: "power2.in"
      }, "+=2")

      // First principle - Language Acquisition
      .fromTo(".principle-1", {
        scale: 0,
        opacity: 0,
        x: "-30vw"
      }, {
        scale: 1,
        opacity: 1,
        x: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.75)"
      })
      .fromTo(".principle-text-1", {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, "-=0.5")
      .fromTo(".code-flow", {
        opacity: 0,
        x: -50
      }, {
        opacity: 1,
        x: 0,
        stagger: 0.1
      }, "-=0.3")

      // Second principle - Second Brain
      .fromTo(".principle-2", {
        scale: 0,
        opacity: 0,
        x: "30vw"
      }, {
        scale: 1,
        opacity: 1,
        x: 0,
        duration: 1.5,
        ease: "elastic.out(1, 0.75)"
      }, "+=0.5")
      .fromTo(".principle-text-2", {
        opacity: 0,
        y: 20
      }, {
        opacity: 1,
        y: 0,
        duration: 0.8
      }, "-=0.5")
      .fromTo(".knowledge-nodes", {
        scale: 0,
        opacity: 0
      }, {
        scale: 1,
        opacity: 1,
        stagger: 0.1
      }, "-=0.3")

      // AI Enhancement
      .fromTo(".ai-overlay", {
        opacity: 0,
        y: "-20vh"
      }, {
        opacity: 1,
        y: 0,
        duration: 1.5
      }, "+=0.5")
      .fromTo(".ai-patterns", {
        drawSVG: "0%"
      }, {
        drawSVG: "100%",
        duration: 1.5,
        stagger: 0.1
      }, "-=1")

      // Convergence
      .to([".principle-1", ".principle-2", ".ai-overlay"], {
        x: 0,
        y: 0,
        scale: 0.8,
        duration: 1.5,
        ease: "power3.inOut"
      })
      .to(".logo-container", {
        scale: 1,
        opacity: 1,
        duration: 1,
        ease: "back.out(1.7)"
      }, "-=0.5")
      .to(".tagline", {
        opacity: 1,
        y: 0,
        duration: 0.8
      });

      // Hover interactions
      const principles = document.querySelectorAll('.principle-hover');
      principles.forEach(principle => {
        principle.addEventListener('mouseenter', () => {
          gsap.to(principle, {
            scale: 1.1,
            duration: 0.3,
            ease: "power2.out"
          });
          gsap.to(principle.querySelector('.hover-text'), {
            opacity: 1,
            y: 0,
            duration: 0.3
          });
        });

        principle.addEventListener('mouseleave', () => {
          gsap.to(principle, {
            scale: 1,
            duration: 0.3,
            ease: "power2.out"
          });
          gsap.to(principle.querySelector('.hover-text'), {
            opacity: 0,
            y: 10,
            duration: 0.3
          });
        });
      });

    }, sectionRef.current);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden bg-neural-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-neural-bg/50 to-neural-bg pointer-events-none" />
      
      {/* Opening Question */}
      <div className="opening-question absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                    text-4xl font-bold text-white text-center opacity-0">
        <h1>What makes language learning work for IT professionals?</h1>
      </div>

      {/* Principles Container */}
      <div className="principles-container relative w-full h-screen">
        {/* Language Acquisition */}
        <div className="principle principle-1 absolute left-1/4 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl opacity-20" />
            <div className="code-flow absolute inset-0 overflow-hidden">
              <CodeFlow />
            </div>
          </div>
          <div className="principle-text-1 mt-4 text-white text-center">
            <h3 className="text-xl font-bold">Natural Language Acquisition</h3>
            <p className="text-sm text-slate-300">Learn through real IT scenarios</p>
          </div>
        </div>

        {/* Second Brain */}
        <div className="principle principle-2 absolute right-1/4 top-1/2 transform translate-x-1/2 -translate-y-1/2">
          <div className="relative w-64 h-64">
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl opacity-20" />
            <div className="knowledge-nodes absolute inset-0">
              <NetworkVisualization />
            </div>
          </div>
          <div className="principle-text-2 mt-4 text-white text-center">
            <h3 className="text-xl font-bold">Systematic Knowledge Organization</h3>
            <p className="text-sm text-slate-300">Build lasting technical English knowledge</p>
          </div>
        </div>

        {/* AI Enhancement */}
        <div className="ai-overlay absolute inset-0 pointer-events-none">
          <div className="ai-patterns absolute inset-0">
            <NeuralPatterns />
          </div>
          <div className="text-white text-center mt-8">
            <h3 className="text-xl font-bold">AI-Enhanced Learning Experience</h3>
            <p className="text-sm text-slate-300">Personalized guidance at every step</p>
          </div>
        </div>

        {/* Logo Container */}
        <div className="logo-container absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="relative w-40 h-40 bg-gradient-to-r from-blue-500 via-violet-500 to-purple-500 rounded-2xl
                       flex items-center justify-center shadow-2xl">
            {/* Add logo SVG here */}
          </div>
          <div className="tagline mt-8 text-center text-white opacity-0 transform translate-y-10">
            <h2 className="text-2xl font-bold">Built on proven principles for IT professionals</h2>
          </div>
        </div>
      </div>

      {/* Interactive Hover Areas */}
      <div className="hover-areas absolute inset-0 pointer-events-none">
        {['Learn through real IT scenarios', 'Build lasting technical English knowledge', 'Personalized guidance at every step'].map((text, index) => (
          <div key={index} 
               className="principle-hover absolute cursor-pointer pointer-events-auto"
               style={{
                 left: index === 0 ? '25%' : index === 1 ? '50%' : '75%',
                 top: '50%',
                 transform: 'translate(-50%, -50%)'
               }}>
            <div className="hover-text absolute top-full left-1/2 transform -translate-x-1/2 mt-4
                         bg-white/10 backdrop-blur-lg rounded-lg px-4 py-2 text-white text-sm
                         opacity-0 translate-y-2">
              {text}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}; 