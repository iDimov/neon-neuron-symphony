import { useRef, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Code, Brain, Sparkles, ArrowRight, Star } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

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
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0">
        <motion.div style={{ y }} className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(67,56,202,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_100%,rgba(124,58,237,0.12),transparent_50%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.12),transparent_50%)]" />
        </motion.div>
      </div>
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 lg:pt-32">
        {/* Welcome Badge */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                         bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
            <Star className="w-4 h-4 text-blue-400" />
            <span className="text-base font-medium bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
              Beyond Just Another Learning App
            </span>
            <Star className="w-4 h-4 text-blue-400" />
          </div>
        </div>

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
              title: "IT-Focused English Learning",
              text: "Crafted for IT pros and students",
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
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.8 + index * 0.15 }}
            >
              <div className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-2xl 
                            border border-white/10 flex items-center gap-6">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} 
                               flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {title}
                  </h3>
                  <p className="text-slate-300 text-sm">{text}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};