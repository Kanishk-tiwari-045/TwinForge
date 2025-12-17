// Mock Supabase client for compatibility
// Since we're using Neon DB directly on the backend, we don't have Supabase Auth
// This is a localStorage-based mock for authentication features

interface User {
  id: string;
  email: string;
  username?: string;
}

interface AuthResponse {
  data: {
    user: User | null;
  };
  error: Error | null;
}

interface Profile {
  id: string;
  username: string;
  email: string;
  subscription: string;
}

// Mock authentication service
const createMockAuthService = () => {
  return {
    auth: {
      signUp: async ({ email, password, options }: any): Promise<AuthResponse> => {
        // Mock signup - store in localStorage
        const userId = `user_${Date.now()}`;
        const user = { id: userId, email, username: options?.data?.username };
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_session', 'true');
        return { data: { user }, error: null };
      },
      signInWithPassword: async ({ email, password }: any): Promise<AuthResponse> => {
        // Mock login - in real app, this would validate against backend
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          localStorage.setItem('auth_session', 'true');
          return { data: { user }, error: null };
        }
        // For demo, allow any login to create a new user
        const userId = `user_${Date.now()}`;
        const user = { id: userId, email };
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_session', 'true');
        return { data: { user }, error: null };
      },
      getUser: async (): Promise<AuthResponse> => {
        const session = localStorage.getItem('auth_session');
        const storedUser = localStorage.getItem('auth_user');
        if (session === 'true' && storedUser) {
          return { data: { user: JSON.parse(storedUser) }, error: null };
        }
        return { data: { user: null }, error: null };
      },
      signOut: async () => {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_session');
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        return { error: null };
      }
    },
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            // Mock database queries for client-side compatibility
            if (table === 'profiles') {
              const user = JSON.parse(localStorage.getItem('auth_user') || '{}');
              return {
                data: {
                  id: user.id,
                  username: user.username || localStorage.getItem('username'),
                  email: user.email,
                  subscription: 'free',
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                } as Profile,
                error: null
              };
            }
            if (table === 'user_styles') {
              // Check if user style exists (mock)
              const styleKey = `user_style_${value}`;
              const style = localStorage.getItem(styleKey);
              if (style) {
                return { data: JSON.parse(style), error: null };
              }
              return { data: [], error: null };
            }
            return { data: null, error: null };
          }
        })
      }),
      insert: async (data: any) => {
        if (table === 'profiles') {
          // Store profile in localStorage
          if (Array.isArray(data) && data.length > 0) {
            localStorage.setItem('auth_user', JSON.stringify(data[0]));
          }
        }
        return { data, error: null };
      }
    })
  };
};

export const supabase = createMockAuthService() as any;
