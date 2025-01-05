import React, { useEffect, useRef, useState } from 'react';
import { Brain, BookOpen, Gauge, CircleDot, Triangle, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import gsap from 'gsap';

const AnimatedShape = ({ shape: Shape, className }) => {
  const shapeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(shapeRef.current, {
        rotation: 360,
        duration: 20,
        repeat: -1,
        ease: "none"
      });
    });

    return () => ctx.revert();
  }, []);

  return <div ref={shapeRef} className={className}><Shape className="w-full h-full" /></div>;
};

const MethodCard = ({ method, isActive, onClick }) => {
  const cardRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (isActive) {
        gsap.fromTo(contentRef.current,
          { height: 0, opacity: 0 },
          { height: "auto", opacity: 1, duration: 0.5, ease: "power2.out" }
        );
      } else {
        gsap.to(contentRef.current, {
          height: 0,
          opacity: 0,
          duration: 0.3,
          ease: "power2.in"
        });
      }
    });

    return () => ctx.revert();
  }, [isActive]);

  const IconComponent = method.icon;

  return (
    <Card 
      ref={cardRef}
      className={`relative overflow-hidden cursor-pointer transition-all duration-300 group
        ${isActive ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-md'}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        {/* Background Shapes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 opacity-10">
          <AnimatedShape 
            shape={method.shape} 
            className="w-32 h-32 text-current transform rotate-45"
          />
        </div>

        {/* Icon and Title */}
        <div className="flex items-center mb-4">
          <div className={`relative p-3 rounded-lg ${method.color} bg-opacity-10 
            transform transition-transform group-hover:scale-110 duration-300`}>
            <IconComponent className={`w-6 h-6 ${method.color.replace('bg-', 'text-')}`} />
          </div>
          <h3 className="text-xl font-semibold ml-3">{method.title}</h3>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 mb-4 relative z-10">
          {method.shortDesc}
        </p>
        
        {/* Expanded Content */}
        <div 
          ref={contentRef} 
          className="overflow-hidden"
          style={{ height: 0 }}
        >
          <div className="space-y-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {method.details.map((detail, index) => (
              <div 
                key={index} 
                className="space-y-1 transform transition-all duration-300 hover:translate-x-2"
              >
                <h4 className="font-medium flex items-center">
                  <CircleDot className="w-4 h-4 mr-2 text-primary" />
                  {detail.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                  {detail.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AnimatedLearningMethods = () => {
  const [activeMethod, setActiveMethod] = useState(null);
  const containerRef = useRef(null);

  const methods = [
    {
      id: 'language',
      title: 'Language Acquisition',
      icon: Brain,
      shape: Triangle,
      color: 'bg-blue-500',
      shortDesc: 'Natural language learning through comprehensible input',
      details: [
        {
          title: 'Focus on Input',
          description: 'Learn through exposure to understandable content rather than memorization.'
        },
        {
          title: 'Natural Progress',
          description: 'Follow the natural order of acquisition, similar to how children learn.'
        },
        {
          title: 'Low Anxiety',
          description: 'Create a stress-free environment that encourages learning.'
        },
        {
          title: 'Meaningful Context',
          description: 'Learn language in real-world situations relevant to your needs.'
        }
      ]
    },
    {
      id: 'brain',
      title: 'Second Brain',
      icon: BookOpen,
      shape: Square,
      color: 'bg-purple-500',
      shortDesc: 'Systematic knowledge management for continuous learning',
      details: [
        {
          title: 'Capture',
          description: 'Save valuable information that resonates with you.'
        },
        {
          title: 'Organize',
          description: 'Structure knowledge using the PARA method.'
        },
        {
          title: 'Distill',
          description: 'Extract and summarize the most important concepts.'
        },
        {
          title: 'Express',
          description: 'Put knowledge to use by creating and sharing.'
        }
      ]
    },
    {
      id: 'habits',
      title: 'Habit Building',
      icon: Gauge,
      shape: CircleDot,
      color: 'bg-green-500',
      shortDesc: 'Achieve big goals through small, consistent actions',
      details: [
        {
          title: 'Start Tiny',
          description: 'Begin with habits so small they feel almost trivial.'
        },
        {
          title: 'Stack Habits',
          description: 'Connect new habits to existing routines.'
        },
        {
          title: 'Track Progress',
          description: 'Maintain visible records of your consistency.'
        },
        {
          title: 'Focus on Systems',
          description: 'Prioritize regular practice over perfect performance.'
        }
      ]
    }
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.method-card', {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleMethodClick = (methodId) => {
    setActiveMethod(methodId === activeMethod ? null : methodId);
  };

  return (
    <div ref={containerRef} className="w-full max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-600">
          Learning Methods
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Explore three powerful approaches that work together to accelerate your learning journey
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((method) => (
          <div key={method.id} className="method-card">
            <MethodCard
              method={method}
              isActive={activeMethod === method.id}
              onClick={() => handleMethodClick(method.id)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AnimatedLearningMethods;