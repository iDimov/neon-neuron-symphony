import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Code, Brain, Sparkles, ArrowRight, Rocket, Star } from 'lucide-react';
// import { NeuralBackground } from './NeuralBackground';

gsap.registerPlugin(ScrollTrigger);

export const Hero = () => {
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 50]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text animation
      gsap.from(".hero-text", {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: "power3.out"
      });

      // Features animation on scroll
      gsap.from(".feature-card", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top center+=100",
        }
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(67,56,202,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(124,58,237,0.12),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.12),transparent_50%)]" />
      </div>
      {/* <NeuralBackground /> */}
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-32">
        {/* Welcome Badge */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                         bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-400">
              Make learning IT English Fun Again!
            </span>
            <Star className="w-4 h-4 text-blue-400" />
          </div>
        </motion.div>

        {/* Hero Text */}
        <div className="text-center max-w-4xl mx-auto mb-16 lg:mb-24">
          <h1 className="hero-text text-4xl sm:text-6xl lg:text-8xl font-bold leading-none tracking-tight mb-8">
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-500 to-violet-500 
                           bg-clip-text text-transparent pb-2">
              English for IT People,
            </span>
            <span className="block bg-gradient-to-r from-violet-400 via-purple-500 to-pink-500 
                           bg-clip-text text-transparent">
              Finally!
            </span>
          </h1>
          <p className="hero-text text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Welcome to the coziest meta-learning platform, where we turn scattered 
            English learning moments into your personal success story.
          </p>
        </div>

        {/* Features Grid */}
        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 
                                        max-w-7xl mx-auto mb-16 lg:mb-24">
          {[
            { 
              Icon: Code, 
              title: "IT-Focused Learning",
              text: "Specialized content for tech professionals",
              gradient: "from-cyan-500 via-blue-500 to-violet-500"
            },
            {
              Icon: Brain,
              title: "Meta Learning System",
              text: "Structure your knowledge effectively",
              gradient: "from-violet-500 via-purple-500 to-pink-500"
            },
            {
              Icon: Sparkles,
              title: "AI-Powered Practice",
              text: "Intelligent learning assistance",
              gradient: "from-blue-500 via-indigo-500 to-cyan-500"
            }
          ].map(({ Icon, title, text, gradient }, index) => (
            <motion.div
              key={index}
              className="feature-card group relative"
              whileHover={{ y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-0 
                             group-hover:opacity-10 rounded-xl transition-opacity duration-300`} />
              <div className="relative p-6 sm:p-8 rounded-xl bg-slate-800/50 backdrop-blur 
                            border border-slate-700/50 h-full">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${gradient} 
                               flex items-center justify-center mb-4
                               group-hover:scale-110 group-hover:rotate-3 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400">{text}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <div className="flex flex-wrap justify-center gap-8 lg:gap-16 mb-16">
          {[
            ["500+", "Learning Resources"],
            ["24/7", "AI Support"],
            ["10K+", "IT Professionals"]
          ].map(([number, label], i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 
                            bg-clip-text text-transparent">
                {number}
              </div>
              <div className="text-sm text-slate-400">{label}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl
                     bg-gradient-to-r from-blue-500 to-violet-500 
                     text-white font-medium shadow-lg shadow-blue-500/25
                     hover:shadow-blue-500/50 transition-all"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </div>
      </div>
    </div>
  );
};