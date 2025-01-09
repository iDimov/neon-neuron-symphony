import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Brain, BookOpen, Rocket, Zap, Target, Heart, Lightbulb, Database, Repeat, Leaf } from 'lucide-react';

// Import book covers
import l2Cover from '../images/l2-cover.png';
import brainCover from '../images/2brain.jpg';
import habitsCover from '../images/atomic-habits.jpg';

const principles = [
  {
    category: "Language Acquisition",
    author: "Stephen Krashen",
    icon: BookOpen,
    color: "from-cyan-400 to-blue-500",
    cover: l2Cover,
    description: "Innovative framework and a stress-free approach to mastering language that prioritizes real-world fluency over traditional (grammar, quizzes) studying",
    principles: [
      {
        title: "Comprehensible Input in Context",
        icon: Brain,
        description: "Language is introduced through everyday experiences like storytelling, conversations, and real-world interactions.",
      },
      {
        title: "Organic Learning Flow",
        icon: Leaf,
        description: "Acquire language step-by-step, in a progression that just makes sense.",
      },
      {
        title: "Stress-Free Learning",
        icon: Heart,
        description: "Lower stress, higher engagement. A comfortable, enjoyable and low-anxiety environment boosts receptivity and retention.",
      }
    ]
  },
  {
    category: "Second Brain",
    author: "Tiago Forte",
    icon: Database,
    color: "from-violet-400 to-purple-500",
    cover: brainCover,
    description: "Modern approach to complements your biological brain, enabling you to enhance creativity, efficiency, and overall personal and professional growth",
    principles: [
      {
        title: "PARA Method",
        icon: Target,
        description: "Digital life into Projects, Areas, Resources, and Archives. Keep everything structured for easy access and focus on what matters most",
      },
      {
        title: "CODE Methodology",
        icon: Zap,
        description: "Capture, Organize, Distill, Express - knowledge flow. Systematic approach ensures no valuable moment is lost.",
      },
      {
        title: "Improved Learning",
        icon: Lightbulb,
        description: "Enables meaningful understanding and long-term knowledge retention by organizing insights and summaries tailored for practical application.",
      }
    ]
  },
  {
    category: "Atomic Habits",
    author: "James Clear",
    icon: Repeat,
    color: "from-blue-400 to-indigo-500",
    cover: habitsCover,
    description: "Framework for building consistent learning habits that stick. Essential for long-term success in language learning, especially for busy IT professionals.",
    principles: [
      {
        title: "1% Better Every Day",
        icon: Target,
        description: "Small improvements compound into remarkable results. Consistent, tiny steps lead to massive progress over time.",
      },
      {
        title: "Four Laws of Behavior Change",
        icon: Brain,
        description: "Make it obvious, attractive, easy, and satisfying. This formula creates sustainable learning habits that fit into your daily routine.",
      },
      {
        title: "Identity-Based Habits",
        icon: Heart,
        description: "Focus on who you want to become, not what you want to achieve. This mindset shift makes learning English a natural part of your identity.",
      }
    ]
  }
];

export const CorePrinciples = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0, 1]), {
    stiffness: 100,
    damping: 30
  });

  const y = useSpring(useTransform(scrollYProgress, [0, 0.2], [100, 0]), {
    stiffness: 100,
    damping: 30
  });

  return (
    <section ref={containerRef} className="relative py-20 lg:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-[#030409]/90" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030409]/50 to-[#030409]" />
      <motion.div 
        className="absolute inset-0 opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.2), transparent 70%)',
          filter: 'blur(80px)',
        }}
      />
      <motion.div 
        className="absolute inset-0 opacity-20"
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(56,189,248,0.2), transparent 60%)',
          filter: 'blur(60px)',
        }}
      />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          style={{ opacity, y }}
          className="text-center max-w-3xl mx-auto mb-24"
        >
          <div className="inline-flex items-center justify-center px-4 py-1.5 mb-6 
                         border border-purple-500/20 rounded-full bg-purple-500/10 
                         backdrop-blur-sm">
            <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 
                           bg-clip-text text-transparent">
              Our Learning Philosophy
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r 
                         from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-8
                         tracking-tight leading-[1.1]">
            Learning Engineered Differently
          </h2>
          <p className="text-lg sm:text-xl text-slate-300/90 max-w-2xl mx-auto">
            Platform combines cutting-edge research with proven frameworks to create a transformative learning experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {principles.map((methodology, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ 
                opacity: 1, 
                y: 0,
                transition: {
                  duration: 0.8,
                  ease: [0.23, 1, 0.32, 1],
                  delay: index * 0.2
                }
              }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative group"
            >
              <div className="relative p-8 rounded-[2rem] overflow-hidden
                            bg-[#0A0F1E]/60 backdrop-blur-sm border border-white/[0.08]
                            hover:bg-[#0A0F1E]/80 transition-colors duration-500">
                {/* Header with Icon */}
                <div className="flex items-center gap-3 mb-8">
                  <div className={`w-11 h-11 rounded-2xl bg-gradient-to-r ${methodology.color}
                                 flex items-center justify-center shadow-lg`}>
                    <methodology.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white">
                      {methodology.category}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-400">by {methodology.author}</span>
                    </div>
                  </div>
                </div>

                {/* Book Cover */}
                <div className="relative w-full aspect-[3/4] mb-8">
                  <img
                    src={methodology.cover}
                    alt={methodology.category}
                    className="w-full h-full object-contain rounded-xl
                             shadow-lg hover:shadow-xl transition-shadow duration-500"
                  />
                </div>

                {/* Description */}
                <p className="text-base text-slate-300/90 mb-8 leading-relaxed">
                  {methodology.description}
                </p>

                {/* Principles List */}
                <div className="space-y-4">
                  {methodology.principles.map((principle, pIndex) => (
                    <div
                      key={pIndex}
                      className="group/item flex items-start gap-4 p-4 rounded-xl
                                bg-[#080B15] hover:bg-[#0C1221]
                                border border-white/[0.05] hover:border-white/[0.1]
                                transition-all duration-300"
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r ${methodology.color}
                                     flex items-center justify-center shadow-md`}>
                        <principle.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base font-semibold text-white mb-1">
                          {principle.title}
                        </h4>
                        <p className="text-sm text-slate-400 leading-relaxed">
                          {principle.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}; 