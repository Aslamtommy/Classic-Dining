import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2c2420] text-[#faf7f2] py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-playfair text-xl mb-4">Classic Dining</h3>
            <p className="text-sm text-[#faf7f2]/80">
              Serving exquisite cuisine since 1940. Experience the finest in
              American dining.
            </p>
          </div>
          <div>
            <h4 className="font-playfair text-lg mb-4">Contact</h4>
            <address className="text-sm text-[#faf7f2]/80 not-italic">
              123 Gourmet Avenue
              <br />
              New York, NY 10001
              <br />
              Tel: (555) 123-4567
              <br />
              Email: info@classicdining.com
            </address>
          </div>
          <div>
            <h4 className="font-playfair text-lg mb-4">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <a
                href="/about"
                className="text-sm hover:text-[#8b5d3b] transition-colors"
              >
                About Us
              </a>
              <a
                href="/menu"
                className="text-sm hover:text-[#8b5d3b] transition-colors"
              >
                Our Menu
              </a>
              <a
                href="/reservations"
                className="text-sm hover:text-[#8b5d3b] transition-colors"
              >
                Reservations
              </a>
              <a
                href="/events"
                className="text-sm hover:text-[#8b5d3b] transition-colors"
              >
                Private Events
              </a>
            </nav>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#faf7f2]/20 text-center text-sm text-[#faf7f2]/60">
          <p>
            &copy; {new Date().getFullYear()} Classic Dining. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
