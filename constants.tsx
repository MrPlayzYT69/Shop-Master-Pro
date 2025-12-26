
import { Brand } from './types';

export const COUNTRIES = [
  { name: "India", currency: "INR", symbol: "₹", rateToUSD: 0.012 },
  { name: "United States", currency: "USD", symbol: "$", rateToUSD: 1 },
  { name: "United Kingdom", currency: "GBP", symbol: "£", rateToUSD: 1.27 },
  { name: "Germany", currency: "EUR", symbol: "€", rateToUSD: 1.08 },
  { name: "Japan", currency: "JPY", symbol: "¥", rateToUSD: 0.0067 },
  { name: "United Arab Emirates", currency: "AED", symbol: "د.إ", rateToUSD: 0.27 },
  { name: "Canada", currency: "CAD", symbol: "$", rateToUSD: 0.74 }
];

export const getCountryData = (countryName: string) => {
  return COUNTRIES.find(c => c.name === countryName) || COUNTRIES[1];
};

export const convertPrice = (amount: number, fromCountry: string, toCurrencyCode: string) => {
  const fromData = getCountryData(fromCountry);
  const toData = COUNTRIES.find(c => c.currency === toCurrencyCode) || fromData;
  
  const inUSD = amount * fromData.rateToUSD;
  return {
    value: inUSD / toData.rateToUSD,
    symbol: toData.symbol
  };
};

export const BRANDS: Brand[] = [
  {
    id: 'mcdonalds',
    name: "McDonald's",
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png',
    defaultMenu: [
      { id: 'mc-1', name: 'Big Mac', category: 'Burger', salesCount: 0, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400' },
      { id: 'mc-2', name: 'Large Fries', category: 'Sides', salesCount: 0, image: 'https://images.unsplash.com/photo-1573016608244-7d5cf169c97b?w=400' },
    ]
  },
  {
    id: 'waghbakri',
    name: 'Wagh Bakri Tea',
    logoUrl: 'https://www.waghbakritea.com/assets/images/logo.png',
    defaultMenu: [
      { id: 'wb-1', name: 'Masala Chai', category: 'Tea', salesCount: 0 },
      { id: 'wb-2', name: 'Ginger Tea', category: 'Tea', salesCount: 0 },
      { id: 'wb-3', name: 'Green Tea', category: 'Tea', salesCount: 0 },
    ]
  },
  {
    id: 'chinese',
    name: 'Chinese Express',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/1041/1041373.png',
    defaultMenu: [
      { id: 'ch-1', name: 'Hakka Noodles', category: 'Main', salesCount: 0 },
      { id: 'ch-2', name: 'Manchurian', category: 'Starter', salesCount: 0 },
      { id: 'ch-3', name: 'Spring Rolls', category: 'Starter', salesCount: 0 },
    ]
  },
  {
    id: 'fok',
    name: 'Fok Restaurant',
    logoUrl: 'https://cdn-icons-png.flaticon.com/512/1160/1160358.png',
    defaultMenu: [
      { id: 'fok-1', name: 'Fok Special Pizza', category: 'Pizza', salesCount: 0 },
      { id: 'fok-2', name: 'Pasta Arrabiata', category: 'Pasta', salesCount: 0 },
    ]
  },
  {
    id: 'starbucks',
    name: 'Starbucks',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png',
    defaultMenu: [
      { id: 'sb-1', name: 'Caffè Latte', category: 'Coffee', salesCount: 0, image: 'https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400' },
      { id: 'sb-2', name: 'Caramel Macchiato', category: 'Coffee', salesCount: 0, image: 'https://images.unsplash.com/photo-1485808191679-5f6333f17c81?w=400' },
    ]
  }
];
