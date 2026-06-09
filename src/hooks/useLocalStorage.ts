import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      setStoredValue((prevValue) => {
        const valueToStore = value instanceof Function ? value(prevValue) : value;
        try {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (storageError) {
          console.warn("useLocalStorage: Failed to write to localStorage due to quota or sandbox limits:", storageError);
        }
        return valueToStore;
      });
    } catch (error) {
      console.error("useLocalStorage setter fatal error:", error);
    }
  };

  return [storedValue, setValue];
}
