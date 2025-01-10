import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Brain, BookOpen, Rocket, Zap, Target, Heart, Lightbulb, Database, Repeat } from 'lucide-react';
import l2Cover from '../images/l2-cover.png';
import brainCover from '../images/2brain.jpg';
import habitsCover from '../images/atomic-habits.jpg';

const methods = [
  {
    title: "Language Acquisition",
    author: "Stephen Krashen",
    icon: BookOpen,
    color: "from-cyan-400 to-blue-500",
    cover: l2Cover,
    keyPoints: ["Real-world fluency", "Natural progression", "Stress-free environment"]
  },
  {
    title: "Second Brain",
    author: "Tiago Forte",
    icon: Database,
    color: "from-violet-400 to-purple-500",
    cover: brainCover,
    keyPoints: ["Digital organization", "Knowledge flow", "Enhanced creativity"]
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    icon: Repeat,
    color: "from-blue-400 to-indigo-500",
    cover: habitsCover,
    keyPoints: ["Small improvements", "Sustainable routines", "Identity-based change"]
  }
];

export const CorePrinciplesAlt = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0, 1]));
  const y = useSpring(useTransform(scrollYProgress, [0, 0.2], [40, 0]));

  return (
    <section ref={containerRef} className="relative py-24 overflow-hidden">
      <div className="absolute inset-0 bg-[#030409]/90" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          style={{ opacity, y }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 
                           border border-purple-500/20 rounded-full bg-purple-500/10">
              <span className="text-sm font-medium text-purple-400">
                Our Learning Philosophy
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Learning Engineered <span className="text-purple-400">Differently</span>
            </h2>
          </div>

          {/* Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {methods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ 
                  opacity: 1, 
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: index * 0.1
                  }
                }}
                viewport={{ once: true }}
                className="group"
              >
                <div className="relative h-full p-6 rounded-2xl bg-[#0A0F1E]/60 
                              border border-white/[0.05] backdrop-blur-sm
                              hover:bg-[#0A0F1E]/80 transition-all duration-300">
                  {/* Book Preview */}
                  <div className="relative w-full aspect-[3/4] mb-6 rounded-xl overflow-hidden">
                    <img
                      src={method.cover}
                      alt={method.title}
                      className="w-full h-full object-cover transition-transform duration-700
                               group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${method.color}
                                    flex items-center justify-center`}>
                        <method.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {method.title}
                        </h3>
                        <p className="text-sm text-slate-400">by {method.author}</p>
                      </div>
                    </div>

                    {/* Key Points */}
                    <div className="flex flex-wrap gap-2">
                      {method.keyPoints.map((point, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1 text-sm rounded-full
                                   bg-white/[0.03] text-slate-300
                                   border border-white/[0.05]"
                        >
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 