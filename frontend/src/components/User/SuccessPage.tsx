import React from 'react';
import { useLocation } from 'react-router-dom';

const SuccessPage: React.FC = () => {
  const location = useLocation();
  const { paymentMethod, amount } = location.state || {};

  return (
    <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h1 className="font-playfair text-3xl text-[#2c2420] font-bold mb-4">
          Payment Successful!
        </h1>
        <p className="text-[#8b5d3b] text-lg">
          Payment Method: {paymentMethod || 'Unknown'}
        </p>
        <p className="text-[#8b5d3b] text-lg">Amount Paid: ₹{amount || 'Unknown'}</p>
        <p className="text-[#8b5d3b] mt-4">
          Your reservation has been confirmed. Thank you for booking with us!
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;