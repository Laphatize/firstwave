import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '../catalyst/button.jsx';

const MainNavbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
            isScrolled ? 'bg-neutral-900/95 backdrop-blur-sm shadow-lg' : 'bg-neutral-800/50'
        }`}>
            <nav className="relative flex justify-between px-4 mx-auto max-w-7xl py-4">
                <div className="flex items-center md:gap-x-12">
                    <Link href="../" aria-label="Home">
                        <div className="mx-auto my-auto flex animate__animated animate__fadeIn">
                            <h1 className="my-auto text-xl text-white">
                                <span className="text-white font-medium"> Vyvern <span className='text-xs font-light'>EARLY ALPHA</span> </span>
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
                </div>
            </nav>
        </div>
    );
};

export default MainNavbar; 