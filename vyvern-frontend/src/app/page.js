/*
    Copyright (c) 2024 CTFGuide Corporation
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

"use client"
import React, { useState } from 'react';

const TestPage = () => {
    const [showModal, setShowModal] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [role, setRole] = useState('');

    const handleWaitlistClick = () => {
        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Here you would typically send the email to your backend
        console.log('Email submitted:', email);
        setIsSubmitted(true);
        setTimeout(() => {
            setShowModal(false);
            setIsSubmitted(false);
            setEmail('');
            setRole('');
        }, 2000);
    };

    const handleClose = () => {
        setShowModal(false);
        setIsSubmitted(false);
        setEmail('');
        setRole('');
    };
    return (
        <>
        <style jsx>{`
          @keyframes floatSquare1 {
            0%, 100% {
              transform: translateY(0px)
            }
            50% {
              transform: translateY(-8px) 
            }
          }
          @keyframes floatDiamond {
            0%, 100% {
              transform: translateY(0px) rotate(45deg)
            }
            50% {
              transform: translateY(-8px) rotate(45deg)
            }
          }
          @keyframes floatDiamondHover {
            0%, 100% {
              transform: translateY(0px) rotate(0deg)
            }
            50% {
              transform: translateY(-8px) rotate(0deg)
            }
          }
          .diamond-element {
            transform: rotate(45deg);
            animation: floatDiamond 3.5s ease-in-out infinite;
            animation-delay: 0.8s;
          }
          .diamond-element:hover {
            animation: floatDiamondHover 3.5s ease-in-out infinite;
            animation-delay: 0.8s;
            border-color: white;
            box-shadow: 0 10px 15px -3px rgba(255, 255, 255, 0.1), 0 4px 6px -2px rgba(255, 255, 255, 0.05);
          }
          @keyframes floatSquare2 {
            0%, 100% {
              transform: translateY(0px)
            }
            50% {
              transform: translateY(-8px) 
            }
          }
          @keyframes floatSquare3 {
            0%, 100% {
              transform: translateY(0px)
            }
            50% {
              transform: translateY(-8px)
            }
          }
        `}</style>
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                    <img src="/trans_logo.png" alt="vyvern" className="w-40 lg:-ml-5 mb-2" />
                    <h1 className="text-white font-thin text-3xl lg:text-4xl">Let our agents find insider threats before <b className="text-red-600 font-semibold">they</b> do.</h1>
                    <p className="text-white font-thin text-sm lg:text-base mt-4 text-center lg:text-left">LAUNCHING DECEMBER 2025 | JOIN THE <span className="font-bold hover:text-red-600 transition-all duration-300 ease-in-out cursor-pointer" onClick={handleWaitlistClick}>WAITLIST</span></p>
                </div>
                <div className="hidden lg:flex flex-col items-center justify-center">
                <div className="flex items-center space-x-12 ml-10">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-white shadow-lg shadow-white/20" 
                         style={{
                           animation: 'floatSquare1 4s ease-in-out infinite',
                           animationDelay: '0s'
                         }}></div>
                    <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-red-600 shadow-lg shadow-red-500/20 duration-0 diamond-element rotate-45"></div>
                    <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-white shadow-lg shadow-white/20"
                         style={{
                           animation: 'floatSquare2 4.2s ease-in-out infinite',
                           animationDelay: '1.6s'
                         }}></div>
                    <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-white shadow-lg shadow-white/20"
                         style={{
                           animation: 'floatSquare3 3.8s ease-in-out infinite',
                           animationDelay: '2.4s'
                         }}></div>
                </div>
                </div>
                </div>

            </div>
        </div>

        {/* Liquid Glass Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <div 
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleClose}
                ></div>
                
                {/* Modal */}
                <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {!isSubmitted ? (
                        <>
                            <div className=" mb-6">
                                <h2 className="text-2xl font-semibold text-white mb-2">Join the Waitlist</h2>
                                <p className="text-white/80 text-sm">Be the first to know when Vyvern launches</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-red-500 focus:bg-white/20 transition-all duration-300"
                                        required
                                    />
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        placeholder="Enter your role"
                                        className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-red-500 focus:bg-white/20 transition-all duration-300"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                                >
                                    Join Waitlist
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="mb-4">
                                <svg className="w-16 h-16 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">You're In!</h2>
                            <p className="text-white/80">We'll notify you when Vyvern launches</p>
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
};

export default TestPage;
