import React from "react";
import ReactDOM from "react-dom/client";
import "./assets/scss/index.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from "./store";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    // <React.StrictMode>
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <App/>
            </PersistGate>
        </Provider>
    // </React.StrictMode>
);

reportWebVitals();