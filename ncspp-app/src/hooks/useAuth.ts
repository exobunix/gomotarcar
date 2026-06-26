import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  login,
  register,
  logout,
  clearError,
  verifyGst,
  updateProfile,
} from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, loading, error, isGstVerified } = useSelector(
    (state: RootState) => state.auth,
  );

  const handleLogin = useCallback(
    (phone: string, password: string) => {
      return dispatch(login({ phone, password }));
    },
    [dispatch],
  );

  const handleRegister = useCallback(
    (data: {
      phone: string;
      password: string;
      name: string;
      email?: string;
      businessName: string;
    }) => {
      return dispatch(register(data));
    },
    [dispatch],
  );

  const handleVerifyGst = useCallback(
    (gstNumber: string) => {
      return dispatch(verifyGst(gstNumber));
    },
    [dispatch],
  );

  const handleUpdateProfile = useCallback(
    (data: any) => {
      return dispatch(updateProfile(data));
    },
    [dispatch],
  );

  const handleLogout = useCallback(() => {
    dispatch(logout());
  }, [dispatch]);

  const handleClearError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    user,
    token,
    loading,
    error,
    isGstVerified,
    isAuthenticated: !!token,
    login: handleLogin,
    register: handleRegister,
    verifyGst: handleVerifyGst,
    updateProfile: handleUpdateProfile,
    logout: handleLogout,
    clearError: handleClearError,
  };
};

export default useAuth;
