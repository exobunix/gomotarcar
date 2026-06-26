import { useEffect, useCallback } from 'react';

export const useRefreshOnFocus = (navigation: any, callback: () => void) => {
  useEffect(() => {
    // Initial load
    callback();

    // Reload on focus
    const unsubscribe = navigation.addListener('focus', callback);
    return unsubscribe;
  }, [navigation, callback]);
};

export default useRefreshOnFocus;
