import { ArrowRight, ArrowDown } from 'lucide-react';

const MobileHero = () => {
  return (
    <div className="pb-20 bg-neutral-900 px-4 pt-20 relative overflow-hidden">
      <div className="absolute inset-0 -z-5 overflow-hidden">
        <div className="absolute left-[50%] top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="relative h-[400px] w-[400px]">
            <div className="absolute inset-0 animate-ripple-1 rounded-full border border-red-500/20"></div>
            <div className="absolute inset-0 animate-ripple-2 rounded-full border border-red-500/20"></div>
            <div className="absolute inset-0 animate-ripple-3 rounded-full border border-red-500/20"></div>
          </div>
        </div>
      </div>
      <div className="text-center relative z-10">
        <h1 className="text-xl text-white mb-2 mt-8">Introducing Vyvern</h1>
        <p className="text-3xl font-light text-white mb-6">
          The AI powered platform for human risk management.
        </p>

        <div className="flex flex-col gap-4">
          <button className="w-full text-base border px-4 py-2 border-white text-white rounded-full flex items-center justify-center gap-2">
            Try the demo
            <ArrowRight className="h-4 w-4" />
          </button>
          <button 
            onClick={() => {
              const featuresSection = document.querySelector('.features-section');
              featuresSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full text-base bg-white border px-4 py-2 text-black border-white rounded-full flex items-center justify-center gap-2"
          >
            Learn more
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default MobileHero; 