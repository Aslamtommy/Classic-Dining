"use client"

import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin } from "lucide-react"

const EnhancedFooter = () => {
  const currentYear = new Date().getFullYear()
  const navigate = useNavigate()

  return (
    <footer className="bg-[#2c2420] text-[#faf7f2]">
      {/* Newsletter Section */}
      <div className="bg-sepia-900 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2"
            >
              <h3 className="font-playfair text-3xl text-gold-300 mb-4">Join Our Culinary Journey</h3>
              <p className="text-white/80 mb-2">
                Subscribe to our newsletter for exclusive offers, special events, and culinary insights.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full md:w-1/2"
            >
              <form className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 bg-white/10 border border-gold-500/30 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-gold-400"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 bg-gradient-to-r from-gold-500 to-gold-700 text-sepia-900 font-medium rounded-lg hover:from-gold-600 hover:to-gold-800 transition-all duration-300"
                >
                  Subscribe
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center shadow-md mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6 text-sepia-900"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="font-playfair text-2xl text-gold-300">Classic Dining</h3>
              </div>
              <p className="text-sm text-[#faf7f2]/80 leading-relaxed mb-6">
                Serving exquisite cuisine since 1940. Experience the finest in Indian dining, where tradition meets
                innovation.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gold-300 hover:text-gold-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                  <span className="sr-only">Facebook</span>
                </a>
                <a href="#" className="text-gold-300 hover:text-gold-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="#" className="text-gold-300 hover:text-gold-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                  <span className="sr-only">Twitter</span>
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="font-playfair text-xl text-gold-300 mb-6">Quick Links</h4>
              <nav className="flex flex-col space-y-3">
                {["Home", "About Us", "Menu", "Restaurants", "Reservations"].map((item) => (
                  <motion.button
                    key={item}
                    onClick={() => navigate(`/${item.toLowerCase().replace(" ", "-")}`)}
                    className="text-sm text-[#faf7f2]/80 hover:text-gold-300 transition-colors w-fit"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {item}
                  </motion.button>
                ))}
              </nav>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="font-playfair text-xl text-gold-300 mb-6">Contact</h4>
              <address className="text-sm text-[#faf7f2]/80 not-italic space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gold-400 mr-3 mt-0.5" />
                  <div>
                    123 Gourmet Avenue
                    <br />
                    Mumbai, MH 400001
                    <br />
                    India
                  </div>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gold-400 mr-3" />
                  <span>(022) 1234-5678</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gold-400 mr-3" />
                  <span>info@classicdining.com</span>
                </div>
              </address>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h4 className="font-playfair text-xl text-gold-300 mb-6">Opening Hours</h4>
              <div className="text-sm text-[#faf7f2]/80 space-y-2">
                <div className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span>11:00 - 22:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Saturday</span>
                  <span>10:00 - 23:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>10:00 - 22:00</span>
                </div>
                <div className="pt-4 text-gold-300 font-medium">
                  <p>Happy Hour: 16:00 - 18:00</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <motion.div
        className="py-6 border-t border-[#faf7f2]/10 text-center text-sm text-[#faf7f2]/60"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-6">
          <p>&copy; {currentYear} Classic Dining. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-2">
            <button className="hover:text-gold-300 transition-colors">Privacy Policy</button>
            <button className="hover:text-gold-300 transition-colors">Terms of Service</button>
            <button className="hover:text-gold-300 transition-colors">Sitemap</button>
          </div>
        </div>
      </motion.div>
    </footer>
  )
}

export default EnhancedFooter
