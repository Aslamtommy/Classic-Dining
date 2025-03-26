import React from 'react';

import Header from '../../components/User/Home/Header';
import Hero from '../../components/User/Home/Hero';

import Gallery from '../../components/User/Home/Gallery';
import Divider from '../../components/User/Home/Divider';
import Footer from '../../components/User/Home/Footer';

const UserHomePage: React.FC = () => {
 
  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#2c2420]">
      
      <Header />
      <main className="flex-grow">

        <Hero />
      
        <Divider />
        <Gallery />
      </main>
      <Footer />
    </div>
  );
};
export default UserHomePage;
