/*
    Copyright (c) 2024 CTFGuide Corporation
    Authored by: Pranav Ramesh
    Updated: 2024-08-20
*/

import Link from 'next/link';
import { Button } from '../catalyst/button.jsx';

const Hero = () => {
    return (
        <>
            <div className="py-2 bg-neutral-800/50">
                <nav className="relative z-50 flex justify-between px-4 mx-auto">
                    <div className="flex items-center md:gap-x-12">
                        <Link href="../" aria-label="Home">
                            <div className="mx-auto my-auto flex animate__animated animate__fadeIn">
                                <h1 className="my-auto text-xl text-white">
                                    <span className="text-white font-medium"> firstwave </span>
                                </h1>
                            </div>
                        </Link>
                    </div>

                    <div className="flex items-center gap-x-5 md:gap-x-8">

                        <div>
                            <Link className="text-white" href="/login">
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

            <div className="bg-neutral-900 text-white relative isolate">
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
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 py-14 px-4 gap-8">
                    <div className="text-left mt-6 animate__animated animate__fadeIn">
                     
                        <p className="text-4xl font-light mb-4  leading-relaxed">
                            Stop attacks before they happen with <span className='bg-white rounded-md'><span className="font-semibold bg-white bg-gradient-to-br from-[#0e1354] to-[#1223a6] text-transparent bg-clip-text px-2 rounded-md">Firstwave</span></span> solutions.
                        </p>
                      
                    </div>

                    <div className="flex justify-center items-center animate__animated animate__fadeIn">
                        <div 
                            style={{ 
                                backgroundImage: 'url("https://cloudfront-us-east-2.images.arcpublishing.com/reuters/S653LQCOVVKYVAEXQZQNILA3MI.jpg")',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }} 
                            className="relative bg-gradient-to-br from-neutral-800 to-neutral-900 border border-neutral-800 p-6 shadow-lg w-full max-w-lg overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-black opacity-50"></div>
                            <div className="relative z-10">
                                <p className="text-sm font-semibold mb-2">CASE STUDY</p>
                                <p className="text-xl mb-4">
                                    How Laird Construction is leveraging <span className='font-semibold'>CTFGuide FirstWave</span> to train their employees for phishing attacks.
                                </p>
                                <Button href="/case-studies/laird-construction" color="white">
                                    Read More
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Hero;
