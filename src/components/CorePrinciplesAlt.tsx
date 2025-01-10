import { useRef, useState } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Brain, BookOpen, Rocket, Zap, Target, Heart, Lightbulb, Database, Repeat, Leaf } from 'lucide-react';
import l2Cover from '../images/l2-cover.png';
import brainCover from '../images/2brain.jpg';
import habitsCover from '../images/atomic-habits.jpg';
import '../styles/flip-card.css';

const methods = [
  {
    title: "Language Acquisition",
    author: "Stephen Krashen",
    icon: BookOpen,
    description: "Innovative framework and a stress-free approach to mastering language that prioritizes real-world fluency over traditional (grammar, quizzes) studying",  
    color: "from-cyan-400 to-blue-500",
    cover: l2Cover,
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
    title: "Second Brain",
    author: "Tiago Forte",
    icon: Database,
    description: "A digital organization system that helps you capture, process, and retrieve information from your brain, making it more efficient and creative.",
    color: "from-violet-400 to-purple-500",
    cover: brainCover,
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
    title: "Atomic Habits",
    author: "James Clear",
    icon: Repeat,
    description: "A practical guide to breaking bad habits and forming good ones, based on the science of habit formation.",
    color: "from-blue-400 to-indigo-500",
    cover: habitsCover,
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

const BookCard = ({ method, index }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="h-[600px] w-full">
      <motion.div
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
        className="w-full h-full perspective"
        onHoverStart={() => setIsFlipped(true)}
        onHoverEnd={() => setIsFlipped(false)}
      >
        <motion.div
          className="relative w-full h-full preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.4, 0.0, 0.2, 1],
            scale: {
              duration: 0.4
            }
          }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Front - Book Cover & Description */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="w-full h-full rounded-3xl overflow-hidden shadow-xl">
              <div className="relative w-full h-4/5">
                <img
                  src={method.cover}
                  alt={method.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6
                              bg-gradient-to-t from-[#0A0F1E]/80 via-[#0A0F1E]/50 to-transparent">
                  <div className="flex items-center gap-3">
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
                </div>
              </div>

              {/* Description Section */}
              <div className="h-1/5 bg-[#0A0F1E]/80 backdrop-blur-sm p-6 relative">
                <p className="text-slate-300 text-sm line-clamp-2">{method.description}</p>
                <div className="absolute bottom-4 right-6">
                  <div className="text-sm text-slate-400 flex items-center gap-2">
                    <span>View principles</span>
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity,
                        ease: "easeInOut" 
                      }}
                    >
                      →
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back - Principles */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotateY-180">
            <div className="w-full h-full rounded-3xl bg-[#0A0F1E] p-8">
              {/* Header with Icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${method.color}
                              flex items-center justify-center`}>
                  <method.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-white">Core Principles</h3>
                  <p className="text-slate-400 text-sm">Key concepts from {method.title}</p>
                </div>
              </div>
              
              {/* Principles List */}
              <div className="mt-8 space-y-6">
                {method.principles.map((principle, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isFlipped ? 1 : 0, y: isFlipped ? 0 : 10 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r ${method.color}
                                 flex items-center justify-center`}>
                      <principle.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 -mt-1">
                      <h4 className="text-lg font-semibold text-white mb-1">
                        {principle.title}
                      </h4>
                      <p className="text-slate-400 text-base leading-relaxed">
                        {principle.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export const CorePrinciplesAlt = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const opacity = useSpring(useTransform(scrollYProgress, [0, 0.2], [0, 1]));
  const y = useSpring(useTransform(scrollYProgress, [0, 0.2], [40, 0]));

  return (
    <section ref={containerRef} className="relative py-24 overflow-hidden bg-[#030409]">
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
              <BookCard key={index} method={method} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}; 