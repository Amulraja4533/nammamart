export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  countInStock: number;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  isAdmin: boolean;
  token?: string;
}

export interface CartItem extends Product {
  qty: number;
}

export interface Order {
  _id: string;
  user: { name: string; email: string; phone?: string };
  orderItems: CartItem[];
  shippingAddress: { address: string; city: string; postalCode: string };
  paymentMethod: 'COD' | 'Razorpay' | 'ONLINE_QR';
  totalPrice: number;
  isPaid: boolean;
  isShipped: boolean;
  isDelivered: boolean;
  isCancelled: boolean;
  createdAt: string;
}