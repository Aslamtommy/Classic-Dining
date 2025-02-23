"use client"

import { useState, useEffect } from "react"
// import { useSelector } from "react-redux"
import api from "../../Axios/userInstance"
import { toast } from "react-hot-toast"
import { Wallet, CreditCard, DollarSign, PlusCircle } from "lucide-react"
import { motion } from "framer-motion"

const WalletPage: React.FC = () => {
//   const user = useSelector((state: any) => state.user.user)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState([])
  const [amount, setAmount] = useState("")

  useEffect(() => {
    fetchWalletData()
  }, [])

  const fetchWalletData = async () => {
    try {
      const response: any = await api.get("/wallet")
      setBalance(response.data.balance)
      setTransactions(response.data.transactions)
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch wallet data")
    }
  }

  const handleAddMoney = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error("Please enter a valid amount")
      return
    }

    try {
      const response: any = await api.post("/wallet/add", { amount: Number(amount) })
      setBalance(response.data.balance)
      setTransactions(response.data.transactions)
      setAmount("")
      toast.success("Money added successfully")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add money")
    }
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen pt-24">
      <div className="max-w-4xl mx-auto px-6">
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Wallet Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] p-3 rounded-full">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-playfair text-3xl text-[#2c2420] font-bold">Wallet</h1>
              <p className="text-[#8b5d3b]">Manage your funds and transactions</p>
            </div>
          </div>

          {/* Balance Card */}
          <motion.div
            className="bg-gradient-to-r from-[#2c2420] to-[#8b5d3b] p-6 rounded-xl text-white mb-8"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">Current Balance</p>
                <p className="text-4xl font-bold">₹{balance.toFixed(2)}</p>
              </div>
              <DollarSign className="h-12 w-12 opacity-50" />
            </div>
          </motion.div>

          {/* Add Money Section */}
          <div className="mb-12">
            <h2 className="font-playfair text-2xl text-[#2c2420] mb-4">Add Funds</h2>
            <div className="flex gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-4 py-3 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2]"
              />
              <button
                onClick={handleAddMoney}
                className="bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <PlusCircle className="h-5 w-5" />
                Add Money
              </button>
            </div>
          </div>

          {/* Transactions */}
          <div>
            <h2 className="font-playfair text-2xl text-[#2c2420] mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {transactions.map((transaction: any) => (
                <motion.div
                  key={transaction.id}
                  className="bg-white p-4 rounded-lg shadow-sm border border-[#e8e2d9] hover:shadow-md transition-shadow"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${transaction.type === "credit" ? "bg-green-100" : "bg-red-100"}`}>
                        {transaction.type === "credit" ? (
                          <CreditCard className="h-5 w-5 text-green-600" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-[#2c2420] font-medium">{transaction.description}</p>
                        <p className="text-sm text-[#8b5d3b]">
                          {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-medium ${transaction.type === "credit" ? "text-green-600" : "text-red-600"}`}
                    >
                      {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                    </span>
                  </div>
                </motion.div>
              ))}
              {transactions.length === 0 && (
                <div className="text-center py-8 text-[#8b5d3b]">
                  No transactions yet
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default WalletPage