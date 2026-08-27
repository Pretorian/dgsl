import { useState } from 'react';

/**
 * Custom hook for managing localStorage state
 * @param {string} key - The localStorage key
 * @param {any} initialValue - The initial value if nothing is in localStorage
 * @param {boolean} isJSON - Whether to JSON parse/stringify the value
 * @returns {[any, Function]} - The state value and setter function
 */
export const useLocalStorage = (key, initialValue, isJSON = false) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      if (item) {
        return isJSON ? JSON.parse(item) : item;
      }
      return initialValue;
    } catch (error) {
      // If error also return initialValue
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage
      if (valueToStore === null || valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(
          key,
          isJSON ? JSON.stringify(valueToStore) : valueToStore
        );
      }
    } catch (error) {
      console.error(`Error saving localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};
