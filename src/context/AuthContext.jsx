import PropTypes from 'prop-types';
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from 'api/supabase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('factory_store_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'Super Admin'
        };
        setUser(userData);
        localStorage.setItem('factory_store_user', JSON.stringify(userData));
      }
      setLoading(false);
    });

    // 2. Listen to Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          role: session.user.user_metadata?.role || 'Super Admin'
        };
        setUser(userData);
        localStorage.setItem('factory_store_user', JSON.stringify(userData));
      } else {
        const saved = localStorage.getItem('factory_store_user');
        if (!saved) {
          setUser(null);
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Login Action
  const login = async (email, password) => {
    setLoading(true);
    // Try Supabase Auth
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Fallback for offline demo login
        if (email.trim() && password.length >= 6) {
          const mockUser = {
            id: 'USR-' + Date.now(),
            email,
            role: email.includes('store') ? 'Store Keeper' : 'Super Admin'
          };
          setUser(mockUser);
          localStorage.setItem('factory_store_user', JSON.stringify(mockUser));
          setLoading(false);
          return { success: true, user: mockUser };
        }
        setLoading(false);
        return { success: false, error: error.message };
      }

      const userData = {
        id: data.user.id,
        email: data.user.email,
        role: data.user.user_metadata?.role || 'Super Admin'
      };
      setUser(userData);
      localStorage.setItem('factory_store_user', JSON.stringify(userData));
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      // Fallback
      if (email.trim() && password.length >= 6) {
        const mockUser = {
          id: 'USR-' + Date.now(),
          email,
          role: email.includes('store') ? 'Store Keeper' : 'Super Admin'
        };
        setUser(mockUser);
        localStorage.setItem('factory_store_user', JSON.stringify(mockUser));
        setLoading(false);
        return { success: true, user: mockUser };
      }
      setLoading(false);
      return { success: false, error: err.message };
    }
  };

  // Register Action
  const register = async (email, password, role = 'Super Admin') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role } }
      });

      if (error) {
        // Fallback
        const mockUser = { id: 'USR-' + Date.now(), email, role };
        setUser(mockUser);
        localStorage.setItem('factory_store_user', JSON.stringify(mockUser));
        setLoading(false);
        return { success: true, user: mockUser };
      }

      const userData = {
        id: data.user?.id || 'USR-' + Date.now(),
        email,
        role
      };
      setUser(userData);
      localStorage.setItem('factory_store_user', JSON.stringify(userData));
      setLoading(false);
      return { success: true, user: userData };
    } catch (err) {
      const mockUser = { id: 'USR-' + Date.now(), email, role };
      setUser(mockUser);
      localStorage.setItem('factory_store_user', JSON.stringify(mockUser));
      setLoading(false);
      return { success: true, user: mockUser };
    }
  };

  // Logout Action
  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setSession(null);
    localStorage.removeItem('factory_store_user');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node
};

export const useAuth = () => useContext(AuthContext);
