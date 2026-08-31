"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

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
    weight: string;
    price: number;
    originalPrice?: number;
  }[];
  stock: number;
}

export interface CartItem {
  id: string;
  product: Product;
  selectedWeight: string;
  price: number;
  quantity: number;
}

export interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  addressLabel: string | null;
  capturedAt: string | null;
}

export interface Address {
  id: string;
  tag: "Home" | "Work" | "Other";
  addressLine: string;
  city: string;
  pincode: string;
  geoLocation?: GeoLocation | null;
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
  geoLocation?: GeoLocation | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerName?: string | null;
  isGuestOrder?: boolean;
  instructions?: string;
}

export interface StoreSettings {
  openingTime: string;
  closingTime: string;
  isTemporarilyClosed: boolean;
  holidayMode: boolean;
  storeName?: string;
  phone?: string;
  email?: string;
  address?: string;
  minOrderAmount?: number;
  freeDeliveryAbove?: number;
  deliveryRadiusKm?: number;
}

export interface PublicUser {
  role: string;
  id?: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  isAdmin?: boolean;
  createdAt?: string;
}

interface ApiResult<T = any> {
  success: boolean;
  error?: string;
  data?: T;
  [k: string]: any;
}

interface AppContextType {
  // Initialization & backend state
  isInitialized: boolean;
  isLoadingBackend: boolean;
  hydrateFromBackend: () => Promise<void>;

  products: Product[];
  addProduct: (product: Omit<Product, "id">) => Promise<Product | null>;
  updateProduct: (id: string, updated: Partial<Product>) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  refreshProducts: () => Promise<void>;

  locations: string[];
  addLocation: (location: string) => Promise<boolean>;
  removeLocation: (location: string) => Promise<boolean>;
  selectedLocation: string | null;
  selectLocation: (location: string) => void;

  storeSettings: StoreSettings;
  updateStoreSettings: (settings: Partial<StoreSettings>) => Promise<boolean>;
  isStoreOpen: () => boolean;
  getStoreStatusLabel: () => { label: string; color: string; nextTime: string };

  cart: CartItem[];
  addToCart: (product: Product, selectedWeight: string) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  appliedCoupon: { code: string; discountPercent: number } | null;
  applyCoupon: (code: string) => Promise<string | null>;
  removeCoupon: () => void;
  getCartSubtotal: () => number;
  getCartDiscount: () => number;
  getCartTotal: () => number;

  user: PublicUser | null;
  setUser: React.Dispatch<React.SetStateAction<PublicUser | null>>;
  login: (payload: { identifier: string; password?: string; otp?: string; method?: "password" | "otp" }) => Promise<{ success: boolean; error?: string }>;
  register: (payload: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<boolean>;
  fetchSession: () => Promise<void>;

  addAddress: (address: Omit<Address, "id">) => Promise<Address | null>;
  removeAddress: (id: string) => Promise<boolean>;
  refreshAddresses: () => Promise<void>;

  checkoutGeoLocation: GeoLocation | null;
  setCheckoutGeoLocation: React.Dispatch<React.SetStateAction<GeoLocation | null>>;
  captureGeoLocation: () => Promise<GeoLocation | null>;

  orders: Order[];
  placeOrder: (
    addressOrId: string | Omit<Address, "id">,
    paymentMethod: string,
    opts?: {
      instructions?: string;
      geoLocation?: GeoLocation | null;
      isGuest?: boolean;
      guestDetails?: { name: string; email: string; phone: string };
    }
  ) => Promise<Order | null>;
  refreshOrders: () => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order["status"]) => Promise<boolean>;
  reorderItems: (items: CartItem[]) => void;

