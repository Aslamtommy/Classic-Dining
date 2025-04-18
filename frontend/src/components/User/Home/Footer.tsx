"use client"

import type React from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()

  return (
    <footer className="bg-[#2c2420] text-[#faf7f2] py-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h3 className="font-playfair text-2xl mb-4">Classic Dining</h3>
            <p className="text-sm text-[#faf7f2]/80 leading-relaxed">
              Serving exquisite cuisine since 1940. Experience the finest in Indian dining, where tradition meets
              innovation.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h4 className="font-playfair text-xl mb-4">Contact</h4>
            <address className="text-sm text-[#faf7f2]/80 not-italic leading-relaxed">
              123 Gourmet Avenue
              <br />
              Mumbai, MH 400001
              <br />
              Tel: (022) 1234-5678
              <br />
              Email: info@classicdining.com
            </address>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h4 className="font-playfair text-xl mb-4">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              {["About Us", "Our Menu", "Reservations", "Private Events"].map((item) => (
                <motion.button
                  key={item}
                  onClick={() => navigate(`/${item.toLowerCase().replace(" ", "-")}`)}
                  className="text-sm hover:text-[#8b5d3b] transition-colors"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {item}
                </motion.button>
              ))}
            </nav>
          </motion.div>
        </div>
        <motion.div
          className="mt-12 pt-8 border-t border-[#faf7f2]/20 text-center text-sm text-[#faf7f2]/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <p>&copy; {currentYear} Classic Dining. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer

