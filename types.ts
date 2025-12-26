
export enum Theme {
  LIGHT = 'light',
  DARK = 'dark'
}

export enum Tab {
  PUBLIC = 'public',
  INFO = 'info',
  ACCOUNT = 'account'
}

export type UserRole = 'owner' | 'staff' | 'family';

export interface User {
  id: string;
  name: string;
  email: string;
  photo: string;
  role: UserRole;
  lastActive?: number;
  displayCurrency?: string; // e.g. "USD", "INR"
}

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price?: number;
  image?: string;
  salesCount: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  defaultMenu: MenuItem[];
}

export interface StaffStatus {
  name: string;
  email: string;
  lastActive: number;
  role: UserRole;
}

export interface ShopConfig {
  shopName: string;
  brandId: string;
  country: string;
  isOnboarded: boolean;
  ownerEmail?: string;
  staffEmails?: string[];
  familyEmails?: string[];
  staffPresence?: Record<string, StaffStatus>;
}

export interface Sale {
  id: string;
  itemId: string;
  itemName: string;
  amount: number;
  timestamp: number;
}

export interface DaySummary {
  id: string;
  date: number;
  totalRevenue: number;
  totalSales: number;
}
