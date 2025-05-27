// PaymentContext.js
import React, { createContext, useContext, useState } from 'react';

const PaymentContext = createContext();

export const PaymentProvider = ({ children }) => {
  const [paymentData, setPaymentData] = useState({});

  const setPaymentInfo = (data) => {
    setPaymentData(data);
    sessionStorage.setItem('paymentData', JSON.stringify(data));
  };

  return (
    <PaymentContext.Provider value={{ paymentData, setPaymentInfo }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => useContext(PaymentContext);
