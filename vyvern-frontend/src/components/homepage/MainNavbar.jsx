import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "../catalyst/button.jsx";
import { Menu } from "lucide-react";

const MainNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-[9999] transition-all duration-300 ${
          isScrolled
            ? "bg-neutral-900/95 backdrop-blur-sm shadow-lg"
            : "bg-neutral-800/50"
        }`}
      >
        <nav className="relative flex justify-between items-center px-4 mx-auto max-w-7xl py-4">
          <div className="flex items-center">
            <Link href="../" aria-label="Home">
              <div className="flex">
                <h1 className="text-xl text-white">
                  <span className="text-white font-medium">
                    Vyvern{" "}
                    <span className="text-xs font-light">EARLY ALPHA</span>
                  </span>
                </h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="md:flex items-center gap-x-5 ">
            <Link className=" text-white text-sm" href="/login">
              Login
            </Link>
            <Button href="login" className=" " color="red">
              <span>
                Get started <span className="hidden lg:inline">today</span>
              </span>
            </Button>

            <p className=" hidden text-white text-sm">Coming soon</p>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={24} />
          </button>
        </nav>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? "max-h-40" : "max-h-0"
          }`}
        >
          <div className="px-4 py-3 space-y-3 bg-neutral-900/95 ">
            <Link
              href="/login"
              className="hidden text-white text-sm py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/login"
              className="hidden text-center bg-red-600 text-white rounded-full py-2 px-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get started
            </Link>

            <p className="  text-white text-sm">Coming soon</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainNavbar;
