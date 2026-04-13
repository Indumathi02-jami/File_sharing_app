import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <ToastContainer position="top-right" theme="colored" autoClose={2200} hideProgressBar={false} newestOnTop />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
