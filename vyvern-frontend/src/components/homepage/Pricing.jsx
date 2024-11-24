/*
    Copyright (c) 2024 Pranav Ramesh
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

'use client';

import React, { useState } from 'react';
import { Button } from '../catalyst/button';

const Pricing = () => {
    const [teamSize, setTeamSize] = useState(10);

    const plans = [
        {
            name: "vyvern",
            description: "AI-powered phishing testing for all skill levels",
            basePrice: 5,
            features: [
                "Basic phishing simulations",
                "AI-driven attack scenarios",
                "Monthly analytics report",
                "Email support"
            ]
        },
        {
            name: "Guardian",
            description: "Cutting-edge protection against sophisticated threats",
            basePrice: 10,
            features: [
                "Advanced phishing simulations",
                "Real-time threat intelligence",
                "Quarterly analytics report",
                "Priority support",
                "Security awareness training"
            ]
        },
        {
            name: "Sentry",
            description: "Comprehensive analytics and advanced protection",
            basePrice: 15,
            features: [
                "Custom phishing simulations",
                "Real-time analytics dashboard",
                "24/7 dedicated support",
                "Advanced threat intelligence",
                "Compliance and regulatory support"
            ]
        }
    ];

    const calculatePrice = (basePrice) => {
        return (basePrice * Math.ceil(teamSize / 10)).toFixed(2);
    };

    return (
        <div className="bg-neutral-900 text-white py-20">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-4xl font-semibold mb-8 text-center">Pricing Plans</h2>
                <div className="mb-12 text-center">
                    <label htmlFor="teamSize" className="mr-4 text-lg">Team Size:</label>
                    <input
                        type="number"
                        id="teamSize"
                        value={teamSize}
                        onChange={(e) => {
                            const value = e.target.value;
                            if (value === '' || isNaN(value)) {
                                setTeamSize(1);
                            } else {
                                setTeamSize(Math.max(1, parseInt(value)));
                            }
                        }}
                        min="1"
                        step="1"
                        className="bg-neutral-800 text-white px-4 py-2 rounded-md border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <div key={plan.name} className="bg-neutral-800 p-8 rounded-lg shadow-lg border border-neutral-700 transition-all hover:scale-105">
                            <h3 className="text-2xl font-semibold mb-4">{plan.name}</h3>
                            <p className="text-neutral-300 mb-6">{plan.description}</p>
                            <div className="text-4xl font-bold mb-6">${calculatePrice(plan.basePrice)}<span className="text-lg font-normal">/mo</span></div>
                            <ul className="mb-8 space-y-2">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button href="/signup" color="red" className="w-full justify-center">Get Started</Button>
                        </div>
                    ))}
                </div>
                <div className="mt-16 text-center">
                    <h3 className="text-2xl font-semibold mb-4">Enterprise One</h3>
                    <p className="text-xl mb-6">All-inclusive protection for large enterprises</p>
                    <Button href="/contact" color="white" className="px-8 py-3">Contact Sales</Button>
                </div>
            </div>
        </div>
    );
};

export default Pricing;