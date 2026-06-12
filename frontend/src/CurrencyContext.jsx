import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => useContext(CurrencyContext);

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || 'IDR');
  const [exchangeRate, setExchangeRate] = useState(parseFloat(localStorage.getItem('exchangeRate')) || 16000);
  const [rateSource, setRateSource] = useState(localStorage.getItem('rateSource') || 'manual');

  // Save preferences whenever they change
  useEffect(() => {
    localStorage.setItem('currency', currency);
    localStorage.setItem('exchangeRate', exchangeRate);
    localStorage.setItem('rateSource', rateSource);
  }, [currency, exchangeRate, rateSource]);

  // Fetch real-time exchange rates if "api" is selected (useful for USD conversion)
  useEffect(() => {
    if (rateSource === 'api') {
      fetch('https://open.er-api.com/v6/latest/USD')
        .then(res => res.json())
        .then(data => {
          if (data && data.rates && data.rates.IDR) {
            setExchangeRate(data.rates.IDR);
          }
        })
        .catch(err => console.error("Failed to fetch exchange rate", err));
    }
  }, [currency, rateSource]);

  // Standard Number Formatter
  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    
    if (currency === 'USD') {
      const converted = num / (exchangeRate || 16000);
      return new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD' 
      }).format(converted);
    } else {
      return new Intl.NumberFormat('id-ID', { 
        style: 'currency', 
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      }).format(num);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, exchangeRate, setExchangeRate, rateSource, setRateSource, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};