"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { fetchBranches } from "../../../Api/userApi"
import { motion } from "framer-motion"

export const Gallery: React.FC = () => {
  const [branches, setBranches] = useState([])

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const response: any = await fetchBranches()
        setBranches(response.data)
      } catch (error) {
        console.error("Error loading branches:", error)
      }
    }
    loadBranches()
  }, [])

  return (
    <section className="px-6 py-24 bg-[#faf7f2]">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-playfair text-4xl text-center mb-12 text-[#2c2420]">Restaurants</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {branches.map((branch: any, index: number) => (
            <motion.div
              key={branch._id}
              className="group"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-[#e8e2d9] rounded-lg shadow-lg">
                <img
                  src={branch.image || "/placeholder-branch.jpg"}
                  alt={branch.name}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="p-6 bg-white rounded-b-lg shadow-lg transform -translate-y-8 transition-transform duration-300 group-hover:-translate-y-12">
                <h3 className="text-2xl font-playfair font-semibold text-[#2c2420] mb-2">{branch.name}</h3>
                <p className="text-[#8b5d3b] mb-1">{branch.email}</p>
                <p className="text-[#8b5d3b]">{branch.phone}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Gallery

