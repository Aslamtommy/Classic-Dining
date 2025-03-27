import { useState, useEffect } from "react";
import api from "../../Axios/userInstance";
import { toast } from "react-hot-toast";
import { Wallet, CreditCard, DollarSign, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { WalletResponse, OrderResponse, ConfirmAddResponse, Transaction, RazorpayOptions, RazorpayResponse, RazorpayErrorResponse } from "../../types/wallet";
import { AxiosError } from "../../types/auth";

const WalletPage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const limit = 6;

  useEffect(() => {
    fetchWalletData(currentPage);
  }, [currentPage]);

  const fetchWalletData = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await api.get<WalletResponse>(`/wallet?page=${page}&limit=${limit}`);
      setBalance(response.data.data.balance);
      setTransactions(response.data.data.transactions);
      setTotalPages(Math.ceil(response.data.data.totalTransactions / limit));
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || "Failed to fetch wallet data", {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMoney = async () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount", { duration: 4000, position: 'top-center' });
      return;
    }
    try {
      setIsAdding(true);
      const response = await api.post<OrderResponse>('/wallet/create-order', { amount: parsedAmount });
      const orderData = response.data.data;

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
      });

      const options: RazorpayOptions = {
        key: 'rzp_test_ihsNz6lracNIu3',
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: 'ReserveBites',
        description: 'Add Money to Wallet',
        handler: async (response: RazorpayResponse) => {
          try {
            const confirmResponse = await api.post<ConfirmAddResponse>('/wallet/confirm-add', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: parsedAmount,
            });
            setBalance(confirmResponse.data.data.balance);
            setTransactions(confirmResponse.data.data.transactions);
            setAmount("");
            toast.success("Money added successfully", { duration: 4000, position: 'top-center' });
          } catch (error: unknown) {
            const axiosError = error as AxiosError;
            toast.error(axiosError.response?.data?.message || "Failed to confirm payment", {
              duration: 4000,
              position: 'top-center',
            });
          } finally {
            setIsAdding(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsAdding(false);
            toast.error("Payment cancelled", { duration: 4000, position: 'top-center' });
          },
        },
        theme: {
          color: '#8b5d3b',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response: RazorpayErrorResponse) => {
        toast.error(`Payment failed: ${response.error.description}`, {
          duration: 4000,
          position: 'top-center',
        });
        setIsAdding(false);
      });
      razorpay.open();

      // Cleanup script after use
      return () => {
        document.body.removeChild(script);
      };
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      toast.error(axiosError.response?.data?.message || "Failed to initiate payment", {
        duration: 4000,
        position: 'top-center',
      });
      setIsAdding(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8b5d3b]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen pt-15">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Wallet Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] p-3 rounded-full">
              <Wallet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="font-playfair text-3xl text-[#2c2420] font-bold">My Wallet</h1>
              <p className="text-[#8b5d3b] text-sm">Manage your funds</p>
            </div>
          </div>

          {/* Balance Display */}
          <motion.div
            className="bg-gradient-to-r from-[#2c2420] to-[#8b5d3b] p-6 rounded-lg text-white mb-6"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm opacity-80">Current Balance</p>
                <p className="text-3xl font-bold">₹{balance.toFixed(2)}</p>
              </div>
              <DollarSign className="h-10 w-10 opacity-50" />
            </div>
          </motion.div>

          {/* Add Money Section */}
          <div className="mb-8">
            <h2 className="font-playfair text-xl text-[#2c2420] mb-4">Add Funds</h2>
            <div className="flex gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="flex-1 px-4 py-2 border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2]"
                min="0"
                step="0.01"
              />
              <button
                onClick={handleAddMoney}
                disabled={isAdding || !amount || parseFloat(amount) <= 0}
                className={`px-6 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-lg flex items-center gap-2 ${
                  isAdding || !amount || parseFloat(amount) <= 0 ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                }`}
              >
                {isAdding ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <PlusCircle className="h-5 w-5" />
                    Add Money
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Transactions List */}
          <div>
            <h2 className="font-playfair text-xl text-[#2c2420] mb-4">Recent Transactions</h2>
            {transactions.length === 0 ? (
              <p className="text-[#8b5d3b] text-center py-4">No transactions yet</p>
            ) : (
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <motion.div
                    key={transaction._id}
                    className="bg-white p-4 rounded-lg shadow-sm border border-[#e8e2d9]"
                    whileHover={{ x: 5 }}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        {transaction.type === 'credit' ? (
                          <CreditCard className="h-5 w-5 text-green-500" />
                        ) : (
                          <DollarSign className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <p className="text-[#2c2420] font-medium">{transaction.description}</p>
                          <p className="text-sm text-[#8b5d3b]">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`font-medium ${
                          transaction.type === 'credit' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
            {/* Pagination Controls */}
            {transactions.length > 0 && (
              <div className="flex justify-between items-center mt-4">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-[#8b5d3b] text-white rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-[#2c2420]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-[#8b5d3b] text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WalletPage;