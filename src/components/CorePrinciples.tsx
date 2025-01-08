import { useRef, useEffect } from 'react';
import { Brain, BookOpen, Rocket, Zap, Target, Heart, Lightbulb, Database, Repeat } from 'lucide-react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const principles = [
  {
    category: "Language Acquisition",
    author: "Stephen Krashen",
    icon: BookOpen,
    color: "from-cyan-400 to-blue-500",
    principles: [
      {
        title: "Comprehensible Input",
        icon: Brain,
        description: "Learn through content slightly above your current level (i+1)",
      },
      {
        title: "Natural Order",
        icon: Rocket,
        description: "Language structures are acquired in a predictable sequence",
      },
      {
        title: "Affective Filter",
        icon: Heart,
        description: "Low anxiety environment enhances language acquisition",
      }
    ]
  },
  {
    category: "Second Brain",
    author: "Tiago Forte",
    icon: Database,
    color: "from-violet-400 to-purple-500",
    principles: [
      {
        title: "CODE Methodology",
        icon: Zap,
        description: "Capture, Organize, Distill, Express - your knowledge flow",
      },
      {
        title: "Progressive Summarization",
        icon: Target,
        description: "Layer your notes through multiple passes of highlighting",
      },
      {
        title: "Projects Over Categories",
        icon: Lightbulb,
        description: "Organize by actionable projects instead of abstract categories",
      }
    ]
  },
  {
    category: "Atomic Habits",
    author: "James Clear",
    icon: Repeat,
    color: "from-blue-400 to-indigo-500",
    principles: [
      {
        title: "1% Better Every Day",
        icon: Target,
        description: "Small improvements compound into remarkable results",
      },
      {
        title: "Four Laws of Behavior Change",
        icon: Brain,
        description: "Make it obvious, attractive, easy, and satisfying",
      },
      {
        title: "Identity-Based Habits",
        icon: Heart,
        description: "Focus on who you want to become, not what you want to achieve",
      }
    ]
  }
];

export const CorePrinciples = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate section title
      gsap.from(".principles-title", {
        y: 30,
        opacity: 0,
        duration: 1,
        scrollTrigger: {
          trigger: ".principles-title",
          start: "top 80%",
          end: "top 50%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate methodology cards
      gsap.from(".methodology-card", {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        scrollTrigger: {
          trigger: ".methodology-grid",
          start: "top 75%",
          end: "top 25%",
          toggleActions: "play none none reverse"
        }
      });

      // Animate principles within each card
      gsap.from(".principle-item", {
        x: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        scrollTrigger: {
          trigger: ".methodology-grid",
          start: "top 60%",
          end: "top 20%",
          toggleActions: "play none none reverse"
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 lg:py-32 bg-[#030409]/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#030409]/50 to-[#030409]" />
      
      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="principles-title text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r 
                         from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
            Built on Proven Learning Principles
          </h2>
          <p className="principles-title text-lg text-slate-300">
            We've combined the best insights from language acquisition, knowledge management, 
            and habit formation to create a unique learning experience.
          </p>
        </div>

        <div className="methodology-grid grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {principles.map((methodology, index) => (
            <div
              key={index}
              className="methodology-card relative p-6 rounded-2xl
                         border border-white/10 bg-[#030409]/80 backdrop-blur-md
                         hover:bg-[#030409]/90 transition-colors duration-300"
            >
              {/* Methodology Header */}
              <div className="flex items-center gap-4 mb-6">
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

              {/* Principles List */}
              <div className="space-y-4">
                {methodology.principles.map((principle, pIndex) => (
                  <div
                    key={pIndex}
                    className="principle-item flex items-start gap-4 p-4 rounded-xl
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
                      <p className="text-sm text-slate-300">
                        {principle.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}; 