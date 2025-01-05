import React, { useEffect, useRef, useState } from 'react';
import { Brain, BookOpen, Gauge, CircleDot } from 'lucide-react';
import { Card } from '@/components/ui/card';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const MethodCard = ({ method, isActive, onClick, index }) => {
  const cardRef = useRef(null);
  const iconRef = useRef(null);
  const contentRef = useRef(null);
  const detailsRef = useRef(null);
  const detailsWrapperRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced scroll reveal animation for each card
      gsap.from(cardRef.current, {
        y: 100,
        scale: 0.9,
        opacity: 0,
        duration: 1.2,
        delay: index * 0.3,
        ease: "power4.out",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top bottom-=50",
          end: "top center",
          toggleActions: "play none none reverse",
          scrub: 1,
          markers: true // Remove this in production
        }
      });

      // Continuous floating animation for icon
      gsap.to(iconRef.current, {
        y: -8,
        duration: 2,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true
      });

      // Active state animations
      if (isActive) {
        // Expand card with more dramatic effect
        gsap.to(cardRef.current, {
          scale: 1.03,
          duration: 0.5,
          ease: "back.out(1.7)"
        });

        // Reveal details with slide effect
        gsap.fromTo(detailsWrapperRef.current,
          { 
            clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
            opacity: 0
          },
          { 
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            opacity: 1,
            duration: 0.8,
            ease: "power3.inOut"
          }
        );

        // Animate details items with cascade
        gsap.from(detailsRef.current.children, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: "power2.out",
          delay: 0.3
        });
      } else {
        // Reset card scale with smooth transition
        gsap.to(cardRef.current, {
          scale: 1,
          duration: 0.5,
          ease: "power2.out"
        });
      }
    });

    return () => ctx.revert();
  }, [isActive, index]);

  return (
    <Card 
      ref={cardRef}
      onClick={onClick}
      className={`relative overflow-hidden cursor-pointer transform-gpu
        ${isActive ? 'shadow-[0_0_50px_-12px] shadow-primary/30' : 'shadow-[0_0_30px_-12px] shadow-white/20'}
        transition-all duration-500 rounded-3xl
        border border-white/10
        backdrop-blur-xl
        ${method.bgClass}`}
    >
      {/* Ambient light effect */}
      <div className={`absolute -inset-[100px] ${method.glowClass} opacity-20 blur-[100px]`} />
      
      {/* Glass effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.07] to-white/[0.03] backdrop-blur-xl" />
      
      <div className="relative p-6">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/[0.03] to-transparent rounded-full blur-3xl" />
        <div className={`absolute bottom-0 left-0 w-24 h-24 ${method.gradient} opacity-10 rounded-full blur-2xl`} />
        
        {/* Header Section */}
        <div className="relative z-10 flex items-center gap-4 mb-4">
          <div ref={iconRef} 
               className={`flex-shrink-0 p-3 rounded-2xl ${method.gradient} bg-opacity-20
                          shadow-lg shadow-primary/10 backdrop-blur-xl
                          border border-white/10`}>
            <method.icon className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xl font-bold bg-clip-text text-transparent 
                         bg-gradient-to-br from-white via-white to-white/70 truncate">
              {method.title}
            </h3>
            <p className="text-sm text-white/50 font-medium truncate">
              {method.subtitle}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/70 text-sm leading-relaxed mb-4 relative z-10">
          {method.description}
        </p>
        
        {/* Details Grid - Always visible but expands */}
        <div ref={contentRef} 
             className="relative z-10 transition-all duration-500">
          <div ref={detailsWrapperRef}
               className="space-y-3 transition-all duration-500">
            <div ref={detailsRef}
                 className={`grid gap-3 transition-all duration-500
                           ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
              {method.details.map((detail, idx) => (
                <div key={idx} 
                     className={`overflow-hidden transition-all duration-500
                                ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                  <div className="flex items-start gap-3 p-2 rounded-xl
                                hover:bg-white/5 transition-colors">
                    <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full
                                  ${method.gradient} bg-opacity-20 backdrop-blur-sm
                                  border border-white/10`} />
                    <div>
                      <h4 className="font-medium text-white/90 text-sm">
                        {detail.title}
                      </h4>
                      <p className={`text-xs text-white/50 leading-relaxed mt-1
                                   transition-all duration-500
                                   ${isActive ? 'block' : 'hidden'}`}>
                        {detail.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const AnimatedLearningMethods = () => {
  const [activeMethod, setActiveMethod] = useState(null);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  const methods = [
    {
      id: 'language',
      title: 'Language Acquisition',
      subtitle: 'Natural Learning Process',
      icon: Brain,
      gradient: 'bg-gradient-to-br from-blue-500 to-cyan-500',
      glowClass: 'bg-blue-500/20',
      bgClass: 'bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_70%)]',
      description: 'Master technical English through natural comprehension and practical usage in IT contexts.',
      details: [
        {
          title: 'Immersive Learning',
          description: 'Learn through real-world IT scenarios and practical examples.'
        },
        {
          title: 'Contextual Understanding',
          description: 'Grasp concepts naturally through relevant technical contexts.'
        },
        {
          title: 'Active Practice',
          description: 'Apply knowledge in interactive coding and documentation exercises.'
        },
        {
          title: 'Progressive Complexity',
          description: 'Advance from basic concepts to complex technical discussions.'
        }
      ]
    },
    {
      id: 'brain',
      title: 'Second Brain System',
      subtitle: 'Knowledge Organization',
      icon: BookOpen,
      gradient: 'bg-gradient-to-br from-violet-500 to-purple-500',
      glowClass: 'bg-violet-500/20',
      bgClass: 'bg-[radial-gradient(ellipse_at_center,rgba(139,92,246,0.15),transparent_70%)]',
      description: 'Build a powerful system to capture, organize, and utilize technical knowledge effectively.',
      details: [
        {
          title: 'Smart Capture',
          description: 'Save and categorize valuable technical information efficiently.'
        },
        {
          title: 'Structured Organization',
          description: 'Create meaningful connections between different concepts.'
        },
        {
          title: 'Quick Retrieval',
          description: 'Access your knowledge base instantly when needed.'
        },
        {
          title: 'Active Application',
          description: 'Transform stored knowledge into practical skills.'
        }
      ]
    },
    {
      id: 'habits',
      title: 'Habit Engineering',
      subtitle: 'Consistent Growth',
      icon: Gauge,
      gradient: 'bg-gradient-to-br from-pink-500 to-rose-500',
      glowClass: 'bg-pink-500/20',
      bgClass: 'bg-[radial-gradient(ellipse_at_bottom,rgba(236,72,153,0.15),transparent_70%)]',
      description: 'Develop sustainable learning habits through proven psychological principles.',
      details: [
        {
          title: 'Micro Progress',
          description: 'Break down learning into small, manageable steps.'
        },
        {
          title: 'Routine Integration',
          description: 'Blend learning seamlessly into your daily workflow.'
        },
        {
          title: 'Progress Tracking',
          description: 'Monitor your growth with clear metrics and milestones.'
        },
        {
          title: 'Continuous Improvement',
          description: 'Refine your learning process based on performance data.'
        }
      ]
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Enhanced section entrance animation
      gsap.from(sectionRef.current, {
        opacity: 0,
        duration: 1.5,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top bottom",
          end: "top center",
          scrub: 1,
          markers: true // Remove this in production
        }
      });

      // Enhanced title animation sequence
      gsap.from(titleRef.current.children, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: titleRef.current,
          start: "top bottom-=100",
          end: "top center",
          scrub: 1,
          markers: true // Remove this in production
        }
      });

      // Create timeline for cards animation
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: cardsRef.current,
          start: "top bottom-=100",
          end: "center center",
          scrub: 1,
          markers: true // Remove this in production
        }
      });

      // Animate cards with stagger
      tl.from(".method-card", {
        y: 100,
        opacity: 0,
        scale: 0.8,
        duration: 1,
        stagger: 0.3,
        ease: "power3.out"
      });
    });

    return () => ctx.revert();
  }, []);

  const handleMethodClick = (methodId) => {
    setActiveMethod(methodId === activeMethod ? null : methodId);
  };

  return (
    <section ref={sectionRef} className="relative py-32 overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.15),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.15),transparent_50%)]" />
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-blue-500/30 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-violet-500/30 rounded-full blur-[100px]" />
      
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div ref={titleRef} className="text-center space-y-8 mb-24">
          <h2 className="text-6xl sm:text-7xl lg:text-8xl font-bold
                       bg-clip-text text-transparent bg-gradient-to-br 
                       from-blue-400 via-violet-400 to-purple-400
                       leading-tight">
            Learning Methods
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            Discover our three-pillar approach to accelerate your technical English mastery
          </p>
        </div>

        <div ref={cardsRef} 
             className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12
                        [perspective:1000px]">
          {methods.map((method, index) => (
            <div key={method.id} 
                 className="method-card transform-gpu">
              <MethodCard
                method={method}
                isActive={activeMethod === method.id}
                onClick={() => handleMethodClick(method.id)}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnimatedLearningMethods; 