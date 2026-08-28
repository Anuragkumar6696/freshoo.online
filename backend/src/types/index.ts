export enum UserRole {
  CUSTOMER = "CUSTOMER",
  ADMIN = "ADMIN",
  OPERATIONS = "OPERATIONS",
}

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  PROCESSING = "PROCESSING",
  PREPARING = "PREPARING",
  READY_FOR_COLLECTION = "READY_FOR_COLLECTION",
  COLLECTED = "COLLECTED",
  OUT_FOR_DELIVERY = "OUT_FOR_DELIVERY",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  COD = "COD",
  UPI = "UPI",
  CARD = "CARD",
  WALLET = "WALLET",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum RefundStatus {
  REQUESTED = "REQUESTED",
  APPROVED = "APPROVED",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  REJECTED = "REJECTED",
}

export enum ComplaintStatus {
  OPEN = "OPEN",
  IN_REVIEW = "IN_REVIEW",
  RESOLVED = "RESOLVED",
  REJECTED = "REJECTED",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

export enum NotificationType {
  ORDER_PLACED = "ORDER_PLACED",
  ORDER_CONFIRMED = "ORDER_CONFIRMED",
  ORDER_PREPARING = "ORDER_PREPARING",
  ORDER_OUT_FOR_DELIVERY = "ORDER_OUT_FOR_DELIVERY",
  ORDER_DELIVERED = "ORDER_DELIVERED",
  ORDER_CANCELLED = "ORDER_CANCELLED",
  OTP = "OTP",
  PROMOTIONAL = "PROMOTIONAL",
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  isAdmin: boolean;
}

export interface GeoLocation {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  addressLabel: string | null;
  capturedAt: string | null;
}

export interface Address {
  id?: string;
  tag: "Home" | "Work" | "Other";
  addressLine: string;
  city: string;
  pincode: string;
  geoLocation?: GeoLocation | null;
}

export interface ServiceabilityResult {
  isServiceable: boolean;
  distance?: number;
  estimatedDeliveryTime?: number;
  deliveryFee?: number;
  message?: string;
}
