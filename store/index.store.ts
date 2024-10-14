import { createWrapper } from 'next-redux-wrapper';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { getPersistConfig } from 'redux-deep-persist';
import thunkMiddleware from 'redux-thunk';

import auth from '@/reducers/auth.reducer';
import global from '@/reducers/global.reducer';
import cardanoWallet from '@/reducers/cardano-wallet.reducer';
import storage from '@/store/sync-storage.store';


const rootReducer = combineReducers({
  global,
  auth,
  cardanoWallet
});

const bindMiddleware = (middleware: any) => {
  if (process.env.NODE_ENV !== 'production') {
    const { composeWithDevTools } = require('redux-devtools-extension');
    return composeWithDevTools(applyMiddleware(...middleware));
  }
  return applyMiddleware(...middleware);
};

const makeStore = ({ isServer }: { isServer: boolean }) => {
  console.log('🚀 ~ makeStore ~ isServer:', isServer);
  const enhancer = compose(bindMiddleware([thunkMiddleware]));

  if (isServer) {
    // Server-side: Do not persist state
    return createStore(rootReducer, enhancer);
  } else {
    const { persistStore, persistReducer } = require('redux-persist');

    const persistConfig = getPersistConfig({
      timeout: 1000,
      key: 'noname',
      keyPrefix: '',
      whitelist: ['global', 'auth', 'cardanoWallet'],
      storage, // Use the correct storage based on environment
      rootReducer,
    });

    const persistedReducer = persistReducer(persistConfig, rootReducer);

    const store = createStore(persistedReducer, enhancer); // Use enhancer here
    store.__persistor = persistStore(store); // This creates a persistor object
    console.log('🚀 ~ makeStore ~ store:', store);
    return store;
  }
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore['getState']>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppState, unknown, Action>;

export const wrapper = createWrapper<AppStore>(makeStore);

export const store = makeStore({ isServer: false });