  isAdmin: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const apiFetch = async <T = any,>(
  path: string,
  init: RequestInit = {}
): Promise<ApiResult<T>> => {
  const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";
  const base = path.startsWith("http") ? path : `${BACKEND_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const opts: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  };
  try {
    const r = await fetch(base, opts);
    const text = await r.text();
    let json: any = {};
    try { json = JSON.parse(text); } catch { /* noop */ }
    if (!r.ok) {
      return { success: false, error: json?.error || `HTTP ${r.status}`, ...json };
    }
    return json?.success === false
      ? { success: false, error: json?.error || "Failed", ...json }
      : { success: true, ...json, data: json?.data ?? json };
  } catch (e: any) {
    return { success: false, error: e?.message || "Network error" };
  }
};

const productFromAny = (p: any): Product => ({
  id: String(p.id || p._id),
  name: p.name,
  category: p.category,
  description: p.description,
  image: (p.image && p.image.trim())
    ? (p.image.startsWith("http") ? p.image : `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}${p.image.startsWith("/") ? p.image : `/${p.image}`}`)
    : "/chicken1.png",
  rating: Number(p.rating ?? 4.5),
  reviewsCount: Number(p.reviewsCount ?? 0),
  freshnessBadge: p.freshnessBadge || "Cut After Order",
  isBestSeller: !!p.isBestSeller,
  weights: Array.isArray(p.weights)
    ? p.weights.map((w: any) => ({
        weight: w.weight,
        price: Number(w.price),
        originalPrice: w.originalPrice != null ? Number(w.originalPrice) : undefined,
      }))
    : [],
  stock: Number(p.stock ?? 0),
  available: p.available !== false,
});

const DEFAULT_SETTINGS: StoreSettings = {
  openingTime: "14:00",
  closingTime: "02:00",
  isTemporarilyClosed: false,
  holidayMode: false,
  storeName: "Freshoo",
  phone: "+919999999999",
  email: "admin@freshoo.in",
  address: "Rohini Sector 22, Delhi",
  minOrderAmount: 149,
  freeDeliveryAbove: 299,
  deliveryRadiusKm: 5,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingBackend, setIsLoadingBackend] = useState(true);
  const didInit = useRef(false);

  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [appliedCouponData, setAppliedCouponData] = useState<{ discount: number } | null>(null);

  const [user, setUser] = useState<PublicUser | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkoutGeoLocation, setCheckoutGeoLocation] = useState<GeoLocation | null>(null);

  // Hydrate from localStorage immediately (for SSR/client split)
  useEffect(() => {
    try {
      const loc = localStorage.getItem("freshoo_location");
      if (loc) setSelectedLocation(loc);
      const savedCart = localStorage.getItem("freshoo_cart");
      if (savedCart) setCart(JSON.parse(savedCart));
      const savedSettings = localStorage.getItem("freshoo_settings");
      if (savedSettings) setStoreSettings(JSON.parse(savedSettings));
      const savedGeo = localStorage.getItem("freshoo_checkout_geo");
      if (savedGeo) setCheckoutGeoLocation(JSON.parse(savedGeo));
    } catch { /* noop */ }
  }, []);

  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    try { localStorage.setItem("freshoo_cart", JSON.stringify(newCart)); } catch { /* noop */ }
  };

  const refreshProducts = useCallback(async () => {
    const r = await apiFetch("/products", { method: "GET" });
    if (r.success && Array.isArray(r.data?.products)) {
      const ps = r.data.products.map(productFromAny);
      setProducts(ps);
      try { localStorage.setItem("freshoo_products", JSON.stringify(ps)); } catch { /* noop */ }
    } else if (products.length === 0) {
      // last resort: keep whatever is in storage
      try {
        const cached = localStorage.getItem("freshoo_products");
        if (cached) setProducts(JSON.parse(cached));
      } catch { /* noop */ }
    }
  }, [products.length]);

  const refreshLocations = useCallback(async () => {
    const r = await apiFetch("/locations", { method: "GET" });
    if (r.success && Array.isArray(r.data?.locations)) {
      setLocations(r.data.locations as string[]);
      try { localStorage.setItem("freshoo_locations", JSON.stringify(r.data.locations)); } catch { /* noop */ }
    } else {
      try {
        const cached = localStorage.getItem("freshoo_locations");
        if (cached) setLocations(JSON.parse(cached));
      } catch { /* noop */ }
    }
  }, []);

  const refreshSettings = useCallback(async () => {
    const r = await apiFetch("/settings", { method: "GET" });
    if (r.success && r.data?.settings) {
      const s: any = r.data.settings;
      const merged: StoreSettings = {
        openingTime: s.openingTime || DEFAULT_SETTINGS.openingTime,
        closingTime: s.closingTime || DEFAULT_SETTINGS.closingTime,
        isTemporarilyClosed: !!s.isTemporarilyClosed,
        holidayMode: !!s.holidayMode,
        storeName: s.storeName ?? DEFAULT_SETTINGS.storeName,
        phone: s.phone ?? DEFAULT_SETTINGS.phone,
        email: s.email ?? DEFAULT_SETTINGS.email,
        address: s.address ?? DEFAULT_SETTINGS.address,
        minOrderAmount: s.minOrderAmount != null ? Number(s.minOrderAmount) : DEFAULT_SETTINGS.minOrderAmount,
        freeDeliveryAbove: s.freeDeliveryAbove != null ? Number(s.freeDeliveryAbove) : DEFAULT_SETTINGS.freeDeliveryAbove,
        deliveryRadiusKm: s.deliveryRadiusKm != null ? Number(s.deliveryRadiusKm) : DEFAULT_SETTINGS.deliveryRadiusKm,
      };
      setStoreSettings(merged);
      try { localStorage.setItem("freshoo_settings", JSON.stringify(merged)); } catch { /* noop */ }
    }
  }, []);

  const fetchSession = useCallback(async () => {
    const r = await apiFetch("/auth/me", { method: "GET" });
    if (r.success && r.data?.user) {
      const u = r.data.user;
      setUser({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        addresses: Array.isArray(u.addresses) ? u.addresses : [],
        isAdmin: !!u.isAdmin,
        createdAt: u.createdAt,
      });
    } else {
      setUser(null);
      try { localStorage.removeItem("freshoo_user"); } catch { /* noop */ }
    }
  }, []);

  const refreshOrders = useCallback(async () => {
    const r = await apiFetch("/user/orders", { method: "GET" });
    if (r.success && Array.isArray(r.data?.orders)) {
      setOrders(r.data.orders as Order[]);
      try { localStorage.setItem("freshoo_orders", JSON.stringify(r.data.orders)); } catch { /* noop */ }
    } else {
      try {
        const cached = localStorage.getItem("freshoo_orders");
        if (cached) setOrders(JSON.parse(cached));
      } catch { /* noop */ }
    }
  }, []);

  const refreshAddresses = useCallback(async () => {
    const r = await apiFetch("/user/addresses", { method: "GET" });
    if (r.success && Array.isArray(r.data?.addresses)) {
      setUser((prev) => (prev ? { ...prev, addresses: r.data!.addresses as Address[] } : prev));
    }
  }, []);

  const hydrateFromBackend = useCallback(async () => {
    if (didInit.current) return;
    didInit.current = true;
    setIsLoadingBackend(true);
    try {
      await Promise.all([
        fetchSession(),
        refreshProducts(),
        refreshLocations(),
        refreshSettings(),
      ]);
      if (user) {
        await Promise.all([refreshOrders(), refreshAddresses()]);
      }
    } finally {
      setIsLoadingBackend(false);
      setIsInitialized(true);
    }
  }, [fetchSession, refreshProducts, refreshLocations, refreshSettings, refreshOrders, refreshAddresses, user]);

  // Keep user synced to localStorage
  useEffect(() => {
    if (user) {
      try { localStorage.setItem("freshoo_user", JSON.stringify(user)); } catch { /* noop */ }
    } else {
      try { localStorage.removeItem("freshoo_user"); } catch { /* noop */ }
    }
  }, [user]);

  // Hydrate once on mount
  useEffect(() => {
    void hydrateFromBackend();
  }, [hydrateFromBackend]);

  // After session is fetched, auto-refresh orders + addresses
  useEffect(() => {
    if (!isInitialized) return;
    if (user) {
      void refreshOrders();
      void refreshAddresses();
    } else {
      setOrders([]);
    }
  }, [user?.id, isInitialized, refreshOrders, refreshAddresses]);

  // ----- Geo Capture
  const captureGeoLocation = (): Promise<GeoLocation | null> => {
    return new Promise((resolve) => {
      if (typeof window === "undefined" || !("geolocation" in navigator)) {
        resolve(null);
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const geo: GeoLocation = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            addressLabel: null,
            capturedAt: new Date().toISOString(),
          };
          setCheckoutGeoLocation(geo);
          try { localStorage.setItem("freshoo_checkout_geo", JSON.stringify(geo)); } catch { /* noop */ }
          resolve(geo);
        },
        () => resolve(null),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  };

  // ----- Product Actions
  const addProduct = async (p: Omit<Product, "id">): Promise<Product | null> => {
    const r = await apiFetch("/products", {
      method: "POST",
      body: JSON.stringify(p),
    });
    if (r.success && r.data?.product) {
      const fresh = productFromAny(r.data.product);
      setProducts((prev) => [fresh, ...prev]);
      await refreshProducts();
      return fresh;
    }
    return null;
  };
  const updateProduct = async (id: string, updated: Partial<Product>): Promise<Product | null> => {
    const r = await apiFetch(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updated),
    });
    if (r.success && r.data?.product) {
      const fresh = productFromAny(r.data.product);
      setProducts((prev) => prev.map((p) => (p.id === id ? fresh : p)));
      return fresh;
    }
    return null;
  };
  const deleteProduct = async (id: string): Promise<boolean> => {
    const r = await apiFetch(`/products/${id}`, { method: "DELETE" });
    if (r.success) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return true;
    }
    return false;
  };

  // ----- Location Actions
  const addLocation = async (loc: string): Promise<boolean> => {
    const r = await apiFetch("/locations", {
      method: "POST",
      body: JSON.stringify({ name: loc }),
    });
    if (r.success && Array.isArray(r.data?.locations)) {
      setLocations(r.data.locations as string[]);
      return true;
    }
    if (!locations.includes(loc)) {
      const l = [...locations, loc];
      setLocations(l);
      try { localStorage.setItem("freshoo_locations", JSON.stringify(l)); } catch { /* noop */ }
    }
    return true;
  };
  const removeLocation = async (loc: string): Promise<boolean> => {
    const r = await apiFetch("/locations", {
      method: "DELETE",
      body: JSON.stringify({ name: loc }),
    });
    if (r.success && Array.isArray(r.data?.locations)) {
      setLocations(r.data.locations as string[]);
    } else {
      const l = locations.filter((x) => x !== loc);
      setLocations(l);
      try { localStorage.setItem("freshoo_locations", JSON.stringify(l)); } catch { /* noop */ }
    }
    if (selectedLocation === loc) {
      setSelectedLocation(null);
      try { localStorage.removeItem("freshoo_location"); } catch { /* noop */ }
    }
    return true;
  };
  const selectLocation = (loc: string) => {
    setSelectedLocation(loc);
    try { localStorage.setItem("freshoo_location", loc); } catch { /* noop */ }
  };

  // ----- Store Settings
  const updateStoreSettings = async (upd: Partial<StoreSettings>): Promise<boolean> => {
    const merged = { ...storeSettings, ...upd };
    setStoreSettings(merged);
    try { localStorage.setItem("freshoo_settings", JSON.stringify(merged)); } catch { /* noop */ }
    const r = await apiFetch("/settings", {
      method: "PATCH",
      body: JSON.stringify(upd),
    });
    return r.success;
  };
  const isStoreOpen = (): boolean => {
    if (storeSettings.isTemporarilyClosed || storeSettings.holidayMode) return false;
    const now = new Date();
    const totalMinutesNow = now.getHours() * 60 + now.getMinutes();
    const [openHour, openMin] = storeSettings.openingTime.split(":").map(Number);
    const [closeHour, closeMin] = storeSettings.closingTime.split(":").map(Number);
    const totalMinutesOpen = openHour * 60 + openMin;
    const totalMinutesClose = closeHour * 60 + closeMin;
    if (totalMinutesClose < totalMinutesOpen) {
      if (totalMinutesNow >= totalMinutesOpen || totalMinutesNow < totalMinutesClose) return true;
    } else {
      if (totalMinutesNow >= totalMinutesOpen && totalMinutesNow < totalMinutesClose) return true;
    }
    return false;
  };
  const formatTime = (timeStr: string) => {
    const [h, m] = timeStr.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMin} ${period}`;
  };
  const getStoreStatusLabel = () => {
    if (storeSettings.isTemporarilyClosed) {
      return { label: "Temporarily Closed", color: "bg-red-500 text-white", nextTime: "Check back later" };
    }
    if (storeSettings.holidayMode) {
      return { label: "Closed for Holiday", color: "bg-red-600 text-white", nextTime: "Opens tomorrow" };
    }
    if (isStoreOpen()) {
      return { label: "Open Now", color: "bg-emerald-500 text-white", nextTime: `Closes at ${formatTime(storeSettings.closingTime)}` };
    }
    return { label: "Closed", color: "bg-gray-400 text-white", nextTime: `Opens at ${formatTime(storeSettings.openingTime)}` };
  };

  // ----- Cart Actions
  const addToCart = (product: Product, selectedWeight: string) => {
    const option = product.weights.find((w) => w.weight === selectedWeight);
    if (!option) return;
    const cartItemId = `${product.id}-${selectedWeight}`;
    const idx = cart.findIndex((it) => it.id === cartItemId);
    if (idx > -1) {
      const nc = [...cart];
      nc[idx].quantity += 1;
      saveCart(nc);
    } else {
      saveCart([
        ...cart,
        { id: cartItemId, product, selectedWeight, price: option.price, quantity: 1 },
      ]);
    }
  };
  const removeFromCart = (cartItemId: string) => saveCart(cart.filter((it) => it.id !== cartItemId));
  const updateCartQuantity = (cartItemId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(cartItemId);
    saveCart(cart.map((it) => (it.id === cartItemId ? { ...it, quantity: qty } : it)));
  };
  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
    setAppliedCouponData(null);
  };

  // ----- Coupon via API
  const applyCoupon = async (code: string): Promise<string | null> => {
    const r = await apiFetch("/coupons/verify", {
      method: "POST",
      body: JSON.stringify({ code, subtotal: getCartSubtotal() }),
    });
    if (!r.success) return r.error || "Coupon not applicable";
    const data: any = r.data || {};
    if (data.coupon) setAppliedCoupon(data.coupon);
    if (typeof data.discount === "number") setAppliedCouponData({ discount: Number(data.discount) });
    return null;
  };
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setAppliedCouponData(null);
  };
  const getCartSubtotal = () => cart.reduce((s, it) => s + it.price * it.quantity, 0);
  const getCartDiscount = () => {
    if (appliedCouponData) return appliedCouponData.discount;
    if (!appliedCoupon) return 0;
    return Math.round((getCartSubtotal() * appliedCoupon.discountPercent) / 100);
  };
  const getCartTotal = () => Math.max(0, getCartSubtotal() - getCartDiscount());

  // ----- Auth
  const login = async (payload: {
    identifier: string;
    password?: string;
    otp?: string;
    method?: "password" | "otp";
  }): Promise<{ success: boolean; error?: string }> => {
    const r = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: payload.identifier,
        password: payload.password,
        otp: payload.otp,
        method: payload.method || "password",
      }),
    });
    if (r.success && r.data?.user) {
      const u = r.data.user;
      setUser({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        addresses: Array.isArray(u.addresses) ? u.addresses : [],
        isAdmin: !!u.isAdmin,
      });
      await refreshOrders();
      return { success: true };
    }
    return { success: false, error: r.error };
  };

  const register = async (payload: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> => {
    const r = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    if (r.success && r.data?.user) {
      const u = r.data.user;
      setUser({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        addresses: Array.isArray(u.addresses) ? u.addresses : [],
        isAdmin: !!u.isAdmin,
      });
      return { success: true };
    }
    return { success: false, error: r.error };
  };

  const logout = async (): Promise<boolean> => {
    await apiFetch("/auth/logout", { method: "POST" });
    setUser(null);
    setOrders([]);
    return true;
  };

  // ----- Addresses
  const addAddress = async (addr: Omit<Address, "id">): Promise<Address | null> => {
    if (!user) {
      // Can't save without backend if unauthed. Add to in-memory temporary.
      const fresh: Address = { ...addr, id: "addr-tmp-" + Date.now() };
      return fresh;
    }
    const r = await apiFetch("/user/addresses", {
      method: "POST",
      body: JSON.stringify(addr),
    });
    if (r.success && r.data?.address) {
      await refreshAddresses();
      return r.data.address as Address;
    }
    return null;
  };

  const removeAddress = async (id: string): Promise<boolean> => {
    if (!user) {
      setUser((prev) => (prev ? { ...prev, addresses: prev.addresses.filter((a) => a.id !== id) } : prev));
      return true;
    }
    const r = await apiFetch(`/user/addresses?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (r.success) {
      await refreshAddresses();
      return true;
    }
    return false;
  };

  // ----- Orders
  const placeOrder: AppContextType["placeOrder"] = async (
    addressOrId,
    paymentMethod,
    opts = {}
  ) => {
    if (cart.length === 0) return null;
    const { instructions, geoLocation, isGuest = false, guestDetails } = opts;

    let resolvedAddress: Omit<Address, "id"> | Address;
    if (typeof addressOrId === "string") {
      if (!user) return null;
      const found = user.addresses.find((a) => a.id === addressOrId);
      if (!found) return null;
      resolvedAddress = found;
    } else {
      resolvedAddress = addressOrId;
    }

    const finalGeo = geoLocation ?? checkoutGeoLocation ?? null;

    const r = await apiFetch("/orders", {
      method: "POST",
      body: JSON.stringify({
        items: cart,
        address: resolvedAddress,
        paymentMethod,
        instructions: instructions || "",
        geoLocation: finalGeo,
        isGuest: !user || isGuest,
        guestDetails,
        couponCode: appliedCoupon?.code,
      }),
    });

    if (!r.success || !r.data?.order) {
      alert(r.error || "Something went wrong while placing your order. Please try again.");
      return null;
    }
    const order = r.data.order as Order;
    // Fix id mismatch: backend uses friendlyId, frontend expects id
    if (!order.id && (order as any).friendlyId) {
      (order as any).id = (order as any).friendlyId;
    }
    // Map backend status (PENDING) to frontend label (Order Placed) if backend provided statusLabel
    if ((order as any).statusLabel && !order.status) {
      order.status = (order as any).statusLabel as Order["status"];
    }

    // Local updates — avoid duplicate if already present
    setOrders((prev) => {
      if (prev.find((p) => p.id === order.id)) return prev;
      const updated = [order, ...prev];
      try { localStorage.setItem("freshoo_orders", JSON.stringify(updated)); } catch { /* noop */ }
      return updated;
    });

    if (typeof addressOrId !== "string" && user && !isGuest) {
      // Try saving address
      await addAddress(resolvedAddress as Omit<Address, "id">);
    }

    clearCart();
    try { localStorage.removeItem("freshoo_checkout_geo"); } catch { /* noop */ }
    setCheckoutGeoLocation(null);
    if (user) await refreshOrders();

    return order;
  };

  const updateOrderStatus = async (orderId: string, status: Order["status"]): Promise<boolean> => {
    const r = await apiFetch(`/orders/${encodeURIComponent(orderId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    if (r.success && r.data?.order) {
      const updated = r.data.order as Order;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      return true;
    }
    // fallback
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    return r.success;
  };

  const reorderItems = (items: CartItem[]) => {
    const nc = [...cart];
    items.forEach((it) => {
      const idx = nc.findIndex((c) => c.id === it.id);
      if (idx > -1) nc[idx].quantity += it.quantity;
      else nc.push({ ...it });
    });
    saveCart(nc);
  };

  const isAdmin = !!(user?.isAdmin);

  return (
    <AppContext.Provider
      value={{
        isInitialized,
        isLoadingBackend,
        hydrateFromBackend,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        refreshProducts,
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
        login,
        register,
        logout,
        fetchSession,
        addAddress,
        removeAddress,
        refreshAddresses,
        checkoutGeoLocation,
        setCheckoutGeoLocation,
        captureGeoLocation,
        orders,
        placeOrder,
        refreshOrders,
        updateOrderStatus,
        reorderItems,
        isAdmin,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useApp must be used within an AppProvider");
  return context;
};
