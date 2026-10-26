export interface UserAddress {
  _id?: string;
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  phone: string;
  isDefault?: boolean;
}

export interface User {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  phone?: string;
  role: "User" | "Admin" | "SuperAdmin";
  profilePicture?: {
    url: string;
    publicId: string;
  } | null;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  addresses?: UserAddress[];
  isActive?: boolean;
  isVerified?: boolean;
  isBanned?: boolean;
  banExpires?: string | null;
}

export interface AuthResponseData extends User {
  token?: string;
  accessToken?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  newPassword: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}
