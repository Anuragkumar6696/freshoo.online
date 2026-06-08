"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Types
export interface Product {
  id: string;
  name: string;
  category: "Chicken" | "Mutton" | "Fish" | "Eggs";
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
  freshnessBadge: string;
  isBestSeller?: boolean;
  weights: {
    weight: string; // e.g. "500g", "1kg"
    price: number;
    originalPrice?: number;
  }[];
  stock: number; // units available
}

export interface CartItem {
  id: string; // unique ID composite of product.id + weight
  product: Product;
  selectedWeight: string;
  price: number;
  quantity: number;
}

export interface Address {
  id: string;
  tag: "Home" | "Work" | "Other";
  addressLine: string;
  city: string;
  pincode: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  address: Address;
  paymentMethod: string;
  status: "Order Placed" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";
}

export interface StoreSettings {
  openingTime: string; // "14:00"
  closingTime: string; // "02:00"
  isTemporarilyClosed: boolean;
  holidayMode: boolean;
}

interface AppContextType {
  products: Product[];
  addProduct: (product: Omit<Product, "id">) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  locations: string[];
  addLocation: (location: string) => void;
  removeLocation: (location: string) => void;
  selectedLocation: string | null;
  selectLocation: (location: string) => void;
  
  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => void;
  isStoreOpen: () => boolean;
  getStoreStatusLabel: () => { label: string; color: string; nextTime: string };
  
