import { useState } from 'react';
import { motion } from 'framer-motion';
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
        title: "Comprehensible Input",
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
      <div
        className="w-full h-full perspective"
        onMouseEnter={() => setIsFlipped(true)}
        onMouseLeave={() => setIsFlipped(false)}
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
                <p className="text-slate-300 text-base line-clamp-2">{method.description}</p>
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
              {/* Principles List */}
              <div className="space-y-8">
                {method.principles.map((principle, idx) => (
                  <div
                    key={idx}
                    className="group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className={`flex-shrink-0 w-7 h-7 rounded-lg bg-gradient-to-r ${method.color} 
                                    flex items-center justify-center
                                    shadow-lg shadow-${method.color.split('-')[2]}-500/20
                                    group-hover:shadow-${method.color.split('-')[2]}-500/30
                                    transition-all duration-300`}>
                        <principle.icon className="w-3.5 h-3.5 text-white" />
                      </div>
                      <h4 className="text-lg font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent
                                   group-hover:to-white transition-all duration-300">
                        {principle.title}
                      </h4>
                    </div>
                    <p className="text-slate-400 text-base leading-relaxed mt-2
                                group-hover:text-slate-300 transition-all duration-300">
                      {principle.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const CorePrinciplesAlt = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-[#030409]">
      {/* Background Effects */}
      {/* <div className="absolute inset-0 bg-[#030409]" />
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent" />
      <div 
        className="absolute top-0 left-1/4 w-96 h-96 -translate-x-1/2 -translate-y-1/2"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.05) 0%, rgba(168,85,247,0.01) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div 
        className="absolute bottom-0 right-1/4 w-96 h-96 translate-x-1/2 translate-y-1/2"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.05) 0%, rgba(59,130,246,0.01) 50%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      /> */}
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mx-auto">
          {/* Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center justify-center px-4 py-1.5 mb-8
                        border border-purple-500/20 rounded-full bg-[#1A103C]">
              <Brain className="w-4 h-4 mr-2 text-purple-400" />
              <span className="text-sm font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Core Learning Principles
              </span>
            </div>

            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight leading-[1.15]">
                <span className="inline-block bg-gradient-to-r from-white via-slate-200 to-purple-100 bg-clip-text text-transparent">
                  Scientific Principles
                </span>
                <br />
                <span className="inline-block bg-gradient-to-r from-purple-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent">
                  Practical Mastery
                </span>
              </h2>

              <p className="text-lg md:text-xl bg-gradient-to-r from-slate-400 via-slate-300 to-slate-400 
                          bg-clip-text text-transparent max-w-2xl mx-auto font-medium leading-relaxed">
                Built on proven research that revolutionizes how IT professionals master English
              </p>
            </div>
          </div>

          {/* Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {methods.map((method, index) => (
              <BookCard key={index} method={method} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}; 