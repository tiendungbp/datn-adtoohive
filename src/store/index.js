import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import togglerStatusSlice from "../slices/togglerStatusSlice";
import userSlice from "../slices/userSlice";
import dataSlice from "../slices/dataSlice";
import appointmentSlice from "../slices/appointmentSlice";

const rootReducer = combineReducers({
    togglerStatus: togglerStatusSlice,
    user: userSlice,
    data: dataSlice,
    appointment: appointmentSlice
});

const persistConfig = {
    key: 'user',
    storage: storage,
    stateReconciler: autoMergeLevel2,
    whitelist: ['user']
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
        serializableCheck: {
            ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
    }),
});

export let persistor = persistStore(store);