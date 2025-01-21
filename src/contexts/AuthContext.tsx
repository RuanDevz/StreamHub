import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  username?: string;
}

interface Profile {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sessão ativa ao carregar o componente
    checkSession();
  }, []);

  async function checkSession() {
    setLoading(true);
    try {
      // Substitua por sua lógica para verificar a sessão do usuário
      const session = await fetch('/api/auth/session').then((res) => res.json());
      if (session.user) {
        setUser(session.user);
        const userProfile = await fetchProfile(session.user.id);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProfile(userId: string): Promise<Profile | null> {
    try {
      // Substitua por sua lógica para buscar o perfil do usuário
      const response = await fetch(`/api/profile/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }
  }

  async function signIn(email: string, password: string) {
    try {
      // Substitua por sua lógica de autenticação
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw error;
    }
  }

  async function signUp(email: string, password: string, username: string) {
    try {
      // Substitua por sua lógica de registro
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });
      const data = await response.json();
      if (data.user) {
        setUser(data.user);
        const userProfile = await fetchProfile(data.user.id);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      // Substitua por sua lógica de logout
      await fetch('/api/auth/signout', { method: 'POST' });
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