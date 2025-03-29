export interface User {
  id: string;
  username: string;
  email: string;
  subscription: 'free' | 'pro' | 'enterprise';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface Feature {
  title: string;
  description: string;
  icon: React.ComponentType;
  endpoints?: string[];
}