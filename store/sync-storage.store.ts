import localStorage from 'redux-persist/lib/storage';
const createNoopStorage = () => {
  return {
    getItem(_key) {
      return Promise.resolve(null);
    },
    setItem(_key, value) {
      return Promise.resolve(value);
    },
    removeItem(_key) {
      return Promise.resolve();
    },
  };
};
const createPrefixedStorage = (prefix: string) => {
  return {
    getItem: (key: string) => localStorage.getItem(`${key}`),
    setItem: (key: string, value: string) => localStorage.setItem(`${key}`, value),
    removeItem: (key: string) => localStorage.removeItem(`${key}`),
  };
};

const storage =
  typeof window !== 'undefined' ? createPrefixedStorage('noname') : createNoopStorage();

export default storage;
