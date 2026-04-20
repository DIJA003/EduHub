// App.js — CRA root component
// This is what index.js renders. All providers live here.
// main.jsx (Vite entry) is NOT used in CRA — only index.js matters.

import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import AppRouter from "./router";
import ToastContainer from "./components/common/ToastContainer";
import { initAuthListener } from "./stores/auth.store";
initAuthListener();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
      <ToastContainer />
    </QueryClientProvider>
  );
}

export default App;
