import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN' || _event === 'SIGNED_OUT' || _event === 'USER_UPDATED') {
        setSession(session);
        if (session?.user) {
          loadUserData(session.user);
        } else {
          setUser(null);
          localStorage.removeItem('isAdmin');
          setLoading(false);
        }
      } else if (_event === 'TOKEN_REFRESHED') {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (supabaseUser: SupabaseUser) => {
    setLoading(true);
    
    const cachedAdmin = localStorage.getItem('isAdmin') === 'true';
    
    const basicUser = {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email!.split('@')[0],
      isAdmin: cachedAdmin,
      role: cachedAdmin ? 'admin' : 'user'
    };

    try {
      // Try to get user from user_accounts table
      const { data: userData, error: userError } = await supabase
        .from('user_accounts')
        .select('Id, Email, Name, User_Type')
        .eq('Email', supabaseUser.email)
        .maybeSingle();
      
      if (!userError && userData) {
        const userInfo = {
          id: userData.Id.toString(),
          email: userData.Email,
          name: userData.Name || basicUser.name,
          isAdmin: userData.User_Type === 'admin',
          role: userData.User_Type
        };
        
        if (userInfo.isAdmin) {
          localStorage.setItem('isAdmin', 'true');
        } else {
          localStorage.removeItem('isAdmin');
        }
        
        setUser(userInfo);
      } else {
        // If user_accounts doesn't have data, just use basic user info
        localStorage.removeItem('isAdmin');
        setUser(basicUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      localStorage.removeItem('isAdmin');
      setUser(basicUser);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error || !data.session || !data.user) {
        console.error('Login error:', error);
        return false;
      }
      
      setSession(data.session);
      await loadUserData(data.user);
      return true;
    } catch (error) {
      console.error('Login exception:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    localStorage.removeItem('isAdmin');
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      login,
      logout,
      isAuthenticated: !!session && !!user,
      isAdmin: user?.isAdmin || false,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
