
export type UserLogin = {
  email: string;
  password: string;
};

export type ProfileUser = {
  id: number;
  name: string;
  phone?: string;
  email: string;
  status: string;
  role: string;
  profilePictureUrl: string;
};

export type UserRegister = {
  name: string;
  email: string;
  phone?: string;
  acceptTerms: boolean;
};

export type StatusRegister = "success" | "error" | "idle";

