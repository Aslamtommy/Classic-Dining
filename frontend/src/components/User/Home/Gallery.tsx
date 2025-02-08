import React from 'react';

const Gallery: React.FC = () => {
  return (
    <section className="px-6 pb-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((index) => (
            <div key={index} className="group relative">
              <div className="aspect-[4/5] relative overflow-hidden bg-[#e8e2d9]">
                <img
                  src={`https://via.placeholder.com/400x500?text=Image+${index}`}
                  alt={`Classic dining atmosphere ${index}`}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="absolute inset-0 bg-[#2c2420]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="inline-flex items-center text-sm tracking-wider hover:text-[#8b5d3b] transition-colors">
            VIEW MORE EXPERIENCES
            <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Gallery;
