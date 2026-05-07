import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import ToastContainer from "./components/common/ToastContainer";
import "./index.css";
import { initAuthListener } from "./stores/auth.store";
import { initThemeAttributes } from "./stores/theme.store";

initThemeAttributes();
const root = ReactDOM.createRoot(document.getElementById("root"));
initAuthListener();
root.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <ToastContainer />
    </QueryClientProvider>
  </React.StrictMode>,
);