  cart: CartItem[];
  addToCart: (product: Product, selectedWeight: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: { code: string; discountPercent: number } | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartTotal: () => number;
  
  user: {
    name: string;
    email: string;
    phone: string;
    addresses: Address[];
  } | null;
  setUser: React.Dispatch<React.SetStateAction<{
    name: string;
    email: string;
    phone: string;
    addresses: Address[];
  } | null>>;
  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;
  
  orders: Order[];
  placeOrder: (addressId: string, paymentMethod: string, instructions?: string) => Order | null;
  updateOrderStatus: (orderId: string, status: Order["status"]) => void;
  reorderItems: (items: CartItem[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Products Data
const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Fresh Chicken Breast (Boneless)",
    category: "Chicken",
    description: "Tender, skinless and boneless chicken breast cuts. Perfect for salads, grilling, and high-protein meals.",
    image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=600",
    rating: 4.8,
    reviewsCount: 142,
    freshnessBadge: "Cut After Order",
    isBestSeller: true,
    weights: [
      { weight: "500g", price: 210, originalPrice: 240 },
      { weight: "1kg", price: 399, originalPrice: 480 }
    ],
    stock: 25
  },
  {
    id: "p2",
    name: "Premium Curry Cut Chicken",
    category: "Chicken",
    description: "Bone-in chicken cut into small pieces perfect for traditional Indian chicken curries and gravies.",
    image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&q=80&w=600",
    rating: 4.7,
    reviewsCount: 215,
    freshnessBadge: "Hygienically Handled",
    isBestSeller: true,
    weights: [
      { weight: "500g", price: 160, originalPrice: 190 },
      { weight: "1kg", price: 299, originalPrice: 380 }
    ],
    stock: 40
  },
  {
    id: "p3",
    name: "Fresh Mutton (Curry Cut)",
    category: "Mutton",
    description: "Premium bone-in goat meat cuts from shoulder and leg portions. Rich taste, tender, and juicy.",
    image: "chicken2.png",
    rating: 4.9,
    reviewsCount: 88,
    freshnessBadge: "Premium Local Meat",
    isBestSeller: true,
    weights: [
      { weight: "500g", price: 390, originalPrice: 450 },
      { weight: "1kg", price: 749, originalPrice: 899 }
    ],
    stock: 15
  },
  {
    id: "p4",
    name: "Fresh Rohu Fish (Steaks)",
    category: "Fish",
    description: "Freshwater Rohu fish cut into neat steaks. Cleaned, scaled and ready for frying or making curry.",
    image: "/fish.png",
    rating: 4.6,
    reviewsCount: 64,
    freshnessBadge: "Daily Catch",
    weights: [
      { weight: "500g", price: 220, originalPrice: 260 },
      { weight: "1kg", price: 410, originalPrice: 500 }
    ],
    stock: 18
  },
  {
    id: "p5",
    name: "Organic Farm-Fresh Eggs",
    category: "Eggs",
    description: "High-protein brown eggs sourced directly from healthy, free-range local poultry farms.",
    image: "/egg.jpeg",
    rating: 4.9,
    reviewsCount: 198,
    freshnessBadge: "Farm Sourced",
    isBestSeller: true,
    weights: [
      { weight: "6 Pcs", price: 55, originalPrice: 65 },
      { weight: "12 Pcs", price: 99, originalPrice: 120 },
      { weight: "30 Pcs", price: 230, originalPrice: 280 }
    ],
    stock: 50
  },
  {
    id: "p6",
    name: "Tender Mutton Chops",
    category: "Mutton",
    description: "Juicy ribs/chops of premium goat meat. Perfect for pan searing, grilling, or rich masala chops.",
    image: "/chicken1.png",
    rating: 4.8,
    reviewsCount: 42,
    freshnessBadge: "100% Fresh Cut",
    weights: [
      { weight: "500g", price: 420, originalPrice: 499 }
    ],
    stock: 10
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [locations, setLocations] = useState<string[]>(["Rohini Sector 22, Delhi", "Saket, Delhi"]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    openingTime: "14:00", // 2 PM
    closingTime: "02:00", // 2 AM (Next Day)
    isTemporarilyClosed: false,
    holidayMode: false,
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);

  // Mock User State
  const [user, setUser] = useState<{
    name: string;
    email: string;
    phone: string;
    addresses: Address[];
  } | null>({
    name: "Amit Sharma",
    email: "freshoo.online@gmail.com",
    phone: "+91 9310593167",
    addresses: [
      { id: "addr-1", tag: "Home", addressLine: "H-16/22, Sector 22, Rohini", city: "Delhi", pincode: "110086" },
      { id: "addr-2", tag: "Work", addressLine: "A-54, Saket District Centre", city: "New Delhi", pincode: "110017" }
    ]
  });

  const [orders, setOrders] = useState<Order[]>([]);

  // Load state from localStorage on mount
  useEffect(() => {
    const loc = localStorage.getItem("freshoo_location");
    if (loc) setSelectedLocation(loc);

    const savedCart = localStorage.getItem("freshoo_cart");
    if (savedCart) setCart(JSON.parse(savedCart));

    const savedSettings = localStorage.getItem("freshoo_settings");
    if (savedSettings) setStoreSettings(JSON.parse(savedSettings));

    const savedProducts = localStorage.getItem("freshoo_products");
    if (savedProducts) setProducts(JSON.parse(savedProducts));

    const savedLocations = localStorage.getItem("freshoo_locations");
    if (savedLocations) setLocations(JSON.parse(savedLocations));

    const savedOrders = localStorage.getItem("freshoo_orders");
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Save specific states to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem("freshoo_cart", JSON.stringify(newCart));
  };

  // Product Actions
  const addProduct = (p: Omit<Product, "id">) => {
    const newProd = { ...p, id: "p-" + Date.now() };
    const updated = [newProd, ...products];
    setProducts(updated);
    localStorage.setItem("freshoo_products", JSON.stringify(updated));
  };

  const updateProduct = (id: string, updated: Partial<Product>) => {
    const updatedList = products.map((p) => (p.id === id ? { ...p, ...updated } : p));
    setProducts(updatedList);
    localStorage.setItem("freshoo_products", JSON.stringify(updatedList));
  };

  const deleteProduct = (id: string) => {
    const updatedList = products.filter((p) => p.id !== id);
    setProducts(updatedList);
    localStorage.setItem("freshoo_products", JSON.stringify(updatedList));
  };

  // Location Actions
  const addLocation = (loc: string) => {
    if (!locations.includes(loc)) {
      const updated = [...locations, loc];
      setLocations(updated);
      localStorage.setItem("freshoo_locations", JSON.stringify(updated));
    }
  };

  const removeLocation = (loc: string) => {
    const updated = locations.filter((l) => l !== loc);
    setLocations(updated);
    localStorage.setItem("freshoo_locations", JSON.stringify(updated));
    if (selectedLocation === loc) {
      setSelectedLocation(null);
      localStorage.removeItem("freshoo_location");
    }
  };

  const selectLocation = (loc: string) => {
    setSelectedLocation(loc);
    localStorage.setItem("freshoo_location", loc);
  };

  // Store Setting / Timing Actions
  const updateStoreSettings = (settings: Partial<StoreSettings>) => {
    const updated = { ...storeSettings, ...settings };
    setStoreSettings(updated);
    localStorage.setItem("freshoo_settings", JSON.stringify(updated));
  };

  // Check if store is open
  const isStoreOpen = (): boolean => {
    if (storeSettings.isTemporarilyClosed || storeSettings.holidayMode) return false;

    // Standard local time parsing (e.g. 14:00 to 02:00)
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const totalMinutesNow = currentHour * 60 + currentMinute;

    const [openHour, openMin] = storeSettings.openingTime.split(":").map(Number);
    const [closeHour, closeMin] = storeSettings.closingTime.split(":").map(Number);

    const totalMinutesOpen = openHour * 60 + openMin;
    const totalMinutesClose = closeHour * 60 + closeMin;

    if (totalMinutesClose < totalMinutesOpen) {
      // Overlap to next day (e.g. closes at 2 AM)
      if (totalMinutesNow >= totalMinutesOpen || totalMinutesNow < totalMinutesClose) {
        return true;
      }
    } else {
      if (totalMinutesNow >= totalMinutesOpen && totalMinutesNow < totalMinutesClose) {
        return true;
      }
    }
    return false;
  };

  // Get Store Status label, color and next opening details
  const getStoreStatusLabel = () => {
    if (storeSettings.isTemporarilyClosed) {
      return { label: "Temporarily Closed", color: "bg-red-500 text-white", nextTime: "Check back later" };
    }
    if (storeSettings.holidayMode) {
      return { label: "Closed for Holiday", color: "bg-red-600 text-white", nextTime: "Opens tomorrow" };
    }
    const open = isStoreOpen();
    if (open) {
      return { label: "Open Now", color: "bg-emerald-500 text-white", nextTime: `Closes at ${formatTime(storeSettings.closingTime)}` };
    } else {
      return { label: "Closed", color: "bg-gray-400 text-white", nextTime: `Opens at ${formatTime(storeSettings.openingTime)}` };
    }
  };

  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMin} ${period}`;
  };

  // Cart Actions
  const addToCart = (product: Product, selectedWeight: string) => {
    const itemOption = product.weights.find((w) => w.weight === selectedWeight);
    if (!itemOption) return;

    const cartItemId = `${product.id}-${selectedWeight}`;
    const existingIndex = cart.findIndex((item) => item.id === cartItemId);

    if (existingIndex > -1) {
      const updatedCart = [...cart];
      updatedCart[existingIndex].quantity += 1;
      saveCart(updatedCart);
    } else {
      const newItem: CartItem = {
        id: cartItemId,
        product,
        selectedWeight,
        price: itemOption.price,
        quantity: 1,
      };
      saveCart([...cart, newItem]);
    }
  };

  const removeFromCart = (cartItemId: string) => {
    const updatedCart = cart.filter((item) => item.id !== cartItemId);
    saveCart(updatedCart);
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    const updatedCart = cart.map((item) => (item.id === cartItemId ? { ...item, quantity } : item));
    saveCart(updatedCart);
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
  };

  // Coupon System (e.g. FRESH100 gives 100 off on 500+ order, WELCOME20 gives 20% off)
  const applyCoupon = (code: string): boolean => {
    const cleanedCode = code.trim().toUpperCase();
    if (cleanedCode === "FRESH100" && getCartSubtotal() >= 499) {
      setAppliedCoupon({ code: "FRESH100", discountPercent: 15 }); // 15% off
      return true;
    }
    if (cleanedCode === "WELCOME20") {
      setAppliedCoupon({ code: "WELCOME20", discountPercent: 20 });
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getCartDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = getCartSubtotal();
    return Math.round((subtotal * appliedCoupon.discountPercent) / 100);
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    return Math.max(0, subtotal - discount); // No delivery charge
  };

  // User Profile Addresses
  const addAddress = (addr: Omit<Address, "id">) => {
    if (!user) return;
    const newAddr: Address = { ...addr, id: "addr-" + Date.now() };
    const updatedUser = {
      ...user,
      addresses: [...user.addresses, newAddr],
    };
    setUser(updatedUser);
  };

  const removeAddress = (id: string) => {
    if (!user) return;
    const updatedUser = {
      ...user,
      addresses: user.addresses.filter((a) => a.id !== id),
    };
    setUser(updatedUser);
  };

  // Order Placement Actions
  const placeOrder = (addressId: string, paymentMethod: string, _instructions?: string) => {
    if (!user || cart.length === 0) return null;
    const address = user.addresses.find((a) => a.id === addressId);
    if (!address) return null;

    const newOrder: Order = {
      id: "FRSH-" + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      items: [...cart],
      subtotal: getCartSubtotal(),
      discount: getCartDiscount(),
      total: getCartTotal(),
      address,
      paymentMethod,
      status: "Order Placed",
    };

    const updatedOrders = [newOrder, ...orders];
    setOrders(updatedOrders);
    localStorage.setItem("freshoo_orders", JSON.stringify(updatedOrders));

    // Clear cart
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: Order["status"]) => {
    const updatedList = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updatedList);
    localStorage.setItem("freshoo_orders", JSON.stringify(updatedList));
  };

  const reorderItems = (items: CartItem[]) => {
    const updatedCart = [...cart];
    items.forEach((item) => {
      const cartItemId = item.id;
      const existingIndex = updatedCart.findIndex((c) => c.id === cartItemId);
      if (existingIndex > -1) {
        updatedCart[existingIndex].quantity += item.quantity;
      } else {
        updatedCart.push({ ...item });
      }
    });
    saveCart(updatedCart);
  };

  return (
    <AppContext.Provider
      value={{
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        locations,
        addLocation,
        removeLocation,
        selectedLocation,
        selectLocation,
        storeSettings,
        updateStoreSettings,
        isStoreOpen,
        getStoreStatusLabel,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        getCartSubtotal,
        getCartDiscount,
        getCartTotal,
        user,
        setUser,
        addAddress,
        removeAddress,
        orders,
        placeOrder,
        updateOrderStatus,
        reorderItems,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
