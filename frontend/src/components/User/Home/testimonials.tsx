"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react"

const TestimonialsSection = () => {
  const [activeIndex, setActiveIndex] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Food Enthusiast",
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
      quote:
        "Classic Dining offers an unparalleled experience that combines traditional flavors with modern elegance. Every visit feels like a special occasion.",
      rating: 5,
    },
    {
      id: 2,
      name: "Rajiv Mehta",
      role: "Business Executive",
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
      quote:
        "The attention to detail in both the cuisine and service is remarkable. Perfect for business dinners when you need to impress clients.",
      rating: 5,
    },
    {
      id: 3,
      name: "Ananya Patel",
      role: "Food Blogger",
      image:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=150&q=80",
      quote:
        "As someone who dines out professionally, I can confidently say that Classic Dining stands out for its authentic flavors and impeccable presentation.",
      rating: 4.5,
    },
  ]

  const nextTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-white to-sepia-50">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 className="font-playfair text-4xl md:text-5xl text-sepia-900 font-bold mb-4 relative inline-block">
            Guest Experiences
            <motion.div
              className="absolute -bottom-3 left-1/2 h-1 bg-gold-500 rounded-full"
              initial={{ width: 0, x: "-50%" }}
              whileInView={{ width: "60%", x: "-50%" }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </h2>
          <p className="text-sepia-800 text-lg max-w-2xl mx-auto mt-6">
            Hear what our valued guests have to say about their dining experiences with us.
          </p>
        </motion.div>

        <div className="relative">
          <div className="overflow-hidden">
            <motion.div
              className="flex"
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                x: `-${activeIndex * 100}%`,
              }}
              transition={{ duration: 0.5 }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="min-w-full px-4">
                  <div className="bg-white rounded-xl shadow-elegant p-8 md:p-10 border border-sepia-100 relative">
                    <Quote className="absolute top-6 left-6 w-12 h-12 text-sepia-100 opacity-50" />

                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 relative z-10">
                      <div className="flex-shrink-0">
                        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-sepia-100 shadow-md">
                          <img
                            src={testimonial.image || "/placeholder.svg"}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex-1 text-center md:text-left">
                        <div className="flex justify-center md:justify-start mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < Math.floor(testimonial.rating)
                                  ? "text-amber-500 fill-amber-500"
                                  : i < testimonial.rating
                                    ? "text-amber-500 fill-amber-500 opacity-70"
                                    : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        <blockquote className="text-xl md:text-2xl font-playfair text-sepia-900 italic mb-6">
                          "{testimonial.quote}"
                        </blockquote>

                        <div>
                          <h4 className="text-lg font-semibold text-sepia-900">{testimonial.name}</h4>
                          <p className="text-sepia-600">{testimonial.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 md:-translate-x-0 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center text-sepia-900 hover:bg-sepia-50 transition-colors z-10"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 md:translate-x-0 bg-white w-10 h-10 rounded-full shadow-md flex items-center justify-center text-sepia-900 hover:bg-sepia-50 transition-colors z-10"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex justify-center mt-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-3 h-3 rounded-full mx-1 transition-colors ${
                index === activeIndex ? "bg-gold-500" : "bg-sepia-200"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
