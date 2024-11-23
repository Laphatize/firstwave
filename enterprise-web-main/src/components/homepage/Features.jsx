'use client'
import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';

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

  const [hoveredFeature, setHoveredFeature] = useState(null);

  const slideOverVariants = {
    hidden: { y: '100%', opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 200
      }
    },
    exit: { 
      y: '100%', 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  };

  const featureDetails = {
    "AI-Powered Personas": {
      overview: "Our advanced AI system creates highly convincing personas for security testing",
      keyPoints: [
        "Dynamic personality generation",
        "Contextual behavior adaptation",
        "Multi-language support",
        "Customizable scenario building"
      ],
      image: "/social.png" // Add your image path
    },
    "Compliance Reporting": {
      overview: "Automatically generate detailed NIST-compliant reports that provide comprehensive insights into your organization's security posture.",
      keyPoints: [
        "NIST framework alignment",
        "Automated vulnerability analysis",
        "Custom report templates",
        "Executive summaries",
        "Technical deep-dives",
        "Remediation tracking"
      ],
      image: "/nist.png"
    },
    "Targeted Campaigns": {
      overview: "Design and execute precision-targeted social engineering campaigns that test specific departments or security protocols.",
      keyPoints: [
        "Department-specific targeting",
        "Role-based campaign design",
        "Multiple attack vectors",
        "Real-time monitoring",
        "Success rate tracking",
        "Automated escalation"
      ],
      image: "https://dummyimage.com/600x400/ad1827/fff"
    },
    "Analytics Dashboard": {
      overview: "Monitor and analyze campaign effectiveness with our comprehensive real-time analytics dashboard.",
      keyPoints: [
        "Real-time metrics tracking",
        "Custom KPI configuration",
        "Department comparisons",
        "Trend analysis",
        "Export capabilities",
        "Interactive visualizations"
      ],
      image: "https://dummyimage.com/600x400/ad1827/fff"
    },
    "Training Integration": {
      overview: "Seamlessly connect security awareness training with campaign results for targeted employee development.",
      keyPoints: [
        "Automated training assignment",
        "Performance tracking",
        "Custom learning paths",
        "Interactive modules",
        "Certification management",
        "Progress reporting"
      ],
      image: "https://dummyimage.com/600x400/ad1827/fff"
    },
    "Multi-Channel Testing": {
      overview: "Deploy comprehensive security tests across multiple communication channels to identify vulnerabilities.",
      keyPoints: [
        "Email campaign integration",
        "SMS testing capabilities",
        "Voice call simulations",
        "Social media vectors",
        "Cross-channel analytics",
        "Channel effectiveness comparison"
      ],
      image: "https://dummyimage.com/600x400/ad1827/fff"
    },
    "Mobile Assessment": {
      overview: "Evaluate mobile security awareness with specialized campaigns targeting smartphone and tablet vulnerabilities.",
      keyPoints: [
        "Mobile-specific attack vectors",
        "App-based testing",
        "SMS/MMS campaigns",
        "QR code testing",
        "Device security analysis",
        "BYOD policy assessment"
      ],
      image: "https://dummyimage.com/600x400/ad1827/fff"
    },
    "Risk Assessment": {
      overview: "Identify and prioritize security risks across your organization with our comprehensive assessment tools.",
      keyPoints: [
        "Department risk scoring",
        "Individual vulnerability tracking",
        "Historical trend analysis",
        "Risk prioritization",
        "Mitigation recommendations",
        "Compliance mapping"
      ],
      image: "https://dummyimage.com/600x400/ad1827/fff"
    },
    "Progress Tracking": {
      overview: "Monitor and measure security awareness improvements over time with detailed analytics and reporting.",
      keyPoints: [
        "Historical performance data",
        "Improvement metrics",
        "Goal setting and tracking",
        "Department benchmarking",
        "ROI calculation",
        "Custom reporting periods"
      ],
      image: "https://dummyimage.com/600x400/ad1827/fff"
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
                  onMouseEnter={() => setHoveredFeature(feature.title)}
                  onMouseLeave={() => setHoveredFeature(null)}
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

      <AnimatePresence>
        {hoveredFeature && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={slideOverVariants}
            className="fixed bottom-0 left-0 right-0 h-1/3 bg-neutral-900/95 border-t border-red-800/20 backdrop-blur-md z-50"
          >
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex gap-6">
                {featureDetails[hoveredFeature]?.image && (
                  <div className="w-1/3">
                    <img 
                      src={featureDetails[hoveredFeature].image} 
                      alt={hoveredFeature}
                      className="rounded-lg object-cover h-full w-full"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-white mb-4">{hoveredFeature}</h3>
                  <p className="text-neutral-300 mb-4">{featureDetails[hoveredFeature]?.overview}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {featureDetails[hoveredFeature]?.keyPoints.map((point, index) => (
                      <li key={index} className="text-neutral-400 flex items-center gap-2">
                        <span className="text-red-500">•</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Features; 