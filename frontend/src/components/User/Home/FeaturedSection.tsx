"use client"

import type React from "react"
import { motion } from "framer-motion"

const FeaturedSection: React.FC = () => {
  const features = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 15.9999V7.9999C21 6.8954 20.1046 5.9999 19 5.9999H5C3.89543 5.9999 3 6.8954 3 7.9999V15.9999M21 15.9999V17.9999C21 19.1045 20.1046 19.9999 19 19.9999H5C3.89543 19.9999 3 19.1045 3 17.9999V15.9999M21 15.9999H3M10 10.9999H14M9 3.9999V5.9999M15 3.9999V5.9999"
          />
        </svg>
      ),
      title: "Premium Reservations",
      description: "Book your table at our exclusive restaurants with our seamless reservation system.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8M12 8v13m0-13V6a4 4 0 014-4h.2M3 13h18M12 17l-1.5-3m3 0L12 17"
          />
        </svg>
      ),
      title: "Exquisite Cuisine",
      description: "Experience the finest culinary creations from our world-class chefs using premium ingredients.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Multiple Locations",
      description: "Find our restaurants in prime locations across major cities in India.",
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  return (
    <section className="py-20 bg-sepia-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-playfair text-4xl md:text-5xl text-sepia-900 font-bold mb-4">
            Exceptional Dining Experience
          </h2>
          <div className="h-1 w-24 bg-gold-500 mx-auto mb-6"></div>
          <p className="text-sepia-800 max-w-2xl mx-auto text-lg">
            Discover why our guests keep coming back for more. We pride ourselves on delivering excellence in every
            aspect of your dining experience.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-10"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="bg-white p-8 rounded-lg shadow-elegant border border-sepia-100 text-center"
              variants={itemVariants}
              whileHover={{ y: -10, transition: { duration: 0.3 } }}
            >
              <div className="text-gold-600 mb-6 flex justify-center">{feature.icon}</div>
              <h3 className="font-playfair text-2xl font-semibold text-sepia-900 mb-4">{feature.title}</h3>
              <p className="text-sepia-800">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default FeaturedSection
