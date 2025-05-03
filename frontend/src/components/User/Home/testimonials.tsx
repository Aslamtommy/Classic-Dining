"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

const Testimonials: React.FC = () => {
  const testimonials = [
    {
      quote:
        "The dining experience at Classic Dining was nothing short of extraordinary. The ambiance, service, and cuisine were all impeccable.",
      author: "Priya Sharma",
      title: "Food Critic",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    },
    {
      quote:
        "As a regular patron, I can confidently say that Classic Dining maintains its high standards consistently. Their attention to detail is remarkable.",
      author: "Rajiv Mehta",
      title: "Business Executive",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    },
    {
      quote:
        "The fusion of traditional flavors with modern culinary techniques creates a unique dining experience that keeps me coming back.",
      author: "Ananya Patel",
      title: "Celebrity Chef",
      image:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    },
  ]

  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const variants = {
    enter: { opacity: 0, y: 20 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  }

  return (
    <section className="py-20 bg-sepia-900 text-white">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-playfair text-4xl md:text-5xl text-gold-300 font-bold mb-4">What Our Guests Say</h2>
          <div className="h-1 w-24 bg-gold-500 mx-auto mb-6"></div>
        </motion.div>

        <div className="relative h-[300px] md:h-[250px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-6">
                  <img
                    src={testimonials[current].image || "/placeholder.svg"}
                    alt={testimonials[current].author}
                    className="w-20 h-20 rounded-full border-4 border-gold-400 object-cover"
                  />
                </div>
                <p className="text-xl md:text-2xl italic text-white/90 mb-6 max-w-3xl">
                  "{testimonials[current].quote}"
                </p>
                <h4 className="font-playfair text-xl font-semibold text-gold-300">{testimonials[current].author}</h4>
                <p className="text-white/70">{testimonials[current].title}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center mt-8 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === current ? "bg-gold-400 scale-125" : "bg-white/30"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials
