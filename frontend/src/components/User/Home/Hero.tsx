import React from 'react';

const Hero: React.FC = () => {
  return (
    <section
    className="relative h-[400px] md:h-[500px] lg:h-[600px] flex items-center justify-center px-6 text-center bg-cover bg-center"
    style={{
      backgroundImage: `url('https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`,
    }}
  >
    {/* Overlay */}
    <div className="absolute inset-0 bg-black/30"></div>
  
    {/* Content */}
    <div className="relative max-w-3xl mx-auto">
      <h1 className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-white">
        The Finest Dining Experience in India
      </h1>
      <div className="flex items-center justify-center">
        <div className="h-px w-16 bg-[#8b5d3b]"></div>
        <p className="mx-4 text-lg text-white/80">Est. 1940</p>
        <div className="h-px w-16 bg-[#8b5d3b]"></div>
      </div> 
    </div>
  </section>
  );
};

export default Hero;