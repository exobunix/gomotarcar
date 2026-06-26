import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../redux/store';
import { login as loginAction, logout as logoutAction, clearError } from '../redux/slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, supervisor, isLoading, error } = useSelector((s: RootState) => s.auth);

  const login = useCallback((phone: string, password: string) => {
    return dispatch(loginAction({ phone: `+91${phone}`, password }));
  }, [dispatch]);

  const logout = useCallback(() => {
    return dispatch(logoutAction());
  }, [dispatch]);

  const dismissError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  return {
    isAuthenticated,
    supervisor,
    isLoading,
    error,
    login,
    logout,
    dismissError,
  };
};

export default useAuth;
