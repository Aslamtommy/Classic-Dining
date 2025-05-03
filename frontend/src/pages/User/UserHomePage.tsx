import type React from "react"

import Header from "../../components/User/Home/Header"
import Hero from "../../components/User/Home/Hero"
import FeaturedSection from "../../components/User/Home/FeaturedSection"
import Gallery from "../../components/User/Home/Gallery"
import Testimonials from "../../components/User/Home/testimonials"
import Divider from "../../components/User/Home/Divider"
import Footer from "../../components/User/Home/Footer"
 
const UserHomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#faf7f2] text-[#2c2420]">
      <Header />
      <main className="flex-grow">
        <Hero />
       
        <Divider />
        <Gallery />
        <Divider />
        <FeaturedSection />
        <Divider />
        <Testimonials />
      </main>
      <Footer />
    </div>
  )
}

export default UserHomePage
