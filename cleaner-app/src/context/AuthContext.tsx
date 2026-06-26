import React, { createContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosClient from '../api/axiosClient';

interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  userData: any | null;
  login: (token: string, user: any) => void;
  logout: () => void;
  updateUser: (user: any) => void;
}

export const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  userData: null,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<any | null>(null);

  const login = async (token: string, user: any) => {
    setIsLoading(true);
    setUserToken(token);
    setUserData(user);
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
    setIsLoading(false);
  };

  const logout = async () => {
    setIsLoading(true);
    setUserToken(null);
    setUserData(null);
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setIsLoading(false);
  };

  const updateUser = async (user: any) => {
    setUserData(user);
    await AsyncStorage.setItem('userData', JSON.stringify(user));
  };

  const isLoggedIn = async () => {
    try {
      setIsLoading(true);
      let token = await AsyncStorage.getItem('userToken');
      let user = await AsyncStorage.getItem('userData');

      if (token && user) {
        setUserToken(token);
        setUserData(JSON.parse(user));
        // Optionally fetch fresh profile data here
        try {
          const res = await axiosClient.get('/auth/profile');
          if (res.data?.success) {
            setUserData(res.data.data);
            await AsyncStorage.setItem('userData', JSON.stringify(res.data.data));
          }
        } catch (e) {
          console.log('Error fetching fresh profile', e);
        }
      }
      setIsLoading(false);
    } catch (e) {
      console.log(`isLoggedIn error ${e}`);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    isLoggedIn();
  }, []);

  return (
    <AuthContext.Provider value={{ login, logout, updateUser, isLoading, userToken, userData }}>
      {children}
    </AuthContext.Provider>
  );
};
