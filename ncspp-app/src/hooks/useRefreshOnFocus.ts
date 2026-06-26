import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

export const useRefreshOnFocus = (callback: () => void) => {
  const navigation = useNavigation();
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  useEffect(() => {
    callbackRef.current();

    const unsubscribe = navigation.addListener('focus', () => {
      callbackRef.current();
    });

    return unsubscribe;
  }, [navigation]);
};

export default useRefreshOnFocus;
