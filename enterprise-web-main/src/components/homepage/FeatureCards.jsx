/*
    Copyright (c) 2024 CTFGuide Corporation
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWater, faShieldAlt, faChartLine } from '@fortawesome/free-solid-svg-icons';

const FeatureCard = ({ title, description, icon, gradient }) => (
  <div className={`w-full p-6 ${gradient} shadow-md border border-neutral-800 flex flex-col h-full`}>
    <div className="flex-grow">
      <p className="text-white w-10 h-10">
        <FontAwesomeIcon icon={icon} size="2x" />
      </p>
      <h3 className="mt-4 text-2xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white mb-4">{description}</p>
    </div>
    <p className="text-white mt-auto">
      <span className="hover:underline cursor-pointer">Learn more →</span>
    </p>
  </div>
);

const FeatureCards = () => {
  const features = [
    {
      title: "FirstWave",
      description: "AI powered phishing testing for all skill levels, ensuring everyone in your team can stay secure.",
      icon: faWater,
      gradient: "bg-gradient-to-br from-black/10 to-red-900/50"
    },
    {
      title: "Guardian",
      description: "Cutting-edge protection against sophisticated phishing attacks and cyber threats.",
      icon: faShieldAlt,
      gradient: "bg-gradient-to-br from-black/10 to-neutral-800/10"
    },
    {
      title: "Sentry",
      description: "Comprehensive analytics to monitor and improve your team's phishing awareness over time.",
      icon: faChartLine,
      gradient: "bg-gradient-to-br from-black/10 to-red-900/50"
    },
    // Add more feature objects here if needed
  ];

  return (
    <div className="bg-neutral-9000 max-w-7xl mx-auto ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </div>
  );
};

export default FeatureCards;