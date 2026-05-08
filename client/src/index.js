import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import ToastContainer from "./components/common/ToastContainer";
import { ThemeProvider } from "./context/ThemeContext";
import "./styles/globals.css";
import { initAuthListener } from "./stores/auth.store";

const root = ReactDOM.createRoot(document.getElementById("root"));
initAuthListener();
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <App />
        <ToastContainer />
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
