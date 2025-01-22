import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  isAdmin: boolean;
  username: string;
}

interface Profile {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (username: string, password: string) => Promise<void>;
  signUp: (username: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  async function fetchProfile(userId: string): Promise<Profile> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/profile/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const profileData = await response.json();
      return profileData;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      throw error;
    }
  }

  async function checkSession() {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No token found');
      }
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/session`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch session');
      }
      const session = await response.json();
      if (session?.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      } else {
        throw new Error('User data not found in session');
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      localStorage.removeItem('accessToken');
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchUserData(token: string): Promise<User> {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      throw error;
    }
  }

  async function signIn(username: string, password: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/auth`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        setUser(data.user);
        setProfile({ id: data.user.id, username: data.user.username });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async function signUp(username: string, password: string) {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/user/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        }
      );
      const data = await response.json();
      if (data.msg === 'Usuário criado com sucesso!') {
        await signIn(username, password);
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      localStorage.removeItem('accessToken');
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      throw error;
    }
  }

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}