import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { KeyValueStore } from './session';

// Phones: Keychain (iOS) / Keystore (Android) through expo-secure-store.
const nativeStore: KeyValueStore = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  removeItem: (key) => SecureStore.deleteItemAsync(key),
};

// Web has no secure storage. localStorage is readable by any script on the page,
// so this is only for development and demos.
const webStore: KeyValueStore = {
  getItem: async (key) => {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // storage unavailable (private mode): the user simply is not remembered
    }
  },
  removeItem: async (key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const secureKv: KeyValueStore = Platform.OS === 'web' ? webStore : nativeStore;