import React from 'react';

const Hero: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-6 text-center bg-[#faf7f2]">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-[#2c2420]">
          The Finest Dining Experience in India
        </h1>
        <div className="flex items-center justify-center">
          <div className="h-px w-16 bg-[#8b5d3b]"></div>
          <p className="mx-4 text-lg text-[#2c2420]/80">Est. 1940</p>
          <div className="h-px w-16 bg-[#8b5d3b]"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
