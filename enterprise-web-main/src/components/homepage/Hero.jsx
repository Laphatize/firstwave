/*
    Copyright (c) 2024 CTFGuide Corporation
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

import Link from 'next/link';
import { Button } from '../catalyst/button.jsx';
import { ArrowRight, ArrowDown } from 'lucide-react';

const Hero = () => {
    return (
        <>
            <div className="py-2 bg-neutral-800/50">
                <nav className="relative z-50 flex justify-between px-4 mx-auto max-w-7xl">
                    <div className="flex items-center md:gap-x-12">
                        <Link href="../" aria-label="Home">
                            <div className="mx-auto my-auto flex animate__animated animate__fadeIn">
                                <h1 className="my-auto text-xl text-white">
                                    <span className="text-white font-medium"> Vyvern <span className='text-xs font-light hidden'>A CTFGuide Company</span> </span>
                                </h1>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-x-5 md:gap-x-8">

                        <div>
                            <Link className="text-white text-sm" href="/login">
                               Login
                            </Link>
                        </div>
                        <Button href="login" color="red">
                            <span>
                                Get started <span className="hidden lg:inline">today</span>
                            </span>
                        </Button>
                        <div className="-mr-1 md:hidden"></div>
                    </div>
                </nav>
            </div>

            <div className="bg-neutral-900/50 text-white relative isolate h-screen flex flex-col">
                <div
                    className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
                    aria-hidden="true"
                >
                    <div
                        className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/3 rotate-[30deg] bg-gradient-to-tr from-[#540e0e] to-[#a61212] opacity-40 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>

                <div
                    className="absolute inset-x-0 -z-10 transform-gpu overflow-hidden blur-3xl"
                    aria-hidden="true"
                >
                    <div
                        className="relative aspect-[1155/678] w-full -translate-x-1/2 bg-gradient-to-tr from-red-900 via-black to-red-800 opacity-30"
                        style={{
                            clipPath:
                                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                        }}
                    />
                </div>

                <div className="absolute inset-0 -z-5 overflow-hidden">
                    <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem]">
                        <div className="absolute inset-0 animate-ripple-1 rounded-full border-2 border-red-500/20"></div>
                        <div className="absolute inset-0 animate-ripple-2 rounded-full border-2 border-red-500/20"></div>
                        <div className="absolute inset-0 animate-ripple-3 rounded-full border-2 border-red-500/20"></div>
                    </div>
                </div>

                <div className="absolute right-20 top-40 text-right opacity-0 animate-fade-in-2">
                    <div className="text-4xl font-light">99.8%</div>
                    <div className="text-sm text-gray-400">Threat Detection Rate</div>
                </div>

                <div className="absolute left-20 bottom-40 text-left opacity-0 animate-fade-in-3">
                    <div className="text-4xl font-light">500ms</div>
                    <div className="text-sm text-gray-400">Average Response Time</div>
                </div>

                <div className="max-w-7xl mx-auto px-4 flex flex-col flex-1 mt-10">
                    <div className="text-left mt-6 animate__animated animate__fadeIn">
                        <h1 className='text-2xl'>Introducing Vyvern</h1>
                        <p className="text-6xl font-light mb-4 mt-1 leading">
                            The AI powered platform for human risk management.
                        </p>

                        <div className="flex gap-4">
                            <button className='text-xl border px-4 py-1 border-white rounded-full flex items-center gap-2'>
                                Try the demo
                                <ArrowRight className="h-5 w-5" />
                            </button>
                            <button className='text-xl bg-white border px-4 py-1 text-black border-white rounded-full flex items-center gap-2'>
                                Learn more
                                <ArrowDown className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Product Screenshot */}
                    <div className="relative flex-1 mt-20">
                        <div className="w-full h-full">
                            {/* LinkedIn Persona Card */}
                            <div className="absolute top-8 right-[-80px] z-10 bg-neutral-900/90 backdrop-blur-sm p-4 rounded-lg border border-red-800/30 shadow-lg animate-float-slow">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                                        <svg className="h-5 w-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-200">Generating Persona</p>
                                        <p className="text-xs text-gray-400">Professional Profile</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tone Adjustment Card */}
                            <div className="absolute bottom-20 left-[-80px] z-10 bg-neutral-900/90 backdrop-blur-sm p-4 rounded-lg border border-red-800/30 shadow-lg animate-float">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-purple-500/10 rounded-full flex items-center justify-center">
                                        <span className="text-xl">💬</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Adjusting Tone</p>
                                        <p className="text-xs text-gray-400">Conversation Style</p>
                                    </div>
                                </div>
                            </div>

                            {/* New: Target Analysis Card */}
                            <div className="absolute top-40 left-[-100px] z-10 bg-neutral-900/90 backdrop-blur-sm p-4 rounded-lg border border-red-800/30 shadow-lg animate-float-medium">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-green-500/10 rounded-full flex items-center justify-center">
                                        <span className="text-xl">🎯</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Analyzing Target</p>
                                        <p className="text-xs text-gray-400">Behavioral Patterns</p>
                                    </div>
                                </div>
                            </div>

                            {/* New: Risk Assessment Card */}
                            <div className="absolute right-[-60px] bottom-40 z-10 bg-neutral-900/90 backdrop-blur-sm p-4 rounded-lg border border-red-800/30 shadow-lg animate-float-slow">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-yellow-500/10 rounded-full flex items-center justify-center">
                                        <span className="text-xl">⚠️</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">Risk Assessment</p>
                                        <p className="text-xs text-gray-400">Threat Evaluation</p>
                                    </div>
                                </div>
                            </div>

                            <img 
                                src="/demo.png" 
                                alt="Product Screenshot" 
                                className="w-full h-full object-cover object-left-top rounded-lg border-t-2 border-l-2 border-r-2 border-red-800/30"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;
