import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Brain, BookOpen, Rocket, Zap, Target, Heart, Lightbulb, Database, Repeat, Leaf } from 'lucide-react';

const principles = [
  {
    category: "Language Acquisition",
    author: "Stephen Krashen",
    icon: BookOpen,
    color: "from-cyan-400 to-blue-500",
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1],
      staggerChildren: 0.1
    }
  }
};

const principleVariants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.5,
      ease: [0.23, 1, 0.32, 1]
    }
  }
};

export const CorePrinciples = () => {
  return (
    <section className="relative py-20 lg:py-32 bg-[#030409]/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030409]/50 to-[#030409]" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r 
                         from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Built on Proven Learning Principles
          </h2>
          <p className="text-lg text-slate-300">
            Platform combines cutting-edge research with proven frameworks to create a transformative learning experience.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {principles.map((methodology, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className="relative p-6 rounded-2xl border border-white/10 
                         bg-[#030409]/80 backdrop-blur-md hover:bg-[#030409]/90 
                         transition-colors duration-300"
            >
              {/* Methodology Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${methodology.color}
                                flex items-center justify-center shadow-lg`}>
                  <methodology.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {methodology.category}
                  </h3>
                  <p className="text-sm text-slate-400">by {methodology.author}</p>
                </div>
              </div>

              {/* Methodology Description */}
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                {methodology.description}
              </p>

              {/* Principles List */}
              <div className="space-y-4">
                {methodology.principles.map((principle, pIndex) => (
                  <motion.div
                    key={pIndex}
                    variants={principleVariants}
                    className="flex items-start gap-4 p-4 rounded-xl
                             bg-white/5 hover:bg-white/10 transition-colors duration-300
                             border border-white/5"
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-r ${methodology.color}
                                   flex items-center justify-center shadow-lg`}>
                      <principle.icon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">
                        {principle.title}
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {principle.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}; 