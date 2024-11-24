import React from 'react';

const MobileFeatures = () => {
  const features = [
    {
      icon: "🛡",
      title: "AI-Powered Personas",
      description: "Generate sophisticated social engineering profiles using advanced AI agents."
    },
    {
      icon: "📋",
      title: "Compliance Reporting",
      description: "Automated NIST-compliant security assessment reports."
    },
    {
      icon: "🎯",
      title: "Targeted Campaigns",
      description: "Design and execute controlled social engineering campaigns."
    },
    {
      icon: "📊",
      title: "Analytics Dashboard",
      description: "Track campaign effectiveness and security awareness trends."
    }
  ];

  return (
    <div className="bg-neutral-900 px-4 py-12">
      <div className="max-w-[90%] mx-auto">
        <h2 className="text-3xl text-white mb-4">
          What can Vyvern do for your organization?
        </h2>
        <p className="text-neutral-400 mb-8">
          Experience the next generation of security with our AI-powered platform
        </p>

        <div className="space-y-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-neutral-800/50 p-6 rounded-lg border border-red-800/20 relative"
            >
              <div className="h-12 w-12 bg-red-500/10 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">{feature.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">{feature.title}</h3>
              <p className="text-neutral-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileFeatures; 