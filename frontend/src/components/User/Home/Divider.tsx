"use client"

import type React from "react"
import { motion } from "framer-motion"

const Divider: React.FC = () => {
  return (
    <motion.div
      className="flex items-center justify-center py-12"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex items-center w-full max-w-4xl mx-auto px-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent to-sepia-300"></div>
        <motion.div
          className="text-[#8b5d3b] text-2xl px-6"
          whileInView={{
            rotate: [0, 45, 0, 45, 0],
            scale: [1, 1.2, 1, 1.2, 1],
          }}
          transition={{ duration: 2, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.8] }}
          viewport={{ once: true }}
        >
          ✦
        </motion.div>
        <div className="h-px flex-1 bg-gradient-to-l from-transparent to-sepia-300"></div>
      </div>
    </motion.div>
  )
}

export default Divider
