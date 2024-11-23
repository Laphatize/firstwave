'use client'
import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';

const Features = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Enhanced transform values for more dramatic parallax
  const y = useTransform(scrollYProgress, [0, 1], [200, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.3], [0.8, 1]);

  const textRef = useRef(null);
  const cardsRef = useRef(null);
  const isTextInView = useInView(textRef, { 
    amount: 0.3 
  });
  const areCardsInView = useInView(cardsRef, { 
    amount: 0.3 
  });

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  return (
    <div className="relative min-h-screen w-full mt-screen">
      <div className="w-full min-h-screen bg-neutral-900/95 backdrop-blur-sm z-10">
        <div className="min-h-screen bg-neutral-900 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-radial from-red-500/10 via-transparent to-transparent opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-neutral-900" />
          </div>
          
          <div className="max-w-7xl mx-auto px-4 pt-32 relative z-20">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-20"
            variants={itemVariants}
          >
            
          <h2 className="text-4xl text-white mb-4">What can Vyvern do for your organization?</h2>
          <p className="text-neutral-400  mb-12">
            Experience the next generation of security with our AI-powered platform
          </p>

          </motion.div>
 
            <motion.div 
              ref={cardsRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10"
            >
                
              {[
                {
                  icon: "🛡",
                  title: "AI-Powered Personas",
                  description: "Generate sophisticated social engineering profiles using advanced AI agents to test employee security awareness."
                },
                {
                  icon: "📋",
                  title: "Compliance Reporting",
                  description: "Automated NIST-compliant security assessment reports with detailed vulnerability analysis and recommendations."
                },
                {
                  icon: "🎯",
                  title: "Targeted Campaigns",
                  description: "Design and execute controlled social engineering campaigns to identify security gaps in your organization."
                },
                {
                  icon: "📊",
                  title: "Analytics Dashboard",
                  description: "Track campaign effectiveness, employee vulnerability metrics, and security awareness trends in real-time."
                },
                {
                  icon: "🎓",
                  title: "Training Integration",
                  description: "Automatically assign targeted security awareness training based on employee performance in campaigns."
                },
                {
                  icon: "🤖",
                  title: "Multi-Channel Testing",
                  description: "Deploy AI agents across email, SMS, voice calls, and social media to comprehensively test security protocols."
                },
                {
                  icon: "📱",
                  title: "Mobile Assessment",
                  description: "Test mobile device security awareness with specialized campaigns targeting smartphone vulnerabilities."
                },
                {
                  icon: "🔍",
                  title: "Risk Assessment",
                  description: "Identify high-risk departments and individuals requiring additional security awareness training."
                },
                {
                  icon: "📈",
                  title: "Progress Tracking",
                  description: "Monitor security posture improvements over time with detailed historical analysis and trending."
                }
              ].map((feature, i) => (
                <motion.div 
                  key={feature.title}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate={areCardsInView ? "visible" : "hidden"}
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(38, 38, 38, 0.8)' }}
                  transition={{ duration: 0.2 }}
                  className="bg-neutral-800/50 p-8 rounded-lg border border-red-800/20 backdrop-blur-sm relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                  <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                    <span className="text-2xl">{feature.icon}</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
                  <p className="text-neutral-400">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features; 